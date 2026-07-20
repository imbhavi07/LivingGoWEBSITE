# BullMQ WhatsApp Queue Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement production-ready BullMQ WhatsApp queue architecture with 5 queues, workers, Redis session management, and Meta WhatsApp Cloud API v20.0 integration for LivingGo marketplace.

**Architecture:** 5 separate BullMQ queues (visit, reminder, payment, marketing, owner) with dedicated workers, Redis-backed session storage for conversation state, and typed job payload interfaces. Express controllers enqueue jobs instead of calling Meta API directly.

**Tech Stack:** BullMQ 5.x, ioredis 5.x, TypeScript strict mode, Meta WhatsApp Cloud API v20.0, Prisma ORM, Express.js

## Global Constraints

- TypeScript strict mode enabled - no `any` types, explicit interfaces for all job payloads
- Never execute Meta API calls in Express handlers - everything must be queued
- Exponential backoff retries: 3 attempts (2s, 4s, 8s)
- Dead letter queues for each main queue: `whatsapp:dlq:{queueName}`
- Job priorities: High=10, Medium=5, Low=1
- Redis keys: `sess:{phone}:user_role`, `sess:{phone}:current_step`, `sess:{phone}:context`
- Session TTL: 30 min (active), 24h (idle)
- Meta API rate limit: 30 msg/sec per phone number

---

### Task 1: Add Dependencies & Redis Config

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/config/redis.ts`

**Interfaces:**
- Produces: `redisClient` (ioredis instance), `createRedisConnection()` function

- [ ] **Step 1: Add bullmq and ioredis to package.json**

```json
{
  "dependencies": {
    "bullmq": "^5.0.0",
    "ioredis": "^5.4.0"
  },
  "devDependencies": {
    "@types/ioredis": "^5.0.0"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
cd /Users/bhavi/Downloads/LivingGoWEBSITE/backend && npm install
```

- [ ] **Step 3: Create redis.ts config**

```typescript
// backend/src/config/redis.ts
import Redis from "ioredis";
import { env } from "./env";

let redisClient: Redis | null = null;

export function createRedisConnection(): Redis {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected");
  });

  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    return createRedisConnection();
  }
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
```

- [ ] **Step 4: Update env.ts to include Redis URL**

```typescript
// backend/src/config/env.ts - add to schema
REDIS_URL: z.string().min(1, "REDIS_URL is required"),
```

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/src/config/redis.ts backend/src/config/env.ts
git commit -m "feat: add bullmq, ioredis dependencies and Redis config"
```

---

### Task 2: Create WhatsApp Job Types

**Files:**
- Create: `backend/src/queues/types/whatsapp-jobs.ts`

**Interfaces:**
- Produces: All job payload interfaces for 5 queues

- [ ] **Step 1: Create whatsapp-jobs.ts with all interfaces**

