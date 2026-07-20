"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIncomingMessage = exports.verifyWebhook = void 0;
const client_1 = require("@prisma/client");
const index_js_1 = require("../queues/index.js");
const redis_session_js_1 = require("../queues/redis.session.js");
const prisma = new client_1.PrismaClient();
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "LivingGo_Secret_Token_2026";
const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
            console.log("✅ WHATSAPP WEBHOOK VERIFIED");
            return res.status(200).send(challenge);
        }
        else {
            return res.sendStatus(403);
        }
    }
    return res.sendStatus(400);
};
exports.verifyWebhook = verifyWebhook;
const handleIncomingMessage = async (req, res) => {
    const body = req.body;
    // 1. Instantly acknowledge receipt to Meta to prevent duplicate delivery retries
    if (body.object !== "whatsapp_business_account") {
        return res.sendStatus(404);
    }
    res.status(200).send("EVENT_RECEIVED");
    try {
        // 2. Safely extract the message payload details
        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];
        // If it's a status update wrapper (sent, delivered, read), ignore it for now
        if (!message)
            return;
        const studentPhone = message.from; // e.g., "917310698877"
        const studentName = value.contacts?.[0]?.profile?.name || "Student";
        const messageText = message.text?.body?.trim() || "";
        const messageType = message.type; // "text", "interactive", "button", etc.
        console.log(`📥 Processing ${messageType} from ${studentName} (${studentPhone}): "${messageText}"`);
        // 3. Find or link the user inside PostgreSQL database via Prisma
        const user = await prisma.user.findFirst({
            where: { phone: studentPhone }
        });
        // 4. Handle interactive messages (button clicks)
        if (messageType === "interactive") {
            await handleInteractiveMessage(studentPhone, studentName, message, user);
            return;
        }
        // 5. Get current session step
        const currentStep = await (0, redis_session_js_1.getCurrentStep)(studentPhone);
        const context = await (0, redis_session_js_1.getContext)(studentPhone);
        // 6. Route based on session step
        if (currentStep === "awaiting_otp" && context.visitId) {
            // Enqueue OTP verification job - worker handles the actual verification
            await (0, index_js_1.queueOTPVerify)({
                phoneNumber: studentPhone,
                userRole: "student",
                visitId: context.visitId,
                visitToken: context.visitToken || "",
                providedOtp: messageText,
                attemptNumber: await (0, redis_session_js_1.getAttemptCount)(studentPhone) + 1,
            });
            return;
        }
        // 7. Level 1 Keyword / Intent Router (for idle sessions)
        const lowerText = messageText.toLowerCase();
        if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText === "start") {
            await handleWelcomeJourney(studentPhone, studentName);
        }
        else if (lowerText.includes("book") || lowerText.includes("visit") || lowerText === "book visit") {
            await handleVisitIntent(studentPhone, user);
        }
        else if (lowerText.includes("help")) {
            await handleHelpEscalation(studentPhone, studentName);
        }
        else if (lowerText === "stop" || lowerText === "unsubscribe") {
            await handleUnsubscribe(studentPhone);
        }
        else {
            // Fallback for natural phrasing
            await sendWhatsAppText(studentPhone, `Thanks for messaging LivingGo! We received your message: "${messageText}". Our AI Concierge is processing your request.`);
        }
    }
    catch (error) {
        console.error("❌ Error parsing incoming WhatsApp webhook payload:", error);
    }
};
exports.handleIncomingMessage = handleIncomingMessage;
async function handleInteractiveMessage(phone, name, message, user) {
    const interactive = message.interactive;
    const buttonReply = interactive?.button_reply;
    const listReply = interactive?.list_reply;
    const payload = buttonReply?.id || listReply?.id; // e.g., "ACCEPT_VISIT_LG-VST-7X9K"
    if (!payload)
        return;
    console.log(`🔘 Interactive payload from ${name} (${phone}): ${payload}`);
    // Handle visit acceptance/decline by intern
    if (payload.startsWith("ACCEPT_VISIT_")) {
        const visitToken = payload.replace("ACCEPT_VISIT_", "");
        await handleInternAcceptVisit(phone, visitToken);
    }
    else if (payload.startsWith("DECLINE_VISIT_")) {
        const visitToken = payload.replace("DECLINE_VISIT_", "");
        await handleInternDeclineVisit(phone, visitToken);
    }
    else if (payload.startsWith("OTP_VERIFIED_")) {
        const visitToken = payload.replace("OTP_VERIFIED_", "");
        await handleInternOtpVerified(phone, visitToken);
    }
    else if (payload.startsWith("STUDENT_NO_SHOW_")) {
        const visitToken = payload.replace("STUDENT_NO_SHOW_", "");
        await handleStudentNoShow(phone, visitToken);
    }
}
async function handleInternAcceptVisit(internPhone, visitToken) {
    const visit = await prisma.visit.findUnique({
        where: { tokenId: visitToken },
        include: { student: true, property: true, intern: true },
    });
    if (!visit) {
        await sendWhatsAppText(internPhone, `❌ Visit ${visitToken} not found.`);
        return;
    }
    if (visit.assignedLeadId !== visit.intern?.id) {
        await sendWhatsAppText(internPhone, `❌ This visit is not assigned to you.`);
        return;
    }
    // Update visit status
    await prisma.visit.update({
        where: { id: visit.id },
        data: { leadStatus: "ASSIGNED" },
    });
    // Send OTP to student
    await sendVisitOtpToStudent(visit);
    // Confirm to intern
    await sendWhatsAppText(internPhone, `✅ Visit ${visitToken} accepted!\n\n` +
        `Student: ${visit.student.name}\n` +
        `Property: ${visit.property.title}\n` +
        `Date: ${visit.visitDate.toISOString().split("T")[0]}, ${visit.timeSlot}\n` +
        `OTP sent to student.`);
}
async function handleInternDeclineVisit(internPhone, visitToken) {
    const visit = await prisma.visit.findUnique({
        where: { tokenId: visitToken },
        include: { student: true, property: true },
    });
    if (!visit) {
        await sendWhatsAppText(internPhone, `❌ Visit ${visitToken} not found.`);
        return;
    }
    // Unassign intern and re-queue for new assignment
    await prisma.visit.update({
        where: { id: visit.id },
        data: {
            assignedLeadId: null,
            leadStatus: "SCHEDULED",
        },
    });
    // Re-queue for new intern assignment
    await (0, index_js_1.queueVisitCreated)({
        phoneNumber: visit.student.phone || "",
        userRole: "student",
        visitId: visit.id,
        visitToken: visit.tokenId,
        studentName: visit.student.name,
        studentPhone: visit.student.phone || "",
        propertyId: visit.property.id,
        propertyTitle: visit.property.title,
        propertyLocation: visit.property.location,
        visitDate: visit.visitDate.toISOString().split("T")[0],
        timeSlot: visit.timeSlot,
        visitOtp: visit.visitOtp,
    });
    await sendWhatsAppText(internPhone, `❌ Visit ${visitToken} declined. Re-assigning to another intern.`);
}
async function handleInternOtpVerified(internPhone, visitToken) {
    const visit = await prisma.visit.findUnique({
        where: { tokenId: visitToken },
        include: { student: true, property: true, intern: true },
    });
    if (!visit) {
        await sendWhatsAppText(internPhone, `❌ Visit ${visitToken} not found.`);
        return;
    }
    // Mark as verified
    await prisma.visit.update({
        where: { id: visit.id },
        data: {
            visitOtpVerified: true,
            leadStatus: "MET",
        },
    });
    await sendWhatsAppText(internPhone, `✅ OTP verified for visit ${visitToken}!\n\n` +
        `Student: ${visit.student.name}\n` +
        `Property: ${visit.property.title}\n` +
        `Status: MET`);
    // Notify owner
    if (visit.property.ownerId) {
        const owner = await prisma.user.findUnique({ where: { id: visit.property.ownerId } });
        if (owner?.phone) {
            await sendWhatsAppText(owner.phone, `🚀 *Visit Started*\n\n` +
                `Student: ${visit.student.name}\n` +
                `Property: ${visit.property.title}\n` +
                `Intern: ${visit.intern?.name || "N/A"}\n` +
                `Time: ${new Date().toLocaleString()}`);
        }
    }
}
async function handleStudentNoShow(internPhone, visitToken) {
    const visit = await prisma.visit.findUnique({
        where: { tokenId: visitToken },
        include: { student: true, property: true },
    });
    if (!visit) {
        await sendWhatsAppText(internPhone, `❌ Visit ${visitToken} not found.`);
        return;
    }
    await prisma.visit.update({
        where: { id: visit.id },
        data: { leadStatus: "NOT_MET" },
    });
    await sendWhatsAppText(internPhone, `❌ Student no-show recorded for visit ${visitToken}.\n\n` +
        `Student: ${visit.student.name}\n` +
        `Property: ${visit.property.title}`);
    // Notify owner
    if (visit.property.ownerId) {
        const owner = await prisma.user.findUnique({ where: { id: visit.property.ownerId } });
        if (owner?.phone) {
            await sendWhatsAppText(owner.phone, `❌ *Student No-Show*\n\n` +
                `Student: ${visit.student.name}\n` +
                `Property: ${visit.property.title}\n` +
                `Time: ${new Date().toLocaleString()}`);
        }
    }
}
async function handleWelcomeJourney(phone, name) {
    // Set session step
    await (0, redis_session_js_1.setCurrentStep)(phone, "idle");
    // Queue welcome journey
    await (0, index_js_1.queueWelcomeJourney)({
        phoneNumber: phone,
        userRole: "student",
        step: "WELCOME",
        studentName: name,
        studentPhone: phone,
    });
}
async function handleVisitIntent(phone, user) {
    if (!user) {
        const registerText = `We see you haven't completed your profile on the web app yet! Please finish registering on https://livinggo.in to lock in property bookings.`;
        await sendWhatsAppText(phone, registerText);
        return;
    }
    await (0, redis_session_js_1.setCurrentStep)(phone, "awaiting_area");
    await (0, redis_session_js_1.setContext)(phone, { userId: user.id });
    const visitText = `Let's get your visit sorted. Tell me which area you are eyeing (e.g., Kamla Nagar, Vijay Nagar, GTB Nagar) or reply with the Property Code.`;
    await sendWhatsAppText(phone, visitText);
}
async function handleHelpEscalation(phone, studentName) {
    // Alert supervisors
    const supervisors = await prisma.user.findMany({
        where: { role: "SUPERVISOR", status: "active" },
        select: { phone: true, name: true },
    });
    for (const sup of supervisors) {
        if (sup.phone) {
            await sendWhatsAppText(sup.phone, `🚨 *Escalation from ${studentName} (${phone})*\n\n` +
                `Student requested human assistance. Please take over this conversation.`);
        }
    }
    await sendWhatsAppText(phone, `🚨 Understood. I'm flagging an internal Live-in Guru and admin right now. One of our operational staff will take over this thread shortly.`);
}
async function handleUnsubscribe(phone) {
    await (0, redis_session_js_1.clearSession)(phone);
    await sendWhatsAppText(phone, "You've been unsubscribed from LivingGo WhatsApp updates. Reply 'START' to resubscribe.");
}
async function sendVisitOtpToStudent(visit) {
    if (!visit.student.phone)
        return;
    await (0, index_js_1.queueVisitOtpSent)({
        phoneNumber: visit.student.phone,
        userRole: "student",
        visitId: visit.id,
        visitToken: visit.tokenId,
        studentName: visit.student.name,
        visitDate: visit.visitDate.toISOString().split("T")[0],
        timeSlot: visit.timeSlot,
        visitOtp: visit.visitOtp,
        propertyTitle: visit.property.title,
        propertyLocation: visit.property.location,
        internName: visit.intern?.name || "TBA",
        internPhone: visit.intern?.phone || "TBA",
        mapsLink: `https://maps.google.com/?q=${visit.property.location}`,
        emergencyContact: "Emergency: 112",
    });
}
/**
 * Outbound Text Message (for simple responses)
 */
async function sendWhatsAppText(toPhone, text) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !accessToken) {
        console.error("❌ Missing Meta credentials in environment config");
        return;
    }
    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: toPhone,
                type: "text",
                text: { body: text }
            })
        });
        const data = await response.json();
        console.log("📤 Outbound Text API Response:", data);
    }
    catch (err) {
        console.error("❌ Meta Graph API delivery crash:", err);
    }
}
