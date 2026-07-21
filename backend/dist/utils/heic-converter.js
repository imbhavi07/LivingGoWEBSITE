"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHeicToJpeg = convertHeicToJpeg;
const heic_convert_1 = __importDefault(require("heic-convert"));
async function convertHeicToJpeg(file) {
    const outputBuffer = await (0, heic_convert_1.default)({
        buffer: file.buffer,
        format: "JPEG",
        quality: 0.9,
    });
    return Buffer.from(outputBuffer);
}
