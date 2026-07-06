// backend/src/controllers/token-payment.controller.ts  (NEW FILE)

import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import * as tokenService from "../services/token-payment.service";
import { prisma } from "../config/prisma";

function requireUser(req: Request) {
  if (!req.user) throw new AppError("Authentication required", 401);
  return req.user;
}

// Student: submit UTR after paying token
export const submitTokenPayment = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const propertyId = String(req.params.id);
  const { utrNumber, appliedCode } = req.body as { utrNumber: string; appliedCode?: string };

  if (!utrNumber?.trim()) throw new AppError("UTR number is required", 400);

  const payment = await tokenService.createTokenPayment(user.id, propertyId, utrNumber.trim(), appliedCode);
  res.status(201).json(payment);
});

// Student: get their own token payments
export const getMyTokenPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const payments = await tokenService.getStudentTokenPayments(user.id);
  res.json(payments);
});

// Admin: get all token payments (optional ?status=pending filter)
export const adminGetTokenPayments = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const payments = await tokenService.getAllTokenPayments(status);
  res.json(payments);
});

// Admin: approve or reject
export const adminModerateTokenPayment = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { action } = req.body as { action: "approved" | "rejected" };
  if (!["approved", "rejected"].includes(action)) throw new AppError("Invalid action", 400);
  const result = await tokenService.moderateTokenPayment(id, action);
  res.json(result);
});

// Owner: see payments for their properties
export const ownerGetTokenPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const payments = await tokenService.getOwnerTokenPayments(user.id);
  res.json(payments);
});

export const verifyVisit = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = String(req.params.id);
  const { otp } = req.body;

  const result = await tokenService.verifyVisitOtp(paymentId, otp);

  res.json(result);
});

import { verifyToken } from "@clerk/backend";

export const confirmRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { propertyId, razorpayPaymentId, appliedCode } = req.body;

  // Ensure user record exists in DB (self-heal for missing webhook)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUserId = payload.sub;
      const email = payload.email as string | null;
      const firstName = payload.first_name as string | null;
      const lastName = payload.last_name as string | null;
      const name = ((firstName ?? '') + ' ' + (lastName ?? '')).trim() || undefined;

      await prisma.user.upsert({
        where: { clerkId: clerkUserId },
        update: {},
        create: {
          clerkId: clerkUserId,
          email: email ?? `${clerkUserId}@users.clerk.dev`,
          name: name ?? 'Clerk User',
          role: 'student',
          status: 'active',
          passwordHash: 'dummy_hash',
          verificationStatus: 'not_required',
        },
      });
    } catch (err: unknown) {
      // If token verification fails, we still have user from requireUser (which came from clerkAuthenticate)
      // So we can ignore; the user record should exist from middleware.
    }
  }

  // 1. Fetch property to calculate token amount
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404);

  const tokenAmount = Math.ceil(property.price / 2);

  // 2. Generate the Visit OTP instantly (Anti-Bypass System)
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // 3. Upsert the token payment (Updates if they tried to pay before, creates if new)
  const payment = await prisma.tokenPayment.upsert({
    where: { studentId_propertyId: { studentId: user.id, propertyId } },
    update: {
      amount: tokenAmount,
      utrNumber: razorpayPaymentId, // Save the Razorpay ID as the UTR
      status: "approved", // INSTANT APPROVAL!
      visitOtp: otp,
      appliedCode: appliedCode || undefined, // Store the applied code if any
    },
    create: {
      studentId: user.id,
      propertyId,
      amount: tokenAmount,
      utrNumber: razorpayPaymentId,
      status: "approved",
      visitOtp: otp,
      appliedCode: appliedCode || undefined,
    }
  });

  // Increment coupon usage if a coupon code was applied
  if (payment.appliedCode) {
    try {
      await prisma.coupon.update({
        where: { code: payment.appliedCode },
        data: { currentUses: { increment: 1 } }
      });
    } catch (err) {
      console.error('Error incrementing coupon usage:', err);
      // Don't fail the payment processing if coupon increment fails
    }
  }

  // Handle referral credits when a payment is confirmed (used in webhook and manual approval)
  async function handleReferralCredits(appliedCode: string | undefined) {
    if (!appliedCode) return;

    try {
      // Handle referral invitation (when code is used)
      await tokenService.trackReferralInvite(appliedCode);
      // Handle referral success (when payment is approved/confirmed)
      await tokenService.trackReferralConfirmation(appliedCode); // ₹500 commission
    } catch (err) {
      console.error('Error processing referral credits:', err);
      // Don't fail the payment processing if referral tracking fails
    }
  }

  // Handle referral credits for this confirmed payment
  await handleReferralCredits(appliedCode);

  // 4. Return payment
  res.status(201).json(payment);
});

export const requestMoveIn = asyncHandler(async (req, res) => {

  const paymentId = String(req.params.id);

  const result = await tokenService.requestMoveIn(paymentId);

  res.json(result);

});

export const getOwnerPendingVisits = asyncHandler(async (req, res) => {

  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const ownerId = req.user!.id;

  const visits = await tokenService.getOwnerPendingVisits(ownerId);

  res.json(visits);

});

export const verifyVisitOtp = asyncHandler(async (req, res) => {
  const paymentId = String(req.params.id);
  const { otp } = req.body;

  const result = await tokenService.verifyVisitOtp(
    paymentId,
    otp
  );

  res.json(result);
});

export const approveMoveIn = asyncHandler(async (req, res) => {
  const paymentId = String(req.params.id);

  const result = await tokenService.approveMoveIn(paymentId);

  res.json(result);
});

export const getOwnerTenants = asyncHandler(async (req, res) => {

  const ownerId = req.user!.id;

  const tenants = await tokenService.getOwnerTenants(ownerId);

  res.json(tenants);

});