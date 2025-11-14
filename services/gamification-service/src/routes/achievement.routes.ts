import { Router } from 'express';
import { AchievementController } from '../controllers';

const router = Router();
const achievementController = new AchievementController();

// Get all achievements
router.get('/', achievementController.getAllAchievements);

// Get achievement by ID
router.get('/:achievementId', achievementController.getAchievement);

// Get achievements by category
router.get('/category/:category', achievementController.getAchievementsByCategory);

// Get user's achievements
router.get('/users/:userId', achievementController.getUserAchievements);

// Get achievement progress
router.get('/users/:userId/:achievementId/progress', achievementController.getAchievementProgress);

// Get user achievement stats
router.get('/users/:userId/stats', achievementController.getUserAchievementStats);

export default router;
