# Contributing to Adventure Management Platform

Thank you for your interest in contributing to the Adventure Management Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Sprint Workflow](#sprint-workflow)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:
- Be respectful and professional
- Welcome diverse perspectives
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

### Prerequisites
- Node.js 18+ or Python 3.11+
- Docker & Docker Compose
- Git
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/altunelyusuf/Adventure-Management-Platform.git
   cd Adventure-Management-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start development services**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Verify setup**
   ```bash
   npm run test
   ```

---

## Development Workflow

### Agile/Scrum Process

We follow a 2-week sprint cycle:

**Sprint Ceremonies:**
- **Sprint Planning** (Monday, Week 1): 4 hours
  - Review product backlog
  - Select user stories for sprint
  - Break down stories into tasks
  - Estimate story points

- **Daily Standup** (Every day, 9:00 AM): 15 minutes
  - What did I do yesterday?
  - What will I do today?
  - Any blockers?

- **Sprint Review** (Friday, Week 2, Morning): 2 hours
  - Demo completed work
  - Gather stakeholder feedback
  - Update product backlog

- **Sprint Retrospective** (Friday, Week 2, Afternoon): 1.5 hours
  - What went well?
  - What didn't go well?
  - Action items for improvement

- **Backlog Refinement** (Mid-sprint): 2 hours
  - Refine upcoming stories
  - Estimate effort
  - Clarify requirements

### Branching Strategy

We use Git Flow with the following branches:

- `main` - Production-ready code (protected)
- `develop` - Integration branch (protected)
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes
- `release/*` - Release preparation

**Branch Naming Convention:**
```
feature/TICKET-123-short-description
bugfix/TICKET-456-fix-description
hotfix/TICKET-789-critical-fix
```

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/AMP-123-add-quest-creation

# Work on your feature...
git add .
git commit -m "feat(quest): add quest creation endpoint"

# Push to remote
git push -u origin feature/AMP-123-add-quest-creation

# Create Pull Request on GitHub
```

---

## Coding Standards

### TypeScript/JavaScript

**Style Guide**: We use ESLint + Prettier

```typescript
// Good
export class QuestService {
  private readonly repository: QuestRepository;

  constructor(repository: QuestRepository) {
    this.repository = repository;
  }

  async createQuest(data: CreateQuestDto): Promise<Quest> {
    this.validateQuestData(data);
    return await this.repository.create(data);
  }

  private validateQuestData(data: CreateQuestDto): void {
    if (!data.title || data.title.length < 3) {
      throw new ValidationError('Quest title must be at least 3 characters');
    }
  }
}
```

**Key Principles:**
- Use TypeScript strict mode
- Prefer `const` over `let`, never use `var`
- Use async/await instead of callbacks
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid deep nesting (max 3 levels)
- Use early returns to reduce nesting

### Python

**Style Guide**: PEP 8 + Black formatter

```python
# Good
class QuestService:
    def __init__(self, repository: QuestRepository):
        self._repository = repository

    async def create_quest(self, data: CreateQuestDto) -> Quest:
        """Create a new quest."""
        self._validate_quest_data(data)
        return await self._repository.create(data)

    def _validate_quest_data(self, data: CreateQuestDto) -> None:
        """Validate quest data before creation."""
        if not data.title or len(data.title) < 3:
            raise ValidationError("Quest title must be at least 3 characters")
```

**Key Principles:**
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for all public functions
- Use descriptive variable names
- Keep functions under 50 lines
- Use list comprehensions for simple iterations

### Naming Conventions

**Files:**
- TypeScript: `kebab-case.ts` (e.g., `quest-service.ts`)
- Python: `snake_case.py` (e.g., `quest_service.py`)

**Classes:**
- PascalCase (e.g., `QuestService`, `UserController`)

**Functions/Methods:**
- TypeScript: camelCase (e.g., `createQuest`)
- Python: snake_case (e.g., `create_quest`)

**Constants:**
- UPPER_SNAKE_CASE (e.g., `MAX_QUEST_DURATION`)

**Interfaces/Types:**
- PascalCase with descriptive names (e.g., `CreateQuestDto`, `QuestResponse`)

---

## Testing Guidelines

### Test Coverage Requirements

- **Minimum Coverage**: 80%
- **Critical Paths**: 100% coverage
- **New Features**: Must include tests

### Test Types

#### 1. Unit Tests

Test individual functions/methods in isolation.

```typescript
// quest.service.test.ts
describe('QuestService', () => {
  let service: QuestService;
  let mockRepository: jest.Mocked<QuestRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    service = new QuestService(mockRepository);
  });

  describe('createQuest', () => {
    it('should create a quest with valid data', async () => {
      const questData = { title: 'Test Quest', description: 'Test' };
      const expectedQuest = { id: '1', ...questData };

      mockRepository.create.mockResolvedValue(expectedQuest);

      const result = await service.createQuest(questData);

      expect(result).toEqual(expectedQuest);
      expect(mockRepository.create).toHaveBeenCalledWith(questData);
    });

    it('should throw error for invalid title', async () => {
      const questData = { title: 'ab', description: 'Test' };

      await expect(service.createQuest(questData)).rejects.toThrow(
        'Quest title must be at least 3 characters'
      );
    });
  });
});
```

#### 2. Integration Tests

Test multiple components working together.

```typescript
// quest.controller.integration.test.ts
describe('Quest API Integration', () => {
  let app: Application;
  let database: Database;

  beforeAll(async () => {
    database = await setupTestDatabase();
    app = await createApp(database);
  });

  afterAll(async () => {
    await database.close();
  });

  describe('POST /quests', () => {
    it('should create a quest and return 201', async () => {
      const response = await request(app)
        .post('/quests')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Integration Test Quest',
          description: 'Test description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Integration Test Quest');
    });
  });
});
```

#### 3. End-to-End (E2E) Tests

Test complete user workflows.

```typescript
// quest-creation.e2e.test.ts
describe('Quest Creation Flow', () => {
  it('should allow creator to create and publish quest', async () => {
    // 1. Login as creator
    await page.goto('http://localhost:3000/login');
    await page.fill('[name=email]', 'creator@test.com');
    await page.fill('[name=password]', 'password');
    await page.click('button[type=submit]');

    // 2. Navigate to quest creation
    await page.click('text=Create Quest');

    // 3. Fill quest details
    await page.fill('[name=title]', 'E2E Test Quest');
    await page.fill('[name=description]', 'Test description');

    // 4. Add checkpoint
    await page.click('text=Add Checkpoint');
    await page.fill('[name=checkpoint-title]', 'First Checkpoint');

    // 5. Publish quest
    await page.click('text=Publish');

    // 6. Verify quest is published
    await expect(page.locator('text=Quest Published')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test quest.service.test.ts

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (build, CI, etc.)
- `revert`: Revert a previous commit

### Examples

```bash
# Feature
git commit -m "feat(quest): add AI quest generation endpoint"

# Bug fix
git commit -m "fix(auth): resolve JWT token expiration issue"

# Documentation
git commit -m "docs(api): update quest API documentation"

# Refactoring
git commit -m "refactor(user): extract validation logic to separate class"

# Breaking change
git commit -m "feat(api)!: change quest response structure

BREAKING CHANGE: Quest API now returns nested checkpoint objects instead of IDs"
```

---

## Pull Request Process

### Before Creating a PR

1. ✅ All tests pass locally
2. ✅ Code coverage meets 80% minimum
3. ✅ ESLint/Prettier checks pass
4. ✅ Documentation updated (if needed)
5. ✅ Changelog updated (for significant changes)
6. ✅ Branch is up-to-date with develop

### PR Template

When creating a PR, use this template:

```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
- [ ] Coverage meets 80% minimum

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional context or notes for reviewers
```

### Code Review Process

**For Authors:**
1. Create PR against `develop` branch
2. Assign at least 2 reviewers
3. Respond to feedback promptly
4. Make requested changes
5. Request re-review after changes

**For Reviewers:**
1. Review within 24 hours
2. Check code quality and style
3. Verify tests are adequate
4. Test functionality locally (if needed)
5. Approve or request changes
6. Be constructive and respectful

**Approval Requirements:**
- Minimum 2 approvals required
- All CI checks must pass
- No unresolved conversations
- Branch up-to-date with base

---

## Sprint Workflow

### Story Point Estimation

We use Planning Poker with Fibonacci sequence:

- **1 point**: < 2 hours (trivial task)
- **2 points**: 2-4 hours (simple implementation)
- **3 points**: 4-8 hours (moderate complexity)
- **5 points**: 1-2 days (complex feature)
- **8 points**: 3-5 days (very complex)
- **13 points**: 1 week+ (too large, needs breakdown)

### Definition of Ready (DoR)

A user story is ready when:
- Written in user story format
- Acceptance criteria defined
- Estimated by the team
- Dependencies identified
- Testable
- Small enough for one sprint

### Definition of Done (DoD)

A user story is done when:
- ✅ Code implemented
- ✅ Unit tests written (80%+ coverage)
- ✅ Integration tests passing
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Security scan passed
- ✅ Deployed to staging
- ✅ Product Owner acceptance

---

## Questions or Issues?

- **Technical Questions**: Ask in #dev-help Slack channel
- **Process Questions**: Ask Scrum Master
- **Feature Requests**: Create issue with 'enhancement' label
- **Bug Reports**: Create issue with 'bug' label

---

**Thank you for contributing to Adventure Management Platform!**
