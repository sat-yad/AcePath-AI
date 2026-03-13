import { Router } from 'express';
import * as interviewController from '../controllers/interview.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.post('/start', interviewController.startInterview);
router.post('/:id/answer', interviewController.submitAnswer);
router.get('/history', interviewController.getInterviewHistory);
router.get('/:id', interviewController.getInterviewById);

export default router;
