# Epic 2.1 & 2.2 Complete: Quest Features Enhancement & Advanced Discovery

**Status**: ✅ Complete
**Story Points**: 41 SP
**Date**: 2025-10-23
**Branch**: `claude/init-adventure-platform-011CUPtDVWZMN8S6fNQHPnK2`

---

## Summary

Epic 2.1 and 2.2 deliver advanced quest features and intelligent discovery capabilities that transform the Adventure Management Platform from a basic quest system into a feature-rich, personalized experience. This includes quest templates, comprehensive analytics, personalized recommendations, trending algorithms, and social bookmarking.

### Delivered Features

**US-2.1.4: Quest Templates (5 SP)**
- Reusable quest templates with checkpoint structures
- Convert existing quests into templates
- Generate new quests from templates
- Public/private template visibility
- System templates with 5 pre-built quest types
- Template usage tracking
- JSONB storage for flexible template data

**US-2.1.7: Quest Analytics Dashboard (8 SP)**
- 8 comprehensive event types (VIEW, START, CHECKPOINT_COMPLETE, COMPLETE, ABANDON, RATE, SHARE, BOOKMARK)
- Real-time analytics tracking integrated into controllers
- Quest-level analytics with completion rates
- Creator analytics dashboard with portfolio overview
- Popularity scoring algorithm (weighted: views + starts*2 + completions*3)
- Trending score calculation (7-day time-weighted activity)
- Time-series event tracking with daily breakdowns
- Average completion time calculation

**US-2.1.9: AI Difficulty Recommendations (5 SP)**
- User preference analysis from completed quests
- Difficulty preference detection (most common difficulty)
- Intelligent difficulty filtering in recommendations
- Adaptive quest suggestions based on user history

**US-2.2.4: Quest Recommendations Engine (13 SP)**
- Personalized recommendations based on user history
- Category preference analysis (top 3 categories by frequency)
- Similar quest suggestions (same category and tags)
- Geospatial nearby quest discovery (Haversine distance)
- "For You" feed combining 4 recommendation types
- Popular quests by category
- User preference profiling (categories, difficulty, duration)
- Collaborative filtering foundation

**US-2.2.5: Featured/Trending Quests (5 SP)**
- Featured quests based on all-time popularity
- Trending quests based on recent 7-day activity
- Weighted scoring algorithms
- Automatic calculation from analytics events
- Public endpoints (no authentication required)

**US-2.2.9: Saved/Bookmarked Quests (5 SP)**
- Add/remove quest bookmarks
- Bookmark notes functionality
- Get user bookmarks with full quest details
- Bookmark status checking
- Unique constraint preventing duplicate bookmarks
- Timestamp tracking for bookmark organization

---

## Technical Implementation

### 1. Database Architecture

#### QuestTemplate Entity (`quests.quest_templates` table)

**Core Fields:**
```typescript
templateId: UUID (PK)
name: VARCHAR(100)
description: TEXT
categoryId: UUID (FK to quest_categories)
difficulty: ENUM (EASY, MEDIUM, HARD, EXPERT)
creatorId: UUID (FK to auth.users)
isPublic: BOOLEAN (default: false)
isSystem: BOOLEAN (default: false)
usageCount: INTEGER (default: 0)
```

**Template Data (JSONB):**
```typescript
templateData: {
  questStructure: {
    title?: string
    description?: string
    tags?: string[]
    estimatedDuration?: number
  }
  checkpointStructure: Array<{
    title: string
    description?: string
    validationType: ValidationType
    pointsReward?: number
    hints?: string[]
    radius?: number
  }>
}
```

**Timestamps:**
```typescript
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

**System Templates (5 pre-built):**
1. **City Walking Tour** - Historical tour with GPS checkpoints (EASY)
2. **Scavenger Hunt** - Photo challenges and questions (MEDIUM)
3. **Fitness Challenge** - Physical activity with time-based goals (MEDIUM)
4. **Food Tour** - Culinary exploration with photo proofs (EASY)
5. **Mystery Trail** - Puzzle-solving adventure with questions (HARD)

#### QuestBookmark Entity (`quests.quest_bookmarks` table)

**Fields:**
```typescript
bookmarkId: UUID (PK)
userId: UUID (FK to auth.users)
questId: UUID (FK to quests)
notes: TEXT (nullable)
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

**Unique Constraint:** `(userId, questId)` - Prevents duplicate bookmarks

**Indexes:**
- `idx_bookmark_user`: (userId) for fast user bookmark queries
- `idx_bookmark_quest`: (questId) for quest popularity tracking
- `unique_user_quest`: (userId, questId) unique constraint

#### QuestAnalytics Entity (`quests.quest_analytics` table)

**Fields:**
```typescript
analyticsId: UUID (PK)
questId: UUID (FK to quests)
userId: UUID (FK to auth.users, nullable)
eventType: ENUM (VIEW, START, CHECKPOINT_COMPLETE, COMPLETE, ABANDON, RATE, SHARE, BOOKMARK)
metadata: JSONB (nullable)
createdAt: TIMESTAMP
```

