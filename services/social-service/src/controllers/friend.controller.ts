import { Response } from 'express';
import { FriendService } from '../services';

export class FriendController {
  private friendService: FriendService;

  constructor() {
    this.friendService = new FriendService();
  }

  sendFriendRequest = async (req: any, res: Response): Promise<void> => {
    try {
      const { receiverId, message } = req.body;
      const senderId = req.user?.userId;

      const request = await this.friendService.sendFriendRequest({
        senderId,
        receiverId,
        message,
      });

      res.status(201).json({ success: true, request });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  acceptFriendRequest = async (req: any, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;

      const friendship = await this.friendService.acceptFriendRequest(requestId, userId);

      res.status(200).json({ success: true, friendship });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  rejectFriendRequest = async (req: any, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;

      await this.friendService.rejectFriendRequest(requestId, userId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  cancelFriendRequest = async (req: any, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;

      await this.friendService.cancelFriendRequest(requestId, userId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  removeFriend = async (req: any, res: Response): Promise<void> => {
    try {
      const { friendId } = req.params;
      const userId = req.user?.userId;

      await this.friendService.removeFriend(userId, friendId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getFriends = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const friends = await this.friendService.getFriends(userId, limit, offset);
      const count = await this.friendService.getFriendCount(userId);

      res.status(200).json({ friends, count, limit, offset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPendingRequests = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      const requests = await this.friendService.getPendingRequests(userId);

      res.status(200).json({ requests, count: requests.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getSentRequests = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      const requests = await this.friendService.getSentRequests(userId);

      res.status(200).json({ requests, count: requests.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  blockUser = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId: blockedId } = req.params;
      const { reason } = req.body;
      const blockerId = req.user?.userId;

      const block = await this.friendService.blockUser(blockerId, blockedId, reason);

      res.status(201).json({ success: true, block });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  unblockUser = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId: blockedId } = req.params;
      const blockerId = req.user?.userId;

      await this.friendService.unblockUser(blockerId, blockedId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getBlockedUsers = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      const blocks = await this.friendService.getBlockedUsers(userId);

      res.status(200).json({ blocks, count: blocks.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getMutualFriends = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId: user2Id } = req.params;
      const user1Id = req.user?.userId;

      const mutualFriends = await this.friendService.getMutualFriends(user1Id, user2Id);

      res.status(200).json({ mutualFriends, count: mutualFriends.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getFriendSuggestions = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      const suggestions = await this.friendService.getFriendSuggestions(userId, limit);

      res.status(200).json({ suggestions, count: suggestions.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
