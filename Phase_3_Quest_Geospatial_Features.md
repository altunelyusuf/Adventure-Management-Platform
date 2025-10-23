# Phase 3: Quest & Geospatial Features
## Adventure Coordinator Platform - Agile Blueprint
### Version 1.0 | October 2025

---

## 📋 Overview

This phase details the **Quest Management** and **Geospatial Services** initiatives - the core functional features that differentiate the Adventure Coordinator Platform. These epics are critical to MVP success and user value delivery.

### Scope
- Initiative 2: Quest Management System
- Initiative 3: Geospatial Services
- 14 Major Epics
- 95 User Stories
- ~580 Story Points
- Sprints 3-10 (14 weeks)

---

# INITIATIVE 2: QUEST MANAGEMENT SYSTEM

## Initiative Goal
Build comprehensive quest creation, discovery, participation, and completion system with AI-powered generation, multiple quest types, checkpoint validation, and reward distribution.

### Success Metrics
- 500+ quests created in first month
- 80% quest completion rate
- <2s quest discovery response time
- 95% checkpoint validation accuracy
- Zero duplicate quest completions

---

# EPIC 2.1: Quest Creation & Management

## Epic Overview
**Epic ID**: EPIC-2.1  
**Priority**: P0 (Must Have)  
**Deployment Package**: MVP (Package 1)  
**Sprint Assignment**: Sprint 3-5  
**Estimated Effort**: 65 Story Points  
**Team**: Backend (2), Frontend (2), UX (1)

### Epic Goal
Enable creators to design, create, publish, and manage quests with checkpoints, objectives, rewards, and metadata through an intuitive quest builder interface.

### Business Value
- **Core Feature**: Primary value proposition for creators
- **Revenue**: Enables premium quest subscriptions
- **Scalability**: Foundation for AI-generated quests
- **Quality**: Structured quest data ensures consistency

---

## User Stories for EPIC 2.1

### US-2.1.1: Basic Quest Creation
**Story ID**: US-2.1.1  
**Priority**: P0  
**Story Points**: 8  
**Sprint**: Sprint 3

**User Story**:
```
As a creator
I want to create a new quest with basic information
So that I can publish adventures for users to experience
```

**Acceptance Criteria**:
```gherkin
Given I am logged in as a creator
When I click "Create New Quest"
Then I am taken to the quest builder

Given I am in the quest builder
When I fill in quest title, description, difficulty, and category
Then I can save my quest as a draft
And the quest appears in my drafts

Given I create a quest without a title
When I try to save
Then I see validation error "Title is required"

Given I create a quest with a title >100 characters
When I try to save
Then I see error "Title must be under 100 characters"
```

**Technical Requirements**:
- Rich text editor for description
- Category taxonomy (Adventure, Mystery, Historical, Food & Drink, Fitness, Educational, etc.)
- Difficulty levels: Easy, Medium, Hard, Expert
- Estimated duration calculation
- Featured image upload

**API Endpoints**:
```
POST /api/v1/quests
Request:
{
  "title": "Historic Downtown Walking Tour",
  "description": "<p>Explore historic landmarks...</p>",
  "shortDescription": "Discover downtown history",
  "difficulty": "EASY",
  "category": "HISTORICAL",
  "estimatedDuration": 120, // minutes
  "featuredImage": "...",
  "status": "DRAFT",
  "creatorId": "uuid",
  "tags": ["history", "walking", "downtown"]
}

Response (201):
{
  "questId": "uuid",
  "title": "Historic Downtown Walking Tour",
  "slug": "historic-downtown-walking-tour",
  "status": "DRAFT",
  "createdAt": "2025-10-23T10:00:00Z"
}

GET /api/v1/quests/{questId}
Response (200):
{
  "questId": "uuid",
  "title": "...",
  "description": "...",
  "difficulty": "EASY",
  "category": "HISTORICAL",
  "checkpointCount": 5,
  "estimatedDuration": 120,
  "rewards": {...},
  "creator": {...},
  "stats": {
    "participantCount": 0,
    "completionCount": 0,
    "averageRating": 0
  }
}

PUT /api/v1/quests/{questId}
Request: Same as POST
Response (200): Updated quest object

DELETE /api/v1/quests/{questId}
Response (204): No content
```

