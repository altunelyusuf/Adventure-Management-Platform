import request from 'supertest';
import express, { Application } from 'express';
import routes from '../../src/routes';
import { mockUsers } from '../fixtures/mockData';

// Mock the middleware
jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = {
      userId: mockUsers.user1.userId,
      email: mockUsers.user1.email,
      role: 'USER',
    };
    next();
  },
}));

// Mock the services
jest.mock('../../src/services/friend.service');
jest.mock('../../src/services/activity.service');
jest.mock('../../src/services/feed.service');
jest.mock('../../src/services/interaction.service');

import { FriendService } from '../../src/services/friend.service';
import { FeedService } from '../../src/services/feed.service';
import { InteractionService } from '../../src/services/interaction.service';

describe('Social Service API Integration Tests', () => {
  let app: Application;
  let mockFriendService: jest.Mocked<FriendService>;
  let mockFeedService: jest.Mocked<FeedService>;
  let mockInteractionService: jest.Mocked<InteractionService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/social', routes);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockFriendService = FriendService.prototype as any;
    mockFeedService = FeedService.prototype as any;
    mockInteractionService = InteractionService.prototype as any;
  });

  describe('Health Check', () => {
    it('GET /api/social/health should return 200', async () => {
      const response = await request(app).get('/api/social/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        service: 'social-service',
      });
    });
  });

  describe('Friend Routes', () => {
    describe('POST /api/social/friends/request', () => {
      it('should send friend request successfully', async () => {
        const mockRequest = {
          requestId: 'test-request-id',
          senderId: mockUsers.user1.userId,
          receiverId: mockUsers.user2.userId,
          status: 'PENDING',
        };

        mockFriendService.sendFriendRequest = jest.fn().mockResolvedValue(mockRequest);

        const response = await request(app)
          .post('/api/social/friends/request')
          .send({
            receiverId: mockUsers.user2.userId,
            message: 'Let\'s be friends!',
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('requestId');
      });

      it('should return 400 if receiverId is missing', async () => {
        const response = await request(app)
          .post('/api/social/friends/request')
          .send({
            message: 'Let\'s be friends!',
          });

        expect(response.status).toBe(400);
      });
    });

    describe('PUT /api/social/friends/request/:requestId/accept', () => {
      it('should accept friend request successfully', async () => {
        const mockFriendship = {
          friendshipId: 'test-friendship-id',
          user1Id: mockUsers.user1.userId,
          user2Id: mockUsers.user2.userId,
        };

        mockFriendService.acceptFriendRequest = jest.fn().mockResolvedValue(mockFriendship);

        const response = await request(app)
          .put('/api/social/friends/request/test-request-id/accept');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('friendshipId');
      });
    });

    describe('GET /api/social/friends/:userId', () => {
      it('should return user\'s friends list', async () => {
        const mockFriends = [
          { friendshipId: '1', user2Id: mockUsers.user2.userId },
          { friendshipId: '2', user2Id: mockUsers.user3.userId },
        ];

        mockFriendService.getFriends = jest.fn().mockResolvedValue(mockFriends);

        const response = await request(app)
          .get(`/api/social/friends/${mockUsers.user1.userId}`)
          .query({ limit: 10, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('friends');
        expect(Array.isArray(response.body.friends)).toBe(true);
      });
    });

    describe('DELETE /api/social/friends/:friendId', () => {
      it('should remove friend successfully', async () => {
        mockFriendService.removeFriend = jest.fn().mockResolvedValue(undefined);

        const response = await request(app)
          .delete(`/api/social/friends/${mockUsers.user2.userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('POST /api/social/friends/block/:userId', () => {
      it('should block user successfully', async () => {
        const mockBlock = {
          blockId: 'test-block-id',
          blockerId: mockUsers.user1.userId,
          blockedId: mockUsers.user4.userId,
        };

        mockFriendService.blockUser = jest.fn().mockResolvedValue(mockBlock);

        const response = await request(app)
          .post(`/api/social/friends/block/${mockUsers.user4.userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('blockId');
      });
    });
  });

  describe('Feed Routes', () => {
    describe('GET /api/social/feed/personal', () => {
      it('should return personal feed', async () => {
        const mockActivities = [
          {
            activityId: '1',
            userId: mockUsers.user1.userId,
            activityType: 'QUEST_COMPLETED',
            visibility: 'PUBLIC',
          },
        ];

        mockFeedService.getPersonalFeed = jest.fn().mockResolvedValue(mockActivities);

        const response = await request(app)
          .get('/api/social/feed/personal')
          .query({ limit: 20, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('activities');
        expect(Array.isArray(response.body.activities)).toBe(true);
      });
    });

    describe('GET /api/social/feed/friends', () => {
      it('should return friends feed', async () => {
        const mockActivities = [
          {
            activityId: '2',
            userId: mockUsers.user2.userId,
            activityType: 'ACHIEVEMENT_UNLOCKED',
            visibility: 'PUBLIC',
          },
        ];

        mockFeedService.getFriendFeed = jest.fn().mockResolvedValue(mockActivities);

        const response = await request(app)
          .get('/api/social/feed/friends')
          .query({ limit: 20, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('activities');
      });
    });

    describe('GET /api/social/feed/combined', () => {
      it('should return combined feed', async () => {
        const mockActivities = [
          {
            activityId: '1',
            userId: mockUsers.user1.userId,
            activityType: 'QUEST_COMPLETED',
          },
          {
            activityId: '2',
            userId: mockUsers.user2.userId,
            activityType: 'LEVEL_UP',
          },
        ];

        mockFeedService.getCombinedFeed = jest.fn().mockResolvedValue(mockActivities);

        const response = await request(app).get('/api/social/feed/combined');

        expect(response.status).toBe(200);
        expect(response.body.activities).toHaveLength(2);
      });
    });

    describe('GET /api/social/feed/global', () => {
      it('should return global public feed', async () => {
        const mockActivities = [
          {
            activityId: '1',
            activityType: 'QUEST_COMPLETED',
            visibility: 'PUBLIC',
          },
        ];

        mockFeedService.getGlobalFeed = jest.fn().mockResolvedValue(mockActivities);

        const response = await request(app).get('/api/social/feed/global');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('activities');
      });
    });

    describe('GET /api/social/feed/trending', () => {
      it('should return trending activities', async () => {
        const mockActivities = [
          {
            activityId: '1',
            activityType: 'QUEST_COMPLETED',
            likeCount: 50,
            commentCount: 20,
          },
        ];

        mockFeedService.getTrendingActivities = jest.fn().mockResolvedValue(mockActivities);

        const response = await request(app)
          .get('/api/social/feed/trending')
          .query({ hours: 24, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('activities');
      });
    });
  });

  describe('Interaction Routes', () => {
    describe('POST /api/social/interactions/activity/:activityId/like', () => {
      it('should like an activity successfully', async () => {
        const mockLike = {
          likeId: 'test-like-id',
          activityId: 'activity-1',
          userId: mockUsers.user1.userId,
        };

        mockInteractionService.likeActivity = jest.fn().mockResolvedValue(mockLike);

        const response = await request(app)
          .post('/api/social/interactions/activity/activity-1/like');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('likeId');
      });
    });

    describe('DELETE /api/social/interactions/activity/:activityId/like', () => {
      it('should unlike an activity successfully', async () => {
        mockInteractionService.unlikeActivity = jest.fn().mockResolvedValue(undefined);

        const response = await request(app)
          .delete('/api/social/interactions/activity/activity-1/like');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('POST /api/social/interactions/activity/:activityId/comment', () => {
      it('should create comment successfully', async () => {
        const mockComment = {
          commentId: 'test-comment-id',
          activityId: 'activity-1',
          userId: mockUsers.user1.userId,
          content: 'Great job!',
        };

        mockInteractionService.createComment = jest.fn().mockResolvedValue(mockComment);

        const response = await request(app)
          .post('/api/social/interactions/activity/activity-1/comment')
          .send({
            content: 'Great job!',
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('commentId');
        expect(response.body.content).toBe('Great job!');
      });

      it('should return 400 if content is missing', async () => {
        const response = await request(app)
          .post('/api/social/interactions/activity/activity-1/comment')
          .send({});

        expect(response.status).toBe(400);
      });
    });

    describe('PUT /api/social/interactions/comment/:commentId', () => {
      it('should update comment successfully', async () => {
        const mockUpdatedComment = {
          commentId: 'comment-1',
          content: 'Updated content',
        };

        mockInteractionService.updateComment = jest.fn().mockResolvedValue(mockUpdatedComment);

        const response = await request(app)
          .put('/api/social/interactions/comment/comment-1')
          .send({
            content: 'Updated content',
          });

        expect(response.status).toBe(200);
        expect(response.body.content).toBe('Updated content');
      });
    });

    describe('DELETE /api/social/interactions/comment/:commentId', () => {
      it('should delete comment successfully', async () => {
        mockInteractionService.deleteComment = jest.fn().mockResolvedValue(undefined);

        const response = await request(app)
          .delete('/api/social/interactions/comment/comment-1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('GET /api/social/interactions/activity/:activityId/comments', () => {
      it('should return activity comments', async () => {
        const mockComments = [
          {
            commentId: '1',
            activityId: 'activity-1',
            content: 'Great!',
          },
          {
            commentId: '2',
            activityId: 'activity-1',
            content: 'Awesome!',
          },
        ];

        mockInteractionService.getActivityComments = jest.fn().mockResolvedValue(mockComments);

        const response = await request(app)
          .get('/api/social/interactions/activity/activity-1/comments')
          .query({ limit: 10, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('comments');
        expect(response.body.comments).toHaveLength(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/social/non-existent');

      expect(response.status).toBe(404);
    });

    it('should handle service errors gracefully', async () => {
      mockFriendService.sendFriendRequest = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/social/friends/request')
        .send({
          receiverId: mockUsers.user2.userId,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
