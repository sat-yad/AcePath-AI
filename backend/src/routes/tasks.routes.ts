import { Router } from 'express';
import * as tasksController from '../controllers/tasks.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/today', tasksController.getTodayTasks);
router.patch('/:id/complete', tasksController.completeTask);

export default router;
