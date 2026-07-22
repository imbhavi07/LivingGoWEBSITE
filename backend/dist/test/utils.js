"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPrisma = void 0;
exports.createMockRequest = createMockRequest;
exports.createMockResponse = createMockResponse;
exports.createMockNext = createMockNext;
exports.createMockVisit = createMockVisit;
exports.createMockIntern = createMockIntern;
exports.createMockProperty = createMockProperty;
exports.createMockStudent = createMockStudent;
exports.createMockSupervisor = createMockSupervisor;
exports.resetMocks = resetMocks;
exports.setupVisitCreationMocks = setupVisitCreationMocks;
exports.setupInternCreationMocks = setupInternCreationMocks;
exports.setupInternAssignmentMocks = setupInternAssignmentMocks;
const prisma_1 = require("../config/prisma");
/**
 * Creates a mock Express Request object
 */
function createMockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        user: { id: 'user-123', email: 'test@test.com', role: 'STUDENT' },
        intern: { id: 'intern-123', name: 'Test Intern', username: 'INT123456' },
        ...overrides,
    };
}
/**
 * Creates a mock Express Response object
 */
function createMockResponse() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    };
    return res;
}
/**
 * Creates a mock NextFunction
 */
function createMockNext() {
    return vi.fn();
}
/**
 * Creates a mock visit object
 */
function createMockVisit(overrides = {}) {
    return {
        id: 'visit-123',
        tokenId: 'VISIT-ABC123',
        studentId: 'user-123',
        propertyId: 'property-123',
        visitDate: new Date('2025-01-15T10:00:00Z'),
        timeSlot: '10:00 AM - 10:20 AM',
        visitOtp: '1234',
        visitOtpVerified: false,
        leadStatus: 'SCHEDULED',
        couponCode: null,
        whatsappNumber: '+919876543210',
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
        intern: null,
        ...overrides,
    };
}
/**
 * Creates a mock intern object
 */
function createMockIntern(overrides = {}) {
    return {
        id: 'intern-123',
        name: 'Test Intern',
        phone: '+919876543210',
        username: 'INT123456',
        passwordHash: 'hashed-password',
        active: true,
        supervisorId: 'supervisor-123',
        ...overrides,
    };
}
/**
 * Creates a mock property object
 */
function createMockProperty(overrides = {}) {
    return {
        id: 'property-123',
        propertyCode: 'PROP-001',
        title: 'Test Property',
        location: 'Test Location, City',
        price: 15000,
        owner: {
            id: 'owner-123',
            name: 'Property Owner',
            phone: '+919999999999',
        },
        ...overrides,
    };
}
/**
 * Creates a mock student/user object
 */
function createMockStudent(overrides = {}) {
    return {
        id: 'user-123',
        name: 'Test Student',
        email: 'student@test.com',
        phone: '+919876543210',
        role: 'STUDENT',
        ...overrides,
    };
}
/**
 * Creates a mock supervisor/user object
 */
function createMockSupervisor(overrides = {}) {
    return {
        id: 'supervisor-123',
        name: 'Supervisor',
        email: 'supervisor@test.com',
        role: 'SUPERVISOR',
        ...overrides,
    };
}
/**
 * Mock Prisma client for testing
 */
exports.mockPrisma = prisma_1.prisma;
/**
 * Reset all mocks
 */
function resetMocks() {
    vi.clearAllMocks();
}
/**
 * Setup successful visit creation mocks
 */
function setupVisitCreationMocks() {
    exports.mockPrisma.visit.findFirst.mockResolvedValue(null);
    exports.mockPrisma.visit.create.mockImplementation((data) => Promise.resolve(createMockVisit({ ...data.data, id: 'visit-123' })));
    exports.mockPrisma.coupon.findFirst.mockResolvedValue(null);
    exports.mockPrisma.referral.findFirst.mockResolvedValue(null);
}
/**
 * Setup intern creation mocks
 */
function setupInternCreationMocks() {
    exports.mockPrisma.intern.create.mockImplementation((data) => Promise.resolve(createMockIntern({ ...data.data, id: 'intern-123' })));
}
/**
 * Setup intern assignment mocks
 */
function setupInternAssignmentMocks() {
    const mockVisit = createMockVisit({
        id: 'visit-123',
        assignedLeadId: null,
        leadStatus: 'SCHEDULED',
    });
    exports.mockPrisma.visit.findUnique.mockResolvedValue(mockVisit);
    exports.mockPrisma.visit.update.mockImplementation((data) => Promise.resolve({ ...mockVisit, ...data.data }));
    exports.mockPrisma.intern.findUnique.mockResolvedValue(createMockIntern());
}
