import { Router } from 'express';
import * as roadmapController from '../controllers/roadmap.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', roadmapController.getRoadmap);
router.get('/all', roadmapController.getAllRoadmaps);
router.get('/:id', roadmapController.getRoadmapById);

export default router;
