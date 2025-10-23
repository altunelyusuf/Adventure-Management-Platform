# Developer Onboarding Guide
## Adventure Management Platform

Welcome to the Adventure Management Platform team! This guide will help you get up to speed quickly.

---

## Table of Contents
1. [Welcome](#welcome)
2. [Project Overview](#project-overview)
3. [Development Setup](#development-setup)
4. [Architecture Overview](#architecture-overview)
5. [Your First Task](#your-first-task)
6. [Resources](#resources)
7. [Team Contacts](#team-contacts)

---

## Welcome

### What We're Building

The Adventure Management Platform is a revolutionary location-based adventure system that combines:
- **Quest Management** - Create and participate in real-world adventures
- **Gamification** - Earn XP, badges, and climb leaderboards
- **Social Features** - Connect with friends, form teams, share experiences
- **Creator Economy** - Monetize content through subscriptions
- **Live Streaming** - Stream adventures in real-time
- **AR Experiences** - Enhanced reality checkpoints and interactions

### Business Model

- **Revenue**: Subscription-based (70% creator / 30% platform)
- **Target**: $817K ARR Year 1, $8.17M ARR Year 2
- **Market**: Convergence of gamification ($58.8B), streaming ($184.3B), and creator economy ($104.2B)

---

## Project Overview

### Technology Stack

**Backend:**
- Language: Node.js (TypeScript) / Python (FastAPI)
- Database: PostgreSQL (primary), MongoDB (spatial), Redis (cache)
- Message Queue: RabbitMQ
- Search: Elasticsearch

**Frontend:**
- Web: React 18 + TypeScript
- Mobile: React Native
- State: Redux Toolkit
- UI: Tailwind CSS

**Infrastructure:**
- Cloud: AWS / GCP
- Containers: Docker + Kubernetes
- CI/CD: GitHub Actions
- Monitoring: Prometheus + Grafana

### Project Structure

```
adventure-platform/
├── docs/               # Documentation
├── services/          # Microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── quest-service/
│   └── ...
├── apps/              # Client apps
│   ├── web/
│   ├── mobile/
│   └── admin/
├── packages/          # Shared code
└── infrastructure/    # IaC, K8s configs
```

### Development Methodology

We follow **Agile/Scrum** with 2-week sprints:
- **Sprint Planning**: Monday (Week 1)
- **Daily Standup**: Every day at 9:00 AM (15 min)
- **Sprint Review**: Friday (Week 2) morning
- **Retrospective**: Friday (Week 2) afternoon
- **Backlog Refinement**: Mid-sprint

---

## Development Setup

### Prerequisites Checklist

Before you begin, ensure you have:
- [ ] **Git** (v2.30+)
- [ ] **Node.js** (v18+)
- [ ] **npm** (v9+)
- [ ] **Docker** (v20+)
- [ ] **Docker Compose** (v2+)
- [ ] **Code Editor** (VS Code recommended)
- [ ] **Terminal** (iTerm2, Windows Terminal, or similar)

### Step 1: Access and Accounts

1. **GitHub Access**
   ```bash
   # Verify you have repository access
   git clone https://github.com/altunelyusuf/Adventure-Management-Platform.git
   ```

2. **Required Accounts**
   - GitHub (for code access)
   - Slack (for team communication)
   - Jira/Linear (for task management)
   - AWS Console (for infrastructure - provided by DevOps)

3. **Join Communication Channels**
   - Slack: #dev-general, #dev-help, #standup
   - Team calendar invites for ceremonies

### Step 2: Clone and Setup

```bash
# Clone repository
git clone https://github.com/altunelyusuf/Adventure-Management-Platform.git
cd Adventure-Management-Platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your local configuration
# (Ask team for any required API keys)
```

### Step 3: Start Development Services

```bash
# Start all infrastructure services (PostgreSQL, Redis, MongoDB, etc.)
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### Step 4: Run Database Migrations

```bash
# Run migrations (once services are up)
npm run migrate

# Verify database setup
# PostgreSQL should be accessible at localhost:5432
```

### Step 5: Start Development Server

```bash
# Start all services in development mode
npm run dev

# Or start a specific service
cd services/auth-service
npm run dev
```

### Step 6: Verify Setup

```bash
# Run tests to verify everything works
npm test

# Check linting
npm run lint

# Verify type checking
npx tsc --noEmit
```

**Expected Output:**
- All tests passing ✅
- No linting errors ✅
- No type errors ✅

### Step 7: IDE Setup (VS Code)

**Recommended Extensions:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss"
  ]
}
```

**Workspace Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Architecture Overview

### Microservices Architecture

We use a microservices architecture with these core services:

**1. API Gateway**
- Single entry point for all client requests
- Authentication validation
- Rate limiting
- Request routing

**2. Auth Service**
- User authentication (email/password, OAuth)
- JWT token management
- Password reset
- 2FA

**3. User Service**
- User profile management
- User preferences
- Account settings

**4. Quest Service**
- Quest CRUD operations
- Checkpoint management
- Quest participation tracking

**5. Geospatial Service**
- GPS validation
- Route planning
- POI management
- Geofencing

**6. Gamification Service**
- XP and leveling
- Achievements
- Leaderboards
- Rewards

**7. Social Service**
- Friend connections
- Teams and guilds
- Messaging
- Activity feed

**8. Creator Service**
- Creator accounts
- Subscriptions
- Revenue tracking
- Payouts

**9. Streaming Service**
- Live streaming
- Stream management
- Chat integration
- VOD

**10. Notification Service**
- Push notifications
- Email notifications
- In-app notifications

### Data Flow Example: Creating a Quest

```
1. Client sends POST /quests request
2. API Gateway validates JWT token
3. API Gateway routes to Quest Service
4. Quest Service validates quest data
5. Quest Service stores quest in PostgreSQL
6. Quest Service publishes "QuestCreated" event to RabbitMQ
7. Gamification Service consumes event, awards XP
8. Social Service consumes event, posts to feed
9. Notification Service consumes event, notifies followers
10. Quest Service returns quest data to client
```

### Communication Patterns

**Synchronous (REST APIs):**
- Client ↔ API Gateway
- API Gateway ↔ Services
- Inter-service calls (when immediate response needed)

**Asynchronous (Message Queue):**
- Event-driven updates
- Background tasks
- Cross-service notifications

**Real-time (WebSocket):**
- Live updates
- Chat messages
- Stream data
- Notifications

---

## Your First Task

### Week 1: Setup and Familiarization

**Day 1-2: Environment Setup**
- [ ] Complete all setup steps above
- [ ] Run the application locally
- [ ] Explore the codebase structure
- [ ] Read architecture documentation

**Day 3-4: First Contribution**
We have "good first issue" tasks labeled in our issue tracker. Try this starter task:

**Task: Add Health Check Endpoint**

1. **Find the Task**
   - Look for issue: "Add health check endpoint to Auth Service"
   - Or ask your mentor for assignment

2. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/AMP-001-health-check-auth
   ```

3. **Implement Health Check**
   ```typescript
   // services/auth-service/src/controllers/health.controller.ts
   import { Request, Response } from 'express';

   export class HealthController {
     async checkHealth(req: Request, res: Response): Promise<void> {
       res.status(200).json({
         status: 'healthy',
         service: 'auth-service',
         timestamp: new Date().toISOString(),
         uptime: process.uptime(),
       });
     }
   }
   ```

4. **Add Route**
   ```typescript
   // services/auth-service/src/routes/health.routes.ts
   import { Router } from 'express';
   import { HealthController } from '../controllers/health.controller';

   const router = Router();
   const controller = new HealthController();

   router.get('/health', controller.checkHealth.bind(controller));

   export { router as healthRoutes };
   ```

5. **Write Tests**
   ```typescript
   // services/auth-service/src/controllers/health.controller.test.ts
   import request from 'supertest';
   import { app } from '../app';

   describe('Health Check', () => {
     it('should return 200 with healthy status', async () => {
       const response = await request(app).get('/health');

       expect(response.status).toBe(200);
       expect(response.body.status).toBe('healthy');
       expect(response.body.service).toBe('auth-service');
     });
   });
   ```

6. **Run Tests**
   ```bash
   npm test
   ```

7. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat(auth): add health check endpoint"
   git push -u origin feature/AMP-001-health-check-auth
   ```

8. **Create Pull Request**
   - Go to GitHub
   - Create PR from your branch to `develop`
   - Fill out PR template
   - Request review from mentor

**Day 5: Code Review and Learning**
- [ ] Participate in code review process
- [ ] Address feedback
- [ ] Attend Friday sprint review
- [ ] Shadow a senior developer

### Week 2: Real Work Begins

Your mentor will assign you your first real story from the current sprint. This will likely be:
- A small feature implementation
- A bug fix
- Refactoring task
- Test coverage improvement

---

## Resources

### Documentation

**Essential Reading (First Week):**
1. [README.md](../README.md) - Project overview
2. [MASTER_PLAN_AND_DIRECTIVES.md](../MASTER_PLAN_AND_DIRECTIVES.md) - Strategic direction
3. [SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md) - Technical architecture
4. [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines

**Phase Documents:**
- [Phase 1: Foundation](../Phase_1_Foundation_Product_Vision.md)
- [Phase 2: Core Platform](../Phase_2_Core_Platform_Epics_Stories.md)
- [Phase 3: Quest & Geospatial](../Phase_3_Quest_Geospatial_Features.md)
- And more...

**API Documentation:**
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI specs: `/docs/api/`

### Tools and Services

**Development:**
- Code Repository: https://github.com/altunelyusuf/Adventure-Management-Platform
- CI/CD: GitHub Actions
- Issue Tracking: Jira/Linear

**Monitoring (Staging/Production):**
- Logs: ELK Stack
- Metrics: Grafana dashboards
- Errors: Sentry
- APM: New Relic/DataDog

**Communication:**
- Team Chat: Slack
- Video Calls: Zoom/Google Meet
- Documentation: Confluence/Notion

### Learning Resources

**Backend Development:**
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Microservices Patterns: https://microservices.io/patterns/

**Frontend Development:**
- React Docs: https://react.dev/
- TypeScript + React: https://react-typescript-cheatsheet.netlify.app/
- Tailwind CSS: https://tailwindcss.com/docs

**DevOps:**
- Docker Docs: https://docs.docker.com/
- Kubernetes Docs: https://kubernetes.io/docs/
- GitHub Actions: https://docs.github.com/en/actions

---

## Team Contacts

### Core Team

**Product Owner**: [Name]
- Email: po@adventure-platform.com
- Slack: @product-owner
- Responsibilities: Product vision, backlog prioritization

**Scrum Master**: [Name]
- Email: scrum@adventure-platform.com
- Slack: @scrum-master
- Responsibilities: Sprint facilitation, impediment removal

**Tech Lead**: [Name]
- Email: tech-lead@adventure-platform.com
- Slack: @tech-lead
- Responsibilities: Architecture decisions, technical direction

**DevOps Lead**: [Name]
- Email: devops@adventure-platform.com
- Slack: @devops-lead
- Responsibilities: Infrastructure, CI/CD, deployments

### Your Mentor/Buddy

You've been assigned a mentor who will:
- Help with onboarding
- Answer technical questions
- Review your first PRs
- Provide career guidance

**Your Mentor**: [Will be assigned on Day 1]

### Getting Help

**For Technical Questions:**
1. Check documentation first
2. Ask in #dev-help Slack channel
3. Tag your mentor
4. Ask in daily standup

**For Process Questions:**
1. Ask Scrum Master
2. Check CONTRIBUTING.md
3. Ask in #team-general

**For Urgent Issues:**
1. Production issues: Alert on-call engineer (#oncall)
2. Security issues: Contact security team immediately
3. Access issues: Contact IT support

---

## Onboarding Checklist

### Week 1

- [ ] Complete development environment setup
- [ ] Run application locally
- [ ] Read core documentation
- [ ] Attend daily standups
- [ ] Complete first task (health check endpoint)
- [ ] Submit first pull request
- [ ] Attend sprint review and retrospective
- [ ] Meet with mentor

### Week 2

- [ ] Complete first real user story
- [ ] Participate in code reviews
- [ ] Attend sprint planning
- [ ] Present your work in standup
- [ ] Ask questions and seek feedback

### Month 1

- [ ] Complete 3+ user stories
- [ ] Deep dive into one service area
- [ ] Review all phase documents
- [ ] Understand full system architecture
- [ ] Contribute to team discussions
- [ ] Pair program with senior developers

### Month 3

- [ ] Work independently on stories
- [ ] Lead small features end-to-end
- [ ] Mentor new team members
- [ ] Contribute to architecture discussions
- [ ] Improve existing systems

---

## Welcome to the Team!

We're excited to have you on board. Don't hesitate to ask questions—everyone here is committed to helping you succeed.

**Remember:**
- Ask questions early and often
- Don't be afraid to make mistakes
- Collaborate with your team
- Focus on learning and growth
- Enjoy the journey!

**Next Steps:**
1. Complete environment setup
2. Meet your mentor
3. Join Slack channels
4. Start your first task

Good luck, and happy coding! 🚀

---

**Document Version**: 1.0
**Last Updated**: October 23, 2025
**Questions?** Contact your mentor or ask in #dev-help
