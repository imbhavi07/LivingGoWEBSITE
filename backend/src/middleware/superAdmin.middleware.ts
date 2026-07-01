import { Request, Response, NextFunction } from "express";
import { verifyToken, createClerkClient } from "@clerk/backend";

// The single source of truth for platform-level coupon authority.
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL ?? "rctaccommodations@gmail.com").toLowerCase();

// Initialize the pure Node.js Clerk Client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Helper to safely extract and verify the Clerk token from Express headers
 */
async function getClerkUserId(req: Request): Promise<string | null> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  
  if (!token) return null;
  
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    return payload.sub;
  } catch (err) {
    return null;
  }
}

/**
 * requireSuperAdmin
 * Blocks all coupon-authority mutations unless the authenticated Clerk user's
 * primary verified email matches the Super Admin account exactly.
 */
export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await getClerkUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in required or invalid token." });
    }

    // Use the Node-specific Clerk Client to fetch user details
    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    );

    const emailVerified = primaryEmail?.verification?.status === "verified";
    const emailMatches = primaryEmail?.emailAddress?.toLowerCase() === SUPER_ADMIN_EMAIL;

    if (!emailVerified || !emailMatches) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "This action is restricted to the platform Super Admin.",
      });
    }

    // Defense in depth: confirm DB-side role flag too.
    // Note: Used clerkId here since that's what the token 'sub' provides.
    const dbUser = await req.prisma.user.findFirst({
      where: { clerkId: userId },
      select: { id: true, role: true, email: true },
    });

    if (!dbUser || dbUser.role !== "SUPER_ADMIN" || dbUser.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Super Admin role mismatch between auth provider and database.",
      });
    }

    req.superAdminUserId = dbUser.id;
    return next();
  } catch (err) {
    console.error("Super Admin Auth Error:", err);
    return next(err);
  }
}

// Standard "must be logged in" guard reused across coupon/affiliate routes.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = await getClerkUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in required." });
  }
  req.authUserId = userId;
  return next();
}

declare module "express" {
  interface Request {
    superAdminUserId?: string;
    authUserId?: string;
    prisma: import("@prisma/client").PrismaClient;
  }
}

export type ExpressRequest = Express.Request & {
  superAdminUserId?: string;
  authUserId?: string;
  prisma: import("@prisma/client").PrismaClient;
};