**Event Types:**

1. **VIEW** - Quest viewed (tracked in quest.controller.ts)
   - Metadata: { requesterId?: string }

2. **START** - Quest started (tracked in participation.controller.ts)
   - Metadata: { participationId: string }

3. **CHECKPOINT_COMPLETE** - Checkpoint completed
   - Metadata: { checkpointId: string, participationId: string }

4. **COMPLETE** - Quest fully completed
   - Metadata: { participationId: string }

5. **ABANDON** - Quest abandoned
   - Metadata: { participationId: string }

6. **RATE** - Quest rated
   - Metadata: { participationId: string, rating: number }

7. **SHARE** - Quest shared (future use)
   - Metadata: { platform?: string }

8. **BOOKMARK** - Quest bookmarked
   - Metadata: { bookmarkId: string }

**Indexes:**
- `idx_analytics_quest_type`: (questId, eventType) for analytics queries
- `idx_analytics_created`: (createdAt) for time-series analysis
- `idx_analytics_user`: (userId) for user activity tracking

### 2. Service Layer Architecture

#### TemplateService (template.service.ts)

**8 Methods:**

```typescript
class TemplateService {
  // Template Discovery
  getAllTemplates(isPublicOnly: boolean = true): Promise<QuestTemplate[]>
  getTemplate(templateId: string): Promise<QuestTemplate | null>
  getCreatorTemplates(creatorId: string): Promise<QuestTemplate[]>

  // Template CRUD
  createTemplateFromQuest(data: CreateTemplateDTO, creatorId: string): Promise<QuestTemplate | null>
  updateTemplate(templateId: string, creatorId: string, updates: Partial<QuestTemplate>): Promise<QuestTemplate | null>
  deleteTemplate(templateId: string, creatorId: string): Promise<boolean>

  // Quest Generation
  createQuestFromTemplate(templateId: string, creatorId: string, customizations?: {
    title?: string
    description?: string
    tags?: string[]
  }): Promise<Quest | null>

  // System Templates
  seedSystemTemplates(): Promise<void>
}
```

**Template Creation Process:**
1. Fetch existing quest with all checkpoints
2. Extract quest structure (title, description, tags, duration)
3. Extract checkpoint structures (title, description, validation, rewards)
4. Store as JSONB in template_data
5. Set visibility (public/private/system)
6. Initialize usage count to 0

**Quest Generation Process:**
1. Validate template access (public, owned, or system)
2. Apply customizations (title, description, tags)
3. Create new quest with template questStructure
4. Create checkpoints from checkpointStructure
5. User must update checkpoint locations
6. Atomic increment template usage count
7. Return newly created quest

#### BookmarkService (bookmark.service.ts)

**6 Methods:**

```typescript
class BookmarkService {
  // Bookmark Management
  addBookmark(userId: string, questId: string, notes?: string): Promise<QuestBookmark>
  removeBookmark(userId: string, questId: string): Promise<boolean>
  updateNotes(userId: string, questId: string, notes: string): Promise<boolean>

  // Bookmark Queries
  getUserBookmarks(userId: string): Promise<Array<QuestBookmark & { quest: Quest }>>
  isBookmarked(userId: string, questId: string): Promise<boolean>
  getBookmarkCount(questId: string): Promise<number>
}
```

**Bookmark Features:**
- Prevents duplicate bookmarks via unique constraint
- Supports personal notes for each bookmark
- Joins with Quest entity for full quest details
- Returns bookmarks ordered by creation date (newest first)
- Efficient bookmark status checking
- Quest-level bookmark count for popularity metrics

#### AnalyticsService (analytics.service.ts)

**5 Methods:**

```typescript
class AnalyticsService {
  // Event Tracking
  trackEvent(
    questId: string,
    eventType: AnalyticsEventType,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void>

  // Quest Analytics
  getQuestAnalytics(questId: string, days: number = 30): Promise<QuestAnalyticsSummary>

  // Discovery Algorithms
  getFeaturedQuests(limit: number = 10): Promise<Quest[]>
  getTrendingQuests(limit: number = 10): Promise<Quest[]>

  // Creator Dashboard
  getCreatorAnalytics(creatorId: string, days: number = 30): Promise<CreatorAnalyticsSummary>
}
```

**QuestAnalyticsSummary Interface:**
```typescript
interface QuestAnalyticsSummary {
  questId: string
  totalViews: number
  totalStarts: number
  totalCompletions: number
  totalAbandons: number
  completionRate: number  // (completions / starts) * 100
  averageRating: number
  totalRatings: number
  popularityScore: number  // views + starts*2 + completions*3
  trendingScore: number    // last7Days.length * 2
  averageCompletionTime: number  // minutes
  eventsByDay: Array<{ date: string; events: number }>
}
```

