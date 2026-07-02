import express from "express";
import morgan from "morgan";
import corsLib from "cors";
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

app.set("trust proxy", 1);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(apiLimiter);
app.use(express.json({ limit: "100mb" }));
app.use("/api/panoramas", panoramaRouter);
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://livinggo.in", 
    "https://www.livinggo.in"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

function cors(options: {
  origin: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}): express.RequestHandler {
  return corsLib({
    origin: options.origin,
    credentials: options.credentials,
    methods: options.methods,
    allowedHeaders: options.allowedHeaders,
  });
}
