import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // Find the referral
    const referral = await prisma.referral.findUnique({
      where: { code: upperCode },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral code not found' },
        { status: 404 }
      );
    }

    // Find all token payments where appliedCode matches this referral code
    // Note: We added appliedCode field to TokenPayment model
    const payments = await prisma.tokenPayment.findMany({
      where: {
        appliedCode: upperCode,
      },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        status: true,
        student: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Build the ledger
    const ledger = payments.map((payment: { createdAt: Date; status: string; student: { name: string } | null }) => ({
      date: payment.createdAt,
      name: payment.student?.name || 'Anonymous',
      amount: 500, // Fixed ₹500 per referral
      status: payment.status,
    }));

    return NextResponse.json({
      referralCode: referral.code,
      referrerName: referral.user?.name || 'Unknown',
      totalEarnings: referral.earnings,
      totalInvites: referral.invites,
      successfulConversions: referral.successful,
      ledger,
    });
  } catch (error: unknown) {
    console.error('Error fetching referral tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}