**Database Schema**:
```sql
CREATE TYPE quest_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');
CREATE TYPE quest_status AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'DELETED');
CREATE TYPE quest_category AS ENUM ('ADVENTURE', 'MYSTERY', 'HISTORICAL', 'FOOD_DRINK', 'FITNESS', 'EDUCATIONAL', 'CULTURAL', 'NATURE', 'URBAN', 'OTHER');

CREATE TABLE quests (
  quest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(user_id) NOT NULL,
  title VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(200),
  featured_image_url TEXT,
  difficulty quest_difficulty NOT NULL,
  category quest_category NOT NULL,
  estimated_duration INT, -- minutes
  status quest_status DEFAULT 'DRAFT',
  tags TEXT[],
  
  -- Metadata
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  archived_at TIMESTAMP,
  
  -- Stats (denormalized for performance)
  participant_count INT DEFAULT 0,
  completion_count INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  view_count INT DEFAULT 0,
  
  -- Geospatial
  start_latitude DECIMAL(10,8),
  start_longitude DECIMAL(11,8),
  total_distance DECIMAL(10,2), -- kilometers
  
  -- Premium features
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2), -- if one-time purchase
  
  -- Indexing
  search_vector tsvector,
  
  INDEX idx_creator (creator_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty),
  INDEX idx_published (published_at),
  INDEX idx_location (start_latitude, start_longitude),
  INDEX idx_search (search_vector) USING GIN
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_quest_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quest_slug_trigger
  BEFORE INSERT ON quests
  FOR EACH ROW
  EXECUTE FUNCTION generate_quest_slug();

-- Update search vector
CREATE OR REPLACE FUNCTION update_quest_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quest_search_vector_trigger
  BEFORE INSERT OR UPDATE ON quests
  FOR EACH ROW
  EXECUTE FUNCTION update_quest_search_vector();
```

**Tasks**:
- [ ] Design quest creation UI/UX flow (UX) - 8 hours
- [ ] Create quest database schema (Backend) - 4 hours
- [ ] Implement quest CRUD endpoints (Backend) - 8 hours
- [ ] Add rich text editor integration (Frontend) - 5 hours
- [ ] Build quest creation form (Frontend) - 8 hours
- [ ] Implement image upload for featured image (Backend) - 4 hours
- [ ] Add slug generation logic (Backend) - 2 hours
- [ ] Implement validation rules (Backend) - 4 hours
- [ ] Build quest drafts list (Frontend) - 5 hours
- [ ] Add autosave functionality (Frontend) - 4 hours
- [ ] Write unit tests (Backend) - 6 hours
- [ ] Write integration tests (Backend) - 5 hours
- [ ] Write E2E tests (QA) - 4 hours

**Definition of Done**:
- [ ] Quest creation flow working end-to-end
- [ ] All validation rules enforced
- [ ] Featured image upload functional
- [ ] Drafts saved automatically
- [ ] Tests passing (>85% coverage)
- [ ] Performance: <500ms quest creation
- [ ] API documentation updated
- [ ] User documentation created
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-2.1.2: Checkpoint Creation & Management
**Story ID**: US-2.1.2  
**Priority**: P0  
**Story Points**: 8  
**Sprint**: Sprint 4

**User Story**:
```
As a creator
I want to add checkpoints to my quest with location and validation requirements
So that users have structured waypoints to visit
```

**Acceptance Criteria**:
```gherkin
Given I am editing a quest
When I click "Add Checkpoint"
Then I can place a checkpoint on a map
And specify validation requirements

Given I add a checkpoint
When I set location radius to 50 meters
Then users must be within 50m to check in

Given I require a photo at a checkpoint
When users arrive at the checkpoint
Then they must upload a photo to proceed

Given I set checkpoint order as sequential
When users try to skip ahead
Then they see error "Complete previous checkpoints first"
```

**Checkpoint Types**:
- **Location-based**: GPS verification within radius
- **Photo checkpoint**: Require photo upload
- **QR Code**: Scan QR code at location
- **Question/Puzzle**: Answer correctly to proceed
- **AR Marker**: Scan AR marker (future)
- **Time-based**: Available only at certain times

**API Endpoints**:
```
POST /api/v1/quests/{questId}/checkpoints
Request:
{
  "orderIndex": 1,
  "title": "City Hall",
  "description": "Visit the historic city hall",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 50, // meters
  "validationType": "GPS", // GPS, PHOTO, QR_CODE, QUESTION, AR_MARKER
  "validationData": {
    "requirePhoto": true,
    "photoPrompt": "Take a photo of the entrance",
    "qrCodeData": "...", // if QR_CODE type
    "question": "...", // if QUESTION type
    "correctAnswer": "..." // if QUESTION type
  },
  "pointsReward": 100,
  "hints": ["Look for the clock tower"],
  "isOptional": false
}

Response (201):
{
  "checkpointId": "uuid",
  "questId": "uuid",
  "orderIndex": 1,
  "title": "City Hall",
  ...
}

GET /api/v1/quests/{questId}/checkpoints
Response (200):
{
  "checkpoints": [
    {
      "checkpointId": "uuid",
      "orderIndex": 1,
      ...
    }
  ],
  "totalCount": 5
}

PUT /api/v1/checkpoints/{checkpointId}
DELETE /api/v1/checkpoints/{checkpointId}
```