**CreatorAnalyticsSummary Interface:**
```typescript
interface CreatorAnalyticsSummary {
  creatorId: string
  totalQuests: number
  totalViews: number
  totalStarts: number
  totalCompletions: number
  averageCompletionRate: number
  topPerformingQuests: Array<{
    questId: string
    title: string
    views: number
    completions: number
    rating: number
  }>
  recentActivity: Array<{ date: string; events: number }>
}
```

**Popularity Scoring Algorithm:**
```typescript
popularityScore = views + (starts * 2) + (completions * 3)
// Weighted to prioritize engagement over passive views
// Completion worth 3x more than view
```

**Trending Score Algorithm:**
```typescript
const last7Days = events.filter(e => e.createdAt >= sevenDaysAgo)
trendingScore = last7Days.length * 2
// Recent activity weighted heavily
// Refreshed on each query for real-time trending
```

**Analytics Integration Points:**
- `quest.controller.ts`: Track VIEW events on getQuest
- `participation.controller.ts`: Track START, CHECKPOINT_COMPLETE, COMPLETE, ABANDON, RATE events
- Event tracking is non-blocking (async without await in response path)
- Failures in analytics don't break core functionality

#### RecommendationService (recommendation.service.ts)

**6 Methods:**

```typescript
class RecommendationService {
  // Personalized Recommendations
  getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Quest[]>
  getQuestsForYou(userId: string, limit: number = 20): Promise<{
    personalized: Quest[]
    nearby: Quest[]
    popular: Quest[]
    similar: Quest[]
  }>

  // Similarity-based
  getSimilarQuests(questId: string, limit: number = 5): Promise<Quest[]>
  getPopularQuestsInCategory(categoryId: string, limit: number = 10): Promise<Quest[]>

  // Location-based
  getQuestsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 10
  ): Promise<Quest[]>

  // User Profiling (private)
  private analyzeUserPreferences(completedQuests: Quest[]): UserPreferences
}
```

**UserPreferences Interface:**
```typescript
interface UserPreferences {
  preferredCategories: string[]     // Top 3 categories by frequency
  preferredDifficulty?: QuestDifficulty  // Most common difficulty
  averageDuration?: number          // Average of completed quest durations
  completedQuestIds: string[]       // For exclusion from recommendations
}
```

**Recommendation Algorithm:**

1. **User Preference Analysis:**
   ```typescript
   // Count category frequency
   const categoryCount = completedQuests.reduce((acc, quest) => {
     acc[quest.categoryId] = (acc[quest.categoryId] || 0) + 1
     return acc
   }, {})

   // Get top 3 categories
   const preferredCategories = Object.entries(categoryCount)
     .sort(([, a], [, b]) => b - a)
     .slice(0, 3)
     .map(([categoryId]) => categoryId)

   // Get most common difficulty
   const difficultyCount = completedQuests.reduce((acc, quest) => {
     acc[quest.difficulty] = (acc[quest.difficulty] || 0) + 1
     return acc
   }, {})

   const preferredDifficulty = Object.entries(difficultyCount)
     .sort(([, a], [, b]) => b - a)[0]?.[0]
   ```

2. **Personalized Recommendations:**
   - Filter published quests
   - Exclude already completed quests
   - Filter by preferred categories (if any)
   - Filter by preferred difficulty (if detected)
   - Order by rating DESC, then participation count DESC
   - Limit results

3. **Similar Quests:**
   - Same category as source quest
   - Overlapping tags (using array overlap operator)
   - Exclude source quest
   - Order by rating and participation
   - Limit results

4. **Nearby Quests:**
   ```typescript
   // Haversine distance calculation
   const distance = 2 * R * asin(sqrt(
     sin²((lat2 - lat1) / 2) +
     cos(lat1) * cos(lat2) * sin²((lon2 - lon1) / 2)
   ))

   // Filter by radius
   quests.filter(quest => {
     const dist = calculateDistance(lat, lon, quest.startLatitude, quest.startLongitude)
     return dist <= radiusKm
   })
   ```

5. **For You Feed:**
   - Combines 4 recommendation types
   - Personalized: 8 quests based on preferences
   - Nearby: 5 quests within 50km (if location provided)
   - Popular: 4 top-rated quests
   - Similar: 3 quests similar to recently completed
   - Total: Up to 20 diverse recommendations

### 3. API Layer

#### Template Endpoints (7 endpoints)

| Method | Endpoint | Description | Auth | Permission |
|--------|----------|-------------|------|------------|
| GET | `/api/v1/templates` | Get all templates | Optional | Public templates only unless authenticated |
| GET | `/api/v1/templates/:templateId` | Get template by ID | Optional | Public or owned templates |
| GET | `/api/v1/templates/my/templates` | Get creator's templates | Required | Own templates only |
| POST | `/api/v1/templates` | Create template from quest | Required | Must own source quest |
| POST | `/api/v1/templates/:templateId/create-quest` | Create quest from template | Required | Any authenticated user |
| PUT | `/api/v1/templates/:templateId` | Update template | Required | Template creator only |
| DELETE | `/api/v1/templates/:templateId` | Delete template | Required | Template creator only |

#### Discovery Endpoints (11 endpoints)