```typescript
// backend/src/queues/types/whatsapp-jobs.ts

// ============================================
// BASE TYPES
// ============================================

export type UserRole = "student" | "intern" | "owner" | "supervisor" | "admin";
export type JobPriority = 1 | 5 | 10; // Low, Medium, High

export interface BaseJobPayload {
  jobId: string;
  timestamp: number;
  priority: JobPriority;
  phoneNumber: string; // E.164 format: 91XXXXXXXXXX
  userRole: UserRole;
}

// ============================================
// VISIT QUEUE JOBS (whatsapp:visit)
// ============================================

export type VisitJobType = 
  | "VISIT_CREATED"
  | "INTERN_ASSIGNED"
  | "VISIT_OTP_SENT"
  | "VISIT_CONFIRMED"
  | "VISIT_RESCHEDULED"
  | "VISIT_CANCELLED"
  | "STUDENT_ARRIVAL_ALERT"
  | "OTP_VERIFY";

export interface VisitCreatedPayload extends BaseJobPayload {
  type: "VISIT_CREATED";
  visitId: string;
  visitToken: string;
  studentName: string;
  studentPhone: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  visitDate: string; // ISO string
  timeSlot: string;
  visitOtp: string;
  assignedInternId?: string;
}

export interface InternAssignedPayload extends BaseJobPayload {
  type: "INTERN_ASSIGNED";
  visitId: string;
  visitToken: string;
  internId: string;
  internName: string;
  internPhone: string;
  studentName: string;
  propertyTitle: string;
  propertyLocation: string;
  visitDate: string;
  timeSlot: string;
  visitOtp: string;
  mapsLink: string;
  emergencyContact: string;
}

export interface VisitOtpSentPayload extends BaseJobPayload {
  type: "VISIT_OTP_SENT";
  visitId: string;
  visitToken: string;
  studentName: string;
  visitDate: string;
  timeSlot: string;
  visitOtp: string;
  propertyTitle: string;
  propertyLocation: string;
  internName: string;
  internPhone: string;
  mapsLink: string;
  emergencyContact: string;
}

export interface VisitConfirmedPayload extends BaseJobPayload {
  type: "VISIT_CONFIRMED";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  visitDate: string;
  timeSlot: string;
}

export interface OTPVerifyPayload extends BaseJobPayload {
  type: "OTP_VERIFY";
  visitId: string;
  visitToken: string;
  providedOtp: string;
  attemptNumber: number;
}

export interface StudentArrivalAlertPayload extends BaseJobPayload {
  type: "STUDENT_ARRIVAL_ALERT";
  visitId: string;
  visitToken: string;
  internId: string;
  internName: string;
  internPhone: string;
  studentName: string;
  studentPhone: string;
  propertyTitle: string;
  visitOtp: string;
}

export type VisitQueuePayload = 
  | VisitCreatedPayload
  | InternAssignedPayload
  | VisitOtpSentPayload
  | VisitConfirmedPayload
  | OTPVerifyPayload
  | StudentArrivalAlertPayload;

// ============================================
// REMINDER QUEUE JOBS (whatsapp:reminder)
// ============================================

export type ReminderJobType =
  | "PROFILE_COMPLETION"
  | "VISIT_24H"
  | "VISIT_2H"
  | "VISIT_30M"
  | "FEEDBACK_REQUEST"
  | "DOCUMENT_COLLECTION"
  | "TOKEN_PAYMENT_REMINDER"
  | "RENT_DUE_REMINDER"
  | "INTERN_DAILY_SCHEDULE_10AM"
  | "INTERN_DAILY_SCHEDULE_12PM"
  | "INTERN_DAILY_SCHEDULE_4PM";

export interface ProfileCompletionPayload extends BaseJobPayload {
  type: "PROFILE_COMPLETION";
  studentName: string;
  profileUrl: string;
}

export interface VisitReminderPayload extends BaseJobPayload {
  type: "VISIT_24H" | "VISIT_2H" | "VISIT_30M";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  propertyLocation: string;
  visitDate: string;
  timeSlot: string;
  visitOtp?: string;
  internName?: string;
  internPhone?: string;
  mapsLink?: string;
}

export interface FeedbackRequestPayload extends BaseJobPayload {
  type: "FEEDBACK_REQUEST";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  feedbackUrl: string;
}

export interface DocumentCollectionPayload extends BaseJobPayload {
  type: "DOCUMENT_COLLECTION";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  documentsNeeded: string[];
  uploadUrl: string;
}

export interface TokenPaymentReminderPayload extends BaseJobPayload {
  type: "TOKEN_PAYMENT_REMINDER";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  amount: number;
  dueDate: string;
  paymentUrl: string;
  utrRequired: boolean;
}

export interface RentDueReminderPayload extends BaseJobPayload {
  type: "RENT_DUE_REMINDER";
  studentName: string;
  propertyTitle: string;
  amount: number;
  dueDate: string;
  upiId: string;
  payeeName: string;
}

export interface InternDailySchedulePayload extends BaseJobPayload {
  type: "INTERN_DAILY_SCHEDULE_10AM" | "INTERN_DAILY_SCHEDULE_12PM" | "INTERN_DAILY_SCHEDULE_4PM";
  internId: string;
  internName: string;
  date: string; // YYYY-MM-DD
  visits: Array<{
    visitId: string;
    visitToken: string;
    studentName: string;
    studentPhone: string;
    propertyTitle: string;
    propertyLocation: string;
    timeSlot: string;
    visitOtp: string;
  }>;
}

export type ReminderQueuePayload =
  | ProfileCompletionPayload
  | VisitReminderPayload
  | FeedbackRequestPayload
  | DocumentCollectionPayload
  | TokenPaymentReminderPayload
  | RentDueReminderPayload
  | InternDailySchedulePayload;

// ============================================
// PAYMENT QUEUE JOBS (whatsapp:payment)
// ============================================

export type PaymentJobType =
  | "TOKEN_DUE"
  | "TOKEN_CONFIRMED"
  | "TOKEN_REJECTED"
  | "RENT_DUE"
  | "RENT_CONFIRMED"
  | "REFUND_PROCESSED"
  | "PAYOUT_TO_OWNER";

export interface TokenDuePayload extends BaseJobPayload {
  type: "TOKEN_DUE";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  amount: number;
  dueDate: string;
  paymentUrl: string;
}

export interface TokenConfirmedPayload extends BaseJobPayload {
  type: "TOKEN_CONFIRMED";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  amount: number;
  utrNumber: string;
  moveInDate?: string;
}

export interface TokenRejectedPayload extends BaseJobPayload {
  type: "TOKEN_REJECTED";
  visitId: string;
  visitToken: string;
  studentName: string;
  propertyTitle: string;
  reason: string;
}

export interface RefundProcessedPayload extends BaseJobPayload {
  type: "REFUND_PROCESSED";
  visitId: string;
  visitToken: string;
  studentName: string;
  amount: number;
  refundReference: string;
}

export type PaymentQueuePayload =
  | TokenDuePayload
  | TokenConfirmedPayload
  | TokenRejectedPayload
  | RefundProcessedPayload;

// ============================================
// MARKETING QUEUE JOBS (whatsapp:marketing)
// ============================================

export type MarketingJobType =
  | "WELCOME_JOURNEY"
  | "BROADCAST"
  | "RE_ENGAGEMENT"
  | "REFERRAL_INVITE"
  | "PROMOTIONAL_OFFER";

export interface WelcomeJourneyPayload extends BaseJobPayload {
  type: "WELCOME_JOURNEY";
  step: "WELCOME" | "FIND_PG" | "WISHLIST" | "SCHEDULE_VISIT" | "ASK_QUESTIONS";
  studentName: string;
  studentPhone: string;
  deepLink?: string;
}

export interface BroadcastPayload extends BaseJobPayload {
  type: "BROADCAST";
  templateName: string;
  templateParams: Record<string, string>;
  segment?: string; // "all_students", "active_interns", etc.
}

export interface ReEngagementPayload extends BaseJobPayload {
  type: "RE_ENGAGEMENT";
  studentName: string;
  daysInactive: number;
  lastAction: string;
  deepLink: string;
}

export interface ReferralInvitePayload extends BaseJobPayload {
  type: "REFERRAL_INVITE";
  referrerName: string;
  referrerCode: string;
  referralLink: string;
  rewardAmount: number;
}

export type MarketingQueuePayload =
  | WelcomeJourneyPayload
  | BroadcastPayload
  | ReEngagementPayload
  | ReferralInvitePayload;

// ============================================
// OWNER QUEUE JOBS (whatsapp:owner)
// ============================================

export type OwnerJobType =
  | "NEW_LEAD"
  | "VISIT_STARTED"
  | "VISIT_COMPLETED"
  | "VISIT_NOT_MET"
  | "DAILY_SUMMARY"
  | "WEEKLY_REPORT"
  | "LOW_OCCUPANCY"
  | "LISTING_EXPIRY"
  | "PROPERTY_APPROVED"
  | "PROPERTY_REJECTED";

export interface NewLeadPayload extends BaseJobPayload {
  type: "NEW_LEAD";
  visitId: string;
  visitToken: string;
  ownerId: string;
  ownerName: string;
  studentName: string;
  studentPhone: string;
  propertyTitle: string;
  propertyLocation: string;
  visitDate: string;
  timeSlot: string;
  internName?: string;
}

export interface VisitStartedPayload extends BaseJobPayload {
  type: "VISIT_STARTED";
  visitId: string;
  visitToken: string;
  ownerId: string;
  ownerName: string;
  studentName: string;
  propertyTitle: string;
  internName: string;
  startedAt: string;
}

export interface VisitCompletedPayload extends BaseJobPayload {
  type: "VISIT_COMPLETED";
  visitId: string;
  visitToken: string;
  ownerId: string;
  ownerName: string;
  studentName: string;
  propertyTitle: string;
  leadStatus: "SUCCESSFUL" | "NOT_SUCCESSFUL" | "INTERESTED_OTHER_PROPERTY";
  internName: string;
  completedAt: string;
}

export interface DailySummaryPayload extends BaseJobPayload {
  type: "DAILY_SUMMARY";
  ownerId: string;
  ownerName: string;
  date: string;
  stats: {
    totalVisits: number;
    visitsCompleted: number;
    visitsNoShow: number;
    newLeads: number;
    tokensCollected: number;
    revenue: number;
  };
  visits: Array<{
    visitToken: string;
    studentName: string;
    propertyTitle: string;
    timeSlot: string;
    status: string;
  }>;
}

export interface WeeklyReportPayload extends BaseJobPayload {
  type: "WEEKLY_REPORT";
  ownerId: string;
  ownerName: string;
  weekStart: string;
  weekEnd: string;
  stats: {
    occupancyRate: number;
    totalRevenue: number;
    visitsBooked: number;
    visitsCompleted: number;
    conversionRate: number;
    avgResponseTime: string;
  };
  topProperties: Array<{
    propertyTitle: string;
    visits: number;
    conversion: number;
  }>;
  lowPerformers: Array<{
    propertyTitle: string;
    visits: number;
    issue: string;
  }>;
}

export interface LowOccupancyPayload extends BaseJobPayload {
  type: "LOW_OCCUPANCY";
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyTitle: string;
  currentOccupancy: number;
  totalCapacity: number;
  occupancyRate: number;
  daysSinceLastBooking: number;
}

export interface ListingExpiryPayload extends BaseJobPayload {
  type: "LISTING_EXPIRY";
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyTitle: string;
  expiresAt: string;
  daysRemaining: number;
}

export type OwnerQueuePayload =
  | NewLeadPayload
  | VisitStartedPayload
  | VisitCompletedPayload
  | DailySummaryPayload
  | WeeklyReportPayload
  | LowOccupancyPayload
  | ListingExpiryPayload;

// ============================================
// UNION TYPE FOR ALL JOBS
// ============================================

export type WhatsAppJobPayload =
  | VisitQueuePayload
  | ReminderQueuePayload
  | PaymentQueuePayload
  | MarketingQueuePayload
  | OwnerQueuePayload;

// ============================================
// QUEUE NAMES
// ============================================

export const WHATSAPP_QUEUES = {
  VISIT: "whatsapp:visit",
  REMINDER: "whatsapp:reminder",
  PAYMENT: "whatsapp:payment",
  MARKETING: "whatsapp:marketing",
  OWNER: "whatsapp:owner",
} as const;

export const WHATSAPP_DLQ_SUFFIX = ":dlq";

export type QueueName = typeof WHATSAPP_QUEUES[keyof typeof WHATSAPP_QUEUES];
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/queues/types/whatsapp-jobs.ts
git commit -m "feat: add WhatsApp job type definitions for all 5 queues"
```

---

### Task 3: Create Redis Session Helper

**Files:**
- Create: `backend/src/queues/redis.session.ts`

**Interfaces:**
- Consumes: `getRedisClient()` from redis.ts
- Produces: Session management functions

- [ ] **Step 1: Create redis.session.ts**

