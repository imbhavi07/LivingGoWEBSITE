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
    if (event.type === "user.created") {
        const data = event.data;
        const email = data.email_addresses[0]?.email_address;
        const firstName = data.first_name ?? "";
        const lastName = data.last_name ?? "";
        const clerkId = data.id;
        const metadata = data.unsafe_metadata ?? {};
        const role = metadata.role === "owner" ? "owner" : "student";
        if (email) {
            await prisma_1.prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    name: `${firstName} ${lastName}`.trim() || email,
                    email,
                    phone: null,
                    passwordHash: clerkId,
                    role,
                    verificationStatus: "not_required",
                },
            });
            // ✅ Set publicMetadata in Clerk so middleware can read the role
            const clerkClient = (0, backend_1.createClerkClient)({
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            await clerkClient.users.updateUserMetadata(clerkId, {
                publicMetadata: { role },
            });
        }
    }
    res.status(200).json({ received: true });
}
