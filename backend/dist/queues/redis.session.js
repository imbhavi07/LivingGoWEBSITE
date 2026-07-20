"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = setUserRole;
exports.getUserRole = getUserRole;
exports.clearUserRole = clearUserRole;
exports.setCurrentStep = setCurrentStep;
exports.getCurrentStep = getCurrentStep;
exports.clearCurrentStep = clearCurrentStep;
exports.setContext = setContext;
exports.getContext = getContext;
exports.updateContext = updateContext;
exports.clearContext = clearContext;
exports.incrementAttemptCount = incrementAttemptCount;
exports.getAttemptCount = getAttemptCount;
exports.resetAttemptCount = resetAttemptCount;
exports.setOtpVerified = setOtpVerified;
exports.getOtpVerified = getOtpVerified;
exports.clearOtpVerified = clearOtpVerified;
exports.acquireVisitLock = acquireVisitLock;
exports.releaseVisitLock = releaseVisitLock;
exports.isVisitLocked = isVisitLocked;
exports.clearSession = clearSession;
exports.checkRedisHealth = checkRedisHealth;
const redis_1 = require("../config/redis");
const redis = (0, redis_1.getRedisClient)();
// ============================================
// KEY GENERATORS
// ============================================
const KEYS = {
    userRole: (phone) => `sess:${phone}:user_role`,
    currentStep: (phone) => `sess:${phone}:current_step`,
    context: (phone) => `sess:${phone}:context`,
    attemptCount: (phone) => `sess:${phone}:attempt_count`,
    otpVerified: (phone) => `sess:${phone}:otp_verified`,
    visitLock: (visitId) => `lock:visit:${visitId}`,
};
// ============================================
// TTL CONSTANTS (in seconds)
// ============================================
const TTL = {
    ACTIVE_STEP: 30 * 60, // 30 minutes
    IDLE_SESSION: 24 * 60 * 60, // 24 hours
    LOCK: 5 * 60, // 5 minutes
};
// ============================================
// USER ROLE MANAGEMENT
// ============================================
async function setUserRole(phone, role) {
    await redis.set(KEYS.userRole(phone), role, "EX", TTL.IDLE_SESSION);
}
async function getUserRole(phone) {
    const role = await redis.get(KEYS.userRole(phone));
    return role;
}
async function clearUserRole(phone) {
    await redis.del(KEYS.userRole(phone));
}
// ============================================
// CURRENT STEP MANAGEMENT
// ============================================
async function setCurrentStep(phone, step) {
    await redis.set(KEYS.currentStep(phone), step, "EX", TTL.ACTIVE_STEP);
}
async function getCurrentStep(phone) {
    const step = await redis.get(KEYS.currentStep(phone));
    return step;
}
async function clearCurrentStep(phone) {
    await redis.del(KEYS.currentStep(phone));
}
// ============================================
// CONTEXT MANAGEMENT
// ============================================
async function setContext(phone, context) {
    const existing = await getContext(phone);
    const merged = { ...existing, ...context, lastMessageAt: Date.now() };
    await redis.set(KEYS.context(phone), JSON.stringify(merged), "EX", TTL.ACTIVE_STEP);
}
async function getContext(phone) {
    const data = await redis.get(KEYS.context(phone));
    if (!data)
        return {};
    try {
        return JSON.parse(data);
    }
    catch {
        return {};
    }
}
async function updateContext(phone, updates) {
    const existing = await getContext(phone);
    await setContext(phone, { ...existing, ...updates });
}
async function clearContext(phone) {
    await redis.del(KEYS.context(phone));
}
// ============================================
// ATTEMPT COUNT (for OTP verification)
// ============================================
async function incrementAttemptCount(phone) {
    const key = KEYS.attemptCount(phone);
    const count = await redis.incr(key);
    if (count === 1) {
        await redis.expire(key, TTL.ACTIVE_STEP);
    }
    return count;
}
async function getAttemptCount(phone) {
    const count = await redis.get(KEYS.attemptCount(phone));
    return count ? parseInt(count, 10) : 0;
}
async function resetAttemptCount(phone) {
    await redis.del(KEYS.attemptCount(phone));
}
// ============================================
// OTP VERIFIED FLAG
// ============================================
async function setOtpVerified(phone, visitId) {
    await redis.set(KEYS.otpVerified(phone), visitId, "EX", TTL.ACTIVE_STEP);
}
async function getOtpVerified(phone) {
    return await redis.get(KEYS.otpVerified(phone));
}
async function clearOtpVerified(phone) {
    await redis.del(KEYS.otpVerified(phone));
}
// ============================================
// VISIT LOCK (prevent concurrent OTP processing)
// ============================================
async function acquireVisitLock(visitId, owner) {
    const result = await redis.set(KEYS.visitLock(visitId), owner, "EX", TTL.LOCK, "NX");
    return result === "OK";
}
async function releaseVisitLock(visitId, owner) {
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
async function isVisitLocked(visitId) {
    const exists = await redis.exists(KEYS.visitLock(visitId));
    return exists === 1;
}
// ============================================
// FULL SESSION CLEAR
// ============================================
async function clearSession(phone) {
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
async function checkRedisHealth() {
    try {
        const result = await redis.ping();
        return result === "PONG";
    }
    catch {
        return false;
    }
}
