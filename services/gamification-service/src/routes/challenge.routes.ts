import { Router } from 'express';
import { ChallengeController } from '../controllers';

const router = Router();
const challengeController = new ChallengeController();

// Get active challenges
router.get('/', challengeController.getActiveChallenges);

// Get daily challenges
router.get('/daily', challengeController.getDailyChallenges);

// Get weekly challenges
router.get('/weekly', challengeController.getWeeklyChallenges);

// Get user's challenges
router.get('/users/:userId', challengeController.getUserChallenges);

// Get challenge stats
router.get('/:challengeId/stats', challengeController.getChallengeStats);

export default router;
