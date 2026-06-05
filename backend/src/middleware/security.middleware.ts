import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env";

export const helmetMiddleware = helmet();
export const compressionMiddleware = compression();

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
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