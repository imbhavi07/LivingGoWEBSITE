import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Please Sign-in First 😉' }, { status: 401 });
    }

    // 1. CRITICAL FIX: Find the internal user record
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Profile Does Not Exist 😭' }, { status: 404 });
    }

    const body = await request.json();
    const { propertyId, amount, utrNumber, appliedCode } = body;

    if (!propertyId || !amount || !utrNumber) {
      return NextResponse.json({ error: 'Missing required payment details.' }, { status: 400 });
    }

    // Generate a random 6-digit OTP for visit verification
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const payment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 2. Save or Update the Token Payment using INTERNAL user.id
      const tokenPayment = await tx.tokenPayment.upsert({
        where: {
          studentId_propertyId: {
            studentId: user.id, // <-- FIX: using internal cuid
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
          studentId: user.id, // <-- FIX: using internal cuid
          propertyId: propertyId,
          amount: amount,
          utrNumber: utrNumber,
          appliedCode: appliedCode || null,
          status: 'pending',
          visitOtp: generatedOtp, // Set the OTP when creating a new payment record
        }
      });

      // 3. Increment Super Admin Coupon Usage (if a coupon was used)
      if (appliedCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: appliedCode } });
        if (coupon) {
          await tx.coupon.update({
            where: { code: appliedCode },
            data: { currentUses: { increment: 1 } }
          });
        }
      }

      return tokenPayment;
    });

    return NextResponse.json({ success: true, payment });

  } catch (error: unknown) {
    console.error('Submit UTR Error:', error);
    return NextResponse.json({ error: 'Network Error on your end. Try Again!!' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}