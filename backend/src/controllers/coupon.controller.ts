import { Request, Response } from "express";
import { PrismaClient, Prisma, CouponStatus } from "@prisma/client";
import {
  createSystemCouponSchema,
  approveCouponRequestSchema,
  requestCustomCouponSchema,
  applyCouponSchema,
} from "../validations/coupon.schemas";

const prisma = new PrismaClient();

// ============================================================================
// POST /api/admin/coupons
// Super Admin only (gated by requireSuperAdmin middleware upstream).
// Creates a brand-new SYSTEM coupon, ACTIVE immediately.
// ============================================================================
export async function createSystemCoupon(req: Request, res: Response) {
  const parsed = createSystemCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }
  const input = parsed.data;

  const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
  if (existing) {
    return res.status(409).json({ error: "CODE_TAKEN", message: `Code ${input.code} already exists.` });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: input.code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      maxDiscountAmount: input.maxDiscountAmount,
      minBookingAmount: input.minBookingAmount,
      applicableRoomCategories: input.applicableRoomCategories,
      firstBookingOnly: input.firstBookingOnly,
      maxTotalRedemptions: input.maxTotalRedemptions,
      maxRedemptionsPerUser: input.maxRedemptionsPerUser,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      status: CouponStatus.ACTIVE,
      ownerType: "SYSTEM",
      commissionType: input.commissionType,
      commissionValue: input.commissionValue,
      reviewedById: req.superAdminUserId,
      reviewedAt: new Date(),
    },
  });

  return res.status(201).json({ coupon });
}

// ============================================================================
// GET /api/admin/coupons/pending
// Lists the approval queue for the Super Admin dashboard.
// ============================================================================
export async function listPendingCoupons(_req: Request, res: Response) {
  const pending = await prisma.coupon.findMany({
    where: { status: CouponStatus.PENDING_APPROVAL },
    include: { requestedBy: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return res.json({ pending });
}

// ============================================================================
// POST /api/admin/coupons/review
// Super Admin approves or rejects a user-submitted custom code request.
// ============================================================================
export async function reviewCouponRequest(req: Request, res: Response) {
  const parsed = approveCouponRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }
  const { couponId, decision, overrides, rejectionReason } = parsed.data;

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || coupon.status !== CouponStatus.PENDING_APPROVAL) {
    return res.status(404).json({ error: "NOT_FOUND", message: "No pending request with that id." });
  }

  if (decision === "REJECT") {
    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        status: CouponStatus.REJECTED,
        rejectionReason,
        reviewedById: req.superAdminUserId,
        reviewedAt: new Date(),
      },
    });
    return res.json({ coupon: updated });
  }

  // APPROVE — merge admin overrides on top of the requester's proposal.
  const updated = await prisma.coupon.update({
    where: { id: couponId },
    data: {
      ...overrides,
      status: CouponStatus.ACTIVE,
      reviewedById: req.superAdminUserId,
      reviewedAt: new Date(),
    },
  });
  return res.json({ coupon: updated });
}

// ============================================================================
// POST /api/coupons/request
// Any authenticated student/creator submits a custom code for review.
// Lands in PENDING_APPROVAL — no discount/commission authority granted here.
// ============================================================================
export async function requestCustomCoupon(req: Request, res: Response) {
  const parsed = requestCustomCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }
  const input = parsed.data;
  const userId = req.authUserId!;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  const code =
    input.preferredCode ??
    `${(user.name ?? "USER").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8)}${Math.floor(
      100 + Math.random() * 900
    )}`;

  const codeTaken = await prisma.coupon.findUnique({ where: { code } });
  if (codeTaken) {
    return res.status(409).json({ error: "CODE_TAKEN", message: "Try a different preferred code." });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      // Sane placeholder validity — Super Admin sets the real terms on approval.
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: CouponStatus.PENDING_APPROVAL,
      // user.role may be a Role enum type; compare as string to avoid TS type mismatch
      ownerType: String(user.role) === "CREATOR" ? "CREATOR" : "STUDENT",
      ownerId: user.id,
      requestedById: user.id,
      requestNote: input.requestNote,
    },
  });

  return res.status(201).json({ coupon, message: "Submitted for Super Admin review." });
}

