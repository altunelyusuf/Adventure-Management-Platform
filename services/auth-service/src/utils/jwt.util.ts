import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../models';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

/**
 * Generate access token
 */
export function generateAccessToken(userId: string, email: string, role: UserRole): string {
  const payload: JwtPayload = {
    userId,
    email,
    role,
    type: 'access',
  };

  return jwt.sign(payload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string, email: string, role: UserRole): string {
  const payload: JwtPayload = {
    userId,
    email,
    role,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as JwtPayload;
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshTokenSecret) as JwtPayload;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
}
