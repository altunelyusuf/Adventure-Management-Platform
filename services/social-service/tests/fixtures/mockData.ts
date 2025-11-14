import { v4 as uuidv4 } from 'uuid';
import { ActivityType, ActivityVisibility } from '../../src/models/Activity.entity';
import { FriendRequestStatus } from '../../src/models/FriendRequest.entity';

/**
 * Mock user data
 */
export const mockUsers = {
  user1: {
    userId: uuidv4(),
    email: 'user1@test.com',
    username: 'user1',
  },
  user2: {
    userId: uuidv4(),
    email: 'user2@test.com',
    username: 'user2',
  },
  user3: {
    userId: uuidv4(),
    email: 'user3@test.com',
    username: 'user3',
  },
  user4: {
    userId: uuidv4(),
    email: 'user4@test.com',
    username: 'user4',
  },
};

/**
 * Mock friendship data
 */
export const mockFriendship = {
  friendshipId: uuidv4(),
  user1Id: mockUsers.user1.userId,
  user2Id: mockUsers.user2.userId,
  createdAt: new Date(),
  metadata: {
    initiatorId: mockUsers.user1.userId,
    friendshipSource: 'friend_request',
  },
};

/**
 * Mock friend request data
 */
export const mockFriendRequest = {
  requestId: uuidv4(),
  senderId: mockUsers.user1.userId,
  receiverId: mockUsers.user3.userId,
  status: FriendRequestStatus.PENDING,
  message: 'Hey, let\'s be friends!',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
};

/**
 * Mock block data
 */
export const mockBlock = {
  blockId: uuidv4(),
  blockerId: mockUsers.user1.userId,
  blockedId: mockUsers.user4.userId,
  createdAt: new Date(),
  reason: 'Spam',
};

/**
 * Mock activity data
 */
export const mockActivities = {
  questCompleted: {
    activityId: uuidv4(),
    userId: mockUsers.user1.userId,
    activityType: ActivityType.QUEST_COMPLETED,
    visibility: ActivityVisibility.PUBLIC,
    content: {
      questId: uuidv4(),
      questName: 'Mountain Trail Adventure',
      difficulty: 'MEDIUM',
      xpEarned: 1000,
    },
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date(),
  },
  achievementUnlocked: {
    activityId: uuidv4(),
    userId: mockUsers.user2.userId,
    activityType: ActivityType.ACHIEVEMENT_UNLOCKED,
    visibility: ActivityVisibility.FRIENDS,
    content: {
      achievementId: uuidv4(),
      achievementName: 'First Steps',
      achievementDescription: 'Complete your first quest',
    },
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
  levelUp: {
    activityId: uuidv4(),
    userId: mockUsers.user1.userId,
    activityType: ActivityType.LEVEL_UP,
    visibility: ActivityVisibility.PUBLIC,
    content: {
      level: 10,
      xpEarned: 5000,
    },
    likeCount: 5,
    commentCount: 2,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
  },
};

/**
 * Mock activity like data
 */
export const mockActivityLike = {
  likeId: uuidv4(),
  activityId: mockActivities.questCompleted.activityId,
  userId: mockUsers.user2.userId,
  createdAt: new Date(),
};

/**
 * Mock activity comment data
 */
export const mockComments = {
  parent: {
    commentId: uuidv4(),
    activityId: mockActivities.levelUp.activityId,
    userId: mockUsers.user2.userId,
    content: 'Congratulations on reaching level 10!',
    likeCount: 0,
    replyCount: 1,
    createdAt: new Date(Date.now() - 3600000),
  },
  reply: {
    commentId: uuidv4(),
    activityId: mockActivities.levelUp.activityId,
    userId: mockUsers.user1.userId,
    content: 'Thanks! It was a great journey.',
    parentCommentId: '', // Will be set to parent.commentId
    likeCount: 0,
    replyCount: 0,
    createdAt: new Date(Date.now() - 1800000),
  },
};

// Link reply to parent
mockComments.reply.parentCommentId = mockComments.parent.commentId;

/**
 * Mock follow data
 */
export const mockFollow = {
  followId: uuidv4(),
  followerId: mockUsers.user1.userId,
  followingId: mockUsers.user3.userId,
  notificationsEnabled: true,
  createdAt: new Date(),
};

export default {
  mockUsers,
  mockFriendship,
  mockFriendRequest,
  mockBlock,
  mockActivities,
  mockActivityLike,
  mockComments,
  mockFollow,
};
