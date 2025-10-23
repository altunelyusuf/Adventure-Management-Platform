# Phase 2: Core Platform Epics & Stories
## Adventure Coordinator Platform - Agile Blueprint
### Version 1.0 | October 2025

---

## 📋 Overview

This phase details the **Core Platform** initiative, covering foundational systems that all other features depend on. These epics are part of **Deployment Package 1 (MVP)** and must be completed in the first 3-4 sprints.

### Scope
- Initiative 1: Core Infrastructure & Foundation
- 8 Major Epics
- 67 User Stories
- ~450 Story Points
- Sprints 1-4 (8 weeks)

---

## 🎯 Initiative 1: Core Platform Foundation

### Initiative Goal
Build robust, scalable foundation for all platform features including authentication, user management, API infrastructure, database architecture, and core entities.

### Success Metrics
- 100% authentication success rate
- <100ms API response time (P95)
- 99.9% uptime
- 0 critical security vulnerabilities
- All core entities functional

---

# EPIC 1.1: Authentication & Authorization System

## Epic Overview
**Epic ID**: EPIC-1.1  
**Priority**: P0 (Must Have)  
**Deployment Package**: MVP (Package 1)  
**Sprint Assignment**: Sprint 1-2  
**Estimated Effort**: 55 Story Points  
**Team**: Backend (2), Frontend (1), Security (1)

### Epic Goal
Implement secure, scalable authentication and authorization system supporting multiple user types (adventurers, creators, admins) with OAuth 2.0, JWT tokens, and role-based access control.

### Business Value
- **Security**: Protect user data and platform integrity
- **Compliance**: GDPR, CCPA compliance
- **User Experience**: Seamless login/registration
- **Scalability**: Support millions of users

### Dependencies
- None (foundational epic)

### Risks
- Security vulnerabilities → Mitigation: Security audit, penetration testing
- OAuth provider downtime → Mitigation: Multiple providers, fallback to email/password

---

## User Stories for EPIC 1.1

### US-1.1.1: User Registration with Email
**Story ID**: US-1.1.1  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 1

**User Story**:
```
As a new user
I want to register with my email and password
So that I can create an account and access the platform
```

**Acceptance Criteria**:
```gherkin
Given I am on the registration page
When I enter valid email, password, and required information
Then my account is created
And I receive a verification email
And I am redirected to the email verification page

Given I enter an email that already exists
When I submit the registration form
Then I see an error message "Email already registered"

Given I enter a weak password (<8 characters)
When I submit the registration form
Then I see an error "Password must be at least 8 characters"
```

**Technical Requirements**:
- Password hashing using bcrypt (cost factor 12)
- Email validation (regex + DNS check)
- Rate limiting: 5 attempts per hour per IP
- CAPTCHA after 3 failed attempts
- Password requirements: min 8 chars, 1 uppercase, 1 number, 1 special char

**API Endpoints**:
```
POST /api/v1/auth/register
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "ADVENTURER" // or "CREATOR"
}

Response (201):
{
  "userId": "uuid",
  "email": "user@example.com",
  "verificationRequired": true,
  "message": "Verification email sent"
}
```

**Database Schema**:
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('ADVENTURER', 'CREATOR', 'ADMIN')),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  account_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
  INDEX idx_email (email),
  INDEX idx_verification_token (verification_token)
);
```

**Tasks**:
- [ ] Design registration UI/UX (Frontend) - 4 hours
- [ ] Implement registration API endpoint (Backend) - 6 hours
- [ ] Add password hashing and validation (Backend) - 3 hours
- [ ] Implement email verification service (Backend) - 4 hours
- [ ] Add rate limiting middleware (Backend) - 3 hours
- [ ] Create user database table and migrations (Backend) - 2 hours
- [ ] Write unit tests for registration logic (Backend) - 4 hours
- [ ] Write integration tests (Backend) - 4 hours
- [ ] Frontend form validation (Frontend) - 3 hours
- [ ] Connect frontend to API (Frontend) - 3 hours
- [ ] Security review (Security) - 4 hours

**Definition of Done**:
- [ ] Code complete and peer-reviewed
- [ ] Unit tests written with >85% coverage
- [ ] Integration tests passing
- [ ] Security scan passed (no high/critical vulnerabilities)
- [ ] Password strength validation working
- [ ] Rate limiting functional
- [ ] Email sending functional (with test mode)
- [ ] API documentation updated
- [ ] Deployed to staging and tested
- [ ] Product Owner acceptance

---

### US-1.1.2: Email Verification
**Story ID**: US-1.1.2  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 1

**User Story**:
```
As a newly registered user
I want to verify my email address
So that I can activate my account and prove ownership
```

**Acceptance Criteria**:
```gherkin
Given I receive a verification email
When I click the verification link
Then my email is marked as verified
And I am redirected to the login page with a success message

