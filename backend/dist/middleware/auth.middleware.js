"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.clerkAuthenticate = clerkAuthenticate;
exports.authorize = authorize;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const jwt_1 = require("../utils/jwt");
const backend_1 = require("@clerk/backend");
async function authenticate(request, _response, next) {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return next(new app_error_1.AppError("Authentication token is required", 401));
    }
    try {
        const payload = (0, jwt_1.verifyJwt)(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, email: true, role: true, status: true, verificationStatus: true }
        });
        if (!user || user.status === "suspended") {
            return next(new app_error_1.AppError("Account is inactive or suspended", 401));
        }
        request.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus
        };
        next();
    }
    catch {
        next(new app_error_1.AppError("Invalid or expired token", 401));
    }
}
async function clerkAuthenticate(request, _response, next) {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return next(new app_error_1.AppError("Authentication token is required", 401));
    }
    if (process.env.NODE_ENV === 'development' && token === 'development-token') {
        const devEmail = 'dev@example.com';
        let user = await prisma_1.prisma.user.findUnique({ where: { email: devEmail } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    email: devEmail,
                    name: 'Dev User',
                    role: 'owner',
                    status: 'active',
                    clerkId: 'dev_clerk_id',
                    passwordHash: 'dummy_hash',
                },
            });
        }
        request.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus
        };
        return next();
    }
    try {
        const payload = await (0, backend_1.verifyToken)(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        const clerkUserId = payload.sub;
        const user = await prisma_1.prisma.user.findFirst({
            where: { clerkId: clerkUserId },
            select: { id: true, email: true, role: true, status: true, verificationStatus: true }
        });
        if (!user) {
            return next(new app_error_1.AppError("User not found. Please sign up first.", 401));
        }
        if (user.status === "suspended") {
            return next(new app_error_1.AppError("Account is inactive or suspended", 401));
        }
        request.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus
        };
        next();
    }
    catch (error) {
        console.error("❌ Clerk authentication error:", error);
        return next(new app_error_1.AppError("Invalid or expired Clerk token", 401));
    }
}
function authorize(...roles) {
    return (request, _response, next) => {
        if (!request.user)
            return next(new app_error_1.AppError("Authentication required", 401));
        if (!roles.includes(request.user.role))
            return next(new app_error_1.AppError("Forbidden", 403));
        next();
    };
}
