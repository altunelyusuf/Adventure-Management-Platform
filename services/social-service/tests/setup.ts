/**
 * Jest test setup file
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SOCIAL_SERVICE_PORT = '3006';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_USER = 'test_user';
process.env.POSTGRES_PASSWORD = 'test_pass';
process.env.POSTGRES_DB = 'test_db';
process.env.POSTGRES_SSL = 'false';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '4';
process.env.JWT_ACCESS_SECRET = 'test-secret';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
