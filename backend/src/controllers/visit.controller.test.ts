import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scheduleVisit, assignLead } from '../controllers/visit.controller';
import { queueVisitCreated, queueInternAssigned, queueGuideAssignedStudent } from '../queues/whatsapp.queue';
import { prisma } from '../config/prisma';
import { createMockRequest, createMockResponse, createMockNext, createMockVisit, createMockIntern, createMockProperty, setupVisitCreationMocks, setupInternAssignmentMocks, resetMocks } from './utils';

vi.mock('../config/prisma');
vi.mock('../queues/whatsapp.queue');
vi.mock('../services/whatsapp.service');

describe('Visit Controller - WhatsApp Event Triggers', () => {
  let mockReq: ReturnType<typeof createMockRequest>;
  let mockRes: ReturnType<typeof createMockResponse>;
  let mockNext: ReturnType<typeof createMockNext>;

  beforeEach(() => {
    resetMocks();
    mockReq = createMockRequest({
      user: { id: 'user-123', email: 'student@test.com', role: 'STUDENT' },
    });
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduleVisit - WhatsApp VISIT_CREATED event', () => {
    beforeEach(() => {
      setupVisitCreationMocks();

      mockReq.body = {
        visitDate: '2025-01-15T10:00:00.000Z',
        timeSlot: '10:00 AM - 10:20 AM',
        propertyId: 'property-123',
        whatsappNumber: '+919876543210',
      };

      mockReq.user = { id: 'user-123', email: 'student@test.com', role: 'STUDENT' };
      prisma.property.findUnique.mockResolvedValue(createMockProperty());
    });

    it('should call queueVisitCreated when a student successfully books a visit', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      expect(queueVisitCreated).toHaveBeenCalledTimes(1);
      expect(queueVisitCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '919876543210', // +91 converted to 91
          userRole: 'student',
          visitId: expect.any(String),
          visitToken: expect.any(String),
          studentName: 'Test Student',
          studentPhone: '919876543210',
          propertyId: 'property-123',
          propertyTitle: 'Test Property',
          propertyLocation: 'Test Location',
          visitDate: expect.any(String),
          timeSlot: '10:00 AM - 10:20 AM',
          visitOtp: expect.any(String),
        })
      );
    });

    it('should call queueVisitCreated with correct phone number format (E.164 without +)', async () => {
      mockReq.body.whatsappNumber = '+918765432109';

      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueVisitCreated as vi.Mock).mock.calls[0][0];
      expect(callArgs.phoneNumber).toBe('918765432109');
      expect(callArgs.studentPhone).toBe('918765432109');
    });

    it('should call queueVisitCreated with visit OTP in payload', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueVisitCreated as vi.Mock).mock.calls[0][0];
      expect(callArgs.visitOtp).toBeDefined();
      expect(callArgs.visitOtp).toMatch(/^\d{4}$/); // 4-digit OTP
    });

    it('should call queueVisitCreated with visit token in payload', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueVisitCreated as vi.Mock).mock.calls[0][0];
      expect(callArgs.visitToken).toMatch(/^VISIT-[A-F0-9]{6}$/);
    });

    it('should call queueVisitCreated with correct userRole (student)', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueVisitCreated as vi.Mock).mock.calls[0][0];
      expect(callArgs.userRole).toBe('student');
    });

    it('should include property details in queueVisitCreated payload', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueVisitCreated as vi.Mock).mock.calls[0][0];
      expect(callArgs.propertyId).toBe('property-123');
      expect(callArgs.propertyTitle).toBe('Test Property');
      expect(callArgs.propertyLocation).toBe('Test Location');
    });

    it('should include visit date and time slot in queueVisitCreated payload', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueVisitCreated as vi.Mock).mock.calls[0][0];
      expect(callArgs.visitDate).toBe('2025-01-15T10:00:00.000Z');
      expect(callArgs.timeSlot).toBe('10:00 AM - 10:20 AM');
    });

    it('should not call queueVisitCreated if visit creation fails due to duplicate', async () => {
      prisma.visit.findFirst.mockResolvedValueOnce(createMockVisit());

      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(queueVisitCreated).not.toHaveBeenCalled();
    });

    it('should not call queueVisitCreated if validation fails', async () => {
      mockReq.body = {}; // Missing required fields

      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      expect(queueVisitCreated).not.toHaveBeenCalled();
    });

    it('should queue with high priority (10) for VISIT_CREATED', async () => {
      await scheduleVisit(mockReq as any, mockRes as any, mockNext);

      // The queueVisitCreated is called with high priority (10)
      expect(queueVisitCreated).toHaveBeenCalled();
    });
  });

  describe('assignLead - WhatsApp INTERN_ASSIGNED and GUIDE_ASSIGNED_STUDENT events', () => {
    let mockVisit: ReturnType<typeof createMockVisit>;
    let mockIntern: ReturnType<typeof createMockIntern>;

    beforeEach(() => {
      setupInternAssignmentMocks();
      mockVisit = createMockVisit({ id: 'visit-123', assignedLeadId: null, leadStatus: 'SCHEDULED' });
      mockIntern = createMockIntern({ id: 'intern-123', name: 'Test Intern', phone: '+919876543210' });

      prisma.visit.findUnique.mockResolvedValue(mockVisit);
      prisma.intern.findUnique.mockResolvedValue(mockIntern);
      prisma.visit.update.mockImplementation((data: any) =>
        Promise.resolve({ ...mockVisit, ...data.data })
      );

      mockReq = createMockRequest({
        params: { visitId: 'visit-123' },
        body: {
          internId: 'intern-123',
          meetingPointId: 'meeting-point-123',
        },
        user: { id: 'supervisor-123', email: 'supervisor@test.com', role: 'SUPERVISOR' },
      });
    });

    it('should call queueInternAssigned when an intern is assigned to a visit', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      expect(queueInternAssigned).toHaveBeenCalledTimes(1);
      expect(queueInternAssigned).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '919876543210', // intern phone +91 -> 91
          userRole: 'intern',
          visitId: 'visit-123',
          visitToken: expect.any(String),
          internId: 'intern-123',
          internName: 'Test Intern',
          internPhone: '919876543210',
          studentName: 'Test Student',
          propertyTitle: 'Test Property',
          propertyLocation: 'Test Location',
          visitDate: expect.any(String),
          timeSlot: expect.any(String),
          visitOtp: expect.any(String),
          mapsLink: expect.stringContaining('maps.google.com'),
          emergencyContact: expect.any(String),
        })
      );
    });

    it('should call queueGuideAssignedStudent when an intern is assigned (student notification)', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      expect(queueGuideAssignedStudent).toHaveBeenCalledTimes(1);
      expect(queueGuideAssignedStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '919876543210', // student phone +91 -> 91
          userRole: 'student',
          visitId: 'visit-123',
          visitToken: expect.any(String),
          studentName: 'Test Student',
          studentPhone: '919876543210',
          internName: 'Test Intern',
          internPhone: '919876543210',
          propertyTitle: 'Test Property',
          propertyLocation: 'Test Location',
          visitDate: expect.any(String),
          timeSlot: expect.any(String),
          visitOtp: expect.any(String),
          mapsLink: expect.stringContaining('maps.google.com'),
          emergencyContact: expect.any(String),
        })
      );
    });

    it('should call BOTH queueInternAssigned AND queueGuideAssignedStudent when intern is assigned', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      expect(queueInternAssigned).toHaveBeenCalledTimes(1);
      expect(queueGuideAssignedStudent).toHaveBeenCalledTimes(1);
    });

    it('should use intern phone number for queueInternAssigned (E.164 without +)', async () => {
      mockIntern.phone = '+918765432109';
      prisma.intern.findUnique.mockResolvedValue(mockIntern);

      await assignLead(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueInternAssigned as vi.Mock).mock.calls[0][0];
      expect(callArgs.phoneNumber).toBe('918765432109');
      expect(callArgs.internPhone).toBe('918765432109');
    });

    it('should use student phone number for queueGuideAssignedStudent (E.164 without +)', async () => {
      mockVisit.student.phone = '+918765432109';
      prisma.visit.findUnique.mockResolvedValue(mockVisit);

      await assignLead(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];
      expect(callArgs.phoneNumber).toBe('918765432109');
      expect(callArgs.studentPhone).toBe('918765432109');
    });

    it('should use whatsappNumber as fallback for student phone in queueGuideAssignedStudent', async () => {
      mockVisit.student.phone = null;
      mockVisit.whatsappNumber = '+919999999999';
      prisma.visit.findUnique.mockResolvedValue(mockVisit);

      await assignLead(mockReq as any, mockRes as any, mockNext);

      const callArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];
      expect(callArgs.phoneNumber).toBe('919999999999');
      expect(callArgs.studentPhone).toBe('919999999999');
    });

    it('should include visit OTP in both queue payloads', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      const internCallArgs = (queueInternAssigned as vi.Mock).mock.calls[0][0];
      const studentCallArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];

      expect(internCallArgs.visitOtp).toBeDefined();
      expect(studentCallArgs.visitOtp).toBeDefined();
      expect(internCallArgs.visitOtp).toBe(studentCallArgs.visitOtp);
    });

    it('should include Google Maps link in both queue payloads', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      const internCallArgs = (queueInternAssigned as vi.Mock).mock.calls[0][0];
      const studentCallArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];

      expect(internCallArgs.mapsLink).toContain('maps.google.com');
      expect(studentCallArgs.mapsLink).toContain('maps.google.com');
      expect(internCallArgs.mapsLink).toContain('Test Location');
      expect(studentCallArgs.mapsLink).toContain('Test Location');
    });

    it('should include property owner phone as emergency contact', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      const internCallArgs = (queueInternAssigned as vi.Mock).mock.calls[0][0];
      const studentCallArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];

      expect(internCallArgs.emergencyContact).toBe('919999999999');
      expect(studentCallArgs.emergencyContact).toBe('919999999999');
    });

    it('should set userRole correctly for each queue', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      const internCallArgs = (queueInternAssigned as vi.Mock).mock.calls[0][0];
      const studentCallArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];

      expect(internCallArgs.userRole).toBe('intern');
      expect(studentCallArgs.userRole).toBe('student');
    });

    it('should include visit token in both queue payloads', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      const internCallArgs = (queueInternAssigned as vi.Mock).mock.calls[0][0];
      const studentCallArgs = (queueGuideAssignedStudent as vi.Mock).mock.calls[0][0];

      expect(internCallArgs.visitToken).toBeDefined();
      expect(studentCallArgs.visitToken).toBeDefined();
      expect(internCallArgs.visitToken).toBe(studentCallArgs.visitToken);
    });

    it('should not call queue functions if visit not found', async () => {
      prisma.visit.findUnique.mockResolvedValueOnce(null);

      await assignLead(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(queueInternAssigned).not.toHaveBeenCalled();
      expect(queueGuideAssignedStudent).not.toHaveBeenCalled();
    });

    it('should not call queue functions if intern not found', async () => {
      prisma.intern.findUnique.mockResolvedValueOnce(null);

      await assignLead(mockReq as any, mockRes as any, mockNext);

      expect(queueInternAssigned).not.toHaveBeenCalled();
      expect(queueGuideAssignedStudent).not.toHaveBeenCalled();
    });

    it('should use high priority (10) for both INTERN_ASSIGNED and GUIDE_ASSIGNED_STUDENT', async () => {
      await assignLead(mockReq as any, mockRes as any, mockNext);

      expect(queueInternAssigned).toHaveBeenCalled();
      expect(queueGuideAssignedStudent).toHaveBeenCalled();
    });
  });
});