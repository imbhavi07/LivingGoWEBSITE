import type { Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "../config/prisma";
import { createClerkClient } from "@clerk/backend";

export async function handleClerkWebhook(req: Request, res: Response) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("CLERK_WEBHOOK_SECRET missing");

  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    event = wh.verify(payload, {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    }) as { type: string; data: Record<string, unknown> };
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  if (event.type === "user.created") {
    const data = event.data;
    const email = (data.email_addresses as { email_address: string }[])[0]?.email_address;
    const firstName = (data.first_name as string) ?? "";
    const lastName = (data.last_name as string) ?? "";
    const clerkId = data.id as string;

    // Always create as "student" — role is elevated to "owner" only after
    // admin approval via the KYC flow. Never trust client-supplied metadata.
    const role = "student" as const;

    if (email) {
      await prisma.user.upsert({
        where: { email },
        update: {
          clerkId, // sync clerkId if user record already exists (e.g. was manually seeded)
        },
        create: {
          name: `${firstName} ${lastName}`.trim() || email,
          email,
          clerkId,       // ← THE FIX: was missing, causing all auth lookups to fail
          phone: null,
          passwordHash: clerkId,
          role,
          verificationStatus: "not_required",
        },
      });

      // Sync role to Clerk publicMetadata so it can be read client-side if needed
      await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: { role },
      });
    }
  }

  // Handle account deletion — clean up DB when user deletes their Clerk account
  if (event.type === "user.deleted") {
    const clerkId = event.data.id as string;
    if (clerkId) {
      await prisma.user.deleteMany({
        where: { clerkId },
      });
    }
  }

  res.status(200).json({ received: true });
}