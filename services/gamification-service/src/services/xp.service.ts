import { AppDataSource } from '../config/database';
import { UserXP } from '../models/UserXP.entity';
import { XPTransaction, XPSource } from '../models/XPTransaction.entity';
import { config } from '../config';
import { Repository } from 'typeorm';

export interface AwardXPDTO {
  userId: string;
  source: XPSource;
  sourceId?: string;
  amount: number;
  bonusMultiplier?: number;
  metadata?: any;
}

export interface XPSummary {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  xpProgressPercent: number;
  lifetimeXp: number;
  xpThisWeek: number;
  xpThisMonth: number;
}

export class XPService {
  private userXpRepository: Repository<UserXP>;
  private xpTransactionRepository: Repository<XPTransaction>;

  constructor() {
    this.userXpRepository = AppDataSource.getRepository(UserXP);
    this.xpTransactionRepository = AppDataSource.getRepository(XPTransaction);
  }

  /**
   * Calculate level from total XP
   */
  calculateLevel(totalXp: number): number {
    let level = 1;
    let xpRequired = config.level.baseXP;
    let totalXpForLevel = 0;

    while (totalXpForLevel + xpRequired <= totalXp && level < config.level.maxLevel) {
      totalXpForLevel += xpRequired;
      level++;

      // Different growth rates based on level
      if (level <= 10) {
        xpRequired = config.level.baseXP; // Linear 1-10
      } else if (level <= 25) {
        xpRequired = Math.floor(xpRequired * 1.15); // 15% growth 11-25
      } else if (level <= 50) {
        xpRequired = Math.floor(xpRequired * 1.12); // 12% growth 26-50
      } else if (level <= 75) {
        xpRequired = Math.floor(xpRequired * 1.10); // 10% growth 51-75
      } else {
        xpRequired = Math.floor(xpRequired * 1.08); // 8% growth 76-100
      }
    }

    return level;
  }

  /**
   * Calculate XP required for a specific level
   */
  calculateXPForLevel(level: number): number {
    let xpRequired = config.level.baseXP;
    let totalXp = 0;

    for (let currentLevel = 1; currentLevel < level && currentLevel < config.level.maxLevel; currentLevel++) {
      totalXp += xpRequired;

      if (currentLevel >= 10 && currentLevel < 25) {
        xpRequired = Math.floor(xpRequired * 1.15);
      } else if (currentLevel >= 25 && currentLevel < 50) {
        xpRequired = Math.floor(xpRequired * 1.12);
      } else if (currentLevel >= 50 && currentLevel < 75) {
        xpRequired = Math.floor(xpRequired * 1.10);
      } else if (currentLevel >= 75) {
        xpRequired = Math.floor(xpRequired * 1.08);
      }
    }

    return totalXp;
  }

  /**
   * Award XP to user
   */
  async awardXP(data: AwardXPDTO): Promise<{
    transactionId: string;
    xpAwarded: number;
    totalXP: number;
    previousLevel: number;
    currentLevel: number;
    leveledUp: boolean;
  }> {
    const bonusMultiplier = data.bonusMultiplier || 1.0;
    const totalAwarded = Math.floor(data.amount * bonusMultiplier);

    // Create XP transaction
    const transaction = this.xpTransactionRepository.create({
      userId: data.userId,
      source: data.source,
      sourceId: data.sourceId,
      amount: data.amount,
      bonusMultiplier,
      totalAwarded,
      metadata: data.metadata,
    });

    await this.xpTransactionRepository.save(transaction);

    // Get or create user XP record
    let userXp = await this.userXpRepository.findOne({
      where: { userId: data.userId },
    });

    const isNew = !userXp;
    const previousLevel = userXp?.currentLevel || 1;

    if (!userXp) {
      userXp = this.userXpRepository.create({
        userId: data.userId,
        totalXp: 0,
        currentLevel: 1,
        lifetimeXp: 0,
        xpThisWeek: 0,
        xpThisMonth: 0,
        weekResetAt: new Date(),
        monthResetAt: new Date(),
      });
    }

    // Update XP totals
    userXp.totalXp += totalAwarded;
    userXp.lifetimeXp += totalAwarded;
    userXp.xpThisWeek += totalAwarded;
    userXp.xpThisMonth += totalAwarded;

    // Calculate new level
    const newLevel = this.calculateLevel(userXp.totalXp);
    const leveledUp = newLevel > previousLevel;
    userXp.currentLevel = newLevel;

    await this.userXpRepository.save(userXp);

    return {
      transactionId: transaction.transactionId,
      xpAwarded: totalAwarded,
      totalXP: userXp.totalXp,
      previousLevel,
      currentLevel: newLevel,
      leveledUp,
    };
  }

