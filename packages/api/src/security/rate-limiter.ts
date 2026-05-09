import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req: Request) => {
      return process.env.NODE_ENV !== 'production';
    },
    keyGenerator: (req: Request) => {
      return req.ip || 'unknown';
    },
  });
};

export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth endpoints
export const uploadLimiter = createRateLimiter(60 * 60 * 1000, 10); // 10 uploads per hour

export const requestSanitizer = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
