import { AppDataSource } from '../config/database';
import { Achievement, AchievementCategory, AchievementRarity } from '../models/Achievement.entity';
import { UserAchievement } from '../models/UserAchievement.entity';
import { Repository } from 'typeorm';

export interface UpdateProgressDTO {
  userId: string;
  achievementId: string;
  increment?: number;
  setValue?: number;
}

export class AchievementService {
  private achievementRepository: Repository<Achievement>;
  private userAchievementRepository: Repository<UserAchievement>;

  constructor() {
    this.achievementRepository = AppDataSource.getRepository(Achievement);
    this.userAchievementRepository = AppDataSource.getRepository(UserAchievement);
  }

  /**
   * Get all achievements
   */
  async getAllAchievements(includeHidden: boolean = false): Promise<Achievement[]> {
    const queryBuilder = this.achievementRepository.createQueryBuilder('achievement');

    if (!includeHidden) {
      queryBuilder.where('achievement.isHidden = :isHidden', { isHidden: false });
    }

    // Filter by availability dates
    queryBuilder.andWhere(
      '(achievement.availableFrom IS NULL OR achievement.availableFrom <= NOW())'
    );
    queryBuilder.andWhere(
      '(achievement.availableUntil IS NULL OR achievement.availableUntil >= NOW())'
    );

    return queryBuilder.orderBy('achievement.category', 'ASC').addOrderBy('achievement.rarity', 'DESC').getMany();
  }

  /**
   * Get achievement by ID
   */
  async getAchievement(achievementId: string): Promise<Achievement | null> {
    return this.achievementRepository.findOne({
      where: { achievementId },
    });
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    return this.achievementRepository.find({
      where: { category, isHidden: false },
      order: { rarity: 'DESC' },
    });
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string, unlockedOnly: boolean = false): Promise<
    Array<{
      achievement: Achievement;
      userAchievement: UserAchievement;
    }>
  > {
    const queryBuilder = this.userAchievementRepository
      .createQueryBuilder('userAchievement')
      .leftJoinAndSelect('userAchievement.achievementId', 'achievement')
      .where('userAchievement.userId = :userId', { userId });

    if (unlocked Only) {
      queryBuilder.andWhere('userAchievement.isUnlocked = :isUnlocked', { isUnlocked: true });
    }

    const userAchievements = await queryBuilder.getMany();

    // Fetch full achievement details
    const results = await Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await this.achievementRepository.findOne({
          where: { achievementId: ua.achievementId },
        });
        return {
          achievement: achievement!,
          userAchievement: ua,
        };
      })
    );

    return results;
  }

  /**
   * Initialize user achievement tracking
   */
  async initializeUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { achievementId },
    });

    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const existing = await this.userAchievementRepository.findOne({
      where: { userId, achievementId },
    });

    if (existing) {
      return existing;
    }

    const userAchievement = this.userAchievementRepository.create({
      userId,
      achievementId,
      progress: 0,
      target: achievement.requirements.target,
      isUnlocked: false,
    });

    return this.userAchievementRepository.save(userAchievement);
  }

  /**
   * Update achievement progress
   */
  async updateProgress(data: UpdateProgressDTO): Promise<{
    userAchievement: UserAchievement;
    unlocked: boolean;
  }> {
    let userAchievement = await this.userAchievementRepository.findOne({
      where: { userId: data.userId, achievementId: data.achievementId },
    });

    if (!userAchievement) {
      userAchievement = await this.initializeUserAchievement(data.userId, data.achievementId);
    }

    // Don't update if already unlocked and not repeatable
    const achievement = await this.achievementRepository.findOne({
      where: { achievementId: data.achievementId },
    });

    if (userAchievement.isUnlocked && !achievement?.isRepeatable) {
      return { userAchievement, unlocked: false };
    }

    // Update progress
    if (data.increment !== undefined) {
      userAchievement.progress += data.increment;
    } else if (data.setValue !== undefined) {
      userAchievement.progress = data.setValue;
    }

    // Check if unlocked
    let unlocked = false;
    if (userAchievement.progress >= userAchievement.target && !userAchievement.isUnlocked) {
      userAchievement.isUnlocked = true;
      userAchievement.unlockedAt = new Date();
      unlocked = true;

      // Increment achievement unlock count
      await this.achievementRepository.increment(
        { achievementId: data.achievementId },
        'unlockCount',
        1
      );
    }

    await this.userAchievementRepository.save(userAchievement);

    return { userAchievement, unlocked };
  }

  /**
   * Check and update achievements based on user action
   */
  async checkAchievements(
    userId: string,
    actionType: string,
    actionData: any
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    // Get all achievements of relevant type
    const achievements = await this.achievementRepository.find({
      where: { isHidden: false },
    });

    for (const achievement of achievements) {
      // Match achievement type with action
      if (achievement.requirements.type === actionType) {
        const result = await this.updateProgress({
          userId,
          achievementId: achievement.achievementId,
          increment: actionData.increment || 1,
        });

        if (result.unlocked) {
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(userId: string, achievementId: string): Promise<{
    progress: number;
    target: number;
    percentage: number;
    isUnlocked: boolean;
  } | null> {
    const userAchievement = await this.userAchievementRepository.findOne({
      where: { userId, achievementId },
    });

    if (!userAchievement) {
      const achievement = await this.achievementRepository.findOne({
        where: { achievementId },
      });

      if (!achievement) {
        return null;
      }

      return {
        progress: 0,
        target: achievement.requirements.target,
        percentage: 0,
        isUnlocked: false,
      };
    }

    return {
      progress: userAchievement.progress,
      target: userAchievement.target,
      percentage: (userAchievement.progress / userAchievement.target) * 100,
      isUnlocked: userAchievement.isUnlocked,
    };
  }

  /**
   * Get user's achievement statistics
   */
  async getUserAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    completionPercentage: number;
    byCategory: Record<string, { total: number; unlocked: number }>;
    byRarity: Record<string, { total: number; unlocked: number }>;
  }> {
    const allAchievements = await this.getAllAchievements(false);
    const userAchievements = await this.getUserAchievements(userId, false);

    const unlockedCount = userAchievements.filter((ua) => ua.userAchievement.isUnlocked).length;

    // Group by category
    const byCategory: Record<string, { total: number; unlocked: number }> = {};
    const byRarity: Record<string, { total: number; unlocked: number }> = {};

    allAchievements.forEach((achievement) => {
      // Category
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = { total: 0, unlocked: 0 };
      }
      byCategory[achievement.category].total++;

      // Rarity
      if (!byRarity[achievement.rarity]) {
        byRarity[achievement.rarity] = { total: 0, unlocked: 0 };
      }
      byRarity[achievement.rarity].total++;

      // Check if user unlocked this
      const userAchievement = userAchievements.find(
        (ua) => ua.achievement.achievementId === achievement.achievementId
      );
      if (userAchievement?.userAchievement.isUnlocked) {
        byCategory[achievement.category].unlocked++;
        byRarity[achievement.rarity].unlocked++;
      }
    });

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: unlockedCount,
      completionPercentage: (unlockedCount / allAchievements.length) * 100,
      byCategory,
      byRarity,
    };
  }
}
