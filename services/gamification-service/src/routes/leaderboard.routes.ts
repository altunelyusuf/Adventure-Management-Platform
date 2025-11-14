import { Router } from 'express';
import { LeaderboardController } from '../controllers';

const router = Router();
const leaderboardController = new LeaderboardController();

// Get leaderboard by type
router.get('/type/:type', leaderboardController.getLeaderboardByType);

// Get leaderboard entries
router.get('/:leaderboardId', leaderboardController.getLeaderboard);

// Get user's rank
router.get('/:leaderboardId/users/:userId', leaderboardController.getUserRank);

// Get surrounding entries
router.get('/:leaderboardId/users/:userId/surrounding', leaderboardController.getSurroundingEntries);

export default router;
