import { Router } from 'express';
import authRoutes from './auth.routes';
import onboardingRoutes from './onboarding.routes';
import tasksRoutes from './tasks.routes';
import interviewRoutes from './interview.routes';
import resumeRoutes from './resume.routes';
import analyticsRoutes from './analytics.routes';
import streakRoutes from './streak.routes';
import roadmapRoutes from './roadmap.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/tasks', tasksRoutes);
router.use('/interview', interviewRoutes);
router.use('/resume', resumeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/streak', streakRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/stats', statsRoutes);

export default router;

