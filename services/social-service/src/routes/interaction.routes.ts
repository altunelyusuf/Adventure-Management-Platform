import { Router } from 'express';
import { InteractionController } from '../controllers';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const interactionController = new InteractionController();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/social/interactions/activity/:activityId/like
 * @desc    Like an activity
 * @access  Private
 */
router.post('/activity/:activityId/like', interactionController.likeActivity);

/**
 * @route   DELETE /api/social/interactions/activity/:activityId/like
 * @desc    Unlike an activity
 * @access  Private
 */
router.delete('/activity/:activityId/like', interactionController.unlikeActivity);

/**
 * @route   GET /api/social/interactions/activity/:activityId/likes
 * @desc    Get activity likes
 * @access  Private
 */
router.get('/activity/:activityId/likes', interactionController.getActivityLikes);

/**
 * @route   POST /api/social/interactions/activity/:activityId/comment
 * @desc    Create comment on activity
 * @access  Private
 */
router.post('/activity/:activityId/comment', interactionController.createComment);

/**
 * @route   PUT /api/social/interactions/comment/:commentId
 * @desc    Update comment
 * @access  Private
 */
router.put('/comment/:commentId', interactionController.updateComment);

/**
 * @route   DELETE /api/social/interactions/comment/:commentId
 * @desc    Delete comment
 * @access  Private
 */
router.delete('/comment/:commentId', interactionController.deleteComment);

/**
 * @route   GET /api/social/interactions/activity/:activityId/comments
 * @desc    Get activity comments
 * @access  Private
 */
router.get('/activity/:activityId/comments', interactionController.getActivityComments);

export default router;
