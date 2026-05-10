import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import { config } from './config/config';
import { logger } from './config/logger';
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './config/redis';
import { initializeOllama } from './config/ollama';

import authRoutes from './routes/auth-routes';
import analysisRoutes from './routes/analysis-routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize services and start server
const startServer = async () => {
  try {
    logger.info('Initializing services...');

    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis initialized');

    // Initialize Ollama
    await initializeOllama();
    logger.info('Ollama initialized');

    // Start server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        await closeDatabase();
        await closeRedis();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
