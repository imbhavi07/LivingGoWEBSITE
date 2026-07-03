"use strict";
// backend/src/controllers/token-payment.controller.ts  (NEW FILE)
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
exports.getOwnerTenants = exports.approveMoveIn = exports.verifyVisitOtp = exports.getOwnerPendingVisits = exports.requestMoveIn = exports.confirmRazorpayPayment = exports.verifyVisit = exports.ownerGetTokenPayments = exports.adminModerateTokenPayment = exports.adminGetTokenPayments = exports.getMyTokenPayments = exports.submitTokenPayment = void 0;
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const tokenService = __importStar(require("../services/token-payment.service"));
const prisma_1 = require("../config/prisma");
function requireUser(req) {
    if (!req.user)
        throw new app_error_1.AppError("Authentication required", 401);
    return req.user;
}
// Student: submit UTR after paying token
exports.submitTokenPayment = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const propertyId = String(req.params.id);
    const { utrNumber } = req.body;
    if (!utrNumber?.trim())
        throw new app_error_1.AppError("UTR number is required", 400);
    const payment = await tokenService.createTokenPayment(user.id, propertyId, utrNumber.trim());
    res.status(201).json(payment);
});
// Student: get their own token payments
exports.getMyTokenPayments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const payments = await tokenService.getStudentTokenPayments(user.id);
    res.json(payments);
});
// Admin: get all token payments (optional ?status=pending filter)
exports.adminGetTokenPayments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const status = req.query.status;
    const payments = await tokenService.getAllTokenPayments(status);
    res.json(payments);
});
// Admin: approve or reject
exports.adminModerateTokenPayment = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const id = String(req.params.id);
    const { action } = req.body;
    if (!["approved", "rejected"].includes(action))
        throw new app_error_1.AppError("Invalid action", 400);
    const result = await tokenService.moderateTokenPayment(id, action);
    res.json(result);
});
// Owner: see payments for their properties
exports.ownerGetTokenPayments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const payments = await tokenService.getOwnerTokenPayments(user.id);
    res.json(payments);
});
exports.verifyVisit = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const paymentId = String(req.params.id);
    const { otp } = req.body;
    const result = await tokenService.verifyVisitOtp(paymentId, otp);
    res.json(result);
});
const backend_1 = require("@clerk/backend");
exports.confirmRazorpayPayment = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const { propertyId, razorpayPaymentId } = req.body;
    // Ensure user record exists in DB (self-heal for missing webhook)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
        try {
            const payload = await (0, backend_1.verifyToken)(token, { secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUserId = payload.sub;
            const email = payload.email;
            const firstName = payload.first_name;
            const lastName = payload.last_name;
            const name = ((firstName ?? '') + ' ' + (lastName ?? '')).trim() || undefined;
            await prisma_1.prisma.user.upsert({
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
        }
        catch (err) {
            // If token verification fails, we still have user from requireUser (which came from clerkAuthenticate)
            // So we can ignore; the user record should exist from middleware.
        }
    }
    // 1. Fetch property to calculate token amount
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    const tokenAmount = Math.ceil(property.price / 2);
    // 2. Generate the Visit OTP instantly (Anti-Bypass System)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    // 3. Upsert the token payment (Updates if they tried to pay before, creates if new)
    const payment = await prisma_1.prisma.tokenPayment.upsert({
        where: { studentId_propertyId: { studentId: user.id, propertyId } },
        update: {
            amount: tokenAmount,
            utrNumber: razorpayPaymentId, // Save the Razorpay ID as the UTR
            status: "approved", // INSTANT APPROVAL!
            visitOtp: otp,
        },
        create: {
            studentId: user.id,
            propertyId,
            amount: tokenAmount,
            utrNumber: razorpayPaymentId,
            status: "approved",
            visitOtp: otp,
        }
    });
    // 4. Return payment
    res.status(201).json(payment);
});
exports.requestMoveIn = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const paymentId = String(req.params.id);
    const result = await tokenService.requestMoveIn(paymentId);
    res.json(result);
});
exports.getOwnerPendingVisits = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new app_error_1.AppError("Unauthorized", 401);
    }
    const ownerId = req.user.id;
    const visits = await tokenService.getOwnerPendingVisits(ownerId);
    res.json(visits);
});
exports.verifyVisitOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const paymentId = String(req.params.id);
    const { otp } = req.body;
    const result = await tokenService.verifyVisitOtp(paymentId, otp);
    res.json(result);
});
exports.approveMoveIn = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const paymentId = String(req.params.id);
    const result = await tokenService.approveMoveIn(paymentId);
    res.json(result);
});
exports.getOwnerTenants = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const ownerId = req.user.id;
    const tenants = await tokenService.getOwnerTenants(ownerId);
    res.json(tenants);
});