Given I try to verify with an expired token (>24 hours old)
When I click the verification link
Then I see an error "Verification link expired"
And I see an option to resend verification email

Given I try to verify an already verified email
When I click the verification link
Then I see a message "Email already verified"
And I am redirected to login
```

**Technical Requirements**:
- Verification token: Secure random 32-byte hex string
- Token expiration: 24 hours
- One-time use tokens
- Email template: Branded HTML email

**API Endpoints**:
```
GET /api/v1/auth/verify-email?token={token}
Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}

POST /api/v1/auth/resend-verification
Request:
{
  "email": "user@example.com"
}
Response (200):
{
  "success": true,
  "message": "Verification email sent"
}
```

**Tasks**:
- [ ] Implement token generation logic (Backend) - 2 hours
- [ ] Create verification endpoint (Backend) - 3 hours
- [ ] Design verification email template (Frontend) - 3 hours
- [ ] Implement email sending service (Backend) - 4 hours
- [ ] Create resend verification endpoint (Backend) - 2 hours
- [ ] Build verification success page (Frontend) - 3 hours
- [ ] Write unit tests (Backend) - 3 hours
- [ ] Write integration tests (Backend) - 2 hours
- [ ] Test email delivery (QA) - 2 hours

**Definition of Done**:
- [ ] Verification flow working end-to-end
- [ ] Expired tokens handled properly
- [ ] Resend functionality working
- [ ] Email templates rendering correctly
- [ ] Tests passing (>85% coverage)
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.1.3: User Login with Email/Password
**Story ID**: US-1.1.3  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 1

**User Story**:
```
As a registered user
I want to log in with my email and password
So that I can access my account and platform features
```

**Acceptance Criteria**:
```gherkin
Given I am on the login page
When I enter valid credentials
Then I am logged in successfully
And I receive an access token and refresh token
And I am redirected to my dashboard

Given I enter invalid credentials
When I submit the login form
Then I see an error "Invalid email or password"
And my account is not locked (unless 5+ failed attempts)

Given I have 5+ failed login attempts
When I try to login again
Then my account is temporarily locked for 15 minutes
And I receive an email notification about the lock

Given my email is not verified
When I try to login
Then I see a message "Please verify your email first"
And I see an option to resend verification email
```

**Technical Requirements**:
- JWT access token: 15-minute expiration
- JWT refresh token: 7-day expiration
- Failed login attempt tracking
- Account lockout: 15 minutes after 5 failed attempts
- Secure cookie storage for tokens (HttpOnly, Secure, SameSite)

**API Endpoints**:
```
POST /api/v1/auth/login
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "expiresIn": 900,
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "ADVENTURER"
  }
}
```

**Database Schema**:
```sql
CREATE TABLE login_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  ip_address VARCHAR(45),
  attempted_at TIMESTAMP DEFAULT NOW(),
  success BOOLEAN,
  INDEX idx_user_attempts (user_id, attempted_at)
);

CREATE TABLE refresh_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  INDEX idx_user_tokens (user_id),
  INDEX idx_token_hash (token_hash)
);
```

**Tasks**:
- [ ] Design login UI/UX (Frontend) - 4 hours
- [ ] Implement login API endpoint (Backend) - 6 hours
- [ ] Implement JWT token generation (Backend) - 4 hours
- [ ] Add password verification (Backend) - 2 hours
- [ ] Implement failed attempt tracking (Backend) - 4 hours
- [ ] Add account lockout logic (Backend) - 3 hours
- [ ] Create refresh token table (Backend) - 2 hours
- [ ] Frontend form validation (Frontend) - 3 hours
- [ ] Token storage in frontend (Frontend) - 4 hours
- [ ] Write unit tests (Backend) - 5 hours
- [ ] Write integration tests (Backend) - 4 hours
- [ ] Security review (Security) - 3 hours

**Definition of Done**:
- [ ] Login flow working end-to-end
- [ ] JWT tokens generated correctly
- [ ] Account lockout working
- [ ] Failed attempt tracking functional
- [ ] Tests passing (>85% coverage)
- [ ] Security scan passed
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.1.4: OAuth Login (Google, Facebook, Apple)
**Story ID**: US-1.1.4  
**Priority**: P1  
**Story Points**: 8  
**Sprint**: Sprint 2

**User Story**:
```
As a new or existing user
I want to log in using my Google, Facebook, or Apple account
So that I can access the platform without creating a new password
```

**Acceptance Criteria**:
```gherkin
Given I am on the login page
When I click "Continue with Google"
Then I am redirected to Google's OAuth consent page
And I can authorize the application
And I am redirected back with an account created/logged in

