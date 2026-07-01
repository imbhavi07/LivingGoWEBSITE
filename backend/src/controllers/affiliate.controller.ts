import { Request, Response } from "express";
import { PrismaClient, CouponStatus, ReferralStatus } from "@prisma/client";
import { registerAffiliateSchema } from "../validations/coupon.schemas";

const prisma = new PrismaClient();

// Booking cancellation/chargeback risk window before a referral commission
// is considered "confirmed" and moves from pendingBalance -> availableBalance.
const PAYOUT_LOCK_DAYS = 10;

// ============================================================================
// POST /api/affiliate/register
// Any authenticated non-tenant (or student wanting a creator-tier code) can
// apply. Creates an AffiliateProfile in PENDING_REVIEW + a matching
// PENDING_APPROVAL coupon that only becomes usable once Super Admin approves
// BOTH the profile and the coupon terms.
// ============================================================================
export async function registerAffiliate(req: Request, res: Response) {
  const parsed = registerAffiliateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }
  const input = parsed.data;
  const userId = req.authUserId!;

  const already = await prisma.affiliateProfile.findUnique({ where: { userId } });
  if (already) {
    return res.status(409).json({
      error: "ALREADY_REGISTERED",
      message: "You already have an affiliate profile.",
      profile: already,
    });
  }

  const code =
    input.preferredCode ??
    `${input.displayName.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10)}${Math.floor(
      10 + Math.random() * 90
    )}`;

  const codeTaken = await prisma.coupon.findUnique({ where: { code } });
  if (codeTaken) {
    return res.status(409).json({ error: "CODE_TAKEN", message: "Try a different preferred code." });
  }

  const [profile, coupon] = await prisma.$transaction([
    prisma.affiliateProfile.create({
      data: {
        userId,
        personaType: input.personaType,
        displayName: input.displayName,
        socialLinks: input.socialLinks,
        audienceSizeNote: input.audienceSizeNote,
        payoutMethod: input.payoutMethod,
        upiId: input.upiId,
        status: "PENDING_REVIEW",
      },
    }),
    prisma.coupon.create({
      data: {
        code,
        discountType: "PERCENTAGE",
        discountValue: 5, // placeholder default — Super Admin sets real terms on approval
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: CouponStatus.PENDING_APPROVAL,
        ownerType: input.personaType,
        ownerId: userId,
        requestedById: userId,
        requestNote: `Auto-generated on affiliate registration (${input.personaType}).`,
      },
    }),
  ]);

  return res.status(201).json({
    profile,
    coupon,
    message: "Application submitted. You'll be notified once the Super Admin reviews it.",
  });
}

// ============================================================================
// GET /api/affiliate/me/dashboard
// Backs the Creator/Referrer Workspace (app/earn/page.tsx). Returns funnel
// metrics + balances in a single call to keep the dashboard fast.
// ============================================================================
export async function getMyAffiliateDashboard(req: Request, res: Response) {
  const userId = req.authUserId!;

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId },
    include: { ledgerEntries: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!profile) {
    return res.status(404).json({ error: "NOT_REGISTERED", message: "No affiliate profile found." });
  }

  const coupon = await prisma.coupon.findFirst({ where: { ownerId: userId, ownerType: profile.personaType } });

  const [clicks, signups, bookings, pendingPayout, readyPayout] = await Promise.all([
    prisma.referral.count({ where: { referrerId: userId, status: { in: ["CLICKED", "SIGNED_UP", "BOOKED", "PAYOUT_LOCKED", "PAYOUT_READY", "PAID"] } } }),
    prisma.referral.count({ where: { referrerId: userId, status: { in: ["SIGNED_UP", "BOOKED", "PAYOUT_LOCKED", "PAYOUT_READY", "PAID"] } } }),
    prisma.referral.count({ where: { referrerId: userId, status: { in: ["BOOKED", "PAYOUT_LOCKED", "PAYOUT_READY", "PAID"] } } }),
    prisma.referral.count({ where: { referrerId: userId, status: "PAYOUT_LOCKED" } }),
    prisma.referral.count({ where: { referrerId: userId, status: "PAYOUT_READY" } }),
  ]);

  return res.json({
    profile: {
      displayName: profile.displayName,
      status: profile.status,
      personaType: profile.personaType,
      lifetimeEarned: profile.lifetimeEarned,
      pendingBalance: profile.pendingBalance,
      availableBalance: profile.availableBalance,
      paidOutTotal: profile.paidOutTotal,
      minPayoutThreshold: profile.minPayoutThreshold,
    },
    code: coupon?.code ?? null,
    funnel: {
      totalClicks: clicks,
      totalSignups: signups,
      totalConversions: bookings,
      conversionRate: clicks > 0 ? Number(((bookings / clicks) * 100).toFixed(1)) : 0,
      pendingPayoutCount: pendingPayout,
      readyPayoutCount: readyPayout,
    },
    recentLedger: profile.ledgerEntries,
  });
}