**Database Schema**:
```sql
CREATE TYPE validation_type AS ENUM ('GPS', 'PHOTO', 'QR_CODE', 'QUESTION', 'AR_MARKER', 'TIME_BASED');

CREATE TABLE checkpoints (
  checkpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(quest_id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Location
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  radius INT DEFAULT 50, -- meters
  address TEXT,
  
  -- Validation
  validation_type validation_type NOT NULL,
  validation_data JSONB DEFAULT '{}',
  
  -- Rewards
  points_reward INT DEFAULT 0,
  
  -- Metadata
  hints TEXT[],
  is_optional BOOLEAN DEFAULT FALSE,
  estimated_time INT, -- minutes to reach from previous checkpoint
  
  -- Images
  images TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (quest_id, order_index),
  INDEX idx_quest (quest_id),
  INDEX idx_location (latitude, longitude),
  INDEX idx_order (quest_id, order_index)
);

-- Auto-calculate distances between checkpoints
CREATE OR REPLACE FUNCTION calculate_checkpoint_distances()
RETURNS TRIGGER AS $$
DECLARE
  prev_checkpoint RECORD;
  distance DECIMAL(10,2);
BEGIN
  IF NEW.order_index > 1 THEN
    SELECT latitude, longitude INTO prev_checkpoint
    FROM checkpoints
    WHERE quest_id = NEW.quest_id AND order_index = NEW.order_index - 1;
    
    -- Haversine formula for distance calculation
    distance := (
      6371 * acos(
        cos(radians(prev_checkpoint.latitude)) * 
        cos(radians(NEW.latitude)) * 
        cos(radians(NEW.longitude) - radians(prev_checkpoint.longitude)) + 
        sin(radians(prev_checkpoint.latitude)) * 
        sin(radians(NEW.latitude))
      )
    );
    
    NEW.estimated_time := (distance * 12)::INT; -- 12 mins per km walking
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkpoint_distance_trigger
  BEFORE INSERT OR UPDATE ON checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION calculate_checkpoint_distances();
```

**Tasks**:
- [ ] Design checkpoint creation UI with map (Frontend) - 8 hours
- [ ] Create checkpoint database schema (Backend) - 3 hours
- [ ] Implement checkpoint CRUD endpoints (Backend) - 6 hours
- [ ] Add map integration for checkpoint placement (Frontend) - 8 hours
- [ ] Implement drag-to-reorder checkpoints (Frontend) - 5 hours
- [ ] Add validation type selector (Frontend) - 4 hours
- [ ] Implement distance calculation (Backend) - 3 hours
- [ ] Add checkpoint preview on map (Frontend) - 4 hours
- [ ] Write unit tests (Backend) - 5 hours
- [ ] Write integration tests (Backend) - 4 hours

**Definition of Done**:
- [ ] Checkpoint creation working with all types
- [ ] Map integration functional
- [ ] Checkpoint reordering working
- [ ] Distance calculations accurate
- [ ] Tests passing (>85% coverage)
- [ ] Performance: <300ms checkpoint creation
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-2.1.3: Quest Publishing Workflow
**Story ID**: US-2.1.3  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 4

**User Story**:
```
As a creator
I want to publish my quest after completing all required fields
So that users can discover and participate in it
```

**Acceptance Criteria**:
```gherkin
Given I have a complete quest draft
When I click "Publish Quest"
Then validation checks run
And if successful, quest status changes to PUBLISHED

Given my quest has <3 checkpoints
When I try to publish
Then I see error "Quest must have at least 3 checkpoints"

Given my quest is missing required fields
When I try to publish
Then I see a checklist of missing requirements

Given I publish a quest
When I return to my quest list
Then the quest shows as "Published" with a publish date
```

**Publishing Requirements**:
- Minimum 3 checkpoints
- Title and description present
- Featured image uploaded
- Category selected
- At least one tag
- Estimated duration set
- Privacy/monetization settings configured

**API Endpoints**:
```
POST /api/v1/quests/{questId}/publish
Response (200):
{
  "questId": "uuid",
  "status": "PUBLISHED",
  "publishedAt": "2025-10-23T10:00:00Z",
  "url": "/quests/historic-downtown-walking-tour"
}

POST /api/v1/quests/{questId}/unpublish
Response (200):
{
  "questId": "uuid",
  "status": "DRAFT"
}

GET /api/v1/quests/{questId}/publish-validation
Response (200):
{
  "canPublish": false,
  "missingRequirements": [
    "Quest must have at least 3 checkpoints",
    "Featured image required",
    "Category must be selected"
  ]
}
```

