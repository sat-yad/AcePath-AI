import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { DailyPlannerAgent } from '../agents/daily-planner.agent';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/error.middleware';

const dailyPlannerAgent = new DailyPlannerAgent();

export const getTodayTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Check if tasks exist for today
    const existing = await query('SELECT * FROM daily_tasks WHERE user_id = $1 AND date = $2', [userId, today]);
    if (existing.rows.length > 0) {
      res.json({ success: true, data: existing.rows[0], generated: false });
      return;
    }

    // Get skill profile
    const profileRes = await query('SELECT * FROM skill_profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0];

    // Get current week plan
    const roadmapRes = await query(
      'SELECT id FROM roadmaps WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'active']
    );
    let weeklyPlan = { goals: [], topics: [], focus_area: 'General Preparation' };
    if (roadmapRes.rows.length > 0) {
      const roadmapId = roadmapRes.rows[0].id;
      const startDateRes = await query('SELECT start_date FROM roadmaps WHERE id = $1', [roadmapId]);
      const startDate = new Date(startDateRes.rows[0].start_date);
      const currentWeek = Math.ceil((new Date().getTime() - startDate.getTime()) / (7 * 86400000));
      const wpRes = await query(
        'SELECT * FROM weekly_plans WHERE roadmap_id = $1 AND week_number = $2 LIMIT 1',
        [roadmapId, currentWeek]
      );
      if (wpRes.rows.length > 0) weeklyPlan = wpRes.rows[0];
    }

    // Get recent performance
    const logsRes = await query(
      `SELECT date, COUNT(*) as total, COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as completed
       FROM task_completion_logs tcl
       JOIN daily_tasks dt ON tcl.daily_task_id = dt.id
       WHERE tcl.user_id = $1 AND tcl.completed_at > NOW() - INTERVAL '7 days'
       GROUP BY date`,
      [userId]
    );
    const completionRate = logsRes.rows.length > 0
      ? logsRes.rows.reduce((a: number, b: { total: string; completed: string }) =>
          a + parseInt(b.completed) / Math.max(parseInt(b.total), 1), 0) / logsRes.rows.length
      : 0.5;

    const interviewRes = await query(
      'SELECT overall_score FROM mock_interviews WHERE user_id = $1 AND status = $2 ORDER BY completed_at DESC LIMIT 1',
      [userId, 'completed']
    );

    const result = await dailyPlannerAgent.run({
      userId,
      context: {
        weeklyPlan,
        recentPerformance: {
          completionRate,
          weakAreas: profile?.weak_areas || [],
          lastInterviewScore: interviewRes.rows[0]?.overall_score,
        },
        dailyHours: profile?.daily_hours || 2,
        date: today,
      },
    });

    res.json({ success: true, data: result.data, generated: true });
  } catch (err) { next(err); }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { id } = req.params;
    const { taskIndex, timeSpentMins, score, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const taskRes = await query('SELECT * FROM daily_tasks WHERE user_id = $1 AND date = $2', [userId, today]);
    if (taskRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No tasks for today' });
      return;
    }
    const dailyTask = taskRes.rows[0];
    const tasks = dailyTask.tasks;
    if (tasks[taskIndex]) tasks[taskIndex].completed = true;

    await query('UPDATE daily_tasks SET tasks = $1 WHERE id = $2', [JSON.stringify(tasks), dailyTask.id]);

    await query(
      `INSERT INTO task_completion_logs (user_id, daily_task_id, task_index, task_type, time_spent_mins, score, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, dailyTask.id, taskIndex, tasks[taskIndex]?.type, timeSpentMins, score, notes]
    );

    res.json({ success: true, message: 'Task marked complete' });
  } catch (err) { next(err); }
};
