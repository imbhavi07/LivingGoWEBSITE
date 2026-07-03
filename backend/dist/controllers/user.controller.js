"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
exports.getProfile = getProfile;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const zod_1 = require("zod");
// Validation schema for profile update
const profileUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: zod_1.z.string().optional(),
    // Student profile fields
    dob: zod_1.z.string().datetime().optional(),
    mobileNumber: zod_1.z.string().optional(),
    instagramHandle: zod_1.z.string().optional(),
    xHandle: zod_1.z.string().optional(),
    university: zod_1.z.string().optional(),
    courseYear: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
});
async function updateProfile(request, response, next) {
    try {
        // Validate request body
        const validatedData = profileUpdateSchema.parse(request.body);
        // Get user ID from request (set by clerkAuthenticate middleware)
        const userId = request.user?.id;
        if (!userId) {
            return next(new app_error_1.AppError("User not found", 404));
        }
        // Update user in database
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: validatedData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                dob: true,
                mobileNumber: true,
                instagramHandle: true,
                xHandle: true,
                university: true,
                courseYear: true,
                gender: true,
                emergencyContact: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        response.json({
            success: true,
            data: updatedUser,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return next(new app_error_1.AppError(error.errors[0].message, 400));
        }
        next(error);
    }
}
async function getProfile(request, response, next) {
    try {
        const userId = request.user?.id;
        if (!userId) {
            return next(new app_error_1.AppError("User not found", 404));
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                dob: true,
                mobileNumber: true,
                instagramHandle: true,
                xHandle: true,
                university: true,
                courseYear: true,
                gender: true,
                emergencyContact: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return next(new app_error_1.AppError("User not found", 404));
        }
        response.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
}
