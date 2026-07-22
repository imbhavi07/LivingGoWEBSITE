"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVisitOtp = exports.updateInternVisitStatus = exports.getInternDashboard = exports.toggleInternStatus = exports.deleteIntern = exports.getInterns = exports.createIntern = exports.internLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const async_handler_1 = require("../utils/async-handler");
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const whatsapp_queue_1 = require("../queues/whatsapp.queue");
exports.internLogin = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { username, password } = req.body;
        const intern = await prisma_1.prisma.intern.findUnique({
            where: {
                username,
            },
        });
        if (!intern) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const valid = await bcryptjs_1.default.compare(password, intern.passwordHash);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = (0, jwt_1.signJwt)({
            id: intern.id,
            username: intern.username,
            role: client_1.Role.INTERN
        });
        if (!intern.active) {
            return res.status(403).json({
                success: false,
                message: "Your ID has been blocked. Contact your supervising manager.",
            });
        }
        return res.json({
            success: true,
            token,
            intern: {
                id: intern.id,
                name: intern.name,
                username: intern.username,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.createIntern = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        const supervisorId = req.user.id;
        if (!name || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, phone, and password are required",
            });
        }
        const username = `INT${Date.now().toString().slice(-6)}`;
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const intern = await prisma_1.prisma.intern.create({
            data: {
                supervisorId,
                name,
                phone,
                username,
                passwordHash,
            },
        });
        // Queue welcome WhatsApp message for the new intern (fire-and-forget)
        (0, whatsapp_queue_1.queueInternCreated)({
            phoneNumber: phone.replace("+91", "91"),
            userRole: "intern",
            internId: intern.id,
            internName: intern.name,
            internPhone: intern.phone.replace("+91", "91"),
        }).catch((err) => {
            console.error("Failed to queue INTERN_CREATED job:", err);
        });
        return res.json({
            success: true,
            intern
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.getInterns = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const supervisorId = req.user.id;
        const showAll = req.query.showAll === "true";
        const interns = await prisma_1.prisma.intern.findMany({
            where: showAll
                ? {}
                : {
                    supervisorId: String(supervisorId),
                    active: true,
                },
            orderBy: {
                name: "asc",
            },
        });
        return res.json({
            success: true,
            interns,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.deleteIntern = (0, async_handler_1.asyncHandler)(async (req, res) => {
    await prisma_1.prisma.visit.updateMany({
        where: {
            assignedLeadId: String(req.params.id),
        },
        data: {
            assignedLeadId: null,
            leadStatus: "SCHEDULED",
        },
    });
    await prisma_1.prisma.intern.delete({
        where: {
            id: String(req.params.id),
        },
    });
    return res.json({
        success: true,
    });
});
exports.toggleInternStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const intern = await prisma_1.prisma.intern.findUnique({
        where: {
            id: String(req.params.id),
        },
    });
    if (!intern) {
        return res.status(404).json({
            success: false,
            message: "Intern not found",
        });
    }
    const updated = await prisma_1.prisma.intern.update({
        where: {
            id: intern.id,
        },
        data: {
            active: !intern.active,
        },
    });
    return res.json({
        success: true,
        intern: updated,
    });
});
exports.getInternDashboard = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const internId = req.intern.id;
        const visits = await prisma_1.prisma.visit.findMany({
            where: {
                assignedLeadId: internId,
                leadStatus: {
                    notIn: [
                        "SUCCESSFUL",
                        "NOT_SUCCESSFUL",
                        "NOT_MET",
                        "INTERESTED_OTHER_PROPERTY"
                    ],
                },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        visitOtpVerified: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        propertyCode: true,
                        title: true,
                        location: true,
                        price: true,
                        visitOtpVerified: true,
                    },
                },
            },
            orderBy: [
                {
                    visitDate: "asc",
                },
            ],
        });
        return res.json({
            success: true,
            visits,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.updateInternVisitStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const internId = req.intern.id;
        const visitId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { otp, status, } = req.body;
        const visit = await prisma_1.prisma.visit.findFirst({
            where: {
                id: visitId,
                assignedLeadId: internId,
            },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        if (visit.isLocked) {
            return res.status(403).json({
                success: false,
                message: "This visit has been locked. Contact your supervisor to modify it.",
            });
        }
        // Use constant-time comparison to prevent timing attacks
        if (status !== "NOT_MET") {
            const isValid = String(otp).trim() === String(visit.visitOtp).trim();
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                });
            }
        }
        const finalStatuses = [
            "SUCCESSFUL",
            "NOT_SUCCESSFUL",
            "NOT_MET",
            "INTERESTED_OTHER_PROPERTY",
        ];
        const updated = await prisma_1.prisma.visit.update({
            where: {
                id: visit.id,
            },
            data: {
                leadStatus: status,
                isLocked: finalStatuses.includes(status),
            },
        });
        if (visit.couponCode &&
            !visit.referralCounted &&
            finalStatuses.includes(status)) {
            const referral = await prisma_1.prisma.referral.findFirst({
                where: {
                    code: visit.couponCode,
                    status: "APPROVED",
                },
            });
            if (referral) {
                await prisma_1.prisma.$transaction(async (tx) => {
                    await tx.referral.update({
                        where: {
                            id: referral.id,
                        },
                        data: {
                            invites: {
                                increment: 1,
                            },
                            ...(status === "SUCCESSFUL"
                                ? {
                                    successful: {
                                        increment: 1,
                                    },
                                }
                                : {}),
                        },
                    });
                    await tx.visit.update({
                        where: {
                            id: visit.id,
                        },
                        data: {
                            referralCounted: true,
                        },
                    });
                });
            }
        }
        return res.json({
            success: true,
            visit: updated,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.verifyVisitOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { visitId, otp } = req.body;
    const internId = req.intern.id;
    const visit = await prisma_1.prisma.visit.findFirst({
        where: {
            id: visitId,
            assignedLeadId: internId,
        },
    });
    if (!visit) {
        return res.status(404).json({
            success: false,
            message: "Visit not found",
        });
    }
    return res.json({
        success: otp === visit.visitOtp,
    });
});
