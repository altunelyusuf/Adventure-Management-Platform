import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Quest, QuestDifficulty, QuestStatus } from '../models/Quest.entity';
import { QuestParticipation, ParticipationStatus } from '../models/QuestParticipation.entity';
import { QuestBookmark } from '../models/QuestBookmark.entity';
import { QuestAnalytics, AnalyticsEventType } from '../models/QuestAnalytics.entity';

export class RecommendationService {
  private questRepository: Repository<Quest>;
  private participationRepository: Repository<QuestParticipation>;
  private bookmarkRepository: Repository<QuestBookmark>;
  private analyticsRepository: Repository<QuestAnalytics>;

  constructor() {
    this.questRepository = AppDataSource.getRepository(Quest);
    this.participationRepository = AppDataSource.getRepository(QuestParticipation);
    this.bookmarkRepository = AppDataSource.getRepository(QuestBookmark);
    this.analyticsRepository = AppDataSource.getRepository(QuestAnalytics);
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Quest[]> {
    // Get user's completed quests
    const completedQuests = await this.participationRepository.find({
      where: { userId, status: ParticipationStatus.COMPLETED },
      relations: ['quest'],
    });

    const completedQuestIds = completedQuests.map(p => p.questId);

    // Get user's bookmarked quests
    const bookmarks = await this.bookmarkRepository.find({
      where: { userId },
    });

    const bookmarkedQuestIds = bookmarks.map(b => b.questId);

    // Analyze user preferences
    const userPreferences = this.analyzeUserPreferences(completedQuests.map(p => p.quest));

    // Build recommendation query
    let queryBuilder = this.questRepository
      .createQueryBuilder('quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('quest.status = :status', { status: QuestStatus.PUBLISHED });

    // Exclude already completed quests
    if (completedQuestIds.length > 0) {
      queryBuilder = queryBuilder.andWhere('quest.questId NOT IN (:...completedIds)', { completedIds: completedQuestIds });
    }

    // Filter by preferred categories
    if (userPreferences.preferredCategories.length > 0) {
      queryBuilder = queryBuilder.andWhere('quest.categoryId IN (:...categories)', {
        categories: userPreferences.preferredCategories,
      });
    }

    // Filter by preferred difficulty
    if (userPreferences.preferredDifficulty) {
      queryBuilder = queryBuilder.andWhere('quest.difficulty = :difficulty', {
        difficulty: userPreferences.preferredDifficulty,
      });
    }

    // Order by rating and popularity
    queryBuilder = queryBuilder
      .orderBy('quest.averageRating', 'DESC')
      .addOrderBy('quest.participantCount', 'DESC')
      .take(limit);

    const recommendations = await queryBuilder.getMany();

    // If not enough recommendations, fill with popular quests
    if (recommendations.length < limit) {
      const additionalQuests = await this.questRepository
        .createQueryBuilder('quest')
        .leftJoinAndSelect('quest.category', 'category')
        .where('quest.status = :status', { status: QuestStatus.PUBLISHED })
        .andWhere('quest.questId NOT IN (:...excludeIds)', {
          excludeIds: [...completedQuestIds, ...recommendations.map(q => q.questId)],
        })
        .orderBy('quest.averageRating', 'DESC')
        .addOrderBy('quest.participantCount', 'DESC')
        .take(limit - recommendations.length)
        .getMany();

      recommendations.push(...additionalQuests);
    }

    return recommendations;
  }

  async getSimilarQuests(questId: string, limit: number = 5): Promise<Quest[]> {
    const quest = await this.questRepository.findOne({
      where: { questId },
      relations: ['category'],
    });

    if (!quest) {
      return [];
    }

    const similarQuests = await this.questRepository
      .createQueryBuilder('quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('quest.status = :status', { status: QuestStatus.PUBLISHED })
      .andWhere('quest.questId != :questId', { questId })
      .andWhere(
        '(quest.categoryId = :categoryId OR quest.difficulty = :difficulty)',
        { categoryId: quest.categoryId, difficulty: quest.difficulty }
      )
      .orderBy('quest.averageRating', 'DESC')
      .take(limit)
      .getMany();

    return similarQuests;
  }

  async getQuestsNearby(latitude: number, longitude: number, radiusKm: number = 50, limit: number = 10): Promise<Quest[]> {
    const quests = await this.questRepository
      .createQueryBuilder('quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('quest.status = :status', { status: QuestStatus.PUBLISHED })
      .andWhere('quest.startLatitude IS NOT NULL')
      .andWhere('quest.startLongitude IS NOT NULL')
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(quest.startLatitude)) *
            cos(radians(quest.startLongitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(quest.startLatitude))
          )
        ) <= :radius`,
        { lat: latitude, lng: longitude, radius: radiusKm }
      )
      .orderBy('quest.averageRating', 'DESC')
      .take(limit)
      .getMany();

    return quests;
  }

  async getPopularQuestsInCategory(categoryId: string, limit: number = 10): Promise<Quest[]> {
    return this.questRepository.find({
      where: { categoryId, status: QuestStatus.PUBLISHED },
      relations: ['category'],
      order: { participantCount: 'DESC', averageRating: 'DESC' },
      take: limit,
    });
  }

  async getQuestsForYou(userId: string, limit: number = 20): Promise<{
    recommended: Quest[];
    nearby?: Quest[];
    trending: Quest[];
    popular: Quest[];
  }> {
    const recommended = await this.getPersonalizedRecommendations(userId, limit);

    // Get trending quests
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const trendingQuestIds = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.questId')
      .addSelect('COUNT(*)', 'eventCount')
      .where('analytics.createdAt >= :startDate', { startDate: last7Days })
      .andWhere('analytics.eventType IN (:...types)', {
        types: [AnalyticsEventType.VIEW, AnalyticsEventType.START],
      })
      .groupBy('analytics.questId')
      .orderBy('eventCount', 'DESC')
      .limit(limit)
      .getRawMany();

    const trending = trendingQuestIds.length > 0
      ? await this.questRepository.find({
          where: {
            questId: In(trendingQuestIds.map(q => q.quest_id)),
            status: QuestStatus.PUBLISHED,
          },
          relations: ['category'],
          take: limit,
        })
      : [];

    // Get popular quests
    const popular = await this.questRepository.find({
      where: { status: QuestStatus.PUBLISHED },
      relations: ['category'],
      order: { participantCount: 'DESC', averageRating: 'DESC' },
      take: limit,
    });

    return {
      recommended,
      trending,
      popular,
    };
  }

  private analyzeUserPreferences(completedQuests: Quest[]): {
    preferredCategories: string[];
    preferredDifficulty?: QuestDifficulty;
    averageDuration?: number;
  } {
    if (completedQuests.length === 0) {
      return { preferredCategories: [] };
    }

    // Count categories
    const categoryCount: { [key: string]: number } = {};
    const difficultyCount: { [key: string]: number } = {};
    let totalDuration = 0;

    completedQuests.forEach(quest => {
      if (quest.categoryId) {
        categoryCount[quest.categoryId] = (categoryCount[quest.categoryId] || 0) + 1;
      }
      difficultyCount[quest.difficulty] = (difficultyCount[quest.difficulty] || 0) + 1;
      if (quest.estimatedDuration) {
        totalDuration += quest.estimatedDuration;
      }
    });

    // Get top 3 categories
    const preferredCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([categoryId]) => categoryId);

    // Get most common difficulty
    const preferredDifficulty = Object.entries(difficultyCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as QuestDifficulty | undefined;

    const averageDuration = totalDuration / completedQuests.length;

    return {
      preferredCategories,
      preferredDifficulty,
      averageDuration,
    };
  }
}
