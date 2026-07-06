"use strict";
// backend/src/services/token-payment.service.ts  (NEW FILE)
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackReferralInvite = trackReferralInvite;
exports.trackReferralConfirmation = trackReferralConfirmation;
exports.createTokenPayment = createTokenPayment;
exports.getStudentTokenPayments = getStudentTokenPayments;
exports.getAllTokenPayments = getAllTokenPayments;
exports.moderateTokenPayment = moderateTokenPayment;
exports.getOwnerTokenPayments = getOwnerTokenPayments;
exports.requestMoveIn = requestMoveIn;
exports.getOwnerPendingVisits = getOwnerPendingVisits;
exports.verifyVisitOtp = verifyVisitOtp;
exports.approveMoveIn = approveMoveIn;
exports.getOwnerTenants = getOwnerTenants;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
// Helper function to handle referral invite when a code is used
async function handleReferralInvite(code) {
    const upperCode = code.toUpperCase().trim();
    // Check if it's a referral code (ends with 500)
    if (upperCode.endsWith('500')) {
        const referral = await prisma_1.prisma.referral.findFirst({
            where: {
                code: upperCode,
                status: 'APPROVED',
            },
        });
        if (referral) {
            // Increment the invite count
            await prisma_1.prisma.referral.update({
                where: { id: referral.id },
                data: { invites: { increment: 1 } },
            });
        }
    }
}
// Exported function to handle referral invitation (for use in controllers)
async function trackReferralInvite(code) {
    await handleReferralInvite(code);
}
// Helper function to handle successful referral confirmation (when payment is approved/confirmed)
async function handleReferralConfirmation(code) {
    const upperCode = code.toUpperCase().trim();
    // Check if it's a referral code (ends with 500)
    if (upperCode.endsWith('500')) {
        const referral = await prisma_1.prisma.referral.findFirst({
            where: {
                code: upperCode,
                status: 'APPROVED',
            },
        });
        if (referral) {
            // Increment successful conversions and add earnings (₹500 commission)
            await prisma_1.prisma.referral.update({
                where: { id: referral.id },
                data: {
                    successful: { increment: 1 },
                    earnings: { increment: 500 }
                },
            });
        }
    }
}
// Exported function to handle referral confirmation (for use in controllers)
async function trackReferralConfirmation(code) {
    await handleReferralConfirmation(code);
}
// ─── Student: submit token payment ───────────────────────────────────────────
async function createTokenPayment(studentId, propertyId, utrNumber, appliedCode) {
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
            data: { utrNumber, status: "pending", updatedAt: new Date(), appliedCode: appliedCode || undefined },
            include: { property: { select: { id: true, title: true } } },
        });
    }
    const tokenAmount = Math.ceil(property.price / 2); // half monthly rent
    // Create the token payment
    const payment = await prisma_1.prisma.tokenPayment.create({
        data: { studentId, propertyId, amount: tokenAmount, utrNumber, appliedCode },
        include: { property: { select: { id: true, title: true } } },
    });
    // If a referral code was applied, increment the referral's invite count
    if (appliedCode) {
        await trackReferralInvite(appliedCode);
    }
    return payment;
}
// ─── Student: get their token payments ───────────────────────────────────────
async function getStudentTokenPayments(studentId) {
    return await prisma_1.prisma.tokenPayment.findMany({
        where: { studentId },
        select: {
            id: true,
            amount: true,
            status: true,
            visitOtp: true,
            visitVerified: true,
            rentSettled: true,
            moveInRequested: true,
            createdAt: true,
            appliedCode: true,
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    price: true,
                    images: {
                        select: {
                            url: true,
                        },
                    },
                    owner: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
            student: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
// ─── Admin: get all token payments ───────────────────────────────────────────
async function getAllTokenPayments(status) {
    if (status) {
        const trimmed = status.trim().toLowerCase();
        if (["pending", "approved", "rejected"].includes(trimmed)) {
            return await prisma_1.prisma.tokenPayment.findMany({
                where: { status: trimmed },
                select: {
                    id: true,
                    amount: true,
                    utrNumber: true,
                    status: true,
                    visitOtp: true,
                    visitVerified: true,
                    rentSettled: true,
                    moveInRequested: true,
                    createdAt: true,
                    appliedCode: true,
                    student: { select: { id: true, name: true, email: true, phone: true } },
                    property: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            price: true,
                            images: {
                                select: {
                                    url: true,
                                },
                            },
                            owner: { select: { id: true, name: true, phone: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }
        else {
            // Invalid status value, return empty array.
            return [];
        }
    }
    // No status filter, return all.
    return await prisma_1.prisma.tokenPayment.findMany({
        select: {
            id: true,
            amount: true,
            utrNumber: true,
            status: true,
            visitOtp: true,
            visitVerified: true,
            rentSettled: true,
            moveInRequested: true,
            createdAt: true,
            appliedCode: true,
            student: { select: { id: true, name: true, email: true, phone: true } },
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    price: true,
                    images: {
                        select: {
                            url: true,
                        },
                    },
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
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const updatedPayment = await prisma_1.prisma.tokenPayment.update({
        where: { id },
        data: {
            status: action,
            ...(action === "approved" ? { visitOtp: otp } : {}),
        },
        include: {
            student: { select: { id: true, name: true, email: true } },
            property: { select: { id: true, title: true, location: true } },
        },
    });
    // If the payment was approved and had a referral code, update referral stats
    if (action === "approved" && payment.appliedCode) {
        // Referral commission is ₹500 (same as the discount amount)
        await trackReferralConfirmation(payment.appliedCode);
    }
    // Increment coupon usage if a coupon code was applied and payment was approved
    if (action === "approved" && payment.appliedCode) {
        try {
            await prisma_1.prisma.coupon.update({
                where: { code: payment.appliedCode },
                data: { currentUses: { increment: 1 } }
            });
        }
        catch (err) {
            console.error('Error incrementing coupon usage:', err);
            // Don't fail the payment processing if coupon increment fails
        }
    }
    return updatedPayment;
}
// ─── Owner: get token payments for their properties ───────────────────────────
async function getOwnerTokenPayments(ownerId) {
    return await prisma_1.prisma.tokenPayment.findMany({
        where: { property: { ownerId } },
        include: {
            student: { select: { id: true, name: true, email: true, phone: true } },
            property: { select: { id: true, title: true, location: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function requestMoveIn(paymentId) {
    const payment = await prisma_1.prisma.tokenPayment.findUnique({
        where: { id: paymentId }
    });
    if (!payment)
        throw new app_error_1.AppError("Booking not found", 404);
    if (!payment.visitVerified)
        throw new app_error_1.AppError("Visit not verified", 400);
    if (payment.moveInRequested)
        throw new app_error_1.AppError("Already requested", 400);
    return await prisma_1.prisma.tokenPayment.update({
        where: { id: paymentId },
        data: {
            moveInRequested: true
        }
    });
}
async function getOwnerPendingVisits(ownerId) {
    return await prisma_1.prisma.tokenPayment.findMany({
        where: {
            property: {
                ownerId,
            },
            status: "approved",
            visitVerified: false,
        },
        include: {
            student: true,
            property: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function verifyVisitOtp(paymentId, otp) {
    const payment = await prisma_1.prisma.tokenPayment.findUnique({
        where: {
            id: paymentId,
        },
    });
    if (!payment) {
        throw new app_error_1.AppError("Booking not found", 404);
    }
    if (payment.visitVerified) {
        throw new app_error_1.AppError("Visit already verified", 400);
    }
    if (payment.visitOtp !== otp) {
        throw new app_error_1.AppError("Invalid OTP", 400);
    }
    return await prisma_1.prisma.tokenPayment.update({
        where: {
            id: paymentId,
        },
        data: {
            visitVerified: true,
            visitOtp: null, // OTP destroyed after successful verification
        },
    });
}
async function approveMoveIn(paymentId) {
    const payment = await prisma_1.prisma.tokenPayment.findUnique({
        where: {
            id: paymentId
        },
        include: {
            property: true
        }
    });
    if (!payment)
        throw new app_error_1.AppError("Payment not found", 404);
    if (!payment.visitVerified)
        throw new app_error_1.AppError("Visit not verified", 400);
    if (!payment.moveInRequested)
        throw new app_error_1.AppError("Move-in not requested", 400);
    const totalBeds = (payment.property.bedsSingle ?? 0) +
        (payment.property.bedsDouble ?? 0) +
        (payment.property.bedsTriple ?? 0);
    if (payment.property.occupiedBeds >= totalBeds)
        throw new app_error_1.AppError("Property Full", 400);
    return await prisma_1.prisma.$transaction(async (tx) => {
        await tx.tokenPayment.update({
            where: {
                id: paymentId
            },
            data: {
                rentSettled: true
            }
        });
        await tx.tenantResidence.upsert({
            where: {
                studentId: payment.studentId
            },
            update: {
                propertyId: payment.propertyId
            },
            create: {
                propertyId: payment.propertyId,
                studentId: payment.studentId
            }
        });
        await tx.property.update({
            where: {
                id: payment.propertyId,
            },
            data: {
                occupiedBeds: {
                    increment: 1,
                },
            },
        });
        return {
            success: true
        };
    });
}
async function getOwnerTenants(ownerId) {
    return await prisma_1.prisma.tenantResidence.findMany({
        where: {
            property: {
                ownerId
            }
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            property: {
                select: {
                    id: true,
                    title: true,
                    occupiedBeds: true,
                    bedsSingle: true,
                    bedsDouble: true,
                    bedsTriple: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}
