# ADR 002: Polyglot Persistence Strategy

**Date**: 2025-10-23
**Status**: Accepted
**Deciders**: Tech Lead, Database Architect
**Context Owner**: Data Architecture Team

---

## Context and Problem Statement

The Adventure Management Platform has diverse data storage needs:
- Relational data (users, subscriptions, transactions)
- Geospatial data (locations, routes, POIs)
- Document data (quest content, activity feeds)
- Cache/session data (user sessions, rate limiting)
- Search data (full-text search across content)

Should we use a single database technology or multiple specialized databases (polyglot persistence)?

---

## Decision Drivers

- **Data Model Fit**: Different data types benefit from different storage models
- **Performance**: Query performance for specific use cases
- **Scalability**: Different scaling needs for different data types
- **Developer Productivity**: Using right tool for the job
- **Operational Complexity**: Managing multiple database systems
- **Cost**: Licensing and operational costs

---

## Considered Options

### Option 1: Single Database (PostgreSQL Only)
Use PostgreSQL for all data storage needs.

**Pros:**
- Simplest operational model
- Single backup/recovery strategy
- Developers only need to learn one database
- ACID transactions across all data
- PostgreSQL has extensions (PostGIS, full-text search)
- Lower operational cost

**Cons:**
- Not optimal for all use cases
- Geospatial queries less efficient than MongoDB
- Cache operations slower than Redis
- Full-text search less powerful than Elasticsearch
- Document storage less flexible than MongoDB
- Session storage inefficient

### Option 2: Polyglot Persistence (Multiple Databases)
Use specialized databases for different needs:
- PostgreSQL (relational data)
- MongoDB (documents, geospatial)
- Redis (cache, sessions)
- Elasticsearch (search)

**Pros:**
- Optimal performance for each use case
- Better scalability for specific data types
- Flexibility to choose best tool
- Industry best practices
- Redis extremely fast for caching
- MongoDB excellent for geospatial
- Elasticsearch powerful for search

**Cons:**
- Higher operational complexity
- Multiple backup strategies
- Developers need multiple database skills
- No transactions across databases
- Higher infrastructure cost
- More complex data consistency

### Option 3: PostgreSQL + Redis Only
Use PostgreSQL for primary data and Redis for caching.

**Pros:**
- Simpler than full polyglot
- Good caching performance
- Two well-known technologies
- Reduced operational complexity

**Cons:**
- Geospatial still suboptimal
- Full-text search not ideal
- Document storage not optimal
- Still have multi-database complexity

---

## Decision Outcome

**Chosen option**: **Option 2 - Polyglot Persistence**

### Rationale

#### PostgreSQL (Primary Database)
**Use Cases:**
- User accounts and authentication
- Subscriptions and payments
- Quest metadata
- Achievements and badges
- Creator revenue tracking

**Why PostgreSQL:**
- ACID compliance for financial data
- Excellent performance for relational queries
- Strong consistency guarantees
- Mature ecosystem and tooling
- Battle-tested at scale

#### MongoDB (Document & Geospatial Store)
**Use Cases:**
- Quest content (flexible schema)
- Geospatial data (GeoJSON)
- Activity feeds
- Analytics events
- Flexible/evolving schemas

**Why MongoDB:**
- Native GeoJSON support
- Flexible schema for quest content
- Excellent geospatial indexing
- Horizontal scaling built-in
- Good fit for document-oriented data

#### Redis (In-Memory Cache)
**Use Cases:**
- Session storage
- JWT token blacklist
- Leaderboard caching
- Rate limiting counters
- Real-time data
- Pub/Sub for WebSocket

**Why Redis:**
- Microsecond latency
- Perfect for session storage
- Sorted sets for leaderboards
- Atomic operations
- Pub/Sub for real-time
- Minimal memory footprint

#### Elasticsearch (Search Engine)
**Use Cases:**
- Quest search
- User search
- Content search
- Analytics queries
- Auto-complete
- Faceted search

**Why Elasticsearch:**
- Powerful full-text search
- Near real-time indexing
- Scalable search architecture
- Aggregations for analytics
- Industry standard for search

---

## Data Distribution Strategy

### Service to Database Mapping

