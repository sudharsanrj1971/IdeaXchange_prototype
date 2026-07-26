const request = require('supertest');

// Mock mongoose completely to run test offline
const mockConnection = {
  readyState: 1,
  on: jest.fn(),
  close: jest.fn().mockResolvedValue(true),
};

jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(() => {
    return {
      index: jest.fn(),
      statics: {},
      methods: {},
      pre: jest.fn()
    };
  });
  mockSchema.Types = {
    ObjectId: 'ObjectId'
  };
  return {
    connect: jest.fn().mockResolvedValue(true),
    connection: mockConnection,
    Schema: mockSchema,
    model: jest.fn().mockImplementation(() => {
      return {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      };
    }),
  };
});

const mongoose = require('mongoose');

// Mock connectDB to avoid real MongoDB connection
jest.mock('../config/db', () => ({
  connectDB: jest.fn().mockResolvedValue(true)
}));

// Mock initFirebase to avoid base64 service account validation
jest.mock('../config/firebase', () => ({
  initFirebase: jest.fn().mockReturnValue({}),
  admin: {
    auth: () => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'mock-uid', email: 'test@example.com' })
    })
  }
}));

// Mock ioredis to return PONG health status
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn().mockResolvedValue('PONG'),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK')
    };
  });
});

describe('Production Hardening Smoke Tests', () => {
  let app;
  let serverInstance;
  
  beforeAll(async () => {
    // Setup test environment variables
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'supersecretjwtkeythatislongenough123!';
    process.env.PLATFORM_SIGNING_KEY = 'supersecretplatformsigningkeythatislongenough123!';
    process.env.RAFT_INTERNAL_SECRET = 'raftsecret1234567';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/ideaxchange-test';
    
    // Dynamically require to ensure environment validation runs
    require('../config/envValidator').validateEnv();
    const imports = require('../index');
    app = imports.app;
    serverInstance = imports.server;
  });

  afterAll(async () => {
    if (serverInstance) {
      await new Promise(resolve => serverInstance.close(resolve));
    }
    await mongoose.connection.close();
  });

  it('should deny access to api with no CSRF token', async () => {
    const response = await request(app)
      .post('/api/auth/session')
      .send({ idToken: 'some-firebase-token' });
    expect(response.status).toBe(403); // CSRF failed
    expect(response.body.error.message).toBe('Invalid or missing CSRF token');
  });

  it('should return 200 on /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('checks');
    expect(response.body.checks.mongodb.status).toBe('healthy');
    expect(response.body.checks.redis.status).toBe('healthy');
  });
});
