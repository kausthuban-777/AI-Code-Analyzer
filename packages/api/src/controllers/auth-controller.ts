import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database';
import { users, sessions } from '../config/schema';
import { eq } from 'drizzle-orm';
import { config } from '../config/config';
import { logger } from '../config/logger';

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, username } = req.body;

      // Validation
      if (!email || !password || !username) {
        res.status(400).json({ error: 'Email, password, and username are required' });
        return;
      }

      const db = getDatabase();

      // Check if user exists
      const [existing] = await db.select().from(users).where(eq(users.email, email));

      if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          email,
          username,
          password: hashedPassword,
        })
        .returning({ id: users.id, email: users.email });

      // Generate token
      const token = this.generateToken(user.id, user.email);

      res.status(201).json({
        user: { id: user.id, email: user.email, username },
        token,
      });
    } catch (error) {
      logger.error('Register error', error);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const db = getDatabase();

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate token
      const token = this.generateToken(user.id, user.email);

      res.json({
        user: { id: user.id, email: user.email, username: user.username },
        token,
      });
    } catch (error) {
      logger.error('Login error', error);
      next(error);
    }
  }

  async verifyToken(token: string): Promise<{ id: number; email: string } | null> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        id: number;
        email: string;
      };
      return decoded;
    } catch {
      return null;
    }
  }

  private generateToken(id: number, email: string): string {
    return jwt.sign({ id, email }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY,
    });
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.substring(7);
    const controller = new AuthController();
    const user = require('jsonwebtoken').verify(token, config.JWT_SECRET);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
