import { Request, Response } from 'express';
import { BadgeService } from '../services';
import { BadgeTier } from '../models';

export class BadgeController {
  private badgeService: BadgeService;

  constructor() {
    this.badgeService = new BadgeService();
  }

  /**
   * Get all badges
   * GET /api/v1/badges
   */
  getAllBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const badges = await this.badgeService.getAllBadges();

      res.status(200).json({
        badges,
        count: badges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get badge by ID
   * GET /api/v1/badges/:badgeId
   */
  getBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { badgeId } = req.params;

      const badge = await this.badgeService.getBadge(badgeId);

      if (!badge) {
        res.status(404).json({ error: 'Badge not found' });
        return;
      }

      res.status(200).json({ badge });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get badges by tier
   * GET /api/v1/badges/tier/:tier
   */
  getBadgesByTier = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tier } = req.params;

      if (!Object.values(BadgeTier).includes(tier as BadgeTier)) {
        res.status(400).json({ error: 'Invalid tier' });
        return;
      }

      const badges = await this.badgeService.getBadgesByTier(tier as BadgeTier);

      res.status(200).json({
        badges,
        tier,
        count: badges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's badges
   * GET /api/v1/users/:userId/badges
   */
  getUserBadges = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const badges = await this.badgeService.getUserBadges(userId);

      res.status(200).json({
        badges,
        count: badges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's badge collection statistics
   * GET /api/v1/users/:userId/badges/stats
   */
  getUserBadgeStats = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const stats = await this.badgeService.getUserBadgeStats(userId);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get rarest badges
   * GET /api/v1/badges/rarest
   */
  getRarestBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const badges = await this.badgeService.getRarestBadges(limit);

      res.status(200).json({
        badges,
        count: badges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
