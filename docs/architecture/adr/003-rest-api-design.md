# ADR 003: REST API Design Standards

**Date**: 2025-10-23
**Status**: Accepted
**Deciders**: Tech Lead, API Design Team
**Context Owner**: API Architect

---

## Context and Problem Statement

The Adventure Management Platform needs consistent API design across all microservices for:
- Client applications (web, mobile, admin)
- Third-party integrations
- Internal service communication

Should we use REST, GraphQL, gRPC, or a combination?

---

## Decision Drivers

- **Client Compatibility**: Web and mobile app needs
- **Developer Experience**: Ease of use and documentation
- **Performance**: Response times and payload sizes
- **Caching**: HTTP caching capabilities
- **Tooling**: Available tools and ecosystem
- **Familiarity**: Team experience

---

## Considered Options

### Option 1: REST APIs
HTTP-based APIs using REST principles.

**Pros:**
- Industry standard, well-understood
- Excellent tooling (Swagger/OpenAPI)
- HTTP caching built-in
- Easy to test (Postman, curl)
- Stateless and scalable
- Works with all clients

**Cons:**
- Over-fetching or under-fetching data
- Multiple requests for related data
- Versioning challenges
- No built-in subscriptions

### Option 2: GraphQL
Single GraphQL endpoint for all queries.

**Pros:**
- Clients request exactly what they need
- Single request for related data
- Strong typing
- Great developer experience
- Built-in subscriptions

**Cons:**
- Caching more complex
- Performance unpredictable
- Steep learning curve
- Overkill for simple APIs
- Complex queries can be expensive

### Option 3: gRPC
Binary protocol with Protocol Buffers.

**Pros:**
- High performance (binary)
- Strong typing
- Code generation
- Streaming support
- Efficient for service-to-service

**Cons:**
- Not browser-friendly (needs gRPC-web)
- Debugging harder (binary)
- Less tooling than REST
- Steeper learning curve
- Limited HTTP caching

### Option 4: Hybrid Approach
REST for public APIs, gRPC for internal services.

**Pros:**
- Best of both worlds
- Flexibility

**Cons:**
- Two API styles to maintain
- Increased complexity

---

## Decision Outcome

**Chosen option**: **Option 1 - REST APIs** with GraphQL reserved for future consideration.

### Rationale

1. **Team Expertise**: Team has strong REST API experience
2. **Tooling**: Excellent ecosystem (Swagger, Postman)
3. **Client Support**: Works perfectly with React/React Native
4. **Caching**: HTTP caching reduces load
5. **Industry Standard**: Most third-parties expect REST
6. **Time to Market**: Faster development with familiar tech

---

## API Design Standards

### 1. URL Structure

```
https://api.adventure-platform.com/v1/{resource}
```

**Base URL**: `https://api.adventure-platform.com`
**Versioning**: `/v1`, `/v2` in URL path
**Resources**: Plural nouns (`/users`, `/quests`, `/subscriptions`)

### 2. HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resource(s) | ✅ Yes |
| POST | Create resource | ❌ No |
| PUT | Update entire resource | ✅ Yes |
| PATCH | Update partial resource | ❌ No |
| DELETE | Delete resource | ✅ Yes |

### 3. URL Examples

```
# Collections
GET    /v1/quests                    # List quests
POST   /v1/quests                    # Create quest
GET    /v1/quests/search?q=hiking    # Search quests

# Specific Resources
GET    /v1/quests/{id}               # Get quest details
PUT    /v1/quests/{id}               # Update quest
DELETE /v1/quests/{id}               # Delete quest
PATCH  /v1/quests/{id}               # Partial update

# Sub-resources
GET    /v1/quests/{id}/checkpoints   # List checkpoints
POST   /v1/quests/{id}/checkpoints   # Add checkpoint
GET    /v1/quests/{id}/participants  # List participants

# Actions (when necessary)
POST   /v1/quests/{id}/publish       # Publish quest
POST   /v1/quests/{id}/participate   # Join quest
POST   /v1/quests/{id}/complete      # Complete quest
```

### 4. Request/Response Format

**Content-Type**: `application/json`

#### Successful Response
```json
{
  "data": {
    "id": "123",
    "title": "Mountain Trek",
    "difficulty": "MEDIUM"
  },
  "meta": {
    "timestamp": "2025-10-23T10:30:00Z",
    "version": "1.0"
  }
}
```

