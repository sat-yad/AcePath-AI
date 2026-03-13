import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/progress', analyticsController.getProgressStats);
router.get('/skill-gaps', analyticsController.getSkillGaps);

export default router;
