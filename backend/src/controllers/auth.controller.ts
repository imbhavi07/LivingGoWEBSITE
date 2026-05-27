import type { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as authService from "../services/auth.service";
import * as ownerVerificationService from "../services/owner-verification.service";

export const signup = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.signup(request.body);
  response.status(201).json(result);
});

export const ownerSignup = asyncHandler(async (request: Request, response: Response) => {
  const files = (request.files as Express.Multer.File[]) ?? [];
  const result = await ownerVerificationService.completeOwnerSignup(request.body, files);
  response.status(201).json(result);
});

export const sendOwnerOtp = asyncHandler(async (request: Request, response: Response) => {
  await ownerVerificationService.sendOwnerOtp(request.body.email);
  response.status(201).json({ message: "OTP sent successfully." });
});

export const verifyOwnerOtp = asyncHandler(async (request: Request, response: Response) => {
  await ownerVerificationService.verifyOwnerOtp(request.body.email, request.body.otp);
  response.json({ message: "OTP verified successfully." });
});

export const login = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.login(request.body);
  response.json(result);
});

export const ownerLogin = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.login(request.body, ["owner", "admin"] as Role[]);
  response.cookie("LivingGo_verification", result.user.verificationStatus ?? "not_required", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  response.json(result);
});

export const adminLogin = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.login(request.body, ["admin"] as Role[]);
  response.json(result);
});