// ============================================================================
// recordReferralClick — called from a lightweight redirect/tracking route
// (e.g. GET /r/:code) when someone lands via a referral link. Not gated by
// requireAuth since the visitor may not have an account yet.
// ============================================================================
export async function recordReferralClick(code: string, attributionCookie: string, ip?: string, ua?: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || coupon.status !== "ACTIVE" || coupon.ownerType === "SYSTEM") return null;

  return prisma.referral.upsert({
    where: { attributionCookie },
    create: {
      referrerId: coupon.ownerId!,
      couponId: coupon.id,
      status: ReferralStatus.CLICKED,
      attributionCookie,
      clickSourceIp: ip,
      clickUserAgent: ua,
    },
    update: {}, // first-touch attribution: don't overwrite an existing click record
  });
}

// ============================================================================
// convertReferralOnBooking — called internally from the booking-confirmation
// flow, mirrors commitCouponRedemption but drives the referral/payout ledger.
// Flags and voids self-referrals rather than paying them out.
// ============================================================================
export async function convertReferralOnBooking(
  attributionCookie: string,
  refereeUserId: string,
  bookingId: string,
  bookingValue: number
) {
  return prisma.$transaction(async (tx) => {
    const referral = await tx.referral.findUnique({ where: { attributionCookie } });
    if (!referral) return null;

    const isSelfReferral = referral.referrerId === refereeUserId;
    if (isSelfReferral) {
      return tx.referral.update({
        where: { id: referral.id },
        data: { status: ReferralStatus.VOIDED, isSelfReferral: true, refereeId: refereeUserId, bookingId },
      });
    }

    const coupon = referral.couponId ? await tx.coupon.findUnique({ where: { id: referral.couponId } }) : null;
    const commissionValue = coupon?.commissionValue ? Number(coupon.commissionValue) : 0;
    const commissionType = coupon?.commissionType ?? "FLAT";
    const commissionEarned =
      commissionType === "FLAT" ? commissionValue : (bookingValue * commissionValue) / 100;

    const payoutLockedUntil = new Date(Date.now() + PAYOUT_LOCK_DAYS * 24 * 60 * 60 * 1000);

    const updatedReferral = await tx.referral.update({
      where: { id: referral.id },
      data: {
        refereeId: refereeUserId,
        bookingId,
        bookingValue,
        commissionEarned,
        status: ReferralStatus.PAYOUT_LOCKED,
        signedUpAt: referral.signedUpAt ?? new Date(),
        bookedAt: new Date(),
        payoutLockedUntil,
      },
    });

    const affiliateProfile = await tx.affiliateProfile.findUnique({ where: { userId: referral.referrerId } });
    if (affiliateProfile && commissionEarned > 0) {
      await tx.affiliateProfile.update({
        where: { id: affiliateProfile.id },
        data: { pendingBalance: { increment: commissionEarned }, lifetimeEarned: { increment: commissionEarned } },
      });
      await tx.payoutLedgerEntry.create({
        data: {
          affiliateProfileId: affiliateProfile.id,
          referralId: referral.id,
          type: "EARNED_PENDING",
          amount: commissionEarned,
          note: `Booking ${bookingId} — locked until ${payoutLockedUntil.toISOString().slice(0, 10)}`,
        },
      });
    }

    return updatedReferral;
  });
}
