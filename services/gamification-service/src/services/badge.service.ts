import { AppDataSource } from '../config/database';
import { Badge, BadgeTier } from '../models/Badge.entity';
import { UserBadge } from '../models/UserBadge.entity';
import { Repository } from 'typeorm';

export interface AwardBadgeDTO {
  userId: string;
  badgeId: string;
  metadata?: any;
}

export class BadgeService {
  private badgeRepository: Repository<Badge>;
  private userBadgeRepository: Repository<UserBadge>;

  constructor() {
    this.badgeRepository = AppDataSource.getRepository(Badge);
    this.userBadgeRepository = AppDataSource.getRepository(UserBadge);
  }

  /**
   * Get all badges
   */
  async getAllBadges(): Promise<Badge[]> {
    return this.badgeRepository.find({
      order: { tier: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Get badge by ID
   */
  async getBadge(badgeId: string): Promise<Badge | null> {
    return this.badgeRepository.findOne({
      where: { badgeId },
    });
  }

  /**
   * Get badges by tier
   */
  async getBadgesByTier(tier: BadgeTier): Promise<Badge[]> {
    return this.badgeRepository.find({
      where: { tier },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<
    Array<{
      badge: Badge;
      userBadge: UserBadge;
    }>
  > {
    const userBadges = await this.userBadgeRepository.find({
      where: { userId },
      order: { earnedAt: 'DESC' },
    });

    const results = await Promise.all(
      userBadges.map(async (ub) => {
        const badge = await this.badgeRepository.findOne({
          where: { badgeId: ub.badgeId },
        });
        return {
          badge: badge!,
          userBadge: ub,
        };
      })
    );

    return results;
  }

  /**
   * Award badge to user
   */
  async awardBadge(data: AwardBadgeDTO): Promise<UserBadge | null> {
    // Check if user already has this badge
    const existing = await this.userBadgeRepository.findOne({
      where: { userId: data.userId, badgeId: data.badgeId },
    });

    if (existing) {
      return null; // Already has badge
    }

    // Check if badge exists
    const badge = await this.badgeRepository.findOne({
      where: { badgeId: data.badgeId },
    });

    if (!badge) {
      throw new Error('Badge not found');
    }

    // Award badge
    const userBadge = this.userBadgeRepository.create({
      userId: data.userId,
      badgeId: data.badgeId,
      earnedAt: new Date(),
      metadata: data.metadata,
    });

    await this.userBadgeRepository.save(userBadge);

    // Increment badge holder count
    await this.badgeRepository.increment({ badgeId: data.badgeId }, 'holderCount', 1);

    return userBadge;
  }

  /**
   * Check if user has badge
   */
  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const userBadge = await this.userBadgeRepository.findOne({
      where: { userId, badgeId },
    });

    return !!userBadge;
  }

  /**
   * Get user's badge collection statistics
   */
  async getUserBadgeStats(userId: string): Promise<{
    totalBadges: number;
    earnedBadges: number;
    collectionPercentage: number;
    byTier: Record<string, { total: number; earned: number }>;
    exclusiveBadges: number;
  }> {
    const allBadges = await this.getAllBadges();
    const userBadges = await this.getUserBadges(userId);

    const byTier: Record<string, { total: number; earned: number }> = {};

    Object.values(BadgeTier).forEach((tier) => {
      byTier[tier] = { total: 0, earned: 0 };
    });

    allBadges.forEach((badge) => {
      byTier[badge.tier].total++;

      const userBadge = userBadges.find((ub) => ub.badge.badgeId === badge.badgeId);
      if (userBadge) {
        byTier[badge.tier].earned++;
      }
    });

    const exclusiveBadges = userBadges.filter((ub) => ub.badge.isExclusive).length;

    return {
      totalBadges: allBadges.length,
      earnedBadges: userBadges.length,
      collectionPercentage: (userBadges.length / allBadges.length) * 100,
      byTier,
      exclusiveBadges,
    };
  }

  /**
   * Get rarest badges (least holders)
   */
  async getRarestBadges(limit: number = 10): Promise<Badge[]> {
    return this.badgeRepository
      .createQueryBuilder('badge')
      .where('badge.holderCount > 0')
      .orderBy('badge.holderCount', 'ASC')
      .limit(limit)
      .getMany();
  }
}