**Tasks**:
- [ ] Implement publish validation logic (Backend) - 4 hours
- [ ] Create publish/unpublish endpoints (Backend) - 3 hours
- [ ] Design publish confirmation dialog (Frontend) - 3 hours
- [ ] Build validation checklist UI (Frontend) - 4 hours
- [ ] Add publish button and states (Frontend) - 3 hours
- [ ] Implement notification on publish (Backend) - 2 hours
- [ ] Write unit tests (Backend) - 3 hours
- [ ] Write integration tests (Backend) - 3 hours

**Definition of Done**:
- [ ] Publishing workflow complete
- [ ] All validations working
- [ ] Unpublish functionality working
- [ ] Creator notified on publish
- [ ] Tests passing (>85% coverage)
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-2.1.4: Quest Templates
**Story ID**: US-2.1.4  
**Priority**: P1  
**Story Points**: 5  
**Sprint**: Sprint 5

**User Story**:
```
As a creator
I want to use pre-built quest templates
So that I can quickly create quests following proven patterns
```

**Acceptance Criteria**:
```gherkin
Given I click "Create from Template"
When I select a template (e.g., "City Walking Tour")
Then a quest is created with pre-filled structure

Given I use a template
When I customize checkpoints and details
Then my changes are saved as a new quest

Given I create a quest I'm proud of
When I click "Save as Template"
Then my quest structure is saved for future use
```

**Template Types**:
- City Walking Tour (5-10 checkpoints, historical/cultural)
- Scavenger Hunt (photo challenges, puzzles)
- Fitness Challenge (distance/time based)
- Food Tour (restaurant visits)
- Mystery Trail (story-driven, sequential)

**API Endpoints**:
```
GET /api/v1/quest-templates
Response (200):
{
  "templates": [
    {
      "templateId": "uuid",
      "name": "City Walking Tour",
      "description": "Guided tour template with historical stops",
      "checkpointCount": 7,
      "category": "HISTORICAL",
      "usageCount": 245
    }
  ]
}

POST /api/v1/quests/from-template
Request:
{
  "templateId": "uuid",
  "title": "My Custom Tour"
}
Response (201):
{
  "questId": "uuid",
  "title": "My Custom Tour",
  "status": "DRAFT",
  ...populated from template...
}

POST /api/v1/quest-templates
Request:
{
  "questId": "uuid",
  "name": "My Template",
  "description": "...",
  "isPublic": false
}
```

**Database Schema**:
```sql
CREATE TABLE quest_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(user_id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category quest_category,
  is_public BOOLEAN DEFAULT FALSE,
  template_data JSONB NOT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_creator (creator_id),
  INDEX idx_public (is_public)
);
```

**Tasks**:
- [ ] Design template gallery UI (Frontend) - 5 hours
- [ ] Create template schema (Backend) - 3 hours
- [ ] Implement template endpoints (Backend) - 4 hours
- [ ] Build template selector (Frontend) - 5 hours
- [ ] Create default templates (Content) - 6 hours
- [ ] Implement "Save as Template" (Backend) - 3 hours
- [ ] Write unit tests (Backend) - 3 hours
- [ ] Write integration tests (Backend) - 3 hours

**Definition of Done**:
- [ ] Template system working
- [ ] 5 default templates available
- [ ] Template customization working
- [ ] Save as template functional
- [ ] Tests passing (>85% coverage)
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-2.1.5: Quest Versioning & Updates
**Story ID**: US-2.1.5  
**Priority**: P2  
**Story Points**: 5  
**Sprint**: Sprint 5

**User Story**:
```
As a creator
I want to update my published quest
So that I can improve it based on feedback without losing history
```

**Acceptance Criteria**:
```gherkin
Given I have a published quest
When I make changes and save
Then a new version is created
And existing participants use the version they started

Given I create version 2.0
When new users start the quest
Then they get the latest version

Given I want to see changes
When I view version history
Then I see all versions with change descriptions
```

**API Endpoints**:
```
POST /api/v1/quests/{questId}/versions
Request:
{
  "changeDescription": "Added 2 new checkpoints",
  "isMajorUpdate": false
}

GET /api/v1/quests/{questId}/versions
Response (200):
{
  "versions": [
    {
      "version": "2.0",
      "publishedAt": "...",
      "changeDescription": "...",
      "participantCount": 15
    }
  ]
}
```

**Database Schema**:
```sql
CREATE TABLE quest_versions (
  version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(quest_id),
  version_number VARCHAR(10) NOT NULL,
  quest_data JSONB NOT NULL,
  change_description TEXT,
  published_at TIMESTAMP DEFAULT NOW(),
  participant_count INT DEFAULT 0,
  INDEX idx_quest (quest_id, version_number)
);
```

**Tasks**:
- [ ] Design versioning logic (Backend) - 4 hours
- [ ] Create versions table (Backend) - 2 hours
- [ ] Implement versioning endpoints (Backend) - 5 hours
- [ ] Build version history UI (Frontend) - 5 hours
- [ ] Handle version switching (Backend) - 4 hours
- [ ] Write unit tests (Backend) - 4 hours
- [ ] Write integration tests (Backend) - 3 hours

