import { Response } from 'express';
import { FeedService } from '../services';

export class FeedController {
  private feedService: FeedService;

  constructor() {
    this.feedService = new FeedService();
  }

  getPersonalFeed = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await this.feedService.getPersonalFeed(userId, limit, offset);

      res.status(200).json({ activities, count: activities.length, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getFriendFeed = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await this.feedService.getFriendFeed(userId, limit, offset);

      res.status(200).json({ activities, count: activities.length, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getCombinedFeed = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await this.feedService.getCombinedFeed(userId, limit, offset);

      res.status(200).json({ activities, count: activities.length, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getGlobalFeed = async (req: any, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await this.feedService.getGlobalFeed(limit, offset);

      res.status(200).json({ activities, count: activities.length, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getTrendingActivities = async (req: any, res: Response): Promise<void> => {
    try {
      const hoursAgo = parseInt(req.query.hoursAgo as string) || 24;
      const limit = parseInt(req.query.limit as string) || 20;

      const activities = await this.feedService.getTrendingActivities(hoursAgo, limit);

      res.status(200).json({ activities, count: activities.length, hoursAgo, limit });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
