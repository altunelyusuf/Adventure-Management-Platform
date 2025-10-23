import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { QuestParticipation, ParticipationStatus } from '../models/QuestParticipation.entity';
import { CheckpointCompletion } from '../models/CheckpointCompletion.entity';
import { Quest, QuestStatus } from '../models/Quest.entity';
import { Checkpoint, ValidationType } from '../models/Checkpoint.entity';

export interface StartQuestDTO {
  questId: string;
  userId: string;
}

export interface CompleteCheckpointDTO {
  participationId: string;
  checkpointId: string;
  latitude?: number;
  longitude?: number;
  proofUrl?: string;
  answer?: string;
  metadata?: Record<string, any>;
}

export class ParticipationService {
  private participationRepository: Repository<QuestParticipation>;
  private completionRepository: Repository<CheckpointCompletion>;
  private questRepository: Repository<Quest>;
  private checkpointRepository: Repository<Checkpoint>;

  constructor() {
    this.participationRepository = AppDataSource.getRepository(QuestParticipation);
    this.completionRepository = AppDataSource.getRepository(CheckpointCompletion);
    this.questRepository = AppDataSource.getRepository(Quest);
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
  }

  async startQuest(data: StartQuestDTO): Promise<QuestParticipation | null> {
    const quest = await this.questRepository.findOne({
      where: { questId: data.questId },
      relations: ['checkpoints'],
    });

    if (!quest || quest.status !== QuestStatus.PUBLISHED) {
      return null;
    }

    // Check if user already started this quest
    const existing = await this.participationRepository.findOne({
      where: { questId: data.questId, userId: data.userId },
    });

    if (existing) {
      // Return existing participation if not completed
      if (existing.status !== ParticipationStatus.COMPLETED) {
        return existing;
      }
      // Allow restarting completed quests
      existing.status = ParticipationStatus.STARTED;
      existing.progress = 0;
      existing.checkpointsCompleted = 0;
      existing.pointsEarned = 0;
      existing.startedAt = new Date();
      existing.completedAt = null;
      await this.participationRepository.save(existing);
      return existing;
    }

    const participation = this.participationRepository.create({
      questId: data.questId,
      userId: data.userId,
      status: ParticipationStatus.IN_PROGRESS,
      totalCheckpoints: quest.checkpoints?.length || 0,
      progress: 0,
      checkpointsCompleted: 0,
      pointsEarned: 0,
    });

    await this.participationRepository.save(participation);

    // Increment quest participant count
    await this.questRepository.increment({ questId: data.questId }, 'participantCount', 1);

    return participation;
  }

