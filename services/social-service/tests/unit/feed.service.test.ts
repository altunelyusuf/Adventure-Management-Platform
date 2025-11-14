import { FeedService } from '../../src/services/feed.service';
import { ActivityService } from '../../src/services/activity.service';
import { FriendService } from '../../src/services/friend.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Activity, ActivityVisibility } from '../../src/models/Activity.entity';
import { mockUsers, mockActivities } from '../fixtures/mockData';

describe('FeedService', () => {
  let feedService: FeedService;
  let mockActivityRepo: jest.Mocked<Repository<Activity>>;
  let mockActivityService: jest.Mocked<ActivityService>;
  let mockFriendService: jest.Mocked<FriendService>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Activity>>;

  beforeEach(() => {
    // Create mock query builder
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
    } as any;

    mockActivityRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockActivityService = {
      createActivity: jest.fn(),
      getActivityById: jest.fn(),
    } as any;

    mockFriendService = {
      getFriendIds: jest.fn(),
      areFriends: jest.fn(),
    } as any;

    feedService = new FeedService();
    (feedService as any).activityRepository = mockActivityRepo;
    (feedService as any).activityService = mockActivityService;
    (feedService as any).friendService = mockFriendService;
  });

  describe('getPersonalFeed', () => {
    it('should return user\'s personal activities', async () => {
      const userId = mockUsers.user1.userId;
      const activities = [mockActivities.questCompleted, mockActivities.levelUp];

      mockQueryBuilder.getMany.mockResolvedValue(activities as any);

      const result = await feedService.getPersonalFeed(userId, 20, 0);

      expect(result).toEqual(activities);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('activity.userId = :userId', { userId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('activity.createdAt', 'DESC');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should handle pagination correctly', async () => {
      const userId = mockUsers.user1.userId;

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await feedService.getPersonalFeed(userId, 10, 20);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    });
  });

  describe('getFriendFeed', () => {
    it('should return friends\' activities', async () => {
      const userId = mockUsers.user1.userId;
      const friendIds = [mockUsers.user2.userId, mockUsers.user3.userId];
      const activities = [mockActivities.achievementUnlocked];

      mockFriendService.getFriendIds.mockResolvedValue(friendIds);
      mockQueryBuilder.getMany.mockResolvedValue(activities as any);

      const result = await feedService.getFriendFeed(userId, 20, 0);

      expect(result).toEqual(activities);
      expect(mockFriendService.getFriendIds).toHaveBeenCalledWith(userId);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'activity.userId IN (:...friendIds)',
        { friendIds }
      );
    });

    it('should return empty array if user has no friends', async () => {
      const userId = mockUsers.user1.userId;

      mockFriendService.getFriendIds.mockResolvedValue([]);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await feedService.getFriendFeed(userId, 20, 0);

      expect(result).toEqual([]);
    });
  });

  describe('getCombinedFeed', () => {
    it('should return combined feed with proper visibility filtering', async () => {
      const userId = mockUsers.user1.userId;
      const friendIds = [mockUsers.user2.userId];
      const activities = [
        mockActivities.questCompleted,
        mockActivities.achievementUnlocked,
        mockActivities.levelUp,
      ];

      mockFriendService.getFriendIds.mockResolvedValue(friendIds);
      mockQueryBuilder.getMany.mockResolvedValue(activities as any);

      const result = await feedService.getCombinedFeed(userId, 20, 0);

      expect(result).toEqual(activities);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('getGlobalFeed', () => {
    it('should return only public activities', async () => {
      const publicActivities = [mockActivities.questCompleted, mockActivities.levelUp];

      mockQueryBuilder.getMany.mockResolvedValue(publicActivities as any);

      const result = await feedService.getGlobalFeed(20, 0);

      expect(result).toEqual(publicActivities);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'activity.visibility = :visibility',
        { visibility: ActivityVisibility.PUBLIC }
      );
    });

    it('should respect limit and offset', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await feedService.getGlobalFeed(50, 100);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(100);
    });
  });

  describe('getTrendingActivities', () => {
    it('should return trending activities within time window', async () => {
      const trendingActivities = [mockActivities.levelUp]; // Has 5 likes

      mockQueryBuilder.getMany.mockResolvedValue(trendingActivities as any);

      const result = await feedService.getTrendingActivities(24, 10);

      expect(result).toEqual(trendingActivities);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'activity.visibility = :visibility',
        { visibility: ActivityVisibility.PUBLIC }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });
  });

  describe('getFilteredFeed', () => {
    it('should filter activities by type', async () => {
      const userId = mockUsers.user1.userId;
      const filters = {
        activityTypes: ['QUEST_COMPLETED', 'LEVEL_UP'],
      };
      const filteredActivities = [mockActivities.questCompleted, mockActivities.levelUp];

      mockFriendService.getFriendIds.mockResolvedValue([mockUsers.user2.userId]);
      mockQueryBuilder.getMany.mockResolvedValue(filteredActivities as any);

      const result = await feedService.getFilteredFeed(userId, filters, 20, 0);

      expect(result).toEqual(filteredActivities);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'activity.activityType IN (:...activityTypes)',
        { activityTypes: filters.activityTypes }
      );
    });

    it('should filter activities by user IDs', async () => {
      const userId = mockUsers.user1.userId;
      const filters = {
        userIds: [mockUsers.user2.userId],
      };

      mockFriendService.getFriendIds.mockResolvedValue([mockUsers.user2.userId]);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await feedService.getFilteredFeed(userId, filters, 20, 0);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'activity.userId IN (:...filterUserIds)',
        { filterUserIds: filters.userIds }
      );
    });

    it('should filter activities by date range', async () => {
      const userId = mockUsers.user1.userId;
      const startDate = new Date(Date.now() - 86400000); // 1 day ago
      const endDate = new Date();
      const filters = {
        startDate,
        endDate,
      };

      mockFriendService.getFriendIds.mockResolvedValue([]);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await feedService.getFilteredFeed(userId, filters, 20, 0);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'activity.createdAt >= :startDate',
        { startDate }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'activity.createdAt <= :endDate',
        { endDate }
      );
    });
  });
});
