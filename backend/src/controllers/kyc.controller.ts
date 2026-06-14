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
  
  if (!email) {
    throw new AppError("Email is required to map the KYC session", 400);
  }

  const sandboxApiKey = process.env.SANDBOX_API_KEY;
  const sandboxApiSecret = process.env.SANDBOX_API_SECRET;

  if (!sandboxApiKey || !sandboxApiSecret) {
    throw new AppError("Sandbox API credentials missing", 500);
  }

  try {
    // 1. Authenticate with Sandbox to get the Access Token
    const authResponse = await axios.post("https://api.sandbox.co.in/authenticate", {}, {
      headers: { 
        "x-api-key": sandboxApiKey, 
        "x-api-secret": sandboxApiSecret, 
        "x-api-version": "1.0" 
      }
    });
    
    const accessToken = authResponse.data?.access_token || authResponse.data?.data?.access_token;

    // 2. Request the DigiLocker Portal Redirect URL
    const response = await axios.post("https://api.sandbox.co.in/kyc/digilocker/sessions/init", {
      "@entity": "in.co.sandbox.kyc.digilocker.session.request",
      "flow": "signin",
      "redirect_url": "https://livinggo.in/owner/kyc",
      "doc_types": ["aadhaar"]
    }, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": accessToken, 
        "x-api-key": sandboxApiKey, 
        "x-api-version": "1.0" 
      }
    });

    // 3. Extract URL and send to frontend
    const authorizationUrl = response.data?.data?.authorization_url;
    
    if (!authorizationUrl) {
      throw new AppError("Failed to get DigiLocker URL from Sandbox", 500);
    }

    res.status(200).json({ success: true, redirectUrl: authorizationUrl });
    
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("DigiLocker Init Error:", error.response?.data || error.message);
    } else {
      console.error("DigiLocker Init Error:", String(error));
    }
    throw new AppError("Failed to initiate secure DigiLocker session", 500);
  }
});

export const handleSandboxWebhook = asyncHandler(async (req: Request, res: Response) => {
  const webhookSecret = req.headers['x-webhook-secret'] || req.headers['authorization'];
  
  if (webhookSecret !== process.env.SANDBOX_WEBHOOK_SECRET) {
    console.error("🚨 Unauthorized Webhook Attempt:", req.ip);
    throw new AppError("Unauthorized webhook", 401);
  }

  const payload = req.body;
  console.log("✅ Sandbox Webhook Received!", JSON.stringify(payload, null, 2));

  // If Sandbox sends a verification success status, mark user approved in DB
  if (payload?.data?.status === "VALID" || payload?.code === 200) {
    const email = payload?.data?.email; // Adjust key based on Sandbox's incoming body
    if (email) {
      await prisma.user.update({
        where: { email },
        data: { verificationStatus: "approved" }
      });
    }
  }

  res.status(200).json({ success: true, message: "Webhook processed successfully" });
});

export const completeDigilockerSession = asyncHandler(async (req: Request, res: Response) => {
  const { email, sessionId } = req.body;

  if (!email || !sessionId) {
    throw new AppError("Email and Session ID are required", 400);
  }

  const sandboxApiKey = process.env.SANDBOX_API_KEY;
  const sandboxApiSecret = process.env.SANDBOX_API_SECRET;

  try {
    // 1. Authenticate with Sandbox
    console.log("Authenticating with Sandbox API...");
    const authResponse = await axios.post("https://api.sandbox.co.in/authenticate", {}, {
      headers: { "x-api-key": sandboxApiKey as string, "x-api-secret": sandboxApiSecret as string, "x-api-version": "1.0" }
    });
    const accessToken = authResponse.data?.access_token || authResponse.data?.data?.access_token;
    console.log("Authenticated successfully, got access token");

    // 2. Fetch the verified session data
    console.log(`Fetching session details for sessionId: ${sessionId}`);
    const sessionDetails = await axios.get(`https://api.sandbox.co.in/kyc/digilocker/sessions/${sessionId}`, {
      headers: { "Authorization": accessToken, "x-api-key": sandboxApiKey as string, "x-api-version": "1.0" }
    });

    console.log("Session details response:", sessionDetails.data);
    const sessionData = sessionDetails.data?.data;
    if (!sessionData || sessionData.status !== "VALID") {
        console.error("Session not valid:", sessionData);
        throw new AppError("DigiLocker session not valid", 400);
    }

    // 3. Extract data (Sandbox returns parsed_data for these documents)
    const aadhaarDocument = sessionData.documents?.find((doc: unknown) => (doc as { type?: string; doctype?: string }).type === "aadhaar" || (doc as { type?: string; doctype?: string }).doctype === "AADHAAR");
    const parsedData = aadhaarDocument?.parsed_data || {};
    console.log("Parsed Aadhaar data:", parsedData);

    // 4. Seal it in the Neon database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name: parsedData.name || "Verified Owner",
        aadhaarNumber: parsedData.uid || parsedData.aadhaar_number || null,
        verificationStatus: "pending_approval"
      }
    });

    console.log("User updated successfully:", updatedUser);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: unknown) {
    console.error("KYC Sync Error:", error);
    // If it's an Axios error, log the response details
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    throw new AppError("Failed to sync verified data", 500);
  }
});