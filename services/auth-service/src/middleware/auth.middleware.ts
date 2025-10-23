import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { UnauthorizedError, ForbiddenError } from './errorHandler.middleware';
import { UserRole } from '../models';
import { RBACService } from '../services/rbac.service';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware to verify JWT access token
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      throw new UnauthorizedError(error.message);
    }
    throw new UnauthorizedError('Invalid token');
  }
}

/**
 * Middleware to check if user has required role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignore errors for optional authentication
    next();
  }
}

/**
 * RBAC Middleware: Require specific permission
 */
export function requirePermission(permissionName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const rbacService = new RBACService();
      const hasPermission = await rbacService.hasPermission(req.user.userId, permissionName);

      if (!hasPermission) {
        throw new ForbiddenError(`Permission '${permissionName}' required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * RBAC Middleware: Require any of the specified permissions
 */
export function requireAnyPermission(...permissionNames: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const rbacService = new RBACService();
      const hasPermission = await rbacService.hasAnyPermission(req.user.userId, permissionNames);

      if (!hasPermission) {
        throw new ForbiddenError(`One of these permissions required: ${permissionNames.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * RBAC Middleware: Require all of the specified permissions
 */
export function requireAllPermissions(...permissionNames: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const rbacService = new RBACService();
      const hasPermission = await rbacService.hasAllPermissions(req.user.userId, permissionNames);

      if (!hasPermission) {
        throw new ForbiddenError(`All permissions required: ${permissionNames.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
