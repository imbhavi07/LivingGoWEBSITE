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
  ACTIVE_STEP: 30 * 60, // 30 minutes
  IDLE_SESSION: 24 * 60 * 60, // 24 hours
  LOCK: 5 * 60, // 5 minutes
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
  internPhone?: string;
  studentName?: string;
  studentPhone?: string;
  visitOtp?: string;
  assignedAt?: number;
  attemptCount?: number;
  lastMessageAt?: number;
  userId?: string;
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