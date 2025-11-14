import { AppDataSource } from '../config/database';
import { Badge, BadgeTier } from '../models/Badge.entity';

const DEFAULT_BADGES = [
  // Bronze Badges
  {
    name: 'Newbie',
    description: 'Started your adventure journey',
    tier: BadgeTier.BRONZE,
    color: '#CD7F32',
    isExclusive: false,
    requiredLevel: 1,
  },
  {
    name: 'Explorer',
    description: 'Completed 5 quests',
    tier: BadgeTier.BRONZE,
    color: '#CD7F32',
    isExclusive: false,
    requiredLevel: 5,
  },

  // Silver Badges
  {
    name: 'Adventurer',
    description: 'Reached level 10',
    tier: BadgeTier.SILVER,
    color: '#C0C0C0',
    isExclusive: false,
    requiredLevel: 10,
  },
  {
    name: 'Dedicated',
    description: '7-day login streak',
    tier: BadgeTier.SILVER,
    color: '#C0C0C0',
    isExclusive: false,
  },

  // Gold Badges
  {
    name: 'Master',
    description: 'Reached level 25',
    tier: BadgeTier.GOLD,
    color: '#FFD700',
    isExclusive: false,
    requiredLevel: 25,
  },
  {
    name: 'Completionist',
    description: 'Completed 50 quests',
    tier: BadgeTier.GOLD,
    color: '#FFD700',
    isExclusive: false,
  },

  // Platinum Badges
  {
    name: 'Legend',
    description: 'Reached level 50',
    tier: BadgeTier.PLATINUM,
    color: '#E5E4E2',
    isExclusive: false,
    requiredLevel: 50,
  },
  {
    name: 'Marathon',
    description: '30-day login streak',
    tier: BadgeTier.PLATINUM,
    color: '#E5E4E2',
    isExclusive: false,
  },

  // Diamond Badges (Exclusive)
  {
    name: 'Mythic',
    description: 'Reached level 100',
    tier: BadgeTier.DIAMOND,
    color: '#B9F2FF',
    isExclusive: true,
    requiredLevel: 100,
  },
  {
    name: 'Century Club',
    description: 'Completed 100 quests',
    tier: BadgeTier.DIAMOND,
    color: '#B9F2FF',
    isExclusive: true,
  },
  {
    name: 'Eternal',
    description: '365-day login streak',
    tier: BadgeTier.DIAMOND,
    color: '#B9F2FF',
    isExclusive: true,
  },
];

export async function seedBadges(): Promise<void> {
  const badgeRepository = AppDataSource.getRepository(Badge);

  for (const badgeData of DEFAULT_BADGES) {
    const existing = await badgeRepository.findOne({
      where: { name: badgeData.name },
    });

    if (!existing) {
      const badge = badgeRepository.create(badgeData);
      await badgeRepository.save(badge);
      console.log(`✅ Created badge: ${badgeData.name}`);
    }
  }

  console.log('✅ Badge seeding complete');
}
