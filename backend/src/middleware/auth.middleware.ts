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
    return next(new AppError("Please Sign-in First 😉", 401));
  }

  try {
    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, status: true, verificationStatus: true }
    });

    if (!user || user.status === "suspended") {
      return next(new AppError("Account is inactive or suspended", 401));
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus
    };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export async function clerkAuthenticate(request: Request, _response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    console.error("❌ Clerk authentication: Missing Authorization header or token");
    return next(new AppError("Authentication token is required", 401));
  }

  // Ensure clerk secret key is configured
  if (!process.env.CLERK_SECRET_KEY) {
    console.error("❌ Clerk authentication: CLERK_SECRET_KEY is not defined");
    return next(new AppError("Server configuration error", 500));
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkUserId = payload.sub;
    const email = payload.email as string | null;
    const firstName = payload.first_name as string | null;
    const lastName = payload.last_name as string | null;
    const name = ((firstName ?? '') + ' ' + (lastName ?? '')).trim() || undefined;

    // Find or create user record based on clerkId
    let user = await prisma.user.findFirst({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true, role: true, status: true, verificationStatus: true }
    });

    if (!user) {
      // Auto-create baseline user record for missing webhook / first-time login
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: email ?? `${clerkUserId}@users.clerk.dev`, // fallback email
          name: name ?? 'Clerk User',
          role: 'student', // default to student for token payment flow; adjust if needed elsewhere
          status: 'active',
          passwordHash: 'dummy_hash', // placeholder; password auth not used
          verificationStatus: 'not_required',
        },
        select: { id: true, email: true, role: true, status: true, verificationStatus: true }
      });
    }

    if (user.status === "suspended") {
      return next(new AppError("Account is inactive or suspended", 401));
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role, // This will now be 'owner'
      verificationStatus: user.verificationStatus
    };
    next();
  } catch (error) {
    console.error("❌ Clerk authentication error:", error);
    return next(new AppError("Invalid or expired Clerk token", 401));
  }
}

export function authorize(...roles: Role[]) {
  return (
    request: Request,
    _response: Response,
    next: NextFunction
  ) => {
    if (!request.user) {
      return next(new AppError("Authentication required", 401));
    }

    const role = request.user.role;

    // SUPER_ADMIN bypasses all role checks
    if (role === "SUPER_ADMIN") {
      return next();
    }

    if (!roles.includes(role)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
}

export function protect(request: Request, response: Response, next: NextFunction) {
    return clerkAuthenticate(request, response, next);
}