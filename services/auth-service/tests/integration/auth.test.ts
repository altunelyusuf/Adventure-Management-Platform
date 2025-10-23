import request from 'supertest';
import app from '../../src/index';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/models';

describe('Auth Service Integration Tests', () => {
  let testUserId: string;
  let accessToken: string;
  let refreshToken: string;

  // Setup: Initialize database before all tests
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  // Cleanup: Close database after all tests
  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  // Clean up test data after each test
  afterEach(async () => {
    if (testUserId) {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.delete({ id: testUserId });
      testUserId = '';
    }
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'TestPass123!',
          username: 'testuser123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email', 'testuser@example.com');
      expect(response.body).toHaveProperty('username', 'testuser123');
      expect(response.body).toHaveProperty('verificationRequired', true);
      expect(response.body).toHaveProperty('message');

      testUserId = response.body.userId;
    });

    it('should reject registration with existing email', async () => {
      // Register first user
      const firstResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPass123!',
          username: 'user1',
        });

      testUserId = firstResponse.body.userId;

      // Try to register second user with same email
      const secondResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPass123!',
          username: 'user2',
        });

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body).toHaveProperty('error');
      expect(secondResponse.body.message).toContain('already registered');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'weakpass@example.com',
          password: 'weak',
          username: 'weakuser',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!',
          username: 'testuser',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register and verify a test user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'logintest@example.com',
          password: 'TestPass123!',
          username: 'logintest',
        });

      testUserId = registerResponse.body.userId;

      // Manually verify email (bypass email verification in tests)
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update(
        { id: testUserId },
        { emailVerified: true, verificationToken: null }
      );
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn', 900);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('userId');
      expect(response.body.user).toHaveProperty('email', 'logintest@example.com');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
      // Register, verify, and login to get tokens
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'refreshtest@example.com',
          password: 'TestPass123!',
          username: 'refreshtest',
        });

      testUserId = registerResponse.body.userId;

      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update(
        { id: testUserId },
        { emailVerified: true, verificationToken: null }
      );

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'refreshtest@example.com',
          password: 'TestPass123!',
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn', 900);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid_token',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    beforeEach(async () => {
      // Register, verify, and login to get access token
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'metest@example.com',
          password: 'TestPass123!',
          username: 'metest',
        });

      testUserId = registerResponse.body.userId;

      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update(
        { id: testUserId },
        { emailVerified: true, verificationToken: null }
      );

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'metest@example.com',
          password: 'TestPass123!',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should get current user info with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email', 'metest@example.com');
      expect(response.body).toHaveProperty('role');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/v1/auth/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'auth-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
