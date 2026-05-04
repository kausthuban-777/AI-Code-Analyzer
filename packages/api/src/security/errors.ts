import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  tenantId?: string;
}

export class SecurityError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const errorHandler = (
  err: Error | SecurityError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof SecurityError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: process.env.NODE_ENV === 'production' ? undefined : err.details,
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
};
