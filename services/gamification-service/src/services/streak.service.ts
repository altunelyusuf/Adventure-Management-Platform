import { AppDataSource } from '../config/database';
import { Streak, StreakType } from '../models/Streak.entity';
import { Repository } from 'typeorm';
import { config } from '../config';
import { startOfDay, differenceInDays, addDays } from 'date-fns';

export class StreakService {
  private streakRepository: Repository<Streak>;

  constructor() {
    this.streakRepository = AppDataSource.getRepository(Streak);
  }

  /**
   * Get user's streak
   */
  async getUserStreak(userId: string, type: StreakType): Promise<Streak | null> {
    return this.streakRepository.findOne({
      where: { userId, type },
    });
  }

  /**
   * Initialize streak for user
   */
  async initializeStreak(userId: string, type: StreakType): Promise<Streak> {
    const existing = await this.getUserStreak(userId, type);

    if (existing) {
      return existing;
    }

    const streak = this.streakRepository.create({
      userId,
      type,
      currentStreak: 0,
      longestStreak: 0,
      freezeCount: 0,
      isFrozen: false,
      totalXpEarned: 0,
      milestones: [],
    });

    return this.streakRepository.save(streak);
  }

  /**
   * Update streak (call when user performs activity)
   */
  async updateStreak(userId: string, type: StreakType): Promise<{
    streak: Streak;
    increased: boolean;
    xpAwarded: number;
  }> {
    let streak = await this.getUserStreak(userId, type);

    if (!streak) {
      streak = await this.initializeStreak(userId, type);
    }

    const today = startOfDay(new Date());
    const lastActivity = streak.lastActivityDate ? startOfDay(new Date(streak.lastActivityDate)) : null;

    let increased = false;
    let xpAwarded = 0;

    if (!lastActivity) {
      // First activity
      streak.currentStreak = 1;
      streak.lastActivityDate = today;
      increased = true;
      xpAwarded = config.streak.xpPerDay;
    } else {
      const daysDifference = differenceInDays(today, lastActivity);

      if (daysDifference === 0) {
        // Already updated today, no change
        return { streak, increased: false, xpAwarded: 0 };
      } else if (daysDifference === 1) {
        // Consecutive day
        streak.currentStreak++;
        streak.lastActivityDate = today;
        increased = true;
        xpAwarded = config.streak.xpPerDay * streak.currentStreak; // Increasing XP with streak
      } else if (daysDifference > 1) {
        // Streak broken, check if frozen
        if (streak.isFrozen && streak.frozenUntil && new Date() <= streak.frozenUntil) {
          // Streak protected by freeze
          streak.lastActivityDate = today;
          streak.isFrozen = false;
          streak.frozenUntil = undefined;
        } else {
          // Streak broken
          streak.currentStreak = 1;
          streak.lastActivityDate = today;
          increased = true;
          xpAwarded = config.streak.xpPerDay;
        }
      }
    }

    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;

      // Check for milestones
      const milestones = [7, 14, 30, 60, 100, 365];
      for (const milestone of milestones) {
        if (streak.currentStreak === milestone) {
          streak.milestones.push({
            streak: milestone,
            achievedAt: new Date(),
          });
          xpAwarded += milestone * 10; // Bonus XP for milestones
        }
      }
    }

    streak.totalXpEarned += xpAwarded;

    await this.streakRepository.save(streak);

    return { streak, increased, xpAwarded };
  }

  /**
   * Freeze streak (use streak freeze power-up)
   */
  async freezeStreak(userId: string, type: StreakType, durationDays: number = 1): Promise<Streak | null> {
    const streak = await this.getUserStreak(userId, type);

    if (!streak) {
      return null;
    }

    if (streak.freezeCount >= config.streak.maxFreezeCount) {
      throw new Error('Maximum freeze count reached');
    }

    streak.isFrozen = true;
    streak.frozenUntil = addDays(new Date(), durationDays);
    streak.freezeCount++;

    return this.streakRepository.save(streak);
  }

  /**
   * Get user's all streaks
   */
  async getUserStreaks(userId: string): Promise<Streak[]> {
    return this.streakRepository.find({
      where: { userId },
    });
  }

  /**
   * Get leaderboard by streak (longest current streaks)
   */
  async getStreakLeaderboard(type: StreakType, limit: number = 100): Promise<Streak[]> {
    return this.streakRepository
      .createQueryBuilder('streak')
      .where('streak.type = :type', { type })
      .orderBy('streak.currentStreak', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Check and reset broken streaks (called by cron job)
   */
  async checkAndResetBrokenStreaks(): Promise<void> {
    const today = startOfDay(new Date());
    const gracePeriod = config.streak.gracePeriodHours / 24; // Convert to days

    const allStreaks = await this.streakRepository.find();

    for (const streak of allStreaks) {
      if (!streak.lastActivityDate) {
        continue;
      }

      const lastActivity = startOfDay(new Date(streak.lastActivityDate));
      const daysDifference = differenceInDays(today, lastActivity);

      // If more than 1 day + grace period, reset streak
      if (daysDifference > 1 + gracePeriod) {
        // Check if frozen
        if (streak.isFrozen && streak.frozenUntil && new Date() <= streak.frozenUntil) {
          continue; // Protected by freeze
        }

        // Reset streak
        streak.currentStreak = 0;
        await this.streakRepository.save(streak);
      }
    }
  }

  /**
   * Get streak statistics
   */
  async getStreakStats(userId: string, type: StreakType): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalXpEarned: number;
    freezesRemaining: number;
    isFrozen: boolean;
    milestones: Array<{ streak: number; achievedAt: Date }>;
    nextMilestone: number | null;
  }> {
    const streak = await this.getUserStreak(userId, type);

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalXpEarned: 0,
        freezesRemaining: config.streak.maxFreezeCount,
        isFrozen: false,
        milestones: [],
        nextMilestone: 7,
      };
    }

    const freezesRemaining = Math.max(0, config.streak.maxFreezeCount - streak.freezeCount);

    // Determine next milestone
    const milestones = [7, 14, 30, 60, 100, 365];
    const nextMilestone = milestones.find((m) => m > streak.currentStreak) || null;

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalXpEarned: streak.totalXpEarned,
      freezesRemaining,
      isFrozen: streak.isFrozen,
      milestones: streak.milestones,
      nextMilestone,
    };
  }
}
