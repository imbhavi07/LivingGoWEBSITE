import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/app-error';

const prisma = new PrismaClient();

export class CouponService {
  async createCoupon(data: {
    code: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    value: number;
    validFrom: Date;
    validTo: Date;
    targetPlans: string[];
    isActive?: boolean;
    maxUses?: number;
    affiliateId?: string;
  }) {
    // Validate input
    if (!data.code || data.code.trim() === '') {
      throw new AppError('Coupon code is required', 400);
    }
    
    if (data.value <= 0) {
      throw new AppError('Coupon value must be greater than 0', 400);
    }
    
    if (data.validFrom >= data.validTo) {
      throw new AppError('validFrom must be before validTo', 400);
    }
    
    // Convert code to uppercase
    const upperCaseCode = data.code.toUpperCase().trim();
    
    // Check if coupon already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: upperCaseCode }
    });
    
    if (existingCoupon) {
      throw new AppError('Coupon code already exists', 409);
    }

    return await prisma.coupon.create({
      data: {
        code: upperCaseCode,
        discountType: data.discountType,
        value: data.value,
        validFrom: data.validFrom,
        validTo: data.validTo,
        targetPlans: data.targetPlans,
        isActive: data.isActive ?? true,
        maxUses: data.maxUses,
        affiliateId: data.affiliateId,
        currentUses: 0
      }
    });
  }

  async getCoupons(skip = 0, take = 50) {
    return await prisma.coupon.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCouponById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });
    
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    
    return coupon;
  }

  async updateCoupon(id: string, data: Partial<{
    code: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    value: number;
    validFrom: Date;
    validTo: Date;
    targetPlans: string[];
    isActive: boolean;
    maxUses: number;
    affiliateId: string;
  }>) {
    // Check if coupon exists
    await this.getCouponById(id);
    
    // Validate input if provided
    if (data.code !== undefined) {
      if (!data.code || data.code.trim() === '') {
        throw new AppError('Coupon code is required', 400);
      }
      
      // Check if another coupon with this code exists
      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          code: data.code.toUpperCase().trim(),
          NOT: { id }
        }
      });
      
      if (existingCoupon) {
        throw new AppError('Coupon code already exists', 409);
      }
      
      data.code = data.code.toUpperCase().trim();
    }
    
    if (data.value !== undefined && data.value <= 0) {
      throw new AppError('Coupon value must be greater than 0', 400);
    }
    
    if (data.validFrom !== undefined && data.validTo !== undefined && data.validFrom >= data.validTo) {
      throw new AppError('validFrom must be before validTo', 400);
    }
    
    // Update coupon
    return await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.validFrom !== undefined && { validFrom: data.validFrom }),
        ...(data.validTo !== undefined && { validTo: data.validTo }),
        ...(data.targetPlans !== undefined && { targetPlans: data.targetPlans }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.affiliateId !== undefined && { affiliateId: data.affiliateId })
      }
    });
  }

  async deleteCoupon(id: string) {
    // Check if coupon exists
    await this.getCouponById(id);
    
    return await prisma.coupon.delete({
      where: { id }
    });
  }

  async validateCoupon(code: string) {
    if (!code || code.trim() === '') {
      throw new AppError('Coupon code is required', 400);
    }
    
    const upperCaseCode = code.toUpperCase().trim();
    const now = new Date();
    
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: upperCaseCode,
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now }
      }
    });
    
    if (!coupon) {
      throw new AppError('Invalid or expired coupon', 400);
    }
    
    // Check usage limits
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      throw new AppError('Coupon usage limit exceeded', 400);
    }
    
    return coupon;
  }

  async applyCoupon(code: string, purchaseAmount: number) {
    const coupon = await this.validateCoupon(code);
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'FIXED') {
      discountAmount = Math.min(coupon.value, purchaseAmount);
    } else if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.min(purchaseAmount * (coupon.value / 100), purchaseAmount);
    }
    
    const finalAmount = Math.max(0, purchaseAmount - discountAmount);
    
    // Increment usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        currentUses: { increment: 1 }
      }
    });
    
    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      finalAmount,
      discountType: coupon.discountType,
      discountValue: coupon.value
    };
  }

  async incrementCouponUsage(id: string) {
    return await prisma.coupon.update({
      where: { id },
      data: {
        currentUses: { increment: 1 }
      }
    });
  }
}
