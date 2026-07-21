"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
var bullmq_1 = require("bullmq");
var redis_1 = require("../config/redis");
var whatsapp_jobs_1 = require("./types/whatsapp-jobs");
// ============================================
// QUEUE CONFIGURATION
// ============================================
var defaultQueueOptions = {
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
    visit: new bullmq_1.Queue("".concat(whatsapp_jobs_1.WHATSAPP_QUEUES.VISIT).concat(whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX), defaultQueueOptions),
    reminder: new bullmq_1.Queue("".concat(whatsapp_jobs_1.WHATSAPP_QUEUES.REMINDER).concat(whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX), defaultQueueOptions),
    payment: new bullmq_1.Queue("".concat(whatsapp_jobs_1.WHATSAPP_QUEUES.PAYMENT).concat(whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX), defaultQueueOptions),
    marketing: new bullmq_1.Queue("".concat(whatsapp_jobs_1.WHATSAPP_QUEUES.MARKETING).concat(whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX), defaultQueueOptions),
    owner: new bullmq_1.Queue("".concat(whatsapp_jobs_1.WHATSAPP_QUEUES.OWNER).concat(whatsapp_jobs_1.WHATSAPP_DLQ_SUFFIX), defaultQueueOptions),
};
// ============================================
// HELPER: Generate unique job ID
// ============================================
function generateJobId(type, identifier) {
    return "".concat(type, "_").concat(identifier, "_").concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8));
}
// ============================================
// VISIT QUEUE ENQUEUE HELPERS
// ============================================
function queueVisitCreated(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("VISIT_CREATED", payload.visitToken);
            return [2 /*return*/, exports.visitQueue.add("VISIT_CREATED", __assign(__assign({}, payload), { type: "VISIT_CREATED", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
function queueInternAssigned(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("INTERN_ASSIGNED", payload.visitToken);
            return [2 /*return*/, exports.visitQueue.add("INTERN_ASSIGNED", __assign(__assign({}, payload), { type: "INTERN_ASSIGNED", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
function queueVisitOtpSent(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("VISIT_OTP_SENT", payload.visitToken);
            return [2 /*return*/, exports.visitQueue.add("VISIT_OTP_SENT", __assign(__assign({}, payload), { type: "VISIT_OTP_SENT", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
function queueVisitConfirmed(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("VISIT_CONFIRMED", payload.visitToken);
            return [2 /*return*/, exports.visitQueue.add("VISIT_CONFIRMED", __assign(__assign({}, payload), { type: "VISIT_CONFIRMED", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueOTPVerify(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("OTP_VERIFY", payload.visitToken);
            return [2 /*return*/, exports.visitQueue.add("OTP_VERIFY", __assign(__assign({}, payload), { type: "OTP_VERIFY", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
function queueStudentArrivalAlert(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("STUDENT_ARRIVAL_ALERT", payload.visitToken);
            return [2 /*return*/, exports.visitQueue.add("STUDENT_ARRIVAL_ALERT", __assign(__assign({}, payload), { type: "STUDENT_ARRIVAL_ALERT", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
// ============================================
// REMINDER QUEUE ENQUEUE HELPERS
// ============================================
function queueProfileCompletionReminder(payload_1) {
    return __awaiter(this, arguments, void 0, function (payload, delayMs) {
        var jobId;
        if (delayMs === void 0) { delayMs = 6 * 60 * 60 * 1000; }
        return __generator(this, function (_a) {
            jobId = generateJobId("PROFILE_COMPLETION", payload.phoneNumber);
            return [2 /*return*/, exports.reminderQueue.add("PROFILE_COMPLETION", __assign(__assign({}, payload), { type: "PROFILE_COMPLETION", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                    delay: delayMs,
                })];
        });
    });
}
function queueVisitReminder(type, payload, delayMs) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId(type, payload.visitToken);
            return [2 /*return*/, exports.reminderQueue.add(type, __assign(__assign({}, payload), { type: type, jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                    delay: delayMs,
                })];
        });
    });
}
function queueVisit24HReminder(payload) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, queueVisitReminder("VISIT_24H", payload, 24 * 60 * 60 * 1000)];
        });
    });
}
function queueVisit2HReminder(payload) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, queueVisitReminder("VISIT_2H", payload, 2 * 60 * 60 * 1000)];
        });
    });
}
function queueVisit30MReminder(payload) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, queueVisitReminder("VISIT_30M", payload, 30 * 60 * 1000)];
        });
    });
}
function queueFeedbackRequest(payload_1) {
    return __awaiter(this, arguments, void 0, function (payload, delayMs) {
        var jobId;
        if (delayMs === void 0) { delayMs = 2 * 60 * 60 * 1000; }
        return __generator(this, function (_a) {
            jobId = generateJobId("FEEDBACK_REQUEST", payload.visitToken);
            return [2 /*return*/, exports.reminderQueue.add("FEEDBACK_REQUEST", __assign(__assign({}, payload), { type: "FEEDBACK_REQUEST", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                    delay: delayMs,
                })];
        });
    });
}
function queueDocumentCollection(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("DOCUMENT_COLLECTION", payload.visitToken);
            return [2 /*return*/, exports.reminderQueue.add("DOCUMENT_COLLECTION", __assign(__assign({}, payload), { type: "DOCUMENT_COLLECTION", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueTokenPaymentReminder(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("TOKEN_PAYMENT_REMINDER", payload.visitToken);
            return [2 /*return*/, exports.reminderQueue.add("TOKEN_PAYMENT_REMINDER", __assign(__assign({}, payload), { type: "TOKEN_PAYMENT_REMINDER", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueRentDueReminder(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("RENT_DUE_REMINDER", payload.phoneNumber);
            return [2 /*return*/, exports.reminderQueue.add("RENT_DUE_REMINDER", __assign(__assign({}, payload), { type: "RENT_DUE_REMINDER", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueInternDailySchedule(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("INTERN_DAILY_SCHEDULE", "".concat(payload.internId, "_").concat(payload.date));
            return [2 /*return*/, exports.reminderQueue.add(payload.type, __assign(__assign({}, payload), { jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
// ============================================
// PAYMENT QUEUE ENQUEUE HELPERS
// ============================================
function queueTokenDue(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("TOKEN_DUE", payload.visitToken);
            return [2 /*return*/, exports.paymentQueue.add("TOKEN_DUE", __assign(__assign({}, payload), { type: "TOKEN_DUE", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
function queueTokenConfirmed(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("TOKEN_CONFIRMED", payload.visitToken);
            return [2 /*return*/, exports.paymentQueue.add("TOKEN_CONFIRMED", __assign(__assign({}, payload), { type: "TOKEN_CONFIRMED", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueTokenRejected(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("TOKEN_REJECTED", payload.visitToken);
            return [2 /*return*/, exports.paymentQueue.add("TOKEN_REJECTED", __assign(__assign({}, payload), { type: "TOKEN_REJECTED", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueRefundProcessed(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("REFUND_PROCESSED", payload.visitToken);
            return [2 /*return*/, exports.paymentQueue.add("REFUND_PROCESSED", __assign(__assign({}, payload), { type: "REFUND_PROCESSED", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
// ============================================
// MARKETING QUEUE ENQUEUE HELPERS
// ============================================
function queueWelcomeJourney(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("WELCOME_JOURNEY", payload.phoneNumber);
            return [2 /*return*/, exports.marketingQueue.add("WELCOME_JOURNEY", __assign(__assign({}, payload), { type: "WELCOME_JOURNEY", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                })];
        });
    });
}
function queueBroadcast(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("BROADCAST", "".concat(payload.templateName, "_").concat(Date.now()));
            return [2 /*return*/, exports.marketingQueue.add("BROADCAST", __assign(__assign({}, payload), { type: "BROADCAST", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                })];
        });
    });
}
function queueReEngagement(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("RE_ENGAGEMENT", payload.phoneNumber);
            return [2 /*return*/, exports.marketingQueue.add("RE_ENGAGEMENT", __assign(__assign({}, payload), { type: "RE_ENGAGEMENT", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                })];
        });
    });
}
function queueReferralInvite(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("REFERRAL_INVITE", payload.referrerCode);
            return [2 /*return*/, exports.marketingQueue.add("REFERRAL_INVITE", __assign(__assign({}, payload), { type: "REFERRAL_INVITE", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                })];
        });
    });
}
// ============================================
// OWNER QUEUE ENQUEUE HELPERS
// ============================================
function queueNewLead(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("NEW_LEAD", payload.visitToken);
            return [2 /*return*/, exports.ownerQueue.add("NEW_LEAD", __assign(__assign({}, payload), { type: "NEW_LEAD", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueVisitStarted(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("VISIT_STARTED", payload.visitToken);
            return [2 /*return*/, exports.ownerQueue.add("VISIT_STARTED", __assign(__assign({}, payload), { type: "VISIT_STARTED", jobId: jobId, timestamp: Date.now(), priority: 10 }), {
                    jobId: jobId,
                    priority: 10,
                })];
        });
    });
}
function queueVisitCompleted(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("VISIT_COMPLETED", payload.visitToken);
            return [2 /*return*/, exports.ownerQueue.add("VISIT_COMPLETED", __assign(__assign({}, payload), { type: "VISIT_COMPLETED", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueDailySummary(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("DAILY_SUMMARY", "".concat(payload.ownerId, "_").concat(payload.date));
            return [2 /*return*/, exports.ownerQueue.add("DAILY_SUMMARY", __assign(__assign({}, payload), { type: "DAILY_SUMMARY", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                })];
        });
    });
}
function queueWeeklyReport(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("WEEKLY_REPORT", "".concat(payload.ownerId, "_").concat(payload.weekStart));
            return [2 /*return*/, exports.ownerQueue.add("WEEKLY_REPORT", __assign(__assign({}, payload), { type: "WEEKLY_REPORT", jobId: jobId, timestamp: Date.now(), priority: 1 }), {
                    jobId: jobId,
                    priority: 1,
                })];
        });
    });
}
function queueLowOccupancy(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("LOW_OCCUPANCY", payload.propertyId);
            return [2 /*return*/, exports.ownerQueue.add("LOW_OCCUPANCY", __assign(__assign({}, payload), { type: "LOW_OCCUPANCY", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
function queueListingExpiry(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var jobId;
        return __generator(this, function (_a) {
            jobId = generateJobId("LISTING_EXPIRY", payload.propertyId);
            return [2 /*return*/, exports.ownerQueue.add("LISTING_EXPIRY", __assign(__assign({}, payload), { type: "LISTING_EXPIRY", jobId: jobId, timestamp: Date.now(), priority: 5 }), {
                    jobId: jobId,
                    priority: 5,
                })];
        });
    });
}
// ============================================
// QUEUE MANAGEMENT
// ============================================
function getQueueStats() {
    return __awaiter(this, void 0, void 0, function () {
        var stats, _i, _a, _b, name_1, queue, _c, waiting, active, completed, failed;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    stats = {};
                    _i = 0, _a = Object.entries(exports.queues);
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], name_1 = _b[0], queue = _b[1];
                    return [4 /*yield*/, Promise.all([
                            queue.getWaitingCount(),
                            queue.getActiveCount(),
                            queue.getCompletedCount(),
                            queue.getFailedCount(),
                        ])];
                case 2:
                    _c = _d.sent(), waiting = _c[0], active = _c[1], completed = _c[2], failed = _c[3];
                    stats[name_1] = { waiting: waiting, active: active, completed: completed, failed: failed };
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, stats];
            }
        });
    });
}
function pauseAllQueues() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.values(exports.queues).map(function (q) { return q.pause(); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function resumeAllQueues() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.values(exports.queues).map(function (q) { return q.resume(); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function closeAllQueues() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], Object.values(exports.queues).map(function (q) { return q.close(); }), true), Object.values(exports.dlqQueues).map(function (q) { return q.close(); }), true))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ============================================
// EVENT LISTENERS FOR LOGGING
// ============================================
function setupQueueEvents(queue, queueName) {
    queue.on("completed", function (job) {
        console.log("\u2705 [".concat(queueName, "] Job ").concat(job.id, " (").concat(job.name, ") completed"));
    });
    queue.on("failed", function (job, err) {
        if (job) {
            console.error("\u274C [".concat(queueName, "] Job ").concat(job.id, " (").concat(job.name, ") failed:"), err.message);
            console.error("   Attempts made: ".concat(job.attemptsMade, "/").concat(job.opts.attempts));
            console.error("   Payload:", JSON.stringify(job.data, null, 2));
        }
    });
    queue.on("stalled", function (jobId) {
        console.warn("\u26A0\uFE0F [".concat(queueName, "] Job ").concat(jobId, " stalled"));
    });
}
Object.entries(exports.queues).forEach(function (_a) {
    var name = _a[0], queue = _a[1];
    return setupQueueEvents(queue, name);
});
Object.entries(exports.dlqQueues).forEach(function (_a) {
    var name = _a[0], queue = _a[1];
    return setupQueueEvents(queue, "DLQ:".concat(name));
});