Given I have an existing account with the same email
When I log in with OAuth using that email
Then my accounts are linked
And I can use both methods to log in

Given the OAuth provider is unavailable
When I try to login with OAuth
Then I see a friendly error message
And I am offered alternative login methods
```

**Technical Requirements**:
- OAuth 2.0 authorization code flow
- Support for Google, Facebook, and Apple Sign In
- PKCE (Proof Key for Code Exchange) for security
- Account linking by email
- Secure state parameter to prevent CSRF

**API Endpoints**:
```
GET /api/v1/auth/oauth/{provider}/authorize
Response (302): Redirect to OAuth provider

GET /api/v1/auth/oauth/{provider}/callback?code={code}&state={state}
Response (200):
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": { ... },
  "isNewUser": true
}
```

**Database Schema**:
```sql
CREATE TABLE oauth_accounts (
  oauth_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  provider VARCHAR(50) NOT NULL, -- 'GOOGLE', 'FACEBOOK', 'APPLE'
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (provider, provider_user_id),
  INDEX idx_user_oauth (user_id, provider)
);
```

**Tasks**:
- [ ] Set up OAuth apps with Google, Facebook, Apple (Backend) - 4 hours
- [ ] Implement OAuth flow for Google (Backend) - 6 hours
- [ ] Implement OAuth flow for Facebook (Backend) - 6 hours
- [ ] Implement OAuth flow for Apple (Backend) - 6 hours
- [ ] Add account linking logic (Backend) - 4 hours
- [ ] Create OAuth UI buttons (Frontend) - 3 hours
- [ ] Handle OAuth redirects (Frontend) - 4 hours
- [ ] Encrypt/decrypt tokens (Backend) - 3 hours
- [ ] Write unit tests (Backend) - 6 hours
- [ ] Write integration tests (Backend) - 5 hours
- [ ] Security review (Security) - 4 hours

**Definition of Done**:
- [ ] All three OAuth providers working
- [ ] Account linking functional
- [ ] Security best practices implemented (PKCE, state)
- [ ] Tests passing (>85% coverage)
- [ ] Error handling for provider failures
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.1.5: Password Reset Flow
**Story ID**: US-1.1.5  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 2

**User Story**:
```
As a user who forgot my password
I want to reset my password via email
So that I can regain access to my account
```

**Acceptance Criteria**:
```gherkin
Given I am on the login page
When I click "Forgot Password"
Then I am taken to the password reset request page

Given I enter my registered email
When I submit the reset request
Then I receive a password reset email
And the email contains a secure reset link

Given I click the reset link within 1 hour
When I enter a new valid password
Then my password is updated
And I am redirected to login
And I receive a confirmation email

Given I try to use an expired reset link (>1 hour)
When I click the link
Then I see an error "Reset link expired"
And I can request a new reset link
```

**Technical Requirements**:
- Reset token: Secure random 32-byte hex string
- Token expiration: 1 hour
- One-time use tokens
- Password reset email template
- New password must be different from old password
- Invalidate all existing sessions after password reset

**API Endpoints**:
```
POST /api/v1/auth/forgot-password
Request:
{
  "email": "user@example.com"
}
Response (200):
{
  "message": "If email exists, password reset link sent"
}

