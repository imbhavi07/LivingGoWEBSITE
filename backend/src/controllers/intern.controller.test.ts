import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createIntern as createInternController } from '../controllers/intern.controller';
import { queueWelcomeJourney } from '../queues';
import { prisma } from '../config/prisma';
import { createMockRequest, createMockResponse, createMockNext, setupInternCreationMocks, resetMocks } from './utils';

vi.mock('../config/prisma');
vi.mock('../queues');

describe('Intern Controller - WhatsApp Event Triggers', () => {
  let mockReq: ReturnType<typeof createMockRequest>;
  let mockRes: ReturnType<typeof createMockResponse>;
  let mockNext: ReturnType<typeof createMockNext>;

  beforeEach(() => {
    resetMocks();
    setupInternCreationMocks();

    mockReq = createMockRequest({
      body: {
        name: 'New Intern',
        phone: '+919876543210',
        password: 'securePassword123',
      },
      user: { id: 'supervisor-123', email: 'supervisor@test.com', role: 'SUPERVISOR' },
    });

    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createIntern - WhatsApp WELCOME_JOURNEY event', () => {
    it('should call queueWelcomeJourney when a new intern is successfully created', async () => {
      await createInternController(mockReq as any, mockRes as any, mockNext);

      expect(queueWelcomeJourney).toHaveBeenCalledTimes(1);
      expect(queueWelcomeJourney).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '919876543210', // +91 converted to 91
          userRole: 'intern',
          step: 'WELCOME',
          studentName: 'New Intern',
          studentPhone: '919876543210',
        })
      );
    });

    it('should call queueWelcomeJourney with correct intern phone number format (E.164 without +)', async () => {
      mockReq.body.phone = '+918765432109';

      await createInternController(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueWelcomeJourney as vi.Mock).mock.calls[0][0];
      expect(callArgs.phoneNumber).toBe('918765432109');
      expect(callArgs.studentPhone).toBe('918765432109');
    });

    it('should call queueWelcomeJourney with step WELCOME for new intern onboarding', async () => {
      await createInternController(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueWelcomeJourney as vi.Mock).mock.calls[0][0];
      expect(callArgs.step).toBe('WELCOME');
      expect(callArgs.userRole).toBe('intern');
    });

    it('should still call queueWelcomeJourney even if the queue fails (fire-and-forget)', async () => {
      (queueWelcomeJourney as vi.Mock).mockRejectedValueOnce(new Error('Queue connection failed'));

      await createInternController(mockReq as any, mockRes as any, mockNext);

      // Controller should not throw, queue failure is caught internally
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          intern: expect.any(Object),
        })
      );
    });

    it('should not call queueWelcomeJourney if intern creation fails', async () => {
      prisma.intern.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(createInternController(mockReq as any, mockRes as any, mockNext)).rejects.toThrow();

      expect(queueWelcomeJourney).not.toHaveBeenCalled();
    });

    it('should not call queueWelcomeJourney if required fields are missing', async () => {
      mockReq.body = { name: 'Test' }; // Missing phone and password

      await createInternController(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(queueWelcomeJourney).not.toHaveBeenCalled();
    });

    it('should include the newly created intern name in welcome message payload', async () => {
      const customName = 'John Doe Intern';
      mockReq.body.name = customName;

      await createInternController(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueWelcomeJourney as vi.Mock).mock.calls[0][0];
      expect(callArgs.studentName).toBe(customName);
    });
  });
});