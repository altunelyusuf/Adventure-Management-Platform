import { Response } from 'express';
import { CheckpointService } from '../services/checkpoint.service';

export class CheckpointController {
  private checkpointService: CheckpointService;

  constructor() {
    this.checkpointService = new CheckpointService();
  }

  createCheckpoint = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { questId } = req.params;

      const checkpoint = await this.checkpointService.createCheckpoint(
        { ...req.body, questId },
        userId
      );

      if (!checkpoint) {
        res.status(404).json({ error: 'Quest not found or unauthorized' });
        return;
      }

      res.status(201).json({
        success: true,
        checkpoint,
      });
    } catch (error: any) {
      console.error('Error creating checkpoint:', error);
      res.status(500).json({ error: 'Failed to create checkpoint', details: error.message });
    }
  };

  getCheckpoint = async (req: any, res: Response): Promise<void> => {
    try {
      const { checkpointId } = req.params;

      const checkpoint = await this.checkpointService.getCheckpoint(checkpointId);

      if (!checkpoint) {
        res.status(404).json({ error: 'Checkpoint not found' });
        return;
      }

      res.status(200).json({ checkpoint });
    } catch (error: any) {
      console.error('Error getting checkpoint:', error);
      res.status(500).json({ error: 'Failed to get checkpoint', details: error.message });
    }
  };

  getQuestCheckpoints = async (req: any, res: Response): Promise<void> => {
    try {
      const { questId } = req.params;

      const checkpoints = await this.checkpointService.getQuestCheckpoints(questId);

      res.status(200).json({
        checkpoints,
        totalCount: checkpoints.length,
      });
    } catch (error: any) {
      console.error('Error getting quest checkpoints:', error);
      res.status(500).json({ error: 'Failed to get checkpoints', details: error.message });
    }
  };

  updateCheckpoint = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { checkpointId } = req.params;

      const checkpoint = await this.checkpointService.updateCheckpoint(
        checkpointId,
        req.body,
        userId
      );

      if (!checkpoint) {
        res.status(404).json({ error: 'Checkpoint not found or unauthorized' });
        return;
      }

      res.status(200).json({ success: true, checkpoint });
    } catch (error: any) {
      console.error('Error updating checkpoint:', error);
      res.status(500).json({ error: 'Failed to update checkpoint', details: error.message });
    }
  };

  deleteCheckpoint = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { checkpointId } = req.params;

      const success = await this.checkpointService.deleteCheckpoint(checkpointId, userId);

      if (!success) {
        res.status(404).json({ error: 'Checkpoint not found or unauthorized' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting checkpoint:', error);
      res.status(500).json({ error: 'Failed to delete checkpoint', details: error.message });
    }
  };

  reorderCheckpoints = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { questId } = req.params;
      const { checkpointOrders } = req.body;

      if (!Array.isArray(checkpointOrders)) {
        res.status(400).json({ error: 'checkpointOrders must be an array' });
        return;
      }

      const success = await this.checkpointService.reorderCheckpoints(
        questId,
        checkpointOrders,
        userId
      );

      if (!success) {
        res.status(404).json({ error: 'Quest not found or unauthorized' });
        return;
      }

      res.status(200).json({ success: true, message: 'Checkpoints reordered successfully' });
    } catch (error: any) {
      console.error('Error reordering checkpoints:', error);
      res.status(500).json({ error: 'Failed to reorder checkpoints', details: error.message });
    }
  };
}
