import { Router, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireSuperAdmin } from "../middleware/superAdmin.middleware";
import {
  createSystemCoupon,
  listPendingCoupons,
  reviewCouponRequest,
  requestCustomCoupon,
  applyCoupon,
} from "../controllers/coupon.controller";

const router = Router();

// /api/coupons/apply is public and hit on every checkout keystroke-adjacent
// event — protect it from brute-force code guessing without hurting real
// users. 20 attempts / 5 min / IP is generous for legitimate use.
const applyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many attempts. Try again shortly." },
});

// --- Super Admin only --------------------------------------------------------
router.post("/admin/coupons", requireSuperAdmin as unknown as RequestHandler, createSystemCoupon as unknown as RequestHandler);
router.get("/admin/coupons/pending", requireSuperAdmin as unknown as RequestHandler, listPendingCoupons as unknown as RequestHandler);
router.post("/admin/coupons/review", requireSuperAdmin as unknown as RequestHandler, reviewCouponRequest as unknown as RequestHandler);

// --- Authenticated users (students / creators submitting requests) ---------
router.post("/coupons/request", requireAuth as unknown as RequestHandler, requestCustomCoupon as unknown as RequestHandler);

// --- Public / booking-flow ---------------------------------------------------
router.post("/coupons/apply", applyLimiter, applyCoupon as unknown as RequestHandler);

export default router;
