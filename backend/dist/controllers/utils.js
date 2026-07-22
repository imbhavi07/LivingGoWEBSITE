"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockRequest = createMockRequest;
exports.createMockResponse = createMockResponse;
exports.createMockNext = createMockNext;
exports.resetMocks = resetMocks;
exports.setupVisitCreationMocks = setupVisitCreationMocks;
exports.setupInternCreationMocks = setupInternCreationMocks;
exports.setupInternAssignmentMocks = setupInternAssignmentMocks;
const vitest_1 = require("vitest");
function createMockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        user: undefined,
        intern: undefined,
        ...overrides,
    };
}
function createMockResponse() {
    const res = {
        status: vitest_1.vi.fn().mockReturnThis(),
        json: vitest_1.vi.fn().mockReturnThis(),
        send: vitest_1.vi.fn().mockReturnThis(),
        cookie: vitest_1.vi.fn().mockReturnThis(),
        clearCookie: vitest_1.vi.fn().mockReturnThis(),
    };
    return res;
}
function createMockNext() {
    return vitest_1.vi.fn();
}
function resetMocks() {
    vitest_1.vi.clearAllMocks();
}
function setupVisitCreationMocks() {
    const mockVisit = {
        id: 'visit-123',
        tokenId: 'VISIT-ABC123',
        studentId: 'user-123',
        propertyId: 'property-123',
        visitDate: new Date('2025-01-15T10:00:00Z'),
        timeSlot: '10:00 AM - 10:20 AM',
        visitOtp: '1234',
        couponCode: null,
        whatsappNumber: '+919876543210',
        visitOtpVerified: false,
        leadStatus: 'SCHEDULED',
        isLocked: false,
        assignedLeadId: null,
        referralCounted: false,
        student: {
            id: 'user-123',
            name: 'Test Student',
            email: 'student@test.com',
            phone: '+919876543210',
        },
        property: {
            id: 'property-123',
            propertyCode: 'PROP-001',
            title: 'Test Property',
            location: 'Test Location',
            price: 10000,
            owner: {
                name: 'Property Owner',
                phone: '+919999999999',
            },
        },
    };
    // Mock prisma.visit.create to return our mock visit
    const { prisma } = vitest_1.vi.hoisted(() => import('../config/prisma'));
    prisma.visit.create.mockResolvedValue(mockVisit);
    prisma.visit.findFirst.mockResolvedValue(null);
    prisma.visit.findUnique.mockResolvedValue(mockVisit);
}
function setupInternCreationMocks() {
    const { prisma } = vitest_1.vi.hoisted(() => import('../config/prisma'));
    prisma.intern.create.mockResolvedValue({
        id: 'intern-123',
        name: 'New Intern',
        phone: '+919876543210',
        username: 'INT123456',
        passwordHash: 'hashed-password',
        active: true,
        supervisorId: 'supervisor-123',
    });
    prisma.intern.findUnique.mockResolvedValue(null);
}
function setupInternAssignmentMocks() {
    const { prisma } = vitest_1.vi.hoisted(() => import('../config/prisma'));
    prisma.visit.findUnique.mockResolvedValue({
        id: 'visit-123',
        tokenId: 'VISIT-ABC123',
        studentId: 'user-123',
        propertyId: 'property-123',
        visitDate: new Date('2025-01-15T10:00:00Z'),
        timeSlot: '10:00 AM - 10:20 AM',
        visitOtp: '1234',
        leadStatus: 'SCHEDULED',
        student: {
            id: 'user-123',
            name: 'Test Student',
            email: 'student@test.com',
            phone: '+919876543210',
        },
        property: {
            id: 'property-123',
            propertyCode: 'PROP-001',
            title: 'Test Property',
            location: 'Test Location',
            price: 10000,
            owner: {
                name: 'Property Owner',
                phone: '+919999999999',
            },
        },
    });
    prisma.intern.findUnique.mockResolvedValue({
        id: 'intern-123',
        name: 'Test Intern',
        phone: '+919876543210',
        username: 'INT123456',
    });
}
