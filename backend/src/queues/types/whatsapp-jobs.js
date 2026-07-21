"use strict";
// ============================================
// BASE TYPES
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHATSAPP_DLQ_SUFFIX = exports.WHATSAPP_QUEUES = void 0;
// ============================================
// QUEUE NAMES
// ============================================
exports.WHATSAPP_QUEUES = {
    VISIT: "whatsapp-visit",
    REMINDER: "whatsapp-reminder",
    PAYMENT: "whatsapp-payment",
    MARKETING: "whatsapp-marketing",
    OWNER: "whatsapp-owner",
};
exports.WHATSAPP_DLQ_SUFFIX = "-dlq";
