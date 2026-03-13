import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/client';
import { JWTPayload, AppUser } from '../types';

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const result = await query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    if (result.rows.length === 0) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    req.user = result.rows[0] as AppUser;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requirePremium = (req: Request, res: Response, next: NextFunction): void => {
  if ((req as any).user?.tier !== 'premium') {
    res.status(403).json({
      success: false,
      message: 'This feature requires a Premium subscription',
      upgradeUrl: '/api/subscription/upgrade',
    });
    return;
  }
  next();
};