**Definition of Done**:
- [ ] Versioning system working
- [ ] Version history viewable
- [ ] Participants use correct versions
- [ ] Tests passing (>85% coverage)
- [ ] Deployed to staging
- [ ] PO acceptance

---

_[Additional stories US-2.1.6 - US-2.1.9 summarized for brevity]_

### Additional Stories (Summary):
- **US-2.1.6**: Quest Duplication/Cloning - 3 SP
- **US-2.1.7**: Quest Analytics Dashboard - 8 SP
- **US-2.1.8**: Quest Scheduling (Start/End Dates) - 3 SP
- **US-2.1.9**: Quest Difficulty Recommendations (AI) - 5 SP

**EPIC 2.1 Total**: 65 Story Points

---

# EPIC 2.2: Quest Discovery & Search

## Epic Overview
**Epic ID**: EPIC-2.2  
**Priority**: P0 (Must Have)  
**Sprint Assignment**: Sprint 5-6  
**Estimated Effort**: 55 Story Points  

### Epic Goal
Build robust quest discovery system with search, filtering, recommendations, and personalization to help users find quests that match their interests.

### Key Stories:
- **US-2.2.1**: Quest Search with Filters (8 SP)
- **US-2.2.2**: Geospatial Quest Discovery (8 SP)
- **US-2.2.3**: Quest Feed/Browse (5 SP)
- **US-2.2.4**: Quest Recommendations Engine (13 SP)
- **US-2.2.5**: Featured/Trending Quests (5 SP)
- **US-2.2.6**: Quest Categories & Tags (5 SP)
- **US-2.2.7**: Search Analytics (3 SP)
- **US-2.2.8**: Recently Viewed Quests (3 SP)
- **US-2.2.9**: Saved/Bookmarked Quests (5 SP)

---

# EPIC 2.3: Quest Participation

## Epic Overview
**Epic ID**: EPIC-2.3  
**Priority**: P0 (Must Have)  
**Sprint Assignment**: Sprint 6-7  
**Estimated Effort**: 70 Story Points

### Epic Goal
Enable users to start, participate in, pause, and complete quests with real-time checkpoint validation, progress tracking, and navigation.

### Key Stories:
- **US-2.3.1**: Start Quest Flow (8 SP)
- **US-2.3.2**: Real-time GPS Tracking (13 SP)
- **US-2.3.3**: Checkpoint Validation (GPS) (8 SP)
- **US-2.3.4**: Photo Upload at Checkpoints (8 SP)
- **US-2.3.5**: Progress Tracking (5 SP)
- **US-2.3.6**: Navigation to Next Checkpoint (8 SP)
- **US-2.3.7**: Pause/Resume Quest (5 SP)
- **US-2.3.8**: Quest Completion Flow (8 SP)
- **US-2.3.9**: Team Quest Participation (13 SP)

---

# EPIC 2.4: Quest Rewards & Gamification

## Epic Overview
**Epic ID**: EPIC-2.4  
**Priority**: P0 (Must Have)  
**Sprint Assignment**: Sprint 7-8  
**Estimated Effort**: 60 Story Points

### Epic Goal
Implement reward distribution system with XP, badges, achievements, leaderboards, and virtual currency integration.

### Key Stories:
- **US-2.4.1**: XP Award System (8 SP)
- **US-2.4.2**: Level Progression (8 SP)
- **US-2.4.3**: Badge/Achievement System (13 SP)
- **US-2.4.4**: Quest Leaderboards (8 SP)
- **US-2.4.5**: Virtual Currency (Coins) (8 SP)
- **US-2.4.6**: Reward Claims (5 SP)
- **US-2.4.7**: Streak Tracking (5 SP)
- **US-2.4.8**: Physical Prize Integration (5 SP)

---

# INITIATIVE 3: GEOSPATIAL SERVICES

## Initiative Goal
Build comprehensive location-based services including GPS tracking, mapping, routing, geofencing, and spatial search to enable all location-dependent features.

### Success Metrics
- <5m GPS accuracy in urban areas
- <1s map tile loading
- 100% geofence detection accuracy
- Route optimization <500ms
- Support for offline maps

---

# EPIC 3.1: Core Geospatial Infrastructure

## Epic Overview
**Epic ID**: EPIC-3.1  
**Priority**: P0 (Must Have)  
**Sprint Assignment**: Sprint 4-5  
**Estimated Effort**: 55 Story Points

### Epic Goal
Establish foundational geospatial services including GPS tracking, coordinate storage, distance calculations, and map rendering.

---

## User Stories for EPIC 3.1

