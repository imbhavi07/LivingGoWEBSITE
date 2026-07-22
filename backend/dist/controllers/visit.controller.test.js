"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const visit_controller_1 = require("../controllers/visit.controller");
const whatsapp_queue_1 = require("../queues/whatsapp.queue");
const prisma_1 = require("../config/prisma");
const utils_1 = require("./utils");
vitest_1.vi.mock('../config/prisma');
vitest_1.vi.mock('../queues/whatsapp.queue');
vitest_1.vi.mock('../services/whatsapp.service');
(0, vitest_1.describe)('Visit Controller - WhatsApp Event Triggers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    (0, vitest_1.beforeEach)(() => {
        (0, utils_1.resetMocks)();
        mockReq = (0, utils_1.createMockRequest)({
            user: { id: 'user-123', email: 'student@test.com', role: 'STUDENT' },
        });
        mockRes = (0, utils_1.createMockResponse)();
        mockNext = (0, utils_1.createMockNext)();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('scheduleVisit - WhatsApp VISIT_CREATED event', () => {
        (0, vitest_1.beforeEach)(() => {
            (0, utils_1.setupVisitCreationMocks)();
            mockReq.body = {
                visitDate: '2025-01-15T10:00:00.000Z',
                timeSlot: '10:00 AM - 10:20 AM',
                propertyId: 'property-123',
                whatsappNumber: '+919876543210',
            };
            mockReq.user = { id: 'user-123', email: 'student@test.com', role: 'STUDENT' };
            prisma_1.prisma.property.findUnique.mockResolvedValue((0, utils_1.createMockProperty)());
        });
        (0, vitest_1.it)('should call queueVisitCreated when a student successfully books a visit', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueVisitCreated).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(whatsapp_queue_1.queueVisitCreated).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                phoneNumber: '919876543210', // +91 converted to 91
                userRole: 'student',
                visitId: vitest_1.expect.any(String),
                visitToken: vitest_1.expect.any(String),
                studentName: 'Test Student',
                studentPhone: '919876543210',
                propertyId: 'property-123',
                propertyTitle: 'Test Property',
                propertyLocation: 'Test Location',
                visitDate: vitest_1.expect.any(String),
                timeSlot: '10:00 AM - 10:20 AM',
                visitOtp: vitest_1.expect.any(String),
            }));
        });
        (0, vitest_1.it)('should call queueVisitCreated with correct phone number format (E.164 without +)', async () => {
            mockReq.body.whatsappNumber = '+918765432109';
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueVisitCreated.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.phoneNumber).toBe('918765432109');
            (0, vitest_1.expect)(callArgs.studentPhone).toBe('918765432109');
        });
        (0, vitest_1.it)('should call queueVisitCreated with visit OTP in payload', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueVisitCreated.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.visitOtp).toBeDefined();
            (0, vitest_1.expect)(callArgs.visitOtp).toMatch(/^\d{4}$/); // 4-digit OTP
        });
        (0, vitest_1.it)('should call queueVisitCreated with visit token in payload', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueVisitCreated.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.visitToken).toMatch(/^VISIT-[A-F0-9]{6}$/);
        });
        (0, vitest_1.it)('should call queueVisitCreated with correct userRole (student)', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueVisitCreated.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.userRole).toBe('student');
        });
        (0, vitest_1.it)('should include property details in queueVisitCreated payload', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueVisitCreated.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.propertyId).toBe('property-123');
            (0, vitest_1.expect)(callArgs.propertyTitle).toBe('Test Property');
            (0, vitest_1.expect)(callArgs.propertyLocation).toBe('Test Location');
        });
        (0, vitest_1.it)('should include visit date and time slot in queueVisitCreated payload', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueVisitCreated.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.visitDate).toBe('2025-01-15T10:00:00.000Z');
            (0, vitest_1.expect)(callArgs.timeSlot).toBe('10:00 AM - 10:20 AM');
        });
        (0, vitest_1.it)('should not call queueVisitCreated if visit creation fails due to duplicate', async () => {
            prisma_1.prisma.visit.findFirst.mockResolvedValueOnce((0, utils_1.createMockVisit)());
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(mockRes.status).toHaveBeenCalledWith(400);
            (0, vitest_1.expect)(whatsapp_queue_1.queueVisitCreated).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should not call queueVisitCreated if validation fails', async () => {
            mockReq.body = {}; // Missing required fields
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueVisitCreated).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should queue with high priority (10) for VISIT_CREATED', async () => {
            await (0, visit_controller_1.scheduleVisit)(mockReq, mockRes, mockNext);
            // The queueVisitCreated is called with high priority (10)
            (0, vitest_1.expect)(whatsapp_queue_1.queueVisitCreated).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('assignLead - WhatsApp INTERN_ASSIGNED and GUIDE_ASSIGNED_STUDENT events', () => {
        let mockVisit;
        let mockIntern;
        (0, vitest_1.beforeEach)(() => {
            (0, utils_1.setupInternAssignmentMocks)();
            mockVisit = (0, utils_1.createMockVisit)({ id: 'visit-123', assignedLeadId: null, leadStatus: 'SCHEDULED' });
            mockIntern = (0, utils_1.createMockIntern)({ id: 'intern-123', name: 'Test Intern', phone: '+919876543210' });
            prisma_1.prisma.visit.findUnique.mockResolvedValue(mockVisit);
            prisma_1.prisma.intern.findUnique.mockResolvedValue(mockIntern);
            prisma_1.prisma.visit.update.mockImplementation((data) => Promise.resolve({ ...mockVisit, ...data.data }));
            mockReq = (0, utils_1.createMockRequest)({
                params: { visitId: 'visit-123' },
                body: {
                    internId: 'intern-123',
                    meetingPointId: 'meeting-point-123',
                },
                user: { id: 'supervisor-123', email: 'supervisor@test.com', role: 'SUPERVISOR' },
            });
        });
        (0, vitest_1.it)('should call queueInternAssigned when an intern is assigned to a visit', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueInternAssigned).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(whatsapp_queue_1.queueInternAssigned).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                phoneNumber: '919876543210', // intern phone +91 -> 91
                userRole: 'intern',
                visitId: 'visit-123',
                visitToken: vitest_1.expect.any(String),
                internId: 'intern-123',
                internName: 'Test Intern',
                internPhone: '919876543210',
                studentName: 'Test Student',
                propertyTitle: 'Test Property',
                propertyLocation: 'Test Location',
                visitDate: vitest_1.expect.any(String),
                timeSlot: vitest_1.expect.any(String),
                visitOtp: vitest_1.expect.any(String),
                mapsLink: vitest_1.expect.stringContaining('maps.google.com'),
                emergencyContact: vitest_1.expect.any(String),
            }));
        });
        (0, vitest_1.it)('should call queueGuideAssignedStudent when an intern is assigned (student notification)', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueGuideAssignedStudent).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(whatsapp_queue_1.queueGuideAssignedStudent).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                phoneNumber: '919876543210', // student phone +91 -> 91
                userRole: 'student',
                visitId: 'visit-123',
                visitToken: vitest_1.expect.any(String),
                studentName: 'Test Student',
                studentPhone: '919876543210',
                internName: 'Test Intern',
                internPhone: '919876543210',
                propertyTitle: 'Test Property',
                propertyLocation: 'Test Location',
                visitDate: vitest_1.expect.any(String),
                timeSlot: vitest_1.expect.any(String),
                visitOtp: vitest_1.expect.any(String),
                mapsLink: vitest_1.expect.stringContaining('maps.google.com'),
                emergencyContact: vitest_1.expect.any(String),
            }));
        });
        (0, vitest_1.it)('should call BOTH queueInternAssigned AND queueGuideAssignedStudent when intern is assigned', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueInternAssigned).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(whatsapp_queue_1.queueGuideAssignedStudent).toHaveBeenCalledTimes(1);
        });
        (0, vitest_1.it)('should use intern phone number for queueInternAssigned (E.164 without +)', async () => {
            mockIntern.phone = '+918765432109';
            prisma_1.prisma.intern.findUnique.mockResolvedValue(mockIntern);
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueInternAssigned.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.phoneNumber).toBe('918765432109');
            (0, vitest_1.expect)(callArgs.internPhone).toBe('918765432109');
        });
        (0, vitest_1.it)('should use student phone number for queueGuideAssignedStudent (E.164 without +)', async () => {
            mockVisit.student.phone = '+918765432109';
            prisma_1.prisma.visit.findUnique.mockResolvedValue(mockVisit);
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.phoneNumber).toBe('918765432109');
            (0, vitest_1.expect)(callArgs.studentPhone).toBe('918765432109');
        });
        (0, vitest_1.it)('should use whatsappNumber as fallback for student phone in queueGuideAssignedStudent', async () => {
            mockVisit.student.phone = null;
            mockVisit.whatsappNumber = '+919999999999';
            prisma_1.prisma.visit.findUnique.mockResolvedValue(mockVisit);
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const callArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(callArgs.phoneNumber).toBe('919999999999');
            (0, vitest_1.expect)(callArgs.studentPhone).toBe('919999999999');
        });
        (0, vitest_1.it)('should include visit OTP in both queue payloads', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const internCallArgs = whatsapp_queue_1.queueInternAssigned.mock.calls[0][0];
            const studentCallArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(internCallArgs.visitOtp).toBeDefined();
            (0, vitest_1.expect)(studentCallArgs.visitOtp).toBeDefined();
            (0, vitest_1.expect)(internCallArgs.visitOtp).toBe(studentCallArgs.visitOtp);
        });
        (0, vitest_1.it)('should include Google Maps link in both queue payloads', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const internCallArgs = whatsapp_queue_1.queueInternAssigned.mock.calls[0][0];
            const studentCallArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(internCallArgs.mapsLink).toContain('maps.google.com');
            (0, vitest_1.expect)(studentCallArgs.mapsLink).toContain('maps.google.com');
            (0, vitest_1.expect)(internCallArgs.mapsLink).toContain('Test Location');
            (0, vitest_1.expect)(studentCallArgs.mapsLink).toContain('Test Location');
        });
        (0, vitest_1.it)('should include property owner phone as emergency contact', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const internCallArgs = whatsapp_queue_1.queueInternAssigned.mock.calls[0][0];
            const studentCallArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(internCallArgs.emergencyContact).toBe('919999999999');
            (0, vitest_1.expect)(studentCallArgs.emergencyContact).toBe('919999999999');
        });
        (0, vitest_1.it)('should set userRole correctly for each queue', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const internCallArgs = whatsapp_queue_1.queueInternAssigned.mock.calls[0][0];
            const studentCallArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(internCallArgs.userRole).toBe('intern');
            (0, vitest_1.expect)(studentCallArgs.userRole).toBe('student');
        });
        (0, vitest_1.it)('should include visit token in both queue payloads', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            const internCallArgs = whatsapp_queue_1.queueInternAssigned.mock.calls[0][0];
            const studentCallArgs = whatsapp_queue_1.queueGuideAssignedStudent.mock.calls[0][0];
            (0, vitest_1.expect)(internCallArgs.visitToken).toBeDefined();
            (0, vitest_1.expect)(studentCallArgs.visitToken).toBeDefined();
            (0, vitest_1.expect)(internCallArgs.visitToken).toBe(studentCallArgs.visitToken);
        });
        (0, vitest_1.it)('should not call queue functions if visit not found', async () => {
            prisma_1.prisma.visit.findUnique.mockResolvedValueOnce(null);
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(mockRes.status).toHaveBeenCalledWith(404);
            (0, vitest_1.expect)(whatsapp_queue_1.queueInternAssigned).not.toHaveBeenCalled();
            (0, vitest_1.expect)(whatsapp_queue_1.queueGuideAssignedStudent).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should not call queue functions if intern not found', async () => {
            prisma_1.prisma.intern.findUnique.mockResolvedValueOnce(null);
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueInternAssigned).not.toHaveBeenCalled();
            (0, vitest_1.expect)(whatsapp_queue_1.queueGuideAssignedStudent).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should use high priority (10) for both INTERN_ASSIGNED and GUIDE_ASSIGNED_STUDENT', async () => {
            await (0, visit_controller_1.assignLead)(mockReq, mockRes, mockNext);
            (0, vitest_1.expect)(whatsapp_queue_1.queueInternAssigned).toHaveBeenCalled();
            (0, vitest_1.expect)(whatsapp_queue_1.queueGuideAssignedStudent).toHaveBeenCalled();
        });
    });
});
