# Getting Started - Adventure Management Platform

Welcome to the Adventure Management Platform! This guide will help you set up the development environment and start building.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Deployment](#deployment)

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Docker**: 24.x or higher
- **Docker Compose**: 2.x or higher
- **PostgreSQL**: 15.x or higher (or use Docker)
- **Redis**: 7.x or higher (or use Docker)
- **MongoDB**: 7.x or higher (or use Docker)
- **Git**: 2.x or higher

### Optional Software

- **Postman**: For API testing
- **VS Code**: Recommended IDE
- **React Native CLI**: For mobile development
- **Xcode**: For iOS development (macOS only)
- **Android Studio**: For Android development

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 10GB free space
- **OS**: Linux, macOS, or Windows (WSL2 recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/Adventure-Management-Platform.git
cd Adventure-Management-Platform
```

### 2. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

**Important**: Update these critical values:
- `JWT_SECRET`: Generate a secure random string
- `POSTGRES_PASSWORD`: Set a strong password
- Database URLs if not using Docker

### 3. Start Infrastructure with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MongoDB (port 27017)
- All 12 microservices
- Frontend (port 80)
- Admin Dashboard (port 8080)

### 4. Run Database Migrations

```bash
# Run migrations for each service
cd services/auth-service && npm run migrate
cd ../quest-service && npm run migrate
# ... repeat for other services
```

### 5. Seed Test Data

```bash
# Run the master seed script
./scripts/seed-all.sh
```

This creates:
- 100 test users
- 50 quests with checkpoints
- Sample social data
- Test achievements

### 6. Access the Applications

- **API Gateway**: http://localhost:3000
- **Web Frontend**: http://localhost:80
- **Admin Dashboard**: http://localhost:8080
- **API Documentation**: http://localhost:3000/api-docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

### 7. Test Login Credentials

**Admin Dashboard**:
- Email: `admin@adventure-platform.com`
- Password: `password123`

**Regular User**:
- Email: `user1@test.com`
- Password: `password123`

## Architecture Overview

### Microservices

The platform consists of 12 microservices:

1. **API Gateway** (Port 3000) - Request routing, authentication, rate limiting
2. **Auth Service** (Port 3001) - User authentication, JWT tokens
3. **Quest Service** (Port 3002) - Quest management, checkpoints
4. **Profile Service** (Port 3003) - User profiles, preferences
5. **Gamification Service** (Port 3004) - XP, levels, achievements
6. **Social Service** (Port 3005) - Follow, feed, groups
7. **Geospatial Service** (Port 3006) - Location-based features
8. **Notification Service** (Port 3007) - Email, push notifications
9. **Payment Service** (Port 3008) - Stripe integration
10. **Media Service** (Port 3009) - Image uploads, S3 storage
11. **Analytics Service** (Port 3010) - User analytics, metrics
12. **Admin Service** (Port 3011) - Admin operations, moderation

### Frontend Applications

- **Web App** (React 18 + TypeScript) - User-facing web application
- **Admin Dashboard** (React 18 + Tailwind CSS) - Admin interface
- **Mobile App** (React Native 0.73) - iOS & Android app

### Databases

- **PostgreSQL**: 6 databases (auth, quests, profiles, gamification, social, admin)
- **MongoDB**: Geospatial data
- **Redis**: Caching and sessions

### Communication Pattern

```
[Mobile/Web] → [API Gateway] → [Microservices] → [Databases]
                     ↓
              [Redis Cache]
```

## Development Workflow

### Working on Backend Services

1. Navigate to service directory:
```bash
cd services/auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Start in development mode:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

5. Lint code:
```bash
npm run lint
```

### Working on Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

### Working on Mobile App

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

4. Start Metro bundler:
```bash
npm start
```

5. Run on iOS:
```bash
npm run ios
```

6. Run on Android:
```bash
npm run android
```

## Testing

### Unit Tests

```bash
# Test specific service
cd services/auth-service
npm test

# Test with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### E2E Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e
```

### Manual API Testing

Use the provided Postman collection:

```bash
# Import collection
postman import docs/api/Adventure-Platform.postman_collection.json
```

## Deployment

### Docker Compose (Staging/Production)

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Kubernetes (Production)

```bash
# Apply configurations
kubectl apply -f k8s/production/

# Check status
kubectl get pods -n adventure-platform

# View logs
kubectl logs -f <pod-name> -n adventure-platform
```

### Individual Service Deployment

```bash
# Build service
docker build -t auth-service ./services/auth-service

# Push to registry
docker tag auth-service ghcr.io/your-org/auth-service:latest
docker push ghcr.io/your-org/auth-service:latest
```

## Common Tasks

### Adding a New Microservice

1. Create service directory:
```bash
mkdir -p services/new-service/src
```

2. Copy boilerplate from existing service
3. Update package.json
4. Add to docker-compose.yml
5. Add route to API Gateway
6. Update documentation

### Adding a New Database Table

1. Create migration file:
```bash
cd services/your-service
npm run migration:create -- AddNewTable
```

2. Edit migration file
3. Run migration:
```bash
npm run migrate
```

### Updating Environment Variables

1. Update `.env.example` with new variable
2. Update `docs/ENVIRONMENT_SETUP.md`
3. Update service configuration
4. Restart affected services

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
psql postgresql://postgres:postgres@localhost:5432/adventure_auth

# View logs
docker-compose logs postgres
```

### Service Not Starting

```bash
# Check service logs
docker-compose logs auth-service

# Restart service
docker-compose restart auth-service

# Rebuild service
docker-compose up -d --build auth-service
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture
- Review [API_GUIDE.md](./API_GUIDE.md) for API documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

## Support

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Slack**: #adventure-platform channel
- **Email**: dev@adventure-platform.com

## License

Proprietary - Adventure Management Platform
Copyright © 2025. All rights reserved.