  /**
   * Get user XP summary
   */
  async getUserXP(userId: string): Promise<XPSummary | null> {
    const userXp = await this.userXpRepository.findOne({
      where: { userId },
    });

    if (!userXp) {
      return null;
    }

    const nextLevelXp = this.calculateXPForLevel(userXp.currentLevel + 1);
    const currentLevelXp = this.calculateXPForLevel(userXp.currentLevel);
    const xpToNextLevel = nextLevelXp - userXp.totalXp;
    const xpInCurrentLevel = userXp.totalXp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;
    const xpProgressPercent = (xpInCurrentLevel / xpNeededForLevel) * 100;

    return {
      totalXp: userXp.totalXp,
      currentLevel: userXp.currentLevel,
      xpToNextLevel,
      xpProgressPercent: Math.min(100, Math.max(0, xpProgressPercent)),
      lifetimeXp: userXp.lifetimeXp,
      xpThisWeek: userXp.xpThisWeek,
      xpThisMonth: userXp.xpThisMonth,
    };
  }

  /**
   * Get user XP transaction history
   */
  async getUserXPHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ transactions: XPTransaction[]; total: number }> {
    const [transactions, total] = await this.xpTransactionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { transactions, total };
  }

  /**
   * Calculate bonus multiplier for quest completion
   */
  calculateBonusMultiplier(metadata: {
    perfectCompletion?: boolean;
    speedCompletion?: boolean;
    firstCompletion?: boolean;
    isWeekend?: boolean;
  }): number {
    let multiplier = 1.0;

    if (metadata.perfectCompletion) {
      multiplier += config.xp.bonus.perfectCompletion;
    }
    if (metadata.speedCompletion) {
      multiplier += config.xp.bonus.speedCompletion;
    }
    if (metadata.firstCompletion) {
      multiplier += config.xp.bonus.firstCompletion;
    }
    if (metadata.isWeekend) {
      multiplier += config.xp.bonus.weekend;
    }

    return multiplier;
  }

  /**
   * Reset weekly XP for all users (called by cron job)
   */
  async resetWeeklyXP(): Promise<void> {
    await this.userXpRepository.update(
      {},
      {
        xpThisWeek: 0,
        weekResetAt: new Date(),
      }
    );
  }

  /**
   * Reset monthly XP for all users (called by cron job)
   */
  async resetMonthlyXP(): Promise<void> {
    await this.userXpRepository.update(
      {},
      {
        xpThisMonth: 0,
        monthResetAt: new Date(),
      }
    );
  }

  /**
   * Get leaderboard by XP (top N users)
   */
  async getXPLeaderboard(limit: number = 100, timeframe: 'all' | 'week' | 'month' = 'all'): Promise<UserXP[]> {
    const orderBy = timeframe === 'week' ? 'xpThisWeek' : timeframe === 'month' ? 'xpThisMonth' : 'totalXp';

    return this.userXpRepository
      .createQueryBuilder('userXp')
      .orderBy(`userXp.${orderBy}`, 'DESC')
      .limit(limit)
      .getMany();
  }
}
