"use strict";
// backend/src/services/token-payment.service.ts  (NEW FILE)
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenPayment = createTokenPayment;
exports.getStudentTokenPayments = getStudentTokenPayments;
exports.getAllTokenPayments = getAllTokenPayments;
exports.moderateTokenPayment = moderateTokenPayment;
exports.getOwnerTokenPayments = getOwnerTokenPayments;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
// ─── Student: submit token payment ───────────────────────────────────────────
async function createTokenPayment(studentId, propertyId, utrNumber) {
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, price: true, status: true, title: true },
    });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (property.status !== "approved")
        throw new app_error_1.AppError("Property is not available for booking", 400);
    // Check for existing pending/approved payment for this student+property
    const existing = await prisma_1.prisma.tokenPayment.findUnique({
        where: { studentId_propertyId: { studentId, propertyId } },
    });
    if (existing) {
        if (existing.status === "approved")
            throw new app_error_1.AppError("You have already locked this property", 400);
        if (existing.status === "pending")
            throw new app_error_1.AppError("Your payment is already under review", 400);
        // If rejected, allow re-submission — update the record
        return prisma_1.prisma.tokenPayment.update({
            where: { id: existing.id },
            data: { utrNumber, status: "pending", updatedAt: new Date() },
            include: { property: { select: { id: true, title: true } } },
        });
    }
    const tokenAmount = Math.ceil(property.price / 2); // half monthly rent
    return prisma_1.prisma.tokenPayment.create({
        data: { studentId, propertyId, amount: tokenAmount, utrNumber },
        include: { property: { select: { id: true, title: true } } },
    });
}
// ─── Student: get their token payments ───────────────────────────────────────
async function getStudentTokenPayments(studentId) {
    return prisma_1.prisma.tokenPayment.findMany({
        where: { studentId },
        include: {
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true, // only revealed after approval
                    price: true,
                    images: { select: { url: true }, take: 1 },
                    owner: { select: { name: true, phone: true } }, // revealed after approval
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
// ─── Admin: get all token payments ───────────────────────────────────────────
async function getAllTokenPayments(status) {
    return prisma_1.prisma.tokenPayment.findMany({
        where: status ? { status: status } : undefined,
        include: {
            student: { select: { id: true, name: true, email: true, phone: true } },
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    price: true,
                    owner: { select: { id: true, name: true, phone: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
// ─── Admin: approve or reject a token payment ────────────────────────────────
async function moderateTokenPayment(id, action) {
    const payment = await prisma_1.prisma.tokenPayment.findUnique({ where: { id } });
    if (!payment)
        throw new app_error_1.AppError("Payment not found", 404);
    if (payment.status !== "pending")
        throw new app_error_1.AppError("Payment has already been reviewed", 400);
    return prisma_1.prisma.tokenPayment.update({
        where: { id },
        data: { status: action },
        include: {
            student: { select: { id: true, name: true, email: true } },
            property: { select: { id: true, title: true, location: true } },
        },
    });
}
// ─── Owner: get token payments for their properties ───────────────────────────
async function getOwnerTokenPayments(ownerId) {
    return prisma_1.prisma.tokenPayment.findMany({
        where: { property: { ownerId } },
        include: {
            student: { select: { id: true, name: true, email: true, phone: true } },
            property: { select: { id: true, title: true, location: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