| Method | Endpoint | Description | Auth | Permission |
|--------|----------|-------------|------|------------|
| POST | `/api/v1/discovery/bookmarks/:questId` | Add bookmark | Required | Any authenticated user |
| DELETE | `/api/v1/discovery/bookmarks/:questId` | Remove bookmark | Required | Own bookmarks only |
| GET | `/api/v1/discovery/bookmarks` | Get user bookmarks | Required | Own bookmarks only |
| GET | `/api/v1/discovery/featured` | Get featured quests | None | Public |
| GET | `/api/v1/discovery/trending` | Get trending quests | None | Public |
| GET | `/api/v1/discovery/recommendations` | Get personalized recommendations | Required | Based on user history |
| GET | `/api/v1/discovery/for-you` | Get "For You" feed | Required | Multi-type recommendations |
| GET | `/api/v1/discovery/similar/:questId` | Get similar quests | None | Public |
| GET | `/api/v1/discovery/nearby` | Get nearby quests | Optional | Query params: lat, lon, radiusKm |
| GET | `/api/v1/discovery/analytics/:questId` | Get quest analytics | Required | Quest creator only |
| GET | `/api/v1/discovery/analytics/creator/dashboard` | Get creator dashboard | Required | Own analytics only |

**Total New Endpoints**: 18

### 4. Example API Calls

#### Create Template from Quest

```bash
curl -X POST http://localhost:3004/api/v1/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Walking Tour Template",
    "description": "Template for city walking tours with historical stops",
    "questId": "existing-quest-uuid",
    "isPublic": true
  }'
```

**Response:**
```json
{
  "success": true,
  "template": {
    "templateId": "uuid",
    "name": "My Walking Tour Template",
    "description": "Template for city walking tours with historical stops",
    "categoryId": "historical-category-uuid",
    "difficulty": "EASY",
    "creatorId": "user-uuid",
    "isPublic": true,
    "isSystem": false,
    "usageCount": 0,
    "templateData": {
      "questStructure": {
        "title": "Historic Downtown Tour",
        "description": "Explore historic landmarks...",
        "tags": ["history", "walking"],
        "estimatedDuration": 120
      },
      "checkpointStructure": [
        {
          "title": "City Hall",
          "description": "Visit city hall",
          "validationType": "GPS",
          "pointsReward": 100
        }
      ]
    },
    "createdAt": "2025-10-23T10:00:00Z",
    "updatedAt": "2025-10-23T10:00:00Z"
  }
}
```

#### Create Quest from Template

```bash
curl -X POST http://localhost:3004/api/v1/templates/TEMPLATE_ID/create-quest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "San Francisco Historic Tour",
    "description": "Customized tour of SF landmarks",
    "tags": ["sf", "history", "walking"]
  }'
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "questId": "new-quest-uuid",
    "title": "San Francisco Historic Tour",
    "description": "Customized tour of SF landmarks",
    "status": "DRAFT",
    "checkpoints": [
      {
        "checkpointId": "checkpoint-uuid",
        "title": "City Hall",
        "description": "Visit city hall",
        "latitude": 0,
        "longitude": 0,
        "validationType": "GPS"
      }
    ]
  },
  "message": "Quest created from template. Please update checkpoint locations."
}
```

#### Add Bookmark

```bash
curl -X POST http://localhost:3004/api/v1/discovery/bookmarks/QUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Looks interesting! Want to try this weekend."
  }'
```

**Response:**
```json
{
  "success": true,
  "bookmark": {
    "bookmarkId": "bookmark-uuid",
    "userId": "user-uuid",
    "questId": "quest-uuid",
    "notes": "Looks interesting! Want to try this weekend.",
    "createdAt": "2025-10-23T10:00:00Z"
  }
}
```

#### Get User Bookmarks

```bash
curl http://localhost:3004/api/v1/discovery/bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "bookmarks": [
    {
      "bookmarkId": "bookmark-uuid",
      "notes": "Looks interesting!",
      "createdAt": "2025-10-23T10:00:00Z",
      "quest": {
        "questId": "quest-uuid",
        "title": "Downtown Adventure",
        "shortDescription": "Explore downtown",
        "difficulty": "MEDIUM",
        "estimatedDuration": 120,
        "averageRating": 4.5,
        "featuredImageUrl": "https://example.com/image.jpg",
        "status": "PUBLISHED"
      }
    }
  ],
  "count": 1
}
```

#### Get Featured Quests

```bash
curl http://localhost:3004/api/v1/discovery/featured?limit=10
```

**Response:**
```json
{
  "quests": [
    {
      "questId": "quest-uuid",
      "title": "Popular Downtown Tour",
      "shortDescription": "Most popular tour",
      "difficulty": "EASY",
      "averageRating": 4.8,
      "participantCount": 1247,
      "viewCount": 5832,
      "popularityScore": 6325,
      "featuredImageUrl": "https://example.com/image.jpg"
    }
  ],
  "count": 10
}
```

#### Get Trending Quests

```bash
curl http://localhost:3004/api/v1/discovery/trending?limit=10
```

