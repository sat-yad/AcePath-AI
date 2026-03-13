import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client';
import { createError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

const signToken = (userId: string, email: string, tier: string) =>
  jwt.sign({ userId, email, tier }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  });

const signRefreshToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return next(createError('email, password, and full_name are required', 400));
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return next(createError('Email already in use', 409));
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, tier',
      [email, password_hash, full_name]
    );
    const user = result.rows[0];

    const accessToken = signToken(user.id, user.email, user.tier);
    const refreshToken = signRefreshToken(user.id);

    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createError('Email and password are required', 400));
    }

    const result = await query(
      `SELECT u.*, (SELECT COUNT(*) FROM mock_interviews WHERE user_id = u.id) as interviews_taken 
       FROM users u WHERE email = $1`, 
      [email]
    );
    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return next(createError('Invalid credentials', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return next(createError('Invalid credentials', 401));

    await query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [user.id]);

    const { password_hash, interviews_taken, ...safeUser } = user;
    const accessToken = signToken(user.id, user.email, user.tier);
    const refreshToken = signRefreshToken(user.id);

    res.json({ success: true, data: { user: { ...safeUser, interviews_taken: Number(interviews_taken) }, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError('Refresh token required', 400));

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const result = await query('SELECT id, email, tier FROM users WHERE id = $1', [payload.userId]);
    if (result.rows.length === 0) return next(createError('User not found', 401));

    const user = result.rows[0];
    const accessToken = signToken(user.id, user.email, user.tier);
    res.json({ success: true, data: { accessToken } });
  } catch (err) { next(createError('Invalid refresh token', 401)); }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as any;
  if (!user) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=GoogleAuthFailed`);
    return;
  }
  const accessToken = signToken(user.id, user.email, user.tier);
  const refreshToken = signRefreshToken(user.id);
  res.redirect(
    `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`
  );
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.json({ success: true, data: { user: null } });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const result = await query(
      `SELECT u.*, (SELECT COUNT(*) FROM mock_interviews WHERE user_id = u.id) as interviews_taken 
       FROM users u WHERE id = $1`, 
      [payload.userId]
    );
    if (result.rows.length === 0) {
      res.json({ success: true, data: { user: null } });
      return;
    }

    const { password_hash, interviews_taken, ...safeUser } = result.rows[0];
    res.json({ success: true, data: { user: { ...safeUser, interviews_taken: Number(interviews_taken) } } });
  } catch (err) {
    // If token verification fails (expired or invalid), quietly return null
    res.json({ success: true, data: { user: null } });
  }
};
