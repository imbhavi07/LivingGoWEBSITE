import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { createRedisConnection } from "../config/redis";
import {
  visitQueue,
  reminderQueue,
  paymentQueue,
  marketingQueue,
  ownerQueue,
  dlqQueues,
} from "./whatsapp.queue";
import {
  VisitQueuePayload,
  ReminderQueuePayload,
  PaymentQueuePayload,
  MarketingQueuePayload,
  OwnerQueuePayload,
  VisitCreatedPayload,
  InternAssignedPayload,
  VisitOtpSentPayload,
  VisitConfirmedPayload,
  OTPVerifyPayload,
  StudentArrivalAlertPayload,
  ProfileCompletionPayload,
  VisitReminderPayload,
  FeedbackRequestPayload,
  DocumentCollectionPayload,
  TokenPaymentReminderPayload,
  RentDueReminderPayload,
  InternDailySchedulePayload,
  TokenDuePayload,
  TokenConfirmedPayload,
  TokenRejectedPayload,
  RefundProcessedPayload,
  WelcomeJourneyPayload,
  BroadcastPayload,
  ReEngagementPayload,
  ReferralInvitePayload,
  NewLeadPayload,
  VisitStartedPayload,
  VisitCompletedPayload,
  DailySummaryPayload,
  WeeklyReportPayload,
  LowOccupancyPayload,
  ListingExpiryPayload,
} from "./types/whatsapp-jobs";
import {
  getCurrentStep,
  setCurrentStep,
  getContext,
  setContext,
  updateContext,
  incrementAttemptCount,
  getAttemptCount,
  resetAttemptCount,
  setOtpVerified,
  getOtpVerified,
  acquireVisitLock,
  releaseVisitLock,
  clearSession,
  clearCurrentStep,
} from "./redis.session";

// ============================================
// INITIALIZATION
// ============================================

const prisma = new PrismaClient();

const META_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
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
} as const;

// ============================================
// META API CLIENT
// ============================================

interface MetaApiResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

async function sendMetaApiRequest(payload: unknown, context?: { jobId?: string; jobName?: string; phoneNumber?: string; templateName?: string }): Promise<MetaApiResponse | null> {
  const contextPrefix = context ? `[${context.jobName || "JOB"}:${context.jobId?.slice(-8) || "N/A"}]` : "[META_API]";
  const phoneContext = context?.phoneNumber ? ` to ${context.phoneNumber}` : "";
  const templateContext = context?.templateName ? ` (template: ${context.templateName})` : "";

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error(`${contextPrefix} ❌ Missing Meta credentials: PHONE_NUMBER_ID=${PHONE_NUMBER_ID ? "SET" : "MISSING"}, ACCESS_TOKEN=${ACCESS_TOKEN ? "SET" : "MISSING"}`);
    return null;
  }

  console.log(`${contextPrefix} 📤 Sending WhatsApp message${phoneContext}${templateContext}`);
  console.log(`${contextPrefix} 📤 Meta API URL: ${BASE_URL}`);
  console.log(`${contextPrefix} 📤 Payload:`, JSON.stringify(payload, null, 2));

  try {
    const startTime = Date.now();
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    console.log(`${contextPrefix} 📥 Meta API Response (${responseTime}ms) - Status: ${response.status} ${response.statusText}`);
    console.log(`${contextPrefix} 📥 Response Body:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      const errorMessage = data.error?.message || "Unknown error";
      const errorCode = data.error?.code || "UNKNOWN";
      const errorType = data.error?.type || "UNKNOWN";
      const errorSubcode = data.error?.error_subcode || "N/A";

      console.error(`${contextPrefix} ❌ Meta API Error:`);
      console.error(`${contextPrefix}    Code: ${errorCode}`);
      console.error(`${contextPrefix}    Type: ${errorType}`);
      console.error(`${contextPrefix}    Subcode: ${errorSubcode}`);
      console.error(`${contextPrefix}    Message: ${errorMessage}`);
      console.error(`${contextPrefix}    Full Error:`, JSON.stringify(data.error, null, 2));

      // Check for specific WhatsApp API errors
      if (errorCode === 131009 || errorCode === 131026) {
        console.error(`${contextPrefix} ⚠️  TEMPLATE REJECTED OR NOT APPROVED - Check template status in Meta Business Manager`);
      } else if (errorCode === 131047) {
        console.error(`${contextPrefix} ⚠️  RATE LIMIT EXCEEDED - Too many requests`);
      } else if (errorCode === 131030) {
        console.error(`${contextPrefix} ⚠️  INVALID TEMPLATE PARAMETERS - Check parameter count and types`);
      } else if (errorCode === 131021) {
        console.error(`${contextPrefix} ⚠️  PHONE NUMBER NOT REGISTERED ON WHATSAPP`);
      } else if (errorCode === 131011) {
        console.error(`${contextPrefix} ⚠️  ACCESS TOKEN EXPIRED OR INVALID`);
      } else if (errorCode === 131049) {
        console.error(`${contextPrefix} ⚠️  TEMPLATE NOT FOUND - Check template name in Meta Business Manager`);
      }

      throw new Error(`Meta API error [${errorCode}]: ${errorMessage}`);
    }

    // Log successful message IDs
    if (data.messages && data.messages.length > 0) {
      console.log(`${contextPrefix} ✅ Message sent successfully! Message IDs:`, data.messages.map((m: { id: string }) => m.id).join(", "));
    }
    if (data.contacts && data.contacts.length > 0) {
      console.log(`${contextPrefix} ✅ Recipient WA IDs:`, data.contacts.map((c: { wa_id: string }) => c.wa_id).join(", "));
    }

    return data as MetaApiResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`${contextPrefix} ❌ Meta API Request Failed after ${contextPrefix}:`, errorMessage);
    if (errorStack) {
      console.error(`${contextPrefix} 📍 Stack trace:`, errorStack);
    }
    throw error;
  }
}

// ============================================
// TEMPLATE PAYLOAD BUILDERS
// ============================================

function buildTemplatePayload(
  to: string,
  templateName: string,
  languageCode: string = "en",
  components: Array<{
    type: string;
    sub_type?: string;
    index?: string;
    parameters: Array<{ type: string; text?: string; payload?: string }>;
  }>
) {
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

function buildTextPayload(to: string, text: string) {
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
function buildNewVisitAssignmentPayload(phone: string, data: InternAssignedPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.NEW_VISIT_ASSIGNMENT, "en", [
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
      sub_type: "quick_reply" as const,
      index: "0",
      parameters: [{ type: "payload", payload: `ACCEPT_VISIT_${data.visitToken}` }],
    },
    {
      type: "button",
      sub_type: "quick_reply" as const,
      index: "1",
      parameters: [{ type: "payload", payload: `DECLINE_VISIT_${data.visitToken}` }],
    },
  ]);

  console.log(`[TEMPLATE_BUILDER] Built NEW_VISIT_ASSIGNMENT payload for ${phone} (token: ${data.visitToken})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.NEW_VISIT_ASSIGNMENT}`);
  return payload;
}

// --- VISIT OTP (Student) ---
function buildVisitOtpPayload(phone: string, data: VisitOtpSentPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.VISIT_OTP, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built VISIT_OTP payload for ${phone} (token: ${data.visitToken}, OTP: ${data.visitOtp})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.VISIT_OTP}`);
  return payload;
}

