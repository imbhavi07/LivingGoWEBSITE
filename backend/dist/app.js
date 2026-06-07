"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = require("./routes");
const security_middleware_1 = require("./middleware/security.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
exports.app = (0, express_1.default)();
exports.app.set("trust proxy", 1);
exports.app.use(security_middleware_1.helmetMiddleware);
exports.app.use(security_middleware_1.corsMiddleware);
exports.app.use(security_middleware_1.compressionMiddleware);
exports.app.use(security_middleware_1.apiLimiter);
exports.app.use(express_1.default.json({ limit: "100mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
if (process.env.NODE_ENV !== "test") {
    exports.app.use((0, morgan_1.default)("combined"));
}
exports.app.use("/api", routes_1.apiRouter);
exports.app.use(error_middleware_1.notFoundHandler);
exports.app.use(error_middleware_1.errorHandler);
