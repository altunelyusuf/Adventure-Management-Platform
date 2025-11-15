import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';
import { AssetCategory } from '../models/MediaAsset.entity';

export class MediaController {
  private mediaService = new MediaService();

  uploadImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.body.userId || 'system'; // Should come from auth middleware
      const category = (req.body.category || AssetCategory.USER_CONTENT) as AssetCategory;
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : undefined;

      const asset = await this.mediaService.uploadImage(userId, req.file, category, metadata);

      res.status(201).json({
        message: 'Image uploaded successfully',
        asset: {
          assetId: asset.assetId,
          publicUrl: asset.publicUrl,
          thumbnailUrl: asset.thumbnailUrl,
          mediumUrl: asset.mediumUrl,
          largeUrl: asset.largeUrl,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        },
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  };

  getAsset = async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const asset = await this.mediaService.getAsset(assetId);

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({ asset });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get asset' });
    }
  };

  getUserAssets = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const category = req.query.category as AssetCategory | undefined;

      const assets = await this.mediaService.getUserAssets(userId, category);

      res.json({ assets, count: assets.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get user assets' });
    }
  };

  deleteAsset = async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const userId = req.body.userId || 'system'; // Should come from auth middleware

      const deleted = await this.mediaService.deleteAsset(assetId, userId);

      if (!deleted) {
        return res.status(404).json({ error: 'Asset not found or unauthorized' });
      }

      res.json({ message: 'Asset deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete asset' });
    }
  };

  updateAsset = async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const userId = req.body.userId || 'system';
      const updates = {
        altText: req.body.altText,
        description: req.body.description,
        isPublic: req.body.isPublic,
        metadata: req.body.metadata,
      };

      const asset = await this.mediaService.updateAsset(assetId, userId, updates);

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found or unauthorized' });
      }

      res.json({ message: 'Asset updated successfully', asset });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update asset' });
    }
  };

  getStorageStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const stats = await this.mediaService.getStorageStats(userId);

      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get storage stats' });
    }
  };

  getAssetsByCategory = async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const assets = await this.mediaService.getAssetsByCategory(category as AssetCategory, limit);

      res.json({ assets, count: assets.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get assets by category' });
    }
  };

  healthCheck = async (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'media-service', timestamp: new Date().toISOString() });
  };
}