// --- VISIT REMINDERS (24H, 2H, 30M) ---
function buildVisitReminderPayload(phone: string, data: VisitReminderPayload) {
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

  const payload = buildTemplatePayload(phone, templateMap[data.type], "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built VISIT_REMINDER payload for ${phone} (type: ${data.type}, token: ${data.visitToken})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${templateMap[data.type]}`);
  return payload;
}

// --- WELCOME JOURNEY ---
function buildWelcomeJourneyPayload(phone: string, data: WelcomeJourneyPayload) {
  const stepMessages: Record<string, string> = {
    WELCOME: `Hi ${data.studentName}! 👋\n\nWelcome to LivingGo. We help university students find verified PGs and rooms without the brokerage hassle.\n\nReply with "FIND PG" to start your search, or "HELP" to speak with our team.`,
    FIND_PG: `Great! Let's find your perfect PG. What area are you looking in? (e.g., Kamla Nagar, Vijay Nagar, GTB Nagar)\n\nOr visit: ${data.deepLink || "https://livinggo.in/properties"}`,
    WISHLIST: `Found something you like? ❤️ Add properties to your wishlist to compare later.\n\nYour wishlist: ${data.deepLink || "https://livinggo.in/wishlist"}`,
    SCHEDULE_VISIT: `Ready to visit? 📅 Book a visit with our Live-in Guru who will show you around.\n\nReply with "BOOK VISIT" or visit: ${data.deepLink || "https://livinggo.in/book-visit"}`,
    ASK_QUESTIONS: `Have questions? 💬 Ask us anything about the property, facilities, rent, or move-in process.\n\nOur team typically responds within 15 minutes.`,
  };

  const payload = buildTextPayload(phone, stepMessages[data.step] || stepMessages.WELCOME);
  console.log(`[TEMPLATE_BUILDER] Built WELCOME_JOURNEY payload for ${phone} (step: ${data.step})`);
  return payload;
}

// --- NEW LEAD (Owner) ---
function buildNewLeadPayload(phone: string, data: NewLeadPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.NEW_LEAD_OWNER, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built NEW_LEAD payload for ${phone} (token: ${data.visitToken})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.NEW_LEAD_OWNER}`);
  return payload;
}

// --- VISIT STARTED (Owner) ---
function buildVisitStartedPayload(phone: string, data: VisitStartedPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.VISIT_STARTED_OWNER, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built VISIT_STARTED payload for ${phone} (token: ${data.visitToken})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.VISIT_STARTED_OWNER}`);
  return payload;
}

// --- VISIT COMPLETED (Owner) ---
function buildVisitCompletedPayload(phone: string, data: VisitCompletedPayload) {
  const statusEmoji = {
    SUCCESSFUL: "✅",
    NOT_SUCCESSFUL: "❌",
    INTERESTED_OTHER_PROPERTY: "🔄",
  };

  const payload = buildTemplatePayload(phone, TEMPLATES.VISIT_COMPLETED_OWNER, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built VISIT_COMPLETED payload for ${phone} (token: ${data.visitToken}, status: ${data.leadStatus})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.VISIT_COMPLETED_OWNER}`);
  return payload;
}

// --- DAILY SUMMARY (Owner) ---
function buildDailySummaryPayload(phone: string, data: DailySummaryPayload) {
  const visitsText = data.visits.length > 0
    ? data.visits.map(v => `• ${v.visitToken}: ${v.studentName} @ ${v.propertyTitle} (${v.timeSlot}) - ${v.status}`).join("\n")
    : "No visits today";

  return buildTextPayload(phone,
    `📊 *Daily Summary - ${data.date}*\n\n` +
    `👤 Owner: ${data.ownerName}\n` +
    `📈 Visits: ${data.stats.visitsCompleted}/${data.stats.totalVisits} completed\n` +
    `🎯 New Leads: ${data.stats.newLeads}\n` +
    `💰 Tokens Collected: ${data.stats.tokensCollected}\n` +
    `💵 Revenue: ₹${data.stats.revenue.toLocaleString()}\n\n` +
    `*Today's Visits:*\n${visitsText}`
  );
}

