import { AppDataSource } from '../config/database';
import { Leaderboard, LeaderboardType, LeaderboardTimeframe } from '../models/Leaderboard.entity';
import { LeaderboardEntry } from '../models/LeaderboardEntry.entity';
import { UserXP } from '../models/UserXP.entity';
import { Repository } from 'typeorm';
import { config } from '../config';

export interface LeaderboardEntryWithUser extends LeaderboardEntry {
  username?: string;
  avatarUrl?: string;
}

export class LeaderboardService {
  private leaderboardRepository: Repository<Leaderboard>;
  private leaderboardEntryRepository: Repository<LeaderboardEntry>;
  private userXpRepository: Repository<UserXP>;

  constructor() {
    this.leaderboardRepository = AppDataSource.getRepository(Leaderboard);
    this.leaderboardEntryRepository = AppDataSource.getRepository(LeaderboardEntry);
    this.userXpRepository = AppDataSource.getRepository(UserXP);
  }

  /**
   * Get leaderboard by ID
   */
  async getLeaderboard(leaderboardId: string): Promise<Leaderboard | null> {
    return this.leaderboardRepository.findOne({
      where: { leaderboardId },
    });
  }

  /**
   * Get leaderboard by type
   */
  async getLeaderboardByType(
    type: LeaderboardType,
    categoryId?: string
  ): Promise<Leaderboard | null> {
    const where: any = { type, isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.leaderboardRepository.findOne({ where });
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboardEntries(
    leaderboardId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<LeaderboardEntry[]> {
    return this.leaderboardEntryRepository.find({
      where: { leaderboardId },
      order: { rank: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get user's rank in leaderboard
   */
  async getUserRank(leaderboardId: string, userId: string): Promise<LeaderboardEntry | null> {
    return this.leaderboardEntryRepository.findOne({
      where: { leaderboardId, userId },
    });
  }

  /**
   * Update global XP leaderboard
   */
  async updateGlobalXPLeaderboard(): Promise<void> {
    // Get or create global XP leaderboard
    let leaderboard = await this.getLeaderboardByType(LeaderboardType.GLOBAL_XP);

    if (!leaderboard) {
      leaderboard = this.leaderboardRepository.create({
        name: 'Global XP Leaderboard',
        description: 'Top players by total XP',
        type: LeaderboardType.GLOBAL_XP,
        timeframe: LeaderboardTimeframe.ALL_TIME,
        isActive: true,
      });
      await this.leaderboardRepository.save(leaderboard);
    }

    // Get top users by XP
    const topUsers = await this.userXpRepository
      .createQueryBuilder('userXp')
      .orderBy('userXp.totalXp', 'DESC')
      .limit(config.leaderboard.topN)
      .getMany();

    // Update leaderboard entries
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      let entry = await this.leaderboardEntryRepository.findOne({
        where: { leaderboardId: leaderboard.leaderboardId, userId: user.userId },
      });

      if (entry) {
        entry.previousRank = entry.rank;
        entry.rank = i + 1;
        entry.score = user.totalXp;
        entry.metadata = {
          ...entry.metadata,
          level: user.currentLevel,
        };
      } else {
        entry = this.leaderboardEntryRepository.create({
          leaderboardId: leaderboard.leaderboardId,
          userId: user.userId,
          score: user.totalXp,
          rank: i + 1,
          metadata: {
            level: user.currentLevel,
          },
        });
      }

      await this.leaderboardEntryRepository.save(entry);
    }

    // Update leaderboard last updated time
    leaderboard.lastUpdated = new Date();
    await this.leaderboardRepository.save(leaderboard);
  }

  /**
   * Update weekly XP leaderboard
   */
  async updateWeeklyXPLeaderboard(): Promise<void> {
    let leaderboard = await this.getLeaderboardByType(LeaderboardType.WEEKLY_XP);

    if (!leaderboard) {
      leaderboard = this.leaderboardRepository.create({
        name: 'Weekly XP Leaderboard',
        description: 'Top players by XP this week',
        type: LeaderboardType.WEEKLY_XP,
        timeframe: LeaderboardTimeframe.WEEKLY,
        isActive: true,
      });
      await this.leaderboardRepository.save(leaderboard);
    }

    const topUsers = await this.userXpRepository
      .createQueryBuilder('userXp')
      .orderBy('userXp.xpThisWeek', 'DESC')
      .limit(config.leaderboard.topN)
      .getMany();

    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      let entry = await this.leaderboardEntryRepository.findOne({
        where: { leaderboardId: leaderboard.leaderboardId, userId: user.userId },
      });

      if (entry) {
        entry.previousRank = entry.rank;
        entry.rank = i + 1;
        entry.score = user.xpThisWeek;
      } else {
        entry = this.leaderboardEntryRepository.create({
          leaderboardId: leaderboard.leaderboardId,
          userId: user.userId,
          score: user.xpThisWeek,
          rank: i + 1,
        });
      }

      await this.leaderboardEntryRepository.save(entry);
    }

    leaderboard.lastUpdated = new Date();
    await this.leaderboardRepository.save(leaderboard);
  }

  /**
   * Reset weekly leaderboard
   */
  async resetWeeklyLeaderboard(): Promise<void> {
    const leaderboard = await this.getLeaderboardByType(LeaderboardType.WEEKLY_XP);

    if (leaderboard) {
      // Archive old entries or delete them
      await this.leaderboardEntryRepository.delete({
        leaderboardId: leaderboard.leaderboardId,
      });

      leaderboard.resetAt = new Date();
      await this.leaderboardRepository.save(leaderboard);
    }
  }

  /**
   * Get surrounding entries around user's rank
   */
  async getSurroundingEntries(
    leaderboardId: string,
    userId: string,
    range: number = 5
  ): Promise<{
    above: LeaderboardEntry[];
    user: LeaderboardEntry | null;
    below: LeaderboardEntry[];
  }> {
    const userEntry = await this.getUserRank(leaderboardId, userId);

    if (!userEntry) {
      return { above: [], user: null, below: [] };
    }

    const above = await this.leaderboardEntryRepository.find({
      where: { leaderboardId },
      order: { rank: 'ASC' },
      take: range,
      skip: Math.max(0, userEntry.rank - range - 1),
    });

    const below = await this.leaderboardEntryRepository.find({
      where: { leaderboardId },
      order: { rank: 'ASC' },
      take: range,
      skip: userEntry.rank,
    });

    return {
      above: above.filter((e) => e.rank < userEntry.rank),
      user: userEntry,
      below: below.filter((e) => e.rank > userEntry.rank),
    };
  }
}
