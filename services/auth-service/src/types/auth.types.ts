import { UserRole } from '../models';

// Registration
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  username: string;
  verificationRequired: boolean;
  message: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    userId: string;
    email: string;
    username: string;
    role: UserRole;
    emailVerified: boolean;
  };
}

// Email Verification
export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

// Password Reset
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Token Refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Logout
export interface LogoutResponse {
  message: string;
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Auth Request (with authenticated user)
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}