// --- WEEKLY REPORT (Owner) ---
function buildWeeklyReportPayload(phone: string, data: WeeklyReportPayload) {
  return buildTextPayload(phone,
    `📊 *Weekly Report (${data.weekStart} to ${data.weekEnd})*\n\n` +
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
    data.lowPerformers.map(p => `• ${p.propertyTitle}: ${p.issue}`).join("\n")
  );
}

// --- LOW OCCUPANCY (Owner) ---
function buildLowOccupancyPayload(phone: string, data: LowOccupancyPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.LOW_OCCUPANCY, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built LOW_OCCUPANCY payload for ${phone} (property: ${data.propertyTitle}, rate: ${data.occupancyRate}%)`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.LOW_OCCUPANCY}`);
  return payload;
}

// --- LISTING EXPIRY (Owner) ---
function buildListingExpiryPayload(phone: string, data: ListingExpiryPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.LISTING_EXPIRY, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built LISTING_EXPIRY payload for ${phone} (property: ${data.propertyTitle}, days: ${data.daysRemaining})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.LISTING_EXPIRY}`);
  return payload;
}

// --- INTERN DAILY SCHEDULE ---
function buildInternDailySchedulePayload(phone: string, data: InternDailySchedulePayload) {
  const visitsText = data.visits.length > 0
    ? data.visits.map(v => `• ${v.timeSlot}: ${v.studentName} (${v.studentPhone}) @ ${v.propertyTitle}, ${v.propertyLocation} - OTP: ${v.visitOtp}`).join("\n")
    : "No visits scheduled";

  const payload = buildTextPayload(phone,
    `📅 *Your Schedule for ${data.date}*\n\n` +
    `👤 ${data.internName}\n\n` +
    `*Today's Visits:*\n${visitsText}\n\n` +
    `Reply "HELP" if you need assistance.`
  );

  console.log(`[TEMPLATE_BUILDER] Built INTERN_DAILY_SCHEDULE payload for ${phone} (intern: ${data.internName}, date: ${data.date}, visits: ${data.visits.length})`);
  return payload;
}

// --- STUDENT ARRIVAL ALERT (Intern) ---
function buildStudentArrivalPayload(phone: string, data: StudentArrivalAlertPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.STUDENT_ARRIVAL, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built STUDENT_ARRIVAL payload for ${phone} (token: ${data.visitToken}, student: ${data.studentName})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.STUDENT_ARRIVAL}`);
  return payload;
}

// --- VISIT CREATED (Student) ---
function buildVisitCreatedPayload(phone: string, data: VisitCreatedPayload) {
  // WELCOME_STUDENT template parameters mapping:
  // {{1}} = studentName (ONLY PARAMETER - template expects exactly 1)
  const payload = buildTemplatePayload(phone, TEMPLATES.WELCOME_STUDENT, "en", [
    {
      type: "body",
      parameters: [
        { type: "text", text: data.studentName },  // {{1}} - only parameter
      ],
    },
  ]);

  console.log(`[TEMPLATE_BUILDER] Built VISIT_CREATED payload for ${phone} (token: ${data.visitToken})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.WELCOME_STUDENT}`);
  return payload;
}

// --- VISIT CONFIRMED (Student) ---
function buildVisitConfirmedPayload(phone: string, data: VisitConfirmedPayload) {
  const payload = buildTemplatePayload(phone, TEMPLATES.VISIT_OTP, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built VISIT_CONFIRMED payload for ${phone} (token: ${data.visitToken})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.VISIT_OTP} (reused)`);
  return payload;
}

// --- PROFILE COMPLETION ---
function buildProfileCompletionPayload(phone: string, data: ProfileCompletionPayload) {
  const payload = buildTextPayload(phone,
    `Hi ${data.studentName}! 👋\n\n` +
    `You haven't completed your profile yet. Complete it to unlock property bookings and personalized recommendations.\n\n` +
    `👉 ${data.profileUrl}\n\n` +
    `Takes less than 2 minutes!`
  );

  console.log(`[TEMPLATE_BUILDER] Built PROFILE_COMPLETION payload for ${phone} (student: ${data.studentName})`);
  return payload;
}

// --- FEEDBACK REQUEST ---
function buildFeedbackRequestPayload(phone: string, data: FeedbackRequestPayload) {
  const payload = buildTextPayload(phone,
    `Hi ${data.studentName}! 👋\n\n` +
    `How was your visit to ${data.propertyTitle}? Your feedback helps other students.\n\n` +
    `👉 Share your experience: ${data.feedbackUrl}\n\n` +
    `Takes 1 minute!`
  );

  console.log(`[TEMPLATE_BUILDER] Built FEEDBACK_REQUEST payload for ${phone} (token: ${data.visitToken}, property: ${data.propertyTitle})`);
  return payload;
}

// --- DOCUMENT COLLECTION ---
function buildDocumentCollectionPayload(phone: string, data: DocumentCollectionPayload) {
  const payload = buildTextPayload(phone,
    `Hi ${data.studentName}! 📄\n\n` +
    `To proceed with ${data.propertyTitle}, we need the following documents:\n\n` +
    data.documentsNeeded.map(d => `• ${d}`).join("\n") + "\n\n" +
    `👉 Upload here: ${data.uploadUrl}\n\n` +
    `Reply "DONE" once uploaded.`
  );

  console.log(`[TEMPLATE_BUILDER] Built DOCUMENT_COLLECTION payload for ${phone} (token: ${data.visitToken}, docs: ${data.documentsNeeded.join(", ")})`);
  return payload;
}

