import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as authService from "../services/auth.service";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ADMIN_EMAILS = [
  "rctaccommodations@gmail.com",
  "semwalb3@gmail.com",
  "falitnautiyal7@gmail.com",
];

export const signup = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.signup(request.body);
  response.status(201).json(result);
});

export const login = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.login(request.body);
  response.json(result);
});

export const adminLogin = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.login(request.body, ["admin"]);
  response.json(result);
});

export const sendAdminOtp = asyncHandler(async (request: Request, response: Response) => {
  const { email } = request.body as { email: string };

  if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
    throw new AppError("Unauthorized email address.", 403);
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailOtp.create({
    data: { email, codeHash: otpHash, purpose: "admin_login", expiresAt },
  });

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "LivingGo Admin OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Admin Login OTP</h2>
        <p>Your OTP for LivingGo admin access:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f0e8; border-radius: 12px;">
          ${otp}
        </div>
        <p style="color: #666;">Valid for 10 minutes. Do not share this with anyone.</p>
      </div>
    `,
  });

  response.json({ message: "OTP sent to your email." });
});

export const verifyAdminOtp = asyncHandler(async (request: Request, response: Response) => {
  const { email, otp } = request.body as { email: string; otp: string };

  if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
    throw new AppError("Unauthorized email address.", 403);
  }

  const otpRecord = await prisma.emailOtp.findFirst({
    where: {
      email,
      purpose: "admin_login",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) throw new AppError("OTP expired or not found. Please request a new one.", 400);

  const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
  if (!isValid) throw new AppError("Invalid OTP.", 400);

  await prisma.emailOtp.update({
    where: { id: otpRecord.id },
    data: { usedAt: new Date() },
  });

  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    admin = await prisma.user.create({
      data: { name: email.split("@")[0], email, passwordHash: "otp-auth", role: "admin" },
    });
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  response.json({
    token,
    user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});