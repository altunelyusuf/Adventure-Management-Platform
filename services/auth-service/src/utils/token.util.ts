import crypto from 'crypto';

/**
 * Generate a secure random token
 * @param length Length of the token in bytes (default: 32)
 * @returns Hex string of the random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token using SHA256
 * @param token Token to hash
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate verification token with expiry
 * @param expiryHours Hours until expiration (default: 24)
 * @returns Object with token and expiry date
 */
export function generateVerificationToken(expiryHours: number = 24): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  return {
    token,
    hashedToken,
    expiresAt,
  };
}

/**
 * Generate password reset token with expiry
 * @param expiryHours Hours until expiration (default: 1)
 * @returns Object with token and expiry date
 */
export function generatePasswordResetToken(expiryHours: number = 1): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  return {
    token,
    hashedToken,
    expiresAt,
  };
}

/**
 * Check if a token has expired
 * @param expiryDate Expiry date to check
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}
