import { DataSource } from 'typeorm';
import { config } from './index';
import { Quest } from '../models/Quest.entity';
import { Checkpoint } from '../models/Checkpoint.entity';
import { QuestParticipation } from '../models/QuestParticipation.entity';
import { CheckpointCompletion } from '../models/CheckpointCompletion.entity';
import { QuestCategory } from '../models/QuestCategory.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  synchronize: config.nodeEnv === 'development', // Auto-sync in dev only
  logging: config.nodeEnv === 'development',
  entities: [Quest, Checkpoint, QuestParticipation, CheckpointCompletion, QuestCategory],
  migrations: [],
  subscribers: [],
});

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Seed categories in development
    if (config.nodeEnv === 'development' || process.env.SEED_QUEST_CATEGORIES === 'true') {
      const { seedQuestCategories } = await import('../utils/seed-categories.util');
      await seedQuestCategories();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}
