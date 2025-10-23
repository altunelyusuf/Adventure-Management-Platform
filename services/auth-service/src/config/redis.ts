import { createClient, RedisClientType } from 'redis';
import { config } from './index';

let redisClient: RedisClientType | null = null;

export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
      database: config.redis.db,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Error initializing Redis:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.error('❌ Error closing Redis:', error);
      throw error;
    }
  }
}
