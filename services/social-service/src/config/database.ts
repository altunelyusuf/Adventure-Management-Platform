import { DataSource } from 'typeorm';
import { config } from './index';
import * as path from 'path';

// Import all entities
import { Friendship } from '../models/Friendship.entity';
import { FriendRequest } from '../models/FriendRequest.entity';
import { Block } from '../models/Block.entity';
import { Follow } from '../models/Follow.entity';
import { Activity } from '../models/Activity.entity';
import { ActivityLike } from '../models/ActivityLike.entity';
import { ActivityComment } from '../models/ActivityComment.entity';

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
    Friendship,
    FriendRequest,
    Block,
    Follow,
    Activity,
    ActivityLike,
    ActivityComment,
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
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  await AppDataSource.destroy();
  console.log('Database connection closed');
};
