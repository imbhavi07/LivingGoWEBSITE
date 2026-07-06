import type { Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "../config/prisma";
import { createClerkClient } from "@clerk/backend";

// Define the expected structure to avoid 'any' types
interface ClerkUserPayload {
  id: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  unsafe_metadata?: { role?: string };
}

export async function handleClerkWebhook(req: Request, res: Response) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("CLERK_WEBHOOK_SECRET missing");

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: { type: string; data: Record<string, unknown> };

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
    // Cast the payload safely
    const data = event.data as unknown as ClerkUserPayload;
    
    // 1. Extract Primary Email safely without 'any'
    const primaryEmailObj = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id
    ) || data.email_addresses?.[0];
    
    const actualEmail = primaryEmailObj?.email_address;
    
    // 2. Extract Name safely
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const actualName = `${firstName} ${lastName}`.trim();
    
    const clerkId = data.id;
    const emailToUse = actualEmail || `${clerkId}@users.clerk.dev`;
    const role = (data.unsafe_metadata?.role === "owner" ? "owner" : "student") as "owner" | "student";
    
    await prisma.user.upsert({
      where: { email: emailToUse },
      update: {
        clerkId, 
      },
      create: {
        name: actualName || 'Student',
        email: emailToUse,
        clerkId,
        phone: null,
        passwordHash: clerkId, // Safe to store clerkId here as a dummy
        role,
        verificationStatus: "not_required",
      },
    });

    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: { role },
    });
  }

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