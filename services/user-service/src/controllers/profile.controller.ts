import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { AvatarService } from '../services/avatar.service';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export class ProfileController {
  private profileService: ProfileService;
  private avatarService: AvatarService;

  constructor() {
    this.profileService = new ProfileService();
    this.avatarService = new AvatarService();
  }

  // Multer middleware for avatar upload
  uploadMiddleware = upload.single('avatar');

  /**
   * GET /api/v1/profiles/:userId
   */
  getProfile = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      const profile = await this.profileService.getProfile(userId, requesterId);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/v1/profiles/username/:username
   */
  getProfileByUsername = async (req: any, res: Response) => {
    try {
      const { username } = req.params;
      const requesterId = req.user?.userId;

      const profile = await this.profileService.getProfileByUsername(username, requesterId);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/v1/profiles/me
   */
  getMyProfile = async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await this.profileService.getProfile(userId);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * PUT /api/v1/profiles/:userId
   */
  updateProfile = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      // Only allow users to update their own profile
      if (userId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const profile = await this.profileService.updateProfile(userId, req.body);

      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * POST /api/v1/profiles/:userId/avatar
   */
  uploadAvatar = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      if (userId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate image
      this.avatarService.validateImage(req.file.mimetype, req.file.size);

      // Process avatar
      const { avatarUrl, thumbnails } = await this.avatarService.processAvatar(
        req.file.buffer,
        userId
      );

      // Update profile
      const profile = await this.profileService.updateAvatar(userId, avatarUrl, thumbnails);

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl: profile.avatarUrl,
        thumbnails: profile.avatarThumbnails,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/v1/profiles/search
   */
  searchProfiles = async (req: Request, res: Response) => {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const profiles = await this.profileService.searchProfiles(
        q as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.status(200).json({
        count: profiles.length,
        profiles,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/v1/profiles/:userId/preferences
   */
  getPreferences = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      if (userId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const preferences = await this.profileService.getPreferences(userId);

      res.status(200).json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * PUT /api/v1/profiles/:userId/preferences
   */
  updatePreferences = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      if (userId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const preferences = await this.profileService.updatePreferences(userId, req.body);

      res.status(200).json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/v1/profiles/:userId/privacy
   */
  getPrivacySettings = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      if (userId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const privacy = await this.profileService.getPrivacySettings(userId);

      res.status(200).json(privacy);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * PUT /api/v1/profiles/:userId/privacy
   */
  updatePrivacySettings = async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.userId;

      if (userId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const privacy = await this.profileService.updatePrivacySettings(userId, req.body);

      res.status(200).json(privacy);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /health
   */
  healthCheck = async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    });
  };
}
