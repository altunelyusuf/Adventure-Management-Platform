import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware';
import {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
} from '../types/auth.types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterRequest = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const result = await this.authService.register(data, ipAddress);

    res.status(201).json(result);
  });

  /**
   * GET /api/v1/auth/verify-email
   * Verify user email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };

    const result = await this.authService.verifyEmail(token);

    res.status(200).json(result);
  });

  /**
   * POST /api/v1/auth/resend-verification
   * Resend verification email
   */
  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email }: ResendVerificationRequest = req.body;

    const result = await this.authService.resendVerification(email);

    res.status(200).json(result);
  });

  /**
   * POST /api/v1/auth/login
   * User login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginRequest = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const result = await this.authService.login(data, ipAddress);

    res.status(200).json(result);
  });

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken }: RefreshTokenRequest = req.body;

    const result = await this.authService.refreshAccessToken(refreshToken);

    res.status(200).json(result);
  });

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email }: ForgotPasswordRequest = req.body;

    const result = await this.authService.forgotPassword(email);

    res.status(200).json(result);
  });

  /**
   * POST /api/v1/auth/reset-password
   * Reset password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword }: ResetPasswordRequest = req.body;

    const result = await this.authService.resetPassword(token, newPassword);

    res.status(200).json(result);
  });

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  });

  /**
   * GET /api/v1/auth/me
   * Get current user info (requires authentication)
   */
  getCurrentUser = asyncHandler(async (req: any, res: Response) => {
    // User is attached by authenticate middleware
    const user = req.user;

    res.status(200).json({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });
  });

  /**
   * GET /health
   * Health check endpoint
   */
  healthCheck = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    });
  });
}
