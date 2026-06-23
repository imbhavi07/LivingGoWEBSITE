// backend/src/controllers/token-payment.controller.ts  (NEW FILE)

import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import * as tokenService from "../services/token-payment.service";

function requireUser(req: Request) {
  if (!req.user) throw new AppError("Authentication required", 401);
  return req.user;
}

// Student: submit UTR after paying token
export const submitTokenPayment = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const propertyId = String(req.params.id);
  const { utrNumber } = req.body as { utrNumber: string };

  if (!utrNumber?.trim()) throw new AppError("UTR number is required", 400);

  const payment = await tokenService.createTokenPayment(user.id, propertyId, utrNumber.trim());
  res.status(201).json(payment);
});

// Student: get their own token payments
export const getMyTokenPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const payments = await tokenService.getStudentTokenPayments(user.id);
  res.json(payments);
});

// Admin: get all token payments (optional ?status=pending filter)
export const adminGetTokenPayments = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const payments = await tokenService.getAllTokenPayments(status);
  res.json(payments);
});

// Admin: approve or reject
export const adminModerateTokenPayment = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { action } = req.body as { action: "approved" | "rejected" };
  if (!["approved", "rejected"].includes(action)) throw new AppError("Invalid action", 400);
  const result = await tokenService.moderateTokenPayment(id, action);
  res.json(result);
});

// Owner: see payments for their properties
export const ownerGetTokenPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const payments = await tokenService.getOwnerTokenPayments(user.id);
  res.json(payments);
});

export const verifyVisit = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = String(req.params.id);
  const { otp } = req.body;

  const result = await tokenService.verifyVisit(paymentId, otp);

  res.json(result);
});

export const settleRent = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = String(req.params.id);

  const result = await tokenService.settleRent(paymentId);

  res.json(result);
});