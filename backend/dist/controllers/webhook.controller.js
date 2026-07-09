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
    if (event.type === "user.created" || event.type === "user.updated") {
        try {
            // Cast the payload safely
            const data = event.data;
            // 1. Extract Primary Email safely without 'any'
            const primaryEmailObj = data.email_addresses?.find((e) => e.id === data.primary_email_address_id) || data.email_addresses?.[0];
            const actualEmail = primaryEmailObj?.email_address;
            // 2. Extract Name safely
            const firstName = data.first_name || '';
            const lastName = data.last_name || '';
            const actualName = `${firstName} ${lastName}`.trim();
            const clerkId = data.id;
            const emailToUse = actualEmail || `${clerkId}@users.clerk.dev`;
            const role = (data.unsafe_metadata?.role === "owner" ? "owner" : "student");
            await prisma_1.prisma.user.upsert({
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
        catch (error) {
            console.error("Error processing user.created/updated webhook:", error);
        }
    }
    if (event.type === "user.deleted") {
        try {
            const clerkId = event.data.id;
            if (clerkId) {
                await prisma_1.prisma.user.deleteMany({
                    where: { clerkId },
                });
            }
        }
        catch (error) {
            console.error("Error processing user.deleted webhook:", error);
        }
    }
    res.status(200).json({ received: true });
}
