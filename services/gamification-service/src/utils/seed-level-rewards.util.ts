import { AppDataSource } from '../config/database';
import { LevelReward, RewardType } from '../models/LevelReward.entity';

export async function seedLevelRewards(): Promise<void> {
  const levelRewardRepository = AppDataSource.getRepository(LevelReward);

  // Define milestone levels
  const milestones = [5, 10, 25, 50, 75, 100];

  // Create rewards for levels 1-100
  for (let level = 1; level <= 100; level++) {
    const existing = await levelRewardRepository.findOne({
      where: { level },
    });

    if (!existing) {
      const isMilestone = milestones.includes(level);
      const baseCoins = 100;
      const coinMultiplier = isMilestone ? 10 : 1;

      const rewards: any[] = [
        {
          type: RewardType.CURRENCY,
          value: baseCoins * coinMultiplier,
          description: `${baseCoins * coinMultiplier} coins`,
        },
      ];

      // Special rewards for milestones
      let milestoneDescription: string | undefined;

      if (level === 5) {
        milestoneDescription = 'Unlocked: Quest Creation';
        rewards.push({
          type: RewardType.FEATURE_UNLOCK,
          value: 'QUEST_CREATION',
          description: 'Unlock quest creation feature',
        });
      } else if (level === 10) {
        milestoneDescription = 'Unlocked: Team Quests';
        rewards.push({
          type: RewardType.FEATURE_UNLOCK,
          value: 'TEAM_QUESTS',
          description: 'Unlock team quest feature',
        });
      } else if (level === 25) {
        milestoneDescription = 'Unlocked: Profile Customization';
        rewards.push({
          type: RewardType.FEATURE_UNLOCK,
          value: 'PROFILE_CUSTOMIZATION',
          description: 'Unlock profile customization',
        });
      } else if (level === 50) {
        milestoneDescription = 'Unlocked: Exclusive Quests';
        rewards.push({
          type: RewardType.FEATURE_UNLOCK,
          value: 'EXCLUSIVE_QUESTS',
          description: 'Access to exclusive premium quests',
        });
      } else if (level === 75) {
        milestoneDescription = 'Unlocked: Advanced Analytics';
        rewards.push({
          type: RewardType.FEATURE_UNLOCK,
          value: 'ADVANCED_ANALYTICS',
          description: 'Access to advanced quest analytics',
        });
      } else if (level === 100) {
        milestoneDescription = 'MAX LEVEL: Lifetime Premium';
        rewards.push({
          type: RewardType.FEATURE_UNLOCK,
          value: 'LIFETIME_PREMIUM',
          description: 'Lifetime premium membership',
        });
      }

      const levelReward = levelRewardRepository.create({
        level,
        coinReward: baseCoins * coinMultiplier,
        rewards,
        isMilestone,
        milestoneDescription,
      });

      await levelRewardRepository.save(levelReward);
    }
  }

  console.log('✅ Level rewards seeding complete (100 levels)');
}
