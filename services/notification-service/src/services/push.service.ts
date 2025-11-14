import { AppDataSource } from '../config/database';
import { DeviceToken } from '../models/DeviceToken.entity';
import { Repository } from 'typeorm';

export class PushService {
  private deviceTokenRepository: Repository<DeviceToken>;

  constructor() {
    this.deviceTokenRepository = AppDataSource.getRepository(DeviceToken);
  }

  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    const devices = await this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });

    for (const device of devices) {
      try {
        // In production, use FCM for Android and APNS for iOS
        console.log(`Sending push to ${device.platform}:`, { title, message, data });

        // Placeholder for actual push notification logic
        // await this.sendToFCM(device.token, title, message, data);
        // await this.sendToAPNS(device.token, title, message, data);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }
  }

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: string,
    deviceName?: string
  ): Promise<DeviceToken> {
    // Check if token already exists
    const existing = await this.deviceTokenRepository.findOne({
      where: { token },
    });

    if (existing) {
      existing.lastUsedAt = new Date();
      return this.deviceTokenRepository.save(existing);
    }

    const deviceToken = this.deviceTokenRepository.create({
      userId,
      token,
      platform: platform as any,
      deviceName,
    });

    return this.deviceTokenRepository.save(deviceToken);
  }

  async unregisterDeviceToken(token: string): Promise<void> {
    await this.deviceTokenRepository.update({ token }, { isActive: false });
  }
}