```
Auth Service:
├── PostgreSQL: user credentials, roles
└── Redis: sessions, tokens

User Service:
├── PostgreSQL: user profiles, preferences
└── Elasticsearch: user search

Quest Service:
├── PostgreSQL: quest metadata, ownership
├── MongoDB: quest content, geospatial
└── Elasticsearch: quest search

Geospatial Service:
├── MongoDB: locations, routes, POIs
└── PostgreSQL: POI metadata

Gamification Service:
├── PostgreSQL: achievements, badges, XP
└── Redis: leaderboard cache

Social Service:
├── PostgreSQL: relationships, teams
└── Redis: online status, chat

Creator Service:
├── PostgreSQL: subscriptions, revenue
└── Redis: analytics cache

Streaming Service:
├── PostgreSQL: stream metadata
└── MongoDB: stream events, chat logs

Notification Service:
├── PostgreSQL: notification preferences
└── Redis: delivery queue
```

---

## Implementation Guidelines

### When to Use PostgreSQL
✅ Transactional data (payments, subscriptions)
✅ Strong consistency required
✅ Complex relationships
✅ Financial records
✅ User credentials

### When to Use MongoDB
✅ Flexible/evolving schemas
✅ Geospatial queries
✅ Document-oriented data
✅ Activity logs
✅ Analytics events

### When to Use Redis
✅ Caching
✅ Session storage
✅ Rate limiting
✅ Real-time leaderboards
✅ Pub/Sub messaging
✅ Temporary data (<24 hours)

### When to Use Elasticsearch
✅ Full-text search
✅ Faceted search
✅ Auto-complete
✅ Analytics aggregations
✅ Log analysis

---

## Consequences

### Positive Consequences

✅ **Performance**: 10x faster cache access with Redis vs PostgreSQL
✅ **Scalability**: Geospatial queries scale better with MongoDB
✅ **Search Quality**: Full-text search significantly better with Elasticsearch
✅ **Developer Experience**: Right tool for each job increases productivity
✅ **Cost Efficiency**: Specialized databases more cost-effective at scale

### Negative Consequences

❌ **Operational Complexity**: Need to manage 4 database systems
❌ **Backup Strategy**: Need separate backup procedures for each
❌ **Monitoring**: More systems to monitor and alert on
❌ **Skills Required**: Team needs broader database knowledge
❌ **Data Consistency**: No ACID across databases
❌ **Infrastructure Cost**: More resources needed

### Mitigation Strategies

**Operational Complexity**:
- Use managed services (RDS, DocumentDB, ElastiCache, Amazon ES)
- Implement Infrastructure as Code (Terraform)
- Automate all operational tasks

**Backup Strategy**:
- Automated daily backups for all databases
- Point-in-time recovery where available
- Cross-region replication for critical data
- Documented recovery procedures

**Monitoring**:
- Centralized monitoring (Prometheus + Grafana)
- Unified alerting (PagerDuty)
- Database-specific dashboards
- Automated health checks

**Skills Required**:
- Comprehensive training program
- Database-specific documentation
- Pair programming for knowledge sharing
- On-call rotation includes database training

**Data Consistency**:
- Event-driven synchronization
- Eventual consistency acceptable for most data
- Strong consistency where required (PostgreSQL)
- Idempotent operations

---

## Performance Benchmarks

### Expected Performance Improvements

| Operation | PostgreSQL Only | With Polyglot | Improvement |
|-----------|----------------|---------------|-------------|
| Cache read | 10-20ms | <1ms (Redis) | 20x faster |
| Geospatial query | 100-500ms | 10-50ms (MongoDB) | 10x faster |
| Full-text search | 500-2000ms | 50-200ms (ES) | 10x faster |
| Session lookup | 5-10ms | <1ms (Redis) | 10x faster |
| Leaderboard query | 100-200ms | 1-5ms (Redis) | 50x faster |

---

## Validation

### Success Metrics

- [ ] API response time <200ms (P95)
- [ ] Cache hit rate >90%
- [ ] Geospatial queries <50ms (P95)
- [ ] Search queries <200ms (P95)
- [ ] Database CPU utilization <70%

### Review Timeline

- **1 month**: Review performance metrics
- **3 months**: Review operational complexity
- **6 months**: Review cost vs benefit
- **12 months**: Full strategy review

---

## Migration Path

If polyglot proves too complex:
1. Evaluate actual operational burden
2. Consider consolidation to PostgreSQL + Redis
3. Use PostgreSQL extensions (PostGIS, pg_trgm)
4. Accept performance trade-offs

However, we expect polyglot to be net positive.

---

## Related Decisions

- [ADR-001: Microservices Architecture](001-microservices-architecture.md)
- [ADR-005: Event-Driven Data Synchronization](005-event-driven-sync.md)

---

## References

- [Polyglot Persistence by Martin Fowler](https://martinfowler.com/bliki/PolyglotPersistence.html)
- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [Redis in Action](https://redislabs.com/redis-in-action/)
- [Elasticsearch: The Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html)

---

**Status**: ✅ Accepted and implemented in Phase 1
