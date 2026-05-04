import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  API_BASE_URL: string;
  CORS_ORIGIN: string[];
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  BCRYPT_ROUNDS: number;
  LOG_LEVEL: string;
  DATABASE_URL: string;
}

const getConfig = (): AppConfig => {
  const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      logger.error(`Missing required environment variable: ${varName}`);
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    DATABASE_URL: process.env.DATABASE_URL || '',
  };
};

export const config = getConfig();
