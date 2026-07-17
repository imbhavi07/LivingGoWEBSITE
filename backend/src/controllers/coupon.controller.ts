import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';
import { prisma } from "../config/prisma";

const couponService = new CouponService();

/**
 * @desc    Create a new coupon
 * @route   POST /api/admin/coupons
 * @access  Private (Super Admin only)
 */
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json({ success: true, data: coupon });
});

/**
 * @desc    Get all coupons
 * @route   GET /api/admin/coupons
 * @access  Private (Super Admin only)
 */
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 100000 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  const coupons = await couponService.getCoupons(skip, Number(limit));
  const total = await prisma.coupon.count();
  
  res.status(200).json({
    success: true,
    count: coupons.length,
    total,
    data: coupons
  });
});

/**
 * @desc    Get single coupon
 * @route   GET /api/admin/coupons/:id
 * @access  Private (Super Admin only)
 */
export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id as string);
  res.status(200).json({ success: true, data: coupon });
});

/**
 * @desc    Update coupon
 * @route   PUT /api/admin/coupons/:id
 * @access  Private (Super Admin only)
 */
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
  res.status(200).json({ success: true, data: coupon });
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/admin/coupons/:id
 * @access  Private (Super Admin only)
 */
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await couponService.deleteCoupon(req.params.id as string);
  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Validate and apply coupon or referral code
 * @route   POST /api/coupons/apply
 * @access  Public
 */
export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, purchaseAmount } = req.body;

  if (!code || typeof purchaseAmount !== 'number' || purchaseAmount < 0) {
    throw new AppError('Please provide coupon code and purchase amount', 400);
  }

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
      // Apply flat ₹500 discount
      const discountAmount = Math.min(500, purchaseAmount);
      const finalAmount = Math.max(0, purchaseAmount - discountAmount);

      // Optionally, you could increment referral usage here if needed
      // await prisma.referral.update({
      //   where: { id: referral.id },
      //   data: { successful: { increment: 1 }, earnings: { increment: discountAmount } },
      // });

      return res.status(200).json({
        success: true,
        data: {
          code: upperCode,
          discountAmount,
          finalAmount,
          discountType: 'FLAT',
          discountValue: 500,
          isReferral: true,
        },
      });
    }
    // If not a valid referral, fall through to coupon check
  }

  // Otherwise, treat as a regular coupon
  const result = await couponService.applyCoupon(upperCode, purchaseAmount);
  res.status(200).json({ success: true, data: result });
});
