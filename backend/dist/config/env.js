"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(5000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:3000"),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1),
    RESEND_API_KEY: zod_1.z.string().min(1),
    EMAIL_FROM: zod_1.z.string().email(),
    // Redis
    REDIS_URL: zod_1.z.string().min(1, "REDIS_URL is required"),
    // Meta WhatsApp Cloud API
    WHATSAPP_PHONE_NUMBER_ID: zod_1.z.string().min(1),
    WHATSAPP_ACCESS_TOKEN: zod_1.z.string().min(1),
    WHATSAPP_VERIFY_TOKEN: zod_1.z.string().min(1).default("LivingGo_Secret_Token_2026"),
    WHATSAPP_API_VERSION: zod_1.z.string().default("v20.0"),
    // WhatsApp Template Names (placeholders - replace with approved template names)
    WHATSAPP_TEMPLATE_WELCOME: zod_1.z.string().default("welcome_student"),
    WHATSAPP_TEMPLATE_VISIT_REMINDER_24H: zod_1.z.string().default("visit_reminder_24h"),
    WHATSAPP_TEMPLATE_VISIT_REMINDER_2H: zod_1.z.string().default("visit_reminder_2h"),
    WHATSAPP_TEMPLATE_VISIT_REMINDER_30M: zod_1.z.string().default("visit_reminder_30m"),
    WHATSAPP_TEMPLATE_VISIT_OTP: zod_1.z.string().default("visit_otp"),
    WHATSAPP_TEMPLATE_NEW_VISIT_ASSIGNMENT: zod_1.z.string().default("new_visit_assignment"),
    WHATSAPP_TEMPLATE_INTERN_DAILY_SCHEDULE: zod_1.z.string().default("intern_daily_schedule"),
    WHATSAPP_TEMPLATE_STUDENT_ARRIVAL: zod_1.z.string().default("student_arrival"),
    WHATSAPP_TEMPLATE_NEW_LEAD_OWNER: zod_1.z.string().default("new_lead_owner"),
    WHATSAPP_TEMPLATE_VISIT_STARTED_OWNER: zod_1.z.string().default("visit_started_owner"),
    WHATSAPP_TEMPLATE_VISIT_COMPLETED_OWNER: zod_1.z.string().default("visit_completed_owner"),
    WHATSAPP_TEMPLATE_DAILY_SUMMARY_OWNER: zod_1.z.string().default("daily_summary_owner"),
    WHATSAPP_TEMPLATE_WEEKLY_REPORT_OWNER: zod_1.z.string().default("weekly_report_owner"),
    WHATSAPP_TEMPLATE_LOW_OCCUPANCY: zod_1.z.string().default("low_occupancy_alert"),
    WHATSAPP_TEMPLATE_LISTING_EXPIRY: zod_1.z.string().default("listing_expiry_notice"),
    WHATSAPP_TEMPLATE_SUPERVISOR_ESCALATION: zod_1.z.string().default("supervisor_escalation"),
    WHATSAPP_TEMPLATE_ADMIN_DAILY_DASHBOARD: zod_1.z.string().default("admin_daily_dashboard"),
    WHATSAPP_TEMPLATE_ADMIN_SYSTEM_ALERT: zod_1.z.string().default("admin_system_alert"),
});
exports.env = envSchema.parse(process.env);
