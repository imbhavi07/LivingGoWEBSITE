"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const intern_controller_1 = require("../controllers/intern.controller");
const queues_1 = require("../queues");
const prisma_1 = require("../config/prisma");
const utils_1 = require("./utils");
vitest_1.vi.mock('../config/prisma');
vitest_1.vi.mock('../queues');
(0, vitest_1.describe)('Intern Controller - WhatsApp Event Triggers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    (0, vitest_1.beforeEach)(() => {
        (0, utils_1.resetMocks)();
        (0, utils_1.setupInternCreationMocks)();
        mockReq = (0, utils_1.createMockRequest)({
            body: {
                name: 'New Intern',
                phone: '+919876543210',
                password: 'securePassword123',
            },
            user: { id: 'supervisor-123', email: 'supervisor@test.com', role: 'SUPERVISOR' },
        });
        mockRes = (0, utils_1.createMockResponse)();
        mockNext = (0, utils_1.createMockNext)();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('createIntern - WhatsApp WELCOME_JOURNEY event', () => {
        (0, vitest_1.it)('should call queueWelcomeJourney when a new intern is successfully created', async () => {
            await (0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(queues_1.queueWelcomeJourney).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(queues_1.queueWelcomeJourney).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                phoneNumber: '919876543210', // +91 converted to 91
                userRole: 'intern',
                step: 'WELCOME',
                studentName: 'New Intern',
                studentPhone: '919876543210',
            }));
        });
        (0, vitest_1.it)('should call queueWelcomeJourney with correct intern phone number format (E.164 without +)', async () => {
            mockReq.body.phone = '+918765432109';
            await (0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext);
            const callArgs = queues_1.queueWelcomeJourney.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.phoneNumber).toBe('918765432109');
            (0, vitest_1.expect)(callArgs.studentPhone).toBe('918765432109');
        });
        (0, vitest_1.it)('should call queueWelcomeJourney with step WELCOME for new intern onboarding', async () => {
            await (0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext);
            const callArgs = queues_1.queueWelcomeJourney.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.step).toBe('WELCOME');
            (0, vitest_1.expect)(callArgs.userRole).toBe('intern');
        });
        (0, vitest_1.it)('should still call queueWelcomeJourney even if the queue fails (fire-and-forget)', async () => {
            queues_1.queueWelcomeJourney.mockRejectedValueOnce(new Error('Queue connection failed'));
            await (0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext);
            // Controller should not throw, queue failure is caught internally
            (0, vitest_1.expect)(mockRes.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                success: true,
                intern: vitest_1.expect.any(Object),
            }));
        });
        (0, vitest_1.it)('should not call queueWelcomeJourney if intern creation fails', async () => {
            prisma_1.prisma.intern.create.mockRejectedValueOnce(new Error('Database error'));
            await (0, vitest_1.expect)((0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext)).rejects.toThrow();
            (0, vitest_1.expect)(queues_1.queueWelcomeJourney).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should not call queueWelcomeJourney if required fields are missing', async () => {
            mockReq.body = { name: 'Test' }; // Missing phone and password
            await (0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(mockRes.status).toHaveBeenCalledWith(400);
            (0, vitest_1.expect)(queues_1.queueWelcomeJourney).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should include the newly created intern name in welcome message payload', async () => {
            const customName = 'John Doe Intern';
            mockReq.body.name = customName;
            await (0, intern_controller_1.createIntern)(mockReq, mockRes, mockNext);
            const callArgs = queues_1.queueWelcomeJourney.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.studentName).toBe(customName);
        });
    });
});
