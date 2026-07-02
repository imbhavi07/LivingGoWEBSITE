import express, { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors from 'cors';
import { apiRouter } from "./routes";
import { panoramaRouter } from "./routes/panorama.routes";
import couponRoutes  from "./routes/coupon.routes";
import affiliateRoutes from "./routes/affiliate.routes";
import { wishlistRouter } from "./routes/wishlist.routes";
import {
  apiLimiter,
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware
} from "./middleware/security.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARES & SECURITY
// ==========================================

// added the CORS middleware to allow requests from specific origins
app.use(cors({
  origin: ["http://localhost:3000",
    "https://livinggo.in", 
    "https://www.livinggo.in"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.set("trust proxy", 1);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(apiLimiter);
app.use(morgan("dev"));

// Body Parsers (Consolidated to single 100mb limits so big file uploads don't fail)
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// ==========================================
// 2. ROUTE MOUNTING (Must all be above error handlers!)
// ==========================================
app.use("/api", panoramaRouter);
app.use("/api", couponRoutes);
app.use("/api", affiliateRoutes);
app.use("/api", wishlistRouter); // <--- Safely mounted here!

// ==========================================
// 3. ERROR HANDLERS (Must always be last!)
// ==========================================
app.use(notFoundHandler as RequestHandler);
app.use(errorHandler as ErrorRequestHandler);