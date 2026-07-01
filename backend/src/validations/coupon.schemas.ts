import { z } from "zod";

// ----------------------------------------------------------------------------
// Shared primitives
// ----------------------------------------------------------------------------

const inrAmount = z
  .number()
  .positive("Amount must be greater than zero")
  .max(1_000_000, "Amount exceeds sane upper bound");

const couponCode = z
  .string()
  .trim()
  .min(4, "Code must be at least 4 characters")
  .max(20, "Code must be at most 20 characters")
  .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric only")
  .transform((v) => v.toUpperCase());

export const roomCategoryEnum = z.enum([
  "SINGLE_SHARING",
  "DOUBLE_SHARING",
  "TRIPLE_SHARING",
  "STUDIO",
  "FULL_FLAT",
  "ALL",
]);

const discountTypeEnum = z.enum(["FLAT", "PERCENTAGE"]);

// ----------------------------------------------------------------------------
// POST /api/admin/coupons
// Used for BOTH: (a) Super Admin creating a fresh SYSTEM/global coupon, and
// (b) Super Admin approving/editing a PENDING_APPROVAL request from a user.
// ----------------------------------------------------------------------------

const baseCreateSystemCouponSchema = z.object({
  code: couponCode,
  discountType: discountTypeEnum,
  discountValue: inrAmount,
  maxDiscountAmount: inrAmount.optional(),
  minBookingAmount: inrAmount.optional(),
  applicableRoomCategories: z.array(roomCategoryEnum).min(1).default(["ALL"]),
  firstBookingOnly: z.boolean().default(false),
  maxTotalRedemptions: z.number().int().positive().optional(),
  maxRedemptionsPerUser: z.number().int().positive().default(1),
  validFrom: z.coerce.date().default(() => new Date()),
  validUntil: z.coerce.date(),
  commissionType: discountTypeEnum.optional(),
  commissionValue: inrAmount.optional(),
});

export const createSystemCouponSchema = baseCreateSystemCouponSchema
  .refine((d) => d.validUntil > d.validFrom, {
    message: "validUntil must be after validFrom",
    path: ["validUntil"],
  })
  .refine(
    (d) => d.discountType !== "PERCENTAGE" || (d.discountValue > 0 && d.discountValue <= 100),
    { message: "Percentage discount must be between 1 and 100", path: ["discountValue"] }
  )
  .refine((d) => !d.commissionValue || d.commissionType, {
    message: "commissionType is required when commissionValue is set",
    path: ["commissionType"],
  });

export const approveCouponRequestSchema = z.object({
  couponId: z.string().cuid(),
  decision: z.enum(["APPROVE", "REJECT"]),
  // Admin may override the requester's proposed terms on approval:
  overrides: baseCreateSystemCouponSchema.partial().optional(),
  rejectionReason: z.string().max(500).optional(),
}).refine((d) => d.decision !== "REJECT" || !!d.rejectionReason, {
  message: "rejectionReason is required when rejecting",
  path: ["rejectionReason"],
});

// ----------------------------------------------------------------------------
// POST /api/coupons/request  (non-admin: student/creator submits for review)
// ----------------------------------------------------------------------------

export const requestCustomCouponSchema = z.object({
  preferredCode: couponCode.optional(), // admin may reassign if taken
  discountType: discountTypeEnum,
  discountValue: inrAmount,
  requestNote: z.string().min(10, "Add a short justification").max(1000),
});

// ----------------------------------------------------------------------------
// POST /api/coupons/apply  (public, high-frequency — keep payload minimal)
// ----------------------------------------------------------------------------

export const applyCouponSchema = z.object({
  code: couponCode,
  roomCategory: roomCategoryEnum,
  bookingAmount: inrAmount,
  isFirstBooking: z.boolean(), // resolved server-side from auth session, not trusted from client
});

// ----------------------------------------------------------------------------
// POST /api/affiliate/register
// ----------------------------------------------------------------------------

export const registerAffiliateSchema = z.object({
  personaType: z.enum(["CREATOR", "AFFILIATE"]),
  displayName: z.string().min(2).max(80),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      youtube: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .partial()
    .optional(),
  audienceSizeNote: z.string().max(200).optional(),
  preferredCode: couponCode.optional(),
  payoutMethod: z.enum(["BANK_TRANSFER", "UPI"]).optional(),
  upiId: z.string().max(60).optional(),
});

export type CreateSystemCouponInput = z.infer<typeof createSystemCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type RegisterAffiliateInput = z.infer<typeof registerAffiliateSchema>;
