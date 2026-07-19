import express from "express";
import morgan from "morgan";
import cors from "cors"; // Use the standard library
import { apiRouter } from "./routes";
import { panoramaRouter } from "./routes/panorama.routes";
import { whatsappRouter } from "./routes/whatsapp.routes"; // ✅ Added WhatsApp Router import
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
app.use(corsMiddleware); // Assuming this is a custom middleware

app.use(helmetMiddleware);

app.use(compressionMiddleware);
app.use(apiLimiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use('/api/earn', earnRoutes);
app.use("/api/panoramas", panoramaRouter);
app.use("/api/webhooks/whatsapp", whatsappRouter); // ✅ Mounted the WhatsApp webhook route
app.use("/api", apiRouter);

app.use(cors({
  origin: ["http://localhost:3000", "https://livinggo.in", "https://www.livinggo.in"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(notFoundHandler);
app.use(errorHandler);