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

export const initiateDigilockerSession = asyncHandler(async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) throw new AppError("Email is required", 400);

  const owner = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, clerkId: true, verificationStatus: true },
  });

  if (!owner) throw new AppError("Owner not found", 404);

  if (owner.verificationStatus === "approved") {
    throw new AppError("Your KYC is already approved.", 400);
  }

  if (!owner.clerkId) {
    throw new AppError("Clerk ID not found for this user.", 400);
  }

  const sandboxApiKey = process.env.SANDBOX_API_KEY;
  const sandboxApiSecret = process.env.SANDBOX_API_SECRET;

  if (!sandboxApiKey || !sandboxApiSecret) {
    throw new AppError("DigiLocker integration not configured", 500);
  }

  try {
    const callbackUrl = process.env.CORS_ORIGIN || "http://localhost:3000/owner/kyc";

    // Step 1: Authenticate with Sandbox to generate access token
    const authResponse = await axios.post(
      "https://api.sandbox.co.in/authenticate",
      {},
      {
        headers: {
          "x-api-key": sandboxApiKey,
          "x-api-secret": sandboxApiSecret,
          "x-api-version": "1.0",
        },
      }
    );

    const accessToken = authResponse.data?.data?.access_token;
    
    if (!accessToken) {
      throw new AppError("Failed to generate Sandbox access token", 500);
    }


// Step 2: Initiate DigiLocker Session with the token
    const response = await axios.post(
      "https://api.sandbox.co.in/kyc/digilocker/sessions/init",
      {
        "@entity": "in.co.sandbox.kyc.digilocker.session.request",
        "flow": "signin",
        "redirect_url": callbackUrl,
        "doc_types": ["aadhaar"]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": accessToken, 
          "x-api-key": sandboxApiKey,
          "x-api-version": "1.0",
        },
      }
    );

    // Sandbox nests the URL inside data.data
    const authorizationUrl = response.data?.data?.authorization_url;

    if (!authorizationUrl) {
      throw new AppError("Failed to get authorization URL from Sandbox", 500);
    }

    res.status(200).json({
      success: true,
      redirectUrl: authorizationUrl,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Sandbox API error:", error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error("DigiLocker initiation error:", error.message);
    } else {
      console.error("DigiLocker initiation error:", String(error));
    }
    throw new AppError("Failed to initiate KYC session", 500);
  }
});