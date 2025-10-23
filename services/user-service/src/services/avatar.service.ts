import sharp from 'sharp';
import { config } from '../config';

export class AvatarService {
  /**
   * Process uploaded avatar image
   * Resize to multiple sizes and return URLs
   */
  async processAvatar(buffer: Buffer, userId: string): Promise<{
    avatarUrl: string;
    thumbnails: { small: string; medium: string; large: string };
  }> {
    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}`;

    // Resize to different sizes
    const sizes = config.upload.avatarSizes;

    const [smallBuffer, mediumBuffer, largeBuffer] = await Promise.all([
      sharp(buffer)
        .resize(sizes.small, sizes.small, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer(),
      sharp(buffer)
        .resize(sizes.medium, sizes.medium, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer(),
      sharp(buffer)
        .resize(sizes.large, sizes.large, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer(),
    ]);

    // In production, upload to Minio/S3
    // For now, return placeholder URLs
    const baseUrl = `/avatars/${userId}`;

    return {
      avatarUrl: `${baseUrl}/${filename}-large.jpg`,
      thumbnails: {
        small: `${baseUrl}/${filename}-small.jpg`,
        medium: `${baseUrl}/${filename}-medium.jpg`,
        large: `${baseUrl}/${filename}-large.jpg`,
      },
    };
  }

  /**
   * Validate image file
   */
  validateImage(mimetype: string, size: number): void {
    if (!config.upload.allowedMimeTypes.includes(mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`);
    }

    if (size > config.upload.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${config.upload.maxFileSize / 1024 / 1024}MB`);
    }
  }

  /**
   * Delete avatar (placeholder - implement with Minio/S3)
   */
  async deleteAvatar(userId: string): Promise<void> {
    // TODO: Implement avatar deletion from Minio/S3
    console.log(`Avatar deleted for user ${userId}`);
  }
}
