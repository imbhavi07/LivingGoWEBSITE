// backend/src/services/token-payment.service.ts  (NEW FILE)

import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { Prisma } from '@prisma/client';

// ─── Student: submit token payment ───────────────────────────────────────────
export async function createTokenPayment(studentId: string, propertyId: string, utrNumber: string, appliedCode?: string) {
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
      data: { utrNumber, status: "pending", updatedAt: new Date(), appliedCode: appliedCode || undefined },
      include: { property: { select: { id: true, title: true } } },
    });
  }

  const tokenAmount = Math.ceil(property.price / 2); // half monthly rent

  return prisma.tokenPayment.create({
    data: { studentId, propertyId, amount: tokenAmount, utrNumber, appliedCode },
    include: { property: { select: { id: true, title: true } } },
  });
}

// ─── Student: get their token payments ───────────────────────────────────────
export async function getStudentTokenPayments(studentId: string) {
  return await prisma.tokenPayment.findMany({
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
  return await prisma.tokenPayment.findMany({
    where: status ? { status: status as "pending" | "approved" | "rejected" } : undefined,
    select: {
      id: true,
      amount: true,
      utrNumber: true,
      status: true,
      visitOtp: true,
      visitVerified: true,
      rentSettled: true,
      moveInRequested: true,
      createdAt: true,
      appliedCode: true,
      student: { select: { id: true, name: true, email: true, phone: true } },
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
          },
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

  return await prisma.tokenPayment.update({
    where: { id },
    data: {
      status: action,
      ...(action === "approved" ? { visitOtp: otp } : {}),
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
    },
  });
}

// ─── Owner: get token payments for their properties ───────────────────────────
export async function getOwnerTokenPayments(ownerId: string) {
  return await prisma.tokenPayment.findMany({
    where: { property: { ownerId } },
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
      property: { select: { id: true, title: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestMoveIn(paymentId: string) {
  const payment = await prisma.tokenPayment.findUnique({
    where: { id: paymentId }
  });
  if (!payment)
    throw new AppError("Booking not found", 404);
  if (!payment.visitVerified)
    throw new AppError("Visit not verified", 400);
  if (payment.moveInRequested)
    throw new AppError("Already requested", 400);
  return await prisma.tokenPayment.update({
    where: { id: paymentId },
    data: {
      moveInRequested: true
    }
  });
}

export async function getOwnerPendingVisits(ownerId: string) {
  return await prisma.tokenPayment.findMany({
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
  return await prisma.tokenPayment.update({
    where: {
      id: paymentId,
    },
    data: {
      visitVerified: true,
      visitOtp: null, // OTP destroyed after successful verification
    },
  });
}

export async function approveMoveIn(
  paymentId: string
) {
  const payment = await prisma.tokenPayment.findUnique({
    where:{
      id:paymentId
    },
    include:{
      property:true
    }
  });
  if(!payment)
    throw new AppError("Payment not found",404);
  if(!payment.visitVerified)
    throw new AppError("Visit not verified",400);
  if(!payment.moveInRequested)
    throw new AppError("Move-in not requested",400);
    const totalBeds =
      (payment.property.bedsSingle ?? 0) +
      (payment.property.bedsDouble ?? 0) +
      (payment.property.bedsTriple ?? 0);

    if (payment.property.occupiedBeds >= totalBeds)
      throw new AppError("Property Full",400);

  return await prisma.$transaction(async(tx: Prisma.TransactionClient)=>{

      await tx.tokenPayment.update({

          where:{
              id:paymentId
          },

          data:{
              rentSettled:true
          }

      });

      await tx.tenantResidence.upsert({

          where:{
              studentId:payment.studentId
          },

          update:{
              propertyId:payment.propertyId
          },

          create:{
              propertyId:payment.propertyId,
              studentId:payment.studentId
          }

      });

        await tx.property.update({
          where: {
            id: payment.propertyId,
          },
          data: {
            occupiedBeds: {
              increment: 1,
            },
          },
        });

      return {
          success:true
      };

  });

}

export async function getOwnerTenants(ownerId: string) {

  return await prisma.tenantResidence.findMany({

    where: {

      property: {

        ownerId

      }

    },

    include: {

      student: {

        select: {

          id: true,

          name: true,

          email: true,

          phone: true

        }

      },

      property: {

        select: {

          id: true,

          title: true,

          occupiedBeds: true,

          bedsSingle: true,

          bedsDouble: true,

          bedsTriple: true

        }

      }

    },

    orderBy: {

      createdAt: "desc"

    }

  });

}
