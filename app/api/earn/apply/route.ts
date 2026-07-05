import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for partner application
const partnerApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  upiId: z.string().regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Please enter a valid UPI ID'),
  code: z.string().regex(/^[A-Z0-9]+$/, 'Coupon code can only contain letters and numbers').min(4, 'Coupon code must be at least 4 characters').max(20, 'Coupon code must not exceed 20 characters')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = partnerApplicationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'UPI ID not found', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fullName, phoneNumber, email, upiId, code } = result.data;

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    let userId;
    let referralId;

    if (existingUser) {
      // User exists, check if they already have a referral
      const existingReferral = await prisma.referral.findUnique({
        where: { userId: existingUser.id }
      });

      if (existingReferral) {
        return NextResponse.json(
          { error: 'You already have a referral code. Please check your dashboard.' },
          { status: 409 }
        );
      }

      // Update existing user to PARTNER role
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'PARTNER'
        }
      });

      userId = updatedUser.id;

      // Create referral for existing user and attach UPI ID
      const referral = await prisma.referral.create({
        data: {
          userId: userId,
          code: code.toUpperCase(),
          status: 'PENDING',
          upiId: upiId
        }
      });

      referralId = referral.id;
    } else {
      // Create new user (Added empty passwordHash to satisfy Prisma)
      const newUser = await prisma.user.create({
        data: {
          name: fullName,
          email: email.toLowerCase(),
          phone: phoneNumber,
          role: 'PARTNER',
          status: 'active',
          passwordHash: '' 
        }
      });

      userId = newUser.id;

      // Create referral for new user and attach UPI ID
      const referral = await prisma.referral.create({
        data: {
          userId: userId,
          code: code.toUpperCase(),
          status: 'PENDING',
          upiId: upiId,
        }
      });

      referralId = referral.id;
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. Please wait for approval.',
      referralId
    }, { status: 201 });

  } catch (error: unknown) {
    const err = error as unknown & { code?: string; meta?: { target?: string[] } };
    console.error('Partner application error:', err);

    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('email')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      if (err.meta?.target?.includes('code')) {
        return NextResponse.json(
          { error: 'This coupon code is already taken. Please choose another.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}