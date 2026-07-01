import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

// The single source of truth for platform-level coupon authority.
// Deliberately NOT stored in the DB `role` field alone — an env var lets you
// rotate the super admin account without a migration, while still requiring
// a DB-role check as defense in depth (see below).
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL ?? "rctaccommodations@gmail.com").toLowerCase();

/**
 * requireSuperAdmin
 * Blocks all coupon-authority mutations unless the authenticated Clerk user's
 * primary verified email matches the Super Admin account exactly.
 *
 * Two independent checks are performed (belt + suspenders):
 *  1. Clerk email match (source of truth for identity)
 *  2. DB `user.role === 'SUPER_ADMIN'` (source of truth for authorization state)
 * Both must pass. This prevents a scenario where a DB role was mistakenly
 * granted to another account, or where Clerk email was changed without the
 * DB being updated.
 */
export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in required." });
    }

    const clerkUser = await (await clerkClient()).users.getUser(userId);
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
    const dbUser = await req.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!dbUser || dbUser.role !== "SUPER_ADMIN" || dbUser.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Super Admin role mismatch between auth provider and database.",
      });
    }

    req.superAdminUserId = userId;
    return next();
  } catch (err) {
    return next(err);
  }
}

// Standard "must be logged in" guard reused across coupon/affiliate routes.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
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