// ============================================================================
// POST /api/coupons/apply
// Public, high-frequency, price-critical. Returns the calculated reduction
// WITHOUT mutating state (redemption is only committed at booking-confirm
// time via commitCouponRedemption, to avoid burning usage on abandoned carts).
// ============================================================================
export async function applyCoupon(req: Request, res: Response) {
  const parsed = applyCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }
  const { code, roomCategory, bookingAmount, isFirstBooking } = parsed.data;
  const userId = req.authUserId; // undefined if guest is just previewing price

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || coupon.status !== CouponStatus.ACTIVE) {
    return res.status(404).json({ error: "INVALID_CODE", message: "This code is not valid." });
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return res.status(400).json({ error: "EXPIRED", message: "This code has expired." });
  }

  if (
    !coupon.applicableRoomCategories.includes("ALL") &&
    !coupon.applicableRoomCategories.includes(roomCategory)
  ) {
    return res.status(400).json({
      error: "ROOM_CATEGORY_INELIGIBLE",
      message: "This code isn't valid for the selected room category.",
    });
  }

  if (coupon.minBookingAmount && bookingAmount < Number(coupon.minBookingAmount)) {
    return res.status(400).json({
      error: "BELOW_MINIMUM",
      message: `Minimum booking amount of ₹${coupon.minBookingAmount} required.`,
    });
  }

  if (coupon.firstBookingOnly && !isFirstBooking) {
    return res.status(400).json({
      error: "NOT_FIRST_BOOKING",
      message: "This code is reserved for first-time bookings.",
    });
  }

  if (coupon.maxTotalRedemptions && coupon.currentRedemptions >= coupon.maxTotalRedemptions) {
    return res.status(400).json({ error: "REDEMPTION_LIMIT_REACHED", message: "This code is sold out." });
  }

  // --- Anti-abuse: block a referral/creator/affiliate code owner from using
  // their own code to book (self-referral). SYSTEM codes are exempt.
  if (userId && coupon.ownerType !== "SYSTEM" && coupon.ownerId === userId) {
    return res.status(400).json({
      error: "SELF_REFERRAL_BLOCKED",
      message: "You can't redeem your own referral code.",
    });
  }

  if (userId) {
    const priorUse = await prisma.couponRedemption.count({ where: { couponId: coupon.id, userId } });
    if (priorUse >= coupon.maxRedemptionsPerUser) {
      return res.status(400).json({
        error: "PER_USER_LIMIT_REACHED",
        message: "You've already used this code the maximum number of times.",
      });
    }
  }

  const discountValue = Number(coupon.discountValue);
  let discountAmount =
    coupon.discountType === "FLAT" ? discountValue : (bookingAmount * discountValue) / 100;

  if (coupon.maxDiscountAmount) {
    discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
  }
  discountAmount = Math.min(discountAmount, bookingAmount); // never discount below ₹0

  const finalAmount = Math.round((bookingAmount - discountAmount) * 100) / 100;

  return res.json({
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount,
  });
}

// ============================================================================
// commitCouponRedemption — called internally from the booking-confirmation
// flow (NOT a public route). Atomic via a single transaction + optimistic
// count guard to prevent race-condition over-redemption at high concurrency.
// ============================================================================
export async function commitCouponRedemption(
  couponId: string,
  userId: string,
  bookingId: string,
  discountApplied: number
) {
  return prisma.$transaction(async (tx) => {
    // Raw SQL conditional increment: only bumps the counter (and only
    // succeeds) if the cap hasn't been hit yet. This is the concurrency-safe
    // way to enforce maxTotalRedemptions — two simultaneous requests can't
    // both pass a separate "read count, then write" check.
    const rows = await tx.$executeRaw`
      UPDATE coupons
      SET "currentRedemptions" = "currentRedemptions" + 1
      WHERE id = ${couponId}
        AND status = 'ACTIVE'
        AND ("maxTotalRedemptions" IS NULL OR "currentRedemptions" < "maxTotalRedemptions")
    `;

    if (rows === 0) {
      throw Object.assign(new Error("REDEMPTION_LIMIT_REACHED"), { code: "REDEMPTION_LIMIT_REACHED" });
    }

    return tx.couponRedemption.create({
      data: { couponId, userId, bookingId, discountApplied },
    });
  });
}
