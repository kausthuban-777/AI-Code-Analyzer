import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from './auth';
import { SecurityError, AuthenticatedRequest } from './errors';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new SecurityError(401, 'Missing authentication token');
    }

    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.tenantId = payload.tenantId;

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    throw new SecurityError(401, message);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      throw new SecurityError(401, 'User not authenticated');
    }

    // TODO: Implement role checking based on user profile
    next();
  };
};
