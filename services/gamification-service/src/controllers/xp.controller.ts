import { Request, Response } from 'express';
import { XPService, AwardXPDTO } from '../services';
import { XPSource } from '../models';

export class XPController {
  private xpService: XPService;

  constructor() {
    this.xpService = new XPService();
  }

  /**
   * Award XP to user
   * POST /api/v1/xp/award
   */
  awardXP = async (req: any, res: Response): Promise<void> => {
    try {
      const { source, sourceId, amount, bonusMultiplier, metadata }: AwardXPDTO = req.body;

      if (!source || amount === undefined) {
        res.status(400).json({ error: 'Source and amount are required' });
        return;
      }

      const result = await this.xpService.awardXP({
        userId: req.user?.userId || req.body.userId,
        source,
        sourceId,
        amount,
        bonusMultiplier,
        metadata,
      });

      res.status(201).json({
        success: true,
        transaction: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's XP summary
   * GET /api/v1/users/:userId/xp
   */
  getUserXP = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Authorization check: users can only view their own XP unless admin
      if (userId !== req.user?.userId && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const xpSummary = await this.xpService.getUserXP(userId);

      if (!xpSummary) {
        res.status(404).json({ error: 'User XP not found' });
        return;
      }

      res.status(200).json({ xp: xpSummary });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's XP transaction history
   * GET /api/v1/users/:userId/xp/history
   */
  getUserXPHistory = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // Authorization check
      if (userId !== req.user?.userId && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const result = await this.xpService.getUserXPHistory(userId, limit, offset);

      res.status(200).json({
        transactions: result.transactions,
        total: result.total,
        limit,
        offset,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get XP leaderboard
   * GET /api/v1/xp/leaderboard
   */
  getXPLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const timeframe = (req.query.timeframe as 'all' | 'week' | 'month') || 'all';

      const leaderboard = await this.xpService.getXPLeaderboard(limit, timeframe);

      res.status(200).json({
        leaderboard,
        timeframe,
        limit,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Calculate level from XP (utility endpoint)
   * GET /api/v1/xp/calculate-level
   */
  calculateLevel = async (req: Request, res: Response): Promise<void> => {
    try {
      const xp = parseInt(req.query.xp as string) || 0;

      const level = this.xpService.calculateLevel(xp);
      const xpForLevel = this.xpService.calculateXPForLevel(level);
      const xpForNextLevel = this.xpService.calculateXPForLevel(level + 1);

      res.status(200).json({
        xp,
        level,
        xpForCurrentLevel: xpForLevel,
        xpForNextLevel,
        xpToNextLevel: xpForNextLevel - xp,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
