import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export enum AssetCategory {
  AVATAR = 'AVATAR',
  QUEST_IMAGE = 'QUEST_IMAGE',
  QUEST_BANNER = 'QUEST_BANNER',
  CHECKPOINT_IMAGE = 'CHECKPOINT_IMAGE',
  USER_CONTENT = 'USER_CONTENT',
  ACHIEVEMENT_BADGE = 'ACHIEVEMENT_BADGE',
  OTHER = 'OTHER',
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({ schema: 'media', name: 'media_assets' })
@Index(['userId'])
@Index(['category'])
@Index(['assetType'])
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid', { name: 'asset_id' })
  assetId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: AssetType, name: 'asset_type' })
  assetType!: AssetType;

  @Column({ type: 'enum', enum: AssetCategory, name: 'category' })
  category!: AssetCategory;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName!: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName!: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize!: number;

  @Column({ type: 'text', name: 'storage_path' })
  storagePath!: string;

  @Column({ type: 'text', name: 'public_url' })
  publicUrl!: string;

  @Column({ type: 'text', name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'text', name: 'medium_url', nullable: true })
  mediumUrl?: string;

  @Column({ type: 'text', name: 'large_url', nullable: true })
  largeUrl?: string;

  @Column({ type: 'int', name: 'width', nullable: true })
  width?: number;

  @Column({ type: 'int', name: 'height', nullable: true })
  height?: number;

  @Column({ type: 'int', name: 'duration', nullable: true })
  duration?: number; // For videos/audio in seconds

  @Column({ type: 'enum', enum: ProcessingStatus, name: 'processing_status', default: ProcessingStatus.PENDING })
  processingStatus!: ProcessingStatus;

  @Column({ type: 'text', name: 'processing_error', nullable: true })
  processingError?: string;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, name: 'alt_text', nullable: true })
  altText?: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'boolean', name: 'is_public', default: true })
  isPublic!: boolean;

  @Column({ type: 'int', name: 'download_count', default: 0 })
  downloadCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