### US-3.1.1: GPS Tracking Service
**Story ID**: US-3.1.1  
**Priority**: P0  
**Story Points**: 13  
**Sprint**: Sprint 4

**User Story**:
```
As a mobile app user
I want my location to be accurately tracked during quests
So that checkpoints can be automatically validated
```

**Acceptance Criteria**:
```gherkin
Given I start a quest
When I enable location services
Then my GPS position is tracked continuously
And position updates every 5 seconds

Given I am near a checkpoint (within 50m)
When my location updates
Then the app detects I'm at the checkpoint
And triggers validation

Given GPS signal is weak
When location accuracy is >50m
Then I see a warning about poor GPS signal
And checkpoint validation is disabled until accuracy improves

Given I'm indoors with no GPS
When I try to check in at a checkpoint
Then I see option to manually confirm location
And am warned it won't count for verification
```

**Technical Requirements**:
- Background GPS tracking (iOS/Android)
- Battery optimization (adaptive tracking frequency)
- Accuracy filtering (ignore readings >50m accuracy)
- Location permission handling
- Fallback to Wi-Fi/cell tower triangulation

**API Endpoints**:
```
POST /api/v1/location/track
Request:
{
  "userId": "uuid",
  "questId": "uuid",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "accuracy": 15, // meters
  "altitude": 100,
  "heading": 90, // degrees
  "speed": 1.5, // m/s
  "timestamp": "2025-10-23T10:00:00Z"
}

Response (200):
{
  "tracked": true,
  "nearbyCheckpoints": [
    {
      "checkpointId": "uuid",
      "distance": 45, // meters
      "canCheckIn": true
    }
  ]
}

GET /api/v1/location/current
Response (200):
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "accuracy": 15
}
```

**Database Schema**:
```sql
CREATE TABLE location_tracking (
  track_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  quest_participation_id UUID REFERENCES quest_participations(participation_id),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(6,2), -- meters
  altitude DECIMAL(8,2),
  heading DECIMAL(5,2), -- degrees 0-360
  speed DECIMAL(5,2), -- m/s
  timestamp TIMESTAMP NOT NULL,
  INDEX idx_user_time (user_id, timestamp),
  INDEX idx_participation (quest_participation_id),
  INDEX idx_location (latitude, longitude)
);

-- GeoSpatial index using PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE location_tracking ADD COLUMN geom GEOMETRY(Point, 4326);
CREATE INDEX idx_geom ON location_tracking USING GIST(geom);

-- Trigger to update geometry
CREATE OR REPLACE FUNCTION update_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER location_geom_trigger
  BEFORE INSERT OR UPDATE ON location_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_location_geom();
```

**Mobile Implementation** (React Native example):
```typescript
// GPS Tracking Service
import Geolocation from '@react-native-community/geolocation';
import BackgroundGeolocation from 'react-native-background-geolocation';

class GPSTrackingService {
  async startTracking(questId: string) {
    // Request permissions
    await this.requestPermissions();
    
    // Configure background tracking
    await BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10, // meters
      stopTimeout: 5, // minutes
      debug: false,
      stopOnTerminate: false,
      startOnBoot: true,
      locationUpdateInterval: 5000, // 5 seconds
      fastestLocationUpdateInterval: 3000,
    });

    // Start tracking
    BackgroundGeolocation.start();
    
    // Listen for location updates
    BackgroundGeolocation.onLocation(
      this.handleLocationUpdate.bind(this),
      (error) => console.error('Location error:', error)
    );
  }

  async handleLocationUpdate(location: Location) {
    const {latitude, longitude, accuracy, altitude, heading, speed} = location.coords;
    
    // Filter low accuracy readings
    if (accuracy > 50) {
      console.warn('Poor GPS accuracy:', accuracy);
      return;
    }

    // Send to backend
    await api.post('/location/track', {
      latitude,
      longitude,
      accuracy,
      altitude,
      heading,
      speed,
      timestamp: new Date().toISOString(),
    });
  }

  async stopTracking() {
    await BackgroundGeolocation.stop();
  }
}
```

**Tasks**:
- [ ] Research and select GPS library (Mobile) - 4 hours
- [ ] Implement GPS tracking service (Mobile) - 12 hours
- [ ] Add background tracking (Mobile) - 8 hours
- [ ] Implement location permissions (Mobile) - 4 hours
- [ ] Create location tracking API (Backend) - 6 hours
- [ ] Add PostGIS extension (Backend) - 2 hours
- [ ] Implement checkpoint proximity detection (Backend) - 6 hours
- [ ] Add battery optimization logic (Mobile) - 5 hours
- [ ] Build GPS accuracy indicator UI (Mobile) - 4 hours
- [ ] Write unit tests (Backend/Mobile) - 8 hours
- [ ] Write integration tests (Backend) - 6 hours
- [ ] Field testing (QA) - 8 hours

