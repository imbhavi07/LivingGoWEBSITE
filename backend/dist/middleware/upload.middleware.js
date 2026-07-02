"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadImages = void 0;
const multer_1 = __importDefault(require("multer"));
const app_error_1 = require("../utils/app-error");
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/bmp", "image/heif", "image/heic"];
exports.uploadImages = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 8
    },
    fileFilter: (_request, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new app_error_1.AppError("Only JPEG, PNG, WebP, JPG, GIF, BMP, HEIF, and HEIC images are allowed", 400));
        }
        callback(null, true);
    }
}).array("images", 8);
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});
