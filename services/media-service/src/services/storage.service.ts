import fs from 'fs/promises';
import path from 'path';
import { S3 } from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  fileName: string;
  storagePath: string;
  publicUrl: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export class StorageService {
  private storageType: string;
  private uploadDir: string;
  private cdnUrl: string;
  private s3?: S3;
  private s3Bucket?: string;

  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local';
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.cdnUrl = process.env.CDN_URL || `http://localhost:${process.env.PORT}/uploads`;

    if (this.storageType === 's3') {
      this.s3 = new S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
      this.s3Bucket = process.env.S3_BUCKET;
    }
  }

  async uploadImage(
    buffer: Buffer,
    originalName: string,
    category: string
  ): Promise<UploadResult> {
    const fileExt = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExt}`;
    const categoryPath = path.join(category, new Date().toISOString().split('T')[0]);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const fileSize = buffer.length;

    if (this.storageType === 's3') {
      return this.uploadToS3(buffer, fileName, categoryPath, metadata);
    } else {
      return this.uploadToLocal(buffer, fileName, categoryPath, metadata);
    }
  }

  private async uploadToLocal(
    buffer: Buffer,
    fileName: string,
    categoryPath: string,
    metadata: sharp.Metadata
  ): Promise<UploadResult> {
    const fullPath = path.join(this.uploadDir, categoryPath);
    await fs.mkdir(fullPath, { recursive: true });

    const filePath = path.join(fullPath, fileName);
    const thumbnailPath = path.join(fullPath, `thumb_${fileName}`);
    const mediumPath = path.join(fullPath, `medium_${fileName}`);
    const largePath = path.join(fullPath, `large_${fileName}`);

    // Original
    await sharp(buffer)
      .jpeg({ quality: parseInt(process.env.IMAGE_QUALITY || '85') })
      .toFile(filePath);

    // Thumbnail
    await sharp(buffer)
      .resize(parseInt(process.env.THUMBNAIL_SIZE || '200'), null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Medium
    await sharp(buffer)
      .resize(parseInt(process.env.MEDIUM_SIZE || '800'), null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);

    // Large
    await sharp(buffer)
      .resize(parseInt(process.env.LARGE_SIZE || '1920'), null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toFile(largePath);

    const stat = await fs.stat(filePath);

    return {
      fileName,
      storagePath: path.join(categoryPath, fileName),
      publicUrl: `${this.cdnUrl}/${categoryPath}/${fileName}`,
      thumbnailUrl: `${this.cdnUrl}/${categoryPath}/thumb_${fileName}`,
      mediumUrl: `${this.cdnUrl}/${categoryPath}/medium_${fileName}`,
      largeUrl: `${this.cdnUrl}/${categoryPath}/large_${fileName}`,
      fileSize: stat.size,
      width: metadata.width,
      height: metadata.height,
    };
  }

  private async uploadToS3(
    buffer: Buffer,
    fileName: string,
    categoryPath: string,
    metadata: sharp.Metadata
  ): Promise<UploadResult> {
    if (!this.s3 || !this.s3Bucket) {
      throw new Error('S3 not configured');
    }

    const s3Key = path.join(categoryPath, fileName);
    const thumbnailKey = path.join(categoryPath, `thumb_${fileName}`);
    const mediumKey = path.join(categoryPath, `medium_${fileName}`);
    const largeKey = path.join(categoryPath, `large_${fileName}`);

    // Upload original
    const originalBuffer = await sharp(buffer)
      .jpeg({ quality: parseInt(process.env.IMAGE_QUALITY || '85') })
      .toBuffer();

    await this.s3.putObject({
      Bucket: this.s3Bucket,
      Key: s3Key,
      Body: originalBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    // Upload thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(parseInt(process.env.THUMBNAIL_SIZE || '200'), null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    await this.s3.putObject({
      Bucket: this.s3Bucket,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    // Upload medium
    const mediumBuffer = await sharp(buffer)
      .resize(parseInt(process.env.MEDIUM_SIZE || '800'), null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    await this.s3.putObject({
      Bucket: this.s3Bucket,
      Key: mediumKey,
      Body: mediumBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    // Upload large
    const largeBuffer = await sharp(buffer)
      .resize(parseInt(process.env.LARGE_SIZE || '1920'), null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    await this.s3.putObject({
      Bucket: this.s3Bucket,
      Key: largeKey,
      Body: largeBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    const baseUrl = process.env.S3_BUCKET_URL || `https://${this.s3Bucket}.s3.amazonaws.com`;

    return {
      fileName,
      storagePath: s3Key,
      publicUrl: `${baseUrl}/${s3Key}`,
      thumbnailUrl: `${baseUrl}/${thumbnailKey}`,
      mediumUrl: `${baseUrl}/${mediumKey}`,
      largeUrl: `${baseUrl}/${largeKey}`,
      fileSize: originalBuffer.length,
      width: metadata.width,
      height: metadata.height,
    };
  }

  async deleteFile(storagePath: string): Promise<void> {
    if (this.storageType === 's3') {
      if (!this.s3 || !this.s3Bucket) {
        throw new Error('S3 not configured');
      }
      await this.s3.deleteObject({
        Bucket: this.s3Bucket,
        Key: storagePath,
      }).promise();

      // Delete variants
      const dir = path.dirname(storagePath);
      const file = path.basename(storagePath);
      await this.s3.deleteObject({ Bucket: this.s3Bucket, Key: path.join(dir, `thumb_${file}`) }).promise();
      await this.s3.deleteObject({ Bucket: this.s3Bucket, Key: path.join(dir, `medium_${file}`) }).promise();
      await this.s3.deleteObject({ Bucket: this.s3Bucket, Key: path.join(dir, `large_${file}`) }).promise();
    } else {
      const filePath = path.join(this.uploadDir, storagePath);
      await fs.unlink(filePath).catch(() => {}); // Ignore errors

      // Delete variants
      const dir = path.dirname(filePath);
      const file = path.basename(filePath);
      await fs.unlink(path.join(dir, `thumb_${file}`)).catch(() => {});
      await fs.unlink(path.join(dir, `medium_${file}`)).catch(() => {});
      await fs.unlink(path.join(dir, `large_${file}`)).catch(() => {});
    }
  }
}
