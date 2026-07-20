"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dlqQueues = exports.queues = exports.ownerQueue = exports.marketingQueue = exports.paymentQueue = exports.reminderQueue = exports.visitQueue = void 0;
exports.queueVisitCreated = queueVisitCreated;
exports.queueInternAssigned = queueInternAssigned;
exports.queueVisitOtpSent = queueVisitOtpSent;
exports.queueVisitConfirmed = queueVisitConfirmed;
exports.queueOTPVerify = queueOTPVerify;
exports.queueStudentArrivalAlert = queueStudentArrivalAlert;
exports.queueProfileCompletionReminder = queueProfileCompletionReminder;
exports.queueVisitReminder = queueVisitReminder;
exports.queueVisit24HReminder = queueVisit24HReminder;
exports.queueVisit2HReminder = queueVisit2HReminder;
exports.queueVisit30MReminder = queueVisit30MReminder;
exports.queueFeedbackRequest = queueFeedbackRequest;
exports.queueDocumentCollection = queueDocumentCollection;
exports.queueTokenPaymentReminder = queueTokenPaymentReminder;
exports.queueRentDueReminder = queueRentDueReminder;
exports.queueInternDailySchedule = queueInternDailySchedule;
exports.queueTokenDue = queueTokenDue;
exports.queueTokenConfirmed = queueTokenConfirmed;
exports.queueTokenRejected = queueTokenRejected;
exports.queueRefundProcessed = queueRefundProcessed;
exports.queueWelcomeJourney = queueWelcomeJourney;
exports.queueBroadcast = queueBroadcast;
exports.queueReEngagement = queueReEngagement;
exports.queueReferralInvite = queueReferralInvite;
exports.queueNewLead = queueNewLead;
exports.queueVisitStarted = queueVisitStarted;
exports.queueVisitCompleted = queueVisitCompleted;
exports.queueDailySummary = queueDailySummary;
exports.queueWeeklyReport = queueWeeklyReport;
exports.queueLowOccupancy = queueLowOccupancy;
exports.queueListingExpiry = queueListingExpiry;
exports.getQueueStats = getQueueStats;
exports.pauseAllQueues = pauseAllQueues;
exports.resumeAllQueues = resumeAllQueues;
exports.closeAllQueues = closeAllQueues;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const whatsapp_jobs_1 = require("./types/whatsapp-jobs");
// ============================================
// QUEUE CONFIGURATION
// ============================================
const defaultQueueOptions = {
    connection: (0, redis_1.createRedisConnection)(),
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000, // 2s, 4s, 8s
        },
        priority: 5, // Medium default
    },
};
// ============================================
// QUEUE INSTANCES
// ============================================
exports.visitQueue = new bullmq_1.Queue(whatsapp_jobs_1.WHATSAPP_QUEUES.VISIT, defaultQueueOptions);
exports.reminderQueue = new bullmq_1.Queue(whatsapp_jobs_1.WHATSAPP_QUEUES.REMINDER, defaultQueueOptions);
exports.paymentQueue = new bullmq_1.Queue(whatsapp_jobs_1.WHATSAPP_QUEUES.PAYMENT, defaultQueueOptions);
exports.marketingQueue = new bullmq_1.Queue(whatsapp_jobs_1.WHATSAPP_QUEUES.MARKETING, defaultQueueOptions);
exports.ownerQueue = new bullmq_1.Queue(whatsapp_jobs_1.WHATSAPP_QUEUES.OWNER, defaultQueueOptions);
exports.queues = {
    visit: exports.visitQueue,
    reminder: exports.reminderQueue,
    payment: exports.paymentQueue,
    marketing: exports.marketingQueue,
    owner: exports.ownerQueue,
};
// ============================================
// DEAD LETTER QUEUES
// ============================================
exports.dlqQueues = {
    visit: new bullmq_1.Queue(`${whatsapp_jobs_1.WHATSAPP_QUEUES.VISIT}${whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
    reminder: new bullmq_1.Queue(`${whatsapp_jobs_1.WHATSAPP_QUEUES.REMINDER}${whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
    payment: new bullmq_1.Queue(`${whatsapp_jobs_1.WHATSAPP_QUEUES.PAYMENT}${whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
    marketing: new bullmq_1.Queue(`${whatsapp_jobs_1.WHATSAPP_QUEUES.MARKETING}${whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
    owner: new bullmq_1.Queue(`${whatsapp_jobs_1.WHATSAPP_QUEUES.OWNER}${whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
};
// ============================================
// HELPER: Generate unique job ID
// ============================================
function generateJobId(type, identifier) {
    return `${type}_${identifier}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
// ============================================
// VISIT QUEUE ENQUEUE HELPERS
// ============================================
async function queueVisitCreated(payload) {
    const jobId = generateJobId("VISIT_CREATED", payload.visitToken);
    return exports.visitQueue.add("VISIT_CREATED", {
        ...payload,
        type: "VISIT_CREATED",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
async function queueInternAssigned(payload) {
    const jobId = generateJobId("INTERN_ASSIGNED", payload.visitToken);
    return exports.visitQueue.add("INTERN_ASSIGNED", {
        ...payload,
        type: "INTERN_ASSIGNED",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
async function queueVisitOtpSent(payload) {
    const jobId = generateJobId("VISIT_OTP_SENT", payload.visitToken);
    return exports.visitQueue.add("VISIT_OTP_SENT", {
        ...payload,
        type: "VISIT_OTP_SENT",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
async function queueVisitConfirmed(payload) {
    const jobId = generateJobId("VISIT_CONFIRMED", payload.visitToken);
    return exports.visitQueue.add("VISIT_CONFIRMED", {
        ...payload,
        type: "VISIT_CONFIRMED",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueOTPVerify(payload) {
    const jobId = generateJobId("OTP_VERIFY", payload.visitToken);
    return exports.visitQueue.add("OTP_VERIFY", {
        ...payload,
        type: "OTP_VERIFY",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
async function queueStudentArrivalAlert(payload) {
    const jobId = generateJobId("STUDENT_ARRIVAL_ALERT", payload.visitToken);
    return exports.visitQueue.add("STUDENT_ARRIVAL_ALERT", {
        ...payload,
        type: "STUDENT_ARRIVAL_ALERT",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
// ============================================
// REMINDER QUEUE ENQUEUE HELPERS
// ============================================
async function queueProfileCompletionReminder(payload, delayMs = 6 * 60 * 60 * 1000) {
    const jobId = generateJobId("PROFILE_COMPLETION", payload.phoneNumber);
    return exports.reminderQueue.add("PROFILE_COMPLETION", {
        ...payload,
        type: "PROFILE_COMPLETION",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
        delay: delayMs,
    });
}
async function queueVisitReminder(type, payload, delayMs) {
    const jobId = generateJobId(type, payload.visitToken);
    return exports.reminderQueue.add(type, {
        ...payload,
        type,
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
        delay: delayMs,
    });
}
async function queueVisit24HReminder(payload) {
    return queueVisitReminder("VISIT_24H", payload, 24 * 60 * 60 * 1000);
}
async function queueVisit2HReminder(payload) {
    return queueVisitReminder("VISIT_2H", payload, 2 * 60 * 60 * 1000);
}
async function queueVisit30MReminder(payload) {
    return queueVisitReminder("VISIT_30M", payload, 30 * 60 * 1000);
}
async function queueFeedbackRequest(payload, delayMs = 2 * 60 * 60 * 1000) {
    const jobId = generateJobId("FEEDBACK_REQUEST", payload.visitToken);
    return exports.reminderQueue.add("FEEDBACK_REQUEST", {
        ...payload,
        type: "FEEDBACK_REQUEST",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
        delay: delayMs,
    });
}
async function queueDocumentCollection(payload) {
    const jobId = generateJobId("DOCUMENT_COLLECTION", payload.visitToken);
    return exports.reminderQueue.add("DOCUMENT_COLLECTION", {
        ...payload,
        type: "DOCUMENT_COLLECTION",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueTokenPaymentReminder(payload) {
    const jobId = generateJobId("TOKEN_PAYMENT_REMINDER", payload.visitToken);
    return exports.reminderQueue.add("TOKEN_PAYMENT_REMINDER", {
        ...payload,
        type: "TOKEN_PAYMENT_REMINDER",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueRentDueReminder(payload) {
    const jobId = generateJobId("RENT_DUE_REMINDER", payload.phoneNumber);
    return exports.reminderQueue.add("RENT_DUE_REMINDER", {
        ...payload,
        type: "RENT_DUE_REMINDER",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueInternDailySchedule(payload) {
    const jobId = generateJobId("INTERN_DAILY_SCHEDULE", `${payload.internId}_${payload.date}`);
    return exports.reminderQueue.add(payload.type, {
        ...payload,
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
// ============================================
// PAYMENT QUEUE ENQUEUE HELPERS
// ============================================
async function queueTokenDue(payload) {
    const jobId = generateJobId("TOKEN_DUE", payload.visitToken);
    return exports.paymentQueue.add("TOKEN_DUE", {
        ...payload,
        type: "TOKEN_DUE",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
async function queueTokenConfirmed(payload) {
    const jobId = generateJobId("TOKEN_CONFIRMED", payload.visitToken);
    return exports.paymentQueue.add("TOKEN_CONFIRMED", {
        ...payload,
        type: "TOKEN_CONFIRMED",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueTokenRejected(payload) {
    const jobId = generateJobId("TOKEN_REJECTED", payload.visitToken);
    return exports.paymentQueue.add("TOKEN_REJECTED", {
        ...payload,
        type: "TOKEN_REJECTED",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueRefundProcessed(payload) {
    const jobId = generateJobId("REFUND_PROCESSED", payload.visitToken);
    return exports.paymentQueue.add("REFUND_PROCESSED", {
        ...payload,
        type: "REFUND_PROCESSED",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
// ============================================
// MARKETING QUEUE ENQUEUE HELPERS
// ============================================
async function queueWelcomeJourney(payload) {
    const jobId = generateJobId("WELCOME_JOURNEY", payload.phoneNumber);
    return exports.marketingQueue.add("WELCOME_JOURNEY", {
        ...payload,
        type: "WELCOME_JOURNEY",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
    });
}
async function queueBroadcast(payload) {
    const jobId = generateJobId("BROADCAST", `${payload.templateName}_${Date.now()}`);
    return exports.marketingQueue.add("BROADCAST", {
        ...payload,
        type: "BROADCAST",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
    });
}
async function queueReEngagement(payload) {
    const jobId = generateJobId("RE_ENGAGEMENT", payload.phoneNumber);
    return exports.marketingQueue.add("RE_ENGAGEMENT", {
        ...payload,
        type: "RE_ENGAGEMENT",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
    });
}
async function queueReferralInvite(payload) {
    const jobId = generateJobId("REFERRAL_INVITE", payload.referrerCode);
    return exports.marketingQueue.add("REFERRAL_INVITE", {
        ...payload,
        type: "REFERRAL_INVITE",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
    });
}
// ============================================
// OWNER QUEUE ENQUEUE HELPERS
// ============================================
async function queueNewLead(payload) {
    const jobId = generateJobId("NEW_LEAD", payload.visitToken);
    return exports.ownerQueue.add("NEW_LEAD", {
        ...payload,
        type: "NEW_LEAD",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueVisitStarted(payload) {
    const jobId = generateJobId("VISIT_STARTED", payload.visitToken);
    return exports.ownerQueue.add("VISIT_STARTED", {
        ...payload,
        type: "VISIT_STARTED",
        jobId,
        timestamp: Date.now(),
        priority: 10,
    }, {
        jobId,
        priority: 10,
    });
}
async function queueVisitCompleted(payload) {
    const jobId = generateJobId("VISIT_COMPLETED", payload.visitToken);
    return exports.ownerQueue.add("VISIT_COMPLETED", {
        ...payload,
        type: "VISIT_COMPLETED",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueDailySummary(payload) {
    const jobId = generateJobId("DAILY_SUMMARY", `${payload.ownerId}_${payload.date}`);
    return exports.ownerQueue.add("DAILY_SUMMARY", {
        ...payload,
        type: "DAILY_SUMMARY",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
    });
}
async function queueWeeklyReport(payload) {
    const jobId = generateJobId("WEEKLY_REPORT", `${payload.ownerId}_${payload.weekStart}`);
    return exports.ownerQueue.add("WEEKLY_REPORT", {
        ...payload,
        type: "WEEKLY_REPORT",
        jobId,
        timestamp: Date.now(),
        priority: 1,
    }, {
        jobId,
        priority: 1,
    });
}
async function queueLowOccupancy(payload) {
    const jobId = generateJobId("LOW_OCCUPANCY", payload.propertyId);
    return exports.ownerQueue.add("LOW_OCCUPANCY", {
        ...payload,
        type: "LOW_OCCUPANCY",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
async function queueListingExpiry(payload) {
    const jobId = generateJobId("LISTING_EXPIRY", payload.propertyId);
    return exports.ownerQueue.add("LISTING_EXPIRY", {
        ...payload,
        type: "LISTING_EXPIRY",
        jobId,
        timestamp: Date.now(),
        priority: 5,
    }, {
        jobId,
        priority: 5,
    });
}
// ============================================
// QUEUE MANAGEMENT
// ============================================
async function getQueueStats() {
    const stats = {};
    for (const [name, queue] of Object.entries(exports.queues)) {
        const [waiting, active, completed, failed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
        ]);
        stats[name] = { waiting, active, completed, failed };
    }
    return stats;
}
async function pauseAllQueues() {
    await Promise.all(Object.values(exports.queues).map((q) => q.pause()));
}
async function resumeAllQueues() {
    await Promise.all(Object.values(exports.queues).map((q) => q.resume()));
}
async function closeAllQueues() {
    await Promise.all([
        ...Object.values(exports.queues).map((q) => q.close()),
        ...Object.values(exports.dlqQueues).map((q) => q.close()),
    ]);
}
// ============================================
// EVENT LISTENERS FOR LOGGING
// ============================================
function setupQueueEvents(queue, queueName) {
    queue.on("completed", (job) => {
        console.log(`✅ [${queueName}] Job ${job.id} (${job.name}) completed`);
    });
    queue.on("failed", (job, err) => {
        if (job) {
            console.error(`❌ [${queueName}] Job ${job.id} (${job.name}) failed:`, err.message);
            console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
            console.error(`   Payload:`, JSON.stringify(job.data, null, 2));
        }
    });
    queue.on("stalled", (jobId) => {
        console.warn(`⚠️ [${queueName}] Job ${jobId} stalled`);
    });
}
Object.entries(exports.queues).forEach(([name, queue]) => setupQueueEvents(queue, name));
Object.entries(exports.dlqQueues).forEach(([name, queue]) => setupQueueEvents(queue, `DLQ:${name}`));
