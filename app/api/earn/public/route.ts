import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const generateReferralSchema = z.object({
  prefix: z.string()
    .min(2, 'Prefix must be at least 2 characters')
    .max(10, 'Prefix must not exceed 10 characters')
    .regex(/^[A-Za-z]+$/, 'Prefix must contain only letters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().optional(),
  upiId: z.string().regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Please enter a valid UPI ID'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = generateReferralSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { prefix, name, college, upiId } = result.data;
    const referralCode = `${prefix.toUpperCase()}500`;

    // Run this in a Prisma Transaction so it's bulletproof
    const newReferral = await prisma.$transaction(async (tx) => {
      // 1. Check if referral code already exists
      const existingReferral = await tx.referral.findUnique({
        where: { code: referralCode },
      });

      if (existingReferral) {
        throw new Error('CODE_EXISTS');
      }

      // 2. Create ghost user with a GUARANTEED unique email
      const ghostUser = await tx.user.create({
        data: {
          name: name,
          email: `${prefix.toLowerCase()}-${Date.now()}@livinggopartner.in`,
          role: 'PARTNER',
          passwordHash: '', // Ghost users don't need passwords
          status: 'active',
          university: college || null, // Capture the college data!
        },
      });

      // 3. Create referral with APPROVED status
      const referral = await tx.referral.create({
        data: {
          userId: ghostUser.id,
          code: referralCode,
          status: 'APPROVED',
          upiId: upiId,
        },
      });

      return referral;
    });

    return NextResponse.json({
      success: true,
      message: 'Referral code generated successfully',
      referralCode: newReferral.code,
    }, { status: 201 });

 } catch (error: unknown) {
    console.error('Referral generation error:', error);
    
    const errMessage = error instanceof Error ? error.message : '';

    // Catch our custom transaction error
    if (errMessage === 'CODE_EXISTS') {
      return NextResponse.json(
        { error: 'This referral code is already taken. Please choose a different prefix.' },
        { status: 409 }
      );
    }

    // Instead of a generic 500, return the actual message so we know if Prisma is mad
    return NextResponse.json(
      { error: errMessage || 'An unexpected database error occurred.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}