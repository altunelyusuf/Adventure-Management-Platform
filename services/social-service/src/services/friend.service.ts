import { AppDataSource } from '../config/database';
import { Friendship } from '../models/Friendship.entity';
import { FriendRequest, FriendRequestStatus } from '../models/FriendRequest.entity';
import { Block } from '../models/Block.entity';
import { Repository } from 'typeorm';
import { config } from '../config';
import { addDays } from 'date-fns';

export interface SendFriendRequestDTO {
  senderId: string;
  receiverId: string;
  message?: string;
}

export class FriendService {
  private friendshipRepository: Repository<Friendship>;
  private friendRequestRepository: Repository<FriendRequest>;
  private blockRepository: Repository<Block>;

  constructor() {
    this.friendshipRepository = AppDataSource.getRepository(Friendship);
    this.friendRequestRepository = AppDataSource.getRepository(FriendRequest);
    this.blockRepository = AppDataSource.getRepository(Block);
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(data: SendFriendRequestDTO): Promise<FriendRequest> {
    // Check if already friends
    const existingFriendship = await this.areFriends(data.senderId, data.receiverId);
    if (existingFriendship) {
      throw new Error('Already friends');
    }

    // Check if blocked
    const isBlocked = await this.isBlocked(data.senderId, data.receiverId);
    if (isBlocked) {
      throw new Error('Cannot send friend request');
    }

    // Check existing pending request
    const existing = await this.friendRequestRepository.findOne({
      where: [
        { senderId: data.senderId, receiverId: data.receiverId, status: FriendRequestStatus.PENDING },
        { senderId: data.receiverId, receiverId: data.senderId, status: FriendRequestStatus.PENDING },
      ],
    });

    if (existing) {
      throw new Error('Friend request already exists');
    }

    // Check max pending requests
    const pendingCount = await this.friendRequestRepository.count({
      where: { senderId: data.senderId, status: FriendRequestStatus.PENDING },
    });

    if (pendingCount >= config.friends.maxPendingRequests) {
      throw new Error('Maximum pending requests reached');
    }

    const friendRequest = this.friendRequestRepository.create({
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      status: FriendRequestStatus.PENDING,
      expiresAt: addDays(new Date(), config.friends.requestExpiryDays),
    });

    return this.friendRequestRepository.save(friendRequest);
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<Friendship> {
    const request = await this.friendRequestRepository.findOne({
      where: { requestId, receiverId: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    // Check max friends
    const friendCount = await this.getFriendCount(userId);
    if (friendCount >= config.friends.maxFriends) {
      throw new Error('Maximum friends limit reached');
    }

    // Update request status
    request.status = FriendRequestStatus.ACCEPTED;
    request.respondedAt = new Date();
    await this.friendRequestRepository.save(request);

    // Create friendship (normalize user IDs)
    const [user1Id, user2Id] = [request.senderId, request.receiverId].sort();

    const friendship = this.friendshipRepository.create({
      user1Id,
      user2Id,
      metadata: {
        initiatorId: request.senderId,
        friendshipSource: 'friend_request',
      },
    });

    return this.friendshipRepository.save(friendship);
  }

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
    const request = await this.friendRequestRepository.findOne({
      where: { requestId, receiverId: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    request.status = FriendRequestStatus.REJECTED;
    request.respondedAt = new Date();
    await this.friendRequestRepository.save(request);
  }

  /**
   * Cancel friend request
   */
  async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
    const request = await this.friendRequestRepository.findOne({
      where: { requestId, senderId: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    request.status = FriendRequestStatus.CANCELLED;
    await this.friendRequestRepository.save(request);
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const [user1Id, user2Id] = [userId, friendId].sort();

    const result = await this.friendshipRepository.delete({
      user1Id,
      user2Id,
    });

    if (result.affected === 0) {
      throw new Error('Friendship not found');
    }
  }

  /**
   * Get user's friends
   */
  async getFriends(userId: string, limit: number = 100, offset: number = 0): Promise<Friendship[]> {
    return this.friendshipRepository
      .createQueryBuilder('friendship')
      .where('friendship.user1Id = :userId OR friendship.user2Id = :userId', { userId })
      .orderBy('friendship.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  /**
   * Get friend IDs for a user
   */
  async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    });

    return friendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));
  }

  /**
   * Get friend count
   */
  async getFriendCount(userId: string): Promise<number> {
    return this.friendshipRepository
      .createQueryBuilder('friendship')
      .where('friendship.user1Id = :userId OR friendship.user2Id = :userId', { userId })
      .getCount();
  }

  /**
   * Check if users are friends
   */
  async areFriends(user1Id: string, user2Id: string): Promise<boolean> {
    const [userId1, userId2] = [user1Id, user2Id].sort();

    const friendship = await this.friendshipRepository.findOne({
      where: { user1Id: userId1, user2Id: userId2 },
    });

    return !!friendship;
  }

  /**
   * Get pending friend requests (received)
   */
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    return this.friendRequestRepository.find({
      where: { receiverId: userId, status: FriendRequestStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get sent friend requests
   */
  async getSentRequests(userId: string): Promise<FriendRequest[]> {
    return this.friendRequestRepository.find({
      where: { senderId: userId, status: FriendRequestStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Block user
   */
  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<Block> {
    // Remove friendship if exists
    try {
      await this.removeFriend(blockerId, blockedId);
    } catch (error) {
      // Friendship might not exist, continue
    }

    // Remove any pending friend requests
    await this.friendRequestRepository.delete({
      senderId: blockerId,
      receiverId: blockedId,
      status: FriendRequestStatus.PENDING,
    });

    await this.friendRequestRepository.delete({
      senderId: blockedId,
      receiverId: blockerId,
      status: FriendRequestStatus.PENDING,
    });

    const block = this.blockRepository.create({
      blockerId,
      blockedId,
      reason,
    });

    return this.blockRepository.save(block);
  }

  /**
   * Unblock user
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const result = await this.blockRepository.delete({
      blockerId,
      blockedId,
    });

    if (result.affected === 0) {
      throw new Error('Block not found');
    }
  }

  /**
   * Check if user is blocked
   */
  async isBlocked(user1Id: string, user2Id: string): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: [
        { blockerId: user1Id, blockedId: user2Id },
        { blockerId: user2Id, blockedId: user1Id },
      ],
    });

    return !!block;
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(userId: string): Promise<Block[]> {
    return this.blockRepository.find({
      where: { blockerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get mutual friends
   */
  async getMutualFriends(user1Id: string, user2Id: string): Promise<string[]> {
    const user1Friends = await this.getFriendIds(user1Id);
    const user2Friends = await this.getFriendIds(user2Id);

    return user1Friends.filter((friendId) => user2Friends.includes(friendId));
  }

  /**
   * Get friend suggestions (friends of friends)
   */
  async getFriendSuggestions(userId: string, limit: number = 10): Promise<string[]> {
    const friendIds = await this.getFriendIds(userId);
    const friendOfFriendsMap: Map<string, number> = new Map();

    // Get friends of each friend
    for (const friendId of friendIds) {
      const friendsOfFriend = await this.getFriendIds(friendId);

      for (const suggestedId of friendsOfFriend) {
        // Skip self and existing friends
        if (suggestedId === userId || friendIds.includes(suggestedId)) {
          continue;
        }

        friendOfFriendsMap.set(suggestedId, (friendOfFriendsMap.get(suggestedId) || 0) + 1);
      }
    }

    // Sort by mutual friends count and return top suggestions
    return Array.from(friendOfFriendsMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId]) => userId);
  }
}
