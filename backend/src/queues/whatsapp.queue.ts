import { Queue, QueueOptions, Job } from "bullmq";
import { createRedisConnection } from "../config/redis";
import {
  WHATSAPP_QUEUES,
  WHATSAPP_DLQ_SUFFIX,
  WhatsAppJobPayload,
  VisitQueuePayload,
  ReminderQueuePayload,
  PaymentQueuePayload,
  MarketingQueuePayload,
  OwnerQueuePayload,
  VisitCreatedPayload,
  InternCreatedPayload,
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
  StudentRegisteredPayload,
  NewLeadPayload,
  VisitStartedPayload,
  VisitCompletedPayload,
  DailySummaryPayload,
  WeeklyReportPayload,
  LowOccupancyPayload,
  ListingExpiryPayload,
  GuideAssignedStudentPayload,
  QueueName,
  JobPriority,
} from "./types/whatsapp-jobs";

// ============================================
// QUEUE CONFIGURATION
// ============================================

const defaultQueueOptions: QueueOptions = {
  connection: createRedisConnection(),
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

export const visitQueue = new Queue<VisitQueuePayload>(WHATSAPP_QUEUES.VISIT, defaultQueueOptions);
export const reminderQueue = new Queue<ReminderQueuePayload>(WHATSAPP_QUEUES.REMINDER, defaultQueueOptions);
export const paymentQueue = new Queue<PaymentQueuePayload>(WHATSAPP_QUEUES.PAYMENT, defaultQueueOptions);
export const marketingQueue = new Queue<MarketingQueuePayload>(WHATSAPP_QUEUES.MARKETING, defaultQueueOptions);
export const ownerQueue = new Queue<OwnerQueuePayload>(WHATSAPP_QUEUES.OWNER, defaultQueueOptions);

export const queues = {
  visit: visitQueue,
  reminder: reminderQueue,
  payment: paymentQueue,
  marketing: marketingQueue,
  owner: ownerQueue,
} as const;

// ============================================
// DEAD LETTER QUEUES
// ============================================

export const dlqQueues = {
  visit: new Queue<VisitQueuePayload>(`${WHATSAPP_QUEUES.VISIT}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  reminder: new Queue<ReminderQueuePayload>(`${WHATSAPP_QUEUES.REMINDER}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  payment: new Queue<PaymentQueuePayload>(`${WHATSAPP_QUEUES.PAYMENT}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  marketing: new Queue<MarketingQueuePayload>(`${WHATSAPP_QUEUES.MARKETING}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  owner: new Queue<OwnerQueuePayload>(`${WHATSAPP_QUEUES.OWNER}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
} as const;

// ============================================
// HELPER: Generate unique job ID
// ============================================

function generateJobId(type: string, identifier: string): string {
  return `${type}_${identifier}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================
// VISIT QUEUE ENQUEUE HELPERS
// ============================================

export async function queueVisitCreated(payload: Omit<VisitCreatedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("VISIT_CREATED", payload.visitToken);
  return visitQueue.add("VISIT_CREATED", {
    ...payload,
    type: "VISIT_CREATED",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as VisitCreatedPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueInternCreated(payload: Omit<InternCreatedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("INTERN_CREATED", payload.internPhone);
  return visitQueue.add("INTERN_CREATED", {
    ...payload,
    type: "INTERN_CREATED",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as InternCreatedPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueInternAssigned(payload: Omit<InternAssignedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("INTERN_ASSIGNED", payload.visitToken);
  return visitQueue.add("INTERN_ASSIGNED", {
    ...payload,
    type: "INTERN_ASSIGNED",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as InternAssignedPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueGuideAssignedStudent(payload: Omit<GuideAssignedStudentPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("GUIDE_ASSIGNED_STUDENT", payload.visitToken);
  return visitQueue.add("GUIDE_ASSIGNED_STUDENT", {
    ...payload,
    type: "GUIDE_ASSIGNED_STUDENT",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as GuideAssignedStudentPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueVisitOtpSent(payload: Omit<VisitOtpSentPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("VISIT_OTP_SENT", payload.visitToken);
  return visitQueue.add("VISIT_OTP_SENT", {
    ...payload,
    type: "VISIT_OTP_SENT",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as VisitOtpSentPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueVisitConfirmed(payload: Omit<VisitConfirmedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("VISIT_CONFIRMED", payload.visitToken);
  return visitQueue.add("VISIT_CONFIRMED", {
    ...payload,
    type: "VISIT_CONFIRMED",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as VisitConfirmedPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueOTPVerify(payload: Omit<OTPVerifyPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("OTP_VERIFY", payload.visitToken);
  return visitQueue.add("OTP_VERIFY", {
    ...payload,
    type: "OTP_VERIFY",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as OTPVerifyPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueStudentArrivalAlert(payload: Omit<StudentArrivalAlertPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitQueuePayload>> {
  const jobId = generateJobId("STUDENT_ARRIVAL_ALERT", payload.visitToken);
  return visitQueue.add("STUDENT_ARRIVAL_ALERT", {
    ...payload,
    type: "STUDENT_ARRIVAL_ALERT",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as StudentArrivalAlertPayload, {
    jobId,
    priority: 10,
  });
}

// ============================================
// REMINDER QUEUE ENQUEUE HELPERS
// ============================================

export async function queueProfileCompletionReminder(
  payload: Omit<ProfileCompletionPayload, "type" | "jobId" | "timestamp" | "priority">,
  delayMs: number = 6 * 60 * 60 * 1000
): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId("PROFILE_COMPLETION", payload.phoneNumber);
  return reminderQueue.add("PROFILE_COMPLETION", {
    ...payload,
    type: "PROFILE_COMPLETION",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as ProfileCompletionPayload, {
    jobId,
    priority: 1,
    delay: delayMs,
  });
}

export async function queueVisitReminder(
  type: "VISIT_24H" | "VISIT_2H" | "VISIT_30M",
  payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">,
  delayMs: number
): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId(type, payload.visitToken);
  return reminderQueue.add(type, {
    ...payload,
    type,
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as VisitReminderPayload, {
    jobId,
    priority: 5,
    delay: delayMs,
  });
}

export async function queueVisit24HReminder(payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReminderQueuePayload>> {
  return queueVisitReminder("VISIT_24H", payload, 24 * 60 * 60 * 1000);
}

export async function queueVisit2HReminder(payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReminderQueuePayload>> {
  return queueVisitReminder("VISIT_2H", payload, 2 * 60 * 60 * 1000);
}

export async function queueVisit30MReminder(payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReminderQueuePayload>> {
  return queueVisitReminder("VISIT_30M", payload, 30 * 60 * 1000);
}

export async function queueFeedbackRequest(
  payload: Omit<FeedbackRequestPayload, "type" | "jobId" | "timestamp" | "priority">,
  delayMs: number = 2 * 60 * 60 * 1000
): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId("FEEDBACK_REQUEST", payload.visitToken);
  return reminderQueue.add("FEEDBACK_REQUEST", {
    ...payload,
    type: "FEEDBACK_REQUEST",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as FeedbackRequestPayload, {
    jobId,
    priority: 1,
    delay: delayMs,
  });
}

export async function queueDocumentCollection(payload: Omit<DocumentCollectionPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId("DOCUMENT_COLLECTION", payload.visitToken);
  return reminderQueue.add("DOCUMENT_COLLECTION", {
    ...payload,
    type: "DOCUMENT_COLLECTION",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as DocumentCollectionPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueTokenPaymentReminder(payload: Omit<TokenPaymentReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId("TOKEN_PAYMENT_REMINDER", payload.visitToken);
  return reminderQueue.add("TOKEN_PAYMENT_REMINDER", {
    ...payload,
    type: "TOKEN_PAYMENT_REMINDER",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as TokenPaymentReminderPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueRentDueReminder(payload: Omit<RentDueReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId("RENT_DUE_REMINDER", payload.phoneNumber);
  return reminderQueue.add("RENT_DUE_REMINDER", {
    ...payload,
    type: "RENT_DUE_REMINDER",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as RentDueReminderPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueInternDailySchedule(
  payload: Omit<InternDailySchedulePayload, "type" | "jobId" | "timestamp" | "priority"> & { type: InternDailySchedulePayload["type"] }
): Promise<Job<ReminderQueuePayload>> {
  const jobId = generateJobId("INTERN_DAILY_SCHEDULE", `${payload.internId}_${payload.date}`);
  return reminderQueue.add(payload.type, {
    ...payload,
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as InternDailySchedulePayload, {
    jobId,
    priority: 5,
  });
}

// ============================================
// PAYMENT QUEUE ENQUEUE HELPERS
// ============================================

export async function queueTokenDue(payload: Omit<TokenDuePayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<PaymentQueuePayload>> {
  const jobId = generateJobId("TOKEN_DUE", payload.visitToken);
  return paymentQueue.add("TOKEN_DUE", {
    ...payload,
    type: "TOKEN_DUE",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as TokenDuePayload, {
    jobId,
    priority: 10,
  });
}

export async function queueTokenConfirmed(payload: Omit<TokenConfirmedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<PaymentQueuePayload>> {
  const jobId = generateJobId("TOKEN_CONFIRMED", payload.visitToken);
  return paymentQueue.add("TOKEN_CONFIRMED", {
    ...payload,
    type: "TOKEN_CONFIRMED",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as TokenConfirmedPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueTokenRejected(payload: Omit<TokenRejectedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<PaymentQueuePayload>> {
  const jobId = generateJobId("TOKEN_REJECTED", payload.visitToken);
  return paymentQueue.add("TOKEN_REJECTED", {
    ...payload,
    type: "TOKEN_REJECTED",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as TokenRejectedPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueRefundProcessed(payload: Omit<RefundProcessedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<PaymentQueuePayload>> {
  const jobId = generateJobId("REFUND_PROCESSED", payload.visitToken);
  return paymentQueue.add("REFUND_PROCESSED", {
    ...payload,
    type: "REFUND_PROCESSED",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as RefundProcessedPayload, {
    jobId,
    priority: 5,
  });
}

// ============================================
// MARKETING QUEUE ENQUEUE HELPERS
// ============================================

export async function queueWelcomeJourney(payload: Omit<WelcomeJourneyPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<MarketingQueuePayload>> {
  const jobId = generateJobId("WELCOME_JOURNEY", payload.phoneNumber);
  return marketingQueue.add("WELCOME_JOURNEY", {
    ...payload,
    type: "WELCOME_JOURNEY",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as WelcomeJourneyPayload, {
    jobId,
    priority: 1,
  });
}

export async function queueBroadcast(payload: Omit<BroadcastPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<MarketingQueuePayload>> {
  const jobId = generateJobId("BROADCAST", `${payload.templateName}_${Date.now()}`);
  return marketingQueue.add("BROADCAST", {
    ...payload,
    type: "BROADCAST",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as BroadcastPayload, {
    jobId,
    priority: 1,
  });
}

export async function queueReEngagement(payload: Omit<ReEngagementPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<MarketingQueuePayload>> {
  const jobId = generateJobId("RE_ENGAGEMENT", payload.phoneNumber);
  return marketingQueue.add("RE_ENGAGEMENT", {
    ...payload,
    type: "RE_ENGAGEMENT",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as ReEngagementPayload, {
    jobId,
    priority: 1,
  });
}

export async function queueReferralInvite(payload: Omit<ReferralInvitePayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<MarketingQueuePayload>> {
  const jobId = generateJobId("REFERRAL_INVITE", payload.referrerCode);
  return marketingQueue.add("REFERRAL_INVITE", {
    ...payload,
    type: "REFERRAL_INVITE",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as ReferralInvitePayload, {
    jobId,
    priority: 1,
  });
}

export async function queueStudentRegistered(payload: Omit<StudentRegisteredPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<MarketingQueuePayload>> {
  const jobId = generateJobId("STUDENT_REGISTERED", payload.phoneNumber);
  return marketingQueue.add("STUDENT_REGISTERED", {
    ...payload,
    type: "STUDENT_REGISTERED",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as StudentRegisteredPayload, {
    jobId,
    priority: 10,
  });
}

// ============================================
// OWNER QUEUE ENQUEUE HELPERS
// ============================================

export async function queueNewLead(payload: Omit<NewLeadPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("NEW_LEAD", payload.visitToken);
  return ownerQueue.add("NEW_LEAD", {
    ...payload,
    type: "NEW_LEAD",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as NewLeadPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueVisitStarted(payload: Omit<VisitStartedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("VISIT_STARTED", payload.visitToken);
  return ownerQueue.add("VISIT_STARTED", {
    ...payload,
    type: "VISIT_STARTED",
    jobId,
    timestamp: Date.now(),
    priority: 10,
  } as VisitStartedPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueVisitCompleted(payload: Omit<VisitCompletedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("VISIT_COMPLETED", payload.visitToken);
  return ownerQueue.add("VISIT_COMPLETED", {
    ...payload,
    type: "VISIT_COMPLETED",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as VisitCompletedPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueDailySummary(payload: Omit<DailySummaryPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("DAILY_SUMMARY", `${payload.ownerId}_${payload.date}`);
  return ownerQueue.add("DAILY_SUMMARY", {
    ...payload,
    type: "DAILY_SUMMARY",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as DailySummaryPayload, {
    jobId,
    priority: 1,
  });
}

export async function queueWeeklyReport(payload: Omit<WeeklyReportPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("WEEKLY_REPORT", `${payload.ownerId}_${payload.weekStart}`);
  return ownerQueue.add("WEEKLY_REPORT", {
    ...payload,
    type: "WEEKLY_REPORT",
    jobId,
    timestamp: Date.now(),
    priority: 1,
  } as WeeklyReportPayload, {
    jobId,
    priority: 1,
  });
}

export async function queueLowOccupancy(payload: Omit<LowOccupancyPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("LOW_OCCUPANCY", payload.propertyId);
  return ownerQueue.add("LOW_OCCUPANCY", {
    ...payload,
    type: "LOW_OCCUPANCY",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as LowOccupancyPayload, {
    jobId,
    priority: 5,
  });
}

export async function queueListingExpiry(payload: Omit<ListingExpiryPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OwnerQueuePayload>> {
  const jobId = generateJobId("LISTING_EXPIRY", payload.propertyId);
  return ownerQueue.add("LISTING_EXPIRY", {
    ...payload,
    type: "LISTING_EXPIRY",
    jobId,
    timestamp: Date.now(),
    priority: 5,
  } as ListingExpiryPayload, {
    jobId,
    priority: 5,
  });
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

export async function getQueueStats(): Promise<Record<string, { waiting: number; active: number; completed: number; failed: number }>> {
  const stats: Record<string, { waiting: number; active: number; completed: number; failed: number }> = {};

  for (const [name, queue] of Object.entries(queues)) {
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

export async function pauseAllQueues(): Promise<void> {
  await Promise.all(Object.values(queues).map((q) => q.pause()));
}

export async function resumeAllQueues(): Promise<void> {
  await Promise.all(Object.values(queues).map((q) => q.resume()));
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all([
    ...Object.values(queues).map((q) => q.close()),
    ...Object.values(dlqQueues).map((q) => q.close()),
  ]);
}

// ============================================
// EVENT LISTENERS FOR LOGGING
// ============================================

function setupQueueEvents(queue: Queue<any>, queueName: string): void {
  (queue as any).on("completed", (job: Job) => {
    console.log(`✅ [${queueName}] Job ${job.id} (${job.name}) completed`);
  });

  (queue as any).on("failed", (job: Job | undefined, err: Error) => {
    if (job) {
      console.error(`❌ [${queueName}] Job ${job.id} (${job.name}) failed:`, err.message);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Payload:`, JSON.stringify(job.data, null, 2));
    }
  });

  (queue as any).on("stalled", (jobId: string) => {
    console.warn(`⚠️ [${queueName}] Job ${jobId} stalled`);
  });
}

Object.entries(queues).forEach(([name, queue]) => setupQueueEvents(queue, name));
Object.entries(dlqQueues).forEach(([name, queue]) => setupQueueEvents(queue, `DLQ:${name}`));