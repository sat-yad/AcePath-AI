import { BaseAgent } from './base.agent';
import { AgentInput, AgentOutput } from '../types';
import { query } from '../db/client';

export class AccountabilityAgent extends BaseAgent {
  constructor() {
    super('accountability');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const { userId, context } = input;
    const { streakData, completionHistory, upcomingInterviews, userProfile } = context as {
      streakData: { current_streak: number; longest_streak: number; last_active_date: string };
      completionHistory: Array<{ date: string; completionRate: number; score?: number }>;
      upcomingInterviews: number;
      userProfile: { full_name: string; daily_hours: number; intensity_level: string };
    };

    const systemPrompt = `You are a motivational accountability coach. Analyze prep consistency and return ONLY JSON:
{
  "streakDays": number,
  "longestStreak": number,
  "adjustedWorkload": "increase" | "maintain" | "decrease",
  "adjustmentReason": string,
  "motivationalMessage": string,
  "riskLevel": "low" | "medium" | "high",
  "recommendations": string[],
  "weeklyInsight": string,
  "nextMilestone": string
}`;

    const recent = completionHistory.slice(-7);
    const avgCompletion = recent.reduce((a, b) => a + b.completionRate, 0) / (recent.length || 1);

    const userMessage = `Accountability check for ${userProfile.full_name}:
Current streak: ${streakData.current_streak} days
Longest streak: ${streakData.longest_streak} days
Last active: ${streakData.last_active_date}
7-day avg completion: ${Math.round(avgCompletion * 100)}%
Upcoming mock interviews: ${upcomingInterviews}
Daily hours target: ${userProfile.daily_hours}
Intensity: ${userProfile.intensity_level}
Recent history: ${JSON.stringify(recent)}

Generate accountability report and workload adjustment.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.7);
      const data = this.parseJSON(content);

      // Update streak table
      const today = new Date().toISOString().split('T')[0];
      const lastActive = streakData.last_active_date;
      const dayDiff = lastActive
        ? Math.floor((new Date(today).getTime() - new Date(lastActive).getTime()) / 86400000)
        : 999;

      const newStreak = dayDiff <= 1 ? (streakData.current_streak + 1) : 1;
      const longestStreak = Math.max(newStreak, streakData.longest_streak);

      await query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_active_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE
         SET current_streak = $2, longest_streak = $3, last_active_date = $4, updated_at = NOW()`,
        [userId, newStreak, longestStreak, today]
      );

      // Award achievements
      if (newStreak === 7) await this.grantAchievement(userId, '7_day_streak', '7-Day Streak!', '🔥');
      if (newStreak === 30) await this.grantAchievement(userId, '30_day_streak', '30-Day Streak!', '💎');
      if (newStreak === 100) await this.grantAchievement(userId, '100_day_streak', '100-Day Warrior!', '🏆');

      // Send notification
      await query(
        `INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)`,
        [userId, 'accountability', `Day ${newStreak} streak! 🔥`, data.motivationalMessage]
      );

      return { success: true, data: { ...data, currentStreak: newStreak, longestStreak }, tokensUsed };
    } catch (err) {
      return { success: false, data: {}, error: String(err) };
    }
  }

  private async grantAchievement(userId: string, type: string, title: string, icon: string): Promise<void> {
    await query(
      `INSERT INTO achievements (user_id, type, title, icon) VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [userId, type, title, icon]
    ).catch(() => { /* ignore duplicate */ });
  }
}
