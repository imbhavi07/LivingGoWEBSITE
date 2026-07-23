import { vi, beforeEach, afterEach } from 'vitest';

// Mock all external dependencies
vi.mock('../config/prisma', () => ({
  prisma: {
    visit: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    intern: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    property: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    coupon: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    referral: {
      findFirst: vi.fn(),
    },
    emailOtp: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../services/whatsapp.service', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../queues/whatsapp.queue', () => ({
  queueVisitCreated: vi.fn().mockResolvedValue({ id: 'job-1' }),
  queueInternAssigned: vi.fn().mockResolvedValue({ id: 'job-2' }),
  queueGuideAssignedStudent: vi.fn().mockResolvedValue({ id: 'job-3' }),
  queueWelcomeJourney: vi.fn().mockResolvedValue({ id: 'job-4' }),
  queueVisitOtpSent: vi.fn().mockResolvedValue({ id: 'job-5' }),
}));

vi.mock('../config/redis', () => ({
  createRedisConnection: vi.fn(() => ({})),
}));

vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'job-id' }),
    close: vi.fn(),
  })),
  Worker: vi.fn(),
}));

vi.mock('../utils/jwt', () => ({
  signJwt: vi.fn(() => 'test-jwt-token'),
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => Buffer.from('abc123')),
  randomInt: vi.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
}));

vi.mock('@prisma/client', () => ({
  Role: {
    STUDENT: 'STUDENT',
    INTERN: 'INTERN',
    OWNER: 'OWNER',
    SUPERVISOR: 'SUPERVISOR',
    ADMIN: 'ADMIN',
  },
}));

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.RESEND_API_KEY = 'test-key';
process.env.EMAIL_FROM = 'test@test.com';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:5000/api';