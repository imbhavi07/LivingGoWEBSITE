import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { uploadMany } from "./cloudinary.service";
import { sendOwnerOtpEmail } from "./email.service";

const OTP_PURPOSE = "owner-signup";
const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFIED_WINDOW_MS = 30 * 60 * 1000;

type OwnerSignupInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  ownerType: "PG Owner" | "Flat Owner";
  aadhaarNumber: string;
  legalAccepted: true;
};

export async function sendOwnerOtp(email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email is already registered", 409);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(otp, 10);

  await prisma.emailOtp.create({
    data: {
      email,
      codeHash,
      purpose: OTP_PURPOSE,
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    }
  });

  await sendOwnerOtpEmail(email, otp);
}

export async function verifyOwnerOtp(email: string, otp: string) {
  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      purpose: OTP_PURPOSE,
      usedAt: null
    },
    orderBy: { createdAt: "desc" }
  });

  if (!record) throw new AppError("OTP not found. Request a new one.", 400);
  if (record.expiresAt.getTime() < Date.now()) throw new AppError("OTP expired. Request a new one.", 400);

  const matches = await bcrypt.compare(otp, record.codeHash);
  if (!matches) throw new AppError("Incorrect OTP.", 400);

  await prisma.emailOtp.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() }
  });
}

export async function completeOwnerSignup(input: OwnerSignupInput, files: Express.Multer.File[]) {
  const verifiedOtp = await prisma.emailOtp.findFirst({
    where: {
      email: input.email,
      purpose: OTP_PURPOSE,
      usedAt: null,
      verifiedAt: { not: null }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!verifiedOtp) throw new AppError("Verify your email OTP before signing up.", 400);
  if (verifiedOtp.verifiedAt && verifiedOtp.verifiedAt.getTime() + VERIFIED_WINDOW_MS < Date.now()) {
    throw new AppError("Verified OTP expired. Request a new one.", 400);
  }

  if (files.length < 2) {
    throw new AppError("Upload Aadhaar front and back images.", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email is already registered", 409);

  const uploads = await uploadMany(files.slice(0, 2));
  const passwordHash = await bcrypt.hash(input.password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: "owner",
        ownerType: input.ownerType,
        aadhaarNumber: input.aadhaarNumber,
        aadhaarFrontUrl: uploads[0]?.secure_url,
        aadhaarBackUrl: uploads[1]?.secure_url,
        legalAcceptedAt: new Date(),
        verificationStatus: "pending_approval"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
        ownerType: true
      }
    });
  } catch (error: unknown) {
    console.error("PRISMA DATABASE CRASH:", error);
    
    // Define the expected shape of a Prisma error to satisfy ESLint (no 'any' allowed)
    type PrismaErrorShape = {
      code?: string;
      meta?: { target?: string[] };
      message?: string;
    };

    // Cast the unknown error to our defined shape
    const prismaError = error as PrismaErrorShape;

    // Check for the unique constraint violation (like a duplicate phone number/email)
    if (prismaError.code === 'P2002') {
       throw new AppError(`A user with this ${prismaError.meta?.target?.[0] || 'information'} already exists.`, 409);
    }
    
    // Fallback for all other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new AppError(`Database Error: ${errorMessage}`, 400);
  }

  await prisma.emailOtp.update({
    where: { id: verifiedOtp.id },
    data: { usedAt: new Date() }
  });

  return {
    message: "Owner application submitted for admin approval.",
    user
  };
}

export async function getPendingOwnerApprovals() {
  return prisma.user.findMany({
    where: {
      role: "owner",
      verificationStatus: "pending_approval"
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      ownerType: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      aadhaarNumber: true,
      legalAcceptedAt: true,
      verificationStatus: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPendingOwnerApprovalById(id: string) {
  const user = await prisma.user.findFirst({
    where: {
      id,
      role: "owner"
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      ownerType: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      aadhaarNumber: true,
      legalAcceptedAt: true,
      verificationStatus: true,
      createdAt: true
    }
  });

  if (!user) throw new AppError("Owner application not found", 404);
  return user;
}

export async function reviewOwnerApproval(id: string, status: "approved" | "rejected") {
  const user = await prisma.user.findFirst({
    where: {
      id,
      role: "owner"
    }
  });

  if (!user) throw new AppError("Owner application not found", 404);

  return prisma.user.update({
    where: { id },
    data: {
      verificationStatus: status,
      reviewedAt: new Date(),
      ...(status === "approved" && { role: "owner" }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      ownerType: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      aadhaarNumber: true,
      legalAcceptedAt: true,
      verificationStatus: true,
      createdAt: true
    }
  });
}