  async getParticipation(participationId: string, userId: string): Promise<QuestParticipation | null> {
    const participation = await this.participationRepository.findOne({
      where: { participationId, userId },
      relations: ['quest', 'quest.checkpoints', 'checkpointCompletions'],
    });

    if (!participation) return null;

    // Sort checkpoints by order
    if (participation.quest?.checkpoints) {
      participation.quest.checkpoints.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return participation;
  }

  async getUserParticipations(userId: string, status?: ParticipationStatus): Promise<QuestParticipation[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.participationRepository.find({
      where,
      relations: ['quest', 'quest.category'],
      order: { startedAt: 'DESC' },
    });
  }

  async completeCheckpoint(data: CompleteCheckpointDTO, userId: string): Promise<{ success: boolean; message?: string; completion?: CheckpointCompletion }> {
    const participation = await this.participationRepository.findOne({
      where: { participationId: data.participationId, userId },
      relations: ['quest', 'checkpointCompletions'],
    });

    if (!participation) {
      return { success: false, message: 'Participation not found' };
    }

    if (participation.status === ParticipationStatus.COMPLETED) {
      return { success: false, message: 'Quest already completed' };
    }

    const checkpoint = await this.checkpointRepository.findOne({
      where: { checkpointId: data.checkpointId },
    });

    if (!checkpoint || checkpoint.questId !== participation.questId) {
      return { success: false, message: 'Checkpoint not found' };
    }

    // Check if checkpoint already completed
    const existingCompletion = await this.completionRepository.findOne({
      where: { participationId: data.participationId, checkpointId: data.checkpointId },
    });

    if (existingCompletion) {
      return { success: false, message: 'Checkpoint already completed' };
    }

    // Validate checkpoint completion
    const validation = await this.validateCheckpointCompletion(checkpoint, data);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Calculate distance from checkpoint if location provided
    let distanceFromCheckpoint: number | undefined;
    if (data.latitude && data.longitude) {
      distanceFromCheckpoint = this.calculateDistance(
        data.latitude,
        data.longitude,
        checkpoint.latitude,
        checkpoint.longitude
      );
    }

    const completion = this.completionRepository.create({
      participationId: data.participationId,
      checkpointId: data.checkpointId,
      proofUrl: data.proofUrl,
      answer: data.answer,
      metadata: data.metadata,
      latitude: data.latitude,
      longitude: data.longitude,
      distanceFromCheckpoint,
      validated: validation.autoValidated,
      validationMethod: checkpoint.validationType,
    });

    await this.completionRepository.save(completion);

    // Update participation progress
    participation.checkpointsCompleted += 1;
    participation.pointsEarned += checkpoint.pointsReward;
    participation.progress = Math.round((participation.checkpointsCompleted / participation.totalCheckpoints) * 100);
    participation.lastActivityAt = new Date();

    // Check if quest is completed
    if (participation.checkpointsCompleted >= participation.totalCheckpoints) {
      participation.status = ParticipationStatus.COMPLETED;
      participation.completedAt = new Date();

      // Increment quest completion count
      await this.questRepository.increment({ questId: participation.questId }, 'completionCount', 1);
    } else {
      participation.status = ParticipationStatus.IN_PROGRESS;
    }

    await this.participationRepository.save(participation);

    return { success: true, completion };
  }

  async abandonQuest(participationId: string, userId: string): Promise<boolean> {
    const participation = await this.participationRepository.findOne({
      where: { participationId, userId },
    });

    if (!participation) return false;

    participation.status = ParticipationStatus.ABANDONED;
    participation.lastActivityAt = new Date();
    await this.participationRepository.save(participation);

    return true;
  }

  async rateQuest(participationId: string, userId: string, rating: number, review?: string): Promise<boolean> {
    const participation = await this.participationRepository.findOne({
      where: { participationId, userId },
    });

    if (!participation || participation.status !== ParticipationStatus.COMPLETED) {
      return false;
    }

    if (rating < 1 || rating > 5) {
      return false;
    }

    participation.rating = rating;
    participation.review = review;
    await this.participationRepository.save(participation);

    // Update quest average rating
    await this.updateQuestAverageRating(participation.questId);

    return true;
  }

  private async validateCheckpointCompletion(
    checkpoint: Checkpoint,
    data: CompleteCheckpointDTO
  ): Promise<{ valid: boolean; autoValidated: boolean; message?: string }> {
    switch (checkpoint.validationType) {
      case ValidationType.GPS:
        if (!data.latitude || !data.longitude) {
          return { valid: false, autoValidated: false, message: 'Location data required' };
        }

        const distance = this.calculateDistance(
          data.latitude,
          data.longitude,
          checkpoint.latitude,
          checkpoint.longitude
        );

        const distanceInMeters = distance * 1000;

        if (distanceInMeters > checkpoint.radius) {
          return {
            valid: false,
            autoValidated: false,
            message: `You must be within ${checkpoint.radius}m of the checkpoint. You are ${Math.round(distanceInMeters)}m away.`,
          };
        }

        return { valid: true, autoValidated: true };

      case ValidationType.PHOTO:
        if (!data.proofUrl) {
          return { valid: false, autoValidated: false, message: 'Photo proof required' };
        }
        return { valid: true, autoValidated: false }; // Manual validation needed

      case ValidationType.QR_CODE:
        if (!data.answer) {
          return { valid: false, autoValidated: false, message: 'QR code data required' };
        }
        if (data.answer !== checkpoint.validationData.qrCodeData) {
          return { valid: false, autoValidated: false, message: 'Invalid QR code' };
        }
        return { valid: true, autoValidated: true };

      case ValidationType.QUESTION:
        if (!data.answer) {
          return { valid: false, autoValidated: false, message: 'Answer required' };
        }
        const correctAnswer = checkpoint.validationData.correctAnswer?.toLowerCase().trim();
        const userAnswer = data.answer.toLowerCase().trim();

        if (userAnswer !== correctAnswer) {
          return { valid: false, autoValidated: false, message: 'Incorrect answer' };
        }
        return { valid: true, autoValidated: true };

      case ValidationType.TIME_BASED:
        const now = new Date();
        const startTime = new Date(checkpoint.validationData.timeStart);
        const endTime = new Date(checkpoint.validationData.timeEnd);

        if (now < startTime || now > endTime) {
          return { valid: false, autoValidated: false, message: 'Checkpoint not available at this time' };
        }
        return { valid: true, autoValidated: true };

      default:
        return { valid: true, autoValidated: false };
    }
  }

  private async updateQuestAverageRating(questId: string): Promise<void> {
    const result = await this.participationRepository
      .createQueryBuilder('participation')
      .select('AVG(participation.rating)', 'averageRating')
      .select('COUNT(participation.rating)', 'ratingCount')
      .where('participation.questId = :questId', { questId })
      .andWhere('participation.rating IS NOT NULL')
      .getRawOne();

    if (result && result.ratingCount > 0) {
      const averageRating = parseFloat(parseFloat(result.averageRating).toFixed(2));
      await this.questRepository.update({ questId }, { averageRating });
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
