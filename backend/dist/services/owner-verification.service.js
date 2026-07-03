"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingOwnerApprovals = getPendingOwnerApprovals;
exports.getPendingOwnerApprovalById = getPendingOwnerApprovalById;
exports.reviewOwnerApproval = reviewOwnerApproval;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const backend_1 = require("@clerk/backend");
async function getPendingOwnerApprovals() {
    return prisma_1.prisma.user.findMany({
        where: {
            role: "owner",
            verificationStatus: "pending_approval"
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ownerType: true,
            aadhaarFrontUrl: true,
            aadhaarBackUrl: true,
            aadhaarNumber: true,
            legalAcceptedAt: true,
            verificationStatus: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    });
}
async function getPendingOwnerApprovalById(id) {
    const user = await prisma_1.prisma.user.findFirst({
        where: { id, role: "owner" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ownerType: true,
            aadhaarFrontUrl: true,
            aadhaarBackUrl: true,
            aadhaarNumber: true,
            legalAcceptedAt: true,
            verificationStatus: true,
            createdAt: true
        }
    });
    if (!user)
        throw new app_error_1.AppError("Owner application not found", 404);
    return user;
}
async function reviewOwnerApproval(id, status) {
    const user = await prisma_1.prisma.user.findFirst({
        where: { id, role: "owner" }
    });
    if (!user)
        throw new app_error_1.AppError("Owner application not found", 404);
    const updated = await prisma_1.prisma.user.update({
        where: { id },
        data: { verificationStatus: status, reviewedAt: new Date() },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ownerType: true,
            aadhaarFrontUrl: true,
            aadhaarBackUrl: true,
            aadhaarNumber: true,
            legalAcceptedAt: true,
            verificationStatus: true,
            createdAt: true
        }
    });
    // ✅ Update Clerk publicMetadata so middleware can read verificationStatus
    try {
        const clerkClient = (0, backend_1.createClerkClient)({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [user.email] });
        const clerkUser = clerkUsers.data[0];
        if (clerkUser) {
            await clerkClient.users.updateUserMetadata(clerkUser.id, {
                publicMetadata: { role: "owner", verificationStatus: status },
            });
        }
    }
    catch (err) {
        console.error("Failed to update Clerk metadata:", err);
    }
    return updated;
}
