import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';
import config from './index';

// PostgreSQL DataSource (for structured data)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: 'geospatial',
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  entities: [__dirname + '/../models/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});

// MongoDB Client (for geospatial queries)
let mongoClient: MongoClient | null = null;

export const connectMongo = async (): Promise<MongoClient> => {
  if (mongoClient) {
    return mongoClient;
  }

  mongoClient = new MongoClient(config.mongodb.uri);
  await mongoClient.connect();
  console.log('✅ MongoDB connected');

  // Create geospatial indexes
  const db = mongoClient.db(config.mongodb.database);
  const locationsCollection = db.collection('locations');

  // Create 2dsphere index for geospatial queries
  await locationsCollection.createIndex({ location: '2dsphere' });
  await locationsCollection.createIndex({ userId: 1, timestamp: -1 });

  return mongoClient;
};

export const getMongoDb = () => {
  if (!mongoClient) {
    throw new Error('MongoDB not connected');
  }
  return mongoClient.db(config.mongodb.database);
};
