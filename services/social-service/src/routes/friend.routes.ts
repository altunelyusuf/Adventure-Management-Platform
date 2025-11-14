import { Router } from 'express';
import { FriendController } from '../controllers';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const friendController = new FriendController();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/social/friends/request
 * @desc    Send friend request
 * @access  Private
 */
router.post('/request', friendController.sendFriendRequest);

/**
 * @route   PUT /api/social/friends/request/:requestId/accept
 * @desc    Accept friend request
 * @access  Private
 */
router.put('/request/:requestId/accept', friendController.acceptFriendRequest);

/**
 * @route   PUT /api/social/friends/request/:requestId/reject
 * @desc    Reject friend request
 * @access  Private
 */
router.put('/request/:requestId/reject', friendController.rejectFriendRequest);

/**
 * @route   DELETE /api/social/friends/request/:requestId
 * @desc    Cancel friend request
 * @access  Private
 */
router.delete('/request/:requestId', friendController.cancelFriendRequest);

/**
 * @route   DELETE /api/social/friends/:friendId
 * @desc    Remove friend
 * @access  Private
 */
router.delete('/:friendId', friendController.removeFriend);

/**
 * @route   GET /api/social/friends/:userId
 * @desc    Get user's friends list
 * @access  Private
 */
router.get('/:userId', friendController.getFriends);

/**
 * @route   GET /api/social/friends/requests/pending
 * @desc    Get pending friend requests
 * @access  Private
 */
router.get('/requests/pending', friendController.getPendingRequests);

/**
 * @route   GET /api/social/friends/requests/sent
 * @desc    Get sent friend requests
 * @access  Private
 */
router.get('/requests/sent', friendController.getSentRequests);

/**
 * @route   POST /api/social/friends/block/:userId
 * @desc    Block user
 * @access  Private
 */
router.post('/block/:userId', friendController.blockUser);

/**
 * @route   DELETE /api/social/friends/block/:userId
 * @desc    Unblock user
 * @access  Private
 */
router.delete('/block/:userId', friendController.unblockUser);

/**
 * @route   GET /api/social/friends/blocked
 * @desc    Get blocked users
 * @access  Private
 */
router.get('/blocked/list', friendController.getBlockedUsers);

/**
 * @route   GET /api/social/friends/mutual/:userId
 * @desc    Get mutual friends with user
 * @access  Private
 */
router.get('/mutual/:userId', friendController.getMutualFriends);

/**
 * @route   GET /api/social/friends/suggestions
 * @desc    Get friend suggestions
 * @access  Private
 */
router.get('/suggestions/list', friendController.getFriendSuggestions);

export default router;
