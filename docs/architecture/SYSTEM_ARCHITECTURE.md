# System Architecture
## Adventure Management Platform

### Document Version: 1.0
### Date: October 23, 2025
### Status: Phase 1 - Foundation

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture Style](#architecture-style)
3. [System Components](#system-components)
4. [Data Architecture](#data-architecture)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Integration Architecture](#integration-architecture)
8. [Performance & Scalability](#performance--scalability)

---

## Overview

The Adventure Management Platform is a cloud-native, microservices-based system designed for location-based adventure management with integrated gamification, social networking, creator economy, and streaming capabilities.

### Key Characteristics
- **Architecture**: Microservices with API Gateway pattern
- **Communication**: REST APIs, WebSocket, Message Queue (async)
- **Data**: Polyglot persistence (PostgreSQL, MongoDB, Redis)
- **Deployment**: Containerized (Docker + Kubernetes)
- **Scalability**: Horizontal scaling with load balancing
- **Reliability**: 99.9% uptime target

---

## Architecture Style

### Microservices Architecture

The platform adopts a microservices architecture to achieve:
- **Independent deployability** - Services can be deployed independently
- **Technology diversity** - Each service can use optimal tech stack
- **Scalability** - Scale services independently based on load
- **Fault isolation** - Failures contained to specific services
- **Team autonomy** - Teams can work independently on services

### Design Principles

1. **Single Responsibility** - Each service has one clear purpose
2. **Loose Coupling** - Services communicate through well-defined APIs
3. **High Cohesion** - Related functionality grouped together
4. **Data Ownership** - Each service owns its data
5. **API-First** - All functionality exposed through APIs
6. **Event-Driven** - Asynchronous communication where appropriate

---

## System Components

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Mobile App (React Native)  │  Admin Panel  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CDN / Load Balancer                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
│  - Authentication    - Rate Limiting    - Request Routing       │
│  - Load Balancing    - API Versioning   - Response Caching      │
└─────────────────────────────────────────────────────────────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Core Services          │   │   Feature Services       │
├──────────────────────────┤   ├──────────────────────────┤
│ • Auth Service           │   │ • Quest Service          │
│ • User Service           │   │ • Geospatial Service     │
│ • Notification Service   │   │ • Gamification Service   │
│                          │   │ • Social Service         │
│                          │   │ • Creator Service        │
│                          │   │ • Streaming Service      │
└──────────────────────────┘   └──────────────────────────┘
                  │                       │
                  └───────────┬───────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                   │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  MongoDB  │  Redis  │  Elasticsearch  │  RabbitMQ│
└─────────────────────────────────────────────────────────────────┘
```

### Service Catalog

#### 1. API Gateway
**Purpose**: Single entry point for all client requests
**Technology**: Node.js + Express / Kong
**Responsibilities**:
- Request routing to appropriate services
- Authentication & authorization
- Rate limiting & throttling
- Request/response transformation
- API versioning
- Caching
- Logging & monitoring

#### 2. Auth Service
**Purpose**: Authentication and authorization
**Technology**: Node.js + Passport.js / Python + FastAPI
**Database**: PostgreSQL + Redis
**Responsibilities**:
- User authentication (email/password, OAuth)
- JWT token generation and validation
- Password hashing and verification
- 2FA management
- Session management
- Role-based access control (RBAC)

**API Endpoints**:
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/oauth/google
GET    /auth/oauth/facebook
GET    /auth/oauth/apple
```

#### 3. User Service
**Purpose**: User profile and account management
**Technology**: Node.js / Python
**Database**: PostgreSQL
**Responsibilities**:
- User profile CRUD
- User preferences
- Avatar and media management
- Account settings
- User search
- Privacy settings

**API Endpoints**:
```
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
GET    /users/:id/profile
PUT    /users/:id/profile
GET    /users/search
```

#### 4. Quest Service
**Purpose**: Quest creation, management, and participation
**Technology**: Node.js / Python
**Database**: PostgreSQL + MongoDB
**Responsibilities**:
- Quest CRUD operations
- Checkpoint management
- Quest state tracking
- Participation tracking
- Quest completion verification
- AI quest generation (future)
- Quest templates

**API Endpoints**:
```
GET    /quests
POST   /quests
GET    /quests/:id
PUT    /quests/:id
DELETE /quests/:id
GET    /quests/:id/checkpoints
POST   /quests/:id/participate
POST   /quests/:id/complete
GET    /quests/search
GET    /quests/recommended
```

#### 5. Geospatial Service
**Purpose**: Location tracking, mapping, routing
**Technology**: Node.js / Python + PostGIS
**Database**: MongoDB (GeoJSON) + PostgreSQL (PostGIS)
**Responsibilities**:
- GPS coordinate validation
- Geofencing
- Route planning and optimization
- POI management
- Distance calculations
- Map data integration (OSM)

**API Endpoints**:
```
POST   /geo/validate-location
POST   /geo/geofence/check
POST   /geo/route/plan
GET    /geo/poi/nearby
GET    /geo/poi/:id
POST   /geo/distance
```

#### 6. Gamification Service
**Purpose**: Achievements, badges, leaderboards, XP
**Technology**: Node.js / Python
**Database**: PostgreSQL + Redis
**Responsibilities**:
- XP calculation and tracking
- Level progression
- Achievement unlocking
- Badge awarding
- Leaderboard management
- Reward distribution
- Streak tracking

**API Endpoints**:
```
GET    /gamification/xp/:userId
POST   /gamification/xp/award
GET    /gamification/achievements/:userId
POST   /gamification/achievements/unlock
GET    /gamification/leaderboard
GET    /gamification/badges/:userId
```

#### 7. Social Service
**Purpose**: Social networking, friends, teams, messaging
**Technology**: Node.js
**Database**: PostgreSQL + Redis
**Responsibilities**:
- Friend connections
- Team/guild management
- Activity feed
- Messaging (DM, group chat)
- Notifications
- Social graph

**API Endpoints**:
```
GET    /social/friends
POST   /social/friends/request
GET    /social/teams
POST   /social/teams
GET    /social/feed
POST   /social/messages
GET    /social/messages/:conversationId
```

#### 8. Creator Service
**Purpose**: Creator economy, subscriptions, monetization
**Technology**: Node.js / Python
**Database**: PostgreSQL
**Responsibilities**:
- Creator account management
- Subscription tier management
- Revenue tracking
- Payout processing
- Analytics dashboard
- Tax compliance

**API Endpoints**:
```
GET    /creators/:id
PUT    /creators/:id
GET    /creators/:id/subscribers
GET    /creators/:id/revenue
GET    /creators/:id/analytics
POST   /creators/:id/payout
```

#### 9. Streaming Service
**Purpose**: Live streaming, broadcasting
**Technology**: Node.js + WebRTC / Media servers
**Database**: PostgreSQL + MongoDB
**Responsibilities**:
- Stream lifecycle management
- Stream ingest (RTMP)
- Stream delivery (HLS, WebRTC)
- Chat integration
- VOD management
- Multi-platform distribution

**API Endpoints**:
```
POST   /streams/start
POST   /streams/stop
GET    /streams/live
GET    /streams/:id
POST   /streams/:id/chat
GET    /streams/:id/viewers
```

#### 10. Notification Service
**Purpose**: Multi-channel notifications
**Technology**: Node.js
**Database**: PostgreSQL + Redis
**Message Queue**: RabbitMQ
**Responsibilities**:
- Push notifications (mobile)
- Email notifications
- SMS notifications (optional)
- In-app notifications
- Notification preferences
- Delivery tracking

**API Endpoints**:
```
POST   /notifications/send
GET    /notifications/:userId
PUT    /notifications/:id/read
GET    /notifications/preferences/:userId
PUT    /notifications/preferences/:userId
```

---

## Data Architecture

### Polyglot Persistence Strategy

We use different databases optimized for specific use cases:

#### PostgreSQL (Primary Relational DB)
**Use Cases**:
- User accounts and profiles
- Quest metadata
- Subscriptions and payments
- Achievements and badges
- Relational data with ACID requirements

**Schema Design**:
- Normalized schema for data integrity
- Foreign key constraints
- Indexes on frequently queried columns
- Partitioning for large tables (activity logs)

#### MongoDB (Document Store)
**Use Cases**:
- Quest content (flexible schema)
- Geospatial data (GeoJSON)
- Activity feed
- Analytics events
- Flexible/evolving schemas

**Schema Design**:
- Embedded documents for related data
- GeoJSON for location data
- Denormalization for read performance
- TTL indexes for temporary data

#### Redis (In-Memory Cache)
**Use Cases**:
- Session storage
- JWT token blacklist
- Leaderboard caching
- Rate limiting counters
- Real-time data
- Cache layer for PostgreSQL/MongoDB

**Data Structures**:
- Strings: Simple key-value
- Hashes: User sessions
- Sorted Sets: Leaderboards
- Lists: Message queues
- Sets: Online users

#### Elasticsearch (Search Engine)
**Use Cases**:
- Quest search
- User search
- Content search
- Analytics queries
- Full-text search

**Index Design**:
- Quests index
- Users index
- Content index
- Auto-complete suggestions

### Data Flow Patterns

#### 1. Command Query Responsibility Segregation (CQRS)
- **Commands**: Write operations to PostgreSQL/MongoDB
- **Queries**: Read from Redis cache or Elasticsearch
- **Synchronization**: Event-driven updates via message queue

#### 2. Event Sourcing (Selected Services)
- Quest participation events
- User activity events
- Analytics events
- Audit logs

#### 3. Database per Service
- Each microservice owns its database
- No direct database access between services
- Communication via APIs or events

---

## Security Architecture

### Authentication & Authorization

#### Multi-Factor Authentication Flow
```
1. User submits credentials (email + password)
2. Auth Service validates credentials
3. If valid, generate JWT access token (15 min expiry)
4. Generate refresh token (30 days expiry)
5. Return tokens to client
6. Client includes access token in Authorization header
7. API Gateway validates token before routing
8. If expired, client uses refresh token to get new access token
```

#### OAuth 2.0 Integration
- Google Sign-In
- Facebook Login
- Apple Sign-In

#### Role-Based Access Control (RBAC)
**Roles**:
- `user` - Regular user
- `creator` - Content creator
- `moderator` - Content moderator
- `admin` - Platform administrator
- `super_admin` - System administrator

**Permissions**:
- `quest:create`, `quest:edit`, `quest:delete`
- `user:read`, `user:edit`, `user:delete`
- `content:moderate`, `content:delete`
- `system:configure`, `system:monitor`

### Data Security

#### Encryption at Rest
- AES-256 encryption for sensitive data
- Database encryption (PostgreSQL TDE)
- Encrypted backups

#### Encryption in Transit
- TLS 1.3 for all API communications
- HTTPS enforced for all endpoints
- WSS (WebSocket Secure) for real-time

#### Secrets Management
- Environment variables for configuration
- AWS Secrets Manager / HashiCorp Vault for production
- Rotation policies for credentials

### Application Security

#### Input Validation
- Schema validation (Joi, Yup)
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF tokens for state-changing operations

#### Rate Limiting
- Per IP: 100 requests/minute
- Per user: 1000 requests/hour
- Per endpoint: Custom limits
- DDoS protection via CloudFlare

#### Security Headers
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## Deployment Architecture

### Cloud Infrastructure (AWS Example)

```
┌─────────────────────────────────────────────────────────────┐
│                       CloudFront (CDN)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application Load Balancer                    │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐   ┌──────────────────────┐
│   EKS Cluster (AZ-A) │   │   EKS Cluster (AZ-B) │
│   ┌──────────────┐   │   │   ┌──────────────┐   │
│   │  API Gateway │   │   │   │  API Gateway │   │
│   └──────────────┘   │   │   └──────────────┘   │
│   ┌──────────────┐   │   │   ┌──────────────┐   │
│   │  Services    │   │   │   │  Services    │   │
│   │  (Pods)      │   │   │   │  (Pods)      │   │
│   └──────────────┘   │   │   └──────────────┘   │
└──────────────────────┘   └──────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  RDS (PostgreSQL)  │  DocumentDB  │  ElastiCache  │  MQ     │
└─────────────────────────────────────────────────────────────┘
```

### Kubernetes Deployment

#### Cluster Configuration
- **Node Groups**: 3+ worker nodes per AZ
- **Auto-scaling**: Based on CPU/memory metrics
- **Namespaces**: `production`, `staging`, `development`
- **Resource Limits**: CPU and memory requests/limits per pod

#### Service Deployment Strategy
- **Rolling Updates**: Zero-downtime deployments
- **Health Checks**: Liveness and readiness probes
- **Horizontal Pod Autoscaler**: Scale based on load
- **Service Mesh**: Istio for advanced traffic management

---

## Integration Architecture

### External Service Integrations

#### Payment Processing (Stripe)
```
Client → Platform → Stripe API
         ↓
    Webhook ← Stripe
```

#### Maps (OpenStreetMap + Mapbox)
- OSM for tile data (free)
- Mapbox for custom styling and geocoding
- PostGIS for spatial queries

#### AI Services (Anthropic Claude)
- Quest generation
- Content moderation
- Recommendation engine

#### Streaming Platforms
- YouTube API (multi-streaming)
- Twitch API (multi-streaming)
- Facebook Live API

---

## Performance & Scalability

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (P95) | < 200ms | 95th percentile |
| API Response Time (P99) | < 500ms | 99th percentile |
| Database Query Time | < 50ms | Average |
| Page Load Time | < 2s | First Contentful Paint |
| Uptime | > 99.9% | Monthly |
| Error Rate | < 0.1% | Per 1000 requests |

### Scalability Strategies

#### Horizontal Scaling
- **Services**: Add more pod replicas
- **Databases**: Read replicas for PostgreSQL
- **Cache**: Redis cluster with sharding

#### Vertical Scaling
- Increase pod resource limits when needed
- Upgrade database instance types

#### Caching Strategy
1. **L1 Cache**: In-memory application cache
2. **L2 Cache**: Redis distributed cache
3. **L3 Cache**: CDN for static assets
4. **Database Query Cache**: PostgreSQL shared buffers

#### Database Optimization
- Indexes on frequently queried columns
- Query optimization and profiling
- Connection pooling (PgBouncer)
- Partitioning for large tables
- Materialized views for complex queries

---

## Monitoring & Observability

### Metrics Collection
- **Prometheus**: Metrics scraping
- **Grafana**: Visualization dashboards
- **Alert Manager**: Alert routing

### Distributed Tracing
- **Jaeger**: Request tracing across services
- **OpenTelemetry**: Instrumentation

### Logging
- **ELK Stack**: Centralized logging
  - Elasticsearch: Log storage
  - Logstash: Log processing
  - Kibana: Log visualization
- **Structured Logging**: JSON format

### Key Metrics
- Request rate (requests/second)
- Error rate (errors/total requests)
- Response time (P50, P95, P99)
- Database connection pool usage
- Memory and CPU usage
- Disk I/O
- Network throughput

---

## Disaster Recovery & Business Continuity

### Backup Strategy
- **Database Backups**: Daily automated backups (30-day retention)
- **Point-in-Time Recovery**: PostgreSQL WAL archiving
- **Cross-Region Replication**: For critical data

### Recovery Objectives
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour

### High Availability
- Multi-AZ deployment
- Auto-scaling groups
- Health checks and auto-recovery
- Database failover (< 60 seconds)

---

## Next Steps

### Phase 2: Implementation
1. Setup Kubernetes clusters
2. Implement API Gateway
3. Develop core services (Auth, User)
4. Setup CI/CD pipelines
5. Implement monitoring stack

### Future Enhancements
- Service mesh (Istio) for advanced traffic management
- GraphQL Federation for unified API
- Edge computing for AR features
- Multi-region deployment for global scale

---

**Document Version**: 1.0
**Last Updated**: October 23, 2025
**Status**: Phase 1 - Foundation
**Next Review**: Phase 2 Kickoff
