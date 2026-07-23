import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest';

export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    user: undefined,
    intern: undefined,
    ...overrides,
  };
}

export function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
  return res;
}

export function createMockNext(): NextFunction {
  return vi.fn();
}

export function resetMocks(): void {
  vi.clearAllMocks();
}

export function setupVisitCreationMocks(): void {
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
  const { prisma } = vi.hoisted(() => import('../config/prisma'));
  prisma.visit.create.mockResolvedValue(mockVisit);
  prisma.visit.findFirst.mockResolvedValue(null);
  prisma.visit.findUnique.mockResolvedValue(mockVisit);
}

export function setupInternCreationMocks(): void {
  const { prisma } = vi.hoisted(() => import('../config/prisma'));
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

export function setupInternAssignmentMocks(): void {
  const { prisma } = vi.hoisted(() => import('../config/prisma'));
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