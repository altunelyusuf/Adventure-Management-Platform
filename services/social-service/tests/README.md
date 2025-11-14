# Social Service Test Suite

Comprehensive test suite for the Adventure Platform Social Service, covering friend management, activity feeds, and social interactions.

## Test Structure

```
tests/
├── setup.ts                      # Jest configuration and environment setup
├── fixtures/                     # Test data and mock objects
│   └── mockData.ts              # Mock users, activities, friendships, etc.
├── unit/                        # Unit tests for individual services
│   ├── friend.service.test.ts   # Friend management tests
│   ├── feed.service.test.ts     # Feed generation tests
│   └── interaction.service.test.ts # Likes and comments tests
└── integration/                 # Integration tests for API endpoints
    └── api.test.ts             # Full API endpoint testing
```

## Test Coverage

### Unit Tests

#### Friend Service (friend.service.test.ts)
- ✅ Send friend requests
- ✅ Accept/reject friend requests
- ✅ Remove friendships
- ✅ Block/unblock users
- ✅ Check friendship status
- ✅ Get mutual friends
- ✅ Friend suggestions
- ✅ Friend count tracking
- ✅ Error handling (duplicate requests, already friends, blocked users, max friends limit)

**Test Cases**: 12 test suites, 25+ individual tests

#### Feed Service (feed.service.test.ts)
- ✅ Personal activity feed
- ✅ Friends activity feed
- ✅ Combined feed (personal + friends)
- ✅ Global public feed
- ✅ Trending activities
- ✅ Filtered feeds (by type, user, date range)
- ✅ Visibility controls (PUBLIC, FRIENDS, PRIVATE)
- ✅ Pagination support
- ✅ Empty state handling

**Test Cases**: 7 test suites, 15+ individual tests

#### Interaction Service (interaction.service.test.ts)
- ✅ Like/unlike activities
- ✅ Like status checking
- ✅ Create comments
- ✅ Update/delete comments
- ✅ Nested comments (up to 3 levels)
- ✅ Comment depth validation
- ✅ Comment length validation
- ✅ Authorization checks
- ✅ Get activity likes and comments
- ✅ Get comment replies

**Test Cases**: 11 test suites, 22+ individual tests

### Integration Tests

#### API Endpoints (api.test.ts)
- ✅ Health check endpoint
- ✅ Friend management endpoints (13 endpoints)
  - POST /friends/request
  - PUT /friends/request/:id/accept
  - PUT /friends/request/:id/reject
  - DELETE /friends/request/:id
  - DELETE /friends/:friendId
  - GET /friends/:userId
  - POST /friends/block/:userId
  - DELETE /friends/block/:userId
  - And more...
- ✅ Feed endpoints (5 endpoints)
  - GET /feed/personal
  - GET /feed/friends
  - GET /feed/combined
  - GET /feed/global
  - GET /feed/trending
- ✅ Interaction endpoints (7 endpoints)
  - POST /interactions/activity/:id/like
  - DELETE /interactions/activity/:id/like
  - POST /interactions/activity/:id/comment
  - PUT /interactions/comment/:id
  - DELETE /interactions/comment/:id
  - GET /interactions/activity/:id/comments
  - GET /interactions/activity/:id/likes
- ✅ Error handling (404, 400, 500 responses)
- ✅ Authentication middleware
- ✅ Request validation

**Test Cases**: 8 test suites, 20+ individual tests

## Running Tests

### Install Dependencies
```bash
cd services/social-service
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- friend.service.test
npm test -- feed.service.test
npm test -- interaction.service.test
npm test -- api.test
```

## Test Configuration

### Jest Config (jest.config.js)
- **Preset**: ts-jest
- **Environment**: Node.js
- **Coverage**: src/**/*.ts (excluding index.ts)
- **Timeout**: 10 seconds per test
- **Setup**: tests/setup.ts runs before each suite

### Environment Variables (tests/setup.ts)
- NODE_ENV=test
- Mock database and Redis connections
- Mock auth service URL
- Test-specific configuration values

## Mock Data

### Mock Users (mockData.ts)
- user1, user2, user3, user4
- Each with userId, email, username

### Mock Entities
- Friendship (bidirectional relationship)
- FriendRequest (with status: PENDING, ACCEPTED, REJECTED, CANCELLED)
- Block (user blocking)
- Activity (13 types, 3 visibility levels)
- ActivityLike
- ActivityComment (with nested support)
- Follow

## Test Patterns

### Service Mocking
```typescript
const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
} as any;
```

### Request Testing
```typescript
const response = await request(app)
  .post('/api/social/friends/request')
  .send({ receiverId: 'user-id' });

expect(response.status).toBe(201);
expect(response.body).toHaveProperty('requestId');
```

### Error Validation
```typescript
await expect(service.method(invalidData))
  .rejects.toThrow('Expected error message');
```

## Coverage Goals

- **Lines**: > 80%
- **Functions**: > 80%
- **Branches**: > 75%
- **Statements**: > 80%

## Continuous Integration

Tests run automatically on:
- Every commit
- Pull requests
- Pre-deployment checks

## Test Best Practices

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are mocked
3. **Clarity**: Descriptive test names
4. **Coverage**: Critical paths are tested
5. **Performance**: Tests complete in < 10 seconds
6. **Maintainability**: DRY principle with fixtures

## Known Limitations

- Database integration tests require separate setup
- Real Redis/PostgreSQL not used in unit tests
- Email notifications not tested
- WebSocket events not covered
- Rate limiting not fully tested

## Future Enhancements

- [ ] Add E2E tests with real database
- [ ] Performance testing for feed generation
- [ ] Load testing for concurrent requests
- [ ] Security testing for authorization
- [ ] Add visual regression tests
- [ ] Implement mutation testing

## Troubleshooting

### Tests Failing
1. Check Node.js version (>= 18.0.0)
2. Clear node_modules and reinstall
3. Verify TypeScript compilation: `npm run build`
4. Check for conflicting ports

### Coverage Issues
1. Ensure all services are imported
2. Check jest.config.js coverage patterns
3. Run: `npm run test:coverage -- --verbose`

### Mock Issues
1. Verify mock data in fixtures/mockData.ts
2. Check service constructor injection
3. Use jest.clearAllMocks() in beforeEach

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Maintain > 80% coverage
3. Update this README
4. Add mock data to fixtures if needed
5. Follow existing test patterns

## Support

For questions or issues:
- Check existing test examples
- Review Jest documentation
- Consult team leads
- Create GitHub issue