```typescript
// backend/src/queues/redis.session.ts
import { getRedisClient } from "../config/redis";
import { UserRole } from "./types/whatsapp-jobs";

const redis = getRedisClient();

// ============================================
// KEY GENERATORS
// ============================================

const KEYS = {
  userRole: (phone: string) => `sess:${phone}:user_role`,
  currentStep: (phone: string) => `sess:${phone}:current_step`,
  context: (phone: string) => `sess:${phone}:context`,
  attemptCount: (phone: string) => `sess:${phone}:attempt_count`,
  otpVerified: (phone: string) => `sess:${phone}:otp_verified`,
  visitLock: (visitId: string) => `lock:visit:${visitId}`,
} as const;

// ============================================
// TTL CONSTANTS (in seconds)
// ============================================

const TTL = {
  ACTIVE_STEP: 30 * 60,    // 30 minutes
  IDLE_SESSION: 24 * 60 * 60, // 24 hours
  LOCK: 5 * 60,            // 5 minutes
} as const;

// ============================================
// SESSION TYPES
// ============================================

export type SessionStep = 
  | "idle"
  | "awaiting_otp"
  | "awaiting_date"
  | "awaiting_area"
  | "awaiting_property_code"
  | "awaiting_visit_confirmation"
  | "awaiting_feedback"
  | "awaiting_documents"
  | "awaiting_payment_utr"
  | "awaiting_help_response";

export interface SessionContext {
  visitId?: string;
  visitToken?: string;
  propertyId?: string;
  propertyTitle?: string;
  internId?: string;
  internName?: string;
  assignedAt?: number;
  attemptCount?: number;
  lastMessageAt?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// USER ROLE MANAGEMENT
// ============================================

export async function setUserRole(phone: string, role: UserRole): Promise<void> {
  await redis.set(KEYS.userRole(phone), role, "EX", TTL.IDLE_SESSION);
}

export async function getUserRole(phone: string): Promise<UserRole | null> {
  const role = await redis.get(KEYS.userRole(phone));
  return role as UserRole | null;
}

export async function clearUserRole(phone: string): Promise<void> {
  await redis.del(KEYS.userRole(phone));
}

// ============================================
// CURRENT STEP MANAGEMENT
// ============================================

export async function setCurrentStep(phone: string, step: SessionStep): Promise<void> {
  await redis.set(KEYS.currentStep(phone), step, "EX", TTL.ACTIVE_STEP);
}

export async function getCurrentStep(phone: string): Promise<SessionStep | null> {
  const step = await redis.get(KEYS.currentStep(phone));
  return step as SessionStep | null;
}

export async function clearCurrentStep(phone: string): Promise<void> {
  await redis.del(KEYS.currentStep(phone));
}

// ============================================
// CONTEXT MANAGEMENT
// ============================================

export async function setContext(phone: string, context: SessionContext): Promise<void> {
  const existing = await getContext(phone);
  const merged = { ...existing, ...context, lastMessageAt: Date.now() };
  await redis.set(KEYS.context(phone), JSON.stringify(merged), "EX", TTL.ACTIVE_STEP);
}

export async function getContext(phone: string): Promise<SessionContext> {
  const data = await redis.get(KEYS.context(phone));
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function updateContext(phone: string, updates: Partial<SessionContext>): Promise<void> {
  const existing = await getContext(phone);
  await setContext(phone, { ...existing, ...updates });
}

export async function clearContext(phone: string): Promise<void> {
  await redis.del(KEYS.context(phone));
}

// ============================================
// ATTEMPT COUNT (for OTP verification)
// ============================================

export async function incrementAttemptCount(phone: string): Promise<number> {
  const key = KEYS.attemptCount(phone);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, TTL.ACTIVE_STEP);
  }
  return count;
}

export async function getAttemptCount(phone: string): Promise<number> {
  const count = await redis.get(KEYS.attemptCount(phone));
  return count ? parseInt(count, 10) : 0;
}

export async function resetAttemptCount(phone: string): Promise<void> {
  await redis.del(KEYS.attemptCount(phone));
}

// ============================================
// OTP VERIFIED FLAG
// ============================================

export async function setOtpVerified(phone: string, visitId: string): Promise<void> {
  await redis.set(KEYS.otpVerified(phone), visitId, "EX", TTL.ACTIVE_STEP);
}

export async function getOtpVerified(phone: string): Promise<string | null> {
  return await redis.get(KEYS.otpVerified(phone));
}

export async function clearOtpVerified(phone: string): Promise<void> {
  await redis.del(KEYS.otpVerified(phone));
}

// ============================================
// VISIT LOCK (prevent concurrent OTP processing)
// ============================================

export async function acquireVisitLock(visitId: string, owner: string): Promise<boolean> {
  const result = await redis.set(KEYS.visitLock(visitId), owner, "EX", TTL.LOCK, "NX");
  return result === "OK";
}

export async function releaseVisitLock(visitId: string, owner: string): Promise<void> {
  // Use Lua script for atomic check-and-delete
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  await redis.eval(script, 1, KEYS.visitLock(visitId), owner);
}

export async function isVisitLocked(visitId: string): Promise<boolean> {
  const exists = await redis.exists(KEYS.visitLock(visitId));
  return exists === 1;
}

// ============================================
// FULL SESSION CLEAR
// ============================================

export async function clearSession(phone: string): Promise<void> {
  const keys = [
    KEYS.userRole(phone),
    KEYS.currentStep(phone),
    KEYS.context(phone),
    KEYS.attemptCount(phone),
    KEYS.otpVerified(phone),
  ];
  await redis.del(...keys);
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/queues/redis.session.ts
git commit -m "feat: add Redis session management helpers"
```

---

### Task 4: Create WhatsApp Queue Initialization & Enqueue Helpers

**Files:**
- Create: `backend/src/queues/whatsapp.queue.ts`

**Interfaces:**
- Consumes: Job payload types from whatsapp-jobs.ts, Redis connection from redis.ts
- Produces: 5 Queue instances, typed enqueue functions

- [ ] **Step 1: Create whatsapp.queue.ts**

