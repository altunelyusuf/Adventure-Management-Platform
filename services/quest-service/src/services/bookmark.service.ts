import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { QuestBookmark } from '../models/QuestBookmark.entity';
import { Quest } from '../models/Quest.entity';

export class BookmarkService {
  private bookmarkRepository: Repository<QuestBookmark>;
  private questRepository: Repository<Quest>;

  constructor() {
    this.bookmarkRepository = AppDataSource.getRepository(QuestBookmark);
    this.questRepository = AppDataSource.getRepository(Quest);
  }

  async addBookmark(userId: string, questId: string, notes?: string): Promise<QuestBookmark> {
    // Check if bookmark already exists
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, questId },
    });

    if (existing) {
      // Update notes if provided
      if (notes !== undefined) {
        existing.notes = notes;
        await this.bookmarkRepository.save(existing);
      }
      return existing;
    }

    const bookmark = this.bookmarkRepository.create({
      userId,
      questId,
      notes,
    });

    await this.bookmarkRepository.save(bookmark);
    return bookmark;
  }

  async removeBookmark(userId: string, questId: string): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, questId },
    });

    if (!bookmark) {
      return false;
    }

    await this.bookmarkRepository.remove(bookmark);
    return true;
  }

  async getUserBookmarks(userId: string): Promise<Array<QuestBookmark & { quest: Quest }>> {
    const bookmarks = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.quest', 'quest')
      .leftJoinAndSelect('quest.category', 'category')
      .where('bookmark.userId = :userId', { userId })
      .orderBy('bookmark.createdAt', 'DESC')
      .getMany();

    return bookmarks as any;
  }

  async isBookmarked(userId: string, questId: string): Promise<boolean> {
    const count = await this.bookmarkRepository.count({
      where: { userId, questId },
    });

    return count > 0;
  }

  async getBookmarkCount(questId: string): Promise<number> {
    return this.bookmarkRepository.count({
      where: { questId },
    });
  }

  async updateNotes(userId: string, questId: string, notes: string): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, questId },
    });

    if (!bookmark) {
      return false;
    }

    bookmark.notes = notes;
    await this.bookmarkRepository.save(bookmark);
    return true;
  }
}
