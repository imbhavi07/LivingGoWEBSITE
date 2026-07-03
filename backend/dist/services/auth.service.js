"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const jwt_1 = require("../utils/jwt");
const userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    createdAt: true
};
async function signup(input) {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing)
        throw new app_error_1.AppError("Email is already registered", 409);
    const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
    const user = await prisma_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            passwordHash,
            role: input.role,
            verificationStatus: input.role === "owner" ? "pending_approval" : "not_required",
        },
        select: userSelect
    });
    return {
        user,
        token: (0, jwt_1.signJwt)({ id: user.id, email: user.email, role: user.role })
    };
}
async function login(input, allowedRoles) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (!user)
        throw new app_error_1.AppError("Invalid email or password", 401);
    if (user.status === "suspended")
        throw new app_error_1.AppError("Account is suspended", 403);
    if (allowedRoles && !allowedRoles.includes(user.role))
        throw new app_error_1.AppError("Forbidden", 403);
    const isValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
    if (!isValid)
        throw new app_error_1.AppError("Invalid email or password", 401);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return {
        user: safeUser,
        token: (0, jwt_1.signJwt)({ id: user.id, email: user.email, role: user.role })
    };
}
