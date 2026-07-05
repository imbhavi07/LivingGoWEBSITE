"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectReferral = exports.approveReferral = exports.requestReferralCode = exports.getEarnDashboard = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getEarnDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // 1. Fixed: Changed 'ownerId' to 'userId' to match your schema type
        const referral = await prisma.referral.findFirst({
            where: {
                userId: userId,
            },
        });
        res.json({
            hasRequestedCode: !!referral,
            referralData: referral
                ? {
                    // 2. Fixed: Changed 'referral.referralCode' to 'referral.code'
                    code: referral.code,
                    status: referral.status,
                    discountValue: 100,
                    discountType: "FLAT",
                }
                : null,
            metrics: {
                // Now correctly getting values from the referral record
                totalInvites: referral?.invites ?? 0,
                pendingBookings: referral?.successful ?? 0, // Note: In the referral model, 'successful' refers to successful conversions
                totalEarnings: referral?.earnings ?? 0,
            },
            // For history, we would need to query a separate table or create a referral history table
            // For now, returning empty array as before
            history: [],
            // Also include the referral object directly for convenience in the frontend
            referral: referral || null
        });
    }
    catch (error) {
        console.error("Earn Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getEarnDashboard = getEarnDashboard;
const requestReferralCode = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const { code } = req.body;
        if (!code || typeof code !== "string") {
            return res.status(400).json({
                message: "Referral code is required.",
            });
        }
        const referralCode = code.trim().toUpperCase();
        if (referralCode.length < 4 || referralCode.length > 20) {
            return res.status(400).json({
                message: "Referral code must be between 4 and 20 characters.",
            });
        }
        // Only letters, numbers and hyphens
        const validPattern = /^[A-Z0-9-]+$/;
        if (!validPattern.test(referralCode)) {
            return res.status(400).json({
                message: "Referral code can only contain letters, numbers and hyphens.",
            });
        }
        // Student already requested one?
        const existingReferral = await prisma.referral.findUnique({
            where: {
                userId,
            },
        });
        if (existingReferral) {
            return res.status(409).json({
                message: "You have already requested a referral code.",
            });
        }
        // Code already exists?
        const existingCode = await prisma.referral.findUnique({
            where: {
                code: referralCode,
            },
        });
        if (existingCode) {
            return res.status(409).json({
                message: "This referral code is already taken.",
            });
        }
        const referral = await prisma.referral.create({
            data: {
                userId,
                code: referralCode,
                status: "PENDING",
            },
        });
        return res.status(201).json({
            message: "Referral request submitted successfully.",
            referral,
        });
    }
    catch (error) {
        console.error("Request Referral Error:", error);
        return res.status(500).json({
            message: "Internal server error.",
        });
    }
};
exports.requestReferralCode = requestReferralCode;
const approveReferral = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({
                message: "Invalid referral id."
            });
        }
        const referral = await prisma.referral.findUnique({
            where: { id }
        });
        if (!referral) {
            return res.status(404).json({
                message: "Referral request not found."
            });
        }
        if (referral.status === "APPROVED") {
            return res.status(400).json({
                message: "Referral is already approved."
            });
        }
        const updated = await prisma.referral.update({
            where: { id },
            data: {
                status: "APPROVED"
            }
        });
        return res.json({
            message: "Referral approved successfully.",
            referral: updated
        });
    }
    catch (error) {
        console.error("Approve Referral Error:", error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};
exports.approveReferral = approveReferral;
const rejectReferral = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({
                message: "Invalid referral id."
            });
        }
        const referral = await prisma.referral.findUnique({
            where: { id }
        });
        if (!referral) {
            return res.status(404).json({
                message: "Referral request not found."
            });
        }
        if (referral.status === "REJECTED") {
            return res.status(400).json({
                message: "Referral is already rejected."
            });
        }
        const updated = await prisma.referral.update({
            where: { id },
            data: {
                status: "REJECTED"
            }
        });
        return res.status(200).json({
            message: "Referral request rejected successfully.",
            referral: updated
        });
    }
    catch (error) {
        console.error("Reject Referral Error:", error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};
exports.rejectReferral = rejectReferral;
