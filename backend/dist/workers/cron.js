"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCronJobs = initializeCronJobs;
exports.removeAllCronJobs = removeAllCronJobs;
exports.getRepeatableJobs = getRepeatableJobs;
exports.triggerInternDailySchedule = triggerInternDailySchedule;
exports.triggerAdminDailyDashboard = triggerAdminDailyDashboard;
exports.triggerDailySummaryOwner = triggerDailySummaryOwner;
const client_1 = require("@prisma/client");
const whatsapp_queue_1 = require("../queues/whatsapp.queue");
const whatsapp_queue_2 = require("../queues/whatsapp.queue");
const prisma = new client_1.PrismaClient();
// IST timezone for cron patterns
const IST_TIMEZONE = "Asia/Kolkata";
/**
 * Initialize all repeatable (cron) jobs for BullMQ queues.
 * Call this once on server startup after queues are initialized.
 */
async function initializeCronJobs() {
    console.log("🕐 Initializing BullMQ repeatable jobs (cron)...");
    // ============================================
    // 1. INTERN DAILY SCHEDULE - 08:00 AM IST daily
    // ============================================
    // Fires every day at 08:00 AM IST to send interns their daily schedule
    await whatsapp_queue_1.reminderQueue.add("INTERN_DAILY_SCHEDULE_10AM", {}, // Empty payload - worker will fetch active interns and their visits
    {
        repeat: {
            pattern: "0 8 * * *", // 08:00 AM daily
            tz: IST_TIMEZONE,
        },
        jobId: "intern_daily_schedule_10am",
        removeOnComplete: 10,
        removeOnFail: 5,
    });
    // Also schedule 12 PM and 4 PM reminders for interns with afternoon visits
    await whatsapp_queue_1.reminderQueue.add("INTERN_DAILY_SCHEDULE_12PM", {}, {
        repeat: {
            pattern: "0 12 * * *", // 12:00 PM daily
            tz: IST_TIMEZONE,
        },
        jobId: "intern_daily_schedule_12pm",
        removeOnComplete: 10,
        removeOnFail: 5,
    });
    await whatsapp_queue_1.reminderQueue.add("INTERN_DAILY_SCHEDULE_4PM", {}, {
        repeat: {
            pattern: "0 16 * * *", // 04:00 PM daily
            tz: IST_TIMEZONE,
        },
        jobId: "intern_daily_schedule_4pm",
        removeOnComplete: 10,
        removeOnFail: 5,
    });
    console.log("   ✅ intern_daily_schedule: 08:00, 12:00, 16:00 IST daily");
    // ============================================
    // 2. ADMIN DAILY DASHBOARD - 08:00 PM IST daily
    // ============================================
    // Fires every day at 08:00 PM IST to send admin dashboard summary
    await whatsapp_queue_1.marketingQueue.add("ADMIN_DAILY_DASHBOARD", {}, // Empty payload - worker will fetch stats and send to admin numbers
    {
        repeat: {
            pattern: "0 20 * * *", // 08:00 PM daily
            tz: IST_TIMEZONE,
        },
        jobId: "admin_daily_dashboard",
        removeOnComplete: 10,
        removeOnFail: 5,
    });
    console.log("   ✅ admin_daily_dashboard: 20:00 IST daily");
    // ============================================
    // 3. DAILY SUMMARY OWNER - 08:30 PM IST daily
    // ============================================
    // Fires every day at 08:30 PM IST to send owners their daily summary
    await whatsapp_queue_1.ownerQueue.add("DAILY_SUMMARY_OWNER", {}, // Empty payload - worker will fetch all owners and their visits
    {
        repeat: {
            pattern: "30 20 * * *", // 08:30 PM daily
            tz: IST_TIMEZONE,
        },
        jobId: "daily_summary_owner",
        removeOnComplete: 10,
        removeOnFail: 5,
    });
    console.log("   ✅ daily_summary_owner: 20:30 IST daily");
    console.log("🕐 All repeatable jobs initialized successfully");
}
/**
 * Remove all repeatable jobs (useful for testing or cleanup)
 */
