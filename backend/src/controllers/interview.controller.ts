import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { MockInterviewAgent } from '../agents/mock-interview.agent';
import { SkillGapAgent } from '../agents/skill-gap.agent';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/error.middleware';

const interviewAgent = new MockInterviewAgent();
const skillGapAgent = new SkillGapAgent();

export const startInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { type = 'mixed' } = req.body;

    // Check free tier limit (3 per month)
    if (authReq.user.tier === 'free') {
      const countRes = await query(
        `SELECT COUNT(*) FROM mock_interviews WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
        [userId]
      );
      if (parseInt(countRes.rows[0].count) >= 3) {
        res.status(403).json({
          success: false,
          message: 'Free tier allows 3 mock interviews per month. Upgrade to Premium for unlimited.',
          upgradeUrl: '/api/subscription/upgrade',
        });
        return;
      }
    }

    const profileRes = await query('SELECT * FROM skill_profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0];

    const result = await interviewAgent.run({
      userId,
      context: {
        action: 'start',
        interviewType: type,
        skillProfile: {
          tech_stack: profile?.tech_stack || [],
          weak_areas: profile?.weak_areas || [],
          experience_years: profile?.experience_years || 0,
        },
      },
    });

    if (!result.success) {
      throw createError(`Failed to start interview: ${result.error}`, 500);
    }

    res.json({ success: true, data: result.data });
  } catch (err) { next(err); }
};

export const submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { id } = req.params;
    const { question, answer, questionIndex, isLast } = req.body;

    const evaluation = await interviewAgent.run({
      userId,
      context: { action: 'evaluate', interviewId: id, question, answer, questionIndex },
    });

    if (!evaluation.success) {
      throw createError(`Failed to evaluate answer: ${evaluation.error}`, 500);
    }

    let finalResult = null;
    if (isLast) {
      const finish = await interviewAgent.run({ userId, context: { action: 'finish', interviewId: id } });
      
      if (!finish.success) {
        throw createError(`Failed to finalize interview: ${finish.error}`, 500);
      }
      
      finalResult = finish.data;

      // Run skill gap analysis after interview
      const interviewHistory = await query(
        'SELECT type, overall_score, feedback FROM mock_interviews WHERE user_id = $1 AND status = $2 ORDER BY completed_at DESC LIMIT 5',
        [userId, 'completed']
      );
      const profileRes = await query('SELECT * FROM skill_profiles WHERE user_id = $1', [userId]);
      await skillGapAgent.run({
        userId,
        context: {
          interviewHistory: interviewHistory.rows,
          currentProfile: profileRes.rows[0],
        },
      });
    }

    res.json({ success: true, data: { evaluation: evaluation.data, finalResult } });
  } catch (err) { next(err); }
};

export const getInterviewHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await query(
      'SELECT id, type, overall_score, status, created_at, completed_at FROM mock_interviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [authReq.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

export const getInterviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await query(
      'SELECT * FROM mock_interviews WHERE id = $1 AND user_id = $2',
      [req.params.id, authReq.user.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};
