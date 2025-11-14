import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    const response = await axios.get(`${config.authServiceUrl}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.user) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Token expired or invalid' });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication service error' });
    }
  }
};
