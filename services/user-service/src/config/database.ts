import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './index';
import { UserProfile, UserPreferences, UserPrivacySettings } from '../models';

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
  entities: [UserProfile, UserPreferences, UserPrivacySettings],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ User Service database connection established successfully');
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
