import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from './config';
import { logger } from './logger';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const initializeDatabase = async () => {
  try {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    db = drizzle(pool);
    logger.info('Database connection established');
    return db;
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
};
