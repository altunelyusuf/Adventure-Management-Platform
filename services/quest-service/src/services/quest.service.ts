import { Repository, FindOptionsWhere, ILike, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Quest, QuestStatus, QuestDifficulty } from '../models/Quest.entity';
import { Checkpoint } from '../models/Checkpoint.entity';
import { QuestCategory } from '../models/QuestCategory.entity';
import { config } from '../config';
import slugify from 'slugify';

export interface CreateQuestDTO {
  creatorId: string;
  title: string;
  description?: string;
  shortDescription?: string;
  difficulty: QuestDifficulty;
  categoryId?: string;
  tags?: string[];
  estimatedDuration?: number;
  featuredImageUrl?: string;
  isPremium?: boolean;
  price?: number;
}

export interface UpdateQuestDTO {
  title?: string;
  description?: string;
  shortDescription?: string;
  difficulty?: QuestDifficulty;
  categoryId?: string;
  tags?: string[];
  estimatedDuration?: number;
  featuredImageUrl?: string;
  isPremium?: boolean;
  price?: number;
}

export interface SearchQuestsDTO {
  query?: string;
  categoryId?: string;
  difficulty?: QuestDifficulty;
  status?: QuestStatus;
  creatorId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  tags?: string[];
  isPremium?: boolean;
  limit?: number;
  offset?: number;
}

export class QuestService {
  private questRepository: Repository<Quest>;
  private checkpointRepository: Repository<Checkpoint>;
  private categoryRepository: Repository<QuestCategory>;

  constructor() {
    this.questRepository = AppDataSource.getRepository(Quest);
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
    this.categoryRepository = AppDataSource.getRepository(QuestCategory);
  }

  async createQuest(data: CreateQuestDTO): Promise<Quest> {
    const slug = await this.generateUniqueSlug(data.title);

    const quest = this.questRepository.create({
      ...data,
      slug,
      status: QuestStatus.DRAFT,
    });

    await this.questRepository.save(quest);
    return quest;
  }

