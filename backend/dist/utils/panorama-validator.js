"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePanorama = validatePanorama;
const sharp_1 = __importDefault(require("sharp"));
const app_error_1 = require("./app-error");
async function validatePanorama(file) {
    const metadata = await (0, sharp_1.default)(file.buffer).metadata();
    if (!metadata.width || !metadata.height) {
        throw new app_error_1.AppError("Invalid image", 400);
    }
    if (metadata.width !== metadata.height * 2) {
        throw new app_error_1.AppError("Panorama must be 2:1 aspect ratio", 400);
    }
}
