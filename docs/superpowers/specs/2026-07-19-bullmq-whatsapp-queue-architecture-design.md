# BullMQ WhatsApp Queue Architecture for LivingGo

## Overview
Production-ready TypeScript implementation for WhatsApp Cloud API integration using BullMQ with Redis backend. Implements 5 separate queues for distinct workloads, exponential backoff retries, dead letter queues, and Redis session management for 5 user roles.

## Architecture

### Queue Layer (5 Separate Queues)
| Queue | Purpose | Priority Levels |
|-------|---------|-----------------|
| `whatsapp:visit` | Visit bookings, intern assignments, OTP delivery | High(10), Medium(5) |
| `whatsapp:reminder` | Time-based reminders (24h, 2h, 30m, feedback, docs, payments) | Medium(5), Low(1) |
| `whatsapp:payment` | Token payments, rent reminders, refunds | High(10) |
| `whatsapp:marketing` | Welcome journey, broadcasts, re-engagement, referrals | Low(1) |
| `whatsapp:owner` | Owner alerts (new lead, visit started/completed, summaries, occupancy) | Medium(5) |

### Worker Layer
- 1 dedicated worker per queue (5 workers total)
- Concurrency: 5 jobs per worker (configurable)
- Each worker handles specific job types with typed handlers

### Redis Session Management
Key patterns:
- `sess:{phone}:user_role` - "student" | "intern" | "owner" | "supervisor" | "admin"
- `sess:{phone}:current_step` - "awaiting_otp" | "awaiting_date" | "awaiting_area" | "idle"
- `sess:{phone}:context` - JSON blob with visitId, propertyId, internId, attemptCount
- TTL: 30 min (active steps), 24h (idle)

## Critical Workflows

### 1. New Visit Request Creator (Intern Alert)
**Flow:** Student books visit → Controller enqueues `VISIT_CREATED` → Worker finds available intern → Enqueues `INTERN_ASSIGNED` → Intern receives WhatsApp template with Accept/Decline quick replies

**Meta API Payload (v20.0):**
```json
{
  "messaging_product": "whatsapp",
  "to": "91XXXXXXXXXX",
  "type": "template",
  "template": {
    "name": "new_visit_assignment",
    "language": { "code": "en" },
    "components": [
      { "type": "header", "parameters": [{ "type": "text", "text": "🏠 New Visit Assigned" }] },
      { "type": "body", "parameters": [
        { "type": "text", "text": "{{studentName}}" },
        { "type": "text", "text": "{{propertyTitle}}" },
        { "type": "text", "text": "{{location}}" },
        { "type": "text", "text": "{{dateTime}}" },
        { "type": "text", "text": "{{visitToken}}" }
      ]},
      { "type": "button", "sub_type": "quick_reply", "index": "0", "parameters": [{ "type": "payload", "payload": "ACCEPT_VISIT_{{visitToken}}" }] },
      { "type": "button", "sub_type": "quick_reply", "index": "1", "parameters": [{ "type": "payload", "payload": "DECLINE_VISIT_{{visitToken}}" }] }
    ]
  }
}
```

### 2. OTP Matcher (Inbound Webhook)
**Flow:** Student replies with OTP → Webhook receives → Enqueues `OTP_VERIFY` job → Worker verifies against `Visit.visitOtp` → Updates DB (`visitOtpVerified=true`, `leadStatus=MET`) → Notifies Intern + Owner

**Verification Logic:**
1. Extract phone + OTP from inbound message
2. Find Visit: `whatsappNumber = phone` AND `leadStatus IN (SCHEDULED, ASSIGNED)` AND `visitOtpVerified = false`
3. Compare `messageText.trim()` with `visit.visitOtp`
4. Match: Update DB, send confirmations
5. Mismatch: Increment `attemptCount` in session, reply with remaining attempts

## Error Handling

| Aspect | Configuration |
|--------|---------------|
| Retries | 3 attempts, exponential backoff (2s, 4s, 8s) |
| Dead Letter Queue | Separate `whatsapp:dlq:{queueName}` per main queue |
| Priority | High(10), Medium(5), Low(1) within each queue |
| Rate Limiting | 30 msg/sec per phone (Meta limit) |
| Alerting | Failed jobs logged to DLQ + console.error with full context |

## File Structure
```
backend/src/
├── config/
│   └── redis.ts                 # ioredis connection
├── queues/
│   ├── whatsapp.queue.ts        # Queue init + typed enqueue helpers
│   ├── whatsapp.worker.ts       # Workers + Meta API payload builders
│   ├── redis.session.ts         # Redis session helpers
│   └── types/
│       └── whatsapp-jobs.ts     # Job payload interfaces
└── controllers/
    └── whatsapp.controller.ts   # Updated to enqueue jobs
```

## Environment Variables Required
```env
# Redis (Upstash/Redis Cloud)
REDIS_URL=redis://default:password@host:port

# Meta WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_VERIFY_TOKEN=LivingGo_Secret_Token_2026
WHATSAPP_API_VERSION=v20.0

# Template Names (placeholders - replace with approved names)
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

## Dependencies to Add
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