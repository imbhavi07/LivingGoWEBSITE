import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { prisma } from "../config/prisma";
import { uploadMany } from "../services/cloudinary.service";

export const submitKyc = asyncHandler(async (req: Request, res: Response) => {
  const clerkEmail = req.body.clerkEmail as string;
  if (!clerkEmail) throw new AppError("Email is required", 400);

  const owner = await prisma.user.findUnique({ where: { email: clerkEmail } });
  if (!owner) throw new AppError("Owner not found. Please sign up first.", 404);

  const ownerId = owner.id;

  if (owner.verificationStatus === "approved") {
    throw new AppError("Your KYC is already approved.", 400);
  }

  const { name, phone, ownerType, aadhaarNumber } = req.body as {
    name: string;
    phone: string;
    ownerType: string;
    aadhaarNumber: string;
  };

  if (!name || !phone || !ownerType || !aadhaarNumber) {
    throw new AppError("All fields are required.", 400);
  }

  if (!/^\d{12}$/.test(aadhaarNumber)) {
    throw new AppError("Aadhaar number must be exactly 12 digits.", 400);
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const frontFile = files?.aadhaarFront?.[0];
  const backFile = files?.aadhaarBack?.[0];

  if (!frontFile || !backFile) {
    throw new AppError("Both Aadhaar front and back images are required.", 400);
  }

  const uploads = await uploadMany([frontFile, backFile]);

  const updatedOwner = await prisma.user.update({
    where: { id: ownerId },
    data: {
      name,
      phone,
      ownerType,
      aadhaarNumber,
      aadhaarFrontUrl: uploads[0]?.secure_url,
      aadhaarBackUrl: uploads[1]?.secure_url,
      verificationStatus: "pending_approval",
      legalAcceptedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      verificationStatus: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "KYC submitted successfully. Awaiting admin approval.",
    data: updatedOwner,
  });
});

export const getKycStatus = asyncHandler(async (req: Request, res: Response) => {
  const clerkEmail = req.query.email as string;
  if (!clerkEmail) throw new AppError("Email is required", 400);

  const owner = await prisma.user.findUnique({
    where: { email: clerkEmail },
    select: {
      verificationStatus: true,
      aadhaarNumber: true,
      reviewedAt: true,
    },
  });

  if (!owner) throw new AppError("Owner not found", 404);

  res.status(200).json({
    success: true,
    data: {
      verificationStatus: owner.verificationStatus,
      aadhaarLast4: owner.aadhaarNumber?.slice(-4) ?? null,
      reviewedAt: owner.reviewedAt,
    },
  });
});