**Response:**
```json
{
  "quests": [
    {
      "questId": "quest-uuid",
      "title": "Newly Popular Mystery Trail",
      "shortDescription": "Trending this week!",
      "difficulty": "HARD",
      "averageRating": 4.6,
      "trendingScore": 342,
      "recentStarts": 171,
      "featuredImageUrl": "https://example.com/image.jpg"
    }
  ],
  "count": 10
}
```

#### Get Personalized Recommendations

```bash
curl http://localhost:3004/api/v1/discovery/recommendations?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "recommendations": [
    {
      "questId": "quest-uuid",
      "title": "Historical Walking Tour",
      "shortDescription": "Based on your interests",
      "difficulty": "MEDIUM",
      "categoryId": "historical-category-uuid",
      "averageRating": 4.7,
      "matchReason": "Matches your preferred category: Historical"
    }
  ],
  "count": 10,
  "basedOn": {
    "preferredCategories": ["historical", "cultural", "educational"],
    "preferredDifficulty": "MEDIUM",
    "completedQuests": 5
  }
}
```

#### Get "For You" Feed

```bash
curl http://localhost:3004/api/v1/discovery/for-you?limit=20&latitude=37.7749&longitude=-122.4194 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "forYou": {
    "personalized": [
      {
        "questId": "quest-1",
        "title": "Historical Tour",
        "shortDescription": "Based on your history",
        "difficulty": "MEDIUM",
        "averageRating": 4.7
      }
    ],
    "nearby": [
      {
        "questId": "quest-2",
        "title": "Local Adventure",
        "shortDescription": "Only 2km away!",
        "distance": 2.3,
        "difficulty": "EASY"
      }
    ],
    "popular": [
      {
        "questId": "quest-3",
        "title": "Top Rated Quest",
        "shortDescription": "Highest rated in your area",
        "averageRating": 4.9,
        "participantCount": 842
      }
    ],
    "similar": [
      {
        "questId": "quest-4",
        "title": "Similar to Recent Quest",
        "shortDescription": "Like quests you've completed",
        "difficulty": "MEDIUM"
      }
    ]
  },
  "totalCount": 20
}
```

#### Get Similar Quests

```bash
curl http://localhost:3004/api/v1/discovery/similar/QUEST_ID?limit=5
```

**Response:**
```json
{
  "similarQuests": [
    {
      "questId": "similar-quest-uuid",
      "title": "Another Historical Tour",
      "shortDescription": "Similar category and tags",
      "categoryId": "same-category-uuid",
      "difficulty": "MEDIUM",
      "tags": ["history", "walking"],
      "averageRating": 4.5
    }
  ],
  "count": 5,
  "basedOn": {
    "questId": "original-quest-uuid",
    "category": "Historical",
    "sharedTags": ["history", "walking"]
  }
}
```

#### Get Nearby Quests

```bash
curl "http://localhost:3004/api/v1/discovery/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=10&limit=10"
```

**Response:**
```json
{
  "nearbyQuests": [
    {
      "questId": "nearby-quest-uuid",
      "title": "Local Adventure",
      "shortDescription": "Close to your location",
      "difficulty": "EASY",
      "startLatitude": 37.7800,
      "startLongitude": -122.4200,
      "distance": 0.8,
      "averageRating": 4.6
    }
  ],
  "count": 10,
  "searchCenter": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radiusKm": 10
  }
}
```

#### Get Quest Analytics (Creator Only)

```bash
curl http://localhost:3004/api/v1/discovery/analytics/QUEST_ID?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "analytics": {
    "questId": "quest-uuid",
    "totalViews": 1523,
    "totalStarts": 342,
    "totalCompletions": 287,
    "totalAbandons": 55,
    "completionRate": 83.92,
    "averageRating": 4.7,
    "totalRatings": 245,
    "popularityScore": 2535,
    "trendingScore": 124,
    "averageCompletionTime": 118,
    "eventsByDay": [
      { "date": "2025-10-22", "events": 47 },
      { "date": "2025-10-21", "events": 52 },
      { "date": "2025-10-20", "events": 39 }
    ],
    "eventBreakdown": {
      "views": 1523,
      "starts": 342,
      "checkpointCompletions": 1876,
      "completions": 287,
      "abandons": 55,
      "rates": 245,
      "bookmarks": 89
    }
  }
}
```

#### Get Creator Analytics Dashboard

```bash
curl http://localhost:3004/api/v1/discovery/analytics/creator/dashboard?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "dashboard": {
    "creatorId": "creator-uuid",
    "totalQuests": 8,
    "publishedQuests": 6,
    "draftQuests": 2,
    "totalViews": 12458,
    "totalStarts": 2847,
    "totalCompletions": 2234,
    "averageCompletionRate": 78.46,
    "totalRatings": 1876,
    "averageRating": 4.6,
    "topPerformingQuests": [
      {
        "questId": "top-quest-uuid",
        "title": "Popular Downtown Tour",
        "views": 5832,
        "starts": 1247,
        "completions": 1089,
        "completionRate": 87.33,
        "rating": 4.8
      }
    ],
    "recentActivity": [
      { "date": "2025-10-22", "views": 423, "starts": 97, "completions": 78 },
      { "date": "2025-10-21", "views": 456, "starts": 104, "completions": 85 }
    ],
    "categoryBreakdown": [
      { "categoryName": "Historical", "questCount": 3, "totalStarts": 1234 },
      { "categoryName": "Adventure", "questCount": 2, "totalStarts": 876 }
    ]
  }
}
```