// --- TOKEN PAYMENT REMINDER ---
function buildTokenPaymentReminderPayload(phone: string, data: TokenPaymentReminderPayload) {
  const payload = buildTextPayload(phone,
    `Hi ${data.studentName}! 💰\n\n` +
    `Reminder: Token payment of ₹${data.amount.toLocaleString()} for ${data.propertyTitle} is due by ${data.dueDate}.\n\n` +
    `👉 Pay here: ${data.paymentUrl}\n` +
    `${data.utrRequired ? "📝 Please share UTR number after payment." : ""}\n\n` +
    `Reply "PAID" once done.`
  );

  console.log(`[TEMPLATE_BUILDER] Built TOKEN_PAYMENT_REMINDER payload for ${phone} (token: ${data.visitToken}, amount: ₹${data.amount})`);
  return payload;
}

// --- RENT DUE REMINDER ---
function buildRentDueReminderPayload(phone: string, data: RentDueReminderPayload) {
  const payload = buildTextPayload(phone,
    `Hi ${data.studentName}! 🏠\n\n` +
    `Rent of ₹${data.amount.toLocaleString()} for ${data.propertyTitle} is due on ${data.dueDate}.\n\n` +
    `💳 Pay to: ${data.payeeName}\n` +
    `📱 UPI: ${data.upiId}\n\n` +
    `Reply "PAID" with UTR once transferred.`
  );

  console.log(`[TEMPLATE_BUILDER] Built RENT_DUE_REMINDER payload for ${phone} (property: ${data.propertyTitle}, amount: ₹${data.amount}, due: ${data.dueDate})`);
  return payload;
}

// --- TOKEN DUE (Payment Queue) ---
function buildTokenDuePayload(phone: string, data: TokenDuePayload) {
  const payload = buildTextPayload(phone,
    `💰 *Token Payment Due*\n\n` +
    `Property: ${data.propertyTitle}\n` +
    `Amount: ₹${data.amount.toLocaleString()}\n` +
    `Due: ${data.dueDate}\n\n` +
    `👉 Pay now: ${data.paymentUrl}\n\n` +
    `Reply "PAID" with UTR after payment.`
  );

  console.log(`[TEMPLATE_BUILDER] Built TOKEN_DUE payload for ${phone} (token: ${data.visitToken}, amount: ₹${data.amount})`);
  return payload;
}

// --- TOKEN CONFIRMED ---
function buildTokenConfirmedPayload(phone: string, data: TokenConfirmedPayload) {
  const payload = buildTextPayload(phone,
    `✅ *Token Payment Confirmed*\n\n` +
    `Property: ${data.propertyTitle}\n` +
    `Amount: ₹${data.amount.toLocaleString()}\n` +
    `UTR: ${data.utrNumber}\n` +
    `${data.moveInDate ? `🗓 Move-in: ${data.moveInDate}` : ""}\n\n` +
    `Your booking is now secured!`
  );

  console.log(`[TEMPLATE_BUILDER] Built TOKEN_CONFIRMED payload for ${phone} (token: ${data.visitToken}, UTR: ${data.utrNumber})`);
  return payload;
}

// --- TOKEN REJECTED ---
function buildTokenRejectedPayload(phone: string, data: TokenRejectedPayload) {
  const payload = buildTextPayload(phone,
    `❌ *Token Payment Rejected*\n\n` +
    `Property: ${data.propertyTitle}\n` +
    `Reason: ${data.reason}\n\n` +
    `Please contact support or retry payment.`
  );

  console.log(`[TEMPLATE_BUILDER] Built TOKEN_REJECTED payload for ${phone} (token: ${data.visitToken}, reason: ${data.reason})`);
  return payload;
}

// --- REFUND PROCESSED ---
function buildRefundProcessedPayload(phone: string, data: RefundProcessedPayload) {
  const payload = buildTextPayload(phone,
    `💰 *Refund Processed*\n\n` +
    `Amount: ₹${data.amount.toLocaleString()}\n` +
    `Reference: ${data.refundReference}\n\n` +
    `Amount will reflect in your account within 5-7 business days.`
  );

  console.log(`[TEMPLATE_BUILDER] Built REFUND_PROCESSED payload for ${phone} (amount: ₹${data.amount}, ref: ${data.refundReference})`);
  return payload;
}

// --- RE-ENGAGEMENT ---
function buildReEngagementPayload(phone: string, data: ReEngagementPayload) {
  const payload = buildTextPayload(phone,
    `Hi ${data.studentName}! 👋\n\n` +
    `We noticed you haven't been active for ${data.daysInactive} days. Your last action: ${data.lastAction}.\n\n` +
    `Still looking for a PG? Check out new listings:\n${data.deepLink}\n\n` +
    `Reply "STOP" to unsubscribe.`
  );

  console.log(`[TEMPLATE_BUILDER] Built RE_ENGAGEMENT payload for ${phone} (days inactive: ${data.daysInactive})`);
  return payload;
}

// --- REFERRAL INVITE ---
function buildReferralInvitePayload(phone: string, data: ReferralInvitePayload) {
  const payload = buildTextPayload(phone,
    `🎁 *Referral Invite from ${data.referrerName}*\n\n` +
    `Earn ₹${data.rewardAmount} for every friend who books through LivingGo!\n\n` +
    `Your referral code: ${data.referrerCode}\n` +
    `Share link: ${data.referralLink}\n\n` +
    `Start earning today!`
  );

  console.log(`[TEMPLATE_BUILDER] Built REFERRAL_INVITE payload for ${phone} (referrer: ${data.referrerName}, code: ${data.referrerCode})`);
  return payload;
}

