import { BaseAgent } from './base.agent';
import { AgentInput, AgentOutput } from '../types';
import { query } from '../db/client';

export class DailyPlannerAgent extends BaseAgent {
  constructor() {
    super('daily_planner');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const { userId, context } = input;
    const { weeklyPlan, recentPerformance, dailyHours, date } = context as {
      weeklyPlan: { goals: string[]; topics: string[]; focus_area: string };
      recentPerformance: { completionRate: number; weakAreas: string[]; lastInterviewScore?: number };
      dailyHours: number;
      date: string;
    };

    const memories = await this.retrieveMemory(userId, `daily tasks performance ${date}`);

    const systemPrompt = `You are an adaptive learning coach. Generate today's personalized study tasks.
Return ONLY a JSON object:
{
  "tasks": [
    {
      "index": number,
      "type": "dsa" | "system_design" | "behavioral" | "revision" | "resume" | "hr",
      "title": string,
      "description": string,
      "estimatedMins": number,
      "difficulty": "easy" | "medium" | "hard",
      "completed": false,
      "resourceLink": string | null
    }
  ],
  "dailyGoal": string,
  "motivationalNote": string
}`;

    const adaptNote = recentPerformance.completionRate < 0.6
      ? 'User has been struggling — reduce difficulty, add more revision tasks.'
      : recentPerformance.completionRate > 0.9
      ? 'User is excelling — increase challenge, add harder problems.'
      : 'User is on track — maintain current difficulty.';

    const userMessage = `Generate tasks for ${date}. Available time: ${dailyHours} hours.
Weekly focus: ${weeklyPlan?.focus_area || 'General preparation'}
Topics this week: ${weeklyPlan?.topics?.join(', ') || 'Mixed'}
Goals: ${weeklyPlan?.goals?.join(', ') || 'Interview preparation'}
Recent completion rate: ${Math.round((recentPerformance.completionRate || 0) * 100)}%
Weak areas: ${recentPerformance.weakAreas?.join(', ') || 'None identified'}
Last interview score: ${recentPerformance.lastInterviewScore || 'N/A'}
Adaptive note: ${adaptNote}
Past context: ${memories.slice(0, 2).join(' | ')}

Generate 4-6 tasks fitting within the available time.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.7);
      const data = this.parseJSON(content);
      const tasks = (data.tasks as unknown[]) || [];
      const result = await query(
        `INSERT INTO daily_tasks (user_id, date, tasks, total_tasks, generated_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, date) DO UPDATE
         SET tasks = EXCLUDED.tasks, total_tasks = EXCLUDED.total_tasks, generated_by = EXCLUDED.generated_by
         RETURNING id`,
        [userId, date, JSON.stringify(tasks), tasks.length, 'daily_planner_agent']
      );
      await this.storeMemory(userId, `Daily plan ${date}: ${tasks.length} tasks, focus=${weeklyPlan?.focus_area}`);
      return { success: true, data: { ...data, taskId: result.rows[0].id }, tokensUsed };
    } catch (err: any) {
      console.warn(`[DailyPlannerAgent] Falling back to mock data due to error: ${err.message}`);
      return this.generateMockPlan(userId, date, weeklyPlan?.focus_area || 'General preparation');
    }
  }

  private async generateMockPlan(userId: string, date: string, focusArea: string): Promise<AgentOutput> {
    const mockTasks = [
      {
        index: 0,
        type: "dsa",
        title: "Two Sum (Mock Data)",
        description: "Practice your array hash map skills with this classic problem.",
        estimatedMins: 30,
        difficulty: "easy",
        completed: false,
        resourceLink: "https://leetcode.com/problems/two-sum/"
      },
      {
        index: 1,
        type: "system_design",
        title: "Design a URL Shortener (Mock Data)",
        description: `Focus on ${focusArea}. Think about scale and database partitioning.`,
        estimatedMins: 45,
        difficulty: "medium",
        completed: false,
        resourceLink: null
      },
      {
        index: 2,
        type: "behavioral",
        title: "Tell me about a time you failed (Mock Data)",
        description: "Use the STAR method to structure your response.",
        estimatedMins: 15,
        difficulty: "easy",
        completed: false,
        resourceLink: null
      }
    ];

    const data = {
      tasks: mockTasks,
      dailyGoal: `Mock Focus: ${focusArea}`,
      motivationalNote: "You are in Mock AI mode because your OpenAI quota was exceeded or the key is invalid. These are sample tasks."
    };

    const result = await query(
      `INSERT INTO daily_tasks (user_id, date, tasks, total_tasks, generated_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, date) DO UPDATE
       SET tasks = EXCLUDED.tasks, total_tasks = EXCLUDED.total_tasks, generated_by = EXCLUDED.generated_by
       RETURNING id`,
      [userId, date, JSON.stringify(mockTasks), mockTasks.length, 'daily_planner_agent_mock']
    );

    return { success: true, data: { ...data, taskId: result.rows[0].id }, tokensUsed: 0 };
  }
}
