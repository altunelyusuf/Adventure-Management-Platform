import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();
const profileController = new ProfileController();

// Note: authenticate middleware should be added from auth service integration

// Public routes
router.get('/search', profileController.searchProfiles);
router.get('/username/:username', profileController.getProfileByUsername);
router.get('/:userId', profileController.getProfile);

// Protected routes (require authentication - add middleware in production)
router.get('/me', profileController.getMyProfile); // Needs: authenticate
router.put('/:userId', profileController.updateProfile); // Needs: authenticate
router.post('/:userId/avatar', profileController.uploadMiddleware, profileController.uploadAvatar); // Needs: authenticate

// Preferences (protected)
router.get('/:userId/preferences', profileController.getPreferences); // Needs: authenticate
router.put('/:userId/preferences', profileController.updatePreferences); // Needs: authenticate

// Privacy settings (protected)
router.get('/:userId/privacy', profileController.getPrivacySettings); // Needs: authenticate
router.put('/:userId/privacy', profileController.updatePrivacySettings); // Needs: authenticate

// Health check
router.get('/health', profileController.healthCheck);

export default router;
