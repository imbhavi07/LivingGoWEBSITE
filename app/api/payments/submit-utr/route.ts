import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, amount, utrNumber, appliedCode } = body;

    if (!propertyId || !amount || !utrNumber) {
      return NextResponse.json({ error: 'Missing required payment details.' }, { status: 400 });
    }

    // Generate a random 6-digit OTP for visit verification
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const payment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Save or Update the Token Payment
      const tokenPayment = await tx.tokenPayment.upsert({
        where: {
          studentId_propertyId: {
            studentId: userId,
            propertyId: propertyId,
          }
        },
        update: {
          amount: amount,
          utrNumber: utrNumber,
          appliedCode: appliedCode || null,
          status: 'pending', // Resets to pending if they update the UTR
          // Do NOT update visitOtp here - preserve the original OTP if resubmitting UTR
        },
        create: {
          studentId: userId,
          propertyId: propertyId,
          amount: amount,
          utrNumber: utrNumber,
          appliedCode: appliedCode || null,
          status: 'pending',
          visitOtp: generatedOtp, // Set the OTP when creating a new payment record
        }
      });

      // 2. Increment Super Admin Coupon Usage (if a coupon was used)
      if (appliedCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: appliedCode } });
        if (coupon) {
          await tx.coupon.update({
            where: { code: appliedCode },
            data: { currentUses: { increment: 1 } }
          });
        }
        // Note: We don't increment Referral earnings here yet.
        // We only pay the peer AFTER the admin verifies the UTR!
      }

      return tokenPayment;
    });

    return NextResponse.json({ success: true, payment });

  } catch (error: unknown) {
    console.error('Submit UTR Error:', error);
    return NextResponse.json({ error: 'Failed to record transaction.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}