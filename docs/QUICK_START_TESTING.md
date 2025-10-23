# Quick Start Testing Guide - Auth Service
**Phase 1: Validation & Testing**

This guide will help you quickly test the Auth Service to validate Sprint 3 implementation.

---

## 🎯 Prerequisites

- Docker and Docker Compose installed
- Terminal/Command line access
- curl or a REST client (Postman, Insomnia, etc.)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Services

```bash
# From project root
cd /home/user/Adventure-Management-Platform

# Start all services (or just required ones)
docker compose up -d postgres redis mailhog auth-service
```

**Wait 30-60 seconds** for services to initialize.

### Step 2: Verify Services are Running

```bash
# Check service status
docker compose ps

# Expected output should show:
# - postgres: healthy
# - redis: healthy
# - mailhog: running
# - auth-service: healthy
```

### Step 3: Run Automated Tests

```bash
# Run the test script
./scripts/test-auth-service.sh
```

This will run 10 automated tests covering all critical auth flows.

**Expected Output:**
```
✓ PASS: Health check returned 200
✓ PASS: User registration successful
✓ PASS: Verification email found in Mailhog
✓ PASS: Login correctly rejected for unverified email
... (10 tests total)

🎉 All tests passed!
```

---

## 📧 Mailhog - Email Testing

All emails sent by the auth service can be viewed at:

**URL**: http://localhost:8025

You'll see:
- ✉️ **Verification emails** (when users register)
- ✉️ **Password reset emails** (when users request password reset)
- ✉️ **Welcome emails** (after email verification)

---

## 🔍 Manual Testing

### Test 1: Health Check

```bash
curl http://localhost:3001/api/v1/auth/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-10-23T..."
}
```

---

### Test 2: User Registration

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "username": "johnadventurer"
  }'
```

**Expected Response (201):**
```json
{
  "userId": "uuid-here",
  "email": "john@example.com",
  "username": "johnadventurer",
  "verificationRequired": true,
  "message": "Registration successful. Please check your email..."
}
```

✅ **Verify**: Check Mailhog (http://localhost:8025) for verification email

---

### Test 3: Login (Before Email Verification)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (401):**
```json
{
  "error": "UnauthorizedError",
  "message": "Please verify your email first",
  "statusCode": 401
}
```

✅ **Expected**: Login should fail until email is verified

---

### Test 4: Email Verification

**Method 1 - Get token from Mailhog:**
1. Open http://localhost:8025
2. Click on the verification email
3. Find the verification link (contains `?token=...`)
4. Copy the token

**Method 2 - Direct database access:**
```bash
docker exec -it adventure-postgres psql -U adventure_user -d adventure_platform \
  -c "SELECT verification_token FROM auth.users WHERE email='john@example.com';"
```

**Verify email:**
```bash
curl "http://localhost:3001/api/v1/auth/verify-email?token=YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

✅ **Verify**: Check Mailhog for welcome email

---

### Test 5: Login (After Verification)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "user": {
    "userId": "uuid-here",
    "email": "john@example.com",
    "username": "johnadventurer",
    "role": "user",
    "emailVerified": true
  }
}
```

✅ **Save the tokens** for next tests

---

### Test 6: Get Current User (Protected Endpoint)

```bash
# Replace YOUR_ACCESS_TOKEN with the token from login
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "userId": "uuid-here",
  "email": "john@example.com",
  "role": "user"
}
```

---

### Test 7: Token Refresh

```bash
# Replace YOUR_REFRESH_TOKEN with the token from login
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "accessToken": "new_access_token_here",
  "refreshToken": "new_refresh_token_here",
  "expiresIn": 900
}
```

---

### Test 8: Forgot Password

```bash
curl -X POST http://localhost:3001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "message": "If email exists, password reset link sent"
}
```

✅ **Verify**: Check Mailhog for password reset email

---

### Test 9: Reset Password

**Get reset token from Mailhog** (same process as verification token)

```bash
curl -X POST http://localhost:3001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "newPassword": "NewSecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

✅ **Verify**: Old password no longer works, new password works

