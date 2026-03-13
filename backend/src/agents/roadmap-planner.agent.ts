import { BaseAgent } from './base.agent';
import { AgentInput, AgentOutput } from '../types';
import { query } from '../db/client';

export class RoadmapPlannerAgent extends BaseAgent {
  constructor() {
    super('roadmap_planner');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const { userId, context } = input;
    const { profile, analysis } = context as {
      profile: { tech_stack: string[]; weak_areas: string[]; target_companies: string[] };
      analysis: { durationMonths: number; intensityLevel: string; keyFocusAreas: string[] };
    };

    const systemPrompt = `You are a senior technical interview preparation expert. 
Create a detailed interview preparation roadmap and return ONLY a JSON object with this exact structure:
{
  "title": string,
  "durationMonths": number,
  "milestones": [
    {
      "week": number,
      "title": string,
      "focusArea": string,
      "skills": string[],
      "topics": string[],
      "goals": string[],
      "mockInterviewScheduled": boolean,
      "estimatedHours": number
    }
  ],
  "overallStrategy": string
}`;

    const userMessage = `Create a ${analysis.durationMonths}-month roadmap (${analysis.intensityLevel} intensity) for:
- Target Companies: ${profile.target_companies.join(', ')}
- Tech Stack: ${profile.tech_stack.join(', ')}
- Weak Areas: ${profile.weak_areas.join(', ')}
- Key Focus Areas: ${analysis.keyFocusAreas.join(', ')}

Return weekly milestones for all ${analysis.durationMonths * 4} weeks. Schedule mock interviews every 3 weeks.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.6);
      const data = this.parseJSON(content);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (data.durationMonths as number || 3));

      const roadmapResult = await query(
        `INSERT INTO roadmaps (user_id, title, duration_months, milestones, start_date, target_end_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          data.title || 'Interview Preparation Roadmap',
          data.durationMonths,
          JSON.stringify(data.milestones),
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        ]
      );
      const roadmapId = roadmapResult.rows[0].id;

      // Insert weekly plans
      const milestones = (data.milestones as Array<{
        week: number; goals: string[]; topics: string[]; focusArea: string
      }>) || [];
      for (const milestone of milestones) {
        await query(
          `INSERT INTO weekly_plans (roadmap_id, user_id, week_number, goals, topics, focus_area)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            roadmapId,
            userId,
            milestone.week,
            JSON.stringify(milestone.goals || []),
            JSON.stringify(milestone.topics || []),
            milestone.focusArea,
          ]
        );
      }

      await this.storeMemory(userId, `Roadmap created: ${data.title}, ${data.durationMonths} months`);

      return { success: true, data: { ...data, roadmapId }, tokensUsed };
    } catch (err: any) {
      console.warn(`[RoadmapPlannerAgent] Falling back to mock data due to error: ${err.message}`);
      
      const mockRoadmap = {
        title: "Standard Full-Stack Interview Prep",
        durationMonths: 3,
        overallStrategy: "A balanced approach focusing on algorithms initially, followed by system design and behavioral prep.",
        milestones: [
          {
            week: 1,
            title: "Arrays & Strings",
            focusArea: "Mastering fundamental data structures",
            skills: ["Two Pointers", "Sliding Window"],
            topics: ["Arrays", "Strings"],
            goals: ["Complete 20 Easy/Medium LeetCode problems"],
            mockInterviewScheduled: false,
            estimatedHours: 10
          },
          {
            week: 2,
            title: "Hash Maps & Linked Lists",
            focusArea: "Data mapping and sequential data",
            skills: ["Hashing", "Pointers"],
            topics: ["Hash Tables", "Linked Lists"],
            goals: ["Understand collision resolution", "Implement LRU Cache concept"],
            mockInterviewScheduled: true,
            estimatedHours: 12
          },
          {
            week: 3,
            title: "Trees & Graphs",
            focusArea: "Non-linear data structures",
            skills: ["DFS", "BFS"],
            topics: ["Binary Trees", "Graphs"],
            goals: ["Master tree traversals", "Solve matrix problems"],
            mockInterviewScheduled: false,
            estimatedHours: 15
          },
          {
            week: 4,
            title: "System Design Basics",
            focusArea: "High-level architecture",
            skills: ["Load Balancing", "Caching"],
            topics: ["System Design"],
            goals: ["Design a URL shortener", "Understand CAP theorem"],
            mockInterviewScheduled: true,
            estimatedHours: 12
          }
        ]
      };

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const roadmapResult = await query(
        `INSERT INTO roadmaps (user_id, title, duration_months, milestones, start_date, target_end_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          mockRoadmap.title,
          mockRoadmap.durationMonths,
          JSON.stringify(mockRoadmap.milestones),
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        ]
      );
      const roadmapId = roadmapResult.rows[0].id;

      for (const milestone of mockRoadmap.milestones) {
        await query(
          `INSERT INTO weekly_plans (roadmap_id, user_id, week_number, goals, topics, focus_area)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            roadmapId,
            userId,
            milestone.week,
            JSON.stringify(milestone.goals),
            JSON.stringify(milestone.topics),
            milestone.focusArea,
          ]
        );
      }

      return { success: true, data: { ...mockRoadmap, roadmapId }, tokensUsed: 0 };
    }
  }
}
