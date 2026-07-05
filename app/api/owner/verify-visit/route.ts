import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, otp } = body;

    if (!paymentId || !otp) {
      return NextResponse.json({ error: 'Payment ID and OTP are required' }, { status: 400 });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    // Find the payment and verify ownership
    const payment = await prisma.tokenPayment.findUnique({
      where: { id: paymentId },
      include: {
        property: {
          select: {
            ownerId: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Security check: Ensure the logged-in user owns the property
    if (payment.property.ownerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to verify this visit' }, { status: 403 });
    }

    // Check if OTP matches
    if (payment.visitOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Update the payment to mark visit as verified
    await prisma.tokenPayment.update({
      where: { id: paymentId },
      data: {
        visitVerified: true
      }
    });

    return NextResponse.json({ success: true, message: 'Visit verified successfully' });

  } catch (error: unknown) {
    console.error('Verify Visit Error:', error);
    return NextResponse.json({ error: 'Failed to verify visit' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}