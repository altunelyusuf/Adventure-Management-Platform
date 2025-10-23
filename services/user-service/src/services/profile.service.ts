import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import {
  UserProfile,
  UserPreferences,
  UserPrivacySettings,
  ProfileVisibility,
} from '../models';

export class ProfileService {
  private profileRepository: Repository<UserProfile>;
  private preferencesRepository: Repository<UserPreferences>;
  private privacyRepository: Repository<UserPrivacySettings>;

  constructor() {
    this.profileRepository = AppDataSource.getRepository(UserProfile);
    this.preferencesRepository = AppDataSource.getRepository(UserPreferences);
    this.privacyRepository = AppDataSource.getRepository(UserPrivacySettings);
  }

  /**
   * Create user profile (called when user registers)
   */
  async createProfile(userId: string, username: string, email: string): Promise<UserProfile> {
    // Create profile
    const profile = this.profileRepository.create({
      userId,
      username,
    });

    await this.profileRepository.save(profile);

    // Create default preferences
    const preferences = this.preferencesRepository.create({
      userId,
    });
    await this.preferencesRepository.save(preferences);

    // Create default privacy settings
    const privacy = this.privacyRepository.create({
      userId,
    });
    await this.privacyRepository.save(privacy);

    return profile;
  }

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string, requesterId?: string): Promise<UserProfile | null> {
    const profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      return null;
    }

    // Check privacy settings if requester is different from owner
    if (requesterId && requesterId !== userId) {
      const privacySettings = await this.privacyRepository.findOne({ where: { userId } });

      if (privacySettings) {
        // Apply privacy filters
        profile.locationLatitude = privacySettings.sharePreciseLocation ? profile.locationLatitude : undefined;
        profile.locationLongitude = privacySettings.sharePreciseLocation ? profile.locationLongitude : undefined;

        if (!privacySettings.showLocation) {
          profile.locationCity = undefined;
          profile.locationState = undefined;
          profile.locationCountry = undefined;
        }

        if (!privacySettings.showAge) {
          profile.dateOfBirth = undefined;
        }
      }
    }

    return profile;
  }

  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string, requesterId?: string): Promise<UserProfile | null> {
    const profile = await this.profileRepository.findOne({ where: { username } });

    if (!profile) {
      return null;
    }

    return this.getProfile(profile.userId, requesterId);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Merge updates
    Object.assign(profile, updates);

    // Don't allow updating these fields
    delete (updates as any).userId;
    delete (updates as any).id;
    delete (updates as any).createdAt;

    await this.profileRepository.save(profile);

    return profile;
  }

  /**
   * Update avatar
   */
  async updateAvatar(
    userId: string,
    avatarUrl: string,
    thumbnails: { small: string; medium: string; large: string }
  ): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.avatarUrl = avatarUrl;
    profile.avatarThumbnails = thumbnails;

    await this.profileRepository.save(profile);

    return profile;
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    await this.profileRepository.delete({ userId });
    await this.preferencesRepository.delete({ userId });
    await this.privacyRepository.delete({ userId });
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    return await this.preferencesRepository.findOne({ where: { userId } });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });

    if (!preferences) {
      // Create if not exists
      preferences = this.preferencesRepository.create({ userId, ...updates });
    } else {
      // Merge updates
      Object.assign(preferences, updates);
    }

    // Don't allow updating these fields
    delete (updates as any).userId;
    delete (updates as any).id;
    delete (updates as any).createdAt;

    await this.preferencesRepository.save(preferences);

    return preferences;
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId: string): Promise<UserPrivacySettings | null> {
    return await this.privacyRepository.findOne({ where: { userId } });
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    updates: Partial<UserPrivacySettings>
  ): Promise<UserPrivacySettings> {
    let privacy = await this.privacyRepository.findOne({ where: { userId } });

    if (!privacy) {
      // Create if not exists
      privacy = this.privacyRepository.create({ userId, ...updates });
    } else {
      // Merge updates
      Object.assign(privacy, updates);
    }

    // Don't allow updating these fields
    delete (updates as any).userId;
    delete (updates as any).id;
    delete (updates as any).createdAt;

    await this.privacyRepository.save(privacy);

    return privacy;
  }

  /**
   * Search profiles (basic search by username/display name)
   */
  async searchProfiles(query: string, limit: number = 20): Promise<UserProfile[]> {
    return await this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.username ILIKE :query', { query: `%${query}%` })
      .orWhere('profile.displayName ILIKE :query', { query: `%${query}%` })
      .limit(limit)
      .getMany();
  }

  /**
   * Update statistics (called by other services)
   */
  async updateStats(
    userId: string,
    stats: {
      questsCompleted?: number;
      questsCreated?: number;
      totalXp?: number;
      level?: number;
      followersCount?: number;
      followingCount?: number;
    }
  ): Promise<void> {
    await this.profileRepository.update({ userId }, stats);
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const query = this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.username = :username', { username });

    if (excludeUserId) {
      query.andWhere('profile.userId != :excludeUserId', { excludeUserId });
    }

    const count = await query.getCount();
    return count === 0;
  }
}
