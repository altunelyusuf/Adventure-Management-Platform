import nodemailer from 'nodemailer';
import config from '../config';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? {
            user: config.smtp.user,
            pass: config.smtp.password,
          }
        : undefined,
    });
  }

  async sendNotificationEmail(userId: string, subject: string, message: string): Promise<void> {
    // In production, fetch user email from user service
    const userEmail = `user-${userId}@example.com`;

    await this.transporter.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.from}>`,
      to: userEmail,
      subject,
      html: this.generateEmailTemplate(subject, message),
    });
  }

  async sendBulkEmail(recipients: string[], subject: string, message: string): Promise<void> {
    for (const email of recipients) {
      try {
        await this.transporter.sendMail({
          from: `"${config.smtp.fromName}" <${config.smtp.from}>`,
          to: email,
          subject,
          html: this.generateEmailTemplate(subject, message),
        });
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
      }
    }
  }

  private generateEmailTemplate(title: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${message}</p>
            </div>
            <div class="footer">
              <p>Adventure Platform | <a href="#">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