async function removeAllCronJobs() {
    console.log("🗑️ Removing all repeatable jobs...");
    await Promise.all([
        whatsapp_queue_1.reminderQueue.removeRepeatable("INTERN_DAILY_SCHEDULE_10AM", { pattern: "0 8 * * *", tz: IST_TIMEZONE }),
        whatsapp_queue_1.reminderQueue.removeRepeatable("INTERN_DAILY_SCHEDULE_12PM", { pattern: "0 12 * * *", tz: IST_TIMEZONE }),
        whatsapp_queue_1.reminderQueue.removeRepeatable("INTERN_DAILY_SCHEDULE_4PM", { pattern: "0 16 * * *", tz: IST_TIMEZONE }),
        whatsapp_queue_1.marketingQueue.removeRepeatable("ADMIN_DAILY_DASHBOARD", { pattern: "0 20 * * *", tz: IST_TIMEZONE }),
        whatsapp_queue_1.ownerQueue.removeRepeatable("DAILY_SUMMARY_OWNER", { pattern: "30 20 * * *", tz: IST_TIMEZONE }),
    ]);
    console.log("✅ All repeatable jobs removed");
}
/**
 * Get all repeatable jobs for monitoring/debugging
 */
async function getRepeatableJobs() {
    const [reminderJobs, marketingJobs, ownerJobs] = await Promise.all([
        whatsapp_queue_1.reminderQueue.getRepeatableJobs(),
        whatsapp_queue_1.marketingQueue.getRepeatableJobs(),
        whatsapp_queue_1.ownerQueue.getRepeatableJobs(),
    ]);
    return [
        ...reminderJobs.map((j) => ({
            queue: "reminder",
            name: j.name,
            pattern: j.pattern ?? "",
            tz: j.tz ?? IST_TIMEZONE,
            nextRun: j.next ? new Date(j.next) : undefined,
        })),
        ...marketingJobs.map((j) => ({
            queue: "marketing",
            name: j.name,
            pattern: j.pattern ?? "",
            tz: j.tz ?? IST_TIMEZONE,
            nextRun: j.next ? new Date(j.next) : undefined,
        })),
        ...ownerJobs.map((j) => ({
            queue: "owner",
            name: j.name,
            pattern: j.pattern ?? "",
            tz: j.tz ?? IST_TIMEZONE,
            nextRun: j.next ? new Date(j.next) : undefined,
        })),
    ];
}
/**
 * Helper to trigger a one-time intern daily schedule for testing
 * Fetches active interns and their visits for today, enqueues messages
 */
async function triggerInternDailySchedule(testDate) {
    const date = testDate ? new Date(testDate) : new Date();
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    // Fetch active interns with their visits for the date
    const interns = await prisma.intern.findMany({
        where: { active: true },
        include: {
            visits: {
                where: {
                    visitDate: {
                        gte: new Date(`${dateStr}T00:00:00`),
                        lt: new Date(`${dateStr}T23:59:59`),
                    },
                    leadStatus: { in: ["ASSIGNED", "MET"] },
                },
                include: {
                    student: { select: { name: true, phone: true } },
                    property: { select: { title: true, location: true } },
                },
                orderBy: { timeSlot: "asc" },
            },
        },
    });
    // Enqueue schedule for each intern
    for (const intern of interns) {
        const visits = intern.visits.map((v) => ({
            visitId: v.id,
            visitToken: v.tokenId,
            studentName: v.student.name,
            studentPhone: v.student.phone || "",
            propertyTitle: v.property.title,
            propertyLocation: v.property.location,
            timeSlot: v.timeSlot,
            visitOtp: v.visitOtp,
        }));
        if (visits.length > 0) {
            await (0, whatsapp_queue_2.queueInternDailySchedule)({
                phoneNumber: intern.phone,
                userRole: "intern",
                internId: intern.id,
                internName: intern.name,
                date: dateStr,
                visits,
                type: "INTERN_DAILY_SCHEDULE_10AM", // This will be overridden by the function based on the job name
            });
        }
    }
    console.log(`✅ Triggered intern daily schedule for ${dateStr} (${interns.length} interns)`);
}
/**
 * Helper to trigger admin daily dashboard for testing
 */
