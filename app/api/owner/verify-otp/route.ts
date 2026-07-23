import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Please Sign-in First 😉' }, { status: 401 });
  }

  try {
    const { paymentId, otp } = await request.json();

    if (!paymentId || !otp) {
      return NextResponse.json({ error: 'Missing paymentId or otp' }, { status: 400 });
    }

    const payment = await prisma.tokenPayment.findUnique({
      where: {
        id: paymentId,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.visitOtp !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    await prisma.tokenPayment.update({
      where: { id: paymentId },
      data: { visitVerified: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}