```typescript
// backend/src/queues/whatsapp.queue.ts
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
  visit: new Queue<WhatsAppJobPayload>(`${WHATSAPP_QUEUES.VISIT}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  reminder: new Queue<WhatsAppJobPayload>(`${WHATSAPP_QUEUES.REMINDER}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  payment: new Queue<WhatsAppJobPayload>(`${WHATSAPP_QUEUES.PAYMENT}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  marketing: new Queue<WhatsAppJobPayload>(`${WHATSAPP_QUEUES.MARKETING}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
  owner: new Queue<WhatsAppJobPayload>(`${WHATSAPP_QUEUES.OWNER}${WHATSAPP_DLQ_SUFFIX}`, defaultQueueOptions),
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

export async function queueVisitCreated(payload: Omit<VisitCreatedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitCreatedPayload>> {
  const jobId = generateJobId("VISIT_CREATED", payload.visitToken);
  return visitQueue.add("VISIT_CREATED", {
    ...payload,
    type: "VISIT_CREATED",
    jobId,
    timestamp: Date.now(),
    priority: 10, // High priority
  } as VisitCreatedPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueInternAssigned(payload: Omit<InternAssignedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<InternAssignedPayload>> {
  const jobId = generateJobId("INTERN_ASSIGNED", payload.visitToken);
  return visitQueue.add("INTERN_ASSIGNED", {
    ...payload,
    type: "INTERN_ASSIGNED",
    jobId,
    timestamp: Date.now(),
    priority: 10, // High priority
  } as InternAssignedPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueVisitOtpSent(payload: Omit<VisitOtpSentPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitOtpSentPayload>> {
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

export async function queueVisitConfirmed(payload: Omit<VisitConfirmedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitConfirmedPayload>> {
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

export async function queueOTPVerify(payload: Omit<OTPVerifyPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<OTPVerifyPayload>> {
  const jobId = generateJobId("OTP_VERIFY", payload.visitToken);
  return visitQueue.add("OTP_VERIFY", {
    ...payload,
    type: "OTP_VERIFY",
    jobId,
    timestamp: Date.now(),
    priority: 10, // Highest priority - real-time verification
  } as OTPVerifyPayload, {
    jobId,
    priority: 10,
  });
}

export async function queueStudentArrivalAlert(payload: Omit<StudentArrivalAlertPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<StudentArrivalAlertPayload>> {
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

export async function queueProfileCompletionReminder(payload: Omit<ProfileCompletionPayload, "type" | "jobId" | "timestamp" | "priority">, delayMs: number = 6 * 60 * 60 * 1000): Promise<Job<ProfileCompletionPayload>> {
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
    delay: delayMs, // 6 hours default
  });
}

export async function queueVisitReminder(
  type: "VISIT_24H" | "VISIT_2H" | "VISIT_30M",
  payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">,
  delayMs: number
): Promise<Job<VisitReminderPayload>> {
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

export async function queueVisit24HReminder(payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitReminderPayload>> {
  return queueVisitReminder("VISIT_24H", payload, 24 * 60 * 60 * 1000);
}

export async function queueVisit2HReminder(payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitReminderPayload>> {
  return queueVisitReminder("VISIT_2H", payload, 2 * 60 * 60 * 1000);
}

export async function queueVisit30MReminder(payload: Omit<VisitReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitReminderPayload>> {
  return queueVisitReminder("VISIT_30M", payload, 30 * 60 * 1000);
}

export async function queueFeedbackRequest(payload: Omit<FeedbackRequestPayload, "type" | "jobId" | "timestamp" | "priority">, delayMs: number = 2 * 60 * 60 * 1000): Promise<Job<FeedbackRequestPayload>> {
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

export async function queueDocumentCollection(payload: Omit<DocumentCollectionPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<DocumentCollectionPayload>> {
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

export async function queueTokenPaymentReminder(payload: Omit<TokenPaymentReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<TokenPaymentReminderPayload>> {
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

export async function queueRentDueReminder(payload: Omit<RentDueReminderPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<RentDueReminderPayload>> {
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

export async function queueInternDailySchedule(payload: Omit<InternDailySchedulePayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<InternDailySchedulePayload>> {
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

export async function queueTokenDue(payload: Omit<TokenDuePayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<TokenDuePayload>> {
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

export async function queueTokenConfirmed(payload: Omit<TokenConfirmedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<TokenConfirmedPayload>> {
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

export async function queueTokenRejected(payload: Omit<TokenRejectedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<TokenRejectedPayload>> {
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

export async function queueRefundProcessed(payload: Omit<RefundProcessedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<RefundProcessedPayload>> {
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

export async function queueWelcomeJourney(payload: Omit<WelcomeJourneyPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<WelcomeJourneyPayload>> {
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

export async function queueBroadcast(payload: Omit<BroadcastPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<BroadcastPayload>> {
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

export async function queueReEngagement(payload: Omit<ReEngagementPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReEngagementPayload>> {
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

export async function queueReferralInvite(payload: Omit<ReferralInvitePayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ReferralInvitePayload>> {
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

// ============================================
// OWNER QUEUE ENQUEUE HELPERS
// ============================================

export async function queueNewLead(payload: Omit<NewLeadPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<NewLeadPayload>> {
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

export async function queueVisitStarted(payload: Omit<VisitStartedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitStartedPayload>> {
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

export async function queueVisitCompleted(payload: Omit<VisitCompletedPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<VisitCompletedPayload>> {
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

export async function queueDailySummary(payload: Omit<DailySummaryPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<DailySummaryPayload>> {
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

export async function queueWeeklyReport(payload: Omit<WeeklyReportPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<WeeklyReportPayload>> {
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

export async function queueLowOccupancy(payload: Omit<LowOccupancyPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<LowOccupancyPayload>> {
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

export async function queueListingExpiry(payload: Omit<ListingExpiryPayload, "type" | "jobId" | "timestamp" | "priority">): Promise<Job<ListingExpiryPayload>> {
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
  await Promise.all(Object.values(queues).map(q => q.pause()));
}

export async function resumeAllQueues(): Promise<void> {
  await Promise.all(Object.values(queues).map(q => q.resume()));
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all([
    ...Object.values(queues).map(q => q.close()),
    ...Object.values(dlqQueues).map(q => q.close()),
  ]);
}

// ============================================
// EVENT LISTENERS FOR LOGGING
// ============================================

function setupQueueEvents(queue: Queue, queueName: string): void {
  queue.on("completed", (job: Job) => {
    console.log(`✅ [${queueName}] Job ${job.id} (${job.name}) completed`);
  });

  queue.on("failed", (job: Job | undefined, err: Error) => {
    if (job) {
      console.error(`❌ [${queueName}] Job ${job.id} (${job.name}) failed:`, err.message);
      console.error(`   Attempts made: ${job.attemptsMade}/${job.opts.attempts}`);
      console.error(`   Payload:`, JSON.stringify(job.data, null, 2));
    }
  });

  queue.on("stalled", (jobId: string) => {
    console.warn(`⚠️ [${queueName}] Job ${jobId} stalled`);
  });
}

Object.entries(queues).forEach(([name, queue]) => setupQueueEvents(queue, name));
Object.entries(dlqQueues).forEach(([name, queue]) => setupQueueEvents(queue, `DLQ:${name}`));
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/queues/whatsapp.queue.ts
git commit -m "feat: add WhatsApp queue initialization and typed enqueue helpers for 5 queues"
```

---

### Task 5: Create WhatsApp Worker with Meta API Payload Builders

**Files:**
- Create: `backend/src/queues/whatsapp.worker.ts`

**Interfaces:**
- Consumes: Queue instances from whatsapp.queue.ts, session helpers from redis.session.ts, Prisma client
- Produces: 5 Workers with job handlers, Meta API payload construction

- [ ] **Step 1: Create whatsapp.worker.ts**

```typescript
// backend/src/queues/whatsapp.worker.ts
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

async function sendMetaApiRequest(payload: unknown): Promise<MetaApiResponse | null> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error("❌ Missing Meta credentials: PHONE_NUMBER_ID or ACCESS_TOKEN");
    return null;
  }

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
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
    return data as MetaApiResponse;
  } catch (error) {
    console.error("❌ Meta API Request Failed:", error);
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
  components: Array<{ type: string; parameters: Array<{ type: string; text?: string; payload?: string }> }>
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

// --- NEW VISIT ASSIGNMENT (Intern Alert) ---
function buildNewVisitAssignmentPayload(
  phone: string,
  data: InternAssignedPayload
) {
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
function buildVisitOtpPayload(phone: string, data: VisitOtpSentPayload) {
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
function buildWelcomeJourneyPayload(phone: string, data: WelcomeJourneyPayload) {
  const stepMessages: Record<string, string> = {
    WELCOME: `Hi ${data.studentName}! 👋\n\nWelcome to LivingGo. We help university students find verified PGs and rooms without the brokerage hassle.\n\nReply with "FIND PG" to start your search, or "HELP" to speak with our team.`,
    FIND_PG: `Great! Let's find your perfect PG. What area are you looking in? (e.g., Kamla Nagar, Vijay Nagar, GTB Nagar)\n\nOr visit: ${data.deepLink || "https://livinggo.in/properties"}`,
    WISHLIST: `Found something you like? ❤️ Add properties to your wishlist to compare later.\n\nYour wishlist: ${data.deepLink || "https://livinggo.in/wishlist"}`,
    SCHEDULE_VISIT: `Ready to visit? 📅 Book a visit with our Live-in Guru who will show you around.\n\nReply with "BOOK VISIT" or visit: ${data.deepLink || "https://livinggo.in/book-visit"}`,
    ASK_QUESTIONS: `Have questions? 💬 Ask us anything about the property, facilities, rent, or move-in process.\n\nOur team typically responds within 15 minutes.`,
  };

  return buildTextPayload(phone, stepMessages[data.step] || stepMessages.WELCOME);
}

