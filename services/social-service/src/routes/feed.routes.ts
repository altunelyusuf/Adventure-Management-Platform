import { Router } from 'express';
import { FeedController } from '../controllers';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const feedController = new FeedController();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/social/feed/personal
 * @desc    Get personal activity feed
 * @access  Private
 */
router.get('/personal', feedController.getPersonalFeed);

/**
 * @route   GET /api/social/feed/friends
 * @desc    Get friends activity feed
 * @access  Private
 */
router.get('/friends', feedController.getFriendFeed);

/**
 * @route   GET /api/social/feed/combined
 * @desc    Get combined feed (personal + friends)
 * @access  Private
 */
router.get('/combined', feedController.getCombinedFeed);

/**
 * @route   GET /api/social/feed/global
 * @desc    Get global activity feed
 * @access  Private
 */
router.get('/global', feedController.getGlobalFeed);

/**
 * @route   GET /api/social/feed/trending
 * @desc    Get trending activities
 * @access  Private
 */
router.get('/trending', feedController.getTrendingActivities);

export default router;
