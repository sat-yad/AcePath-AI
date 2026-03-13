import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { ResumeCoachAgent } from '../agents/resume-coach.agent';
import { createError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

const resumeAgent = new ResumeCoachAgent();

export const analyzeResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { resumeText, targetRole, targetCompanies } = req.body;

    if (!resumeText) {
      return next(createError('Resume text is required', 400));
    }

    const result = await resumeAgent.run({
      userId,
      context: {
        resumeText,
        targetRole,
        targetCompanies,
      },
    });

    if (!result.success) {
      return next(createError(result.error || 'Failed to analyze resume', 500));
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const getResumeVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const result = await query(
      'SELECT id, version_number, ats_score, created_at FROM resume_versions WHERE user_id = $1 ORDER BY version_number DESC',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getResumeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authReq.user.id;

    const result = await query(
      'SELECT * FROM resume_versions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return next(createError('Resume version not found', 404));
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
