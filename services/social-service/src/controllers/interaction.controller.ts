import { Response } from 'express';
import { InteractionService } from '../services';

export class InteractionController {
  private interactionService: InteractionService;

  constructor() {
    this.interactionService = new InteractionService();
  }

  likeActivity = async (req: any, res: Response): Promise<void> => {
    try {
      const { activityId } = req.params;
      const userId = req.user?.userId;

      const like = await this.interactionService.likeActivity(activityId, userId);

      res.status(201).json({ success: true, like });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  unlikeActivity = async (req: any, res: Response): Promise<void> => {
    try {
      const { activityId } = req.params;
      const userId = req.user?.userId;

      await this.interactionService.unlikeActivity(activityId, userId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getActivityLikes = async (req: any, res: Response): Promise<void> => {
    try {
      const { activityId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const likes = await this.interactionService.getActivityLikes(activityId, limit, offset);

      res.status(200).json({ likes, count: likes.length, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createComment = async (req: any, res: Response): Promise<void> => {
    try {
      const { activityId } = req.params;
      const { content, parentCommentId } = req.body;
      const userId = req.user?.userId;

      const comment = await this.interactionService.createComment({
        activityId,
        userId,
        content,
        parentCommentId,
      });

      res.status(201).json({ success: true, comment });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateComment = async (req: any, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      const comment = await this.interactionService.updateComment(commentId, userId, content);

      res.status(200).json({ success: true, comment });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteComment = async (req: any, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      await this.interactionService.deleteComment(commentId, userId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getActivityComments = async (req: any, res: Response): Promise<void> => {
    try {
      const { activityId } = req.params;
      const parentCommentId = req.query.parentCommentId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const comments = await this.interactionService.getActivityComments(
        activityId,
        parentCommentId,
        limit,
        offset
      );

      res.status(200).json({ comments, count: comments.length, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
