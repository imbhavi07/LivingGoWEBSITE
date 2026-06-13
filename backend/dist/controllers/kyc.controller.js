"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateDigilockerSession = exports.getKycStatus = exports.submitKyc = void 0;
const axios_1 = __importDefault(require("axios"));
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const prisma_1 = require("../config/prisma");
const cloudinary_service_1 = require("../services/cloudinary.service");
exports.submitKyc = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const clerkEmail = req.body.clerkEmail;
    if (!clerkEmail)
        throw new app_error_1.AppError("Email is required", 400);
    const owner = await prisma_1.prisma.user.findUnique({ where: { email: clerkEmail } });
    if (!owner)
        throw new app_error_1.AppError("Owner not found. Please sign up first.", 404);
    const ownerId = owner.id;
    if (owner.verificationStatus === "approved") {
        throw new app_error_1.AppError("Your KYC is already approved.", 400);
    }
    const { name, phone, ownerType, aadhaarNumber } = req.body;
    if (!name || !phone || !ownerType || !aadhaarNumber) {
        throw new app_error_1.AppError("All fields are required.", 400);
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new app_error_1.AppError("Aadhaar number must be exactly 12 digits.", 400);
    }
    const files = req.files;
    const frontFile = files?.aadhaarFront?.[0];
    const backFile = files?.aadhaarBack?.[0];
    if (!frontFile || !backFile) {
        throw new app_error_1.AppError("Both Aadhaar front and back images are required.", 400);
    }
    const uploads = await (0, cloudinary_service_1.uploadMany)([frontFile, backFile]);
    const updatedOwner = await prisma_1.prisma.user.update({
        where: { id: ownerId },
        data: {
            name,
            phone,
            ownerType,
            aadhaarNumber,
            aadhaarFrontUrl: uploads[0]?.secure_url,
            aadhaarBackUrl: uploads[1]?.secure_url,
            verificationStatus: "pending_approval",
            legalAcceptedAt: new Date(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            verificationStatus: true,
        },
    });
    res.status(200).json({
        success: true,
        message: "KYC submitted successfully. Awaiting admin approval.",
        data: updatedOwner,
    });
});
exports.getKycStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const clerkEmail = req.query.email;
    if (!clerkEmail)
        throw new app_error_1.AppError("Email is required", 400);
    const owner = await prisma_1.prisma.user.findUnique({
        where: { email: clerkEmail },
        select: {
            verificationStatus: true,
            aadhaarNumber: true,
            reviewedAt: true,
        },
    });
    if (!owner)
        throw new app_error_1.AppError("Owner not found", 404);
    res.status(200).json({
        success: true,
        data: {
            verificationStatus: owner.verificationStatus,
            aadhaarLast4: owner.aadhaarNumber?.slice(-4) ?? null,
            reviewedAt: owner.reviewedAt,
        },
    });
});
exports.initiateDigilockerSession = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const email = req.query.email;
    if (!email)
        throw new app_error_1.AppError("Email is required", 400);
    const owner = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, clerkId: true, verificationStatus: true },
    });
    if (!owner)
        throw new app_error_1.AppError("Owner not found", 404);
    if (owner.verificationStatus === "approved") {
        throw new app_error_1.AppError("Your KYC is already approved.", 400);
    }
    if (!owner.clerkId) {
        throw new app_error_1.AppError("Clerk ID not found for this user.", 400);
    }
    const sandboxApiKey = process.env.SANDBOX_API_KEY;
    const sandboxApiSecret = process.env.SANDBOX_API_SECRET;
    if (!sandboxApiKey || !sandboxApiSecret) {
        throw new app_error_1.AppError("DigiLocker integration not configured", 500);
    }
    try {
        const callbackUrl = `${process.env.CORS_ORIGIN || "http://localhost:3000"}/owner/kyc`;
        const response = await axios_1.default.post("https://api.sandbox.co.in/v1/kyc/digilocker/initiate", {
            reference_id: owner.clerkId,
            callback_url: callbackUrl,
            metadata: {
                user_id: owner.id,
                email: owner.email,
            },
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${sandboxApiKey}:${sandboxApiSecret}`).toString("base64")}`,
            },
        });
        const authorizationUrl = response.data?.authorization_url || response.data?.redirect_url;
        if (!authorizationUrl) {
            throw new app_error_1.AppError("Failed to get authorization URL from Sandbox", 500);
        }
        res.status(200).json({
            success: true,
            redirectUrl: authorizationUrl,
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("Sandbox API error:", error.response?.data || error.message);
        }
        else {
            console.error("DigiLocker initiation error:", error);
        }
        throw new app_error_1.AppError("Failed to initiate KYC session", 500);
    }
});
