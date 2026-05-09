import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import express, { Express } from 'express';

export const configureSecurityHeaders = (app: Express): void => {
  // Helmet helps secure Express apps by setting HTTP response headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.API_BASE_URL || 'http://localhost:3000'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      noSniff: true,
      xssFilter: true,
    })
  );
};

export const configureCors = (app: Express): void => {
  const corsOptions = {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
  };

  app.use(cors(corsOptions));
};

export const configureSanitization = (app: Express): void => {
  // Data sanitization against NoSQL injection
  app.use(mongoSanitize());

  // Sanitize data against XSS attacks
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ key }) => {
        console.warn(`Field '${key}' was sanitized in request`);
      },
    })
  );
};

export const configureInputValidation = (app: Express): void => {
  // Limit payload size
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
};
