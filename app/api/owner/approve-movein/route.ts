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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
    }

    const payment = await prisma.tokenPayment.findUnique({
      where: {
        id,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update the payment to mark rent as settled
    await prisma.tokenPayment.update({
      where: { id },
      data: { rentSettled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving move-in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}