import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
    [key: string]: any;
  };
}

/**
 * JWT Authentication Middleware
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as any;

      req.user = {
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        role: decoded.role,
        ...decoded,
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
    return;
  }
};

/**
 * Optional authentication (doesn't block if no token)
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as any;

      req.user = {
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        role: decoded.role,
        ...decoded,
      };
    } catch (error) {
      // Token invalid, but continue without user
    }

    next();
  } catch (error) {
    next();
  }
};
