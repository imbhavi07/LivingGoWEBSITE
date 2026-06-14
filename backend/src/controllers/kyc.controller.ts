import type { Request, Response } from "express";
import axios from "axios";
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

export const generateAadhaarOtp = asyncHandler(async (req: Request, res: Response) => {
  const { aadhaarNumber } = req.body;
  
  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    throw new AppError("A valid 12-digit Aadhaar number is required", 400);
  }

  const sandboxApiKey = process.env.SANDBOX_API_KEY;
  const sandboxApiSecret = process.env.SANDBOX_API_SECRET;

  if (!sandboxApiKey || !sandboxApiSecret) {
    throw new AppError("Sandbox API credentials missing", 500);
  }

  try {
    // 1. Authenticate with Sandbox
    const authResponse = await axios.post("https://api.sandbox.co.in/authenticate", {}, {
      headers: { "x-api-key": sandboxApiKey, "x-api-secret": sandboxApiSecret, "x-api-version": "1.0" }
    });
    const accessToken = authResponse.data?.data?.access_token || authResponse.data?.access_token;

    // 2. Request OTP
    const otpResponse = await axios.post("https://api.sandbox.co.in/kyc/aadhaar/okyc/otp", {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      "aadhaar_number": aadhaarNumber,
      "consent": "y",
      "reason": "LivingGo Owner KYC Verification"
    }, {
      headers: { "Authorization": accessToken, "x-api-key": sandboxApiKey, "x-api-version": "1.0" }
    });

    const referenceId = otpResponse.data?.data?.reference_id;
    
    if (!referenceId) throw new AppError("Failed to get reference ID from Sandbox", 500);

    res.status(200).json({ success: true, referenceId, message: "OTP sent to registered mobile number" });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Sandbox OTP Generation Error:", error.response?.data || error.message);
      throw new AppError(error.response?.data?.message || "Failed to generate OTP", 400);
    }
    throw new AppError("Internal server error during OTP generation", 500);
  }
});

export const verifyAadhaarOtp = asyncHandler(async (req: Request, res: Response) => {
  const { referenceId, otp, email } = req.body;
  
  if (!referenceId || !otp || !email) {
    throw new AppError("Missing required fields for verification", 400);
  }

  const sandboxApiKey = process.env.SANDBOX_API_KEY;
  const sandboxApiSecret = process.env.SANDBOX_API_SECRET;

  try {
    // 1. Authenticate with Sandbox
    const authResponse = await axios.post("https://api.sandbox.co.in/authenticate", {}, {
      headers: { "x-api-key": sandboxApiKey as string, "x-api-secret": sandboxApiSecret as string, "x-api-version": "1.0" }
    });
    const accessToken = authResponse.data?.data?.access_token || authResponse.data?.access_token;

    // 2. Verify the OTP
    const verifyResponse = await axios.post("https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify", {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
      "reference_id": referenceId,
      "otp": otp
    }, {
      headers: { "Authorization": accessToken, "x-api-key": sandboxApiKey as string, "x-api-version": "1.0" }
    });

    // 3. Approve User in Database if successful
    const responseData = verifyResponse.data;
    if (responseData?.code === 200 || responseData?.data?.status === "VALID") {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { verificationStatus: "approved" }
      });
      
      res.status(200).json({ success: true, message: "Identity verified successfully", data: updatedUser });
    } else {
      throw new AppError("Invalid OTP provided", 400);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Sandbox OTP Verification Error:", error.response?.data || error.message);
      throw new AppError("Invalid or expired OTP", 400);
    }
    throw new AppError("Internal server error during verification", 500);
  }
});