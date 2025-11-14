import { AppDataSource } from '../config/database';
import { Activity, ActivityVisibility } from '../models/Activity.entity';
import { Repository, In } from 'typeorm';
import { FriendService } from './friend.service';
import { config } from '../config';

export class FeedService {
  private activityRepository: Repository<Activity>;
  private friendService: FriendService;

  constructor() {
    this.activityRepository = AppDataSource.getRepository(Activity);
    this.friendService = new FriendService();
  }

  /**
   * Get personal feed (user's own activities)
   */
  async getPersonalFeed(userId: string, limit: number = 20, offset: number = 0): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get friend feed (activities from friends)
   */
  async getFriendFeed(userId: string, limit: number = 20, offset: number = 0): Promise<Activity[]> {
    // Get user's friends
    const friendIds = await this.friendService.getFriendIds(userId);

    if (friendIds.length === 0) {
      return [];
    }

    return this.activityRepository.find({
      where: {
        userId: In(friendIds),
        visibility: In([ActivityVisibility.PUBLIC, ActivityVisibility.FRIENDS]),
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get combined feed (user + friends activities)
   */
  async getCombinedFeed(userId: string, limit: number = 20, offset: number = 0): Promise<Activity[]> {
    const friendIds = await this.friendService.getFriendIds(userId);
    const allUserIds = [userId, ...friendIds];

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId IN (:...userIds)', { userIds: allUserIds })
      .andWhere(
        '(activity.visibility = :public OR (activity.visibility = :friends AND activity.userId IN (:...friendIds)) OR activity.userId = :userId)',
        {
          public: ActivityVisibility.PUBLIC,
          friends: ActivityVisibility.FRIENDS,
          friendIds: friendIds.length > 0 ? friendIds : [''],
          userId,
        }
      )
      .orderBy('activity.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  /**
   * Get global feed (public activities from everyone)
   */
  async getGlobalFeed(limit: number = 20, offset: number = 0): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { visibility: ActivityVisibility.PUBLIC },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get trending activities (most liked/commented recent activities)
   */
  async getTrendingActivities(
    hoursAgo: number = 24,
    limit: number = 20
  ): Promise<Activity[]> {
    const sinceDate = new Date();
    sinceDate.setHours(sinceDate.getHours() - hoursAgo);

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.visibility = :visibility', { visibility: ActivityVisibility.PUBLIC })
      .andWhere('activity.createdAt >= :sinceDate', { sinceDate })
      .orderBy('activity.likeCount + activity.commentCount', 'DESC')
      .addOrderBy('activity.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Get user's feed with filters
   */
  async getFilteredFeed(
    userId: string,
    filters: {
      types?: string[];
      fromDate?: Date;
      toDate?: Date;
    },
    limit: number = 20,
    offset: number = 0
  ): Promise<Activity[]> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId });

    if (filters.types && filters.types.length > 0) {
      queryBuilder.andWhere('activity.type IN (:...types)', { types: filters.types });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('activity.createdAt >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('activity.createdAt <= :toDate', { toDate: filters.toDate });
    }

    return queryBuilder
      .orderBy('activity.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
