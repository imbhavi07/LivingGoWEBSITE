"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("./config/env.js");
const prisma_js_1 = require("./config/prisma.js");
const app_js_1 = require("./app.js");
const index_js_1 = require("./queues/index.js");
const redis_js_1 = require("./config/redis.js");
const cron_js_1 = require("./workers/cron.js");
const server = app_js_1.app.listen(env_js_1.env.PORT, () => {
    console.log(`🚀 Server running on port ${env_js_1.env.PORT} in ${env_js_1.env.NODE_ENV} mode`);
    console.log(`📡 WhatsApp webhook: http://localhost:${env_js_1.env.PORT}/api/webhooks/whatsapp`);
    // Initialize WhatsApp workers
    initializeWhatsAppWorkers();
    // Initialize BullMQ repeatable jobs (cron)
    (0, cron_js_1.initializeCronJobs)().catch((err) => {
        console.error("❌ Failed to initialize cron jobs:", err);
    });
});
function initializeWhatsAppWorkers() {
    // Workers are initialized when imported (side effect)
    // Import triggers worker creation
    import("./queues/whatsapp.worker.js").then(({ workers }) => {
        console.log("✅ WhatsApp workers initialized:");
        console.log("   - Visit Worker (concurrency: 5)");
        console.log("   - Reminder Worker (concurrency: 5)");
        console.log("   - Payment Worker (concurrency: 5)");
        console.log("   - Marketing Worker (concurrency: 3)");
        console.log("   - Owner Worker (concurrency: 5)");
    }).catch((err) => {
        console.error("❌ Failed to initialize WhatsApp workers:", err);
    });
}
// Graceful shutdown
async function shutdown(signal) {
    console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
        console.log("✅ HTTP server closed");
        try {
            // Close WhatsApp workers
            await (0, index_js_1.closeAllWorkers)();
            // Close Redis connection
            await (0, redis_js_1.closeRedisConnection)();
            // Disconnect Prisma
            await prisma_js_1.prisma.$disconnect();
            console.log("✅ All connections closed");
            process.exit(0);
        }
        catch (error) {
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
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
