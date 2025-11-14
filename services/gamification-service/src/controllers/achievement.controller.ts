import { Request, Response } from 'express';
import { AchievementService } from '../services';
import { AchievementCategory } from '../models';

export class AchievementController {
  private achievementService: AchievementService;

  constructor() {
    this.achievementService = new AchievementService();
  }

  /**
   * Get all achievements
   * GET /api/v1/achievements
   */
  getAllAchievements = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeHidden = req.query.includeHidden === 'true';

      const achievements = await this.achievementService.getAllAchievements(includeHidden);

      res.status(200).json({
        achievements,
        count: achievements.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get achievement by ID
   * GET /api/v1/achievements/:achievementId
   */
  getAchievement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { achievementId } = req.params;

      const achievement = await this.achievementService.getAchievement(achievementId);

      if (!achievement) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      res.status(200).json({ achievement });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get achievements by category
   * GET /api/v1/achievements/category/:category
   */
  getAchievementsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;

      if (!Object.values(AchievementCategory).includes(category as AchievementCategory)) {
        res.status(400).json({ error: 'Invalid category' });
        return;
      }

      const achievements = await this.achievementService.getAchievementsByCategory(
        category as AchievementCategory
      );

      res.status(200).json({
        achievements,
        category,
        count: achievements.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's achievements
   * GET /api/v1/users/:userId/achievements
   */
  getUserAchievements = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const unlockedOnly = req.query.unlockedOnly === 'true';

      const achievements = await this.achievementService.getUserAchievements(userId, unlockedOnly);

      res.status(200).json({
        achievements,
        count: achievements.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get achievement progress
   * GET /api/v1/users/:userId/achievements/:achievementId/progress
   */
  getAchievementProgress = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId, achievementId } = req.params;

      const progress = await this.achievementService.getAchievementProgress(userId, achievementId);

      if (!progress) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      res.status(200).json({ progress });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's achievement statistics
   * GET /api/v1/users/:userId/achievements/stats
   */
  getUserAchievementStats = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const stats = await this.achievementService.getUserAchievementStats(userId);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
