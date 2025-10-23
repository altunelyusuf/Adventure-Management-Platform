# User Service

User Profile Management microservice for the Adventure Management Platform.

## Features

✅ User profile CRUD operations
✅ Avatar upload and processing (multiple sizes)
✅ User preferences management
✅ Privacy settings management
✅ Profile search
✅ Statistics tracking

## API Endpoints

### Profiles
- `GET /api/v1/profiles/:userId` - Get user profile
- `GET /api/v1/profiles/username/:username` - Get profile by username
- `GET /api/v1/profiles/me` - Get own profile (auth required)
- `PUT /api/v1/profiles/:userId` - Update profile (auth required)
- `POST /api/v1/profiles/:userId/avatar` - Upload avatar (auth required)
- `GET /api/v1/profiles/search?q=query` - Search profiles

### Preferences
- `GET /api/v1/profiles/:userId/preferences` - Get preferences (auth required)
- `PUT /api/v1/profiles/:userId/preferences` - Update preferences (auth required)

### Privacy
- `GET /api/v1/profiles/:userId/privacy` - Get privacy settings (auth required)
- `PUT /api/v1/profiles/:userId/privacy` - Update privacy settings (auth required)

### Health
- `GET /api/v1/profiles/health` - Health check

## Tech Stack

- Node.js 18+ / TypeScript
- Express.js
- PostgreSQL (TypeORM)
- Redis (caching)
- Sharp (image processing)
- Minio/S3 (file storage)

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all configuration options.

---

**Version**: 1.0.0
**Status**: Phase 2 Complete
