import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { z } from "zod";

// Validation schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  // Student profile fields
  dob: z.string().datetime().optional(),
  mobileNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  xHandle: z.string().optional(),
  university: z.string().optional(),
  courseYear: z.string().optional(),
  gender: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export async function updateProfile(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    // Validate request body
    const validatedData = profileUpdateSchema.parse(request.body);

    // Get user ID from request (set by clerkAuthenticate middleware)
    const userId = request.user?.id;

    if (!userId) {
      return next(new AppError("User not found", 404));
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
}

export async function getProfile(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return next(new AppError("User not found", 404));
    }

    const user = await prisma.user.findUnique({
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
      return next(new AppError("User not found", 404));
    }

    response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}