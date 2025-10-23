import { Router } from 'express';
import { DiscoveryController } from '../controllers/discovery.controller';

const router = Router();
const discoveryController = new DiscoveryController();

// Bookmark routes (all require authentication)
router.post('/bookmarks/:questId', discoveryController.addBookmark);
router.delete('/bookmarks/:questId', discoveryController.removeBookmark);
router.get('/bookmarks', discoveryController.getMyBookmarks);

// Featured & Trending (public)
router.get('/featured', discoveryController.getFeaturedQuests);
router.get('/trending', discoveryController.getTrendingQuests);

// Recommendations (require authentication)
router.get('/recommendations', discoveryController.getRecommendations);
router.get('/for-you', discoveryController.getForYou);
router.get('/similar/:questId', discoveryController.getSimilarQuests);
router.get('/nearby', discoveryController.getNearbyQuests);

// Analytics (require authentication, creator only)
router.get('/analytics/:questId', discoveryController.getQuestAnalytics);
router.get('/analytics/creator/dashboard', discoveryController.getCreatorAnalytics);

export default router;
