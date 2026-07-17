"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInternVisitStatus = exports.getInternDashboard = exports.internLogin = exports.createIntern = exports.getAvailableInterns = exports.getInterns = exports.assignLead = exports.getAllVisits = exports.verifySupervisorOtp = exports.sendSupervisorOtp = exports.scheduleVisit = void 0;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const zod_1 = require("zod");
const async_handler_1 = require("../utils/async-handler");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const resend_1 = require("resend");
const jwt_1 = require("../utils/jwt");
const visit_config_1 = require("../config/visit.config");
const client_1 = require("@prisma/client");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const SUPERVISOR_EMAILS = [
    "mffalit@gmail.com",
    "semwalb3@gmail.com",
    "rctaccommodations@gmail.com",
];
// Validation schema for visit scheduling
const scheduleVisitSchema = zod_1.z.object({
    visitDate: zod_1.z.string().datetime(),
    timeSlot: zod_1.z.string().min(1, "Time slot is required"),
    propertyId: zod_1.z.string().min(1, "Property ID is required"),
    couponCode: zod_1.z.string().optional().nullable(),
});
// Helper function to generate a random 6-character alphanumeric string
function generateTokenId() {
    const randomBytes = crypto_1.default.randomBytes(3);
    const hexString = randomBytes.toString("hex").toUpperCase();
    return `VISIT-${hexString}`;
}
function generateVisitOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}
// Helper function to validate time slot format and range
function isValidTimeSlot(timeSlot) {
    // Expected format: "HH:MM AM/PM - HH:MM AM/PM" (e.g., "09:20 AM - 09:40 AM")
    const timeSlotRegex = /^(\d{2}):(\d{2}) (AM|PM) - (\d{2}):(\d{2}) (AM|PM)$/;
    const match = timeSlot.match(timeSlotRegex);
    if (!match)
        return false;
    const [, startHourStr, startMinStr, startPeriod, endHourStr, endMinStr, endPeriod] = match;
    const startHour = parseInt(startHourStr, 10);
    const startMin = parseInt(startMinStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);
    // Convert to 24-hour format for easier comparison
    let startHour24 = startHour;
    let endHour24 = endHour;
    if (startPeriod === "PM" && startHour !== 12)
        startHour24 = startHour + 12;
    if (startPeriod === "AM" && startHour === 12)
        startHour24 = 0;
    if (endPeriod === "PM" && endHour !== 12)
        endHour24 = endHour + 12;
    if (endPeriod === "AM" && endHour === 12)
        endHour24 = 0;
    // Validate time range: 8:00 AM to 8:00 PM (08:00 to 20:00 in 24-hour format)
    const startTimeInMinutes = startHour24 * 60 + startMin;
    const endTimeInMinutes = endHour24 * 60 + endMin;
    const minTime = 8 * 60; // 8:00 AM = 480 minutes
    const maxTime = 20 * 60; // 8:00 PM = 1200 minutes
    // Check if within valid hours
    if (startTimeInMinutes < minTime || endTimeInMinutes > maxTime) {
        return false;
    }
    // Check if it's exactly 20 minutes duration
    const duration = endTimeInMinutes - startTimeInMinutes;
    if (duration !== 20) {
        return false;
    }
    // Check if start time is on a 20-minute boundary (0, 20, 40 minutes past the hour)
    if (startMin % 20 !== 0) {
        return false;
    }
    return true;
}
// Helper function to validate that a date is in the future
function isFutureDate(dateString) {
    const inputDate = new Date(dateString);
    const now = new Date();
    // Clear time part for date-only comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const inputDateStart = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0, 0);
    return inputDateStart >= todayStart;
}
exports.scheduleVisit = (0, async_handler_1.asyncHandler)(async (request, response, next) => {
    // Validate request body
    const validatedData = scheduleVisitSchema.parse(request.body);
    const { visitDate, timeSlot, propertyId, couponCode } = validatedData;
    console.log("========== SCHEDULE VISIT ==========");
    console.log(request.body);
    console.log("USER:", request.user);
    // Get user ID from request (set by clerkAuthenticate middleware)
    const userId = request.user?.id;
    if (!userId) {
        return next(new app_error_1.AppError("User not found", 404));
    }
    // Validate that visitDate is in the future
    if (!isFutureDate(visitDate)) {
        return next(new app_error_1.AppError("Visit date must be in the future", 400));
    }
    // Validate time slot format and range
    if (!isValidTimeSlot(timeSlot)) {
        return next(new app_error_1.AppError("Invalid time slot. Time slots must be between 8:00 AM and 8:00 PM in 20-minute increments.", 400));
    }
    // Validate coupon code if provided
    if (couponCode) {
        const upperCode = couponCode.toUpperCase().trim();
        const coupon = await prisma_1.prisma.coupon.findFirst({
            where: {
                code: upperCode,
                isActive: true,
            },
        });
        if (!coupon) {
            return next(new app_error_1.AppError("Invalid or expired coupon code", 400));
        }
        // Check if coupon has exceeded max uses (if maxUses is set)
        if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
            return next(new app_error_1.AppError("Coupon has reached its maximum usage limit", 400));
        }
    }
    // Generate unique tokenId
    let tokenId = generateTokenId();
    let tokenExists = true;
    // Ensure tokenId is unique (very unlikely to collide, but let's be safe)
    while (tokenExists) {
        const existingVisit = await prisma_1.prisma.visit.findUnique({
            where: { tokenId },
        });
        if (!existingVisit) {
            tokenExists = false;
        }
        else {
            tokenId = generateTokenId(); // Generate a new one if collision occurs
        }
    }
    const existingVisit = await prisma_1.prisma.visit.findFirst({
        where: {
            studentId: userId,
            propertyId,
            visitDate: new Date(visitDate),
            timeSlot,
        },
    });
    if (existingVisit) {
        return next(new app_error_1.AppError("You have already scheduled this visit.", 400));
    }
    const visit = await prisma_1.prisma.visit.create({
        data: {
            tokenId,
            studentId: userId,
            propertyId,
            visitDate: new Date(visitDate),
            timeSlot,
            visitOtp: generateVisitOtp(),
            couponCode: couponCode?.toUpperCase().trim() || null,
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
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
                    owner: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
    });
    console.log("VISIT CREATED");
    console.log(visit);
    // If a valid coupon code was provided, increment its usage count
    if (couponCode) {
        const upperCode = couponCode.toUpperCase().trim();
        await prisma_1.prisma.coupon.update({
            where: { code: upperCode },
            data: { currentUses: { increment: 1 } },
        });
    }
    console.log("RETURNING SUCCESS");
    response.status(201).json({
        success: true,
        data: {
            visitId: visit.id,
            tokenId: visit.tokenId,
            visitOtp: visit.visitOtp,
            visitDate: visit.visitDate,
            timeSlot: visit.timeSlot,
            couponCode: visit.couponCode,
            status: visit.leadStatus,
            supervisor: visit_config_1.VISIT_CONFIG.supervisor,
            student: visit.student,
            property: visit.property,
        },
    });
});
exports.sendSupervisorOtp = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const { email } = request.body;
    if (!SUPERVISOR_EMAILS.includes(email.toLowerCase())) {
        throw new app_error_1.AppError("Unauthorized supervisor email.", 403);
    }
    const otp = crypto_1.default
        .randomInt(100000, 999999)
        .toString();
    const otpHash = await bcryptjs_1.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma_1.prisma.emailOtp.create({
        data: {
            email,
            codeHash: otpHash,
            purpose: "visiting_supervisor_login",
            expiresAt,
        },
    });
    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "LivingGo Visiting Supervisor OTP",
        html: `
      <div style="font-family:sans-serif">

      <h2>LivingGo Visiting Portal</h2>

      <p>Your OTP is</p>

      <h1>${otp}</h1>

      <p>
      Valid for 10 minutes.
      </p>

      </div>
      `,
    });
    response.json({
        success: true,
    });
});
exports.verifySupervisorOtp = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const { email, otp } = request.body;
    if (!SUPERVISOR_EMAILS.includes(email.toLowerCase())) {
        throw new app_error_1.AppError("Unauthorized supervisor.", 403);
    }
    const otpRecord = await prisma_1.prisma.emailOtp.findFirst({
        where: {
            email,
            purpose: "visiting_supervisor_login",
            usedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    if (!otpRecord) {
        throw new app_error_1.AppError("OTP expired.", 400);
    }
    const valid = await bcryptjs_1.default.compare(otp, otpRecord.codeHash);
    if (!valid) {
        throw new app_error_1.AppError("Invalid OTP.", 400);
    }
    await prisma_1.prisma.emailOtp.update({
        where: {
            id: otpRecord.id,
        },
        data: {
            usedAt: new Date(),
        },
    });
    const supervisor = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!supervisor) {
        throw new app_error_1.AppError("Supervisor account not found.", 404);
    }
    const token = (0, jwt_1.signJwt)({
        id: supervisor.id,
        email: supervisor.email,
        role: supervisor.role,
    });
    response.json({
        success: true,
        token,
        supervisor: {
            id: supervisor.id,
            name: supervisor.name,
            email: supervisor.email,
            role: supervisor.role,
        },
    });
});
exports.getAllVisits = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    const visits = await prisma_1.prisma.visit.findMany({
        where: {
            leadStatus: {
                in: ["SCHEDULED", "ASSIGNED"],
            },
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
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
                    owner: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
            intern: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    phone: true,
                },
            },
        },
        orderBy: [
            {
                visitDate: "asc",
            },
            {
                timeSlot: "asc",
            },
        ],
    });
    response.json({
        success: true,
        visits,
        total: visits.length,
    });
});
exports.assignLead = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { visitId } = req.params;
        const visit = await prisma_1.prisma.visit.findUnique({
            where: {
                id: visitId,
            },
            include: {
                property: {
                    include: {
                        owner: true,
                    },
                },
                student: true,
            },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        if (visit.leadStatus !== "SCHEDULED") {
            return res.status(400).json({
                success: false,
                message: "Lead already assigned.",
            });
        }
        const { internId, meetingPointId } = req.body;
        const updatedVisit = await prisma_1.prisma.visit.update({
            where: {
                id: visitId,
            },
            data: {
                leadStatus: "ASSIGNED",
                assignedLeadId: internId,
                meetingPointId: meetingPointId
            },
        });
        return res.json({
            success: true,
            message: "Lead assigned successfully.",
            visit: updatedVisit,
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
                supervisorId,
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
exports.getAvailableInterns = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const visitId = Array.isArray(req.params.visitId) ? req.params.visitId[0] : req.params.visitId;
        const visit = await prisma_1.prisma.visit.findUnique({
            where: {
                id: visitId,
            },
            select: {
                visitDate: true,
                timeSlot: true,
            },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        const busyInterns = await prisma_1.prisma.visit.findMany({
            where: {
                visitDate: visit.visitDate,
                timeSlot: visit.timeSlot,
                leadStatus: {
                    in: ["ASSIGNED", "MET"],
                },
                assignedLeadId: {
                    not: null,
                },
            },
            select: {
                assignedLeadId: true,
            },
        });
        const busyIds = busyInterns
            .map(v => v.assignedLeadId)
            .filter(Boolean);
        const interns = await prisma_1.prisma.intern.findMany({
            where: {
                active: true,
                id: {
                    notIn: busyIds,
                },
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
        const supervisorId = req.user.id;
        const { name, phone, password } = req.body;
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
        console.log("Intern Dashboard Visits:");
        console.log(visits);
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
exports.updateInternVisitStatus = (0, async_handler_1.asyncHandler)(async (req, res, _next) => {
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
        const valid = await bcryptjs_1.default.compare(otp, visit.visitOtp);
        if (!valid) {
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
