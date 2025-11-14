import { DataSource } from 'typeorm';
import { config } from './index';
import * as path from 'path';

// Import all entities
import { UserXP } from '../models/UserXP.entity';
import { XPTransaction } from '../models/XPTransaction.entity';
import { Achievement } from '../models/Achievement.entity';
import { UserAchievement } from '../models/UserAchievement.entity';
import { Badge } from '../models/Badge.entity';
import { UserBadge } from '../models/UserBadge.entity';
import { Leaderboard } from '../models/Leaderboard.entity';
import { LeaderboardEntry } from '../models/LeaderboardEntry.entity';
import { Challenge } from '../models/Challenge.entity';
import { UserChallenge } from '../models/UserChallenge.entity';
import { Streak } from '../models/Streak.entity';
import { LevelReward } from '../models/LevelReward.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  ssl: config.postgres.ssl ? { rejectUnauthorized: false } : false,
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development' ? ['error', 'warn'] : false,
  entities: [
    UserXP,
    XPTransaction,
    Achievement,
    UserAchievement,
    Badge,
    UserBadge,
    Leaderboard,
    LeaderboardEntry,
    Challenge,
    UserChallenge,
    Streak,
    LevelReward,
  ],
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  subscribers: [],
  maxQueryExecutionTime: 1000,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Seed achievements, badges, challenges, and level rewards
    if (config.nodeEnv === 'development' || process.env.SEED_GAMIFICATION_DATA === 'true') {
      const { seedAchievements } = await import('../utils/seed-achievements.util');
      const { seedBadges } = await import('../utils/seed-badges.util');
      const { seedChallenges } = await import('../utils/seed-challenges.util');
      const { seedLevelRewards } = await import('../utils/seed-level-rewards.util');

      await seedAchievements();
      await seedBadges();
      await seedChallenges();
      await seedLevelRewards();

      console.log('✅ Gamification data seeded');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  await AppDataSource.destroy();
  console.log('Database connection closed');
};