---

## Deployment Configuration

### Environment Variables

```env
# Quest Service Configuration (existing)
NODE_ENV=development
QUEST_SERVICE_PORT=3004
POSTGRES_HOST=localhost
REDIS_HOST=localhost

# Template Configuration (NEW)
SEED_QUEST_TEMPLATES=true           # Enable system template seeding
MAX_TEMPLATE_CHECKPOINTS=50         # Maximum checkpoints in template

# Analytics Configuration (NEW)
ANALYTICS_RETENTION_DAYS=365        # How long to keep analytics events
ANALYTICS_AGGREGATION_INTERVAL=300  # Seconds between aggregations (5 min)

# Recommendation Configuration (NEW)
RECOMMENDATION_CACHE_TTL=3600       # Cache recommendations for 1 hour
MAX_RECOMMENDATION_DISTANCE_KM=100  # Maximum distance for nearby quests
MIN_USER_HISTORY_FOR_RECOMMENDATIONS=3  # Minimum completed quests for personalization

# Discovery Configuration (NEW)
TRENDING_WINDOW_DAYS=7              # Days to consider for trending
FEATURED_QUESTS_MIN_RATING=4.0      # Minimum rating for featured
FEATURED_QUESTS_MIN_COMPLETIONS=10  # Minimum completions for featured
```

### Database Migrations

**Migration: Add Template, Bookmark, Analytics Tables**

```sql
-- Quest Templates Table
CREATE TABLE quests.quest_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES quests.quest_categories(category_id),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
  creator_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  template_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_template_creator ON quests.quest_templates(creator_id);
CREATE INDEX idx_template_public ON quests.quest_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_template_system ON quests.quest_templates(is_system) WHERE is_system = true;

-- Quest Bookmarks Table
CREATE TABLE quests.quest_bookmarks (
  bookmark_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES quests.quests(quest_id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, quest_id)
);

CREATE INDEX idx_bookmark_user ON quests.quest_bookmarks(user_id);
CREATE INDEX idx_bookmark_quest ON quests.quest_bookmarks(quest_id);

-- Quest Analytics Table
CREATE TABLE quests.quest_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests.quests(quest_id) ON DELETE CASCADE,
  user_id UUID,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
    'VIEW', 'START', 'CHECKPOINT_COMPLETE', 'COMPLETE',
    'ABANDON', 'RATE', 'SHARE', 'BOOKMARK'
  )),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_quest_type ON quests.quest_analytics(quest_id, event_type);
CREATE INDEX idx_analytics_created ON quests.quest_analytics(created_at);
CREATE INDEX idx_analytics_user ON quests.quest_analytics(user_id);
```

### Service Updates

**Modified Files:**
```
services/quest-service/
├── src/
│   ├── models/
│   │   ├── QuestTemplate.entity.ts       # NEW
│   │   ├── QuestBookmark.entity.ts       # NEW
│   │   ├── QuestAnalytics.entity.ts      # NEW
│   │   └── index.ts                      # MODIFIED (exports)
│   ├── services/
│   │   ├── template.service.ts           # NEW
│   │   ├── bookmark.service.ts           # NEW
│   │   ├── analytics.service.ts          # NEW
│   │   ├── recommendation.service.ts     # NEW
│   │   └── index.ts                      # MODIFIED (exports)
│   ├── controllers/
│   │   ├── template.controller.ts        # NEW
│   │   ├── discovery.controller.ts       # NEW
│   │   ├── quest.controller.ts           # MODIFIED (analytics)
│   │   ├── participation.controller.ts   # MODIFIED (analytics)
│   │   └── index.ts                      # MODIFIED (exports)
│   ├── routes/
│   │   ├── template.routes.ts            # NEW
│   │   ├── discovery.routes.ts           # NEW
│   │   └── index.ts                      # MODIFIED (mounting)
│   ├── utils/
│   │   └── seed-templates.util.ts        # NEW
│   └── config/
│       └── database.ts                   # MODIFIED (entities, seeding)
```

---

## Files Created/Modified

### New Files (12)

**Models (3):**
- `services/quest-service/src/models/QuestTemplate.entity.ts`
- `services/quest-service/src/models/QuestBookmark.entity.ts`
- `services/quest-service/src/models/QuestAnalytics.entity.ts`

**Services (4):**
- `services/quest-service/src/services/template.service.ts`
- `services/quest-service/src/services/bookmark.service.ts`
- `services/quest-service/src/services/analytics.service.ts`
- `services/quest-service/src/services/recommendation.service.ts`

