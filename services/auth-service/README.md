# Auth Service

Authentication and Authorization microservice for the Adventure Management Platform.

## Features

- ✅ User registration with email verification
- ✅ User login with JWT tokens (access + refresh)
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ Token refresh mechanism
- ✅ Account lockout after failed login attempts
- ✅ Rate limiting on authentication endpoints
- ✅ Password strength validation
- ✅ Comprehensive error handling
- ✅ Structured logging with Winston
- ⏳ OAuth 2.0 support (Google, Facebook, Apple) - Coming in Sprint 2
- ⏳ Multi-Factor Authentication (MFA) - Coming in Sprint 3
- ⏳ Role-Based Access Control (RBAC) - Coming in Sprint 2

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

## Project Structure

```
auth-service/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main config
│   │   ├── database.ts  # TypeORM config
│   │   └── redis.ts     # Redis config
│   ├── controllers/     # Request handlers
│   │   └── auth.controller.ts
│   ├── services/        # Business logic
│   │   └── auth.service.ts
│   ├── models/          # TypeORM entities
│   │   ├── User.entity.ts
│   │   ├── RefreshToken.entity.ts
│   │   └── LoginAttempt.entity.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── routes/          # API routes
│   │   └── auth.routes.ts
│   ├── utils/           # Utility functions
│   │   ├── password.util.ts
│   │   ├── jwt.util.ts
│   │   ├── token.util.ts
│   │   ├── email.util.ts
│   │   └── logger.util.ts
│   ├── types/           # TypeScript types
│   │   └── auth.types.ts
│   └── index.ts         # Application entry point
├── tests/               # Test files
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd services/auth-service
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Ensure PostgreSQL and Redis are running:
```bash
# Using Docker Compose from project root
cd ../..
docker compose up -d postgres redis
```

4. Run database migrations (if needed):
```bash
npm run typeorm migration:run
```

### Development

Start the development server with hot-reload:

```bash
npm run dev
```

The service will start on port 3001 (configurable via `AUTH_SERVICE_PORT`).

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Generate coverage report
npm test -- --coverage
```

## API Endpoints

### Public Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "john_adventurer",
  "firstName": "John",
  "lastName": "Doe"
}

Response 201:
{
  "userId": "uuid",
  "email": "user@example.com",
  "username": "john_adventurer",
  "verificationRequired": true,
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### Verify Email
```http
GET /api/v1/auth/verify-email?token={verification_token}

Response 200:
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "john_adventurer",
    "role": "user",
    "emailVerified": true
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response 200:
{
  "message": "If email exists, password reset link sent"
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}

Response 200:
{
  "message": "Password reset successfully"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "message": "Logged out successfully"
}
```

### Protected Endpoints

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {access_token}

Response 200:
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user"
}
```

### Health Check
```http
GET /api/v1/auth/health

Response 200:
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-10-23T10:00:00.000Z"
}
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Rate Limiting
- **Registration**: 3 attempts per hour per IP
- **Login**: 5 attempts per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP
- **Resend Verification**: 3 requests per hour per IP

### Account Lockout
- Account locked for 15 minutes after 5 failed login attempts
- User receives email notification about lockout

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Verification Token**: 24 hours
- **Password Reset Token**: 1 hour

### Password Storage
- Passwords hashed using bcrypt with cost factor 12
- Old passwords cannot be reused

### Token Security
- JWT tokens signed with secret keys
- Refresh tokens stored as hashed values in database
- Tokens revoked on logout and password reset

## Environment Variables

See `.env.example` for all available configuration options.

### Critical Variables (Production)
```bash
# Must be changed in production
JWT_ACCESS_SECRET=your-strong-secret-here
JWT_REFRESH_SECRET=your-strong-secret-here

# Database
POSTGRES_HOST=your-db-host
POSTGRES_PASSWORD=your-db-password

# Email (use production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=your-sendgrid-user
SMTP_PASSWORD=your-sendgrid-password
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "ErrorName",
  "message": "Human-readable error message",
  "statusCode": 400,
  "details": {
    "field": "email",
    "message": "Email already registered"
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Validation Error
- `401` - Unauthorized (invalid credentials, expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Logging

The service uses Winston for structured logging:

- **Console logs**: Colored, human-readable format for development
- **File logs**:
  - `logs/error.log` - Error level logs
  - `logs/combined.log` - All logs
- **Log levels**: error, warn, info, http, debug

### Log Format
```json
{
  "timestamp": "2025-10-23 10:00:00",
  "level": "info",
  "message": "User logged in successfully",
  "service": "auth-service",
  "userId": "uuid",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1"
}
```

## Database Schema

### users table (schema: auth)
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique
- `password_hash` (VARCHAR)
- `username` (VARCHAR) - Unique
- `role` (ENUM) - user, creator, moderator, admin, super_admin
- `email_verified` (BOOLEAN)
- `is_active` (BOOLEAN)
- `verification_token` (VARCHAR)
- `verification_token_expires` (TIMESTAMP)
- `password_reset_token` (VARCHAR)
- `password_reset_expires` (TIMESTAMP)
- `failed_login_attempts` (INTEGER)
- `locked_until` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_login_at` (TIMESTAMP)

### refresh_tokens table (schema: auth)
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `token_hash` (VARCHAR)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `revoked` (BOOLEAN)
- `revoked_at` (TIMESTAMP)

### login_attempts table (schema: auth)
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `ip_address` (VARCHAR)
- `attempted_at` (TIMESTAMP)
- `success` (BOOLEAN)
- `failure_reason` (VARCHAR)

## Deployment

### Docker

Build image:
```bash
docker build -t adventure-platform/auth-service:latest .
```

Run container:
```bash
docker run -p 3001:3001 \
  --env-file .env \
  adventure-platform/auth-service:latest
```

### Docker Compose

Already configured in project root `docker-compose.yml`.

### Kubernetes

See deployment manifests in `infrastructure/k8s/auth-service/`.

## Monitoring

### Health Checks
- **Endpoint**: `GET /api/v1/auth/health`
- **Response**: `{ "status": "healthy", ... }`

### Metrics
- Total registrations
- Login success/failure rate
- Token refresh rate
- Failed login attempts
- Account lockouts

### Alerts
- High failed login rate
- Database connection failures
- Email sending failures
- Memory/CPU usage

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and credentials are correct.

#### Redis Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Ensure Redis is running.

#### Email Not Sending
```
Error: Failed to send verification email
```
**Solution**: Check SMTP configuration. For development, use Mailhog.

#### JWT Token Invalid
```
Error: Invalid or expired access token
```
**Solution**: Token may have expired. Use refresh token to get new access token.

## Contributing

See main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/altunelyusuf/Adventure-Management-Platform/issues
- Email: support@adventure-platform.com

---

**Version**: 1.0.0
**Last Updated**: October 23, 2025
**Status**: Sprint 3 - Phase 2 Core Platform Development