#### List Response with Pagination
```json
{
  "data": [
    {"id": "123", "title": "Quest 1"},
    {"id": "456", "title": "Quest 2"}
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "links": {
    "self": "/v1/quests?page=1&limit=20",
    "next": "/v1/quests?page=2&limit=20",
    "last": "/v1/quests?page=8&limit=20"
  }
}
```

#### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Quest title is required",
    "details": [
      {
        "field": "title",
        "message": "Title must be at least 3 characters"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-23T10:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

### 5. HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 OK | Successful GET, PUT, PATCH |
| 201 Created | Successful POST (resource created) |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Invalid request (validation error) |
| 401 Unauthorized | Missing or invalid authentication |
| 403 Forbidden | Authenticated but not authorized |
| 404 Not Found | Resource doesn't exist |
| 409 Conflict | Resource conflict (e.g., duplicate) |
| 422 Unprocessable Entity | Semantic errors |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Server error |
| 503 Service Unavailable | Service temporarily unavailable |

### 6. Authentication

**Header**: `Authorization: Bearer {JWT_TOKEN}`

```http
GET /v1/users/me HTTP/1.1
Host: api.adventure-platform.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 7. Pagination

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

```http
GET /v1/quests?page=2&limit=50
```

### 8. Filtering & Sorting

**Filtering**:
```http
GET /v1/quests?difficulty=MEDIUM&status=PUBLISHED
```

**Sorting**:
```http
GET /v1/quests?sort=createdAt&order=desc
```

**Multiple sorts**:
```http
GET /v1/quests?sort=difficulty,createdAt&order=asc,desc
```

### 9. Field Selection (Sparse Fieldsets)

```http
GET /v1/quests?fields=id,title,difficulty
```

### 10. Versioning Strategy

**URL-based versioning**:
- Current: `/v1/quests`
- Future: `/v2/quests`

**Deprecation process**:
1. Announce deprecation 6 months in advance
2. Add `Deprecation` and `Sunset` headers
3. Support old version for 12 months minimum

```http
Deprecation: true
Sunset: Wed, 23 Oct 2026 23:59:59 GMT
```

### 11. Rate Limiting

**Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634989200
```

**Limits**:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Premium: 5000 requests/hour

### 12. CORS Headers

```http
Access-Control-Allow-Origin: https://app.adventure-platform.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

---

## API Documentation

### OpenAPI/Swagger Specification

All APIs must have OpenAPI 3.0 specification:

```yaml
openapi: 3.0.0
info:
  title: Adventure Platform API
  version: 1.0.0
  description: RESTful API for Adventure Management Platform

servers:
  - url: https://api.adventure-platform.com/v1
    description: Production
  - url: https://staging-api.adventure-platform.com/v1
    description: Staging

paths:
  /quests:
    get:
      summary: List quests
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestList'
```

---

## Consequences

### Positive Consequences

✅ **Consistency**: All APIs follow same patterns
✅ **Documentation**: Auto-generated from OpenAPI specs
✅ **Testing**: Easy to test with standard tools
✅ **Caching**: HTTP caching reduces server load
✅ **Familiarity**: Standard REST principles

### Negative Consequences

❌ **Over-fetching**: Clients may receive unnecessary data
❌ **Multiple Requests**: Related data requires multiple calls
❌ **No Subscriptions**: Real-time requires WebSocket separately

### Mitigation Strategies

**Over-fetching**:
- Implement field selection (`?fields=id,title`)
- Use reasonable defaults for responses
- Consider GraphQL for specific use cases later

**Multiple Requests**:
- Use eager loading where appropriate
- Implement batch endpoints for common patterns
- Consider GraphQL for complex data requirements

**Real-time**:
- Use WebSocket for real-time features
- REST for data retrieval, WebSocket for updates
- Server-Sent Events (SSE) for one-way streams

---

## Validation

### Success Metrics

- [ ] All APIs documented in OpenAPI format
- [ ] API response time <200ms (P95)
- [ ] API consistency score >90%
- [ ] Developer satisfaction >4/5
- [ ] Documentation completeness 100%

### Review Timeline

- **3 months**: Review API usage patterns
- **6 months**: Consider GraphQL for specific use cases
- **12 months**: Full API design review

---

## Related Decisions

- [ADR-001: Microservices Architecture](001-microservices-architecture.md)
- [ADR-006: WebSocket for Real-time Features](006-websocket-realtime.md)

---

## References

- [REST API Design Best Practices](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)

---

**Status**: ✅ Accepted and implemented in Phase 1
