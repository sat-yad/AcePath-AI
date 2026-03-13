import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';

const router = Router();

// Public route for landing page metrics
router.get('/', statsController.getPublicStats);

export default router;