// --- NEW LEAD (Owner) ---
function buildNewLeadPayload(phone: string, data: NewLeadPayload) {
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
function buildVisitStartedPayload(phone: string, data: VisitStartedPayload) {
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
function buildVisitCompletedPayload(phone: string, data: VisitCompletedPayload) {
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
function buildListingExpiryPayload(phone: string, data: ListingExpiryPayload) {
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
function buildInternDailySchedulePayload(phone: string, data: InternDailySchedulePayload) {
  const visitsText = data.visits.length > 0
    ? data.visits.map(v => `• ${v.timeSlot}: ${v.studentName} (${v.studentPhone}) @ ${v.propertyTitle}, ${v.propertyLocation} - OTP: ${v.visitOtp}`).join("\n")
    : "No visits scheduled";

  return buildTextPayload(phone,
    `📅 *Your Schedule for ${data.date}*\n\n` +
    `👤 ${data.internName}\n\n` +
    `*Today's Visits:*\n${visitsText}\n\n` +
    `Reply "HELP" if you need assistance.`
  );
}

// --- STUDENT ARRIVAL ALERT (Intern) ---
function buildStudentArrivalPayload(phone: string, data: StudentArrivalAlertPayload) {
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
function buildVisitConfirmedPayload(phone: string, data: VisitConfirmedPayload) {
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
function buildProfileCompletionPayload(phone: string, data: ProfileCompletionPayload) {
  return buildTextPayload(phone,
    `Hi ${data.studentName}! 👋\n\n` +
    `You haven't completed your profile yet. Complete it to unlock property bookings and personalized recommendations.\n\n` +
    `👉 ${data.profileUrl}\n\n` +
    `Takes less than 2 minutes!`
  );
}

// --- FEEDBACK REQUEST ---
function buildFeedbackRequestPayload(phone: string, data: FeedbackRequestPayload) {
  return buildTextPayload(phone,
    `Hi ${data.studentName}! 👋\n\n` +
    `How was your visit to ${data.propertyTitle}? Your feedback helps other students.\n\n` +
    `👉 Share your experience: ${data.feedbackUrl}\n\n` +
    `Takes 1 minute!`
  );
}

// --- DOCUMENT COLLECTION ---
function buildDocumentCollectionPayload(phone: string, data: DocumentCollectionPayload) {
  return buildTextPayload(phone,
    `Hi ${data.studentName}! 📄\n\n` +
    `To proceed with ${data.propertyTitle}, we need the following documents:\n\n` +
    data.documentsNeeded.map(d => `• ${d}`).join("\n") + "\n\n" +
    `👉 Upload here: ${data.uploadUrl}\n\n` +
    `Reply "DONE" once uploaded.`
  );
}

// --- TOKEN PAYMENT REMINDER ---
function buildTokenPaymentReminderPayload(phone: string, data: TokenPaymentReminderPayload) {
  return buildTextPayload(phone,
    `Hi ${data.studentName}! 💰\n\n` +
    `Reminder: Token payment of ₹${data.amount.toLocaleString()} for ${data.propertyTitle} is due by ${data.dueDate}.\n\n` +
    `👉 Pay here: ${data.paymentUrl}\n` +
    `${data.utrRequired ? "📝 Please share UTR number after payment." : ""}\n\n` +
    `Reply "PAID" once done.`
  );
}

// --- RENT DUE REMINDER ---
function buildRentDueReminderPayload(phone: string, data: RentDueReminderPayload) {
  return buildTextPayload(phone,
    `Hi ${data.studentName}! 🏠\n\n` +
    `Rent of ₹${data.amount.toLocaleString()} for ${data.propertyTitle} is due on ${data.dueDate}.\n\n` +
    `💳 Pay to: ${data.payeeName}\n` +
    `📱 UPI: ${data.upiId}\n\n` +
    `Reply "PAID" with UTR once transferred.`
  );
}

// --- TOKEN DUE (Payment Queue) ---
function buildTokenDuePayload(phone: string, data: TokenDuePayload) {
  return buildTextPayload(phone,
    `💰 *Token Payment Due*\n\n` +
    `Property: ${data.propertyTitle}\n` +
    `Amount: ₹${data.amount.toLocaleString()}\n` +
    `Due: ${data.dueDate}\n\n` +
    `👉 Pay now: ${data.paymentUrl}\n\n` +
    `Reply "PAID" with UTR after payment.`
  );
}

// --- TOKEN CONFIRMED ---
function buildTokenConfirmedPayload(phone: string, data: TokenConfirmedPayload) {
  return buildTextPayload(phone,
    `✅ *Token Payment Confirmed*\n\n` +
    `Property: ${data.propertyTitle}\n` +
    `Amount: ₹${data.amount.toLocaleString()}\n` +
    `UTR: ${data.utrNumber}\n` +
    `${data.moveInDate ? `🗓 Move-in: ${data.moveInDate}` : ""}\n\n` +
    `Your booking is now secured!`
  );
}

// --- TOKEN REJECTED ---
function buildTokenRejectedPayload(phone: string, data: TokenRejectedPayload) {
  return buildTextPayload(phone,
    `❌ *Token Payment Rejected*\n\n` +
    `Property: ${data.propertyTitle}\n` +
    `Reason: ${data.reason}\n\n` +
    `Please contact support or retry payment.`
  );
}

// --- REFUND PROCESSED ---
function buildRefundProcessedPayload(phone: string, data: RefundProcessedPayload) {
  return buildTextPayload(phone,
    `💰 *Refund Processed*\n\n` +
    `Amount: ₹${data.amount.toLocaleString()}\n` +
    `Reference: ${data.refundReference}\n\n` +
    `Amount will reflect in your account within 5-7 business days.`
  );
}

// --- RE-ENGAGEMENT ---
function buildReEngagementPayload(phone: string, data: ReEngagementPayload) {
  return buildTextPayload(phone,
    `Hi ${data.studentName}! 👋\n\n` +
    `We noticed you haven't been active for ${data.daysInactive} days. Your last action: ${data.lastAction}.\n\n` +
    `Still looking for a PG? Check out new listings:\n${data.deepLink}\n\n` +
    `Reply "STOP" to unsubscribe.`
  );
}

// --- REFERRAL INVITE ---
function buildReferralInvitePayload(phone: string, data: ReferralInvitePayload) {
  return buildTextPayload(phone,
    `🎁 *Referral Invite from ${data.referrerName}*\n\n` +
    `Earn ₹${data.rewardAmount} for every friend who books through LivingGo!\n\n` +
    `Your referral code: ${data.referrerCode}\n` +
    `Share link: ${data.referralLink}\n\n` +
    `Start earning today!`
  );
}

// --- SUPERVISOR ESCALATION ---
function buildSupervisorEscalationPayload(phone: string, studentName: string, studentPhone: string, reason: string) {
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
function buildAdminDailyDashboardPayload(phone: string, data: {
  date: string;
  totalVisits: number;
  completedVisits: number;
  revenue: number;
  bookings: number;
  activeInterns: number;
  systemHealth: string;
}) {
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
function buildAdminSystemAlertPayload(phone: string, alertType: string, message: string, severity: "INFO" | "WARNING" | "CRITICAL") {
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
export const visitWorker = new Worker<VisitQueuePayload>(
  "whatsapp:visit",
  async (job: Job<VisitQueuePayload>) => {
    const { data } = job;
    
    try {
      switch (data.type) {
        case "VISIT_CREATED": {
          const payload = data as VisitCreatedPayload;
          
          // Find available intern (round-robin or least busy)
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
            await import("./whatsapp.queue").then(m => m.queueInternAssigned({
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
              mapsLink: `https://maps.google.com/?q=${payload.propertyLocation}`,
              emergencyContact: "Emergency: 112",
            }));
          } else {
            // No intern available - notify supervisor
            console.warn(`⚠️ No active interns available for visit ${payload.visitToken}`);
          }
          break;
        }

        case "INTERN_ASSIGNED": {
          const payload = data as InternAssignedPayload;
          const metaPayload = buildNewVisitAssignmentPayload(payload.phoneNumber, payload);
          await sendMetaApiRequest(metaPayload);
          
          // Set session for intern
          await setCurrentStep(payload.phoneNumber, "awaiting_visit_confirmation");
          await setContext(payload.phoneNumber, {
            visitId: payload.visitId,
            visitToken: payload.visitToken,
            studentName: payload.studentName,
            propertyTitle: payload.propertyTitle,
          });
          break;
        }

        case "VISIT_OTP_SENT": {
          const payload = data as VisitOtpSentPayload;
          const metaPayload = buildVisitOtpPayload(payload.phoneNumber, payload);
          await sendMetaApiRequest(metaPayload);
          
          // Set session for student
          await setCurrentStep(payload.phoneNumber, "awaiting_otp");
          await setContext(payload.phoneNumber, {
            visitId: payload.visitId,
            visitToken: payload.visitToken,
            visitOtp: payload.visitOtp,
            internName: payload.internName,
            internPhone: payload.internPhone,
          });
          break;
        }

        case "VISIT_CONFIRMED": {
          const payload = data as VisitConfirmedPayload;
          const metaPayload = buildVisitConfirmedPayload(payload.phoneNumber, payload);
          await sendMetaApiRequest(metaPayload);
          break;
        }

        case "OTP_VERIFY": {
          const payload = data as OTPVerifyPayload;
          
          // Acquire lock to prevent concurrent processing
          const lockAcquired = await acquireVisitLock(payload.visitId, `otp_verify_${payload.phoneNumber}`);
          if (!lockAcquired) {
            console.log(`⏳ Visit ${payload.visitId} is locked, re-queueing OTP verify`);
            // Re-queue with delay
            await import("./whatsapp.queue").then(m => m.queueOTPVerify(payload));
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
              // OTP MATCHED
              await prisma.visit.update({
                where: { id: payload.visitId },
                data: {
                  visitOtpVerified: true,
                  leadStatus: "MET",
                },
              });

              // Mark session as verified
              await setOtpVerified(payload.phoneNumber, payload.visitId);
              await resetAttemptCount(payload.phoneNumber);
              await clearCurrentStep(payload.phoneNumber);

              // Send confirmation to student
              await import("./whatsapp.queue").then(m => m.queueVisitConfirmed({
                phoneNumber: payload.phoneNumber,
                userRole: "student",
                visitId: payload.visitId,
                visitToken: payload.visitToken,
                studentName: visit.student.name,
                propertyTitle: visit.property.title,
                visitDate: visit.visitDate.toISOString().split("T")[0],
                timeSlot: visit.timeSlot,
              }));

              // Notify intern of student arrival
              if (visit.intern) {
                await import("./whatsapp.queue").then(m => m.queueStudentArrivalAlert({
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
                }));
              }

              // Notify owner
              if (visit.property.ownerId) {
                const owner = await prisma.user.findUnique({ where: { id: visit.property.ownerId } });
                if (owner?.phone) {
                  await import("./whatsapp.queue").then(m => m.queueVisitStarted({
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
                  }));
                }
              }

              console.log(`✅ OTP verified for visit ${payload.visitToken}`);
            } else {
              // OTP MISMATCH
              const attemptCount = await incrementAttemptCount(payload.phoneNumber);
              const maxAttempts = 3;
              const remaining = maxAttempts - attemptCount;

              if (remaining > 0) {
                // Send retry message
                await sendMetaApiRequest(buildTextPayload(payload.phoneNumber,
                  `❌ Invalid OTP. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.\n\nPlease enter the 6-digit OTP shared with you.`
                ));
                
                // Re-queue for next attempt
                await import("./whatsapp.queue").then(m => m.queueOTPVerify({
                  ...payload,
                  attemptNumber: attemptCount,
                }));
              } else {
                // Max attempts exceeded
                await sendMetaApiRequest(buildTextPayload(payload.phoneNumber,
                  `❌ Maximum OTP attempts exceeded. Visit ${payload.visitToken} requires manual verification.\n\nOur team has been notified.`
                ));
                
                // Alert supervisor
                const supervisors = await prisma.user.findMany({
                  where: { role: "SUPERVISOR", status: "active" },
                  select: { phone: true },
                });
                
                for (const sup of supervisors) {
                  if (sup.phone) {
                    await sendMetaApiRequest(buildSupervisorEscalationPayload(
                      sup.phone,
                      visit.student.name,
                      payload.phoneNumber,
                      `OTP verification failed for visit ${payload.visitToken} after ${maxAttempts} attempts`
                    ));
                  }
                }
                
                await resetAttemptCount(payload.phoneNumber);
              }
            }
          } finally {
            await releaseVisitLock(payload.visitId, `otp_verify_${payload.phoneNumber}`);
          }
          break;
        }

        case "STUDENT_ARRIVAL_ALERT": {
          const payload = data as StudentArrivalAlertPayload;
          const metaPayload = buildStudentArrivalPayload(payload.phoneNumber, payload);
          await sendMetaApiRequest(metaPayload);
          
          await setCurrentStep(payload.phoneNumber, "awaiting_otp");
          await setContext(payload.phoneNumber, {
            visitId: payload.visitId,
            visitToken: payload.visitToken,
            studentName: payload.studentName,
            studentPhone: payload.studentPhone,
            visitOtp: payload.visitOtp,
          });
          break;
        }
      }
    } catch (error) {
      console.error(`❌ [VISIT WORKER] Job ${job.id} failed:`, error);
      
      // Move to DLQ on final failure
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
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
  "whatsapp:reminder",
  async (job: Job<ReminderQueuePayload>) => {
    const { data } = job;
    
    try {
      let metaPayload: ReturnType<typeof buildTextPayload> | ReturnType<typeof buildTemplatePayload>;
      let phone = data.phoneNumber;

      switch (data.type) {
        case "PROFILE_COMPLETION": {
          const payload = data as ProfileCompletionPayload;
          metaPayload = buildProfileCompletionPayload(phone, payload);
          break;
        }

        case "VISIT_24H":
        case "VISIT_2H":
        case "VISIT_30M": {
          const payload = data as VisitReminderPayload;
          metaPayload = buildVisitReminderPayload(phone, payload);
          break;
        }

        case "FEEDBACK_REQUEST": {
          const payload = data as FeedbackRequestPayload;
          metaPayload = buildFeedbackRequestPayload(phone, payload);
          break;
        }

        case "DOCUMENT_COLLECTION": {
          const payload = data as DocumentCollectionPayload;
          metaPayload = buildDocumentCollectionPayload(phone, payload);
          break;
        }

        case "TOKEN_PAYMENT_REMINDER": {
          const payload = data as TokenPaymentReminderPayload;
          metaPayload = buildTokenPaymentReminderPayload(phone, payload);
          break;
        }

        case "RENT_DUE_REMINDER": {
          const payload = data as RentDueReminderPayload;
          metaPayload = buildRentDueReminderPayload(phone, payload);
          break;
        }

        case "INTERN_DAILY_SCHEDULE_10AM":
        case "INTERN_DAILY_SCHEDULE_12PM":
        case "INTERN_DAILY_SCHEDULE_4PM": {
          const payload = data as InternDailySchedulePayload;
          metaPayload = buildInternDailySchedulePayload(phone, payload);
          break;
        }
      }

      if (metaPayload) {
        await sendMetaApiRequest(metaPayload);
      }
    } catch (error) {
      console.error(`❌ [REMINDER WORKER] Job ${job.id} failed:`, error);
      
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
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
  "whatsapp:payment",
  async (job: Job<PaymentQueuePayload>) => {
    const { data } = job;
    
    try {
      let metaPayload: ReturnType<typeof buildTextPayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        case "TOKEN_DUE": {
          const payload = data as TokenDuePayload;
          metaPayload = buildTokenDuePayload(phone, payload);
          break;
        }

        case "TOKEN_CONFIRMED": {
          const payload = data as TokenConfirmedPayload;
          metaPayload = buildTokenConfirmedPayload(phone, payload);
          break;
        }

        case "TOKEN_REJECTED": {
          const payload = data as TokenRejectedPayload;
          metaPayload = buildTokenRejectedPayload(phone, payload);
          break;
        }

        case "REFUND_PROCESSED": {
          const payload = data as RefundProcessedPayload;
          metaPayload = buildRefundProcessedPayload(phone, payload);
          break;
        }
      }

      if (metaPayload) {
        await sendMetaApiRequest(metaPayload);
      }
    } catch (error) {
      console.error(`❌ [PAYMENT WORKER] Job ${job.id} failed:`, error);
      
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
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
  "whatsapp:marketing",
  async (job: Job<MarketingQueuePayload>) => {
    const { data } = job;
    
    try {
      let metaPayload: ReturnType<typeof buildTextPayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        case "WELCOME_JOURNEY": {
          const payload = data as WelcomeJourneyPayload;
          metaPayload = buildWelcomeJourneyPayload(phone, payload);
          break;
        }

        case "BROADCAST": {
          const payload = data as BroadcastPayload;
          // Broadcast to segment - would need separate implementation
          console.log(`📢 Broadcast to ${payload.segment}: ${payload.templateName}`);
          return;
        }

        case "RE_ENGAGEMENT": {
          const payload = data as ReEngagementPayload;
          metaPayload = buildReEngagementPayload(phone, payload);
          break;
        }

        case "REFERRAL_INVITE": {
          const payload = data as ReferralInvitePayload;
          metaPayload = buildReferralInvitePayload(phone, payload);
          break;
        }
      }

      if (metaPayload) {
        await sendMetaApiRequest(metaPayload);
      }
    } catch (error) {
      console.error(`❌ [MARKETING WORKER] Job ${job.id} failed:`, error);
      
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
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
  "whatsapp:owner",
  async (job: Job<OwnerQueuePayload>) => {
    const { data } = job;
    
    try {
      let metaPayload: ReturnType<typeof buildTextPayload> | ReturnType<typeof buildTemplatePayload>;
      const phone = data.phoneNumber;

      switch (data.type) {
        case "NEW_LEAD": {
          const payload = data as NewLeadPayload;
          metaPayload = buildNewLeadPayload(phone, payload);
          break;
        }

        case "VISIT_STARTED": {
          const payload = data as VisitStartedPayload;
          metaPayload = buildVisitStartedPayload(phone, payload);
          break;
        }

        case "VISIT_COMPLETED": {
          const payload = data as VisitCompletedPayload;
          metaPayload = buildVisitCompletedPayload(phone, payload);
          break;
        }

        case "DAILY_SUMMARY": {
          const payload = data as DailySummaryPayload;
          metaPayload = buildDailySummaryPayload(phone, payload);
          break;
        }

        case "WEEKLY_REPORT": {
          const payload = data as WeeklyReportPayload;
          metaPayload = buildWeeklyReportPayload(phone, payload);
          break;
        }

        case "LOW_OCCUPANCY": {
          const payload = data as LowOccupancyPayload;
          metaPayload = buildLowOccupancyPayload(phone, payload);
          break;
        }

        case "LISTING_EXPIRY": {
          const payload = data as ListingExpiryPayload;
          metaPayload = buildListingExpiryPayload(phone, payload);
          break;
        }
      }

      if (metaPayload) {
        await sendMetaApiRequest(metaPayload);
      }
    } catch (error) {
      console.error(`❌ [OWNER WORKER] Job ${job.id} failed:`, error);
      
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/queues/whatsapp.worker.ts
git commit -m "feat: add WhatsApp workers with Meta API payload builders for all 5 queues"
```

---

### Task 6: Update WhatsApp Controller to Use Queues

**Files:**
- Modify: `backend/src/controllers/whatsapp.controller.ts`

**Interfaces:**
- Consumes: Queue enqueue functions from whatsapp.queue.ts, session helpers from redis.session.ts
- Produces: Updated webhook handler that enqueues jobs instead of direct API calls

- [ ] **Step 1: Update whatsapp.controller.ts**

```typescript
// backend/src/controllers/whatsapp.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { 
  queueOTPVerify, 
  queueWelcomeJourney,
  queueVisitConfirmed,
} from "../queues/whatsapp.queue";
import {
  getCurrentStep,
  setCurrentStep,
  getContext,
  setContext,
  incrementAttemptCount,
  resetAttemptCount,
  getAttemptCount,
  clearSession,
} from "../queues/redis.session";

const prisma = new PrismaClient();
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "LivingGo_Secret_Token_2026";

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("✅ WHATSAPP WEBHOOK VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
};

export const handleIncomingMessage = async (req: Request, res: Response) => {
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
    if (!message) return;

    const studentPhone = message.from; // e.g., "917310698877"
    const studentName = value.contacts?.[0]?.profile?.name || "Student";
    const messageText = message.text?.body?.trim() || "";
    const messageType = message.type; // "text", "interactive", "button", etc.

    console.log(`📥 Processing ${messageType} from ${studentName} (${studentPhone}): "${messageText}"`);

    // 3. Find or link the user inside PostgreSQL via Prisma
    const user = await prisma.user.findFirst({
      where: { phone: studentPhone }
    });

    // 4. Handle interactive messages (button clicks)
    if (messageType === "interactive") {
      await handleInteractiveMessage(studentPhone, studentName, message, user);
      return;
    }

    // 5. Get current session step
    const currentStep = await getCurrentStep(studentPhone);
    const context = await getContext(studentPhone);

    // 6. Route based on session step
    if (currentStep === "awaiting_otp" && context.visitId) {
      // Enqueue OTP verification job
      await queueOTPVerify({
        phoneNumber: studentPhone,
        userRole: "student",
        visitId: context.visitId,
        visitToken: context.visitToken || "",
        providedOtp: messageText,
        attemptNumber: await getAttemptCount(studentPhone) + 1,
      });
      return;
    }

    // 7. Level 1 Keyword / Intent Router (for idle sessions)
    const lowerText = messageText.toLowerCase();
    
    if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText === "start") {
      await handleWelcomeJourney(studentPhone, studentName);
    } else if (lowerText.includes("book") || lowerText.includes("visit") || lowerText === "book visit") {
      await handleVisitIntent(studentPhone, user);
    } else if (lowerText.includes("help")) {
      await handleHelpEscalation(studentPhone, studentName);
    } else if (lowerText === "stop" || lowerText === "unsubscribe") {
      await handleUnsubscribe(studentPhone);
    } else {
      // Fallback for natural phrasing
      await sendWhatsAppText(studentPhone, 
        `Thanks for messaging LivingGo! We received your message: "${messageText}". Our AI Concierge is processing your request.`
      );
    }

  } catch (error) {
    console.error("❌ Error parsing incoming WhatsApp webhook payload:", error);
  }
};

async function handleInteractiveMessage(
  phone: string, 
  name: string, 
  message: any, 
  user: any
) {
  const interactive = message.interactive;
  const buttonReply = interactive?.button_reply;
  const listReply = interactive?.list_reply;
  
  const payload = buttonReply?.id || listReply?.id; // e.g., "ACCEPT_VISIT_LG-VST-7X9K"
  
  if (!payload) return;

  console.log(`🔘 Interactive payload from ${name} (${phone}): ${payload}`);

  // Handle visit acceptance/decline by intern
  if (payload.startsWith("ACCEPT_VISIT_")) {
    const visitToken = payload.replace("ACCEPT_VISIT_", "");
    await handleInternAcceptVisit(phone, visitToken);
  } else if (payload.startsWith("DECLINE_VISIT_")) {
    const visitToken = payload.replace("DECLINE_VISIT_", "");
    await handleInternDeclineVisit(phone, visitToken);
  } else if (payload.startsWith("OTP_VERIFIED_")) {
    const visitToken = payload.replace("OTP_VERIFIED_", "");
    await handleInternOtpVerified(phone, visitToken);
  } else if (payload.startsWith("STUDENT_NO_SHOW_")) {
    const visitToken = payload.replace("STUDENT_NO_SHOW_", "");
    await handleStudentNoShow(phone, visitToken);
  }
}

async function handleInternAcceptVisit(internPhone: string, visitToken: string) {
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
  await sendWhatsAppText(internPhone, 
    `✅ Visit ${visitToken} accepted!\n\n` +
    `Student: ${visit.student.name}\n` +
    `Property: ${visit.property.title}\n` +
    `Date: ${visit.visitDate.toISOString().split("T")[0]}, ${visit.timeSlot}\n` +
    `OTP sent to student.`
  );
}

async function handleInternDeclineVisit(internPhone: string, visitToken: string) {
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
  const { queueVisitCreated } = await import("../queues/whatsapp.queue");
  await queueVisitCreated({
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

async function handleInternOtpVerified(internPhone: string, visitToken: string) {
  const visit = await prisma.visit.findUnique({
    where: { tokenId: visitToken },
    include: { student: true, property: true },
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

  await sendWhatsAppText(internPhone, 
    `✅ OTP verified for visit ${visitToken}!\n\n` +
    `Student: ${visit.student.name}\n` +
    `Property: ${visit.property.title}\n` +
    `Status: MET`
  );

  // Notify owner
  if (visit.property.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: visit.property.ownerId } });
    if (owner?.phone) {
      await sendWhatsAppText(owner.phone,
        `🚀 *Visit Started*\n\n` +
        `Student: ${visit.student.name}\n` +
        `Property: ${visit.property.title}\n` +
        `Intern: ${visit.intern?.name || "N/A"}\n` +
        `Time: ${new Date().toLocaleString()}`
      );
    }
  }
}

async function handleStudentNoShow(internPhone: string, visitToken: string) {
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

  await sendWhatsAppText(internPhone, 
    `❌ Student no-show recorded for visit ${visitToken}.\n\n` +
    `Student: ${visit.student.name}\n` +
    `Property: ${visit.property.title}`
  );

  // Notify owner
  if (visit.property.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: visit.property.ownerId } });
    if (owner?.phone) {
      await sendWhatsAppText(owner.phone,
        `❌ *Student No-Show*\n\n` +
        `Student: ${visit.student.name}\n` +
        `Property: ${visit.property.title}\n` +
        `Time: ${new Date().toLocaleString()}`
      );
    }
  }
}

async function handleWelcomeJourney(phone: string, name: string) {
  // Set session step
  await setCurrentStep(phone, "idle");
  
  // Queue welcome journey
  const { queueWelcomeJourney } = await import("../queues/whatsapp.queue");
  await queueWelcomeJourney({
    phoneNumber: phone,
    userRole: "student",
    step: "WELCOME",
    studentName: name,
    studentPhone: phone,
  });
}

async function handleVisitIntent(phone: string, user: any) {
  if (!user) {
    const registerText = `We see you haven't completed your profile on the web app yet! Please finish registering on https://livinggo.in to lock in property bookings.`;
    await sendWhatsAppText(phone, registerText);
    return;
  }
  
  await setCurrentStep(phone, "awaiting_area");
  await setContext(phone, { userId: user.id });
  
  const visitText = `Let's get your visit sorted. Tell me which area you are eyeing (e.g., Kamla Nagar, Vijay Nagar, GTB Nagar) or reply with the Property Code.`;
  await sendWhatsAppText(phone, visitText);
}

async function handleHelpEscalation(phone: string, studentName: string) {
  const { queueWelcomeJourney } = await import("../queues/whatsapp.queue");
  
  // Alert supervisors
  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISOR", status: "active" },
    select: { phone: true, name: true },
  });
  
  for (const sup of supervisors) {
    if (sup.phone) {
      await sendWhatsAppText(sup.phone,
        `🚨 *Escalation from ${studentName} (${phone})*\n\n` +
        `Student requested human assistance. Please take over this conversation.`
      );
    }
  }
  
  await sendWhatsAppText(phone, 
    `🚨 Understood. I'm flagging an internal Live-in Guru and admin right now. One of our operational staff will take over this thread shortly.`
  );
}

async function handleUnsubscribe(phone: string) {
  await clearSession(phone);
  await sendWhatsAppText(phone, "You've been unsubscribed from LivingGo WhatsApp updates. Reply 'START' to resubscribe.");
}

async function sendVisitOtpToStudent(visit: any) {
  const { queueVisitOtpSent } = await import("../queues/whatsapp.queue");
  
  if (!visit.student.phone) return;
  
  await queueVisitOtpSent({
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
async function sendWhatsAppText(toPhone: string, text: string) {
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
  } catch (err) {
    console.error("❌ Meta Graph API delivery crash:", err);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/whatsapp.controller.ts
git commit -m "feat: update WhatsApp controller to enqueue jobs instead of direct API calls"
```

---

### Task 7: Initialize Workers in Server

**Files:**
- Modify: `backend/src/server.ts`

**Interfaces:**
- Consumes: Workers from whatsapp.worker.ts
- Produces: Worker initialization on server startup

- [ ] **Step 1: Update server.ts**

```typescript
// backend/src/server.ts - add imports and initialization
import { app } from "./app";
import { env } from "./config/env";
import { closeAllWorkers, closeAllQueues } from "./queues/whatsapp.queue";
import { closeRedisConnection } from "./config/redis";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`📡 WhatsApp webhook: http://localhost:${PORT}/api/webhooks/whatsapp`);
  
  // Initialize WhatsApp workers
  initializeWhatsAppWorkers();
});

function initializeWhatsAppWorkers(): void {
  // Workers are initialized when imported (side effect)
  // Import triggers worker creation
  import("./queues/whatsapp.worker").then(({ workers }) => {
    console.log("✅ WhatsApp workers initialized:");
    console.log("   - Visit Worker (concurrency: 5)");
    console.log("   - Reminder Worker (concurrency: 5)");
    console.log("   - Payment Worker (concurrency: 5)");
    console.log("   - Marketing Worker (concurrency: 3)");
    console.log("   - Owner Worker (concurrency: 5)");
  }).catch(err => {
    console.error("❌ Failed to initialize WhatsApp workers:", err);
  });
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log("✅ HTTP server closed");
    
    try {
      await closeAllWorkers();
      await closeAllQueues();
      await closeRedisConnection();
      console.log("✅ All connections closed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error("❌ Force shutdown timeout");
    process.exit(1);
  }, 30000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/server.ts
git commit -m "feat: initialize WhatsApp workers on server startup with graceful shutdown"
```

---

### Task 8: Update Environment Configuration

**Files:**
- Modify: `backend/src/config/env.ts`

**Interfaces:**
- Produces: Updated env schema with Redis URL and WhatsApp template names

- [ ] **Step 1: Update env.ts**

```typescript
// backend/src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  
  // Redis
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  
  // Meta WhatsApp Cloud API
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).default("LivingGo_Secret_Token_2026"),
  WHATSAPP_API_VERSION: z.string().default("v20.0"),
  
  // WhatsApp Template Names (placeholders - replace with approved names)
  WHATSAPP_TEMPLATE_WELCOME: z.string().default("welcome_student"),
  WHATSAPP_TEMPLATE_VISIT_REMINDER_24H: z.string().default("visit_reminder_24h"),
  WHATSAPP_TEMPLATE_VISIT_REMINDER_2H: z.string().default("visit_reminder_2h"),
  WHATSAPP_TEMPLATE_VISIT_REMINDER_30M: z.string().default("visit_reminder_30m"),
  WHATSAPP_TEMPLATE_VISIT_OTP: z.string().default("visit_otp"),
  WHATSAPP_TEMPLATE_NEW_VISIT_ASSIGNMENT: z.string().default("new_visit_assignment"),
  WHATSAPP_TEMPLATE_INTERN_DAILY_SCHEDULE: z.string().default("intern_daily_schedule"),
  WHATSAPP_TEMPLATE_STUDENT_ARRIVAL: z.string().default("student_arrival"),
  WHATSAPP_TEMPLATE_NEW_LEAD_OWNER: z.string().default("new_lead_owner"),
  WHATSAPP_TEMPLATE_VISIT_STARTED_OWNER: z.string().default("visit_started_owner"),
  WHATSAPP_TEMPLATE_VISIT_COMPLETED_OWNER: z.string().default("visit_completed_owner"),
  WHATSAPP_TEMPLATE_DAILY_SUMMARY_OWNER: z.string().default("daily_summary_owner"),
  WHATSAPP_TEMPLATE_WEEKLY_REPORT_OWNER: z.string().default("weekly_report_owner"),
  WHATSAPP_TEMPLATE_LOW_OCCUPANCY: z.string().default("low_occupancy_alert"),
  WHATSAPP_TEMPLATE_LISTING_EXPIRY: z.string().default("listing_expiry_notice"),
  WHATSAPP_TEMPLATE_SUPERVISOR_ESCALATION: z.string().default("supervisor_escalation"),
  WHATSAPP_TEMPLATE_ADMIN_DAILY_DASHBOARD: z.string().default("admin_daily_dashboard"),
  WHATSAPP_TEMPLATE_ADMIN_SYSTEM_ALERT: z.string().default("admin_system_alert"),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 2: Update .env.example or create one**

```bash
# backend/.env.example
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=no-reply@yourdomain.com

# Redis (Upstash/Redis Cloud)
REDIS_URL=redis://default:password@host:port

# Meta WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_VERIFY_TOKEN=LivingGo_Secret_Token_2026
WHATSAPP_API_VERSION=v20.0

# WhatsApp Template Names (replace with your approved template names)
WHATSAPP_TEMPLATE_WELCOME=welcome_student
WHATSAPP_TEMPLATE_VISIT_REMINDER_24H=visit_reminder_24h
WHATSAPP_TEMPLATE_VISIT_REMINDER_2H=visit_reminder_2h
WHATSAPP_TEMPLATE_VISIT_REMINDER_30M=visit_reminder_30m
WHATSAPP_TEMPLATE_VISIT_OTP=visit_otp
WHATSAPP_TEMPLATE_NEW_VISIT_ASSIGNMENT=new_visit_assignment
WHATSAPP_TEMPLATE_INTERN_DAILY_SCHEDULE=intern_daily_schedule
WHATSAPP_TEMPLATE_STUDENT_ARRIVAL=student_arrival
WHATSAPP_TEMPLATE_NEW_LEAD_OWNER=new_lead_owner
WHATSAPP_TEMPLATE_VISIT_STARTED_OWNER=visit_started_owner
WHATSAPP_TEMPLATE_VISIT_COMPLETED_OWNER=visit_completed_owner
WHATSAPP_TEMPLATE_DAILY_SUMMARY_OWNER=daily_summary_owner
WHATSAPP_TEMPLATE_WEEKLY_REPORT_OWNER=weekly_report_owner
WHATSAPP_TEMPLATE_LOW_OCCUPANCY=low_occupancy_alert
WHATSAPP_TEMPLATE_LISTING_EXPIRY=listing_expiry_notice
WHATSAPP_TEMPLATE_SUPERVISOR_ESCALATION=supervisor_escalation
WHATSAPP_TEMPLATE_ADMIN_DAILY_DASHBOARD=admin_daily_dashboard
WHATSAPP_TEMPLATE_ADMIN_SYSTEM_ALERT=admin_system_alert
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/config/env.ts backend/.env.example
git commit -m "feat: add Redis and WhatsApp template env configuration"
```

---

### Task 9: Export Queue Helpers for Controllers

**Files:**
- Create: `backend/src/queues/index.ts`

**Interfaces:**
- Produces: Single export point for all queue functionality

- [ ] **Step 1: Create index.ts**

```typescript
// backend/src/queues/index.ts
export * from "./types/whatsapp-jobs";
export * from "./whatsapp.queue";
export * from "./whatsapp.worker";
export * from "./redis.session";
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/queues/index.ts
git commit -m "feat: add queue module barrel export"
```

---

### Task 10: Test Build & Verify

**Files:**
- Test: `backend/` - run TypeScript build

- [ ] **Step 1: Run TypeScript build**

```bash
cd /Users/bhavi/Downloads/LivingGoWEBSITE/backend && npm run build
```

Expected: Build succeeds with no TypeScript errors

- [ ] **Step 2: Run linter**

```bash
cd /Users/bhavi/Downloads/LivingGoWEBSITE/backend && npm run lint
```

Expected: No linting errors

- [ ] **Step 3: Commit final changes**

```bash
git add -A
git commit -m "chore: verify build and lint pass"
```

---

## Summary

This plan creates a complete BullMQ WhatsApp architecture with:

1. **5 Separate Queues** - visit, reminder, payment, marketing, owner
2. **Typed Job Payloads** - 50+ interfaces for all workflow types
3. **Redis Session Management** - conversation state with TTL
4. **5 Workers** - each with concurrency 5 (marketing 3)
5. **Meta API v20.0 Payload Builders** - template and text messages
6. **Critical Workflows** - New Visit Assignment (Intern), OTP Verification (Student)
7. **Error Handling** - exponential backoff, DLQ, priority queues
8. **Graceful Shutdown** - proper cleanup on SIGTERM/SIGINT

Total: ~10 tasks, ~2000 lines of production-ready TypeScript code