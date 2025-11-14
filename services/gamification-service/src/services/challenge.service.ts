import { AppDataSource } from '../config/database';
import { Challenge, ChallengeType, ChallengeDifficulty } from '../models/Challenge.entity';
import { UserChallenge, UserChallengeStatus } from '../models/UserChallenge.entity';
import { Repository } from 'typeorm';

export interface UpdateChallengeProgressDTO {
  userId: string;
  challengeId: string;
  increment?: number;
  setValue?: number;
}

export class ChallengeService {
  private challengeRepository: Repository<Challenge>;
  private userChallengeRepository: Repository<UserChallenge>;

  constructor() {
    this.challengeRepository = AppDataSource.getRepository(Challenge);
    this.userChallengeRepository = AppDataSource.getRepository(UserChallenge);
  }

  /**
   * Get all active challenges
   */
  async getActiveChallenges(type?: ChallengeType): Promise<Challenge[]> {
    const now = new Date();
    const queryBuilder = this.challengeRepository
      .createQueryBuilder('challenge')
      .where('challenge.isActive = :isActive', { isActive: true })
      .andWhere('challenge.startDate <= :now', { now })
      .andWhere('challenge.endDate >= :now', { now });

    if (type) {
      queryBuilder.andWhere('challenge.type = :type', { type });
    }

    return queryBuilder.orderBy('challenge.endDate', 'ASC').getMany();
  }

  /**
   * Get daily challenges
   */
  async getDailyChallenges(): Promise<Challenge[]> {
    return this.getActiveChallenges(ChallengeType.DAILY);
  }

  /**
   * Get weekly challenges
   */
  async getWeeklyChallenges(): Promise<Challenge[]> {
    return this.getActiveChallenges(ChallengeType.WEEKLY);
  }

  /**
   * Get user's challenges
   */
  async getUserChallenges(
    userId: string,
    status?: UserChallengeStatus
  ): Promise<
    Array<{
      challenge: Challenge;
      userChallenge: UserChallenge;
    }>
  > {
    const queryBuilder = this.userChallengeRepository
      .createQueryBuilder('userChallenge')
      .where('userChallenge.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('userChallenge.status = :status', { status });
    }

    const userChallenges = await queryBuilder.getMany();

    const results = await Promise.all(
      userChallenges.map(async (uc) => {
        const challenge = await this.challengeRepository.findOne({
          where: { challengeId: uc.challengeId },
        });
        return {
          challenge: challenge!,
          userChallenge: uc,
        };
      })
    );

    return results;
  }

  /**
   * Initialize user challenge
   */
  async initializeUserChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const existing = await this.userChallengeRepository.findOne({
      where: { userId, challengeId },
    });

    if (existing) {
      return existing;
    }

    const userChallenge = this.userChallengeRepository.create({
      userId,
      challengeId,
      progress: 0,
      target: challenge.requirements.target,
      status: UserChallengeStatus.ACTIVE,
    });

    return this.userChallengeRepository.save(userChallenge);
  }

  /**
   * Update challenge progress
   */
  async updateProgress(data: UpdateChallengeProgressDTO): Promise<{
    userChallenge: UserChallenge;
    completed: boolean;
  }> {
    let userChallenge = await this.userChallengeRepository.findOne({
      where: { userId: data.userId, challengeId: data.challengeId },
    });

    if (!userChallenge) {
      userChallenge = await this.initializeUserChallenge(data.userId, data.challengeId);
    }

    // Don't update if already completed or expired
    if (
      userChallenge.status === UserChallengeStatus.COMPLETED ||
      userChallenge.status === UserChallengeStatus.EXPIRED
    ) {
      return { userChallenge, completed: false };
    }

    // Update progress
    if (data.increment !== undefined) {
      userChallenge.progress += data.increment;
    } else if (data.setValue !== undefined) {
      userChallenge.progress = data.setValue;
    }

    // Check if completed
    let completed = false;
    if (userChallenge.progress >= userChallenge.target) {
      userChallenge.status = UserChallengeStatus.COMPLETED;
      userChallenge.completedAt = new Date();
      completed = true;

      // Increment challenge completion count
      await this.challengeRepository.increment(
        { challengeId: data.challengeId },
        'completionCount',
        1
      );
    }

    await this.userChallengeRepository.save(userChallenge);

    return { userChallenge, completed };
  }

  /**
   * Expire old challenges
   */
  async expireOldChallenges(): Promise<void> {
    const now = new Date();

    // Mark challenges as inactive
    await this.challengeRepository
      .createQueryBuilder()
      .update(Challenge)
      .set({ isActive: false })
      .where('endDate < :now', { now })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();

    // Mark user challenges as expired
    const expiredChallenges = await this.challengeRepository.find({
      where: { isActive: false },
    });

    for (const challenge of expiredChallenges) {
      await this.userChallengeRepository
        .createQueryBuilder()
        .update(UserChallenge)
        .set({ status: UserChallengeStatus.EXPIRED })
        .where('challengeId = :challengeId', { challengeId: challenge.challengeId })
        .andWhere('status = :status', { status: UserChallengeStatus.ACTIVE })
        .execute();
    }
  }

  /**
   * Get challenge completion stats
   */
  async getChallengeStats(challengeId: string): Promise<{
    totalParticipants: number;
    completedCount: number;
    completionRate: number;
    averageProgress: number;
  }> {
    const userChallenges = await this.userChallengeRepository.find({
      where: { challengeId },
    });

    const totalParticipants = userChallenges.length;
    const completedCount = userChallenges.filter(
      (uc) => uc.status === UserChallengeStatus.COMPLETED
    ).length;
    const completionRate = totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0;

    const totalProgress = userChallenges.reduce((sum, uc) => sum + uc.progress, 0);
    const averageProgress = totalParticipants > 0 ? totalProgress / totalParticipants : 0;

    return {
      totalParticipants,
      completedCount,
      completionRate,
      averageProgress,
    };
  }
}
