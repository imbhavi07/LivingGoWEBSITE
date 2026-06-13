"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleClerkWebhook = handleClerkWebhook;
const svix_1 = require("svix");
const prisma_1 = require("../config/prisma");
const backend_1 = require("@clerk/backend");
async function handleClerkWebhook(req, res) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET)
        throw new Error("CLERK_WEBHOOK_SECRET missing");
    const wh = new svix_1.Webhook(WEBHOOK_SECRET);
    let event;
    try {
        const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        event = wh.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });
    }
    catch {
        return res.status(400).json({ error: "Invalid webhook signature" });
    }
    const clerkClient = (0, backend_1.createClerkClient)({
        secretKey: process.env.CLERK_SECRET_KEY,
    });
    if (event.type === "user.created") {
        const data = event.data;
        const email = data.email_addresses[0]?.email_address;
        const firstName = data.first_name ?? "";
        const lastName = data.last_name ?? "";
        const clerkId = data.id;
        const unsafeMetadata = data.unsafe_metadata ?? {};
        const role = (unsafeMetadata.role === "owner" ? "owner" : "student");
        if (email) {
            await prisma_1.prisma.user.upsert({
                where: { email },
                update: {
                    clerkId, // sync clerkId if user record already exists (e.g. was manually seeded)
                },
                create: {
                    name: `${firstName} ${lastName}`.trim() || email,
                    email,
                    clerkId, // ← THE FIX: was missing, causing all auth lookups to fail
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
        const clerkId = event.data.id;
        if (clerkId) {
            await prisma_1.prisma.user.deleteMany({
                where: { clerkId },
            });
        }
    }
    res.status(200).json({ received: true });
}
