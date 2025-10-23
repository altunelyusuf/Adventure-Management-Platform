import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './index';
import { User, RefreshToken, LoginAttempt, Role, Permission, UserRoleEntity } from '../models';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [User, RefreshToken, LoginAttempt, Role, Permission, UserRoleEntity],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');

    // Seed RBAC on first run (development only)
    if (config.nodeEnv === 'development' || process.env.SEED_RBAC === 'true') {
      const { seedRBAC } = await import('../utils/seed-rbac.util');
      await seedRBAC();
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
}
