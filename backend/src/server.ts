import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { app } from "./app";

const server = app.listen(env.PORT, () => {
  console.log(`LivingGo backend running on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));