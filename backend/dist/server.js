"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const app_1 = require("./app");
const server = app_1.app.listen(env_1.env.PORT, () => {
    console.log(`LivingGo backend running on port ${env_1.env.PORT}`);
});
async function shutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close(async () => {
        await prisma_1.prisma.$disconnect();
        process.exit(0);
    });
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
