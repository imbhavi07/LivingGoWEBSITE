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
  | "INTERN_CREATED"
  | "INTERN_ASSIGNED"
  | "VISIT_OTP_SENT"
  | "VISIT_CONFIRMED"
  | "VISIT_RESCHEDULED"
  | "VISIT_CANCELLED"
  | "STUDENT_ARRIVAL_ALERT"
  | "OTP_VERIFY"
  | "GUIDE_ASSIGNED_STUDENT";

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

export interface InternCreatedPayload extends BaseJobPayload {
  type: "INTERN_CREATED";
  internId: string;
  internName: string;
  internPhone: string;
  welcomeMessage?: string;
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

export interface GuideAssignedStudentPayload extends BaseJobPayload {
  type: "GUIDE_ASSIGNED_STUDENT";
  visitId: string;
  visitToken: string;
  studentName: string;
  studentPhone: string;
  internName: string;
  internPhone: string;
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
  | InternCreatedPayload
  | InternAssignedPayload
  | VisitOtpSentPayload
  | VisitConfirmedPayload
  | OTPVerifyPayload
  | StudentArrivalAlertPayload
  | GuideAssignedStudentPayload;

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
  type:
    | "INTERN_DAILY_SCHEDULE_10AM"
    | "INTERN_DAILY_SCHEDULE_12PM"
    | "INTERN_DAILY_SCHEDULE_4PM";
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
  | "PROMOTIONAL_OFFER"
  | "STUDENT_REGISTERED";

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

export interface StudentRegisteredPayload extends BaseJobPayload {
  type: "STUDENT_REGISTERED";
  studentName: string;
}

export type MarketingQueuePayload =
  | WelcomeJourneyPayload
  | BroadcastPayload
  | ReEngagementPayload
  | ReferralInvitePayload
  | StudentRegisteredPayload;

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
  VISIT: "whatsapp-visit",
  REMINDER: "whatsapp-reminder",
  PAYMENT: "whatsapp-payment",
  MARKETING: "whatsapp-marketing",
  OWNER: "whatsapp-owner",
} as const;

export const WHATSAPP_DLQ_SUFFIX = "-dlq";

export type QueueName = (typeof WHATSAPP_QUEUES)[keyof typeof WHATSAPP_QUEUES];