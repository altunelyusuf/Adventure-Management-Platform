import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, RefreshToken, LoginAttempt, UserRole } from '../models';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
  isTokenExpired,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  logger,
} from '../utils';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../middleware';
import { config } from '../config';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  RefreshTokenResponse,
} from '../types/auth.types';

export class AuthService {
  private userRepository: Repository<User>;
  private refreshTokenRepository: Repository<RefreshToken>;
  private loginAttemptRepository: Repository<LoginAttempt>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    this.loginAttemptRepository = AppDataSource.getRepository(LoginAttempt);
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest, ipAddress: string): Promise<RegisterResponse> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate verification token
    const { token: verificationToken, hashedToken, expiresAt } = generateVerificationToken(
      config.security.tokenExpiry.verification
    );

    // Create user
    const user = this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      role: UserRole.USER,
      emailVerified: false,
      isActive: true,
      verificationToken: hashedToken,
      verificationTokenExpires: expiresAt,
    });

    await this.userRepository.save(user);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.username, verificationToken);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      ipAddress,
    });

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      verificationRequired: true,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Verify user email
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const hashedToken = hashToken(token);

    const user = await this.userRepository.findOne({
      where: { verificationToken: hashedToken },
    });

    if (!user) {
      throw new NotFoundError('Invalid verification token');
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    if (!user.verificationTokenExpires || isTokenExpired(user.verificationTokenExpires)) {
      throw new ValidationError('Verification token expired. Please request a new one.');
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await this.userRepository.save(user);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    logger.info('Email verified successfully', { userId: user.id });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<VerifyEmailResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return {
        success: true,
        message: 'If email exists, verification email sent',
      };
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    // Generate new verification token
    const { token: verificationToken, hashedToken, expiresAt } = generateVerificationToken(
      config.security.tokenExpiry.verification
    );

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = expiresAt;
    await this.userRepository.save(user);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.username, verificationToken);
    } catch (error) {
      logger.error('Failed to resend verification email:', error);
      throw new Error('Failed to send verification email');
    }

    logger.info('Verification email resent', { userId: user.id });

    return {
      success: true,
      message: 'Verification email sent',
    };
  }

  /**
   * User login
   */
  async login(data: LoginRequest, ipAddress: string): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    // Check if account is locked
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      const lockDuration = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedError(
        `Account locked due to too many failed login attempts. Try again in ${lockDuration} minutes.`
      );
    }

    // Track login attempt
    const loginAttempt = this.loginAttemptRepository.create({
      userId: user?.id,
      ipAddress,
      success: false,
      attemptedAt: new Date(),
    });

    if (!user) {
      loginAttempt.failureReason = 'User not found';
      await this.loginAttemptRepository.save(loginAttempt);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      loginAttempt.failureReason = 'Invalid password';
      await this.loginAttemptRepository.save(loginAttempt);

      // Increment failed attempts
      user.failedLoginAttempts += 1;

      // Lock account if too many attempts
      if (user.failedLoginAttempts >= config.security.accountLockout.maxAttempts) {
        user.lockedUntil = new Date(Date.now() + config.security.accountLockout.lockoutDuration);
        await this.userRepository.save(user);

        logger.warn('Account locked due to failed login attempts', {
          userId: user.id,
          ipAddress,
        });

        throw new UnauthorizedError(
          'Account locked due to too many failed login attempts. Please try again later.'
        );
      }

      await this.userRepository.save(user);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      loginAttempt.failureReason = 'Email not verified';
      await this.loginAttemptRepository.save(loginAttempt);
      throw new UnauthorizedError('Please verify your email first');
    }

    // Check if account is active
    if (!user.isActive) {
      loginAttempt.failureReason = 'Account inactive';
      await this.loginAttemptRepository.save(loginAttempt);
      throw new UnauthorizedError('Account is not active');
    }

    // Login successful
    loginAttempt.success = true;
    await this.loginAttemptRepository.save(loginAttempt);

    // Reset failed attempts and unlock account
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Save refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists and is not revoked
    const tokenHash = hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revoked: false },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid or revoked refresh token');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Revoke old refresh token
    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(storedToken);

    // Save new refresh token
    const newRefreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    logger.info('Token refreshed successfully', { userId: user.id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    // Don't reveal if user exists
    if (!user) {
      return {
        message: 'If email exists, password reset link sent',
      };
    }

    // Generate password reset token
    const { token: resetToken, hashedToken, expiresAt } = generatePasswordResetToken(
      config.security.tokenExpiry.passwordReset
    );

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await this.userRepository.save(user);

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    logger.info('Password reset email sent', { userId: user.id });

    return {
      message: 'If email exists, password reset link sent',
    };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    const hashedToken = hashToken(token);

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: hashedToken },
    });

    if (!user) {
      throw new NotFoundError('Invalid password reset token');
    }

    if (!user.passwordResetExpires || isTokenExpired(user.passwordResetExpires)) {
      throw new ValidationError('Password reset token expired');
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
    }

    // Check if new password is same as old password
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from old password');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.userRepository.save(user);

    // Revoke all refresh tokens
    await this.refreshTokenRepository.update({ userId: user.id }, { revoked: true, revokedAt: new Date() });

    logger.info('Password reset successfully', { userId: user.id });

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);

    await this.refreshTokenRepository.update(
      { tokenHash },
      { revoked: true, revokedAt: new Date() }
    );

    logger.info('User logged out successfully');
  }
}
