import { DataSource } from 'typeorm';
import { MediaAsset } from '../models/MediaAsset.entity';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'adventure_platform',
  schema: process.env.DB_SCHEMA || 'media',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [MediaAsset],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Create schema if it doesn't exist
    await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.DB_SCHEMA || 'media'}`);
    console.log('✅ Database schema ready');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