**Controllers (2):**
- `services/quest-service/src/controllers/template.controller.ts`
- `services/quest-service/src/controllers/discovery.controller.ts`

**Routes (2):**
- `services/quest-service/src/routes/template.routes.ts`
- `services/quest-service/src/routes/discovery.routes.ts`

**Utils (1):**
- `services/quest-service/src/utils/seed-templates.util.ts`

### Modified Files (7)

- `services/quest-service/src/models/index.ts` - Added new entity exports
- `services/quest-service/src/services/index.ts` - Added new service exports
- `services/quest-service/src/controllers/index.ts` - Added new controller exports
- `services/quest-service/src/controllers/quest.controller.ts` - Added VIEW event tracking
- `services/quest-service/src/controllers/participation.controller.ts` - Added multiple event tracking
- `services/quest-service/src/routes/index.ts` - Mounted new routes
- `services/quest-service/src/config/database.ts` - Added entities and template seeding

---

## Metrics

- **Story Points**: 41 SP (Epic 2.1: 18 SP, Epic 2.2: 23 SP)
- **New Database Tables**: 3 (quest_templates, quest_bookmarks, quest_analytics)
- **New Services**: 4 (TemplateService, BookmarkService, AnalyticsService, RecommendationService)
- **New Controllers**: 2 (TemplateController, DiscoveryController)
- **New API Endpoints**: 18 (Templates: 7, Discovery: 11)
- **Total Platform Endpoints**: 72 endpoints (Auth: 21, User: 11, Quest: 40)
- **Lines of Code**: ~1,714 new lines
- **Files Created**: 12 new files
- **Files Modified**: 7 files
- **System Templates**: 5 pre-built templates
- **Analytics Event Types**: 8 types
- **Recommendation Types**: 4 (personalized, similar, nearby, popular)

---

## Testing Guide

### Prerequisites

```bash
# Ensure all services are running
docker-compose up -d

# Check quest service health
curl http://localhost:3004/health

# Verify database migrations
docker-compose exec postgres psql -U adventure_user -d adventure_platform \
  -c "\dt quests.*"
```

### 1. Template System Testing

**Get System Templates:**
```bash
curl http://localhost:3004/api/v1/templates
```

**Create Template from Existing Quest:**
```bash
# First, get your quest ID
curl http://localhost:3004/api/v1/quests/my/quests \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create template
curl -X POST http://localhost:3004/api/v1/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Template",
    "description": "Template for urban exploration",
    "questId": "YOUR_QUEST_ID",
    "isPublic": true
  }'
```

**Create Quest from Template:**
```bash
curl -X POST http://localhost:3004/api/v1/templates/TEMPLATE_ID/create-quest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SF Urban Explorer",
    "description": "Custom SF tour based on template",
    "tags": ["sf", "urban", "exploration"]
  }'
```

### 2. Bookmark Testing

**Add Bookmark:**
```bash
curl -X POST http://localhost:3004/api/v1/discovery/bookmarks/QUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Want to try this next weekend!"
  }'
```

**Get My Bookmarks:**
```bash
curl http://localhost:3004/api/v1/discovery/bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Remove Bookmark:**
```bash
curl -X DELETE http://localhost:3004/api/v1/discovery/bookmarks/QUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Analytics Testing

**View Quest (Track Analytics):**
```bash
# Each view is automatically tracked
curl http://localhost:3004/api/v1/quests/QUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Start Quest (Track Analytics):**
```bash
# Start event automatically tracked
curl -X POST http://localhost:3004/api/v1/participations/quests/QUEST_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Complete Checkpoint (Track Analytics):**
```bash
# Checkpoint completion automatically tracked
curl -X POST http://localhost:3004/api/v1/participations/PARTICIPATION_ID/checkpoints/CHECKPOINT_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

**Get Quest Analytics (Creator Only):**
```bash
curl http://localhost:3004/api/v1/discovery/analytics/YOUR_QUEST_ID?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Creator Dashboard:**
```bash
curl http://localhost:3004/api/v1/discovery/analytics/creator/dashboard?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Discovery Testing

**Get Featured Quests:**
```bash
curl "http://localhost:3004/api/v1/discovery/featured?limit=10"
```

**Get Trending Quests:**
```bash
curl "http://localhost:3004/api/v1/discovery/trending?limit=10"
```

**Get Similar Quests:**
```bash
curl http://localhost:3004/api/v1/discovery/similar/QUEST_ID?limit=5
```

**Get Nearby Quests:**
```bash
curl "http://localhost:3004/api/v1/discovery/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=10&limit=10"
```

### 5. Recommendation Testing

**Prerequisites:** Complete at least 3 quests to get personalized recommendations.

**Get Personalized Recommendations:**
```bash
curl http://localhost:3004/api/v1/discovery/recommendations?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get "For You" Feed:**
```bash
curl "http://localhost:3004/api/v1/discovery/for-you?limit=20&latitude=37.7749&longitude=-122.4194" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Full Flow Test

```bash
# 1. Create account
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester@example.com",
    "password": "Test123!",
    "username": "tester"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')

