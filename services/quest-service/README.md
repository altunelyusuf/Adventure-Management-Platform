# Quest Service

Quest Management Service for the Adventure Management Platform. Handles quest creation, management, discovery, and participation tracking.

## Features

### Quest Management (US-2.1.1 - 8 SP)
- Create, read, update, delete quests
- Draft and published statuses
- Rich metadata (title, description, difficulty, category, tags)
- Automatic slug generation
- Quest versioning
- Featured images

### Checkpoint Management (US-2.1.2 - 8 SP)
- Multiple validation types (GPS, Photo, QR Code, Question, AR Marker, Time-based)
- Geospatial location tracking
- Automatic distance calculations
- Checkpoint reordering
- Hints and rewards

### Quest Publishing (US-2.1.3 - 5 SP)
- Pre-publish validation
- Required fields checking
- Minimum checkpoint enforcement
- Publish/unpublish workflow

### Quest Discovery
- Full-text search
- Category filtering
- Difficulty filtering
- Geospatial search (radius-based)
- Tag-based filtering
- Creator filtering

### Quest Participation
- Start/abandon quests
- Checkpoint completion tracking
- Progress tracking
- GPS validation
- Photo proof upload
- Rating and review system

## API Endpoints

### Quest Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/quests` | Create new quest | Required |
| GET | `/api/v1/quests/:questId` | Get quest by ID | Optional |
| GET | `/api/v1/quests/slug/:slug` | Get quest by slug | Optional |
| PUT | `/api/v1/quests/:questId` | Update quest | Required |
| DELETE | `/api/v1/quests/:questId` | Delete quest | Required |
| POST | `/api/v1/quests/:questId/publish` | Publish quest | Required |
| POST | `/api/v1/quests/:questId/unpublish` | Unpublish quest | Required |
| GET | `/api/v1/quests/search` | Search quests | Optional |
| GET | `/api/v1/quests/my/quests` | Get my quests | Required |
| GET | `/api/v1/quests/categories` | Get all categories | Public |

### Checkpoint Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/quests/:questId/checkpoints` | Create checkpoint | Required |
| GET | `/api/v1/quests/:questId/checkpoints` | Get quest checkpoints | Public |
| GET | `/api/v1/checkpoints/:checkpointId` | Get checkpoint | Public |
| PUT | `/api/v1/checkpoints/:checkpointId` | Update checkpoint | Required |
| DELETE | `/api/v1/checkpoints/:checkpointId` | Delete checkpoint | Required |
| POST | `/api/v1/quests/:questId/checkpoints/reorder` | Reorder checkpoints | Required |

### Participation Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/participations/quests/:questId/start` | Start quest | Required |
| GET | `/api/v1/participations/me` | Get my participations | Required |
| GET | `/api/v1/participations/:participationId` | Get participation | Required |
| POST | `/api/v1/participations/:participationId/checkpoints/:checkpointId/complete` | Complete checkpoint | Required |
| POST | `/api/v1/participations/:participationId/abandon` | Abandon quest | Required |
| POST | `/api/v1/participations/:participationId/rate` | Rate quest | Required |

## Environment Variables

```env
NODE_ENV=development
QUEST_SERVICE_PORT=3004

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=adventure_user
POSTGRES_PASSWORD=adventure_pass
POSTGRES_DB=adventure_platform
POSTGRES_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2

# Authentication
JWT_ACCESS_SECRET=your-secret-key

# Quest Configuration
MIN_CHECKPOINTS=3
MAX_CHECKPOINTS=50
DEFAULT_CHECKPOINT_RADIUS=50
MAX_QUEST_DISTANCE_KM=100

# Geospatial
DEFAULT_SEARCH_RADIUS_KM=50
MAX_SEARCH_RADIUS_KM=500
```

## Running Locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test
```

## Running with Docker

```bash
# Build image
docker build -t quest-service .

# Run container
docker run -p 3004:3004 \
  -e POSTGRES_HOST=postgres \
  -e REDIS_HOST=redis \
  quest-service
```

## Database Models

### Quest
- Quest metadata (title, description, difficulty, category)
- Creator information
- Publishing status
- Statistics (views, participants, completions, ratings)
- Geospatial data (start location, total distance)
- Premium features

### Checkpoint
- Location data (latitude, longitude, radius)
- Validation type and data
- Rewards (points)
- Ordering and progression
- Hints and images

### Quest Participation
- User progress tracking
- Status (started, in progress, completed, abandoned)
- Statistics (checkpoints completed, points earned)
- Rating and review

### Checkpoint Completion
- Completion timestamp
- Proof (photo URL, answer)
- GPS validation data
- Validation status

### Quest Category
- Category metadata
- Icon and color
- Quest count

## Quest Validation Types

### GPS Validation
- User must be within specified radius of checkpoint
- Real-time location verification
- Distance calculation using Haversine formula

### Photo Validation
- Requires photo upload
- Manual or AI-based validation
- Photo prompt for guidance

### QR Code Validation
- QR code scanning
- Automatic validation
- Unique code per checkpoint

### Question Validation
- Text-based answers
- Automatic validation
- Case-insensitive matching

### AR Marker Validation
- Augmented reality markers
- Camera-based validation
- Future enhancement

### Time-based Validation
- Available only during specific times
- Automatic validation
- Time range configuration

## Geospatial Features

### Distance Calculations
- Haversine formula for accurate distance
- Total quest distance calculation
- Distance between consecutive checkpoints
- Walking time estimation (12 min/km)

### Location-based Search
- Radius-based quest discovery
- Maximum search radius enforcement
- Efficient geospatial queries

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS
- **ORM**: TypeORM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet

## Development

### Code Structure
```
src/
├── config/          # Configuration files
├── models/          # TypeORM entities
├── services/        # Business logic
├── controllers/     # Request handlers
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Utility functions
└── index.ts         # Server entry point
```

### Testing
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Story Points Delivered

- **US-2.1.1**: Basic Quest Creation - 8 SP ✅
- **US-2.1.2**: Checkpoint Creation & Management - 8 SP ✅
- **US-2.1.3**: Quest Publishing Workflow - 5 SP ✅
- **Quest Discovery**: Basic search and filtering - 5 SP ✅
- **Quest Participation**: Start, complete, track - 5 SP ✅

**Total**: 31 Story Points

## Health Check

```bash
curl http://localhost:3004/health
```

Response:
```json
{
  "status": "healthy",
  "service": "quest-service"
}
```

## License

MIT
