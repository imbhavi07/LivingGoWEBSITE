"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCoupon = exports.deleteCoupon = exports.updateCoupon = exports.getCouponById = exports.getCoupons = exports.createCoupon = void 0;
const coupon_service_1 = require("../services/coupon.service");
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const prisma_1 = require("../config/prisma");
const couponService = new coupon_service_1.CouponService();
/**
 * @desc    Create a new coupon
 * @route   POST /api/admin/coupons
 * @access  Private (Super Admin only)
 */
exports.createCoupon = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, data: coupon });
});
/**
 * @desc    Get all coupons
 * @route   GET /api/admin/coupons
 * @access  Private (Super Admin only)
 */
exports.getCoupons = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 100000 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const coupons = await couponService.getCoupons(skip, Number(limit));
    const total = await prisma_1.prisma.coupon.count();
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
exports.getCouponById = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const coupon = await couponService.getCouponById(req.params.id);
    res.status(200).json({ success: true, data: coupon });
});
/**
 * @desc    Update coupon
 * @route   PUT /api/admin/coupons/:id
 * @access  Private (Super Admin only)
 */
exports.updateCoupon = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    res.status(200).json({ success: true, data: coupon });
});
/**
 * @desc    Delete coupon
 * @route   DELETE /api/admin/coupons/:id
 * @access  Private (Super Admin only)
 */
exports.deleteCoupon = (0, async_handler_1.asyncHandler)(async (req, res) => {
    await couponService.deleteCoupon(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
/**
 * @desc    Validate and apply coupon or referral code
 * @route   POST /api/coupons/apply
 * @access  Public
 */
exports.applyCoupon = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { code, purchaseAmount } = req.body;
    if (!code || typeof purchaseAmount !== 'number' || purchaseAmount < 0) {
        throw new app_error_1.AppError('Please provide coupon code and purchase amount', 400);
    }
    const upperCode = code.toUpperCase().trim();
    // Check if it's a referral code (ends with 500)
    if (upperCode.endsWith('500')) {
        const referral = await prisma_1.prisma.referral.findFirst({
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
