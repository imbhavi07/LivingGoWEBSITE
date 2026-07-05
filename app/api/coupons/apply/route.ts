import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { code, purchaseAmount } = await request.json(); // purchaseAmount is the 50% Token

    if (!code || !purchaseAmount) {
      return NextResponse.json({ error: 'Code and amount are required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();

    // 1. Check if it's a Peer Referral Code first
    const referral = await prisma.referral.findUnique({
      where: { code: normalizedCode },
    });

    if (referral) {
      if (referral.status !== 'APPROVED') {
        return NextResponse.json({ error: 'This referral code is inactive' }, { status: 400 });
      }
      
      // Fixed logic: Referrals always give a ₹500 flat discount
      const discountAmount = Math.min(500, purchaseAmount * 0.9); // Cap discount at 90% of token
      return NextResponse.json({
        success: true,
        data: { discount_amount: discountAmount, type: 'REFERRAL' }
      });
    }

    // 2. If not a referral, check if it's a Super Admin Coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }

    if (!coupon.isActive || new Date() < coupon.validFrom || new Date() > coupon.validTo) {
      return NextResponse.json({ error: 'This coupon is currently inactive or expired' }, { status: 400 });
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    // 3. Calculate Super Admin Discount Logic
    let discountAmount = 0;
    
    // UPDATED LOGIC: Both FLAT and FIXED act as direct subtractions from the total
    if (coupon.discountType === 'FLAT' || coupon.discountType === 'FIXED') {
      discountAmount = coupon.value;
    } else if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor(purchaseAmount * (coupon.value / 100));
    }

    // Safety net: Never allow a discount to make the token 0 or negative
    const safeDiscount = Math.min(discountAmount, purchaseAmount * 0.99); // Max 99% off

    return NextResponse.json({
      success: true,
      data: { discount_amount: safeDiscount, type: 'COUPON', couponId: coupon.id }
    });

  } catch (error) {
    console.error('Coupon evaluation error:', error);
    return NextResponse.json({ error: 'Failed to apply code' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}