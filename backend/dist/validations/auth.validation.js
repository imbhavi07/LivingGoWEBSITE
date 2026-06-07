"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpSchema = exports.sendOtpSchema = exports.loginSchema = exports.ownerSignupSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(80),
        email: zod_1.z.string().email().toLowerCase(),
        phone: zod_1.z.string().min(8).max(20).optional(),
        password: zod_1.z.string().min(8).max(128),
        role: zod_1.z.enum(["student", "owner"]).default("student")
    })
});
exports.ownerSignupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(80),
        email: zod_1.z.string().email().toLowerCase(),
        phone: zod_1.z.string().min(8).max(20),
        password: zod_1.z.string().min(8).max(128),
        ownerType: zod_1.z.enum(["PG Owner", "Flat Owner"]),
        aadhaarNumber: zod_1.z.string().min(12).max(20),
        legalAccepted: zod_1.z.preprocess((value) => value === true || value === "true", zod_1.z.literal(true))
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().toLowerCase(),
        password: zod_1.z.string().min(8).max(128)
    })
});
exports.sendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().toLowerCase()
    })
});
exports.verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().toLowerCase(),
        otp: zod_1.z.string().length(6)
    })
});
