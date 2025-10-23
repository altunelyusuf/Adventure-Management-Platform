import { AppDataSource } from '../config/database';
import { QuestTemplate } from '../models/QuestTemplate.entity';
import { QuestDifficulty } from '../models/Quest.entity';
import { ValidationType } from '../models/Checkpoint.entity';

const DEFAULT_TEMPLATES = [
  {
    name: 'City Walking Tour',
    description: 'Guided tour template with historical stops and cultural landmarks',
    difficulty: QuestDifficulty.EASY,
    isPublic: true,
    isSystem: true,
    templateData: {
      questStructure: {
        title: 'Historic [City Name] Walking Tour',
        description: 'Explore the rich history and culture of [City Name] through this carefully curated walking tour.',
        shortDescription: 'Discover [City Name]\'s history',
        tags: ['history', 'walking', 'culture'],
        estimatedDuration: 120,
      },
      checkpointStructure: [
        {
          title: 'Main Square',
          description: 'Start at the historic main square',
          validationType: ValidationType.GPS,
          pointsReward: 100,
        },
        {
          title: 'Historic Building',
          description: 'Visit this iconic building',
          validationType: ValidationType.PHOTO,
          validationData: { requirePhoto: true, photoPrompt: 'Take a photo of the building' },
          pointsReward: 150,
        },
        {
          title: 'Cultural Landmark',
          description: 'Explore this cultural site',
          validationType: ValidationType.GPS,
          pointsReward: 100,
        },
      ],
    },
    usageCount: 0,
  },
  {
    name: 'Scavenger Hunt',
    description: 'Fun scavenger hunt with photo challenges and puzzles',
    difficulty: QuestDifficulty.MEDIUM,
    isPublic: true,
    isSystem: true,
    templateData: {
      questStructure: {
        title: '[Theme] Scavenger Hunt',
        description: 'An exciting scavenger hunt with photo challenges and brain teasers!',
        shortDescription: 'Find hidden treasures',
        tags: ['scavenger', 'photos', 'fun'],
        estimatedDuration: 90,
      },
      checkpointStructure: [
        {
          title: 'Find the Red Door',
          description: 'Locate and photograph a red door',
          validationType: ValidationType.PHOTO,
          validationData: { requirePhoto: true, photoPrompt: 'Photo of a red door' },
          pointsReward: 200,
        },
        {
          title: 'Riddle Location',
          description: 'Solve the riddle to find the next location',
          validationType: ValidationType.QUESTION,
          validationData: { question: 'What has keys but no locks?', correctAnswer: 'piano' },
          pointsReward: 300,
        },
        {
          title: 'QR Code Hunt',
          description: 'Find and scan the QR code',
          validationType: ValidationType.QR_CODE,
          validationData: { qrCodeData: 'SAMPLE_QR_CODE' },
          pointsReward: 250,
        },
      ],
    },
    usageCount: 0,
  },
  {
    name: 'Fitness Challenge',
    description: 'Distance-based fitness route with timed challenges',
    difficulty: QuestDifficulty.HARD,
    isPublic: true,
    isSystem: true,
    templateData: {
      questStructure: {
        title: '[Distance] Fitness Challenge',
        description: 'Push your limits with this fitness-focused route combining distance and challenges.',
        shortDescription: 'Get fit while exploring',
        tags: ['fitness', 'running', 'challenge'],
        estimatedDuration: 60,
      },
      checkpointStructure: [
        {
          title: 'Starting Point',
          description: 'Begin your fitness journey here',
          validationType: ValidationType.GPS,
          pointsReward: 50,
        },
        {
          title: '1km Marker',
          description: 'You\'ve run 1 kilometer!',
          validationType: ValidationType.GPS,
          pointsReward: 100,
        },
        {
          title: '2km Marker',
          description: 'Keep going, you\'re doing great!',
          validationType: ValidationType.GPS,
          pointsReward: 150,
        },
        {
          title: 'Finish Line',
          description: 'Congratulations on completing the challenge!',
          validationType: ValidationType.GPS,
          pointsReward: 300,
        },
      ],
    },
    usageCount: 0,
  },
  {
    name: 'Food Tour',
    description: 'Culinary journey through local restaurants and food spots',
    difficulty: QuestDifficulty.EASY,
    isPublic: true,
    isSystem: true,
    templateData: {
      questStructure: {
        title: '[Cuisine Type] Food Tour',
        description: 'Taste your way through the best [cuisine] spots in the area!',
        shortDescription: 'Culinary adventure',
        tags: ['food', 'restaurants', 'culinary'],
        estimatedDuration: 180,
      },
      checkpointStructure: [
        {
          title: 'Appetizer Stop',
          description: 'Start with delicious appetizers',
          validationType: ValidationType.PHOTO,
          validationData: { requirePhoto: true, photoPrompt: 'Photo of your appetizer' },
          pointsReward: 150,
        },
        {
          title: 'Main Course',
          description: 'Enjoy the main dish',
          validationType: ValidationType.PHOTO,
          validationData: { requirePhoto: true, photoPrompt: 'Photo of your main course' },
          pointsReward: 200,
        },
        {
          title: 'Dessert Destination',
          description: 'End with something sweet',
          validationType: ValidationType.PHOTO,
          validationData: { requirePhoto: true, photoPrompt: 'Photo of your dessert' },
          pointsReward: 150,
        },
      ],
    },
    usageCount: 0,
  },
  {
    name: 'Mystery Trail',
    description: 'Story-driven mystery with sequential clues and challenges',
    difficulty: QuestDifficulty.HARD,
    isPublic: true,
    isSystem: true,
    templateData: {
      questStructure: {
        title: '[Mystery Theme] Trail',
        description: 'Follow the clues and solve the mystery in this thrilling adventure!',
        shortDescription: 'Solve the mystery',
        tags: ['mystery', 'story', 'adventure'],
        estimatedDuration: 150,
      },
      checkpointStructure: [
        {
          title: 'The Crime Scene',
          description: 'Investigate the scene',
          validationType: ValidationType.GPS,
          hints: ['Look for clues near the entrance'],
          pointsReward: 150,
        },
        {
          title: 'First Clue',
          description: 'What do you discover?',
          validationType: ValidationType.QUESTION,
          validationData: { question: 'What color was the suspect wearing?', correctAnswer: 'blue' },
          hints: ['Check the witness statements'],
          pointsReward: 200,
        },
        {
          title: 'Hidden Evidence',
          description: 'Find the hidden evidence',
          validationType: ValidationType.QR_CODE,
          validationData: { qrCodeData: 'EVIDENCE_CODE' },
          pointsReward: 250,
        },
        {
          title: 'Final Confrontation',
          description: 'Solve the mystery!',
          validationType: ValidationType.QUESTION,
          validationData: { question: 'Who is the culprit?', correctAnswer: 'butler' },
          pointsReward: 400,
        },
      ],
    },
    usageCount: 0,
  },
];

export async function seedQuestTemplates(): Promise<void> {
  const templateRepository = AppDataSource.getRepository(QuestTemplate);

  console.log('🌱 Seeding quest templates...');

  for (const templateData of DEFAULT_TEMPLATES) {
    const existing = await templateRepository.findOne({ where: { name: templateData.name, isSystem: true } });

    if (!existing) {
      const template = templateRepository.create(templateData);
      await templateRepository.save(template);
      console.log(`  ✓ Created template: ${templateData.name}`);
    } else {
      console.log(`  ⊘ Template already exists: ${templateData.name}`);
    }
  }

  console.log('✅ Quest templates seeded successfully');
}
