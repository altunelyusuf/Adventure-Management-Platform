import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ schema: 'quests', name: 'quest_bookmarks' })
@Index(['userId'])
@Index(['questId'])
@Index(['userId', 'questId'], { unique: true })
export class QuestBookmark {
  @PrimaryGeneratedColumn('uuid', { name: 'bookmark_id' })
  bookmarkId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'quest_id' })
  questId!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;
}