**Definition of Done**:
- [ ] GPS tracking working in foreground and background
- [ ] Checkpoint proximity detection functional
- [ ] Battery usage optimized
- [ ] Accuracy filtering working
- [ ] Permission handling proper
- [ ] Tests passing (>80% coverage)
- [ ] Field tested in various conditions
- [ ] Performance acceptable (<5% battery drain per hour)
- [ ] Documentation complete
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-3.1.2: Map Display Integration (OpenStreetMap)
**Story ID**: US-3.1.2  
**Priority**: P0  
**Story Points**: 8  
**Sprint**: Sprint 4

**User Story**:
```
As a user
I want to see quests and checkpoints displayed on an interactive map
So that I can visualize the adventure route
```

**Acceptance Criteria**:
```gherkin
Given I am viewing a quest
When I open the map view
Then I see all checkpoints displayed as markers
And a route line connecting them

Given I tap a checkpoint marker
When the marker is selected
Then I see checkpoint details in a popup
And can start navigation to it

Given I zoom out on the map
When checkpoints are close together
Then markers cluster automatically
And show the count of checkpoints

Given I'm on mobile data
When viewing the map
Then map tiles are cached for offline use
And bandwidth usage is minimized
```

**Technical Requirements**:
- OpenStreetMap tile server (free)
- Marker clustering for performance
- Custom map styles
- Offline map caching
- Route polyline display
- Current location marker

**Map Libraries**:
- **Web**: Leaflet.js or Mapbox GL JS
- **Mobile**: react-native-maps or Mapbox React Native

**API Endpoints**:
```
GET /api/v1/maps/tiles/{z}/{x}/{y}.png
Response: PNG tile image (proxied from OSM or self-hosted)

GET /api/v1/quests/{questId}/map-data
Response (200):
{
  "checkpoints": [
    {
      "checkpointId": "uuid",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "title": "City Hall",
      "orderIndex": 1
    }
  ],
  "route": {
    "coordinates": [[lat, lng], ...],
    "distance": 5.2, // km
    "estimatedDuration": 65 // minutes
  },
  "bounds": {
    "north": 37.80,
    "south": 37.75,
    "east": -122.40,
    "west": -122.45
  }
}
```

