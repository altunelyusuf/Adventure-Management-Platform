import { Request, Response } from 'express';
import { LeaderboardService } from '../services';
import { LeaderboardType } from '../models';

export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  /**
   * Get leaderboard entries
   * GET /api/v1/leaderboards/:leaderboardId
   */
  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leaderboardId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const leaderboard = await this.leaderboardService.getLeaderboard(leaderboardId);

      if (!leaderboard) {
        res.status(404).json({ error: 'Leaderboard not found' });
        return;
      }

      const entries = await this.leaderboardService.getLeaderboardEntries(
        leaderboardId,
        limit,
        offset
      );

      res.status(200).json({
        leaderboard,
        entries,
        count: entries.length,
        limit,
        offset,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get leaderboard by type
   * GET /api/v1/leaderboards/type/:type
   */
  getLeaderboardByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const categoryId = req.query.categoryId as string;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!Object.values(LeaderboardType).includes(type as LeaderboardType)) {
        res.status(400).json({ error: 'Invalid leaderboard type' });
        return;
      }

      const leaderboard = await this.leaderboardService.getLeaderboardByType(
        type as LeaderboardType,
        categoryId
      );

      if (!leaderboard) {
        res.status(404).json({ error: 'Leaderboard not found' });
        return;
      }

      const entries = await this.leaderboardService.getLeaderboardEntries(
        leaderboard.leaderboardId,
        limit
      );

      res.status(200).json({
        leaderboard,
        entries,
        count: entries.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's rank in leaderboard
   * GET /api/v1/leaderboards/:leaderboardId/users/:userId
   */
  getUserRank = async (req: any, res: Response): Promise<void> => {
    try {
      const { leaderboardId, userId } = req.params;

      const entry = await this.leaderboardService.getUserRank(leaderboardId, userId);

      if (!entry) {
        res.status(404).json({ error: 'User not ranked in this leaderboard' });
        return;
      }

      res.status(200).json({ entry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get surrounding entries around user's rank
   * GET /api/v1/leaderboards/:leaderboardId/users/:userId/surrounding
   */
  getSurroundingEntries = async (req: any, res: Response): Promise<void> => {
    try {
      const { leaderboardId, userId } = req.params;
      const range = parseInt(req.query.range as string) || 5;

      const result = await this.leaderboardService.getSurroundingEntries(
        leaderboardId,
        userId,
        range
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
