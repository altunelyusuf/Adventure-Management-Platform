import { Router } from 'express';
import { MediaController } from '../controllers/media.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const mediaController = new MediaController();

// Upload image
router.post('/upload', upload.single('file'), mediaController.uploadImage);

// Get asset
router.get('/assets/:assetId', mediaController.getAsset);

// Get user assets
router.get('/users/:userId/assets', mediaController.getUserAssets);

// Update asset
router.put('/assets/:assetId', mediaController.updateAsset);

// Delete asset
router.delete('/assets/:assetId', mediaController.deleteAsset);

// Get storage stats
router.get('/users/:userId/stats', mediaController.getStorageStats);

// Get assets by category
router.get('/categories/:category/assets', mediaController.getAssetsByCategory);

// Health check
router.get('/health', mediaController.healthCheck);

export default router;
