import { env } from "./config/env";
import { prisma } from "./config/prisma.js";
import { app } from "./app.js";
import { closeAllWorkers } from "./queues/index.js";
import { closeRedisConnection } from "./config/redis.js";
import { initializeCronJobs } from "./workers/cron.js";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`📡 WhatsApp webhook: http://localhost:${env.PORT}/api/webhooks/whatsapp`);

  // ✅ WHATSAPP WORKERS ENABLED: All 5 BullMQ workers now start on boot
  initializeWhatsAppWorkers();
  initializeCronJobs().catch((err) => {
    console.error("❌ Failed to initialize cron jobs:", err);
  });
});

function initializeWhatsAppWorkers(): void {
  import("./queues/whatsapp.worker.js").then(({ workers }) => {
    console.log("✅ WhatsApp workers initialized");
  }).catch((err) => {
    console.error("❌ Failed to initialize WhatsApp workers:", err);
  });
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log("✅ HTTP server closed");

    try {
      await closeAllWorkers();
      await closeRedisConnection();
      await prisma.$disconnect();
      console.log("✅ All connections closed");
      process.exit(0);
    } catch (error) {
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