import { Router } from 'express';
import * as streakController from '../controllers/streak.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.post('/check', streakController.checkAccountability);
router.get('/achievements', streakController.getAchievements);
router.get('/leaderboard', streakController.getLeaderboard);

export default router;
