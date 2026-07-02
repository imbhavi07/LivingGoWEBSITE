"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors")); // Use the standard library
const routes_1 = require("./routes");
const panorama_routes_1 = require("./routes/panorama.routes");
const security_middleware_1 = require("./middleware/security.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://livinggo.in", "https://www.livinggo.in"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// 1. TRUST PROXY & SECURITY MIDDLEWARE (Must be at the top)
exports.app.set("trust proxy", 1);
exports.app.use(security_middleware_1.helmetMiddleware);
exports.app.use(security_middleware_1.corsMiddleware); // Assuming this is a custom middleware
exports.app.use(security_middleware_1.compressionMiddleware);
exports.app.use(security_middleware_1.apiLimiter);
// 2. CORS (Must be ABOVE routes)
// 3. BODY PARSERS
exports.app.use(express_1.default.json({ limit: "100mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
if (process.env.NODE_ENV !== "test") {
    exports.app.use((0, morgan_1.default)("combined"));
}
// 4. ROUTES
exports.app.use("/api/panoramas", panorama_routes_1.panoramaRouter);
exports.app.use("/api", routes_1.apiRouter);
// 5. ERROR HANDLERS (Must be at the very bottom)
exports.app.use(error_middleware_1.notFoundHandler);
exports.app.use(error_middleware_1.errorHandler);
