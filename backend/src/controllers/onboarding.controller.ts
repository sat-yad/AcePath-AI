import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { CareerAnalystAgent } from '../agents/career-analyst.agent';
import { RoadmapPlannerAgent } from '../agents/roadmap-planner.agent';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/error.middleware';

const careerAgent = new CareerAnalystAgent();
const roadmapAgent = new RoadmapPlannerAgent();

export const submitOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const {
      experience_years,
      current_company,
      target_companies,
      tech_stack,
      weak_areas,
      daily_hours,
    } = req.body;

    // Upsert skill profile
    await query(
      `INSERT INTO skill_profiles (user_id, experience_years, current_company, target_companies, tech_stack, weak_areas, daily_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         experience_years=$2, current_company=$3, target_companies=$4,
         tech_stack=$5, weak_areas=$6, daily_hours=$7, updated_at=NOW()`,
      [userId, experience_years, current_company, JSON.stringify(target_companies),
       JSON.stringify(tech_stack), JSON.stringify(weak_areas), daily_hours]
    );

    // Run Career Analyst Agent
    const analysis = await careerAgent.run({
      userId,
      context: {
        profile: { experience_years, current_company, target_companies, tech_stack, weak_areas, daily_hours },
      },
    });

    if (!analysis.success) {
      throw createError(`Career analysis failed: ${analysis.error}`, 500);
    }

    // Run Roadmap Planner Agent
    const roadmap = await roadmapAgent.run({
      userId,
      context: {
        profile: { target_companies, tech_stack, weak_areas },
        analysis: analysis.data,
      },
    });

    if (!roadmap.success) {
      throw createError(`Roadmap generation failed: ${roadmap.error}`, 500);
    }

    // Mark user as onboarded
    await query('UPDATE users SET is_onboarded = TRUE WHERE id = $1', [userId]);

    // Initialize streak record
    await query(
      `INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        analysis: analysis.data,
        roadmap: roadmap.data,
        message: 'Onboarding complete! Your personalized roadmap is ready.',
      },
    });
  } catch (err) { next(err); }
};

export const getSkillProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await query('SELECT * FROM skill_profiles WHERE user_id = $1', [authReq.user.id]);
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) { next(err); }
};