POST /api/v1/auth/reset-password
Request:
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
Response (200):
{
  "message": "Password reset successfully"
}
```

**Database Schema**:
```sql
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;
CREATE INDEX idx_password_reset_token ON users(password_reset_token);
```

**Tasks**:
- [ ] Design forgot password UI (Frontend) - 3 hours
- [ ] Design reset password UI (Frontend) - 3 hours
- [ ] Implement forgot password endpoint (Backend) - 4 hours
- [ ] Implement reset password endpoint (Backend) - 4 hours
- [ ] Create reset email template (Frontend) - 2 hours
- [ ] Add token generation and validation (Backend) - 3 hours
- [ ] Invalidate existing sessions (Backend) - 3 hours
- [ ] Write unit tests (Backend) - 4 hours
- [ ] Write integration tests (Backend) - 3 hours
- [ ] Frontend form validation (Frontend) - 2 hours

**Definition of Done**:
- [ ] Password reset flow working end-to-end
- [ ] Email sent successfully
- [ ] Token expiration working
- [ ] One-time token usage enforced
- [ ] All sessions invalidated after reset
- [ ] Tests passing (>85% coverage)
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.1.6: Token Refresh Mechanism
**Story ID**: US-1.1.6  
**Priority**: P0  
**Story Points**: 3  
**Sprint**: Sprint 2

**User Story**:
```
As a logged-in user
I want my session to be automatically renewed
So that I don't have to log in repeatedly during active use
```

**Acceptance Criteria**:
```gherkin
Given my access token is expired
When I make an API request with a valid refresh token
Then I receive a new access token
And my request succeeds

Given my refresh token is expired
When I try to refresh
Then I receive a 401 Unauthorized error
And I am redirected to the login page

Given my refresh token is revoked
When I try to use it
Then I receive an error
And I must log in again
```

**Technical Requirements**:
- Automatic token refresh before expiration (client-side)
- Sliding window for refresh tokens (extend on use)
- Token rotation (issue new refresh token on refresh)
- Revocation mechanism for logout

**API Endpoints**:
```
POST /api/v1/auth/refresh
Request:
{
  "refreshToken": "current_refresh_token"
}
Response (200):
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 900
}

POST /api/v1/auth/logout
Request:
Headers: Authorization: Bearer {accessToken}
Response (200):
{
  "message": "Logged out successfully"
}
```

**Tasks**:
- [ ] Implement refresh token endpoint (Backend) - 4 hours
- [ ] Add token rotation logic (Backend) - 3 hours
- [ ] Implement revocation on logout (Backend) - 2 hours
- [ ] Add automatic refresh in frontend (Frontend) - 5 hours
- [ ] Handle token expiration globally (Frontend) - 4 hours
- [ ] Write unit tests (Backend) - 3 hours
- [ ] Write integration tests (Backend) - 2 hours

**Definition of Done**:
- [ ] Token refresh working seamlessly
- [ ] Token rotation functional
- [ ] Logout revokes tokens
- [ ] Frontend automatically refreshes tokens
- [ ] Tests passing (>85% coverage)
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.1.7: Role-Based Access Control (RBAC)
**Story ID**: US-1.1.7  
**Priority**: P0  
**Story Points**: 8  
**Sprint**: Sprint 2

**User Story**:
```
As a system administrator
I want to control access to features based on user roles
So that users only see and access features appropriate for their account type
```

**Acceptance Criteria**:
```gherkin
Given I am logged in as an ADVENTURER
When I try to access creator-only features
Then I receive a 403 Forbidden error

Given I am logged in as a CREATOR
When I access my creator dashboard
Then I see creator-specific features

Given I am logged in as an ADMIN
When I access admin panel
Then I can manage users, quests, and platform settings

