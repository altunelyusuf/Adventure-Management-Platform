// Test setup file
// Runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_USER = 'adventure_user';
process.env.POSTGRES_PASSWORD = 'adventure_pass';
process.env.POSTGRES_DB = 'adventure_platform_test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
