import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { AuthenticatedRequest } from '../types';

export const getRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const result = await query(
      `SELECT * FROM roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.json({ success: true, data: null, message: 'No active roadmap found. Complete onboarding to generate one.' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const getRoadmapById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM roadmaps WHERE id = $1 AND user_id = $2',
      [id, authReq.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Roadmap not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const getAllRoadmaps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    const result = await query(
      'SELECT * FROM roadmaps WHERE user_id = $1 ORDER BY created_at DESC',
      [authReq.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};
