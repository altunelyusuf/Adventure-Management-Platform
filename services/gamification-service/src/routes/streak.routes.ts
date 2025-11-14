import { Router } from 'express';
import { StreakController } from '../controllers';

const router = Router();
const streakController = new StreakController();

// Get streak leaderboard
router.get('/:type/leaderboard', streakController.getStreakLeaderboard);

// Get user's streaks
router.get('/users/:userId', streakController.getUserStreaks);

// Get user's specific streak
router.get('/users/:userId/:type', streakController.getUserStreak);

// Get streak stats
router.get('/users/:userId/:type/stats', streakController.getStreakStats);

// Freeze streak
router.post('/users/:userId/:type/freeze', streakController.freezeStreak);

export default router;
