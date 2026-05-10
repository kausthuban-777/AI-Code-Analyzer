import { createClient } from 'redis';
import { config } from './config';
import { logger } from './logger';

let redisClient: ReturnType<typeof createClient> | null = null;

export const initializeRedis = async () => {
  try {
    redisClient = createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 5000,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    await redisClient.connect();
    logger.info('Redis connection established');
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis', error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache retrieval failed for key: ${key}`, error);
    return null;
  }
};

export const setInCache = async <T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error(`Cache write failed for key: ${key}`, error);
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    logger.error(`Cache invalidation failed for pattern: ${pattern}`, error);
  }
};
