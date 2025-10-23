import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Checkpoint, ValidationType } from '../models/Checkpoint.entity';
import { Quest } from '../models/Quest.entity';
import { config } from '../config';

export interface CreateCheckpointDTO {
  questId: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  address?: string;
  validationType: ValidationType;
  validationData?: Record<string, any>;
  pointsReward?: number;
  hints?: string[];
  isOptional?: boolean;
  images?: string[];
}

export interface UpdateCheckpointDTO {
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  address?: string;
  validationType?: ValidationType;
  validationData?: Record<string, any>;
  pointsReward?: number;
  hints?: string[];
  isOptional?: boolean;
  images?: string[];
}

export class CheckpointService {
  private checkpointRepository: Repository<Checkpoint>;
  private questRepository: Repository<Quest>;

  constructor() {
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
    this.questRepository = AppDataSource.getRepository(Quest);
  }

  async createCheckpoint(data: CreateCheckpointDTO, creatorId: string): Promise<Checkpoint | null> {
    const quest = await this.questRepository.findOne({ where: { questId: data.questId } });

    if (!quest || quest.creatorId !== creatorId) {
      return null;
    }

    // Get the next order index
    const maxOrder = await this.checkpointRepository
      .createQueryBuilder('checkpoint')
      .select('MAX(checkpoint.orderIndex)', 'maxOrder')
      .where('checkpoint.questId = :questId', { questId: data.questId })
      .getRawOne();

    const orderIndex = (maxOrder?.maxOrder || 0) + 1;

    // Calculate estimated time from previous checkpoint if applicable
    let estimatedTime: number | undefined;
    if (orderIndex > 1) {
      const previousCheckpoint = await this.checkpointRepository.findOne({
        where: { questId: data.questId, orderIndex: orderIndex - 1 },
      });

      if (previousCheckpoint) {
        const distance = this.calculateDistance(
          previousCheckpoint.latitude,
          previousCheckpoint.longitude,
          data.latitude,
          data.longitude
        );
        estimatedTime = Math.round(distance * 12); // 12 minutes per km walking
      }
    }

    const checkpoint = this.checkpointRepository.create({
      ...data,
      orderIndex,
      estimatedTime,
      radius: data.radius || config.quest.defaultCheckpointRadius,
      validationData: data.validationData || {},
    });

    await this.checkpointRepository.save(checkpoint);
    return checkpoint;
  }

  async getCheckpoint(checkpointId: string): Promise<Checkpoint | null> {
    return this.checkpointRepository.findOne({ where: { checkpointId } });
  }

  async getQuestCheckpoints(questId: string): Promise<Checkpoint[]> {
    return this.checkpointRepository.find({
      where: { questId },
      order: { orderIndex: 'ASC' },
    });
  }

  async updateCheckpoint(checkpointId: string, updates: UpdateCheckpointDTO, creatorId: string): Promise<Checkpoint | null> {
    const checkpoint = await this.checkpointRepository.findOne({
      where: { checkpointId },
      relations: ['quest'],
    });

    if (!checkpoint || checkpoint.quest.creatorId !== creatorId) {
      return null;
    }

    Object.assign(checkpoint, updates);

    // Recalculate estimated time if location changed
    if (updates.latitude !== undefined || updates.longitude !== undefined) {
      if (checkpoint.orderIndex > 1) {
        const previousCheckpoint = await this.checkpointRepository.findOne({
          where: { questId: checkpoint.questId, orderIndex: checkpoint.orderIndex - 1 },
        });

        if (previousCheckpoint) {
          const distance = this.calculateDistance(
            previousCheckpoint.latitude,
            previousCheckpoint.longitude,
            checkpoint.latitude,
            checkpoint.longitude
          );
          checkpoint.estimatedTime = Math.round(distance * 12);
        }
      }
    }

    await this.checkpointRepository.save(checkpoint);
    return checkpoint;
  }

  async deleteCheckpoint(checkpointId: string, creatorId: string): Promise<boolean> {
    const checkpoint = await this.checkpointRepository.findOne({
      where: { checkpointId },
      relations: ['quest'],
    });

    if (!checkpoint || checkpoint.quest.creatorId !== creatorId) {
      return false;
    }

    const questId = checkpoint.questId;
    const deletedOrder = checkpoint.orderIndex;

    await this.checkpointRepository.remove(checkpoint);

    // Reorder remaining checkpoints
    await this.checkpointRepository
      .createQueryBuilder()
      .update(Checkpoint)
      .set({ orderIndex: () => '"order_index" - 1' })
      .where('questId = :questId AND orderIndex > :deletedOrder', { questId, deletedOrder })
      .execute();

    return true;
  }

  async reorderCheckpoints(questId: string, checkpointOrders: { checkpointId: string; orderIndex: number }[], creatorId: string): Promise<boolean> {
    const quest = await this.questRepository.findOne({ where: { questId } });

    if (!quest || quest.creatorId !== creatorId) {
      return false;
    }

    for (const { checkpointId, orderIndex } of checkpointOrders) {
      await this.checkpointRepository.update({ checkpointId }, { orderIndex });
    }

    // Recalculate estimated times for all checkpoints
    await this.recalculateEstimatedTimes(questId);

    return true;
  }

  async recalculateEstimatedTimes(questId: string): Promise<void> {
    const checkpoints = await this.checkpointRepository.find({
      where: { questId },
      order: { orderIndex: 'ASC' },
    });

    for (let i = 1; i < checkpoints.length; i++) {
      const prev = checkpoints[i - 1];
      const current = checkpoints[i];

      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        current.latitude,
        current.longitude
      );

      current.estimatedTime = Math.round(distance * 12);
      await this.checkpointRepository.save(current);
    }

    // Update quest total distance
    if (checkpoints.length > 1) {
      const firstCheckpoint = checkpoints[0];
      const lastCheckpoint = checkpoints[checkpoints.length - 1];

      const totalDistance = checkpoints.reduce((sum, checkpoint, index) => {
        if (index === 0) return 0;
        const prev = checkpoints[index - 1];
        return sum + this.calculateDistance(prev.latitude, prev.longitude, checkpoint.latitude, checkpoint.longitude);
      }, 0);

      await this.questRepository.update(
        { questId },
        {
          totalDistance: parseFloat(totalDistance.toFixed(2)),
          startLatitude: firstCheckpoint.latitude,
          startLongitude: firstCheckpoint.longitude,
        }
      );
    }
  }

  validateCheckpointData(validationType: ValidationType, validationData: Record<string, any>): string[] {
    const errors: string[] = [];

    switch (validationType) {
      case ValidationType.PHOTO:
        if (!validationData.photoPrompt) {
          errors.push('Photo prompt is required for photo checkpoints');
        }
        break;

      case ValidationType.QR_CODE:
        if (!validationData.qrCodeData) {
          errors.push('QR code data is required for QR code checkpoints');
        }
        break;

      case ValidationType.QUESTION:
        if (!validationData.question || !validationData.correctAnswer) {
          errors.push('Question and correct answer are required for question checkpoints');
        }
        break;

      case ValidationType.TIME_BASED:
        if (!validationData.timeStart || !validationData.timeEnd) {
          errors.push('Time range is required for time-based checkpoints');
        }
        break;
    }

    return errors;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
