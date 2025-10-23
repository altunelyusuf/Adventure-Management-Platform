import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { QuestTemplate } from '../models/QuestTemplate.entity';
import { Quest, QuestDifficulty, QuestStatus } from '../models/Quest.entity';
import { Checkpoint } from '../models/Checkpoint.entity';
import { QuestService } from './quest.service';
import { CheckpointService } from './checkpoint.service';

export interface CreateTemplateDTO {
  name: string;
  description?: string;
  difficulty?: QuestDifficulty;
  categoryId?: string;
  isPublic?: boolean;
  questId: string;
}

export class TemplateService {
  private templateRepository: Repository<QuestTemplate>;
  private questRepository: Repository<Quest>;
  private checkpointRepository: Repository<Checkpoint>;
  private questService: QuestService;
  private checkpointService: CheckpointService;

  constructor() {
    this.templateRepository = AppDataSource.getRepository(QuestTemplate);
    this.questRepository = AppDataSource.getRepository(Quest);
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
    this.questService = new QuestService();
    this.checkpointService = new CheckpointService();
  }

  async getAllTemplates(isPublicOnly: boolean = true): Promise<QuestTemplate[]> {
    const where: any = {};
    if (isPublicOnly) {
      where.isPublic = true;
    }

    return this.templateRepository.find({
      where,
      order: { usageCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async getTemplate(templateId: string): Promise<QuestTemplate | null> {
    return this.templateRepository.findOne({ where: { templateId } });
  }

  async getCreatorTemplates(creatorId: string): Promise<QuestTemplate[]> {
    return this.templateRepository.find({
      where: { creatorId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTemplateFromQuest(data: CreateTemplateDTO, creatorId: string): Promise<QuestTemplate | null> {
    const quest = await this.questRepository.findOne({
      where: { questId: data.questId },
      relations: ['checkpoints'],
    });

    if (!quest || quest.creatorId !== creatorId) {
      return null;
    }

    const checkpointStructure = quest.checkpoints
      ?.sort((a, b) => a.orderIndex - b.orderIndex)
      .map((checkpoint) => ({
        title: checkpoint.title,
        description: checkpoint.description,
        validationType: checkpoint.validationType,
        validationData: checkpoint.validationData,
        pointsReward: checkpoint.pointsReward,
        hints: checkpoint.hints,
        isOptional: checkpoint.isOptional,
      })) || [];

    const template = this.templateRepository.create({
      creatorId,
      name: data.name,
      description: data.description,
      difficulty: data.difficulty || quest.difficulty,
      categoryId: data.categoryId || quest.categoryId,
      isPublic: data.isPublic || false,
      isSystem: false,
      templateData: {
        questStructure: {
          title: quest.title,
          description: quest.description,
          shortDescription: quest.shortDescription,
          tags: quest.tags,
          estimatedDuration: quest.estimatedDuration,
          isPremium: quest.isPremium,
        },
        checkpointStructure,
      },
      usageCount: 0,
    });

    await this.templateRepository.save(template);
    return template;
  }

  async createQuestFromTemplate(templateId: string, creatorId: string, customizations?: {
    title?: string;
    description?: string;
    tags?: string[];
  }): Promise<Quest | null> {
    const template = await this.templateRepository.findOne({ where: { templateId } });

    if (!template) {
      return null;
    }

    // Check if template is accessible
    if (!template.isPublic && template.creatorId !== creatorId && !template.isSystem) {
      return null;
    }

    // Create quest from template
    const questData = {
      creatorId,
      title: customizations?.title || template.templateData.questStructure.title || 'Untitled Quest',
      description: customizations?.description || template.templateData.questStructure.description,
      shortDescription: template.templateData.questStructure.shortDescription,
      difficulty: template.difficulty || QuestDifficulty.MEDIUM,
      categoryId: template.categoryId,
      tags: customizations?.tags || template.templateData.questStructure.tags,
      estimatedDuration: template.templateData.questStructure.estimatedDuration,
      isPremium: template.templateData.questStructure.isPremium,
    };

    const quest = await this.questService.createQuest(questData);

    // Create checkpoints from template
    for (const checkpointData of template.templateData.checkpointStructure) {
      await this.checkpointService.createCheckpoint(
        {
          questId: quest.questId,
          ...checkpointData,
          // Default location - user needs to update these
          latitude: 0,
          longitude: 0,
        },
        creatorId
      );
    }

    // Increment usage count
    await this.templateRepository.increment({ templateId }, 'usageCount', 1);

    return quest;
  }

  async deleteTemplate(templateId: string, creatorId: string): Promise<boolean> {
    const template = await this.templateRepository.findOne({ where: { templateId } });

    if (!template || template.creatorId !== creatorId || template.isSystem) {
      return false;
    }

    await this.templateRepository.remove(template);
    return true;
  }

  async updateTemplate(templateId: string, creatorId: string, updates: Partial<QuestTemplate>): Promise<QuestTemplate | null> {
    const template = await this.templateRepository.findOne({ where: { templateId } });

    if (!template || template.creatorId !== creatorId || template.isSystem) {
      return null;
    }

    Object.assign(template, updates);
    await this.templateRepository.save(template);
    return template;
  }
}
