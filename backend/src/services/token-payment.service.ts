// backend/src/services/token-payment.service.ts  (NEW FILE)

import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

// ─── Student: submit token payment ───────────────────────────────────────────
export async function createTokenPayment(studentId: string, propertyId: string, utrNumber: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, price: true, status: true, title: true },
  });

  if (!property) throw new AppError("Property not found", 404);
  if (property.status !== "approved") throw new AppError("Property is not available for booking", 400);

  // Check for existing pending/approved payment for this student+property
  const existing = await prisma.tokenPayment.findUnique({
    where: { studentId_propertyId: { studentId, propertyId } },
  });
  if (existing) {
    if (existing.status === "approved") throw new AppError("You have already locked this property", 400);
    if (existing.status === "pending") throw new AppError("Your payment is already under review", 400);
    // If rejected, allow re-submission — update the record
    return prisma.tokenPayment.update({
      where: { id: existing.id },
      data: { utrNumber, status: "pending", updatedAt: new Date() },
      include: { property: { select: { id: true, title: true } } },
    });
  }

  const tokenAmount = Math.ceil(property.price / 2); // half monthly rent

  return prisma.tokenPayment.create({
    data: { studentId, propertyId, amount: tokenAmount, utrNumber },
    include: { property: { select: { id: true, title: true } } },
  });
}

// ─── Student: get their token payments ───────────────────────────────────────
export async function getStudentTokenPayments(studentId: string) {
  return prisma.tokenPayment.findMany({
    where: { studentId },
    select: {
      id: true,
      amount: true,
      status: true,
      visitOtp: true,
      visitVerified: true,
      rentSettled: true,
      moveInRequested: true,
      createdAt: true,
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
          owner: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ─── Admin: get all token payments ───────────────────────────────────────────
export async function getAllTokenPayments(status?: string) {
  return prisma.tokenPayment.findMany({
    where: status ? { status: status as "pending" | "approved" | "rejected" } : undefined,
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          owner: { select: { id: true, name: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin: approve or reject a token payment ────────────────────────────────
export async function moderateTokenPayment(id: string, action: "approved" | "rejected") {
  const payment = await prisma.tokenPayment.findUnique({ where: { id } });
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status !== "pending") throw new AppError("Payment has already been reviewed", 400);

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  return prisma.tokenPayment.update({
    where: { id },
    data: { 
      status: action,
      ...(action === "approved"
      ? {
          visitOtp: otp,
        }
      : {}),
     },
    
    include: {
      student: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
    },
  });
}

// ─── Owner: get token payments for their properties ───────────────────────────
export async function getOwnerTokenPayments(ownerId: string) {
  return prisma.tokenPayment.findMany({
    where: { property: { ownerId } },
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
      property: { select: { id: true, title: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function verifyVisit(
  paymentId: string,
  otp: string
) {
  const payment = await prisma.tokenPayment.findUnique({
    where: { id: paymentId }
  });

  if (!payment)
    throw new AppError("Payment not found", 404);

  if (payment.visitOtp !== otp)
    throw new AppError("Invalid OTP", 400);

  return prisma.tokenPayment.update({
    where: { id: paymentId },
    data: {
      visitVerified: true
    }
  });
}

export async function settleRent(
  paymentId: string
) {
  const payment = await prisma.tokenPayment.findUnique({
    where: { id: paymentId }
  });

  if (!payment)
    throw new AppError("Payment not found", 404);

  const updated = await prisma.tokenPayment.update({
    where: { id: paymentId },
    data: {
      rentSettled: true
    }
  });

  await prisma.tenantResidence.upsert({
    where: {
      studentId: payment.studentId
    },
    update: {
      propertyId: payment.propertyId
    },
    create: {
      studentId: payment.studentId,
      propertyId: payment.propertyId
    }
  });

  return updated;
}

export async function requestMoveIn(
  paymentId: string
) {

  return prisma.tokenPayment.update({

    where: {
      id: paymentId
    },

    data: {
      moveInRequested: true
    }

  });

}

export async function getOwnerPendingVisits(ownerId: string) {
  return prisma.tokenPayment.findMany({
    where: {
      property: {
        ownerId,
      },
      status: "approved",
      visitVerified: false,
    },

    include: {
      student: true,
      property: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function verifyVisitOtp(
  paymentId: string,
  otp: string
) {
  const payment = await prisma.tokenPayment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new AppError("Booking not found", 404);
  }

  if (payment.visitVerified) {
    throw new AppError("Visit already verified", 400);
  }

  if (payment.visitOtp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  return prisma.tokenPayment.update({
    where: {
      id: paymentId,
    },
    data: {
      visitVerified: true,
      visitOtp: null, // OTP destroyed after successful verification
    },
  });
}