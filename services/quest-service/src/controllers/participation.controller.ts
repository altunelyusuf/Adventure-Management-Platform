import { Response } from 'express';
import { ParticipationService } from '../services/participation.service';
import { ParticipationStatus } from '../models/QuestParticipation.entity';

export class ParticipationController {
  private participationService: ParticipationService;

  constructor() {
    this.participationService = new ParticipationService();
  }

  startQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { questId } = req.params;

      const participation = await this.participationService.startQuest({
        questId,
        userId,
      });

      if (!participation) {
        res.status(404).json({ error: 'Quest not found or not published' });
        return;
      }

      res.status(201).json({
        success: true,
        participation,
      });
    } catch (error: any) {
      console.error('Error starting quest:', error);
      res.status(500).json({ error: 'Failed to start quest', details: error.message });
    }
  };

  getParticipation = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { participationId } = req.params;

      const participation = await this.participationService.getParticipation(participationId, userId);

      if (!participation) {
        res.status(404).json({ error: 'Participation not found' });
        return;
      }

      res.status(200).json({ participation });
    } catch (error: any) {
      console.error('Error getting participation:', error);
      res.status(500).json({ error: 'Failed to get participation', details: error.message });
    }
  };

  getMyParticipations = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { status } = req.query;

      const participations = await this.participationService.getUserParticipations(
        userId,
        status as ParticipationStatus
      );

      res.status(200).json({
        participations,
        count: participations.length,
      });
    } catch (error: any) {
      console.error('Error getting participations:', error);
      res.status(500).json({ error: 'Failed to get participations', details: error.message });
    }
  };

  completeCheckpoint = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { participationId, checkpointId } = req.params;

      const result = await this.participationService.completeCheckpoint(
        {
          participationId,
          checkpointId,
          ...req.body,
        },
        userId
      );

      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Checkpoint completed successfully',
        completion: result.completion,
      });
    } catch (error: any) {
      console.error('Error completing checkpoint:', error);
      res.status(500).json({ error: 'Failed to complete checkpoint', details: error.message });
    }
  };

  abandonQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { participationId } = req.params;

      const success = await this.participationService.abandonQuest(participationId, userId);

      if (!success) {
        res.status(404).json({ error: 'Participation not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quest abandoned',
      });
    } catch (error: any) {
      console.error('Error abandoning quest:', error);
      res.status(500).json({ error: 'Failed to abandon quest', details: error.message });
    }
  };

  rateQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { participationId } = req.params;
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const success = await this.participationService.rateQuest(
        participationId,
        userId,
        rating,
        review
      );

      if (!success) {
        res.status(404).json({ error: 'Participation not found or quest not completed' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quest rated successfully',
      });
    } catch (error: any) {
      console.error('Error rating quest:', error);
      res.status(500).json({ error: 'Failed to rate quest', details: error.message });
    }
  };
}
