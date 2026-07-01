import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { app } from "./app";
import type { Request, Response, NextFunction } from "express";
import cors from "cors"; // Install via: npm install cors @types/cors (if not already installed)

// Standard, zero-error CORS application wrapper
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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