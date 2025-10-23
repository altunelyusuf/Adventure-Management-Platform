import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
export function initializeEmailTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth.user
        ? {
            user: config.email.auth.user,
            pass: config.email.auth.pass,
          }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<void> {
  const transporter = initializeEmailTransporter();
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Verify Your Email - Adventure Management Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Adventure Management Platform!</h1>
          </div>
          <div class="content">
            <p>Hi ${username},</p>
            <p>Thank you for registering with Adventure Management Platform. To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Adventure Management Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<void> {
  const transporter = initializeEmailTransporter();
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Reset Your Password - Adventure Management Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #FF9800;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${username},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Adventure Management Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email (after verification)
 */
export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  const transporter = initializeEmailTransporter();

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Welcome to Adventure Management Platform!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome Aboard! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${username},</p>
            <p>Your email has been verified successfully! Welcome to the Adventure Management Platform community.</p>
            <p>You can now:</p>
            <ul>
              <li>Discover and join exciting quests</li>
              <li>Create your own adventures</li>
              <li>Connect with fellow adventurers</li>
              <li>Earn XP and unlock achievements</li>
            </ul>
            <p>Get started by exploring quests near you or creating your first adventure!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Adventure Management Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}:`, error);
    // Don't throw error for welcome email - it's not critical
  }
}
