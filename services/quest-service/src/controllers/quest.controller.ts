import { Request, Response } from 'express';
import { QuestService } from '../services/quest.service';
import { QuestDifficulty, QuestStatus } from '../models/Quest.entity';

export class QuestController {
  private questService: QuestService;

  constructor() {
    this.questService = new QuestService();
  }

  createQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const quest = await this.questService.createQuest({
        ...req.body,
        creatorId: userId,
      });

      res.status(201).json({
        success: true,
        quest,
      });
    } catch (error: any) {
      console.error('Error creating quest:', error);
      res.status(500).json({ error: 'Failed to create quest', details: error.message });
    }
  };

  getQuest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;
      const requesterId = (req as any).user?.userId;

      const quest = await this.questService.getQuest(questId, requesterId);

      if (!quest) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }

      // Increment view count
      await this.questService.incrementViewCount(questId);

      res.status(200).json({ quest });
    } catch (error: any) {
      console.error('Error getting quest:', error);
      res.status(500).json({ error: 'Failed to get quest', details: error.message });
    }
  };

  getQuestBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const requesterId = (req as any).user?.userId;

      const quest = await this.questService.getQuestBySlug(slug, requesterId);

      if (!quest) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }

      await this.questService.incrementViewCount(quest.questId);

      res.status(200).json({ quest });
    } catch (error: any) {
      console.error('Error getting quest by slug:', error);
      res.status(500).json({ error: 'Failed to get quest', details: error.message });
    }
  };

  updateQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const quest = await this.questService.updateQuest(questId, userId, req.body);

      if (!quest) {
        res.status(404).json({ error: 'Quest not found or unauthorized' });
        return;
      }

      res.status(200).json({ success: true, quest });
    } catch (error: any) {
      console.error('Error updating quest:', error);
      res.status(500).json({ error: 'Failed to update quest', details: error.message });
    }
  };

  deleteQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await this.questService.deleteQuest(questId, userId);

      if (!success) {
        res.status(404).json({ error: 'Quest not found or unauthorized' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting quest:', error);
      res.status(500).json({ error: 'Failed to delete quest', details: error.message });
    }
  };

  publishQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.questService.publishQuest(questId, userId);

      if (!result.success) {
        res.status(400).json({
          error: 'Cannot publish quest',
          missingRequirements: result.errors,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quest published successfully',
      });
    } catch (error: any) {
      console.error('Error publishing quest:', error);
      res.status(500).json({ error: 'Failed to publish quest', details: error.message });
    }
  };

  unpublishQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await this.questService.unpublishQuest(questId, userId);

      if (!success) {
        res.status(404).json({ error: 'Quest not found or unauthorized' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quest unpublished successfully',
      });
    } catch (error: any) {
      console.error('Error unpublishing quest:', error);
      res.status(500).json({ error: 'Failed to unpublish quest', details: error.message });
    }
  };

  searchQuests = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        query,
        categoryId,
        difficulty,
        status,
        creatorId,
        latitude,
        longitude,
        radiusKm,
        tags,
        isPremium,
        limit = 20,
        offset = 0,
      } = req.query;

      const result = await this.questService.searchQuests({
        query: query as string,
        categoryId: categoryId as string,
        difficulty: difficulty as QuestDifficulty,
        status: status as QuestStatus,
        creatorId: creatorId as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radiusKm: radiusKm ? parseFloat(radiusKm as string) : undefined,
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        isPremium: isPremium === 'true',
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      });

      res.status(200).json({
        quests: result.quests,
        total: result.total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      });
    } catch (error: any) {
      console.error('Error searching quests:', error);
      res.status(500).json({ error: 'Failed to search quests', details: error.message });
    }
  };

  getMyQuests = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { status } = req.query;

      const quests = await this.questService.getCreatorQuests(
        userId,
        status as QuestStatus
      );

      res.status(200).json({ quests, count: quests.length });
    } catch (error: any) {
      console.error('Error getting my quests:', error);
      res.status(500).json({ error: 'Failed to get quests', details: error.message });
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.questService.getAllCategories();

      res.status(200).json({ categories, count: categories.length });
    } catch (error: any) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Failed to get categories', details: error.message });
    }
  };

  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: 'healthy', service: 'quest-service' });
  };
}
