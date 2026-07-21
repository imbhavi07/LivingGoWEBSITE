"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const prisma_js_1 = require("./config/prisma.js");
const app_js_1 = require("./app.js");
const index_js_1 = require("./queues/index.js");
const redis_js_1 = require("./config/redis.js");
const server = app_js_1.app.listen(env_1.env.PORT, () => {
    console.log(`🚀 Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
    console.log(`📡 WhatsApp webhook: http://localhost:${env_1.env.PORT}/api/webhooks/whatsapp`);
    // 🔴 REDIS RESCUE: We are temporarily commenting out the background workers
    // This stops the 'ENOTFOUND' loop from choking the server and blocking API requests.
    /*
    initializeWhatsAppWorkers();
    initializeCronJobs().catch((err) => {
      console.error("❌ Failed to initialize cron jobs:", err);
    });
    */
});
function initializeWhatsAppWorkers() {
    import("./queues/whatsapp.worker.js").then(({ workers }) => {
        console.log("✅ WhatsApp workers initialized");
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
            await (0, index_js_1.closeAllWorkers)();
            await (0, redis_js_1.closeRedisConnection)();
            await prisma_js_1.prisma.$disconnect();
            console.log("✅ All connections closed");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error during shutdown:", error);
            process.exit(1);
        }
    });
    setTimeout(() => {
        console.error("❌ Force shutdown timeout");
        process.exit(1);
    }, 30000);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
