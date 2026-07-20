"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisConnection = createRedisConnection;
exports.getRedisClient = getRedisClient;
exports.closeRedisConnection = closeRedisConnection;
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient = null;
function createRedisConnection() {
    if (redisClient)
        return redisClient;
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error("REDIS_URL environment variable is required");
    }
    redisClient = new ioredis_1.default(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
            if (times > 3)
                return null; // Stop retrying
            return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
    });
    redisClient.on("error", (err) => {
        console.error("❌ Redis connection error:", err);
    });
    redisClient.on("connect", () => {
        console.log("✅ Redis connected");
    });
    redisClient.on("ready", () => {
        console.log("✅ Redis ready");
    });
    return redisClient;
}
function getRedisClient() {
    if (!redisClient) {
        return createRedisConnection();
    }
    return redisClient;
}
async function closeRedisConnection() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}
