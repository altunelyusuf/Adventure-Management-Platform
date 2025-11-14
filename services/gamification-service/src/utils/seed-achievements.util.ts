import { AppDataSource } from '../config/database';
import { Achievement, AchievementCategory, AchievementRarity } from '../models/Achievement.entity';

const DEFAULT_ACHIEVEMENTS = [
  // Quest Completion Achievements
  {
    name: 'First Steps',
    description: 'Complete your first quest',
    category: AchievementCategory.QUEST_COMPLETION,
    rarity: AchievementRarity.COMMON,
    xpReward: 100,
    coinReward: 50,
    requirements: { type: 'QUEST_COUNT', target: 1 },
    isHidden: false,
  },
  {
    name: 'Getting Started',
    description: 'Complete 5 quests',
    category: AchievementCategory.QUEST_COMPLETION,
    rarity: AchievementRarity.COMMON,
    xpReward: 200,
    coinReward: 100,
    requirements: { type: 'QUEST_COUNT', target: 5 },
    isHidden: false,
  },
  {
    name: 'Adventurer',
    description: 'Complete 25 quests',
    category: AchievementCategory.QUEST_COMPLETION,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 500,
    coinReward: 250,
    requirements: { type: 'QUEST_COUNT', target: 25 },
    isHidden: false,
  },
  {
    name: 'Explorer',
    description: 'Complete 50 quests',
    category: AchievementCategory.QUEST_COMPLETION,
    rarity: AchievementRarity.RARE,
    xpReward: 1000,
    coinReward: 500,
    requirements: { type: 'QUEST_COUNT', target: 50 },
    isHidden: false,
  },
  {
    name: 'Master Adventurer',
    description: 'Complete 100 quests',
    category: AchievementCategory.QUEST_COMPLETION,
    rarity: AchievementRarity.EPIC,
    xpReward: 2500,
    coinReward: 1000,
    requirements: { type: 'QUEST_COUNT', target: 100 },
    isHidden: false,
  },
  {
    name: 'Legend',
    description: 'Complete 500 quests',
    category: AchievementCategory.QUEST_COMPLETION,
    rarity: AchievementRarity.LEGENDARY,
    xpReward: 10000,
    coinReward: 5000,
    requirements: { type: 'QUEST_COUNT', target: 500 },
    isHidden: false,
  },

  // Distance Achievements
  {
    name: 'First Mile',
    description: 'Travel 1 km total distance',
    category: AchievementCategory.DISTANCE_TRAVELED,
    rarity: AchievementRarity.COMMON,
    xpReward: 100,
    coinReward: 50,
    requirements: { type: 'TOTAL_DISTANCE', target: 1 },
    isHidden: false,
  },
  {
    name: 'Marathon Runner',
    description: 'Travel 42 km total distance',
    category: AchievementCategory.DISTANCE_TRAVELED,
    rarity: AchievementRarity.RARE,
    xpReward: 1000,
    coinReward: 500,
    requirements: { type: 'TOTAL_DISTANCE', target: 42 },
    isHidden: false,
  },
  {
    name: 'World Traveler',
    description: 'Travel 1000 km total distance',
    category: AchievementCategory.DISTANCE_TRAVELED,
    rarity: AchievementRarity.EPIC,
    xpReward: 5000,
    coinReward: 2500,
    requirements: { type: 'TOTAL_DISTANCE', target: 1000 },
    isHidden: false,
  },

  // Social Achievements
  {
    name: 'Social Butterfly',
    description: 'Add 5 friends',
    category: AchievementCategory.SOCIAL,
    rarity: AchievementRarity.COMMON,
    xpReward: 200,
    coinReward: 100,
    requirements: { type: 'FRIEND_COUNT', target: 5 },
    isHidden: false,
  },
  {
    name: 'Influencer',
    description: 'Get 50 followers',
    category: AchievementCategory.SOCIAL,
    rarity: AchievementRarity.RARE,
    xpReward: 1000,
    coinReward: 500,
    requirements: { type: 'FOLLOWER_COUNT', target: 50 },
    isHidden: false,
  },

  // Speed Achievements
  {
    name: 'Speed Demon',
    description: 'Complete a quest in under target time',
    category: AchievementCategory.SPEED,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 300,
    coinReward: 150,
    requirements: { type: 'SPEED_COMPLETION', target: 1 },
    isHidden: false,
  },
  {
    name: 'Speedrunner',
    description: 'Complete 10 quests under target time',
    category: AchievementCategory.SPEED,
    rarity: AchievementRarity.RARE,
    xpReward: 1500,
    coinReward: 750,
    requirements: { type: 'SPEED_COMPLETION', target: 10 },
    isHidden: false,
  },

  // Milestone Achievements
  {
    name: 'Level 10',
    description: 'Reach level 10',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 500,
    coinReward: 250,
    requirements: { type: 'LEVEL', target: 10 },
    isHidden: false,
  },
  {
    name: 'Level 25',
    description: 'Reach level 25',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.RARE,
    xpReward: 1000,
    coinReward: 500,
    requirements: { type: 'LEVEL', target: 25 },
    isHidden: false,
  },
  {
    name: 'Level 50',
    description: 'Reach level 50',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.EPIC,
    xpReward: 2500,
    coinReward: 1000,
    requirements: { type: 'LEVEL', target: 50 },
    isHidden: false,
  },
  {
    name: 'Level 100',
    description: 'Reach maximum level',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.LEGENDARY,
    xpReward: 10000,
    coinReward: 5000,
    requirements: { type: 'LEVEL', target: 100 },
    isHidden: false,
  },

  // Special/Hidden Achievements
  {
    name: 'Early Bird',
    description: 'Complete a quest before 6 AM',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.RARE,
    xpReward: 500,
    coinReward: 250,
    requirements: { type: 'SPECIAL_TIME', target: 1 },
    isHidden: true,
  },
  {
    name: 'Night Owl',
    description: 'Complete a quest after midnight',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.RARE,
    xpReward: 500,
    coinReward: 250,
    requirements: { type: 'SPECIAL_TIME', target: 1 },
    isHidden: true,
  },
];

export async function seedAchievements(): Promise<void> {
  const achievementRepository = AppDataSource.getRepository(Achievement);

  for (const achievementData of DEFAULT_ACHIEVEMENTS) {
    const existing = await achievementRepository.findOne({
      where: { name: achievementData.name },
    });

    if (!existing) {
      const achievement = achievementRepository.create(achievementData);
      await achievementRepository.save(achievement);
      console.log(`✅ Created achievement: ${achievementData.name}`);
    }
  }

  console.log('✅ Achievement seeding complete');
}