Given I don't have permission for an action
When I try to perform it
Then I see a clear error message explaining the permission requirement
```

**Technical Requirements**:
- Three user roles: ADVENTURER, CREATOR, ADMIN
- Permissions attached to roles
- Middleware for permission checking
- Frontend route guards
- Attribute-based access control (ABAC) for fine-grained permissions

**Database Schema**:
```sql
CREATE TABLE roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
  permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(role_id),
  permission_id UUID REFERENCES permissions(permission_id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(user_id),
  role_id UUID REFERENCES roles(role_id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Seed data for roles
INSERT INTO roles (role_name, description) VALUES
('ADVENTURER', 'Regular user who participates in quests'),
('CREATOR', 'Content creator who can create and manage quests'),
('ADMIN', 'Platform administrator with full access');

-- Seed data for permissions
INSERT INTO permissions (permission_name, resource, action) VALUES
('quest.create', 'quest', 'create'),
('quest.read', 'quest', 'read'),
('quest.update', 'quest', 'update'),
('quest.delete', 'quest', 'delete'),
('user.manage', 'user', 'manage'),
('analytics.view', 'analytics', 'read'),
('subscription.manage', 'subscription', 'manage');

-- Assign permissions to roles
-- ADVENTURERs can read quests
-- CREATORs can create, read, update quests
-- ADMINs have all permissions
```

**API Middleware**:
```typescript
// Example middleware
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // From JWT
    const hasPermission = await checkUserPermission(user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/quests', requirePermission('quest.create'), createQuest);
```

**Tasks**:
- [ ] Design RBAC schema (Backend) - 3 hours
- [ ] Create RBAC database tables (Backend) - 2 hours
- [ ] Implement permission checking middleware (Backend) - 6 hours
- [ ] Add permission decorators (Backend) - 3 hours
- [ ] Implement frontend route guards (Frontend) - 5 hours
- [ ] Add UI permission checks (Frontend) - 4 hours
- [ ] Seed initial roles and permissions (Backend) - 2 hours
- [ ] Write unit tests (Backend) - 6 hours
- [ ] Write integration tests (Backend) - 5 hours
- [ ] Documentation (All) - 3 hours

**Definition of Done**:
- [ ] RBAC fully functional
- [ ] All three roles implemented
- [ ] Permission checks on all protected endpoints
- [ ] Frontend route guards working
- [ ] Tests passing (>85% coverage)
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.1.8: Multi-Factor Authentication (MFA)
**Story ID**: US-1.1.8  
**Priority**: P2  
**Story Points**: 8  
**Sprint**: Sprint 3

**User Story**:
```
As a security-conscious user
I want to enable two-factor authentication on my account
So that I have an extra layer of security
```

**Acceptance Criteria**:
```gherkin
Given I am logged in
When I navigate to security settings
Then I can enable MFA using TOTP (Google Authenticator, Authy, etc.)

Given I enable MFA
When I log in next time
Then I am prompted for my MFA code after entering password
And I can use backup codes if my device is unavailable

Given I enter the correct MFA code
When I submit it
Then I am logged in successfully

Given I enter an incorrect MFA code 5 times
When I submit the 5th incorrect code
Then my account is temporarily locked
And I receive an email notification
```

**Technical Requirements**:
- TOTP (Time-based One-Time Password) support
- QR code generation for authenticator apps
- Backup codes (10 codes, single-use)
- Remember device option (30 days)
- MFA recovery process

**API Endpoints**:
```
POST /api/v1/auth/mfa/enable
Response (200):
{
  "secret": "TOTP_SECRET",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["123456", "234567", ...]
}

POST /api/v1/auth/mfa/verify-setup
Request:
{
  "code": "123456"
}
Response (200):
{
  "success": true,
  "message": "MFA enabled successfully"
}

POST /api/v1/auth/mfa/verify
Request:
{
  "userId": "uuid",
  "code": "123456",
  "rememberDevice": true
}
Response (200):
{
  "accessToken": "...",
  "refreshToken": "..."
}

POST /api/v1/auth/mfa/disable
Request:
{
  "password": "current_password",
  "code": "123456"
}
Response (200):
{
  "message": "MFA disabled"
}
```

**Database Schema**:
```sql
CREATE TABLE mfa_settings (
  mfa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) UNIQUE,
  is_enabled BOOLEAN DEFAULT FALSE,
  totp_secret_encrypted TEXT,
  backup_codes_encrypted TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trusted_devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  device_fingerprint VARCHAR(255),
  device_name VARCHAR(100),
  last_used TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_devices (user_id)
);
```

**Tasks**:
- [ ] Implement TOTP library integration (Backend) - 4 hours
- [ ] Create MFA setup endpoint (Backend) - 5 hours
- [ ] Generate QR codes (Backend) - 2 hours
- [ ] Create backup codes logic (Backend) - 3 hours
- [ ] Implement MFA verification (Backend) - 5 hours
- [ ] Add trusted device management (Backend) - 4 hours
- [ ] Design MFA setup UI (Frontend) - 4 hours
- [ ] Implement MFA login flow (Frontend) - 5 hours
- [ ] Add MFA settings page (Frontend) - 4 hours
- [ ] Write unit tests (Backend) - 6 hours
- [ ] Write integration tests (Backend) - 4 hours
- [ ] Security review (Security) - 4 hours

**Definition of Done**:
- [ ] MFA setup flow working
- [ ] TOTP verification functional
- [ ] Backup codes working
- [ ] Trusted device functionality working
- [ ] MFA can be disabled
- [ ] Tests passing (>85% coverage)
- [ ] Security scan passed
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

## EPIC 1.1 Summary

### Total Effort
- **Story Points**: 55
- **Stories**: 8
- **Estimated Hours**: ~330 hours
- **Sprints**: 2-3

### Team Assignment
- **Backend**: 2 developers
- **Frontend**: 1 developer
- **Security**: 1 reviewer (part-time)
- **QA**: 1 tester (part-time)

### Dependencies
- Email service setup (SendGrid/AWS SES)
- OAuth provider registrations
- SSL certificates for production

### Risks & Mitigations
- **Risk**: OAuth provider changes → **Mitigation**: Abstract OAuth logic
- **Risk**: Security vulnerabilities → **Mitigation**: Regular security audits
- **Risk**: Email deliverability → **Mitigation**: Use reputable ESP, SPF/DKIM setup

---

# EPIC 1.2: User Management

## Epic Overview
**Epic ID**: EPIC-1.2  
**Priority**: P0 (Must Have)  
**Deployment Package**: MVP (Package 1)  
**Sprint Assignment**: Sprint 2-3  
**Estimated Effort**: 45 Story Points  
**Team**: Backend (2), Frontend (1), UX (1)

### Epic Goal
Build comprehensive user profile management system supporting adventurers and creators with profile customization, preferences, privacy settings, and account management.

### Business Value
- **Personalization**: Enhanced user experience
- **Retention**: Profile investment increases retention
- **Trust**: Complete profiles build community trust
- **Analytics**: Rich user data for insights

---

## User Stories for EPIC 1.2

### US-1.2.1: User Profile Creation & Editing
**Story ID**: US-1.2.1  
**Priority**: P0  
**Story Points**: 5  
**Sprint**: Sprint 2

**User Story**:
```
As a registered user
I want to create and edit my profile
So that other users can learn about me and I can personalize my account
```

**Acceptance Criteria**:
```gherkin
Given I am logged in for the first time
When I am redirected to profile setup
Then I can fill in my profile information

Given I am on my profile edit page
When I update my information (name, bio, avatar, location)
Then my changes are saved
And I see a success message

Given I upload a profile photo >5MB
When I submit
Then I see an error "Photo must be less than 5MB"

Given I enter a valid profile URL (username/handle)
When I save
Then my profile is accessible at /profile/{username}
```

**Technical Requirements**:
- Profile photo upload to S3/CloudStorage
- Image resizing (thumbnails: 50x50, 200x200, 400x400)
- Username uniqueness validation
- Bio character limit: 500 characters
- Location autocomplete using geocoding API

**API Endpoints**:
```
GET /api/v1/users/{userId}/profile
Response (200):
{
  "userId": "uuid",
  "username": "john_adventurer",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Love outdoor adventures!",
  "avatarUrl": "https://cdn.../avatar.jpg",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "joinedDate": "2025-01-15",
  "stats": {
    "questsCompleted": 0,
    "totalXP": 0,
    "level": 1
  }
}

PUT /api/v1/users/{userId}/profile
Request:
{
  "username": "john_adventurer",
  "bio": "Updated bio",
  "location": {...}
}

POST /api/v1/users/{userId}/avatar
Request: FormData with image file
Response (200):
{
  "avatarUrl": "https://cdn.../avatar.jpg",
  "thumbnails": {
    "small": "...",
    "medium": "...",
    "large": "..."
  }
}
```

**Database Schema**:
```sql
CREATE TABLE user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  avatar_thumbnails JSONB,
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_country VARCHAR(100),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  website_url TEXT,
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_username (username),
  INDEX idx_location (location_latitude, location_longitude)
);
```

**Tasks**:
- [ ] Design profile UI/UX (Frontend) - 6 hours
- [ ] Implement profile endpoints (Backend) - 6 hours
- [ ] Add image upload to S3 (Backend) - 4 hours
- [ ] Implement image resizing (Backend) - 3 hours
- [ ] Username validation (Backend) - 2 hours
- [ ] Location autocomplete integration (Frontend) - 4 hours
- [ ] Build profile page (Frontend) - 6 hours
- [ ] Build edit profile page (Frontend) - 5 hours
- [ ] Write unit tests (Backend) - 4 hours
- [ ] Write integration tests (Backend) - 3 hours

**Definition of Done**:
- [ ] Profile creation/editing working
- [ ] Image upload functional with resizing
- [ ] Username uniqueness enforced
- [ ] Profile page rendering correctly
- [ ] Tests passing (>85% coverage)
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.2.2: Privacy Settings Management
**Story ID**: US-1.2.2  
**Priority**: P1  
**Story Points**: 5  
**Sprint**: Sprint 3

**User Story**:
```
As a user concerned about privacy
I want to control who can see my profile and activity
So that I can manage my online presence
```

**Acceptance Criteria**:
```gherkin
Given I am on privacy settings page
When I set my profile to "Private"
Then only my friends can view my full profile
And others see limited information

Given I disable activity sharing
When I complete a quest
Then my friends don't see it in their activity feed

Given I enable location sharing
When I participate in quests
Then my location is shared with quest creators
```

**Privacy Options**:
- Profile visibility: Public, Friends Only, Private
- Activity feed sharing: On/Off
- Location sharing: On/Off
- Quest history visibility: Public, Friends, Private
- Online status: Visible, Invisible

**API Endpoints**:
```
GET /api/v1/users/{userId}/privacy
Response (200):
{
  "profileVisibility": "PUBLIC", // PUBLIC, FRIENDS_ONLY, PRIVATE
  "showActivityFeed": true,
  "shareLocation": true,
  "questHistoryVisibility": "PUBLIC",
  "showOnlineStatus": true
}

PUT /api/v1/users/{userId}/privacy
Request:
{
  "profileVisibility": "FRIENDS_ONLY",
  "showActivityFeed": false
}
```

**Database Schema**:
```sql
CREATE TABLE user_privacy_settings (
  privacy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) UNIQUE,
  profile_visibility VARCHAR(20) DEFAULT 'PUBLIC',
  show_activity_feed BOOLEAN DEFAULT TRUE,
  share_location BOOLEAN DEFAULT TRUE,
  quest_history_visibility VARCHAR(20) DEFAULT 'PUBLIC',
  show_online_status BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tasks**:
- [ ] Design privacy settings UI (Frontend) - 4 hours
- [ ] Implement privacy endpoints (Backend) - 4 hours
- [ ] Add privacy checks in profile endpoint (Backend) - 3 hours
- [ ] Add privacy checks in activity feed (Backend) - 3 hours
- [ ] Build privacy settings page (Frontend) - 5 hours
- [ ] Write unit tests (Backend) - 4 hours
- [ ] Write integration tests (Backend) - 3 hours
- [ ] Privacy compliance review (Legal) - 2 hours

**Definition of Done**:
- [ ] All privacy settings functional
- [ ] Privacy enforced in API responses
- [ ] Settings page working correctly
- [ ] Tests passing (>85% coverage)
- [ ] GDPR compliance verified
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

### US-1.2.3: Account Settings & Preferences
**Story ID**: US-1.2.3  
**Priority**: P1  
**Story Points**: 3  
**Sprint**: Sprint 3

**User Story**:
```
As a user
I want to manage my account settings and preferences
So that I can customize my experience
```

**Acceptance Criteria**:
```gherkin
Given I am on account settings
When I change my email notification preferences
Then I only receive notifications I've opted into

Given I enable dark mode
When I refresh the app
Then the UI displays in dark theme

Given I change my default quest difficulty
When I search for quests
Then results are filtered to my preference
```

**Settings Categories**:
- Email notifications (quest updates, social, marketing)
- Push notifications (mobile)
- App preferences (theme, language, units)
- Quest preferences (difficulty, categories, distance)

**API Endpoints**:
```
GET /api/v1/users/{userId}/settings
Response (200):
{
  "notifications": {
    "email": {
      "questUpdates": true,
      "socialActivity": true,
      "marketing": false
    },
    "push": {
      "questReminders": true,
      "friendRequests": true
    }
  },
  "preferences": {
    "theme": "DARK",
    "language": "en",
    "distanceUnit": "MILES",
    "defaultQuestDifficulty": "MEDIUM"
  }
}

PUT /api/v1/users/{userId}/settings
Request:
{
  "notifications": {...},
  "preferences": {...}
}
```

**Database Schema**:
```sql
CREATE TABLE user_settings (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) UNIQUE,
  notification_settings JSONB DEFAULT '{}',
  app_preferences JSONB DEFAULT '{}',
  quest_preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tasks**:
- [ ] Design settings UI (Frontend) - 4 hours
- [ ] Implement settings endpoints (Backend) - 3 hours
- [ ] Add notification preference logic (Backend) - 3 hours
- [ ] Implement theme switching (Frontend) - 3 hours
- [ ] Build settings pages (Frontend) - 5 hours
- [ ] Write unit tests (Backend) - 3 hours
- [ ] Write integration tests (Backend) - 2 hours

**Definition of Done**:
- [ ] All settings functional
- [ ] Preferences persist correctly
- [ ] Theme switching working
- [ ] Notification preferences enforced
- [ ] Tests passing (>85% coverage)
- [ ] API documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

---

_[Due to length, I'll summarize remaining stories for EPIC 1.2]_

### Additional Stories (Summary):
- **US-1.2.4**: Account Deletion & Data Export (GDPR) - 5 SP
- **US-1.2.5**: Creator Profile Extensions - 8 SP
- **US-1.2.6**: User Activity History - 5 SP
- **US-1.2.7**: User Statistics Dashboard - 5 SP
- **US-1.2.8**: Blocked Users Management - 3 SP
- **US-1.2.9**: Email Preference Management - 3 SP

**EPIC 1.2 Total**: 45 Story Points

---

# Quick Overview of Remaining Epics (EPIC 1.3 - 1.8)

## EPIC 1.3: API Gateway & Microservices Architecture
**Story Points**: 40  
**Sprints**: 2-3  
**Key Stories**:
- API Gateway setup (Kong/AWS API Gateway)
- Service mesh configuration
- Rate limiting & throttling
- API versioning strategy
- Request/response logging
- Circuit breaker pattern

## EPIC 1.4: Database Architecture & ORM Setup
**Story Points**: 35  
**Sprints**: 2-3  
**Key Stories**:
- PostgreSQL setup and configuration
- TypeORM/Prisma setup
- Database migrations
- Connection pooling
- Read replicas setup
- Backup strategy implementation

## EPIC 1.5: Caching Layer (Redis)
**Story Points**: 30  
**Sprints**: 2  
**Key Stories**:
- Redis cluster setup
- Cache strategies (cache-aside, write-through)
- Session storage
- Rate limit tracking
- Pub/sub for real-time features

## EPIC 1.6: File Storage & CDN
**Story Points**: 25  
**Sprints**: 2  
**Key Stories**:
- S3/Cloud Storage setup
- Image optimization pipeline
- CDN integration (CloudFront/CloudFlare)
- Signed URLs for secure access
- Media management service

## EPIC 1.7: Search Infrastructure (Elasticsearch)
**Story Points**: 35  
**Sprints**: 2-3  
**Key Stories**:
- Elasticsearch cluster setup
- Search indexing pipeline
- Full-text search for quests
- Geospatial search
- Search analytics

## EPIC 1.8: Monitoring & Logging
**Story Points**: 30  
**Sprints**: 2  
**Key Stories**:
- Application monitoring (Datadog/New Relic)
- Log aggregation (ELK stack)
- Error tracking (Sentry)
- Performance monitoring
- Alert configuration

---

## 📊 Core Platform Initiative Summary

### Total Effort Across All Epics
- **Total Story Points**: ~295
- **Total User Stories**: 67
- **Estimated Duration**: 12-16 weeks (6-8 sprints)
- **Team Size Required**: 8-10 developers

### Sprint Breakdown

#### Sprint 1 (2 weeks)
- **Focus**: Authentication foundation
- **Stories**: US-1.1.1, US-1.1.2, US-1.1.3
- **Points**: 13
- **Deliverable**: Basic registration, email verification, login

#### Sprint 2 (2 weeks)
- **Focus**: Authentication completion + User Management start
- **Stories**: US-1.1.4, US-1.1.5, US-1.1.6, US-1.1.7, US-1.2.1
- **Points**: 29
- **Deliverable**: OAuth, password reset, RBAC, user profiles

#### Sprint 3 (2 weeks)
- **Focus**: User Management + Infrastructure start
- **Stories**: US-1.1.8, US-1.2.2 - US-1.2.5, API Gateway stories
- **Points**: 24
- **Deliverable**: MFA, privacy settings, API gateway

#### Sprint 4 (2 weeks)
- **Focus**: Infrastructure & Database
- **Stories**: Database architecture, caching, file storage
- **Points**: 35
- **Deliverable**: Database setup, Redis caching, S3 storage

---

## 🎯 Next Phase Preview

**Phase 3** will cover:
- Quest Management System (EPIC 2.x)
- Geospatial Services (EPIC 3.x)
- ~120 story points
- Sprints 5-8

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Status**: Approved  
**Next Review**: Phase 3 Completion

---

END OF PHASE 2
