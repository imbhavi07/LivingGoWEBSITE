import express from "express";
import morgan from "morgan";
import { apiRouter } from "./routes";
import {
  apiLimiter,
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware
} from "./middleware/security.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

app.set("trust proxy", 1);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.options('*', corsMiddleware);
app.use(apiLimiter);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);