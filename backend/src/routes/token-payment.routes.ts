// backend/src/routes/token-payment.routes.ts
import { Router } from "express";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as tokenController from "../controllers/token-payment.controller";

export const tokenPaymentRouter = Router();

// ==========================================
// STUDENT ROUTES (Clerk Auth)
// ==========================================

// Submit UTR after paying token manually
tokenPaymentRouter.post(
  "/properties/:id/token",
  clerkAuthenticate,
  authorize("student"),
  tokenController.submitTokenPayment
);

// Automated Razorpay webhook confirmation endpoint
// FIXED: Stripped extra "/token-payments" prefix to match standard mounting structure
tokenPaymentRouter.post(
  "/confirm-razorpay", 
  clerkAuthenticate,
  authorize("student"),
  tokenController.confirmRazorpayPayment
);

// Get student's personal token payments
tokenPaymentRouter.get(
  "/my-payments",
  clerkAuthenticate,
  authorize("student"),
  tokenController.getMyTokenPayments
);

// ==========================================
// OWNER ROUTES (Clerk Auth)
// ==========================================

// See payments for their hosted properties
tokenPaymentRouter.get(
  "/owner-payments",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.ownerGetTokenPayments
);

// Verify student physical visit using OTP
tokenPaymentRouter.post(
  "/verify-visit/:id",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.verifyVisit
);

// Settle rent payout internally
tokenPaymentRouter.post(
  "/settle-rent/:id",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.settleRent
);

// ==========================================
// ADMIN ROUTES (JWT Auth)
// ==========================================

// Get all system token payments
tokenPaymentRouter.get(
  "/admin/token-payments",
  authenticate,
  authorize("admin"),
  tokenController.adminGetTokenPayments
);

// Approve or reject pending system token records
tokenPaymentRouter.patch(
  "/admin/token-payments/:id",
  authenticate,
  authorize("admin"),
  tokenController.adminModerateTokenPayment
);

tokenPaymentRouter.post(
  "/request-movein/:id",
  clerkAuthenticate,
  authorize("student"),
  tokenController.requestMoveIn
);

tokenPaymentRouter.get(
  "/owner/pending-visits",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.getOwnerPendingVisits
);

tokenPaymentRouter.post(
  "/owner/verify-otp/:id",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.verifyVisitOtp
);