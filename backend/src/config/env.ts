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

  // WhatsApp Template Names (placeholders - replace with approved template names)
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