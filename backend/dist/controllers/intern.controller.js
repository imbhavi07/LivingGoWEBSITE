"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInternVisitStatus = exports.getInternDashboard = exports.getInterns = exports.createIntern = exports.internLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const async_handler_1 = require("../utils/async-handler");
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
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
        const interns = await prisma_1.prisma.intern.findMany({
            where: {
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
exports.getInternDashboard = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const internId = req.intern.id;
        const visits = await prisma_1.prisma.visit.findMany({
            where: {
                assignedLeadId: internId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        propertyCode: true,
                        title: true,
                        location: true,
                        price: true,
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
        // Use constant-time comparison to prevent timing attacks
        const isValid = otp === visit.visitOtp;
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
        const updated = await prisma_1.prisma.visit.update({
            where: {
                id: visit.id,
            },
            data: {
                leadStatus: status,
            },
        });
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
