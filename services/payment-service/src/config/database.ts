import { DataSource } from 'typeorm';
import config from './index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: 'payments',
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  entities: [__dirname + '/../models/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
