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
exports.confirmRazorpayPayment = exports.settleRent = exports.verifyVisit = exports.ownerGetTokenPayments = exports.adminModerateTokenPayment = exports.adminGetTokenPayments = exports.getMyTokenPayments = exports.submitTokenPayment = void 0;
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
    const result = await tokenService.verifyVisit(paymentId, otp);
    res.json(result);
});
exports.settleRent = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const paymentId = String(req.params.id);
    const result = await tokenService.settleRent(paymentId);
    res.json(result);
});
exports.confirmRazorpayPayment = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const { propertyId, razorpayPaymentId } = req.body;
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
    // 4. Update dynamic inventory (Prevent double bookings)
    await prisma_1.prisma.property.update({
        where: { id: propertyId },
        data: { occupiedBeds: { increment: 1 } }
    });
    res.status(201).json(payment);
});
