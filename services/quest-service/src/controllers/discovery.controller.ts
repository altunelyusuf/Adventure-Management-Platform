import { Response } from 'express';
import { BookmarkService } from '../services/bookmark.service';
import { AnalyticsService } from '../services/analytics.service';
import { RecommendationService } from '../services/recommendation.service';
import { AnalyticsEventType } from '../models/QuestAnalytics.entity';

export class DiscoveryController {
  private bookmarkService: BookmarkService;
  private analyticsService: AnalyticsService;
  private recommendationService: RecommendationService;

  constructor() {
    this.bookmarkService = new BookmarkService();
    this.analyticsService = new AnalyticsService();
    this.recommendationService = new RecommendationService();
  }

  // Bookmark endpoints
  addBookmark = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { questId } = req.params;
      const { notes } = req.body;

      const bookmark = await this.bookmarkService.addBookmark(userId, questId, notes);

      // Track analytics event
      await this.analyticsService.trackEvent(questId, AnalyticsEventType.BOOKMARK, userId);

      res.status(201).json({
        success: true,
        bookmark,
      });
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      res.status(500).json({ error: 'Failed to add bookmark', details: error.message });
    }
  };

  removeBookmark = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { questId } = req.params;

      const success = await this.bookmarkService.removeBookmark(userId, questId);

      if (!success) {
        res.status(404).json({ error: 'Bookmark not found' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      res.status(500).json({ error: 'Failed to remove bookmark', details: error.message });
    }
  };

  getMyBookmarks = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const bookmarks = await this.bookmarkService.getUserBookmarks(userId);

      res.status(200).json({
        bookmarks,
        count: bookmarks.length,
      });
    } catch (error: any) {
      console.error('Error getting bookmarks:', error);
      res.status(500).json({ error: 'Failed to get bookmarks', details: error.message });
    }
  };

  // Featured & Trending endpoints
  getFeaturedQuests = async (req: any, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;

      const quests = await this.analyticsService.getFeaturedQuests(parseInt(limit as string, 10));

      res.status(200).json({
        quests,
        count: quests.length,
      });
    } catch (error: any) {
      console.error('Error getting featured quests:', error);
      res.status(500).json({ error: 'Failed to get featured quests', details: error.message });
    }
  };

  getTrendingQuests = async (req: any, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;

      const quests = await this.analyticsService.getTrendingQuests(parseInt(limit as string, 10));

      res.status(200).json({
        quests,
        count: quests.length,
      });
    } catch (error: any) {
      console.error('Error getting trending quests:', error);
      res.status(500).json({ error: 'Failed to get trending quests', details: error.message });
    }
  };

  // Recommendation endpoints
  getRecommendations = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { limit = 10 } = req.query;

      const quests = await this.recommendationService.getPersonalizedRecommendations(
        userId,
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        quests,
        count: quests.length,
      });
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
    }
  };

  getSimilarQuests = async (req: any, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;
      const { limit = 5 } = req.query;

      const quests = await this.recommendationService.getSimilarQuests(
        questId,
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        quests,
        count: quests.length,
      });
    } catch (error: any) {
      console.error('Error getting similar quests:', error);
      res.status(500).json({ error: 'Failed to get similar quests', details: error.message });
    }
  };

  getNearbyQuests = async (req: any, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, radiusKm = 50, limit = 10 } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({ error: 'Latitude and longitude are required' });
        return;
      }

      const quests = await this.recommendationService.getQuestsNearby(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radiusKm as string),
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        quests,
        count: quests.length,
      });
    } catch (error: any) {
      console.error('Error getting nearby quests:', error);
      res.status(500).json({ error: 'Failed to get nearby quests', details: error.message });
    }
  };

  getForYou = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { limit = 20 } = req.query;

      const recommendations = await this.recommendationService.getQuestsForYou(
        userId,
        parseInt(limit as string, 10)
      );

      res.status(200).json(recommendations);
    } catch (error: any) {
      console.error('Error getting for you quests:', error);
      res.status(500).json({ error: 'Failed to get personalized quests', details: error.message });
    }
  };

  // Analytics endpoints
  getQuestAnalytics = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { questId } = req.params;
      const { days = 30 } = req.query;

      const analytics = await this.analyticsService.getQuestAnalytics(
        questId,
        parseInt(days as string, 10)
      );

      res.status(200).json({ analytics });
    } catch (error: any) {
      console.error('Error getting quest analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics', details: error.message });
    }
  };

  getCreatorAnalytics = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { days = 30 } = req.query;

      const analytics = await this.analyticsService.getCreatorAnalytics(
        userId,
        parseInt(days as string, 10)
      );

      res.status(200).json({ analytics });
    } catch (error: any) {
      console.error('Error getting creator analytics:', error);
      res.status(500).json({ error: 'Failed to get creator analytics', details: error.message });
    }
  };
}
