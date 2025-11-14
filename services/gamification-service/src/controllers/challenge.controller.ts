import { Request, Response } from 'express';
import { ChallengeService } from '../services';
import { ChallengeType, UserChallengeStatus } from '../models';

export class ChallengeController {
  private challengeService: ChallengeService;

  constructor() {
    this.challengeService = new ChallengeService();
  }

  /**
   * Get active challenges
   * GET /api/v1/challenges
   */
  getActiveChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const type = req.query.type as ChallengeType | undefined;

      const challenges = await this.challengeService.getActiveChallenges(type);

      res.status(200).json({
        challenges,
        count: challenges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get daily challenges
   * GET /api/v1/challenges/daily
   */
  getDailyChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const challenges = await this.challengeService.getDailyChallenges();

      res.status(200).json({
        challenges,
        count: challenges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get weekly challenges
   * GET /api/v1/challenges/weekly
   */
  getWeeklyChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const challenges = await this.challengeService.getWeeklyChallenges();

      res.status(200).json({
        challenges,
        count: challenges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get user's challenges
   * GET /api/v1/users/:userId/challenges
   */
  getUserChallenges = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const status = req.query.status as UserChallengeStatus | undefined;

      const challenges = await this.challengeService.getUserChallenges(userId, status);

      res.status(200).json({
        challenges,
        count: challenges.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get challenge statistics
   * GET /api/v1/challenges/:challengeId/stats
   */
  getChallengeStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { challengeId } = req.params;

      const stats = await this.challengeService.getChallengeStats(challengeId);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
