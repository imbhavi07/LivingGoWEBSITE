"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKycStatus = exports.submitKyc = void 0;
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
