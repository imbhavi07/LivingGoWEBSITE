"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminOtp = exports.sendAdminOtp = exports.adminLogin = exports.login = exports.signup = void 0;
const async_handler_1 = require("../utils/async-handler");
const authService = __importStar(require("../services/auth.service"));
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const resend_1 = require("resend");
const jwt_1 = require("../utils/jwt");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const ADMIN_ROLES = {
    "semwalb3@gmail.com": "SUPER_ADMIN",
    "rctaccommodations@gmail.com": "SUPER_ADMIN",
    "falitnautiyal7@gmail.com": "admin",
    "shaannothere@gmail.com": "admin",
    "techshaan@hotmail.com": "admin",
    "faizaanahmedahmed123@gmail.com": "admin",
    "faizaanahmed601@gmail.com": "admin",
    "parulthakur200504@gmail.com": "admin",
    "parulllthakur17@gmail.com": "admin",
};
exports.signup = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const result = await authService.signup(request.body);
    response.status(201).json(result);
});
exports.login = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const result = await authService.login(request.body);
    response.json(result);
});
exports.adminLogin = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const result = await authService.login(request.body, ["admin", "SUPER_ADMIN"]);
    response.json(result);
});
exports.sendAdminOtp = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const { email } = request.body;
    if (!(email in ADMIN_ROLES)) {
        throw new app_error_1.AppError("Unauthorized email address.", 403);
    }
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    const otpHash = await bcryptjs_1.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma_1.prisma.emailOtp.create({
        data: { email, codeHash: otpHash, purpose: "admin_login", expiresAt },
    });
    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "LivingGo Admin OTP",
        html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Admin Login OTP</h2>
        <p>Your OTP for LivingGo admin access:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f0e8; border-radius: 12px;">
          ${otp}
        </div>
        <p style="color: #666;">Valid for 10 minutes. Do not share this with anyone.</p>
      </div>
    `,
    });
    response.json({ message: "OTP sent to your email." });
});
exports.verifyAdminOtp = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const { email, otp } = request.body;
    if (!(email in ADMIN_ROLES)) {
        throw new app_error_1.AppError("Unauthorized email address.", 403);
    }
    const otpRecord = await prisma_1.prisma.emailOtp.findFirst({
        where: {
            email,
            purpose: "admin_login",
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord)
        throw new app_error_1.AppError("OTP expired or not found. Please request a new one.", 400);
    const isValid = await bcryptjs_1.default.compare(otp, otpRecord.codeHash);
    if (!isValid)
        throw new app_error_1.AppError("Invalid OTP.", 400);
    await prisma_1.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
    });
    const role = ADMIN_ROLES[email];
    let admin = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!admin) {
        admin = await prisma_1.prisma.user.create({
            data: {
                name: email.split("@")[0],
                email,
                passwordHash: "otp-auth",
                role,
            },
        });
    }
    else if (admin.role !== role) {
        admin = await prisma_1.prisma.user.update({
            where: { id: admin.id },
            data: { role },
        });
    }
    const token = (0, jwt_1.signJwt)({
        id: admin.id,
        email: admin.email,
        role: admin.role,
    });
    response.json({
        token,
        user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
});
