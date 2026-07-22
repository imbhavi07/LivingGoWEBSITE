"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock all external dependencies
vitest_1.vi.mock('../config/prisma', () => ({
    prisma: {
        visit: {
            findFirst: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            updateMany: vitest_1.vi.fn(),
        },
        intern: {
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            delete: vitest_1.vi.fn(),
        },
        property: {
            findUnique: vitest_1.vi.fn(),
        },
        user: {
            findUnique: vitest_1.vi.fn(),
        },
        coupon: {
            findFirst: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
        },
        referral: {
            findFirst: vitest_1.vi.fn(),
        },
        emailOtp: {
            create: vitest_1.vi.fn(),
            findFirst: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
        },
        $transaction: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('../services/whatsapp.service', () => ({
    sendWhatsAppMessage: vitest_1.vi.fn().mockResolvedValue({ success: true }),
}));
vitest_1.vi.mock('../queues/whatsapp.queue', () => ({
    queueVisitCreated: vitest_1.vi.fn().mockResolvedValue({ id: 'job-1' }),
    queueInternAssigned: vitest_1.vi.fn().mockResolvedValue({ id: 'job-2' }),
    queueGuideAssignedStudent: vitest_1.vi.fn().mockResolvedValue({ id: 'job-3' }),
    queueWelcomeJourney: vitest_1.vi.fn().mockResolvedValue({ id: 'job-4' }),
    queueVisitOtpSent: vitest_1.vi.fn().mockResolvedValue({ id: 'job-5' }),
}));
vitest_1.vi.mock('../config/redis', () => ({
    createRedisConnection: vitest_1.vi.fn(() => ({})),
}));
vitest_1.vi.mock('bullmq', () => ({
    Queue: vitest_1.vi.fn().mockImplementation(() => ({
        add: vitest_1.vi.fn().mockResolvedValue({ id: 'job-id' }),
        close: vitest_1.vi.fn(),
    })),
    Worker: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../utils/jwt', () => ({
    signJwt: vitest_1.vi.fn(() => 'test-jwt-token'),
}));
vitest_1.vi.mock('bcryptjs', () => ({
    hash: vitest_1.vi.fn().mockResolvedValue('hashed-password'),
    compare: vitest_1.vi.fn().mockResolvedValue(true),
}));
vitest_1.vi.mock('crypto', () => ({
    randomBytes: vitest_1.vi.fn(() => Buffer.from('abc123')),
    randomInt: vitest_1.vi.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
}));
vitest_1.vi.mock('@prisma/client', () => ({
    Role: {
        STUDENT: 'STUDENT',
        INTERN: 'INTERN',
        OWNER: 'OWNER',
        SUPERVISOR: 'SUPERVISOR',
        ADMIN: 'ADMIN',
    },
}));
// Global test setup
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
});
(0, vitest_1.afterEach)(() => {
    vitest_1.vi.resetAllMocks();
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
