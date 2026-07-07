// backend/src/services/token-payment.service.ts  (NEW FILE)

import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { Prisma } from '@prisma/client';

// Helper function to handle referral invite when a code is used
async function handleReferralInvite(code: string) {
  const upperCode = code.toUpperCase().trim();

  // Check if it's a referral code (ends with 500)
  if (upperCode.endsWith('500')) {
    const referral = await prisma.referral.findFirst({
      where: {
        code: upperCode,
        status: 'APPROVED',
      },
    });

    if (referral) {
      // Increment the invite count
      await prisma.referral.update({
        where: { id: referral.id },
        data: { invites: { increment: 1 } },
      });
    }
  }
}

// Exported function to handle referral invitation (for use in controllers)
export async function trackReferralInvite(code: string) {
  await handleReferralInvite(code);
}

// Helper function to handle successful referral confirmation (when payment is approved/confirmed)
async function handleReferralConfirmation(code: string) {
  const upperCode = code.toUpperCase().trim();

  // Check if it's a referral code (ends with 500)
  if (upperCode.endsWith('500')) {
    const referral = await prisma.referral.findFirst({
      where: {
        code: upperCode,
        status: 'APPROVED',
      },
    });

    if (referral) {
      // Increment successful conversions and add earnings (₹500 commission)
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          successful: { increment: 1 },
          earnings: { increment: 500 }
        },
      });
    }
  }
}

// Exported function to handle referral confirmation (for use in controllers)
export async function trackReferralConfirmation(code: string) {
  await handleReferralConfirmation(code);
}

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

  // Create the token payment
  const payment = await prisma.tokenPayment.create({
    data: { studentId, propertyId, amount: tokenAmount, utrNumber, appliedCode },
    include: { property: { select: { id: true, title: true } } },
  });

  // If a referral code was applied, increment the referral's invite count
  if (appliedCode) {
    await trackReferralInvite(appliedCode);
  }

  return payment;
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
      appliedCode: true,
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
          owner: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
      student: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ─── Admin: get all token payments ───────────────────────────────────────────
export async function getAllTokenPayments(status?: string) {
  if (status) {
    const trimmed = status.trim().toLowerCase();
    if (["pending", "approved", "rejected"].includes(trimmed)) {
      return await prisma.tokenPayment.findMany({
        where: { status: trimmed as "pending" | "approved" | "rejected" },
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
    } else {
      // Invalid status value, return empty array.
      return [];
    }
  }

  // No status filter, return all.
  return await prisma.tokenPayment.findMany({
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

  const updatedPayment = await prisma.tokenPayment.update({
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

  // If the payment was approved and had a referral code, update referral stats
  if (action === "approved" && payment.appliedCode) {
    // Referral commission is ₹500 (same as the discount amount)
    await trackReferralConfirmation(payment.appliedCode);
  }

  // Increment coupon usage if a coupon code was applied and payment was approved
  if (action === "approved" && payment.appliedCode) {
    try {
      await prisma.coupon.update({
        where: { code: payment.appliedCode },
        data: { currentUses: { increment: 1 } }
      });
    } catch (err) {
      console.error('Error incrementing coupon usage:', err);
      // Don't fail the payment processing if coupon increment fails
    }
  }

  return updatedPayment;
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