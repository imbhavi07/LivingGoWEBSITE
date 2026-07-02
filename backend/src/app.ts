import express from "express";
import morgan from "morgan";
import cors from "cors"; // Use the standard library
import { apiRouter } from "./routes";
import { panoramaRouter } from "./routes/panorama.routes";
import {
  apiLimiter,
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware
} from "./middleware/security.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://livinggo.in", "https://www.livinggo.in"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// 1. TRUST PROXY & SECURITY MIDDLEWARE (Must be at the top)
app.set("trust proxy", 1);
app.use(helmetMiddleware);
app.use(corsMiddleware); // Assuming this is a custom middleware
app.use(compressionMiddleware);
app.use(apiLimiter);

// 2. CORS (Must be ABOVE routes)


// 3. BODY PARSERS
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// 4. ROUTES
app.use("/api/panoramas", panoramaRouter);
app.use("/api", apiRouter);

// 5. ERROR HANDLERS (Must be at the very bottom)
app.use(notFoundHandler);
app.use(errorHandler);