**Web Implementation** (Leaflet example):
```typescript
import L from 'leaflet';
import 'leaflet.markercluster';

class QuestMapComponent {
  initMap(containerId: string, questData: QuestMapData) {
    // Initialize map
    const map = L.map(containerId).setView(
      [questData.bounds.centerLat, questData.bounds.centerLng],
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add checkpoint markers with clustering
    const markers = L.markerClusterGroup();
    
    questData.checkpoints.forEach((checkpoint, index) => {
      const marker = L.marker([checkpoint.latitude, checkpoint.longitude], {
        icon: this.createCustomIcon(index + 1),
      });
      
      marker.bindPopup(`
        <div>
          <h3>${checkpoint.title}</h3>
          <p>${checkpoint.description}</p>
          <button onclick="navigateToCheckpoint('${checkpoint.checkpointId}')">
            Navigate Here
          </button>
        </div>
      `);
      
      markers.addLayer(marker);
    });
    
    map.addLayer(markers);

    // Draw route
    const routeLine = L.polyline(questData.route.coordinates, {
      color: '#007AFF',
      weight: 4,
      opacity: 0.7,
    }).addTo(map);

    // Fit bounds to show all checkpoints
    map.fitBounds(routeLine.getBounds());

    // Add user location marker
    this.addUserLocationMarker(map);
  }

  createCustomIcon(number: number) {
    return L.divIcon({
      html: `<div class="checkpoint-marker">${number}</div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
    });
  }
}
```

**Tasks**:
- [ ] Select and configure map library (Frontend) - 4 hours
- [ ] Implement map component (Frontend) - 8 hours
- [ ] Add custom checkpoint markers (Frontend) - 4 hours
- [ ] Implement marker clustering (Frontend) - 4 hours
- [ ] Add route polyline display (Frontend) - 3 hours
- [ ] Implement map popup interactions (Frontend) - 4 hours
- [ ] Add offline tile caching (Mobile) - 6 hours
- [ ] Create map data API endpoint (Backend) - 4 hours
- [ ] Optimize tile serving (Backend) - 4 hours
- [ ] Add user location marker (Frontend) - 3 hours
- [ ] Style map for brand consistency (Frontend) - 4 hours
- [ ] Write unit tests (Frontend) - 4 hours
- [ ] Performance testing (QA) - 4 hours

**Definition of Done**:
- [ ] Map displaying correctly on all devices
- [ ] Checkpoint markers clickable and informative
- [ ] Route line displayed accurately
- [ ] Marker clustering working at scale
- [ ] Offline caching functional (mobile)
- [ ] User location tracking on map
- [ ] Performance: <2s map load time
- [ ] Tests passing
- [ ] Deployed to staging
- [ ] PO acceptance

---

_[Additional stories US-3.1.3 - US-3.1.6 summarized for brevity]_

### Additional Stories (Summary):
- **US-3.1.3**: Distance Calculation Service - 5 SP
- **US-3.1.4**: Route Optimization Algorithm - 13 SP
- **US-3.1.5**: Geocoding & Reverse Geocoding - 8 SP
- **US-3.1.6**: Spatial Search & Queries - 8 SP

**EPIC 3.1 Total**: 55 Story Points

---

# EPIC 3.2: Navigation & Routing

## Epic Overview
**Epic ID**: EPIC-3.2  
**Priority**: P0 (Must Have)  
**Sprint Assignment**: Sprint 6-7  
**Estimated Effort**: 50 Story Points

### Key Stories:
- **US-3.2.1**: Turn-by-Turn Navigation (13 SP)
- **US-3.2.2**: Route Recalculation (8 SP)
- **US-3.2.3**: Navigation Voice Guidance (8 SP)
- **US-3.2.4**: Offline Maps Download (8 SP)
- **US-3.2.5**: Alternative Routes (5 SP)
- **US-3.2.6**: Navigation Preferences (3 SP)
- **US-3.2.7**: ETA Calculation (5 SP)

---

# EPIC 3.3: Geofencing & Proximity

## Epic Overview
**Epic ID**: EPIC-3.3  
**Priority**: P0 (Must Have)  
**Sprint Assignment**: Sprint 7-8  
**Estimated Effort**: 45 Story Points

### Key Stories:
- **US-3.3.1**: Geofence Creation & Management (8 SP)
- **US-3.3.2**: Entry/Exit Detection (8 SP)
- **US-3.3.3**: Proximity Alerts (5 SP)
- **US-3.3.4**: Checkpoint Auto-Check-In (8 SP)
- **US-3.3.5**: Zone-based Notifications (5 SP)
- **US-3.3.6**: Geofence Analytics (3 SP)
- **US-3.3.7**: Multiple Geofence Types (8 SP)

---

# EPIC 3.4: Location-based Features

## Epic Overview
**Epic ID**: EPIC-3.4  
**Priority**: P1 (Should Have)  
**Sprint Assignment**: Sprint 8-9  
**Estimated Effort**: 40 Story Points

### Key Stories:
- **US-3.4.1**: Nearby Quests Discovery (8 SP)
- **US-3.4.2**: Location-based Notifications (5 SP)
- **US-3.4.3**: Area-based Quest Search (8 SP)
- **US-3.4.4**: POI Integration (8 SP)
- **US-3.4.5**: Heat Map Visualization (8 SP)
- **US-3.4.6**: Location History (3 SP)

---

## 📊 Quest & Geospatial Summary

### Total Effort Across Initiatives
- **Initiative 2 (Quest)**: ~250 Story Points
- **Initiative 3 (Geospatial)**: ~190 Story Points
- **Combined Total**: ~440 Story Points
- **Estimated Duration**: 16-20 weeks (8-10 sprints)
- **Team Size Required**: 10-12 developers

### Sprint Breakdown (Sprints 3-10)

#### Sprint 3-4: Quest Creation & GPS Foundation
- Quest creation, checkpoint management
- GPS tracking, map integration
- **Points**: ~95
- **Deliverable**: Creators can build quests, GPS tracking works

#### Sprint 5-6: Quest Discovery & Navigation
- Quest search, filters, recommendations
- Turn-by-turn navigation, routing
- **Points**: ~105
- **Deliverable**: Users can find and navigate quests

#### Sprint 7-8: Quest Participation & Geofencing
- Quest start/complete flows, validation
- Geofencing, proximity detection
- **Points**: ~120
- **Deliverable**: Full quest participation cycle works

#### Sprint 9-10: Rewards & Advanced Features
- XP, badges, leaderboards
- Location-based features, analytics
- **Points**: ~120
- **Deliverable**: Gamification complete, advanced features

---

## 🎯 Phase 3 Success Criteria

### Must Achieve
- ✅ Complete quest lifecycle (create → discover → participate → complete)
- ✅ GPS accuracy <10m in urban areas
- ✅ <2s quest search response time
- ✅ 95%+ checkpoint validation accuracy
- ✅ Navigation working offline
- ✅ Zero data loss during quest participation
- ✅ All core features tested and documented

### Quality Gates
- ✅ Code coverage >85%
- ✅ Zero critical bugs in production
- ✅ Performance: 95th percentile <500ms API response
- ✅ Mobile app crash rate <0.1%
- ✅ User acceptance testing passed

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Status**: Approved  
**Next Phase**: Phase 4 - Gamification & Social Features

---

END OF PHASE 3
