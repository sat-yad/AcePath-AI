import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { AccountabilityAgent } from '../agents/accountability.agent';
import { AuthenticatedRequest } from '../types';

const accountabilityAgent = new AccountabilityAgent();

export const checkAccountability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    // Get streak data
    const streakRes = await query('SELECT * FROM streaks WHERE user_id = $1', [userId]);
    const streak = streakRes.rows[0];

    // Run Accountability Agent
    const result = await accountabilityAgent.run({
      userId,
      context: { 
        streakData: streak,
        completionHistory: [], // These should be populated with actual data in a real scenario
        upcomingInterviews: 0,
        userProfile: {
          full_name: authReq.user.full_name,
          daily_hours: 2, // Default or fetch from profile
          intensity_level: 'moderate'
        }
      },
    });

    res.json({ success: true, data: result.data });
  } catch (err) { next(err); }
};

export const getAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await query(
      `SELECT * FROM achievements WHERE user_id = $1 ORDER BY earned_at DESC`,
      [authReq.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT u.full_name, u.avatar_url, s.current_streak, s.longest_streak
       FROM streaks s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.current_streak DESC LIMIT 20`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};