---

### Test 10: Logout

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

✅ **Verify**: Refresh token no longer works

---

## 🧪 Testing Edge Cases

### Invalid Email Format
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "TestPass123!",
    "username": "testuser"
  }'
```
**Expected**: 400 Bad Request

### Weak Password
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "weak",
    "username": "testuser"
  }'
```
**Expected**: 400 Bad Request with password requirements

### Duplicate Email
```bash
# Try to register same email twice
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123!",
    "username": "anotherjohn"
  }'
```
**Expected**: 409 Conflict

### Invalid Credentials
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "WrongPassword123!"
  }'
```
**Expected**: 401 Unauthorized

### Rate Limiting
```bash
# Try to login 6 times rapidly
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done
```
**Expected**: 429 Too Many Requests after 5 attempts

---

## 🔧 Troubleshooting

### Service Won't Start

**Check logs:**
```bash
docker compose logs auth-service
```

**Common issues:**
- Database not ready → Wait 30 seconds and retry
- Port 3001 in use → Stop conflicting service
- Redis connection failed → Ensure Redis is running

### Database Connection Error

```bash
# Restart services
docker compose restart postgres auth-service

# Check PostgreSQL is healthy
docker compose ps postgres
```

### Email Not Sending

**Check Mailhog is running:**
```bash
docker compose ps mailhog
curl http://localhost:8025
```

**Check auth service logs:**
```bash
docker compose logs auth-service | grep -i email
```

### TypeORM Schema Issues

**Reset database (⚠️ Destroys all data):**
```bash
docker compose down -v
docker compose up -d postgres redis mailhog
sleep 10
docker compose up -d auth-service
```

---

## 📊 Validation Checklist

After running tests, verify:

- [ ] ✅ Health check returns 200
- [ ] ✅ User can register
- [ ] ✅ Verification email is sent
- [ ] ✅ Login fails before email verification
- [ ] ✅ Email verification works
- [ ] ✅ Login succeeds after verification
- [ ] ✅ JWT tokens are returned
- [ ] ✅ Protected endpoints require valid token
- [ ] ✅ Token refresh works
- [ ] ✅ Password reset email is sent
- [ ] ✅ Password can be reset
- [ ] ✅ Logout revokes tokens
- [ ] ✅ Invalid email format is rejected
- [ ] ✅ Weak passwords are rejected
- [ ] ✅ Duplicate emails are rejected
- [ ] ✅ Invalid credentials return 401
- [ ] ✅ Rate limiting works (429 after limit)

---

## 🎯 Success Criteria

**✅ Sprint 3 is validated if:**
1. All automated tests pass (`./scripts/test-auth-service.sh`)
2. Manual testing of critical flows works
3. Emails appear in Mailhog
4. No critical bugs found
5. Service is stable (no crashes)

**⚠️ If any tests fail:**
1. Check service logs: `docker compose logs auth-service`
2. Verify database schema: `docker exec adventure-postgres psql -U adventure_user -d adventure_platform -c "\dt auth.*"`
3. Check Redis connection: `docker exec adventure-redis redis-cli ping`
4. Review error messages carefully

---

## 📝 Reporting Issues

If you find bugs, document:
1. **What you did** (exact curl command or steps)
2. **What you expected** (expected response)
3. **What you got** (actual response/error)
4. **Service logs** (`docker compose logs auth-service`)

---

## 🚀 Next Steps

After validation:
1. **Document test results** → `docs/sprints/SPRINT_3_VALIDATION.md`
2. **Fix critical bugs** (if any)
3. **Proceed to Phase 2** → Sprint 4 Lite (RBAC + User Profiles)

---

## 📚 Additional Resources

- **Auth Service README**: `services/auth-service/README.md`
- **API Documentation**: See README for detailed endpoint specs
- **Docker Compose**: `docker-compose.yml`
- **Environment Config**: `services/auth-service/.env.example`

---

**Version**: 1.0
**Last Updated**: October 23, 2025
**Status**: Phase 1 - Quick Testing & Validation
