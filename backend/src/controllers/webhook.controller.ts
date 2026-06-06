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

  if (event.type === "user.created") {
    const data = event.data;
    const email = (data.email_addresses as { email_address: string }[])[0]?.email_address;
    const firstName = (data.first_name as string) ?? "";
    const lastName = (data.last_name as string) ?? "";
    const clerkId = data.id as string;
    const metadata = data.unsafe_metadata as Record<string, unknown> ?? {};
    const role = metadata.role === "owner" ? "owner" : "student";

    if (email) {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name: `${firstName} ${lastName}`.trim() || email,
          email,
          phone: null,
          passwordHash: clerkId,
          role,
          verificationStatus: role === "student" ? "not_required" : "pending_approval",
        },
      });

      // ✅ Set publicMetadata in Clerk so middleware can read the role
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: { role },
      });
    }
  }

  res.status(200).json({ received: true });
}