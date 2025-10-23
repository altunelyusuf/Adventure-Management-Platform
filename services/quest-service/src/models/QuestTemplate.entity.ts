import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { QuestDifficulty } from './Quest.entity';

@Entity({ schema: 'quests', name: 'quest_templates' })
@Index(['creatorId'])
@Index(['isPublic'])
@Index(['categoryId'])
export class QuestTemplate {
  @PrimaryGeneratedColumn('uuid', { name: 'template_id' })
  templateId!: string;

  @Column({ type: 'uuid', name: 'creator_id', nullable: true })
  creatorId?: string;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId?: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: QuestDifficulty, nullable: true })
  difficulty?: QuestDifficulty;

  @Column({ type: 'boolean', name: 'is_public', default: false })
  isPublic!: boolean;

  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean;

  @Column({ type: 'jsonb', name: 'template_data' })
  templateData!: {
    questStructure: {
      title?: string;
      description?: string;
      shortDescription?: string;
      tags?: string[];
      estimatedDuration?: number;
      isPremium?: boolean;
    };
    checkpointStructure: Array<{
      title: string;
      description?: string;
      validationType: string;
      validationData?: Record<string, any>;
      pointsReward?: number;
      hints?: string[];
      isOptional?: boolean;
    }>;
  };

  @Column({ type: 'integer', name: 'usage_count', default: 0 })
  usageCount!: number;

  @Column({ type: 'varchar', length: 255, name: 'preview_image_url', nullable: true })
  previewImageUrl?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}
