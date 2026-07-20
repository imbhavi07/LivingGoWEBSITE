import express from "express";
import morgan from "morgan";
import cors from "cors"; 
import { apiRouter } from "./routes";
import { panoramaRouter } from "./routes/panorama.routes";
import { whatsappRouter } from "./routes/whatsapp.routes"; 
import {
  apiLimiter,
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware
} from "./middleware/security.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import earnRoutes from './routes/earn.routes';

export const app = express();

app.set("trust proxy", 1);

// 🔴 FIX 1: CORS must be the absolute FIRST thing so preflight OPTIONS requests succeed
app.use(cors({
  origin: ["http://localhost:3000", "https://livinggo.in", "https://www.livinggo.in"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // 🔴 FIX 2: Whitelisted the exact headers your frontend axios client is sending
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"], 
}));

app.use(corsMiddleware); // Keeping your custom one just in case it handles specific edge cases
app.use(helmetMiddleware);

app.use(compressionMiddleware);
app.use(apiLimiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// 🔴 FIX 3: Routes are now correctly mounted AFTER CORS has approved the request
app.use('/api/earn', earnRoutes);
app.use("/api/panoramas", panoramaRouter);
app.use("/api/webhooks/whatsapp", whatsappRouter); 
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);