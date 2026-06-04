import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env";

export const helmetMiddleware = helmet();
export const compressionMiddleware = compression();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith(".vercel.app")) return callback(null, true);

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." }
});