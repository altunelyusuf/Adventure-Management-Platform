import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate, authValidationSchemas } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  resendVerificationRateLimiter,
} from '../middleware/rateLimit.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerRateLimiter,
  validate(authValidationSchemas.register),
  authController.register
);

/**
 * @route   GET /api/v1/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
router.get(
  '/verify-email',
  authController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  '/resend-verification',
  resendVerificationRateLimiter,
  validate(authValidationSchemas.resendVerification),
  authController.resendVerification
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  '/login',
  loginRateLimiter,
  validate(authValidationSchemas.login),
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(authValidationSchemas.refreshToken),
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(authValidationSchemas.forgotPassword),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post(
  '/reset-password',
  validate(authValidationSchemas.resetPassword),
  authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post(
  '/logout',
  authController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

/**
 * @route   GET /health
 * @desc    Health check
 * @access  Public
 */
router.get('/health', authController.healthCheck);

export default router;
