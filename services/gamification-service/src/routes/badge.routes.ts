import { Router } from 'express';
import { BadgeController } from '../controllers';

const router = Router();
const badgeController = new BadgeController();

// Get all badges
router.get('/', badgeController.getAllBadges);

// Get rarest badges
router.get('/rarest', badgeController.getRarestBadges);

// Get badge by ID
router.get('/:badgeId', badgeController.getBadge);

// Get badges by tier
router.get('/tier/:tier', badgeController.getBadgesByTier);

// Get user's badges
router.get('/users/:userId', badgeController.getUserBadges);

// Get user badge stats
router.get('/users/:userId/stats', badgeController.getUserBadgeStats);

export default router;
