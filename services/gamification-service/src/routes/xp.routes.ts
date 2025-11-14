import { Router } from 'express';
import { XPController } from '../controllers';

const router = Router();
const xpController = new XPController();

// Award XP
router.post('/award', xpController.awardXP);

// Get user XP summary
router.get('/users/:userId', xpController.getUserXP);

// Get user XP history
router.get('/users/:userId/history', xpController.getUserXPHistory);

// Get XP leaderboard
router.get('/leaderboard', xpController.getXPLeaderboard);

// Calculate level utility
router.get('/calculate-level', xpController.calculateLevel);

export default router;
