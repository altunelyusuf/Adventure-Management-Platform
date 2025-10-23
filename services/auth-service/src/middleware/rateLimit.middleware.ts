import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * General rate limiter for authentication endpoints
 * 5 requests per hour per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for login attempts
 * 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'TooManyRequests',
    message: 'Too many login attempts, please try again in 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limiter for registration
 * 3 registrations per hour per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'TooManyRequests',
    message: 'Too many registration attempts, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'TooManyRequests',
    message: 'Too many password reset requests, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email verification resend
 * 3 requests per hour per IP
 */
export const resendVerificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'TooManyRequests',
    message: 'Too many verification email requests, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
