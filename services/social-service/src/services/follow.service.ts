import { AppDataSource } from '../config/database';
import { Follow } from '../models/Follow.entity';
import { Repository } from 'typeorm';
import { config } from '../config';

export class FollowService {
  private followRepository: Repository<Follow>;

  constructor() {
    this.followRepository = AppDataSource.getRepository(Follow);
  }

  /**
   * Follow user
   */
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existing) {
      throw new Error('Already following');
    }

    // Check max following limit
    const followingCount = await this.getFollowingCount(followerId);
    if (followingCount >= config.follow.maxFollowing) {
      throw new Error('Maximum following limit reached');
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
      notifyOnActivity: true,
    });

    return this.followRepository.save(follow);
  }

  /**
   * Unfollow user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const result = await this.followRepository.delete({
      followerId,
      followingId,
    });

    if (result.affected === 0) {
      throw new Error('Not following');
    }
  }

  /**
   * Check if following
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }

  /**
   * Get followers
   */
  async getFollowers(userId: string, limit: number = 100, offset: number = 0): Promise<Follow[]> {
    return this.followRepository.find({
      where: { followingId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get following
   */
  async getFollowing(userId: string, limit: number = 100, offset: number = 0): Promise<Follow[]> {
    return this.followRepository.find({
      where: { followerId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get follower count
   */
  async getFollowerCount(userId: string): Promise<number> {
    return this.followRepository.count({
      where: { followingId: userId },
    });
  }

  /**
   * Get following count
   */
  async getFollowingCount(userId: string): Promise<number> {
    return this.followRepository.count({
      where: { followerId: userId },
    });
  }

  /**
   * Update notification preference
   */
  async updateNotificationPreference(
    followerId: string,
    followingId: string,
    notifyOnActivity: boolean
  ): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new Error('Not following');
    }

    follow.notifyOnActivity = notifyOnActivity;
    await this.followRepository.save(follow);
  }
}
