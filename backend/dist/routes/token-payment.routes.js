"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenPaymentRouter = void 0;
// backend/src/routes/token-payment.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const tokenController = __importStar(require("../controllers/token-payment.controller"));
exports.tokenPaymentRouter = (0, express_1.Router)();
// ==========================================
// STUDENT ROUTES (Clerk Auth)
// ==========================================
// Submit UTR after paying token manually
exports.tokenPaymentRouter.post("/properties/:id/token", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("student"), tokenController.submitTokenPayment);
// Automated Razorpay webhook confirmation endpoint
// FIXED: Stripped extra "/token-payments" prefix to match standard mounting structure
exports.tokenPaymentRouter.post("/confirm-razorpay", auth_middleware_1.clerkAuthenticate, tokenController.confirmRazorpayPayment);
// Get student's personal token payments
exports.tokenPaymentRouter.get("/my-payments", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("student"), tokenController.getMyTokenPayments);
// ==========================================
// OWNER ROUTES (Clerk Auth)
// ==========================================
// See payments for their hosted properties
exports.tokenPaymentRouter.get("/owner-payments", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), tokenController.ownerGetTokenPayments);
// Verify student physical visit using OTP
exports.tokenPaymentRouter.post("/verify-visit/:id", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), tokenController.verifyVisit);
// ==========================================
// ADMIN ROUTES (JWT Auth)
// ==========================================
// Get all system token payments
exports.tokenPaymentRouter.get("/admin/token-payments", auth_middleware_2.authenticate, (0, auth_middleware_1.authorize)("admin"), tokenController.adminGetTokenPayments);
// Approve or reject pending system token records
exports.tokenPaymentRouter.patch("/admin/token-payments/:id", auth_middleware_2.authenticate, (0, auth_middleware_1.authorize)("admin"), tokenController.adminModerateTokenPayment);
exports.tokenPaymentRouter.post("/request-movein/:id", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("student"), tokenController.requestMoveIn);
exports.tokenPaymentRouter.get("/owner/pending-visits", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), tokenController.getOwnerPendingVisits);
exports.tokenPaymentRouter.post("/owner/verify-otp/:id", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), tokenController.verifyVisitOtp);
exports.tokenPaymentRouter.post("/owner/approve-movein/:id", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), tokenController.approveMoveIn);
exports.tokenPaymentRouter.get("/owner/tenants", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), tokenController.getOwnerTenants);
