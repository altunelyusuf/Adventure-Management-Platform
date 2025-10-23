import { AppDataSource } from '../config/database';
import { QuestCategory } from '../models/QuestCategory.entity';
import slugify from 'slugify';

const DEFAULT_CATEGORIES = [
  { name: 'Adventure', description: 'Outdoor adventures and exploration', color: '#FF5722', icon: '🏔️' },
  { name: 'Mystery', description: 'Solve puzzles and uncover secrets', color: '#9C27B0', icon: '🔍' },
  { name: 'Historical', description: 'Discover historical landmarks and stories', color: '#795548', icon: '🏛️' },
  { name: 'Food & Drink', description: 'Culinary tours and food exploration', color: '#FF9800', icon: '🍽️' },
  { name: 'Fitness', description: 'Active challenges and exercise routes', color: '#4CAF50', icon: '💪' },
  { name: 'Educational', description: 'Learn while you explore', color: '#2196F3', icon: '📚' },
  { name: 'Cultural', description: 'Experience local culture and art', color: '#E91E63', icon: '🎭' },
  { name: 'Nature', description: 'Parks, trails, and natural wonders', color: '#8BC34A', icon: '🌲' },
  { name: 'Urban', description: 'City exploration and urban adventures', color: '#607D8B', icon: '🏙️' },
  { name: 'Other', description: 'Unique quests that don\'t fit other categories', color: '#9E9E9E', icon: '✨' },
];

export async function seedQuestCategories(): Promise<void> {
  const categoryRepository = AppDataSource.getRepository(QuestCategory);

  console.log('🌱 Seeding quest categories...');

  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const categoryData = DEFAULT_CATEGORIES[i];
    const slug = slugify(categoryData.name, { lower: true });

    const existing = await categoryRepository.findOne({ where: { slug } });

    if (!existing) {
      const category = categoryRepository.create({
        name: categoryData.name,
        slug,
        description: categoryData.description,
        color: categoryData.color,
        displayOrder: i + 1,
        isActive: true,
      });

      await categoryRepository.save(category);
      console.log(`  ✓ Created category: ${categoryData.name}`);
    } else {
      console.log(`  ⊘ Category already exists: ${categoryData.name}`);
    }
  }

  console.log('✅ Quest categories seeded successfully');
}
