import { InteractionService } from '../../src/services/interaction.service';
import { ActivityService } from '../../src/services/activity.service';
import { Repository } from 'typeorm';
import { ActivityLike } from '../../src/models/ActivityLike.entity';
import { ActivityComment } from '../../src/models/ActivityComment.entity';
import { mockUsers, mockActivities, mockActivityLike, mockComments } from '../fixtures/mockData';

describe('InteractionService', () => {
  let interactionService: InteractionService;
  let mockLikeRepo: jest.Mocked<Repository<ActivityLike>>;
  let mockCommentRepo: jest.Mocked<Repository<ActivityComment>>;
  let mockActivityService: jest.Mocked<ActivityService>;

  beforeEach(() => {
    mockLikeRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockCommentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
    } as any;

    mockActivityService = {
      getActivityById: jest.fn(),
      incrementLikeCount: jest.fn(),
      decrementLikeCount: jest.fn(),
      incrementCommentCount: jest.fn(),
      decrementCommentCount: jest.fn(),
    } as any;

    interactionService = new InteractionService();
    (interactionService as any).likeRepository = mockLikeRepo;
    (interactionService as any).commentRepository = mockCommentRepo;
    (interactionService as any).activityService = mockActivityService;
  });

  describe('likeActivity', () => {
    it('should like an activity successfully', async () => {
      const dto = {
        activityId: mockActivities.questCompleted.activityId,
        userId: mockUsers.user2.userId,
      };

      mockActivityService.getActivityById.mockResolvedValue(mockActivities.questCompleted as any);
      mockLikeRepo.findOne.mockResolvedValue(null); // Not already liked
      mockLikeRepo.create.mockReturnValue(mockActivityLike as any);
      mockLikeRepo.save.mockResolvedValue(mockActivityLike as any);

      const result = await interactionService.likeActivity(dto);

      expect(result).toEqual(mockActivityLike);
      expect(mockActivityService.incrementLikeCount).toHaveBeenCalledWith(dto.activityId);
    });

    it('should throw error if activity not found', async () => {
      const dto = {
        activityId: 'invalid-id',
        userId: mockUsers.user2.userId,
      };

      mockActivityService.getActivityById.mockRejectedValue(new Error('Activity not found'));

      await expect(interactionService.likeActivity(dto)).rejects.toThrow('Activity not found');
    });

    it('should throw error if already liked', async () => {
      const dto = {
        activityId: mockActivities.questCompleted.activityId,
        userId: mockUsers.user2.userId,
      };

      mockActivityService.getActivityById.mockResolvedValue(mockActivities.questCompleted as any);
      mockLikeRepo.findOne.mockResolvedValue(mockActivityLike as any);

      await expect(interactionService.likeActivity(dto)).rejects.toThrow(
        'Activity already liked'
      );
    });
  });

  describe('unlikeActivity', () => {
    it('should unlike an activity successfully', async () => {
      const activityId = mockActivities.questCompleted.activityId;
      const userId = mockUsers.user2.userId;

      mockLikeRepo.findOne.mockResolvedValue(mockActivityLike as any);
      mockLikeRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await interactionService.unlikeActivity(activityId, userId);

      expect(mockLikeRepo.delete).toHaveBeenCalled();
      expect(mockActivityService.decrementLikeCount).toHaveBeenCalledWith(activityId);
    });

    it('should throw error if like not found', async () => {
      mockLikeRepo.findOne.mockResolvedValue(null);

      await expect(
        interactionService.unlikeActivity('activity-id', 'user-id')
      ).rejects.toThrow('Like not found');
    });
  });

  describe('hasLiked', () => {
    it('should return true if user has liked activity', async () => {
      mockLikeRepo.findOne.mockResolvedValue(mockActivityLike as any);

      const result = await interactionService.hasLiked(
        mockActivities.questCompleted.activityId,
        mockUsers.user2.userId
      );

      expect(result).toBe(true);
    });

    it('should return false if user has not liked activity', async () => {
      mockLikeRepo.findOne.mockResolvedValue(null);

      const result = await interactionService.hasLiked(
        mockActivities.questCompleted.activityId,
        mockUsers.user1.userId
      );

      expect(result).toBe(false);
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const dto = {
        activityId: mockActivities.levelUp.activityId,
        userId: mockUsers.user2.userId,
        content: 'Congratulations!',
      };

      mockCommentRepo.create.mockReturnValue(mockComments.parent as any);
      mockCommentRepo.save.mockResolvedValue(mockComments.parent as any);

      const result = await interactionService.createComment(dto);

      expect(result).toEqual(mockComments.parent);
      expect(mockActivityService.incrementCommentCount).toHaveBeenCalledWith(dto.activityId);
    });

    it('should create a nested comment successfully', async () => {
      const dto = {
        activityId: mockActivities.levelUp.activityId,
        userId: mockUsers.user1.userId,
        content: 'Thanks!',
        parentCommentId: mockComments.parent.commentId,
      };

      mockCommentRepo.findOne.mockResolvedValue(mockComments.parent as any);
      mockCommentRepo.create.mockReturnValue(mockComments.reply as any);
      mockCommentRepo.save.mockResolvedValue(mockComments.reply as any);
      mockCommentRepo.increment.mockResolvedValue({} as any);

      const result = await interactionService.createComment(dto);

      expect(result).toEqual(mockComments.reply);
      expect(mockCommentRepo.increment).toHaveBeenCalledWith(
        { commentId: dto.parentCommentId },
        'replyCount',
        1
      );
    });

    it('should throw error if comment exceeds max length', async () => {
      const dto = {
        activityId: mockActivities.levelUp.activityId,
        userId: mockUsers.user2.userId,
        content: 'x'.repeat(2001), // Exceeds 2000 char limit
      };

      await expect(interactionService.createComment(dto)).rejects.toThrow(
        'Comment exceeds maximum length'
      );
    });

    it('should throw error if nested comment exceeds max depth', async () => {
      const dto = {
        activityId: mockActivities.levelUp.activityId,
        userId: mockUsers.user1.userId,
        content: 'Reply',
        parentCommentId: mockComments.parent.commentId,
      };

      // Mock getCommentDepth to return depth >= 3
      jest.spyOn(interactionService as any, 'getCommentDepth').mockResolvedValue(3);

      await expect(interactionService.createComment(dto)).rejects.toThrow(
        'Maximum comment depth'
      );
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const commentId = mockComments.parent.commentId;
      const userId = mockUsers.user2.userId;
      const newContent = 'Updated comment';

      const existingComment = { ...mockComments.parent };
      const updatedComment = { ...existingComment, content: newContent };

      mockCommentRepo.findOne.mockResolvedValue(existingComment as any);
      mockCommentRepo.save.mockResolvedValue(updatedComment as any);

      const result = await interactionService.updateComment(commentId, userId, newContent);

      expect(result.content).toBe(newContent);
      expect(mockCommentRepo.save).toHaveBeenCalled();
    });

    it('should throw error if comment not found', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);

      await expect(
        interactionService.updateComment('invalid-id', 'user-id', 'new content')
      ).rejects.toThrow('Comment not found');
    });

    it('should throw error if user is not comment author', async () => {
      mockCommentRepo.findOne.mockResolvedValue(mockComments.parent as any);

      await expect(
        interactionService.updateComment(
          mockComments.parent.commentId,
          'different-user-id',
          'new content'
        )
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const commentId = mockComments.parent.commentId;
      const userId = mockUsers.user2.userId;

      mockCommentRepo.findOne.mockResolvedValue(mockComments.parent as any);
      mockCommentRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await interactionService.deleteComment(commentId, userId);

      expect(mockCommentRepo.delete).toHaveBeenCalledWith({ commentId });
      expect(mockActivityService.decrementCommentCount).toHaveBeenCalledWith(
        mockComments.parent.activityId
      );
    });

    it('should decrement parent reply count for nested comment', async () => {
      const nestedComment = mockComments.reply;

      mockCommentRepo.findOne.mockResolvedValue(nestedComment as any);
      mockCommentRepo.delete.mockResolvedValue({ affected: 1 } as any);
      mockCommentRepo.decrement.mockResolvedValue({} as any);

      await interactionService.deleteComment(nestedComment.commentId, mockUsers.user1.userId);

      expect(mockCommentRepo.decrement).toHaveBeenCalledWith(
        { commentId: nestedComment.parentCommentId },
        'replyCount',
        1
      );
    });
  });

  describe('getActivityLikes', () => {
    it('should return activity likes with pagination', async () => {
      const activityId = mockActivities.levelUp.activityId;
      const likes = [mockActivityLike];

      mockLikeRepo.find.mockResolvedValue(likes as any);

      const result = await interactionService.getActivityLikes(activityId, 10, 0);

      expect(result).toEqual(likes);
      expect(mockLikeRepo.find).toHaveBeenCalledWith({
        where: { activityId },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getActivityComments', () => {
    it('should return top-level comments only', async () => {
      const activityId = mockActivities.levelUp.activityId;
      const comments = [mockComments.parent];

      mockCommentRepo.find.mockResolvedValue(comments as any);

      const result = await interactionService.getActivityComments(activityId, 10, 0);

      expect(result).toEqual(comments);
      expect(mockCommentRepo.find).toHaveBeenCalledWith({
        where: { activityId, parentCommentId: null },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getCommentReplies', () => {
    it('should return replies to a comment', async () => {
      const parentCommentId = mockComments.parent.commentId;
      const replies = [mockComments.reply];

      mockCommentRepo.find.mockResolvedValue(replies as any);

      const result = await interactionService.getCommentReplies(parentCommentId, 10, 0);

      expect(result).toEqual(replies);
      expect(mockCommentRepo.find).toHaveBeenCalledWith({
        where: { parentCommentId },
        order: { createdAt: 'ASC' },
        take: 10,
        skip: 0,
      });
    });
  });
});
