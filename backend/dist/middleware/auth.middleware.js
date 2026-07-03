"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.clerkAuthenticate = clerkAuthenticate;
exports.authorize = authorize;
exports.protect = protect;
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
        const email = payload.email;
        const firstName = payload.first_name;
        const lastName = payload.last_name;
        const name = ((firstName ?? '') + ' ' + (lastName ?? '')).trim() || undefined;
        // Find or create user record based on clerkId
        let user = await prisma_1.prisma.user.findFirst({
            where: { clerkId: clerkUserId },
            select: { id: true, email: true, role: true, status: true, verificationStatus: true }
        });
        if (!user) {
            // Auto-create baseline user record for missing webhook / first-time login
            user = await prisma_1.prisma.user.create({
                data: {
                    clerkId: clerkUserId,
                    email: email ?? `${clerkUserId}@users.clerk.dev`, // fallback email
                    name: name ?? 'Clerk User',
                    role: 'student', // default to student for token payment flow; adjust if needed elsewhere
                    status: 'active',
                    passwordHash: 'dummy_hash', // placeholder; password auth not used
                    verificationStatus: 'not_required',
                },
                select: { id: true, email: true, role: true, status: true, verificationStatus: true }
            });
        }
        if (user.status === "suspended") {
            return next(new app_error_1.AppError("Account is inactive or suspended", 401));
        }
        request.user = {
            id: user.id,
            email: user.email,
            role: user.role, // This will now be 'owner'
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
        if (!request.user) {
            return next(new app_error_1.AppError("Authentication required", 401));
        }
        const role = request.user.role;
        // SUPER_ADMIN bypasses all role checks
        if (role === "SUPER_ADMIN") {
            return next();
        }
        if (!roles.includes(role)) {
            return next(new app_error_1.AppError("Forbidden", 403));
        }
        next();
    };
}
function protect(request, response, next) {
    return clerkAuthenticate(request, response, next);
}
