import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  private adminService = new AdminService();

  // User Management
  getUsers = async (req: Request, res: Response) => {
    try {
      const filters = {
        role: req.query.role as string,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };
      const users = await this.adminService.getUsers(filters);
      res.json({ users, count: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  banUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const bannedBy = req.body.adminId || 'system';
      const result = await this.adminService.banUser(userId, reason, bannedBy);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  unbanUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const result = await this.adminService.unbanUser(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Content Moderation
  getPendingQuests = async (_req: Request, res: Response) => {
    try {
      const quests = await this.adminService.getPendingQuests();
      res.json({ quests, count: quests.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  approveQuest = async (req: Request, res: Response) => {
    try {
      const { questId } = req.params;
      const approvedBy = req.body.adminId || 'system';
      const result = await this.adminService.approveQuest(questId, approvedBy);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  rejectQuest = async (req: Request, res: Response) => {
    try {
      const { questId } = req.params;
      const { reason } = req.body;
      const rejectedBy = req.body.adminId || 'system';
      const result = await this.adminService.rejectQuest(questId, reason, rejectedBy);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Analytics
  getSystemStats = async (_req: Request, res: Response) => {
    try {
      const stats = await this.adminService.getSystemStats();
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getActivityLog = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const activities = await this.adminService.getActivityLog(limit);
      res.json({ activities, count: activities.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  healthCheck = async (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'admin-service', timestamp: new Date().toISOString() });
  };
}
