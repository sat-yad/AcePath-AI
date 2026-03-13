import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.post('/', onboardingController.submitOnboarding);
router.get('/profile', onboardingController.getSkillProfile);

export default router;
