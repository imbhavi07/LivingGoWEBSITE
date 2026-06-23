// backend/src/routes/token-payment.routes.ts  (NEW FILE)

import { Router } from "express";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as tokenController from "../controllers/token-payment.controller";

export const tokenPaymentRouter = Router();

// Student routes (Clerk auth)
tokenPaymentRouter.post(
  "/properties/:id/token",
  clerkAuthenticate,
  authorize("student"),
  tokenController.submitTokenPayment
);
tokenPaymentRouter.get(
  "/my-payments",
  clerkAuthenticate,
  authorize("student"),
  tokenController.getMyTokenPayments
);

// Owner routes (Clerk auth)
tokenPaymentRouter.get(
  "/owner-payments",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.ownerGetTokenPayments
);

// Admin routes (JWT auth)
tokenPaymentRouter.get(
  "/admin/token-payments",
  authenticate,
  authorize("admin"),
  tokenController.adminGetTokenPayments
);
tokenPaymentRouter.patch(
  "/admin/token-payments/:id",
  authenticate,
  authorize("admin"),
  tokenController.adminModerateTokenPayment
);
tokenPaymentRouter.post(
  "/verify-visit/:id",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.verifyVisit
);
tokenPaymentRouter.post(
  "/settle-rent/:id",
  clerkAuthenticate,
  authorize("owner"),
  tokenController.settleRent
);