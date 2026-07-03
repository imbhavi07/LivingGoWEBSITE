"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const app_error_1 = require("../utils/app-error");
function notFoundHandler(request, _response, next) {
    next(new app_error_1.AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404));
}
function errorHandler(error, _request, response, _next) {
    if (error instanceof zod_1.ZodError) {
        return response.status(400).json({
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    if (error instanceof app_error_1.AppError) {
        return response.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    return response.status(500).json({ message: "Internal server error" });
}
