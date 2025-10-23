import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { QuestAnalytics, AnalyticsEventType } from '../models/QuestAnalytics.entity';
import { Quest } from '../models/Quest.entity';
import { QuestParticipation } from '../models/QuestParticipation.entity';

export interface QuestAnalyticsSummary {
  questId: string;
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  totalAbandons: number;
  completionRate: number;
  averageCompletionTime?: number;
  popularityScore: number;
  trendingScore: number;
  viewsByDay: Array<{ date: string; count: number }>;
  startsByDay: Array<{ date: string; count: number }>;
}

export class AnalyticsService {
  private analyticsRepository: Repository<QuestAnalytics>;
  private questRepository: Repository<Quest>;
  private participationRepository: Repository<QuestParticipation>;

  constructor() {
    this.analyticsRepository = AppDataSource.getRepository(QuestAnalytics);
    this.questRepository = AppDataSource.getRepository(Quest);
    this.participationRepository = AppDataSource.getRepository(QuestParticipation);
  }

  async trackEvent(
    questId: string,
    eventType: AnalyticsEventType,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const event = this.analyticsRepository.create({
      questId,
      eventType,
      userId,
      metadata,
    });

    await this.analyticsRepository.save(event);
  }

  async getQuestAnalytics(questId: string, days: number = 30): Promise<QuestAnalyticsSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.analyticsRepository.find({
      where: {
        questId,
        createdAt: Between(startDate, new Date()),
      },
    });

    const totalViews = events.filter(e => e.eventType === AnalyticsEventType.VIEW).length;
    const totalStarts = events.filter(e => e.eventType === AnalyticsEventType.START).length;
    const totalCompletions = events.filter(e => e.eventType === AnalyticsEventType.COMPLETE).length;
    const totalAbandons = events.filter(e => e.eventType === AnalyticsEventType.ABANDON).length;

    const completionRate = totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0;

    // Calculate average completion time
    const completedParticipations = await this.participationRepository
      .createQueryBuilder('participation')
      .where('participation.questId = :questId', { questId })
      .andWhere('participation.completedAt IS NOT NULL')
      .andWhere('participation.startedAt >= :startDate', { startDate })
      .getMany();

    let averageCompletionTime: number | undefined;
    if (completedParticipations.length > 0) {
      const totalTime = completedParticipations.reduce((sum, p) => {
        const duration = p.completedAt && p.startedAt
          ? (p.completedAt.getTime() - p.startedAt.getTime()) / 1000 / 60 // minutes
          : 0;
        return sum + duration;
      }, 0);
      averageCompletionTime = totalTime / completedParticipations.length;
    }

    // Calculate popularity score (views + starts + completions)
    const popularityScore = totalViews + (totalStarts * 2) + (totalCompletions * 3);

    // Calculate trending score (more weight on recent activity)
    const last7Days = events.filter(e => {
      const eventDate = new Date(e.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= weekAgo;
    });
    const trendingScore = last7Days.length * 2;

    // Group by day
    const viewsByDay = this.groupEventsByDay(events.filter(e => e.eventType === AnalyticsEventType.VIEW));
    const startsByDay = this.groupEventsByDay(events.filter(e => e.eventType === AnalyticsEventType.START));

    return {
      questId,
      totalViews,
      totalStarts,
      totalCompletions,
      totalAbandons,
      completionRate,
      averageCompletionTime,
      popularityScore,
      trendingScore,
      viewsByDay,
      startsByDay,
    };
  }

  async getFeaturedQuests(limit: number = 10): Promise<Quest[]> {
    // Get quests with highest popularity scores
    const questIds = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.questId')
      .addSelect('COUNT(*)', 'eventCount')
      .where('analytics.createdAt >= :startDate', {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      })
      .groupBy('analytics.questId')
      .orderBy('eventCount', 'DESC')
      .limit(limit * 2) // Get more to filter by published status
      .getRawMany();

    if (questIds.length === 0) {
      return [];
    }

    const quests = await this.questRepository
      .createQueryBuilder('quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('quest.questId IN (:...ids)', { ids: questIds.map(q => q.quest_id) })
      .andWhere('quest.status = :status', { status: 'PUBLISHED' })
      .orderBy('quest.averageRating', 'DESC')
      .addOrderBy('quest.completionCount', 'DESC')
      .take(limit)
      .getMany();

    return quests;
  }

  async getTrendingQuests(limit: number = 10): Promise<Quest[]> {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Get quests with most activity in last 7 days
    const questIds = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.questId')
      .addSelect('COUNT(*)', 'eventCount')
      .where('analytics.createdAt >= :startDate', { startDate: last7Days })
      .groupBy('analytics.questId')
      .orderBy('eventCount', 'DESC')
      .limit(limit * 2)
      .getRawMany();

    if (questIds.length === 0) {
      return [];
    }

    const quests = await this.questRepository
      .createQueryBuilder('quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('quest.questId IN (:...ids)', { ids: questIds.map(q => q.quest_id) })
      .andWhere('quest.status = :status', { status: 'PUBLISHED' })
      .take(limit)
      .getMany();

    return quests;
  }

  async getCreatorAnalytics(creatorId: string, days: number = 30): Promise<{
    totalQuests: number;
    totalViews: number;
    totalParticipations: number;
    totalCompletions: number;
    averageRating: number;
    questPerformance: Array<{ questId: string; title: string; views: number; participations: number; completions: number; rating: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const quests = await this.questRepository.find({
      where: { creatorId },
    });

    const totalQuests = quests.length;

    const questIds = quests.map(q => q.questId);

    let totalViews = 0;
    let totalParticipations = 0;
    let totalCompletions = 0;
    let totalRating = 0;
    let ratedCount = 0;

    const questPerformance = [];

    for (const quest of quests) {
      const analytics = await this.getQuestAnalytics(quest.questId, days);

      totalViews += analytics.totalViews;
      totalParticipations += analytics.totalStarts;
      totalCompletions += analytics.totalCompletions;

      if (quest.averageRating > 0) {
        totalRating += quest.averageRating;
        ratedCount++;
      }

      questPerformance.push({
        questId: quest.questId,
        title: quest.title,
        views: analytics.totalViews,
        participations: analytics.totalStarts,
        completions: analytics.totalCompletions,
        rating: quest.averageRating,
      });
    }

    const averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;

    return {
      totalQuests,
      totalViews,
      totalParticipations,
      totalCompletions,
      averageRating,
      questPerformance: questPerformance.sort((a, b) => b.views - a.views),
    };
  }

  private groupEventsByDay(events: QuestAnalytics[]): Array<{ date: string; count: number }> {
    const groupedByDate: { [key: string]: number } = {};

    events.forEach(event => {
      const date = event.createdAt.toISOString().split('T')[0];
      groupedByDate[date] = (groupedByDate[date] || 0) + 1;
    });

    return Object.entries(groupedByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
