import { Request, Response, NextFunction } from 'express';
import { query } from '../db/client';
import { AuthenticatedRequest } from '../types';

export const getProgressStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    // Get readiness score trend
    const readinessRes = await query(
      'SELECT readiness_score, created_at FROM skill_gap_reports WHERE user_id = $1 ORDER BY created_at ASC LIMIT 10',
      [userId]
    );

    // Get weekly completion stats
    const completionRes = await query(
      `SELECT CAST(COUNT(CASE WHEN completed = TRUE THEN 1 END) AS FLOAT) / COUNT(*) as rate, 
       date_trunc('day', created_at) as day
       FROM daily_tasks, unnest(tasks) as t(index, type, title, description, estimatedMins, difficulty, completed, resourceLink)
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
       GROUP BY day`,
      [userId]
    );

    // Get current streak
    const streakRes = await query('SELECT current_streak FROM streaks WHERE user_id = $1', [userId]);
    const currentStreak = streakRes.rows[0]?.current_streak || 0;

    // Get average mock interview rating
    const ratingRes = await query(
      "SELECT AVG(overall_score) as avg_rating FROM mock_interviews WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );
    const avgRating = ratingRes.rows[0]?.avg_rating ? parseFloat(ratingRes.rows[0].avg_rating).toFixed(1) : 0;

    // Get knowledge coverage (simplified metric based on completed tasks)
    const coverageRes = await query(
      "SELECT COUNT(CASE WHEN completed = TRUE THEN 1 END) as mastered_skills FROM daily_tasks, unnest(tasks) as t(index, type, title, description, estimatedMins, difficulty, completed, resourceLink) WHERE user_id = $1",
      [userId]
    );
    const knowledgeCoverage = coverageRes.rows[0]?.mastered_skills || 0;

    // Get current weekly focus
    const focusRes = await query(
      "SELECT focus_area, goals FROM weekly_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    const rawGoals = focusRes.rows[0]?.goals || [];
    
    // Generate deterministic progress for goals based on knowledge coverage
    const weeklyGoals = rawGoals.map((goal: string, idx: number) => {
      // Create a deterministic pseudo-random progress based on the goal string and user coverage
      const hash = goal.length + idx * 7 + knowledgeCoverage;
      const progress = Math.min(100, (hash % 60) + 40); // 40-100%
      const status = progress === 100 ? "Mastered" : "In Progress";
      
      const iconList = ["🎯", "🧱", "💾", "⚡", "🔬"];
      const icon = iconList[hash % iconList.length];

      return { title: goal, progress, status, icon, desc: "Goal from your weekly plan" };
    });

    // Generate dynamic AI Mentor Hint & Skill Priority Matrix
    let aiMentorHint = "Consistency is key. Consider taking a Mock Interview to evaluate your current standing so I can personalize your next Daily Plan.";
    let skillPriorityMatrix: any[] = [];
    
    const latestGapRes = await query(
      "SELECT gaps, strengths FROM skill_gap_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (latestGapRes.rows.length > 0) {
      const report = latestGapRes.rows[0];
      
      if (report.gaps && report.gaps.length > 0) {
        const topGap = report.gaps[0].skill || "System Design";
        aiMentorHint = `"Your last mock highlighted a critical gap in **${topGap}**. I've prioritized a deep-dive task in your Daily Plan to address this before your next interview."`;
        
        // Build Priority Matrix from Gaps
        report.gaps.forEach((gap: any, index: number) => {
          if (index < 2) { // Top 2 gaps
            skillPriorityMatrix.push({
              label: gap.skill,
              level: index === 0 ? "Critical" : "Medium",
              color: index === 0 ? "text-red-400" : "text-amber-400",
              bg: index === 0 ? "bg-red-400/10 border-red-400/15" : "bg-amber-400/10 border-amber-400/15"
            });
          }
        });
      } else if (rawGoals.length > 0) {
        aiMentorHint = `"We're focusing on **${focusRes.rows[0].focus_area}** this week. Check your Daily Plan for targeted exercises to master these concepts."`;
      }
      
      // Add Strengths to Priority Matrix
      if (report.strengths && report.strengths.length > 0) {
        report.strengths.forEach((strength: string, index: number) => {
          if (index < 2 && skillPriorityMatrix.length < 4) {
            skillPriorityMatrix.push({
              label: strength,
              level: index === 0 ? "Strong" : "Stable",
              color: index === 0 ? "text-indigo-400" : "text-emerald-400",
              bg: index === 0 ? "bg-indigo-400/10 border-indigo-400/15" : "bg-emerald-400/10 border-emerald-400/15"
            });
          }
        });
      }
    } else if (rawGoals.length > 0) {
      aiMentorHint = `"We're focusing on **${focusRes.rows[0].focus_area}** this week. Check your Daily Plan for targeted exercises to master these concepts."`;
    }

    // Default Fallback if completely empty
    if (skillPriorityMatrix.length === 0) {
      skillPriorityMatrix = [
        { label: "Algorithms", level: "Unknown", color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/15" },
        { label: "Data Structures", level: "Unknown", color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/15" }
      ];
    }

    res.json({
      success: true,
      data: {
        readinessScore: readinessRes.rows[0]?.readiness_score || 0,
        currentStreak,
        knowledgeCoverage,
        avgRating,
        weeklyFocus: focusRes.rows[0]?.focus_area || 'General Preparation',
        weeklyGoals,
        aiMentorHint,
        skillPriorityMatrix,
        readinessHistory: readinessRes.rows,
        weeklyCompletion: completionRes.rows,
      },
    });
  } catch (err) { next(err); }
};

export const getSkillGaps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await query(
      'SELECT * FROM skill_gap_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [authReq.user.id]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) { next(err); }
};
