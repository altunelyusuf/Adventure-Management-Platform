import { AppDataSource } from '../config/database';
import { MediaAsset, AssetType, AssetCategory, ProcessingStatus } from '../models/MediaAsset.entity';
import { StorageService } from './storage.service';

export class MediaService {
  private mediaRepository = AppDataSource.getRepository(MediaAsset);
  private storageService = new StorageService();

  async uploadImage(
    userId: string,
    file: Express.Multer.File,
    category: AssetCategory,
    metadata?: Record<string, any>
  ): Promise<MediaAsset> {
    try {
      const uploadResult = await this.storageService.uploadImage(
        file.buffer,
        file.originalname,
        category
      );

      const mediaAsset = this.mediaRepository.create({
        userId,
        assetType: AssetType.IMAGE,
        category,
        fileName: uploadResult.fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: uploadResult.fileSize,
        storagePath: uploadResult.storagePath,
        publicUrl: uploadResult.publicUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        mediumUrl: uploadResult.mediumUrl,
        largeUrl: uploadResult.largeUrl,
        width: uploadResult.width,
        height: uploadResult.height,
        processingStatus: ProcessingStatus.COMPLETED,
        metadata,
        isPublic: true,
      });

      return await this.mediaRepository.save(mediaAsset);
    } catch (error: any) {
      // Create failed asset record
      const failedAsset = this.mediaRepository.create({
        userId,
        assetType: AssetType.IMAGE,
        category,
        fileName: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: '',
        publicUrl: '',
        processingStatus: ProcessingStatus.FAILED,
        processingError: error.message,
      });

      await this.mediaRepository.save(failedAsset);
      throw error;
    }
  }

  async getAsset(assetId: string): Promise<MediaAsset | null> {
    return await this.mediaRepository.findOne({
      where: { assetId, deletedAt: null as any },
    });
  }

  async getUserAssets(userId: string, category?: AssetCategory): Promise<MediaAsset[]> {
    const where: any = { userId, deletedAt: null as any };
    if (category) {
      where.category = category;
    }

    return await this.mediaRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async deleteAsset(assetId: string, userId: string): Promise<boolean> {
    const asset = await this.mediaRepository.findOne({
      where: { assetId, userId, deletedAt: null as any },
    });

    if (!asset) {
      return false;
    }

    // Soft delete
    asset.deletedAt = new Date();
    await this.mediaRepository.save(asset);

    // Delete from storage (async)
    this.storageService.deleteFile(asset.storagePath).catch((err) => {
      console.error(`Failed to delete file ${asset.storagePath}:`, err);
    });

    return true;
  }

  async updateAsset(
    assetId: string,
    userId: string,
    updates: Partial<Pick<MediaAsset, 'altText' | 'description' | 'isPublic' | 'metadata'>>
  ): Promise<MediaAsset | null> {
    const asset = await this.mediaRepository.findOne({
      where: { assetId, userId, deletedAt: null as any },
    });

    if (!asset) {
      return null;
    }

    Object.assign(asset, updates);
    return await this.mediaRepository.save(asset);
  }

  async incrementDownloadCount(assetId: string): Promise<void> {
    await this.mediaRepository.increment({ assetId }, 'downloadCount', 1);
  }

  async getAssetsByCategory(category: AssetCategory, limit: number = 20): Promise<MediaAsset[]> {
    return await this.mediaRepository.find({
      where: { category, isPublic: true, deletedAt: null as any },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStorageStats(userId: string): Promise<{
    totalAssets: number;
    totalSize: number;
    assetsByType: Record<string, number>;
  }> {
    const assets = await this.mediaRepository.find({
      where: { userId, deletedAt: null as any },
    });

    const totalSize = assets.reduce((sum, asset) => sum + Number(asset.fileSize), 0);
    const assetsByType: Record<string, number> = {};

    assets.forEach((asset) => {
      assetsByType[asset.assetType] = (assetsByType[asset.assetType] || 0) + 1;
    });

    return {
      totalAssets: assets.length,
      totalSize,
      assetsByType,
    };
  }
}
