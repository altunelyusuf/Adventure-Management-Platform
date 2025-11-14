import { Request, Response } from 'express';
import { StreakService } from '../services';
import { StreakType } from '../models';

export class StreakController {
  private streakService: StreakService;

  constructor() {
    this.streakService = new StreakService();
  }

  /**
   * Get user's streak
   * GET /api/v1/users/:userId/streaks/:type
   */
  getUserStreak = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId, type } = req.params;

      if (!Object.values(StreakType).includes(type as StreakType)) {
        res.status(400).json({ error: 'Invalid streak type' });
        return;
      }

      const streak = await this.streakService.getUserStreak(userId, type as StreakType);

      if (!streak) {
        res.status(404).json({ error: 'Streak not found' });
        return;
      }

      res.status(200).json({ streak });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's all streaks
   * GET /api/v1/users/:userId/streaks
   */
  getUserStreaks = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const streaks = await this.streakService.getUserStreaks(userId);

      res.status(200).json({
        streaks,
        count: streaks.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get streak statistics
   * GET /api/v1/users/:userId/streaks/:type/stats
   */
  getStreakStats = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId, type } = req.params;

      if (!Object.values(StreakType).includes(type as StreakType)) {
        res.status(400).json({ error: 'Invalid streak type' });
        return;
      }

      const stats = await this.streakService.getStreakStats(userId, type as StreakType);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Freeze streak
   * POST /api/v1/users/:userId/streaks/:type/freeze
   */
  freezeStreak = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId, type } = req.params;
      const { durationDays } = req.body;

      // Authorization check
      if (userId !== req.user?.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (!Object.values(StreakType).includes(type as StreakType)) {
        res.status(400).json({ error: 'Invalid streak type' });
        return;
      }

      const streak = await this.streakService.freezeStreak(
        userId,
        type as StreakType,
        durationDays || 1
      );

      if (!streak) {
        res.status(404).json({ error: 'Streak not found' });
        return;
      }

      res.status(200).json({
        success: true,
        streak,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get streak leaderboard
   * GET /api/v1/streaks/:type/leaderboard
   */
  getStreakLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!Object.values(StreakType).includes(type as StreakType)) {
        res.status(400).json({ error: 'Invalid streak type' });
        return;
      }

      const leaderboard = await this.streakService.getStreakLeaderboard(
        type as StreakType,
        limit
      );

      res.status(200).json({
        leaderboard,
        type,
        count: leaderboard.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