  async getQuest(questId: string, requesterId?: string): Promise<Quest | null> {
    const quest = await this.questRepository.findOne({
      where: { questId },
      relations: ['category', 'checkpoints'],
    });

    if (!quest) return null;

    // Only show draft quests to the creator
    if (quest.status === QuestStatus.DRAFT && quest.creatorId !== requesterId) {
      return null;
    }

    // Sort checkpoints by order
    if (quest.checkpoints) {
      quest.checkpoints.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return quest;
  }

  async getQuestBySlug(slug: string, requesterId?: string): Promise<Quest | null> {
    const quest = await this.questRepository.findOne({
      where: { slug },
      relations: ['category', 'checkpoints'],
    });

    if (!quest) return null;

    if (quest.status === QuestStatus.DRAFT && quest.creatorId !== requesterId) {
      return null;
    }

    if (quest.checkpoints) {
      quest.checkpoints.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return quest;
  }

  async updateQuest(questId: string, creatorId: string, updates: UpdateQuestDTO): Promise<Quest | null> {
    const quest = await this.questRepository.findOne({ where: { questId } });

    if (!quest || quest.creatorId !== creatorId) {
      return null;
    }

    // If title is being updated, regenerate slug
    if (updates.title && updates.title !== quest.title) {
      const slug = await this.generateUniqueSlug(updates.title);
      Object.assign(quest, updates, { slug });
    } else {
      Object.assign(quest, updates);
    }

    await this.questRepository.save(quest);
    return quest;
  }

  async deleteQuest(questId: string, creatorId: string): Promise<boolean> {
    const quest = await this.questRepository.findOne({ where: { questId } });

    if (!quest || quest.creatorId !== creatorId) {
      return false;
    }

    // Soft delete by setting status to DELETED
    quest.status = QuestStatus.DELETED;
    await this.questRepository.save(quest);
    return true;
  }

  async publishQuest(questId: string, creatorId: string): Promise<{ success: boolean; errors?: string[] }> {
    const quest = await this.questRepository.findOne({
      where: { questId },
      relations: ['checkpoints'],
    });

    if (!quest || quest.creatorId !== creatorId) {
      return { success: false, errors: ['Quest not found or unauthorized'] };
    }

    const validationErrors = await this.validateQuestForPublishing(quest);

    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    quest.status = QuestStatus.PUBLISHED;
    quest.publishedAt = new Date();
    await this.questRepository.save(quest);

    return { success: true };
  }

  async unpublishQuest(questId: string, creatorId: string): Promise<boolean> {
    const quest = await this.questRepository.findOne({ where: { questId } });

    if (!quest || quest.creatorId !== creatorId) {
      return false;
    }

    quest.status = QuestStatus.DRAFT;
    await this.questRepository.save(quest);
    return true;
  }

  async validateQuestForPublishing(quest: Quest): Promise<string[]> {
    const errors: string[] = [];

    if (!quest.title || quest.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!quest.description || quest.description.trim().length < 50) {
      errors.push('Description must be at least 50 characters');
    }

    if (!quest.categoryId) {
      errors.push('Category must be selected');
    }

    if (!quest.featuredImageUrl) {
      errors.push('Featured image is required');
    }

    if (!quest.tags || quest.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    // Check checkpoints
    const checkpointCount = await this.checkpointRepository.count({ where: { questId: quest.questId } });

    if (checkpointCount < config.quest.minCheckpoints) {
      errors.push(`Quest must have at least ${config.quest.minCheckpoints} checkpoints`);
    }

    if (!quest.estimatedDuration) {
      errors.push('Estimated duration must be set');
    }

    return errors;
  }

  async searchQuests(params: SearchQuestsDTO): Promise<{ quests: Quest[]; total: number }> {
    const {
      query,
      categoryId,
      difficulty,
      status = QuestStatus.PUBLISHED,
      creatorId,
      latitude,
      longitude,
      radiusKm,
      tags,
      isPremium,
      limit = 20,
      offset = 0,
    } = params;

    const queryBuilder = this.questRepository.createQueryBuilder('quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('quest.status = :status', { status });

    if (query) {
      queryBuilder.andWhere('(quest.title ILIKE :query OR quest.description ILIKE :query)', {
        query: `%${query}%`,
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('quest.categoryId = :categoryId', { categoryId });
    }

    if (difficulty) {
      queryBuilder.andWhere('quest.difficulty = :difficulty', { difficulty });
    }

    if (creatorId) {
      queryBuilder.andWhere('quest.creatorId = :creatorId', { creatorId });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('quest.tags && :tags', { tags });
    }

    if (isPremium !== undefined) {
      queryBuilder.andWhere('quest.isPremium = :isPremium', { isPremium });
    }

    // Geospatial filtering (simplified - would use PostGIS in production)
    if (latitude && longitude && radiusKm) {
      const maxRadius = Math.min(radiusKm, config.geospatial.maxSearchRadiusKm);

      queryBuilder.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(quest.startLatitude)) *
            cos(radians(quest.startLongitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(quest.startLatitude))
          )
        ) <= :radius`,
        { lat: latitude, lng: longitude, radius: maxRadius }
      );
    }

    queryBuilder
      .orderBy('quest.publishedAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [quests, total] = await queryBuilder.getManyAndCount();

    return { quests, total };
  }

  async getCreatorQuests(creatorId: string, status?: QuestStatus): Promise<Quest[]> {
    const where: FindOptionsWhere<Quest> = { creatorId };

    if (status) {
      where.status = status;
    }

    return this.questRepository.find({
      where,
      relations: ['category'],
      order: { updatedAt: 'DESC' },
    });
  }

  async incrementViewCount(questId: string): Promise<void> {
    await this.questRepository.increment({ questId }, 'viewCount', 1);
  }

  async incrementParticipantCount(questId: string): Promise<void> {
    await this.questRepository.increment({ questId }, 'participantCount', 1);
  }

  async incrementCompletionCount(questId: string): Promise<void> {
    await this.questRepository.increment({ questId }, 'completionCount', 1);
  }

  async updateAverageRating(questId: string): Promise<void> {
    // This would calculate based on participation ratings
    // Simplified for now - would use a proper aggregation query
    const quest = await this.questRepository.findOne({ where: { questId } });
    if (quest) {
      // TODO: Calculate actual average from participations table
      await this.questRepository.save(quest);
    }
  }

  async getAllCategories(): Promise<QuestCategory[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    let counter = 1;

    while (await this.questRepository.findOne({ where: { slug } })) {
      slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
      counter++;
    }

    return slug;
  }
}
