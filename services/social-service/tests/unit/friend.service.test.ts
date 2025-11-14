import { FriendService } from '../../src/services/friend.service';
import { Repository } from 'typeorm';
import { Friendship } from '../../src/models/Friendship.entity';
import { FriendRequest, FriendRequestStatus } from '../../src/models/FriendRequest.entity';
import { Block } from '../../src/models/Block.entity';
import { mockUsers, mockFriendship, mockFriendRequest, mockBlock } from '../fixtures/mockData';

describe('FriendService', () => {
  let friendService: FriendService;
  let mockFriendshipRepo: jest.Mocked<Repository<Friendship>>;
  let mockFriendRequestRepo: jest.Mocked<Repository<FriendRequest>>;
  let mockBlockRepo: jest.Mocked<Repository<Block>>;

  beforeEach(() => {
    // Create mock repositories
    mockFriendshipRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    } as any;

    mockFriendRequestRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockBlockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    } as any;

    friendService = new FriendService();
    (friendService as any).friendshipRepository = mockFriendshipRepo;
    (friendService as any).friendRequestRepository = mockFriendRequestRepo;
    (friendService as any).blockRepository = mockBlockRepo;
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      const dto = {
        senderId: mockUsers.user1.userId,
        receiverId: mockUsers.user3.userId,
        message: 'Let\'s be friends!',
      };

      mockFriendRequestRepo.findOne.mockResolvedValue(null); // No existing request
      mockFriendshipRepo.findOne.mockResolvedValue(null); // Not already friends
      mockBlockRepo.findOne.mockResolvedValue(null); // Not blocked
      mockFriendRequestRepo.create.mockReturnValue(mockFriendRequest as any);
      mockFriendRequestRepo.save.mockResolvedValue(mockFriendRequest as any);

      const result = await friendService.sendFriendRequest(dto);

      expect(result).toEqual(mockFriendRequest);
      expect(mockFriendRequestRepo.create).toHaveBeenCalled();
      expect(mockFriendRequestRepo.save).toHaveBeenCalled();
    });

    it('should throw error if friend request already exists', async () => {
      const dto = {
        senderId: mockUsers.user1.userId,
        receiverId: mockUsers.user3.userId,
        message: 'Let\'s be friends!',
      };

      mockFriendRequestRepo.findOne.mockResolvedValue(mockFriendRequest as any);

      await expect(friendService.sendFriendRequest(dto)).rejects.toThrow(
        'Friend request already sent'
      );
    });

    it('should throw error if users are already friends', async () => {
      const dto = {
        senderId: mockUsers.user1.userId,
        receiverId: mockUsers.user2.userId,
        message: 'Let\'s be friends!',
      };

      mockFriendRequestRepo.findOne.mockResolvedValue(null);
      mockFriendshipRepo.findOne.mockResolvedValue(mockFriendship as any);

      await expect(friendService.sendFriendRequest(dto)).rejects.toThrow(
        'Users are already friends'
      );
    });

    it('should throw error if sender is blocked', async () => {
      const dto = {
        senderId: mockUsers.user1.userId,
        receiverId: mockUsers.user4.userId,
        message: 'Let\'s be friends!',
      };

      mockFriendRequestRepo.findOne.mockResolvedValue(null);
      mockFriendshipRepo.findOne.mockResolvedValue(null);
      mockBlockRepo.findOne.mockResolvedValue(mockBlock as any);

      await expect(friendService.sendFriendRequest(dto)).rejects.toThrow(
        'Cannot send friend request'
      );
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request and create friendship', async () => {
      const requestId = mockFriendRequest.requestId;
      const userId = mockUsers.user3.userId;

      mockFriendRequestRepo.findOne.mockResolvedValue(mockFriendRequest as any);
      mockFriendshipRepo.count.mockResolvedValue(10); // Friend count
      mockFriendRequestRepo.save.mockResolvedValue({
        ...mockFriendRequest,
        status: FriendRequestStatus.ACCEPTED,
      } as any);
      mockFriendshipRepo.create.mockReturnValue(mockFriendship as any);
      mockFriendshipRepo.save.mockResolvedValue(mockFriendship as any);

      const result = await friendService.acceptFriendRequest(requestId, userId);

      expect(result).toEqual(mockFriendship);
      expect(mockFriendRequestRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: FriendRequestStatus.ACCEPTED,
        })
      );
      expect(mockFriendshipRepo.save).toHaveBeenCalled();
    });

    it('should throw error if friend request not found', async () => {
      mockFriendRequestRepo.findOne.mockResolvedValue(null);

      await expect(
        friendService.acceptFriendRequest('invalid-id', mockUsers.user3.userId)
      ).rejects.toThrow('Friend request not found');
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject friend request successfully', async () => {
      const requestId = mockFriendRequest.requestId;
      const userId = mockUsers.user3.userId;

      mockFriendRequestRepo.findOne.mockResolvedValue(mockFriendRequest as any);
      mockFriendRequestRepo.save.mockResolvedValue({
        ...mockFriendRequest,
        status: FriendRequestStatus.REJECTED,
      } as any);

      await friendService.rejectFriendRequest(requestId, userId);

      expect(mockFriendRequestRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: FriendRequestStatus.REJECTED,
        })
      );
    });
  });

  describe('removeFriend', () => {
    it('should remove friendship successfully', async () => {
      const userId = mockUsers.user1.userId;
      const friendId = mockUsers.user2.userId;

      mockFriendshipRepo.findOne.mockResolvedValue(mockFriendship as any);
      mockFriendshipRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await friendService.removeFriend(userId, friendId);

      expect(mockFriendshipRepo.delete).toHaveBeenCalled();
    });

    it('should throw error if friendship not found', async () => {
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      await expect(
        friendService.removeFriend(mockUsers.user1.userId, mockUsers.user3.userId)
      ).rejects.toThrow('Friendship not found');
    });
  });

  describe('areFriends', () => {
    it('should return true if users are friends', async () => {
      mockFriendshipRepo.findOne.mockResolvedValue(mockFriendship as any);

      const result = await friendService.areFriends(
        mockUsers.user1.userId,
        mockUsers.user2.userId
      );

      expect(result).toBe(true);
    });

    it('should return false if users are not friends', async () => {
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      const result = await friendService.areFriends(
        mockUsers.user1.userId,
        mockUsers.user3.userId
      );

      expect(result).toBe(false);
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      const blockerId = mockUsers.user1.userId;
      const blockedId = mockUsers.user4.userId;

      mockBlockRepo.findOne.mockResolvedValue(null); // Not already blocked
      mockBlockRepo.create.mockReturnValue(mockBlock as any);
      mockBlockRepo.save.mockResolvedValue(mockBlock as any);
      mockFriendshipRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await friendService.blockUser(blockerId, blockedId);

      expect(result).toEqual(mockBlock);
      expect(mockBlockRepo.save).toHaveBeenCalled();
      expect(mockFriendshipRepo.delete).toHaveBeenCalled();
    });

    it('should throw error if user is already blocked', async () => {
      mockBlockRepo.findOne.mockResolvedValue(mockBlock as any);

      await expect(
        friendService.blockUser(mockUsers.user1.userId, mockUsers.user4.userId)
      ).rejects.toThrow('User is already blocked');
    });
  });

  describe('isBlocked', () => {
    it('should return true if user is blocked', async () => {
      mockBlockRepo.findOne.mockResolvedValue(mockBlock as any);

      const result = await friendService.isBlocked(
        mockUsers.user1.userId,
        mockUsers.user4.userId
      );

      expect(result).toBe(true);
    });

    it('should return false if user is not blocked', async () => {
      mockBlockRepo.findOne.mockResolvedValue(null);

      const result = await friendService.isBlocked(
        mockUsers.user1.userId,
        mockUsers.user2.userId
      );

      expect(result).toBe(false);
    });
  });

  describe('getFriendCount', () => {
    it('should return correct friend count', async () => {
      mockFriendshipRepo.count.mockResolvedValue(25);

      const count = await friendService.getFriendCount(mockUsers.user1.userId);

      expect(count).toBe(25);
    });
  });

  describe('getMutualFriends', () => {
    it('should return mutual friends', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockFriendship]),
      };

      mockFriendshipRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await friendService.getMutualFriends(
        mockUsers.user1.userId,
        mockUsers.user2.userId
      );

      expect(result).toEqual([mockFriendship]);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });
});