async function triggerAdminDailyDashboard(testDate) {
    const date = testDate ? new Date(testDate) : new Date();
    const dateStr = date.toISOString().split("T")[0];
    // Fetch daily stats
    const [totalVisits, completedVisits, bookings, activeInterns, revenue,] = await Promise.all([
        prisma.visit.count({
            where: {
                visitDate: {
                    gte: new Date(`${dateStr}T00:00:00`),
                    lt: new Date(`${dateStr}T23:59:59`),
                },
            },
        }),
        prisma.visit.count({
            where: {
                visitDate: {
                    gte: new Date(`${dateStr}T00:00:00`),
                    lt: new Date(`${dateStr}T23:59:59`),
                },
                leadStatus: "MET",
            },
        }),
        prisma.visit.count({
            where: {
                createdAt: {
                    gte: new Date(`${dateStr}T00:00:00`),
                    lt: new Date(`${dateStr}T23:59:59`),
                },
            },
        }),
        prisma.intern.count({ where: { active: true } }),
        prisma.tokenPayment.aggregate({
            where: {
                createdAt: {
                    gte: new Date(`${dateStr}T00:00:00`),
                    lt: new Date(`${dateStr}T23:59:59`),
                },
                status: "approved",
            },
            _sum: { amount: true },
        }),
    ]);
    // Get admin/supervisor phone numbers
    const admins = await prisma.user.findMany({
        where: { role: { in: ["admin", "SUPER_ADMIN", "SUPERVISOR"] }, status: "active" },
        select: { phone: true, name: true },
    });
    for (const admin of admins) {
        if (admin.phone) {
            await (0, whatsapp_queue_2.queueBroadcast)({
                phoneNumber: admin.phone,
                userRole: "admin",
                templateName: "admin_daily_dashboard",
                templateParams: {
                    date: dateStr,
                    totalVisits: totalVisits.toString(),
                    completedVisits: completedVisits.toString(),
                    revenue: ((revenue._sum?.amount ?? 0)).toLocaleString(),
                    bookings: bookings.toString(),
                    activeInterns: activeInterns.toString(),
                    systemHealth: "Healthy",
                },
            });
        }
    }
    console.log(`✅ Triggered admin daily dashboard for ${dateStr} (${admins.length} admins)`);
}
/**
 * Helper to trigger daily summary for all owners for testing
 */
async function triggerDailySummaryOwner(testDate) {
    const date = testDate ? new Date(testDate) : new Date();
    const dateStr = date.toISOString().split("T")[0];
    // Fetch all owners with properties
    const owners = await prisma.user.findMany({
        where: { role: "owner", status: "active" },
        include: {
            properties: {
                include: {
                    visits: {
                        where: {
                            visitDate: {
                                gte: new Date(`${dateStr}T00:00:00`),
                                lt: new Date(`${dateStr}T23:59:59`),
                            },
                        },
                        include: {
                            student: { select: { name: true } },
                        },
                    },
                },
            },
        },
    });
    for (const owner of owners) {
        if (!owner.phone)
            continue;
        let totalVisits = 0;
        let visitsCompleted = 0;
        let visitsNoShow = 0;
        let newLeads = 0;
        let tokensCollected = 0;
        let revenue = 0;
        const visits = [];
        for (const property of owner.properties) {
            for (const visit of property.visits) {
                totalVisits++;
                if (visit.leadStatus === "MET")
                    visitsCompleted++;
                if (visit.leadStatus === "NOT_MET")
                    visitsNoShow++;
                if (visit.leadStatus === "ASSIGNED" || visit.leadStatus === "MET")
                    newLeads++;
                visits.push({
                    visitToken: visit.tokenId,
                    studentName: visit.student.name,
                    propertyTitle: property.title,
                    timeSlot: visit.timeSlot,
                    status: visit.leadStatus,
                });
            }
        }
        // Get token payments for this owner's properties today
        const propertyIds = owner.properties.map((p) => p.id);
        const payments = await prisma.tokenPayment.findMany({
            where: {
                propertyId: { in: propertyIds },
                createdAt: {
                    gte: new Date(`${dateStr}T00:00:00`),
                    lt: new Date(`${dateStr}T23:59:59`),
                },
                status: "approved",
            },
        });
        tokensCollected = payments.length;
        revenue = payments.reduce((sum, p) => sum + p.amount, 0);
        await (0, whatsapp_queue_2.queueDailySummary)({
            phoneNumber: owner.phone,
            userRole: "owner",
            ownerId: owner.id,
            ownerName: owner.name,
            date: dateStr,
            stats: {
                totalVisits,
                visitsCompleted,
                visitsNoShow,
                newLeads,
                tokensCollected,
                revenue,
            },
            visits,
        });
    }
    console.log(`✅ Triggered daily summary for ${dateStr} (${owners.length} owners)`);
}
