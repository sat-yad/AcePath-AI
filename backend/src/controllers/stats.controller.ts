import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { createError } from '../middleware/error.middleware';

export const getPublicStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Initialize DB stat tracking if it's not setup yet
    await query(`
      CREATE TABLE IF NOT EXISTS site_stats (
        id SERIAL,
        key TEXT UNIQUE,
        value INT DEFAULT 0
      )
    `);
    await query(`
      INSERT INTO site_stats (key, value) 
      VALUES ('total_visits', 0) 
      ON CONFLICT DO NOTHING
    `);

    // 2. Safely increment the visit counter and fetch it
    const visitResult = await query(`
      UPDATE site_stats 
      SET value = value + 1 
      WHERE key = 'total_visits' 
      RETURNING value
    `);
    
    // 3. Fetch real user and practice totals from existing platform data
    const userResult = await query('SELECT COUNT(*) FROM users');
    const mockResult = await query('SELECT COUNT(*) FROM mock_interviews');

    // 4. Combine real data with our scale baselines (e.g., +10k base users)
    const baseEngineers = 10;
    const baseQuestions = 500;
    
    // We assume 10 questions per mock interview for the aggregate metric
    const realUsers = parseInt(userResult.rows[0].count || '0', 10);
    const realMocks = parseInt(mockResult.rows[0].count || '0', 10);
    const calculatedPractice = realMocks * 10;

    res.json({
      success: true,
      data: {
        engineersCoached: baseEngineers + realUsers,
        questionsPracticed: baseQuestions + calculatedPractice,
        successRate: 95,      // Fixed static rating
        averageRating: 4.9,   // Fixed static rating
        totalVisits: visitResult.rows[0]?.value || 1
      }
    });

  } catch (err) {
    next(createError('Failed to fetch public stats', 500));
  }
};