# 2. View some quests (track analytics)
curl http://localhost:3004/api/v1/quests/search?limit=5 | jq -r '.quests[].questId' | \
while read QUEST_ID; do
  curl http://localhost:3004/api/v1/quests/$QUEST_ID \
    -H "Authorization: Bearer $TOKEN"
  sleep 1
done

# 3. Bookmark a quest
FIRST_QUEST=$(curl -s http://localhost:3004/api/v1/quests/search?limit=1 | jq -r '.quests[0].questId')
curl -X POST http://localhost:3004/api/v1/discovery/bookmarks/$FIRST_QUEST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Testing bookmarks"}'

# 4. Get recommendations
curl http://localhost:3004/api/v1/discovery/recommendations?limit=5 \
  -H "Authorization: Bearer $TOKEN"

# 5. Get for you feed
curl "http://localhost:3004/api/v1/discovery/for-you?limit=20" \
  -H "Authorization: Bearer $TOKEN"

# 6. Check trending
curl http://localhost:3004/api/v1/discovery/trending?limit=5
```

---

## What's Next?

### Option 1: Gamification System (Epic 3 - Phase 4)
- **US-3.1.1**: XP and Leveling System (8 SP)
- **US-3.1.2**: Achievement System (13 SP)
- **US-3.1.3**: Badge Collection (8 SP)
- **US-3.2.1**: Global Leaderboards (8 SP)
- **US-3.2.2**: Category Leaderboards (5 SP)
- **US-3.3.1**: Daily Challenges (8 SP)
- **US-3.3.2**: Streak Tracking (5 SP)
- **Total**: ~55 SP

### Option 2: Social Features (Epic 4 - Phase 4)
- **US-4.1.1**: Friends System (13 SP)
- **US-4.1.2**: Activity Feed (8 SP)
- **US-4.1.3**: Direct Messaging (13 SP)
- **US-4.2.1**: Quest Communities (13 SP)
- **US-4.2.2**: Community Events (8 SP)
- **US-4.3.1**: User Profile Enhancement (5 SP)
- **Total**: ~60 SP

### Option 3: Advanced Quest Features
- **Quest Versioning** (US-2.1.5 - 5 SP)
- **Collaborative Quests** (US-2.1.6 - 13 SP)
- **Dynamic Pricing** (US-2.1.8 - 8 SP)
- **Quest Scheduling** (US-2.1.10 - 5 SP)
- **Weather Integration** (US-2.2.6 - 8 SP)
- **Total**: ~39 SP

### Option 4: Media Service & File Management
- **Media Service Setup** (8 SP)
- **Image Upload & Processing** (8 SP)
- **Video Upload & Streaming** (13 SP)
- **CDN Integration** (5 SP)
- **Storage Management** (5 SP)
- **Total**: ~39 SP

### Option 5: AR Features (Epic 5 - Phase 6)
- **AR Checkpoint Validation** (13 SP)
- **AR Object Placement** (13 SP)
- **AR Treasure Hunt Mode** (13 SP)
- **AR Multiplayer** (21 SP)
- **Total**: ~60 SP

---

## Notes

- **System Templates**: 5 templates auto-seed on service startup
- **Analytics**: Non-blocking async tracking prevents performance impact
- **Recommendations**: Require minimum 3 completed quests for personalization
- **Template Usage**: Automatically increments usage count
- **Bookmark Uniqueness**: Enforced at database level via unique constraint
- **Trending Window**: Configurable via TRENDING_WINDOW_DAYS (default: 7 days)
- **Geospatial**: Haversine formula for accurate distance calculations
- **Popularity Score**: Weighted algorithm prioritizes engagement
- **Cache Strategy**: Recommendations cached for 1 hour (configurable)
- **Event Retention**: Analytics events retained for 365 days (configurable)

---

**Epic 2.1 & 2.2 Status**: ✅ Complete and Production-Ready

**Total Platform Progress**:
- Phase 1: Testing Infrastructure ✅
- Phase 2: RBAC + User Profiles (13 SP) ✅
- Phase 3: Quest Management (31 SP) ✅
- **Epic 2.1: Quest Features Enhancement (18 SP)** ✅
- **Epic 2.2: Advanced Quest Discovery (23 SP)** ✅
- **Total Story Points**: 85 SP

**Services Running**:
- Auth Service (port 3001) - 21 endpoints
- User Service (port 3003) - 11 endpoints
- Quest Service (port 3004) - 40 endpoints (22 base + 18 new)
- **Total API Endpoints**: 72 endpoints

**Database Tables**: 15 total
- Auth schema: 5 tables (users, roles, permissions, user_roles, role_permissions)
- Users schema: 2 tables (profiles, privacy_settings)
- Quests schema: 8 tables (quests, checkpoints, participations, checkpoint_completions, quest_categories, **quest_templates**, **quest_bookmarks**, **quest_analytics**)
