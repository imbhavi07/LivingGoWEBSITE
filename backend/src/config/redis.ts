import Redis from "ioredis";

let redisClient: Redis | null = null;

export function createRedisConnection(): Redis {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying
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

export function getRedisClient(): Redis {
  if (!redisClient) {
    return createRedisConnection();
  }
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}