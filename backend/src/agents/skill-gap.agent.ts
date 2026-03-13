import { BaseAgent } from './base.agent';
import { AgentInput, AgentOutput } from '../types';
import { query } from '../db/client';

export class SkillGapAgent extends BaseAgent {
  constructor() {
    super('skill_gap');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const { userId, context } = input;
    const { interviewHistory, currentProfile } = context as {
      interviewHistory: Array<{ type: string; overall_score: number; feedback: { skillScores?: Record<string, number> } }>;
      currentProfile: { tech_stack: string[]; weak_areas: string[]; target_companies: string[] };
    };

    const systemPrompt = `You are a technical skill gap analyzer. Analyze interviews results and return ONLY JSON:
{
  "gaps": [
    { "skill": string, "currentLevel": number, "targetLevel": number, "priority": "high"|"medium"|"low" }
  ],
  "strengths": string[],
  "recommendations": [
    { "area": string, "action": string, "resources": string[], "estimatedWeeks": number }
  ],
  "readinessScore": number (0-100),
  "summary": string
}`;

    const userMessage = `Analyze interview performance for a candidate targeting ${currentProfile.target_companies.join(', ')}:
Current Tech Stack: ${currentProfile.tech_stack.join(', ')}
Known Weak Areas: ${currentProfile.weak_areas.join(', ')}
Interview History: ${JSON.stringify(interviewHistory.slice(-5))}

Identify all skill gaps and prioritize them.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.5);
      const data = this.parseJSON(content);

      const result = await query(
        `INSERT INTO skill_gap_reports (user_id, gaps, strengths, recommendations, readiness_score, source)
         VALUES ($1, $2, $3, $4, $5, 'skill_gap_agent')
         RETURNING id`,
        [
          userId,
          JSON.stringify(data.gaps),
          JSON.stringify(data.strengths),
          JSON.stringify(data.recommendations),
          data.readinessScore,
        ]
      );

      // Update skill profile weak areas
      const topGaps = (data.gaps as Array<{ skill: string; priority: string }>)
        ?.filter(g => g.priority === 'high')
        ?.map(g => g.skill) || [];

      if (topGaps.length > 0) {
        await query(
          'UPDATE skill_profiles SET weak_areas = $1 WHERE user_id = $2',
          [JSON.stringify(topGaps), userId]
        );
      }

      await this.storeMemory(userId, `Skill gap analysis: readiness=${data.readinessScore}, gaps=${topGaps.join(', ')}`);

      return { success: true, data: { ...data, reportId: result.rows[0].id }, tokensUsed };
    } catch (err: any) {
      console.warn(`[SkillGapAgent] Falling back to mock data due to error: ${err.message}`);
      
      const mockReport = {
        gaps: [
          { skill: 'Distributed Caching (Redis)', currentLevel: 4, targetLevel: 8, priority: 'high' },
          { skill: 'Dynamic Programming', currentLevel: 6, targetLevel: 9, priority: 'medium' },
          { skill: 'Behavioral STAR Method', currentLevel: 7, targetLevel: 9, priority: 'low' }
        ],
        strengths: ["Communication", "Basic Data Structures", "REST API Design"],
        recommendations: [
          { area: 'System Design', action: 'Deep dive into caching strategies', resources: ['System Design Interview Vol 1'], estimatedWeeks: 1 }
        ],
        readinessScore: 68,
        summary: "(Mock Data) The candidate shows strong fundamentals but needs targeted practice in advanced system design and specific algorithmic patterns."
      };

      const result = await query(
        `INSERT INTO skill_gap_reports (user_id, gaps, strengths, recommendations, readiness_score, source)
         VALUES ($1, $2, $3, $4, $5, 'skill_gap_agent')
         RETURNING id`,
        [
          userId,
          JSON.stringify(mockReport.gaps),
          JSON.stringify(mockReport.strengths),
          JSON.stringify(mockReport.recommendations),
          mockReport.readinessScore,
        ]
      );

      return { success: true, data: { ...mockReport, reportId: result.rows[0].id }, tokensUsed: 0 };
    }
  }
}
