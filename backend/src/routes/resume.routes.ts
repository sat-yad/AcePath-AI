import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller';
import { authenticateJWT, requirePremium } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.post('/analyze', requirePremium, resumeController.analyzeResume);
router.get('/versions', resumeController.getResumeVersions);
router.get('/:id', resumeController.getResumeById);

export default router;
