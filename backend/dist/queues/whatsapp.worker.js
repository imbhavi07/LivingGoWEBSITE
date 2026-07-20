"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workers = exports.ownerWorker = exports.marketingWorker = exports.paymentWorker = exports.reminderWorker = exports.visitWorker = void 0;
exports.closeAllWorkers = closeAllWorkers;
const bullmq_1 = require("bullmq");
const client_1 = require("@prisma/client");
const redis_1 = require("../config/redis");
const whatsapp_queue_1 = require("./whatsapp.queue");
const redis_session_1 = require("./redis.session");
// ============================================
// INITIALIZATION
// ============================================
const prisma = new client_1.PrismaClient();
const META_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
// Template names from environment (with fallbacks)
const TEMPLATES = {
    WELCOME_STUDENT: process.env.WHATSAPP_TEMPLATE_WELCOME || "welcome_student",
    VISIT_REMINDER_24H: process.env.WHATSAPP_TEMPLATE_VISIT_REMINDER_24H || "visit_reminder_24h",
    VISIT_REMINDER_2H: process.env.WHATSAPP_TEMPLATE_VISIT_REMINDER_2H || "visit_reminder_2h",
    VISIT_REMINDER_30M: process.env.WHATSAPP_TEMPLATE_VISIT_REMINDER_30M || "visit_reminder_30m",
    VISIT_OTP: process.env.WHATSAPP_TEMPLATE_VISIT_OTP || "visit_otp",
    NEW_VISIT_ASSIGNMENT: process.env.WHATSAPP_TEMPLATE_NEW_VISIT_ASSIGNMENT || "new_visit_assignment",
    INTERN_DAILY_SCHEDULE: process.env.WHATSAPP_TEMPLATE_INTERN_DAILY_SCHEDULE || "intern_daily_schedule",
    STUDENT_ARRIVAL: process.env.WHATSAPP_TEMPLATE_STUDENT_ARRIVAL || "student_arrival",
    NEW_LEAD_OWNER: process.env.WHATSAPP_TEMPLATE_NEW_LEAD_OWNER || "new_lead_owner",
    VISIT_STARTED_OWNER: process.env.WHATSAPP_TEMPLATE_VISIT_STARTED_OWNER || "visit_started_owner",
    VISIT_COMPLETED_OWNER: process.env.WHATSAPP_TEMPLATE_VISIT_COMPLETED_OWNER || "visit_completed_owner",
    DAILY_SUMMARY_OWNER: process.env.WHATSAPP_TEMPLATE_DAILY_SUMMARY_OWNER || "daily_summary_owner",
    WEEKLY_REPORT_OWNER: process.env.WHATSAPP_TEMPLATE_WEEKLY_REPORT_OWNER || "weekly_report_owner",
    LOW_OCCUPANCY: process.env.WHATSAPP_TEMPLATE_LOW_OCCUPANCY || "low_occupancy_alert",
    LISTING_EXPIRY: process.env.WHATSAPP_TEMPLATE_LISTING_EXPIRY || "listing_expiry_notice",
    SUPERVISOR_ESCALATION: process.env.WHATSAPP_TEMPLATE_SUPERVISOR_ESCALATION || "supervisor_escalation",
    ADMIN_DAILY_DASHBOARD: process.env.WHATSAPP_TEMPLATE_ADMIN_DAILY_DASHBOARD || "admin_daily_dashboard",
    ADMIN_SYSTEM_ALERT: process.env.WHATSAPP_TEMPLATE_ADMIN_SYSTEM_ALERT || "admin_system_alert",
};
async function sendMetaApiRequest(payload) {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        console.error("❌ Missing Meta credentials: PHONE_NUMBER_ID or ACCESS_TOKEN");
        return null;
    }
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("❌ Meta API Error:", JSON.stringify(data, null, 2));
            throw new Error(`Meta API error: ${data.error?.message || "Unknown error"}`);
        }
        console.log("📤 Meta API Response:", JSON.stringify(data, null, 2));
        return data;
    }
    catch (error) {
        console.error("❌ Meta API Request Failed:", error);
        throw error;
    }
}
// ============================================
// TEMPLATE PAYLOAD BUILDERS
// ============================================
function buildTemplatePayload(to, templateName, languageCode = "en", components) {
    return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
            name: templateName,
            language: { code: languageCode },
            components,
        },
    };
}
function buildTextPayload(to, text) {
    return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
    };
}
// ============================================
// SPECIFIC TEMPLATE BUILDERS
// ============================================
// --- NEW VISIT ASSIGNMENT (Intern Alert) - KEY WORKFLOW ---
function buildNewVisitAssignmentPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.NEW_VISIT_ASSIGNMENT, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "🏠 New Visit Assigned" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.propertyLocation },
                { type: "text", text: `${data.visitDate}, ${data.timeSlot}` },
                { type: "text", text: data.visitToken },
            ],
        },
        {
            type: "button",
            sub_type: "quick_reply",
            index: "0",
            parameters: [{ type: "payload", payload: `ACCEPT_VISIT_${data.visitToken}` }],
        },
        {
            type: "button",
            sub_type: "quick_reply",
            index: "1",
            parameters: [{ type: "payload", payload: `DECLINE_VISIT_${data.visitToken}` }],
        },
    ]);
}
// --- VISIT OTP (Student) ---
function buildVisitOtpPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.VISIT_OTP, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "🔐 Your Visit OTP" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.visitOtp },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.propertyLocation },
                { type: "text", text: `${data.visitDate}, ${data.timeSlot}` },
                { type: "text", text: data.internName },
                { type: "text", text: data.internPhone },
                { type: "text", text: data.mapsLink },
                { type: "text", text: data.emergencyContact },
            ],
        },
    ]);
}
// --- VISIT REMINDERS (24H, 2H, 30M) ---
function buildVisitReminderPayload(phone, data) {
    const templateMap = {
        VISIT_24H: TEMPLATES.VISIT_REMINDER_24H,
        VISIT_2H: TEMPLATES.VISIT_REMINDER_2H,
        VISIT_30M: TEMPLATES.VISIT_REMINDER_30M,
    };
    const headerText = {
        VISIT_24H: "📅 Visit Tomorrow",
        VISIT_2H: "⏰ Visit in 2 Hours",
        VISIT_30M: "🚗 Visit in 30 Minutes",
    };
    return buildTemplatePayload(phone, templateMap[data.type], "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: headerText[data.type] }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.propertyLocation },
                { type: "text", text: `${data.visitDate}, ${data.timeSlot}` },
                { type: "text", text: data.visitOtp || "N/A" },
                { type: "text", text: data.internName || "Not assigned" },
                { type: "text", text: data.internPhone || "N/A" },
                { type: "text", text: data.mapsLink || "N/A" },
            ],
        },
    ]);
}
// --- WELCOME JOURNEY ---
function buildWelcomeJourneyPayload(phone, data) {
    const stepMessages = {
        WELCOME: `Hi ${data.studentName}! 👋\n\nWelcome to LivingGo. We help university students find verified PGs and rooms without the brokerage hassle.\n\nReply with "FIND PG" to start your search, or "HELP" to speak with our team.`,
        FIND_PG: `Great! Let's find your perfect PG. What area are you looking in? (e.g., Kamla Nagar, Vijay Nagar, GTB Nagar)\n\nOr visit: ${data.deepLink || "https://livinggo.in/properties"}`,
        WISHLIST: `Found something you like? ❤️ Add properties to your wishlist to compare later.\n\nYour wishlist: ${data.deepLink || "https://livinggo.in/wishlist"}`,
        SCHEDULE_VISIT: `Ready to visit? 📅 Book a visit with our Live-in Guru who will show you around.\n\nReply with "BOOK VISIT" or visit: ${data.deepLink || "https://livinggo.in/book-visit"}`,
        ASK_QUESTIONS: `Have questions? 💬 Ask us anything about the property, facilities, rent, or move-in process.\n\nOur team typically responds within 15 minutes.`,
    };
    return buildTextPayload(phone, stepMessages[data.step] || stepMessages.WELCOME);
}
// --- NEW LEAD (Owner) ---
function buildNewLeadPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.NEW_LEAD_OWNER, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "🎯 New Lead Alert" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.studentPhone },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.propertyLocation },
                { type: "text", text: `${data.visitDate}, ${data.timeSlot}` },
                { type: "text", text: data.internName || "Not assigned yet" },
            ],
        },
    ]);
}
// --- VISIT STARTED (Owner) ---
function buildVisitStartedPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.VISIT_STARTED_OWNER, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "🚀 Visit Started" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.internName },
                { type: "text", text: data.startedAt },
            ],
        },
    ]);
}
// --- VISIT COMPLETED (Owner) ---
function buildVisitCompletedPayload(phone, data) {
    const statusEmoji = {
        SUCCESSFUL: "✅",
        NOT_SUCCESSFUL: "❌",
        INTERESTED_OTHER_PROPERTY: "🔄",
    };
    return buildTemplatePayload(phone, TEMPLATES.VISIT_COMPLETED_OWNER, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: `${statusEmoji[data.leadStatus]} Visit Completed` }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.leadStatus },
                { type: "text", text: data.internName },
                { type: "text", text: data.completedAt },
            ],
        },
    ]);
}
// --- DAILY SUMMARY (Owner) ---
function buildDailySummaryPayload(phone, data) {
    const visitsText = data.visits.length > 0
        ? data.visits.map(v => `• ${v.visitToken}: ${v.studentName} @ ${v.propertyTitle} (${v.timeSlot}) - ${v.status}`).join("\n")
        : "No visits today";
    return buildTextPayload(phone, `📊 *Daily Summary - ${data.date}*\n\n` +
        `👤 Owner: ${data.ownerName}\n` +
        `📈 Visits: ${data.stats.visitsCompleted}/${data.stats.totalVisits} completed\n` +
        `🎯 New Leads: ${data.stats.newLeads}\n` +
        `💰 Tokens Collected: ${data.stats.tokensCollected}\n` +
        `💵 Revenue: ₹${data.stats.revenue.toLocaleString()}\n\n` +
        `*Today's Visits:*\n${visitsText}`);
}
// --- WEEKLY REPORT (Owner) ---
function buildWeeklyReportPayload(phone, data) {
    return buildTextPayload(phone, `📊 *Weekly Report (${data.weekStart} to ${data.weekEnd})*\n\n` +
        `👤 Owner: ${data.ownerName}\n` +
        `🏠 Occupancy Rate: ${data.stats.occupancyRate}%\n` +
        `💵 Total Revenue: ₹${data.stats.totalRevenue.toLocaleString()}\n` +
        `📅 Visits Booked: ${data.stats.visitsBooked}\n` +
        `✅ Visits Completed: ${data.stats.visitsCompleted}\n` +
        `📈 Conversion Rate: ${data.stats.conversionRate}%\n` +
        `⏱ Avg Response Time: ${data.stats.avgResponseTime}\n\n` +
        `*Top Properties:*\n` +
        data.topProperties.map(p => `• ${p.propertyTitle}: ${p.visits} visits, ${p.conversion}% conversion`).join("\n") + "\n\n" +
        `*Needs Attention:*\n` +
        data.lowPerformers.map(p => `• ${p.propertyTitle}: ${p.issue}`).join("\n"));
}
// --- LOW OCCUPANCY (Owner) ---
function buildLowOccupancyPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.LOW_OCCUPANCY, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "⚠️ Low Occupancy Alert" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.propertyTitle },
                { type: "text", text: `${data.currentOccupancy}/${data.totalCapacity}` },
                { type: "text", text: `${data.occupancyRate}%` },
                { type: "text", text: `${data.daysSinceLastBooking} days` },
            ],
        },
    ]);
}
// --- LISTING EXPIRY (Owner) ---
function buildListingExpiryPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.LISTING_EXPIRY, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "📅 Listing Expiring Soon" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.expiresAt },
                { type: "text", text: `${data.daysRemaining} days` },
            ],
        },
    ]);
}
// --- INTERN DAILY SCHEDULE ---
function buildInternDailySchedulePayload(phone, data) {
    const visitsText = data.visits.length > 0
        ? data.visits.map(v => `• ${v.timeSlot}: ${v.studentName} (${v.studentPhone}) @ ${v.propertyTitle}, ${v.propertyLocation} - OTP: ${v.visitOtp}`).join("\n")
        : "No visits scheduled";
    return buildTextPayload(phone, `📅 *Your Schedule for ${data.date}*\n\n` +
        `👤 ${data.internName}\n\n` +
        `*Today's Visits:*\n${visitsText}\n\n` +
        `Reply "HELP" if you need assistance.`);
}
// --- STUDENT ARRIVAL ALERT (Intern) ---
function buildStudentArrivalPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.STUDENT_ARRIVAL, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "🎯 Student Arriving Soon" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.studentPhone },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: data.visitOtp },
                { type: "text", text: data.visitToken },
            ],
        },
        {
            type: "button",
            sub_type: "quick_reply",
            index: "0",
            parameters: [{ type: "payload", payload: `OTP_VERIFIED_${data.visitToken}` }],
        },
        {
            type: "button",
            sub_type: "quick_reply",
            index: "1",
            parameters: [{ type: "payload", payload: `STUDENT_NO_SHOW_${data.visitToken}` }],
        },
    ]);
}
// --- VISIT CONFIRMED (Student) ---
function buildVisitConfirmedPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.VISIT_OTP, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "✅ Visit Confirmed" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.studentName },
                { type: "text", text: data.propertyTitle },
                { type: "text", text: `${data.visitDate}, ${data.timeSlot}` },
                { type: "text", text: data.visitToken },
            ],
        },
    ]);
}
// --- PROFILE COMPLETION ---
function buildProfileCompletionPayload(phone, data) {
    return buildTextPayload(phone, `Hi ${data.studentName}! 👋\n\n` +
        `You haven't completed your profile yet. Complete it to unlock property bookings and personalized recommendations.\n\n` +
        `👉 ${data.profileUrl}\n\n` +
        `Takes less than 2 minutes!`);
}
// --- FEEDBACK REQUEST ---
function buildFeedbackRequestPayload(phone, data) {
    return buildTextPayload(phone, `Hi ${data.studentName}! 👋\n\n` +
        `How was your visit to ${data.propertyTitle}? Your feedback helps other students.\n\n` +
        `👉 Share your experience: ${data.feedbackUrl}\n\n` +
        `Takes 1 minute!`);
}
// --- DOCUMENT COLLECTION ---
function buildDocumentCollectionPayload(phone, data) {
    return buildTextPayload(phone, `Hi ${data.studentName}! 📄\n\n` +
        `To proceed with ${data.propertyTitle}, we need the following documents:\n\n` +
        data.documentsNeeded.map(d => `• ${d}`).join("\n") + "\n\n" +
        `👉 Upload here: ${data.uploadUrl}\n\n` +
        `Reply "DONE" once uploaded.`);
}
// --- TOKEN PAYMENT REMINDER ---
function buildTokenPaymentReminderPayload(phone, data) {
    return buildTextPayload(phone, `Hi ${data.studentName}! 💰\n\n` +
        `Reminder: Token payment of ₹${data.amount.toLocaleString()} for ${data.propertyTitle} is due by ${data.dueDate}.\n\n` +
        `👉 Pay here: ${data.paymentUrl}\n` +
        `${data.utrRequired ? "📝 Please share UTR number after payment." : ""}\n\n` +
        `Reply "PAID" once done.`);
}
// --- RENT DUE REMINDER ---
function buildRentDueReminderPayload(phone, data) {
    return buildTextPayload(phone, `Hi ${data.studentName}! 🏠\n\n` +
        `Rent of ₹${data.amount.toLocaleString()} for ${data.propertyTitle} is due on ${data.dueDate}.\n\n` +
        `💳 Pay to: ${data.payeeName}\n` +
        `📱 UPI: ${data.upiId}\n\n` +
        `Reply "PAID" with UTR once transferred.`);
}
// --- TOKEN DUE (Payment Queue) ---
function buildTokenDuePayload(phone, data) {
    return buildTextPayload(phone, `💰 *Token Payment Due*\n\n` +
        `Property: ${data.propertyTitle}\n` +
        `Amount: ₹${data.amount.toLocaleString()}\n` +
        `Due: ${data.dueDate}\n\n` +
        `👉 Pay now: ${data.paymentUrl}\n\n` +
        `Reply "PAID" with UTR after payment.`);
}
// --- TOKEN CONFIRMED ---
function buildTokenConfirmedPayload(phone, data) {
    return buildTextPayload(phone, `✅ *Token Payment Confirmed*\n\n` +
        `Property: ${data.propertyTitle}\n` +
        `Amount: ₹${data.amount.toLocaleString()}\n` +
        `UTR: ${data.utrNumber}\n` +
        `${data.moveInDate ? `🗓 Move-in: ${data.moveInDate}` : ""}\n\n` +
        `Your booking is now secured!`);
}
// --- TOKEN REJECTED ---
function buildTokenRejectedPayload(phone, data) {
    return buildTextPayload(phone, `❌ *Token Payment Rejected*\n\n` +
        `Property: ${data.propertyTitle}\n` +
        `Reason: ${data.reason}\n\n` +
        `Please contact support or retry payment.`);
}
// --- REFUND PROCESSED ---
function buildRefundProcessedPayload(phone, data) {
    return buildTextPayload(phone, `💰 *Refund Processed*\n\n` +
        `Amount: ₹${data.amount.toLocaleString()}\n` +
        `Reference: ${data.refundReference}\n\n` +
        `Amount will reflect in your account within 5-7 business days.`);
}
// --- RE-ENGAGEMENT ---
function buildReEngagementPayload(phone, data) {
    return buildTextPayload(phone, `Hi ${data.studentName}! 👋\n\n` +
        `We noticed you haven't been active for ${data.daysInactive} days. Your last action: ${data.lastAction}.\n\n` +
        `Still looking for a PG? Check out new listings:\n${data.deepLink}\n\n` +
        `Reply "STOP" to unsubscribe.`);
}
// --- REFERRAL INVITE ---
function buildReferralInvitePayload(phone, data) {
    return buildTextPayload(phone, `🎁 *Referral Invite from ${data.referrerName}*\n\n` +
        `Earn ₹${data.rewardAmount} for every friend who books through LivingGo!\n\n` +
        `Your referral code: ${data.referrerCode}\n` +
        `Share link: ${data.referralLink}\n\n` +
        `Start earning today!`);
}
// --- SUPERVISOR ESCALATION ---
function buildSupervisorEscalationPayload(phone, studentName, studentPhone, reason) {
    return buildTemplatePayload(phone, TEMPLATES.SUPERVISOR_ESCALATION, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "🚨 Escalation Alert" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: studentName },
                { type: "text", text: studentPhone },
                { type: "text", text: reason },
            ],
        },
    ]);
}
// --- ADMIN DAILY DASHBOARD ---
function buildAdminDailyDashboardPayload(phone, data) {
    return buildTemplatePayload(phone, TEMPLATES.ADMIN_DAILY_DASHBOARD, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: "📊 Admin Daily Dashboard" }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: data.date },
                { type: "text", text: `${data.completedVisits}/${data.totalVisits}` },
                { type: "text", text: `₹${data.revenue.toLocaleString()}` },
                { type: "text", text: data.bookings.toString() },
                { type: "text", text: data.activeInterns.toString() },
                { type: "text", text: data.systemHealth },
            ],
        },
    ]);
}
// --- ADMIN SYSTEM ALERT ---
function buildAdminSystemAlertPayload(phone, alertType, message, severity) {
    return buildTemplatePayload(phone, TEMPLATES.ADMIN_SYSTEM_ALERT, "en", [
        {
            type: "header",
            parameters: [{ type: "text", text: `${severity === "CRITICAL" ? "🔴" : severity === "WARNING" ? "🟡" : "🔵"} System Alert` }],
        },
        {
            type: "body",
            parameters: [
                { type: "text", text: alertType },
                { type: "text", text: message },
                { type: "text", text: severity },
            ],
        },
    ]);
}
// ============================================
// WORKER HANDLERS
// ============================================
// --- VISIT QUEUE WORKER ---
exports.visitWorker = new bullmq_1.Worker("whatsapp-visit", async (job) => {
    const { data } = job;
    try {
        switch (data.type) {
            case "VISIT_CREATED": {
                const payload = data;
                // Find available intern (least busy)
                const intern = await prisma.intern.findFirst({
                    where: { active: true },
                    orderBy: { visits: { _count: "asc" } },
                });
                if (intern) {
                    // Assign intern to visit
                    await prisma.visit.update({
                        where: { id: payload.visitId },
                        data: {
                            assignedLeadId: intern.id,
                            leadStatus: "ASSIGNED",
                        },
                    });
                    // Queue intern assignment notification
                    const { queueInternAssigned } = await import("./whatsapp.queue.js");
                    await queueInternAssigned({
                        phoneNumber: intern.phone,
                        userRole: "intern",
                        visitId: payload.visitId,
                        visitToken: payload.visitToken,
                        internId: intern.id,
                        internName: intern.name,
                        internPhone: intern.phone,
                        studentName: payload.studentName,
                        propertyTitle: payload.propertyTitle,
                        propertyLocation: payload.propertyLocation,
                        visitDate: payload.visitDate,
                        timeSlot: payload.timeSlot,
                        visitOtp: payload.visitOtp,
                        mapsLink: `https://maps.google.com/?q=${encodeURIComponent(payload.propertyLocation)}`,
                        emergencyContact: "Emergency: 112",
                    });
                }
                else {
                    console.warn(`⚠️ No active interns available for visit ${payload.visitToken}`);
                }
                break;
            }
            case "INTERN_ASSIGNED": {
                const payload = data;
                const metaPayload = buildNewVisitAssignmentPayload(payload.phoneNumber, payload);
                await sendMetaApiRequest(metaPayload);
                // Set session for intern
                await (0, redis_session_1.setCurrentStep)(payload.phoneNumber, "awaiting_visit_confirmation");
                await (0, redis_session_1.setContext)(payload.phoneNumber, {
                    visitId: payload.visitId,
                    visitToken: payload.visitToken,
                    studentName: payload.studentName,
                    propertyTitle: payload.propertyTitle,
                });
                break;
            }
            case "VISIT_OTP_SENT": {
                const payload = data;
                const metaPayload = buildVisitOtpPayload(payload.phoneNumber, payload);
                await sendMetaApiRequest(metaPayload);
                // Set session for student
                await (0, redis_session_1.setCurrentStep)(payload.phoneNumber, "awaiting_otp");
                await (0, redis_session_1.setContext)(payload.phoneNumber, {
                    visitId: payload.visitId,
                    visitToken: payload.visitToken,
                    visitOtp: payload.visitOtp,
                    internName: payload.internName,
                    internPhone: payload.internPhone,
                });
                break;
            }
            case "VISIT_CONFIRMED": {
                const payload = data;
                const metaPayload = buildVisitConfirmedPayload(payload.phoneNumber, payload);
                await sendMetaApiRequest(metaPayload);
                break;
            }
            case "OTP_VERIFY": {
                const payload = data;
                // Acquire lock to prevent concurrent processing
                const lockAcquired = await (0, redis_session_1.acquireVisitLock)(payload.visitId, `otp_verify_${payload.phoneNumber}`);
                if (!lockAcquired) {
                    console.log(`⏳ Visit ${payload.visitId} is locked, re-queueing OTP verify`);
                    const { queueOTPVerify } = await import("./whatsapp.queue.js");
                    await queueOTPVerify(payload);
                    return;
                }
                try {
                    // Find the visit
                    const visit = await prisma.visit.findUnique({
                        where: { id: payload.visitId },
                        include: {
                            student: true,
                            property: true,
                            intern: true,
                        },
                    });
                    if (!visit) {
                        throw new Error(`Visit ${payload.visitId} not found`);
                    }
                    if (visit.visitOtpVerified) {
                        console.log(`ℹ️ Visit ${payload.visitToken} already OTP verified`);
                        return;
                    }
                    // Verify OTP
                    const isMatch = payload.providedOtp.trim() === visit.visitOtp.trim();
                    if (isMatch) {
                        // OTP MATCHED - KEY WORKFLOW
                        await prisma.visit.update({
                            where: { id: payload.visitId },
                            data: {
                                visitOtpVerified: true,
                                leadStatus: "MET",
                            },
                        });
                        // Mark session as verified
                        await (0, redis_session_1.setOtpVerified)(payload.phoneNumber, payload.visitId);
                        await (0, redis_session_1.resetAttemptCount)(payload.phoneNumber);
                        await (0, redis_session_1.clearCurrentStep)(payload.phoneNumber);
                        // Send confirmation to student
                        const { queueVisitConfirmed } = await import("./whatsapp.queue.js");
                        await queueVisitConfirmed({
                            phoneNumber: payload.phoneNumber,
                            userRole: "student",
                            visitId: payload.visitId,
                            visitToken: payload.visitToken,
                            studentName: visit.student.name,
                            propertyTitle: visit.property.title,
                            visitDate: visit.visitDate.toISOString().split("T")[0],
                            timeSlot: visit.timeSlot,
                        });
                        // Notify intern of student arrival
                        if (visit.intern) {
                            const { queueStudentArrivalAlert } = await import("./whatsapp.queue.js");
                            await queueStudentArrivalAlert({
                                phoneNumber: visit.intern.phone,
                                userRole: "intern",
                                visitId: payload.visitId,
                                visitToken: payload.visitToken,
                                internId: visit.intern.id,
                                internName: visit.intern.name,
                                internPhone: visit.intern.phone,
                                studentName: visit.student.name,
                                studentPhone: visit.student.phone || payload.phoneNumber,
                                propertyTitle: visit.property.title,
                                visitOtp: visit.visitOtp,
                            });
                        }
                        // Notify owner
                        if (visit.property.ownerId) {
                            const owner = await prisma.user.findUnique({ where: { id: visit.property.ownerId } });
                            if (owner?.phone) {
                                const { queueVisitStarted } = await import("./whatsapp.queue.js");
                                await queueVisitStarted({
                                    phoneNumber: owner.phone,
                                    userRole: "owner",
                                    visitId: payload.visitId,
                                    visitToken: payload.visitToken,
                                    ownerId: owner.id,
                                    ownerName: owner.name,
                                    studentName: visit.student.name,
                                    propertyTitle: visit.property.title,
                                    internName: visit.intern?.name || "N/A",
                                    startedAt: new Date().toISOString(),
                                });
                            }
                        }
                        console.log(`✅ OTP verified for visit ${payload.visitToken}`);
                    }
                    else {
                        // OTP MISMATCH
                        const attemptCount = await (0, redis_session_1.incrementAttemptCount)(payload.phoneNumber);
                        const maxAttempts = 3;
                        const remaining = maxAttempts - attemptCount;
                        if (remaining > 0) {
                            // Send retry message
                            await sendMetaApiRequest(buildTextPayload(payload.phoneNumber, `❌ Invalid OTP. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.\n\nPlease enter the 6-digit OTP shared with you.`));
                            // Re-queue for next attempt
                            const { queueOTPVerify } = await import("./whatsapp.queue.js");
                            await queueOTPVerify({
                                ...payload,
                                attemptNumber: attemptCount,
                            });
                        }
                        else {
                            // Max attempts exceeded
                            await sendMetaApiRequest(buildTextPayload(payload.phoneNumber, `❌ Maximum OTP attempts exceeded. Visit ${payload.visitToken} requires manual verification.\n\nOur team has been notified.`));
                            // Alert supervisors
                            const supervisors = await prisma.user.findMany({
                                where: { role: "SUPERVISOR", status: "active" },
                                select: { phone: true, name: true },
                            });
                            for (const sup of supervisors) {
                                if (sup.phone) {
                                    await sendMetaApiRequest(buildSupervisorEscalationPayload(sup.phone, visit.student.name, payload.phoneNumber, `OTP verification failed for visit ${payload.visitToken} after ${maxAttempts} attempts`));
                                }
                            }
                            await (0, redis_session_1.resetAttemptCount)(payload.phoneNumber);
                        }
                    }
                }
                finally {
                    await (0, redis_session_1.releaseVisitLock)(payload.visitId, `otp_verify_${payload.phoneNumber}`);
                }
                break;
            }
            case "STUDENT_ARRIVAL_ALERT": {
                const payload = data;
                const metaPayload = buildStudentArrivalPayload(payload.phoneNumber, payload);
                await sendMetaApiRequest(metaPayload);
                await (0, redis_session_1.setCurrentStep)(payload.phoneNumber, "awaiting_otp");
                await (0, redis_session_1.setContext)(payload.phoneNumber, {
                    visitId: payload.visitId,
                    visitToken: payload.visitToken,
                    studentName: payload.studentName,
                    studentPhone: payload.studentPhone,
                    visitOtp: payload.visitOtp,
                });
                break;
            }
        }
    }
    catch (error) {
        console.error(`❌ [VISIT WORKER] Job ${job.id} failed:`, error);
        // Move to DLQ on final failure
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            await whatsapp_queue_1.dlqQueues.visit.add(job.name, job.data, { jobId: job.id });
        }
        throw error;
    }
}, {
    connection: (0, redis_1.createRedisConnection)(),
    concurrency: 5,
});
// --- REMINDER QUEUE WORKER ---
exports.reminderWorker = new bullmq_1.Worker("whatsapp-reminder", async (job) => {
    const { data } = job;
    try {
        let metaPayload;
        const phone = data.phoneNumber;
        switch (data.type) {
            case "PROFILE_COMPLETION": {
                const payload = data;
                metaPayload = buildProfileCompletionPayload(phone, payload);
                break;
            }
            case "VISIT_24H":
            case "VISIT_2H":
            case "VISIT_30M": {
                const payload = data;
                metaPayload = buildVisitReminderPayload(phone, payload);
                break;
            }
            case "FEEDBACK_REQUEST": {
                const payload = data;
                metaPayload = buildFeedbackRequestPayload(phone, payload);
                break;
            }
            case "DOCUMENT_COLLECTION": {
                const payload = data;
                metaPayload = buildDocumentCollectionPayload(phone, payload);
                break;
            }
            case "TOKEN_PAYMENT_REMINDER": {
                const payload = data;
                metaPayload = buildTokenPaymentReminderPayload(phone, payload);
                break;
            }
            case "RENT_DUE_REMINDER": {
                const payload = data;
                metaPayload = buildRentDueReminderPayload(phone, payload);
                break;
            }
            case "INTERN_DAILY_SCHEDULE_10AM":
            case "INTERN_DAILY_SCHEDULE_12PM":
            case "INTERN_DAILY_SCHEDULE_4PM": {
                const payload = data;
                metaPayload = buildInternDailySchedulePayload(phone, payload);
                break;
            }
        }
        if (metaPayload) {
            await sendMetaApiRequest(metaPayload);
        }
    }
    catch (error) {
        console.error(`❌ [REMINDER WORKER] Job ${job.id} failed:`, error);
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            await whatsapp_queue_1.dlqQueues.reminder.add(job.name, job.data, { jobId: job.id });
        }
        throw error;
    }
}, {
    connection: (0, redis_1.createRedisConnection)(),
    concurrency: 5,
});
// --- PAYMENT QUEUE WORKER ---
exports.paymentWorker = new bullmq_1.Worker("whatsapp-payment", async (job) => {
    const { data } = job;
    try {
        let metaPayload;
        const phone = data.phoneNumber;
        switch (data.type) {
            case "TOKEN_DUE": {
                const payload = data;
                metaPayload = buildTokenDuePayload(phone, payload);
                break;
            }
            case "TOKEN_CONFIRMED": {
                const payload = data;
                metaPayload = buildTokenConfirmedPayload(phone, payload);
                break;
            }
            case "TOKEN_REJECTED": {
                const payload = data;
                metaPayload = buildTokenRejectedPayload(phone, payload);
                break;
            }
            case "REFUND_PROCESSED": {
                const payload = data;
                metaPayload = buildRefundProcessedPayload(phone, payload);
                break;
            }
        }
        if (metaPayload) {
            await sendMetaApiRequest(metaPayload);
        }
    }
    catch (error) {
        console.error(`❌ [PAYMENT WORKER] Job ${job.id} failed:`, error);
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            await whatsapp_queue_1.dlqQueues.payment.add(job.name, job.data, { jobId: job.id });
        }
        throw error;
    }
}, {
    connection: (0, redis_1.createRedisConnection)(),
    concurrency: 5,
});
// --- MARKETING QUEUE WORKER ---
exports.marketingWorker = new bullmq_1.Worker("whatsapp-marketing", async (job) => {
    const { data } = job;
    try {
        let metaPayload;
        const phone = data.phoneNumber;
        switch (data.type) {
            case "WELCOME_JOURNEY": {
                const payload = data;
                metaPayload = buildWelcomeJourneyPayload(phone, payload);
                break;
            }
            case "BROADCAST": {
                const payload = data;
                // Broadcast to segment - would need separate implementation
                console.log(`📢 Broadcast to ${payload.segment}: ${payload.templateName}`);
                return;
            }
            case "RE_ENGAGEMENT": {
                const payload = data;
                metaPayload = buildReEngagementPayload(phone, payload);
                break;
            }
            case "REFERRAL_INVITE": {
                const payload = data;
                metaPayload = buildReferralInvitePayload(phone, payload);
                break;
            }
        }
        if (metaPayload) {
            await sendMetaApiRequest(metaPayload);
        }
    }
    catch (error) {
        console.error(`❌ [MARKETING WORKER] Job ${job.id} failed:`, error);
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            await whatsapp_queue_1.dlqQueues.marketing.add(job.name, job.data, { jobId: job.id });
        }
        throw error;
    }
}, {
    connection: (0, redis_1.createRedisConnection)(),
    concurrency: 3, // Lower concurrency for marketing
});
// --- OWNER QUEUE WORKER ---
exports.ownerWorker = new bullmq_1.Worker("whatsapp-owner", async (job) => {
    const { data } = job;
    try {
        let metaPayload;
        const phone = data.phoneNumber;
        switch (data.type) {
            case "NEW_LEAD": {
                const payload = data;
                metaPayload = buildNewLeadPayload(phone, payload);
                break;
            }
            case "VISIT_STARTED": {
                const payload = data;
                metaPayload = buildVisitStartedPayload(phone, payload);
                break;
            }
            case "VISIT_COMPLETED": {
                const payload = data;
                metaPayload = buildVisitCompletedPayload(phone, payload);
                break;
            }
            case "DAILY_SUMMARY": {
                const payload = data;
                metaPayload = buildDailySummaryPayload(phone, payload);
                break;
            }
            case "WEEKLY_REPORT": {
                const payload = data;
                metaPayload = buildWeeklyReportPayload(phone, payload);
                break;
            }
            case "LOW_OCCUPANCY": {
                const payload = data;
                metaPayload = buildLowOccupancyPayload(phone, payload);
                break;
            }
            case "LISTING_EXPIRY": {
                const payload = data;
                metaPayload = buildListingExpiryPayload(phone, payload);
                break;
            }
        }
        if (metaPayload) {
            await sendMetaApiRequest(metaPayload);
        }
    }
    catch (error) {
        console.error(`❌ [OWNER WORKER] Job ${job.id} failed:`, error);
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            await whatsapp_queue_1.dlqQueues.owner.add(job.name, job.data, { jobId: job.id });
        }
        throw error;
    }
}, {
    connection: (0, redis_1.createRedisConnection)(),
    concurrency: 5,
});
// ============================================
// WORKER EVENT LISTENERS
// ============================================
function setupWorkerEvents(worker, name) {
    worker.on("completed", (job) => {
        console.log(`✅ [${name}] Job ${job.id} (${job.name}) completed`);
    });
    worker.on("failed", (job, err) => {
        if (job) {
            console.error(`❌ [${name}] Job ${job.id} (${job.name}) failed:`, err.message);
            console.error(`   Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
        }
    });
    worker.on("error", (err) => {
        console.error(`❌ [${name}] Worker error:`, err);
    });
}
setupWorkerEvents(exports.visitWorker, "VISIT_WORKER");
setupWorkerEvents(exports.reminderWorker, "REMINDER_WORKER");
setupWorkerEvents(exports.paymentWorker, "PAYMENT_WORKER");
setupWorkerEvents(exports.marketingWorker, "MARKETING_WORKER");
setupWorkerEvents(exports.ownerWorker, "OWNER_WORKER");
// ============================================
// GRACEFUL SHUTDOWN
// ============================================
async function closeAllWorkers() {
    await Promise.all([
        exports.visitWorker.close(),
        exports.reminderWorker.close(),
        exports.paymentWorker.close(),
        exports.marketingWorker.close(),
        exports.ownerWorker.close(),
    ]);
    console.log("✅ All WhatsApp workers closed");
}
// Export all workers for external access
exports.workers = {
    visit: exports.visitWorker,
    reminder: exports.reminderWorker,
    payment: exports.paymentWorker,
    marketing: exports.marketingWorker,
    owner: exports.ownerWorker,
};
