import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import crypto from "crypto";

// Validation schema for visit scheduling
const scheduleVisitSchema = z.object({
  visitDate: z.string().datetime(),
  timeSlot: z.string(),
  propertyId: z.string().min(1, "Property ID is required"),
  couponCode: z.string().optional().nullable(),
});

// Helper function to generate a random 6-character alphanumeric string
function generateTokenId(): string {
  const randomBytes = crypto.randomBytes(3);
  const hexString = randomBytes.toString("hex").toUpperCase();
  return `VISIT-${hexString}`;
}

// Helper function to validate time slot format and range
function isValidTimeSlot(timeSlot: string): boolean {
  // Expected format: "HH:MM AM/PM - HH:MM AM/PM" (e.g., "09:20 AM - 09:40 AM")
  const timeSlotRegex = /^(\d{2}):(\d{2}) (AM|PM) - (\d{2}):(\d{2}) (AM|PM)$/;
  const match = timeSlot.match(timeSlotRegex);

  if (!match) return false;

  const [, startHourStr, startMinStr, startPeriod, endHourStr, endMinStr, endPeriod] = match;

  const startHour = parseInt(startHourStr, 10);
  const startMin = parseInt(startMinStr, 10);
  const endHour = parseInt(endHourStr, 10);
  const endMin = parseInt(endMinStr, 10);

  // Convert to 24-hour format for easier comparison
  let startHour24 = startHour;
  let endHour24 = endHour;

  if (startPeriod === "PM" && startHour !== 12) startHour24 = startHour + 12;
  if (startPeriod === "AM" && startHour === 12) startHour24 = 0;

  if (endPeriod === "PM" && endHour !== 12) endHour24 = endHour + 12;
  if (endPeriod === "AM" && endHour === 12) endHour24 = 0;

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
function isFutureDate(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const now = new Date();

  // Clear time part for date-only comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const inputDateStart = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0, 0, 0, 0
  );

  return inputDateStart >= todayStart;
}

export const scheduleVisit = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    // Validate request body
    const validatedData = scheduleVisitSchema.parse(request.body);

    const { visitDate, timeSlot, propertyId, couponCode } = validatedData;

    // Get user ID from request (set by clerkAuthenticate middleware)
    const userId = request.user?.id;

    if (!userId) {
      return next(new AppError("User not found", 404));
    }

    // Validate that visitDate is in the future
    if (!isFutureDate(visitDate)) {
      return next(new AppError("Visit date must be in the future", 400));
    }

    // Validate time slot format and range
    if (!isValidTimeSlot(timeSlot)) {
      return next(
        new AppError(
          "Invalid time slot. Time slots must be between 8:00 AM and 8:00 PM in 20-minute increments.",
          400
        )
      );
    }

    // Validate coupon code if provided
    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: upperCode,
          isActive: true,
        },
      });

      if (!coupon) {
        return next(new AppError("Invalid or expired coupon code", 400));
      }

      // Check if coupon has exceeded max uses (if maxUses is set)
      if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
        return next(new AppError("Coupon has reached its maximum usage limit", 400));
      }
    }

    // Generate unique tokenId
    let tokenId = generateTokenId();
    let tokenExists = true;

    // Ensure tokenId is unique (very unlikely to collide, but let's be safe)
    while (tokenExists) {
      const existingVisit = await prisma.visit.findUnique({
        where: { tokenId },
      });

      if (!existingVisit) {
        tokenExists = false;
      } else {
        tokenId = generateTokenId(); // Generate a new one if collision occurs
      }
    }

    // Create the visit record
    const visit = await prisma.visit.create({
      data: {
        tokenId,
        studentId: userId,
        propertyId: propertyId,
        visitDate: new Date(visitDate),
        timeSlot,
        couponCode: couponCode?.toUpperCase().trim() || null,
        // leadStatus defaults to SCHEDULED via schema
        // createdAt and updatedAt are set automatically
      },
    });

    // If a valid coupon code was provided, increment its usage count
    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
      await prisma.coupon.update({
        where: { code: upperCode },
        data: { currentUses: { increment: 1 } },
      });
    }

    response.status(201).json({
      success: true,
      data: {
        visitId: visit.id,
        tokenId: visit.tokenId,
        visitDate: visit.visitDate,
        timeSlot: visit.timeSlot,
        couponCode: visit.couponCode,
        status: visit.leadStatus,
      },
    });
  }
);