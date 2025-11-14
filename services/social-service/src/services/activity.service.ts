import { AppDataSource } from '../config/database';
import { Activity, ActivityType, ActivityVisibility } from '../models/Activity.entity';
import { Repository } from 'typeorm';

export interface CreateActivityDTO {
  userId: string;
  type: ActivityType;
  visibility?: ActivityVisibility;
  data: Record<string, any>;
}

export class ActivityService {
  private activityRepository: Repository<Activity>;

  constructor() {
    this.activityRepository = AppDataSource.getRepository(Activity);
  }

  /**
   * Create activity
   */
  async createActivity(dto: CreateActivityDTO): Promise<Activity> {
    const activity = this.activityRepository.create({
      userId: dto.userId,
      type: dto.type,
      visibility: dto.visibility || ActivityVisibility.PUBLIC,
      data: dto.data,
      likeCount: 0,
      commentCount: 0,
    });

    return this.activityRepository.save(activity);
  }

  /**
   * Get activity by ID
   */
  async getActivity(activityId: string): Promise<Activity | null> {
    return this.activityRepository.findOne({
      where: { activityId },
    });
  }

  /**
   * Get user activities
   */
  async getUserActivities(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string, userId: string): Promise<void> {
    const result = await this.activityRepository.delete({
      activityId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error('Activity not found or unauthorized');
    }
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(activityId: string): Promise<void> {
    await this.activityRepository.increment({ activityId }, 'likeCount', 1);
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(activityId: string): Promise<void> {
    await this.activityRepository.decrement({ activityId }, 'likeCount', 1);
  }

  /**
   * Increment comment count
   */
  async incrementCommentCount(activityId: string): Promise<void> {
    await this.activityRepository.increment({ activityId }, 'commentCount', 1);
  }

  /**
   * Decrement comment count
   */
  async decrementCommentCount(activityId: string): Promise<void> {
    await this.activityRepository.decrement({ activityId }, 'commentCount', 1);
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    type: ActivityType,
    limit: number = 20,
    offset: number = 0
  ): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { type, visibility: ActivityVisibility.PUBLIC },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get public activities
   */
  async getPublicActivities(limit: number = 20, offset: number = 0): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { visibility: ActivityVisibility.PUBLIC },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
