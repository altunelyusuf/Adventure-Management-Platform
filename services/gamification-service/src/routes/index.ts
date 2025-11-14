import { Router } from 'express';
import xpRoutes from './xp.routes';
import achievementRoutes from './achievement.routes';
import badgeRoutes from './badge.routes';
import leaderboardRoutes from './leaderboard.routes';
import challengeRoutes from './challenge.routes';
import streakRoutes from './streak.routes';

const router = Router();

// Mount routes
router.use('/xp', xpRoutes);
router.use('/achievements', achievementRoutes);
router.use('/badges', badgeRoutes);
router.use('/leaderboards', leaderboardRoutes);
router.use('/challenges', challengeRoutes);
router.use('/streaks', streakRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'gamification-service',
    timestamp: new Date().toISOString(),
  });
});

export default router;