// --- SUPERVISOR ESCALATION ---
function buildSupervisorEscalationPayload(phone: string, studentName: string, studentPhone: string, reason: string) {
  const payload = buildTemplatePayload(phone, TEMPLATES.SUPERVISOR_ESCALATION, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built SUPERVISOR_ESCALATION payload for ${phone} (student: ${studentName}, reason: ${reason})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.SUPERVISOR_ESCALATION}`);
  return payload;
}

// --- ADMIN DAILY DASHBOARD ---
function buildAdminDailyDashboardPayload(phone: string, data: {
  date: string;
  totalVisits: number;
  completedVisits: number;
  revenue: number;
  bookings: number;
  activeInterns: number;
  systemHealth: string;
}) {
  const payload = buildTemplatePayload(phone, TEMPLATES.ADMIN_DAILY_DASHBOARD, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built ADMIN_DAILY_DASHBOARD payload for ${phone} (date: ${data.date}, visits: ${data.completedVisits}/${data.totalVisits})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.ADMIN_DAILY_DASHBOARD}`);
  return payload;
}

// --- ADMIN SYSTEM ALERT ---
function buildAdminSystemAlertPayload(phone: string, alertType: string, message: string, severity: "INFO" | "WARNING" | "CRITICAL") {
  const payload = buildTemplatePayload(phone, TEMPLATES.ADMIN_SYSTEM_ALERT, "en", [
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

  console.log(`[TEMPLATE_BUILDER] Built ADMIN_SYSTEM_ALERT payload for ${phone} (type: ${alertType}, severity: ${severity})`);
  console.log(`[TEMPLATE_BUILDER] Template: ${TEMPLATES.ADMIN_SYSTEM_ALERT}`);
  return payload;
}

// ============================================
// WORKER HANDLERS
// ============================================

// --- VISIT QUEUE WORKER ---
export const visitWorker = new Worker<VisitQueuePayload>(
  "whatsapp-visit",
  async (job: Job<VisitQueuePayload>) => {
    const { data } = job;
    const jobContext = { jobId: job.id, jobName: job.name };

    console.log(`[VISIT_WORKER] 📥 Processing job ${job.id} (${job.name}) - Type: ${data.type}, Token: ${data.visitToken || "N/A"}, Phone: ${data.phoneNumber || "N/A"}`);
    console.log(`[VISIT_WORKER] Job data:`, JSON.stringify(data, null, 2));

    try {
      switch (data.type) {
        case "VISIT_CREATED": {
          const payload = data as VisitCreatedPayload;

          console.log(`[VISIT_WORKER] VISIT_CREATED - Sending welcome_student template to student ${payload.phoneNumber} for visit ${payload.visitToken}`);

          // Send WhatsApp welcome message to student immediately (welcome_student template)
          console.log(`[VISIT_WORKER] Sending welcome_student to student ${payload.phoneNumber} for visit ${payload.visitToken}`);
          const visitCreatedPayload = buildVisitCreatedPayload(payload.phoneNumber, payload);
          await sendMetaApiRequest(visitCreatedPayload, { ...jobContext, phoneNumber: payload.phoneNumber, templateName: TEMPLATES.WELCOME_STUDENT });

          // NOTE: Intern assignment and other workflows disabled for template testing
          // Only welcome_student template is sent here
          break;
        }

        // DISABLED: INTERN_ASSIGNED case - only testing welcome_student and visit_reminder_24h
        // case "INTERN_ASSIGNED": {
        //   const payload = data as InternAssignedPayload;
        //   console.log(`[VISIT_WORKER] INTERN_ASSIGNED - Sending WhatsApp to intern ${payload.phoneNumber} for visit ${payload.visitToken}`);
        //   const metaPayload = buildNewVisitAssignmentPayload(payload.phoneNumber, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, phoneNumber: payload.phoneNumber, templateName: TEMPLATES.NEW_VISIT_ASSIGNMENT });
        //
        //   // Set session for intern
        //   await setCurrentStep(payload.phoneNumber, "awaiting_visit_confirmation");
        //   await setContext(payload.phoneNumber, {
        //     visitId: payload.visitId,
        //     visitToken: payload.visitToken,
        //     studentName: payload.studentName,
        //     propertyTitle: payload.propertyTitle,
        // DISABLED: INTERN_ASSIGNED case - only testing welcome_student and visit_reminder_24h
        // case "INTERN_ASSIGNED": {
        //   const payload = data as InternAssignedPayload;
        //   console.log(`[VISIT_WORKER] INTERN_ASSIGNED - Sending WhatsApp to intern ${payload.phoneNumber} for visit ${payload.visitToken}`);
        //   const metaPayload = buildNewVisitAssignmentPayload(payload.phoneNumber, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, phoneNumber: payload.phoneNumber, templateName: TEMPLATES.NEW_VISIT_ASSIGNMENT });
        //
        //   // Set session for intern
        //   await setCurrentStep(payload.phoneNumber, "awaiting_visit_confirmation");
        //   await setContext(payload.phoneNumber, {
        //     visitId: payload.visitId,
        //     visitToken: payload.visitToken,
        //     studentName: payload.studentName,
        //     propertyTitle: payload.propertyTitle,
        //   });
        //   console.log(`[VISIT_WORKER] ✅ Session set for intern ${payload.phoneNumber}`);
        //   break;
        // }

        // DISABLED: VISIT_OTP_SENT - only testing welcome_student and visit_reminder_24h
        // case "VISIT_OTP_SENT": {
        //   const payload = data as VisitOtpSentPayload;
        //   console.log(`[VISIT_WORKER] VISIT_OTP_SENT - Sending OTP to student ${payload.phoneNumber} for visit ${payload.visitToken} (OTP: ${payload.visitOtp})`);
        //   const metaPayload = buildVisitOtpPayload(payload.phoneNumber, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, phoneNumber: payload.phoneNumber, templateName: TEMPLATES.VISIT_OTP });
        //
        //   // Set session for student
        //   await setCurrentStep(payload.phoneNumber, "awaiting_otp");
        //   await setContext(payload.phoneNumber, {
        //     visitId: payload.visitId,
        //     visitToken: payload.visitToken,
        //     visitOtp: payload.visitOtp,
        //     internName: payload.internName,
        //     internPhone: payload.internPhone,
        //   });
        //   console.log(`[VISIT_WORKER] ✅ Session set for student ${payload.phoneNumber}`);
        //   break;
        // }

        // DISABLED: VISIT_CONFIRMED - only testing welcome_student and visit_reminder_24h
        // case "VISIT_CONFIRMED": {
        //   const payload = data as VisitConfirmedPayload;
        //   console.log(`[VISIT_WORKER] VISIT_CONFIRMED - Sending confirmation to student ${payload.phoneNumber} for visit ${payload.visitToken}`);
        //   const metaPayload = buildVisitConfirmedPayload(payload.phoneNumber, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, phoneNumber: payload.phoneNumber, templateName: TEMPLATES.VISIT_OTP });
        //   break;
        // }

        // DISABLED: OTP_VERIFY - only testing welcome_student and visit_reminder_24h
        // The full OTP verification workflow has been disabled for template testing
        case "OTP_VERIFY": {
          // Disabled for testing - only welcome_student and visit_reminder_24h templates active
          break;
        }

        // DISABLED: VISIT_CONFIRMED - only testing welcome_student and visit_reminder_24h
        // case "VISIT_CONFIRMED": { ... }

        // DISABLED: STUDENT_ARRIVAL_ALERT case - only testing welcome_student and visit_reminder_24h
        // case "STUDENT_ARRIVAL_ALERT": { ... }
      }

      console.log(`[VISIT_WORKER] ✅ Job ${job.id} (${job.name}) completed successfully`);
    } catch (error) {
      console.error(`❌ [VISIT_WORKER] Job ${job.id} (${job.name}) failed:`, error);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Job data:`, JSON.stringify(job.data, null, 2));

      // Move to DLQ on final failure
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.error(`🚨 [VISIT_WORKER] Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`);
        await dlqQueues.visit.add(job.name, job.data, { jobId: job.id });
      }

      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  }
);

// --- REMINDER QUEUE WORKER ---
export const reminderWorker = new Worker<ReminderQueuePayload>(
  "whatsapp-reminder",
  async (job: Job<ReminderQueuePayload>) => {
    const { data } = job;
    const jobContext = { jobId: job.id, jobName: job.name, phoneNumber: data.phoneNumber };

    console.log(`[REMINDER_WORKER] 📥 Processing job ${job.id} (${job.name}) for ${data.phoneNumber} [type: ${data.type}]`);

    try {
      let metaPayload: ReturnType<typeof buildTextPayload> | ReturnType<typeof buildTemplatePayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        // DISABLED: PROFILE_COMPLETION - only testing welcome_student and visit_reminder_24h
        // case "PROFILE_COMPLETION": {
        //   const payload = data as ProfileCompletionPayload;
        //   console.log(`[REMINDER_WORKER] PROFILE_COMPLETION for ${phone} (student: ${payload.studentName})`);
        //   metaPayload = buildProfileCompletionPayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
        //   break;
        // }

        case "VISIT_24H": {
          const payload = data as VisitReminderPayload;
          console.log(`[REMINDER_WORKER] VISIT_24H reminder for ${phone} (token: ${payload.visitToken}, property: ${payload.propertyTitle})`);
          metaPayload = buildVisitReminderPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES.VISIT_REMINDER_24H });
          break;
        }

        // DISABLED: VISIT_2H and VISIT_30M - only testing visit_reminder_24h
        // case "VISIT_2H":
        // case "VISIT_30M": {
        //   const payload = data as VisitReminderPayload;
        //   console.log(`[REMINDER_WORKER] ${data.type} reminder for ${phone} (token: ${payload.visitToken}, property: ${payload.propertyTitle})`);
        //   metaPayload = buildVisitReminderPayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES[`VISIT_REMINDER_${data.type.split("_")[1]}` as keyof typeof TEMPLATES] });
        //   break;
        // }

        // DISABLED: FEEDBACK_REQUEST - only testing welcome_student and visit_reminder_24h
        // case "FEEDBACK_REQUEST": {
        //   const payload = data as FeedbackRequestPayload;
        //   console.log(`[REMINDER_WORKER] FEEDBACK_REQUEST for ${phone} (token: ${payload.visitToken})`);
        //   metaPayload = buildFeedbackRequestPayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
        //   break;
        // }

        // DISABLED: DOCUMENT_COLLECTION - only testing welcome_student and visit_reminder_24h
        // case "DOCUMENT_COLLECTION": {
        //   const payload = data as DocumentCollectionPayload;
        //   console.log(`[REMINDER_WORKER] DOCUMENT_COLLECTION for ${phone} (token: ${payload.visitToken})`);
        //   metaPayload = buildDocumentCollectionPayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
        //   break;
        // }

        // DISABLED: TOKEN_PAYMENT_REMINDER - only testing welcome_student and visit_reminder_24h
        // case "TOKEN_PAYMENT_REMINDER": {
        //   const payload = data as TokenPaymentReminderPayload;
        //   console.log(`[REMINDER_WORKER] TOKEN_PAYMENT_REMINDER for ${phone} (token: ${payload.visitToken}, amount: ₹${payload.amount})`);
        //   metaPayload = buildTokenPaymentReminderPayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
        //   break;
        // }

        // DISABLED: RENT_DUE_REMINDER - only testing welcome_student and visit_reminder_24h
        // case "RENT_DUE_REMINDER": {
        //   const payload = data as RentDueReminderPayload;
        //   console.log(`[REMINDER_WORKER] RENT_DUE_REMINDER for ${phone} (property: ${payload.propertyTitle}, amount: ₹${payload.amount})`);
        //   metaPayload = buildRentDueReminderPayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
        //   break;
        // }

        // DISABLED: INTERN_DAILY_SCHEDULE - only testing welcome_student and visit_reminder_24h
        // case "INTERN_DAILY_SCHEDULE_10AM":
        // case "INTERN_DAILY_SCHEDULE_12PM":
        // case "INTERN_DAILY_SCHEDULE_4PM": {
        //   const payload = data as InternDailySchedulePayload;
        //   console.log(`[REMINDER_WORKER] ${data.type} for ${phone} (intern: ${payload.internName}, date: ${payload.date})`);
        //   metaPayload = buildInternDailySchedulePayload(phone, payload);
        //   await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
        //   break;
        // }
      }

      console.log(`[REMINDER_WORKER] ✅ Job ${job.id} (${job.name}) completed successfully`);
    } catch (error) {
      console.error(`❌ [REMINDER_WORKER] Job ${job.id} (${job.name}) failed:`, error);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Job data:`, JSON.stringify(job.data, null, 2));

      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.error(`🚨 [REMINDER_WORKER] Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`);
        await dlqQueues.reminder.add(job.name, job.data, { jobId: job.id });
      }

      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  }
);

// --- PAYMENT QUEUE WORKER ---
export const paymentWorker = new Worker<PaymentQueuePayload>(
  "whatsapp-payment",
  async (job: Job<PaymentQueuePayload>) => {
    const { data } = job;
    const jobContext = { jobId: job.id, jobName: job.name, phoneNumber: data.phoneNumber };

    console.log(`[PAYMENT_WORKER] 📥 Processing job ${job.id} (${job.name}) for ${data.phoneNumber} [type: ${data.type}]`);

    try {
      let metaPayload: ReturnType<typeof buildTextPayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        case "TOKEN_DUE": {
          const payload = data as TokenDuePayload;
          console.log(`[PAYMENT_WORKER] TOKEN_DUE for ${phone} (token: ${payload.visitToken}, amount: ₹${payload.amount})`);
          metaPayload = buildTokenDuePayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "TOKEN_CONFIRMED": {
          const payload = data as TokenConfirmedPayload;
          console.log(`[PAYMENT_WORKER] TOKEN_CONFIRMED for ${phone} (token: ${payload.visitToken}, UTR: ${payload.utrNumber})`);
          metaPayload = buildTokenConfirmedPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "TOKEN_REJECTED": {
          const payload = data as TokenRejectedPayload;
          console.log(`[PAYMENT_WORKER] TOKEN_REJECTED for ${phone} (token: ${payload.visitToken}, reason: ${payload.reason})`);
          metaPayload = buildTokenRejectedPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "REFUND_PROCESSED": {
          const payload = data as RefundProcessedPayload;
          console.log(`[PAYMENT_WORKER] REFUND_PROCESSED for ${phone} (amount: ₹${payload.amount}, ref: ${payload.refundReference})`);
          metaPayload = buildRefundProcessedPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }
      }

      console.log(`[PAYMENT_WORKER] ✅ Job ${job.id} (${job.name}) completed successfully`);
    } catch (error) {
      console.error(`❌ [PAYMENT_WORKER] Job ${job.id} (${job.name}) failed:`, error);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Job data:`, JSON.stringify(job.data, null, 2));

      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.error(`🚨 [PAYMENT_WORKER] Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`);
        await dlqQueues.payment.add(job.name, job.data, { jobId: job.id });
      }

      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  }
);

// --- MARKETING QUEUE WORKER ---
export const marketingWorker = new Worker<MarketingQueuePayload>(
  "whatsapp-marketing",
  async (job: Job<MarketingQueuePayload>) => {
    const { data } = job;
    const jobContext = { jobId: job.id, jobName: job.name, phoneNumber: data.phoneNumber };

    console.log(`[MARKETING_WORKER] 📥 Processing job ${job.id} (${job.name}) for ${data.phoneNumber} [type: ${data.type}]`);

    try {
      let metaPayload: ReturnType<typeof buildTextPayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        case "WELCOME_JOURNEY": {
          const payload = data as WelcomeJourneyPayload;
          console.log(`[MARKETING_WORKER] WELCOME_JOURNEY for ${phone} (student: ${payload.studentName}, step: ${payload.step})`);
          metaPayload = buildWelcomeJourneyPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "BROADCAST": {
          const payload = data as BroadcastPayload;
          console.log(`[MARKETING_WORKER] BROADCAST to segment ${payload.segment} (template: ${payload.templateName})`);
          // Broadcast to segment - would need separate implementation
          console.log(`📢 Broadcast to ${payload.segment}: ${payload.templateName}`);
          return;
        }

        case "RE_ENGAGEMENT": {
          const payload = data as ReEngagementPayload;
          console.log(`[MARKETING_WORKER] RE_ENGAGEMENT for ${phone} (student: ${payload.studentName}, days inactive: ${payload.daysInactive})`);
          metaPayload = buildReEngagementPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "REFERRAL_INVITE": {
          const payload = data as ReferralInvitePayload;
          console.log(`[MARKETING_WORKER] REFERRAL_INVITE for ${phone} (referrer: ${payload.referrerName}, code: ${payload.referrerCode})`);
          metaPayload = buildReferralInvitePayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }
      }

      console.log(`[MARKETING_WORKER] ✅ Job ${job.id} (${job.name}) completed successfully`);
    } catch (error) {
      console.error(`❌ [MARKETING_WORKER] Job ${job.id} (${job.name}) failed:`, error);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Job data:`, JSON.stringify(job.data, null, 2));

      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.error(`🚨 [MARKETING_WORKER] Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`);
        await dlqQueues.marketing.add(job.name, job.data, { jobId: job.id });
      }

      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 3, // Lower concurrency for marketing
  }
);

// --- OWNER QUEUE WORKER ---
export const ownerWorker = new Worker<OwnerQueuePayload>(
  "whatsapp-owner",
  async (job: Job<OwnerQueuePayload>) => {
    const { data } = job;
    const jobContext = { jobId: job.id, jobName: job.name, phoneNumber: data.phoneNumber };

    console.log(`[OWNER_WORKER] 📥 Processing job ${job.id} (${job.name}) for ${data.phoneNumber} [type: ${data.type}]`);

    try {
      let metaPayload: ReturnType<typeof buildTextPayload> | ReturnType<typeof buildTemplatePayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        case "NEW_LEAD": {
          const payload = data as NewLeadPayload;
          console.log(`[OWNER_WORKER] NEW_LEAD for ${phone} (token: ${payload.visitToken}, student: ${payload.studentName})`);
          metaPayload = buildNewLeadPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES.NEW_LEAD_OWNER });
          break;
        }

        case "VISIT_STARTED": {
          const payload = data as VisitStartedPayload;
          console.log(`[OWNER_WORKER] VISIT_STARTED for ${phone} (token: ${payload.visitToken}, student: ${payload.studentName})`);
          metaPayload = buildVisitStartedPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES.VISIT_STARTED_OWNER });
          break;
        }

        case "VISIT_COMPLETED": {
          const payload = data as VisitCompletedPayload;
          console.log(`[OWNER_WORKER] VISIT_COMPLETED for ${phone} (token: ${payload.visitToken}, status: ${payload.leadStatus})`);
          metaPayload = buildVisitCompletedPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES.VISIT_COMPLETED_OWNER });
          break;
        }

        case "DAILY_SUMMARY": {
          const payload = data as DailySummaryPayload;
          console.log(`[OWNER_WORKER] DAILY_SUMMARY for ${phone} (date: ${payload.date}, visits: ${payload.stats.visitsCompleted}/${payload.stats.totalVisits})`);
          metaPayload = buildDailySummaryPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "WEEKLY_REPORT": {
          const payload = data as WeeklyReportPayload;
          console.log(`[OWNER_WORKER] WEEKLY_REPORT for ${phone} (week: ${payload.weekStart} to ${payload.weekEnd})`);
          metaPayload = buildWeeklyReportPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: "text" });
          break;
        }

        case "LOW_OCCUPANCY": {
          const payload = data as LowOccupancyPayload;
          console.log(`[OWNER_WORKER] LOW_OCCUPANCY for ${phone} (property: ${payload.propertyTitle}, rate: ${payload.occupancyRate}%)`);
          metaPayload = buildLowOccupancyPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES.LOW_OCCUPANCY });
          break;
        }

        case "LISTING_EXPIRY": {
          const payload = data as ListingExpiryPayload;
          console.log(`[OWNER_WORKER] LISTING_EXPIRY for ${phone} (property: ${payload.propertyTitle}, days: ${payload.daysRemaining})`);
          metaPayload = buildListingExpiryPayload(phone, payload);
          await sendMetaApiRequest(metaPayload, { ...jobContext, templateName: TEMPLATES.LISTING_EXPIRY });
          break;
        }
      }

      console.log(`[OWNER_WORKER] ✅ Job ${job.id} (${job.name}) completed successfully`);
    } catch (error) {
      console.error(`❌ [OWNER_WORKER] Job ${job.id} (${job.name}) failed:`, error);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Job data:`, JSON.stringify(job.data, null, 2));

      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.error(`🚨 [OWNER_WORKER] Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`);
        await dlqQueues.owner.add(job.name, job.data, { jobId: job.id });
      }

      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  }
);

// ============================================
// WORKER EVENT LISTENERS
// ============================================

function setupWorkerEvents(worker: Worker, name: string) {
  worker.on("completed", (job: Job) => {
    console.log(`✅ [${name}] Job ${job.id} (${job.name}) completed`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    if (job) {
      console.error(`❌ [${name}] Job ${job.id} (${job.name}) failed:`, err.message);
      console.error(`   Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
    }
  });

  worker.on("error", (err: Error) => {
    console.error(`❌ [${name}] Worker error:`, err);
  });
}

setupWorkerEvents(visitWorker, "VISIT_WORKER");
setupWorkerEvents(reminderWorker, "REMINDER_WORKER");
setupWorkerEvents(paymentWorker, "PAYMENT_WORKER");
setupWorkerEvents(marketingWorker, "MARKETING_WORKER");
setupWorkerEvents(ownerWorker, "OWNER_WORKER");

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

export async function closeAllWorkers(): Promise<void> {
  await Promise.all([
    visitWorker.close(),
    reminderWorker.close(),
    paymentWorker.close(),
    marketingWorker.close(),
    ownerWorker.close(),
  ]);
  console.log("✅ All WhatsApp workers closed");
}

// Export all workers for external access
export const workers = {
  visit: visitWorker,
  reminder: reminderWorker,
  payment: paymentWorker,
  marketing: marketingWorker,
  owner: ownerWorker,
} as const;