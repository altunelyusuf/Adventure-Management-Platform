import { AppDataSource } from '../config/database';
import { Challenge, ChallengeType, ChallengeDifficulty } from '../models/Challenge.entity';
import { addDays, startOfDay, endOfDay } from 'date-fns';

export async function seedChallenges(): Promise<void> {
  const challengeRepository = AppDataSource.getRepository(Challenge);

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Daily Challenges
  const dailyChallenges = [
    {
      name: 'Daily Quest',
      description: 'Complete 1 quest today',
      type: ChallengeType.DAILY,
      difficulty: ChallengeDifficulty.EASY,
      requirements: { type: 'COMPLETE_QUESTS', target: 1 },
      xpReward: 200,
      coinReward: 50,
      startDate: startOfToday,
      endDate: endOfToday,
      isActive: true,
    },
    {
      name: 'Double Trouble',
      description: 'Complete 2 quests today',
      type: ChallengeType.DAILY,
      difficulty: ChallengeDifficulty.MEDIUM,
      requirements: { type: 'COMPLETE_QUESTS', target: 2 },
      xpReward: 500,
      coinReward: 100,
      startDate: startOfToday,
      endDate: endOfToday,
      isActive: true,
    },
    {
      name: 'Distance Walker',
      description: 'Travel 5 km today',
      type: ChallengeType.DAILY,
      difficulty: ChallengeDifficulty.MEDIUM,
      requirements: { type: 'TRAVEL_DISTANCE', target: 5 },
      xpReward: 300,
      coinReward: 75,
      startDate: startOfToday,
      endDate: endOfToday,
      isActive: true,
    },
  ];

  // Weekly Challenges
  const startOfWeek = startOfDay(today);
  const endOfWeek = endOfDay(addDays(today, 7));

  const weeklyChallenges = [
    {
      name: 'Weekly Explorer',
      description: 'Complete 5 quests this week',
      type: ChallengeType.WEEKLY,
      difficulty: ChallengeDifficulty.MEDIUM,
      requirements: { type: 'COMPLETE_QUESTS', target: 5 },
      xpReward: 1000,
      coinReward: 250,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isActive: true,
    },
    {
      name: 'Social Week',
      description: 'Add 3 friends this week',
      type: ChallengeType.WEEKLY,
      difficulty: ChallengeDifficulty.EASY,
      requirements: { type: 'ADD_FRIENDS', target: 3 },
      xpReward: 500,
      coinReward: 100,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isActive: true,
    },
    {
      name: 'Long Distance',
      description: 'Travel 25 km this week',
      type: ChallengeType.WEEKLY,
      difficulty: ChallengeDifficulty.HARD,
      requirements: { type: 'TRAVEL_DISTANCE', target: 25 },
      xpReward: 1500,
      coinReward: 500,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isActive: true,
    },
  ];

  const allChallenges = [...dailyChallenges, ...weeklyChallenges];

  for (const challengeData of allChallenges) {
    const existing = await challengeRepository.findOne({
      where: {
        name: challengeData.name,
        type: challengeData.type,
      },
    });

    if (!existing) {
      const challenge = challengeRepository.create(challengeData);
      await challengeRepository.save(challenge);
      console.log(`✅ Created challenge: ${challengeData.name}`);
    }
  }

  console.log('✅ Challenge seeding complete');
}
