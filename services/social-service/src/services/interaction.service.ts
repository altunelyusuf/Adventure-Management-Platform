import { AppDataSource } from '../config/database';
import { ActivityLike } from '../models/ActivityLike.entity';
import { ActivityComment } from '../models/ActivityComment.entity';
import { Repository } from 'typeorm';
import { ActivityService } from './activity.service';
import { config } from '../config';

export interface CreateCommentDTO {
  activityId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
}

export class InteractionService {
  private likeRepository: Repository<ActivityLike>;
  private commentRepository: Repository<ActivityComment>;
  private activityService: ActivityService;

  constructor() {
    this.likeRepository = AppDataSource.getRepository(ActivityLike);
    this.commentRepository = AppDataSource.getRepository(ActivityComment);
    this.activityService = new ActivityService();
  }

  /**
   * Like activity
   */
  async likeActivity(activityId: string, userId: string): Promise<ActivityLike> {
    // Check if already liked
    const existing = await this.likeRepository.findOne({
      where: { activityId, userId },
    });

    if (existing) {
      throw new Error('Already liked');
    }

    // Create like
    const like = this.likeRepository.create({
      activityId,
      userId,
    });

    await this.likeRepository.save(like);

    // Increment like count
    await this.activityService.incrementLikeCount(activityId);

    return like;
  }

  /**
   * Unlike activity
   */
  async unlikeActivity(activityId: string, userId: string): Promise<void> {
    const result = await this.likeRepository.delete({
      activityId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error('Like not found');
    }

    // Decrement like count
    await this.activityService.decrementLikeCount(activityId);
  }

  /**
   * Check if user liked activity
   */
  async hasLiked(activityId: string, userId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { activityId, userId },
    });

    return !!like;
  }

  /**
   * Get activity likes
   */
  async getActivityLikes(activityId: string, limit: number = 50, offset: number = 0): Promise<ActivityLike[]> {
    return this.likeRepository.find({
      where: { activityId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Create comment
   */
  async createComment(dto: CreateCommentDTO): Promise<ActivityComment> {
    // Validate comment length
    if (dto.content.length > config.interaction.maxCommentLength) {
      throw new Error(`Comment exceeds maximum length of ${config.interaction.maxCommentLength} characters`);
    }

    // Check parent comment depth if nested
    if (dto.parentCommentId && config.interaction.enableNestedComments) {
      const depth = await this.getCommentDepth(dto.parentCommentId);
      if (depth >= config.interaction.maxCommentDepth) {
        throw new Error(`Maximum comment depth of ${config.interaction.maxCommentDepth} reached`);
      }
    }

    // Create comment
    const comment = this.commentRepository.create({
      activityId: dto.activityId,
      userId: dto.userId,
      content: dto.content,
      parentCommentId: dto.parentCommentId,
      likeCount: 0,
      replyCount: 0,
      isEdited: false,
      isDeleted: false,
    });

    await this.commentRepository.save(comment);

    // Increment activity comment count
    await this.activityService.incrementCommentCount(dto.activityId);

    // Increment parent comment reply count if nested
    if (dto.parentCommentId) {
      await this.commentRepository.increment({ commentId: dto.parentCommentId }, 'replyCount', 1);
    }

    return comment;
  }

  /**
   * Update comment
   */
  async updateComment(commentId: string, userId: string, content: string): Promise<ActivityComment> {
    const comment = await this.commentRepository.findOne({
      where: { commentId, userId },
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    if (comment.isDeleted) {
      throw new Error('Cannot edit deleted comment');
    }

    if (content.length > config.interaction.maxCommentLength) {
      throw new Error(`Comment exceeds maximum length of ${config.interaction.maxCommentLength} characters`);
    }

    comment.content = content;
    comment.isEdited = true;

    return this.commentRepository.save(comment);
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { commentId, userId },
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    // Soft delete
    comment.isDeleted = true;
    comment.content = '[deleted]';
    await this.commentRepository.save(comment);

    // Decrement activity comment count
    await this.activityService.decrementCommentCount(comment.activityId);

    // Decrement parent comment reply count if nested
    if (comment.parentCommentId) {
      await this.commentRepository.decrement({ commentId: comment.parentCommentId }, 'replyCount', 1);
    }
  }

  /**
   * Get activity comments
   */
  async getActivityComments(
    activityId: string,
    parentCommentId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ActivityComment[]> {
    const where: any = { activityId, isDeleted: false };

    if (parentCommentId) {
      where.parentCommentId = parentCommentId;
    } else {
      where.parentCommentId = null; // Top-level comments only
    }

    return this.commentRepository.find({
      where,
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get comment replies
   */
  async getCommentReplies(commentId: string, limit: number = 50, offset: number = 0): Promise<ActivityComment[]> {
    return this.commentRepository.find({
      where: { parentCommentId: commentId, isDeleted: false },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get comment depth (for nested comments)
   */
  private async getCommentDepth(commentId: string): Promise<number> {
    let depth = 0;
    let currentCommentId: string | undefined = commentId;

    while (currentCommentId && depth < 10) {
      // Safety limit
      const comment = await this.commentRepository.findOne({
        where: { commentId: currentCommentId },
      });

      if (!comment || !comment.parentCommentId) {
        break;
      }

      depth++;
      currentCommentId = comment.parentCommentId;
    }

    return depth;
  }

  /**
   * Like comment
   */
  async likeComment(commentId: string): Promise<void> {
    await this.commentRepository.increment({ commentId }, 'likeCount', 1);
  }

  /**
   * Unlike comment
   */
  async unlikeComment(commentId: string): Promise<void> {
    await this.commentRepository.decrement({ commentId }, 'likeCount', 1);
  }
}
