import { Request, Response, NextFunction } from 'express';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  message?: string;
  stack?: string;
}

/**
 * Global error handling middleware
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  const errorResponse: ErrorResponse = {
    error: err.message || 'Internal server error',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Determine status code based on error type
  let statusCode = 500;

  if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (
    err.message.includes('unauthorized') ||
    err.message.includes('permission') ||
    err.message.includes('access denied')
  ) {
    statusCode = 403;
  } else if (
    err.message.includes('invalid') ||
    err.message.includes('required') ||
    err.message.includes('must be') ||
    err.message.includes('exceeds')
  ) {
    statusCode = 400;
  } else if (err.message.includes('already exists') || err.message.includes('duplicate')) {
    statusCode = 409;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found middleware
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
