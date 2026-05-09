import jwt, { SignOptions } from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRY as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  return bcryptjs.hash(password, rounds);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};
