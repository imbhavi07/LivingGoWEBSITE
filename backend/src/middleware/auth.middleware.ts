import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { verifyJwt } from "../utils/jwt";
import { verifyToken } from "@clerk/backend";

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication token is required", 401));
  }

  try {
    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user || user.status === "suspended") {
      return next(new AppError("Account is inactive or suspended", 401));
    }

    request.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export async function clerkAuthenticate(request: Request, _response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication token is required", 401));
  }

  // In development, allow a mock token for testing
  if (process.env.NODE_ENV === 'development' && token === 'development-token') {
    const devEmail = 'dev@example.com';
    let user = await prisma.user.findUnique({ where: { email: devEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: devEmail,
          name: 'Dev User',
          role: 'owner',
          status: 'active',
          clerkId: 'dev_clerk_id',
          passwordHash: 'dummy_hash', // dummy value for development
        },
      });
    }
    request.user = { id: user.id, email: user.email, role: user.role };
    return next();
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkUserId = payload.sub;

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user) {
      return next(new AppError("User not found. Please sign up first.", 401));
    }

    if (user.status === "suspended") {
      return next(new AppError("Account is inactive or suspended", 401));
    }

    request.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    console.error("Clerk authentication error:", error);
    return next(new AppError("Invalid or expired Clerk token", 401));
  }
}

export function authorize(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) return next(new AppError("Authentication required", 401));
    if (!roles.includes(request.user.role)) return next(new AppError("Forbidden", 403));
    next();
  };
}