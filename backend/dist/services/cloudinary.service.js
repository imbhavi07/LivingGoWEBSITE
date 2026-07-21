"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.uploadPanorama = uploadPanorama;
exports.uploadMany = uploadMany;
exports.uploadManyPanoramas = uploadManyPanoramas;
exports.deleteCloudinaryImage = deleteCloudinaryImage;
const stream_1 = require("stream");
const cloudinary_1 = require("../config/cloudinary");
const heic_converter_1 = require("../utils/heic-converter");
async function uploadImage(file) {
    let uploadBuffer = file.buffer;
    if (file.mimetype === "image/heic" ||
        file.mimetype === "image/heif" ||
        file.mimetype === "image/heic-sequence") {
        console.log("Converting HEIC to JPEG...");
        uploadBuffer = await (0, heic_converter_1.convertHeicToJpeg)(file);
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: "LivingGo/properties",
            resource_type: "image",
            chunk_size: 60000000,
            format: "webp",
            transformation: [
                {
                    quality: "auto:good",
                    fetch_format: "auto",
                },
            ],
        }, (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Stream Error:", error);
                let message = "Unknown error from Cloudinary";
                if (typeof error === "string") {
                    message = error;
                }
                else if (error !== null &&
                    typeof error === "object" &&
                    "message" in error) {
                    message = String(error.message);
                }
                return reject(new Error(message));
            }
            if (!result) {
                return reject(new Error("Cloudinary returned no result"));
            }
            resolve(result);
        });
        stream_1.Readable.from(uploadBuffer).pipe(stream);
    });
}
async function uploadPanorama(file) {
    let uploadBuffer = file.buffer;
    if (file.mimetype === "image/heic" ||
        file.mimetype === "image/heif" ||
        file.mimetype === "image/heic-sequence") {
        console.log("Converting HEIC to JPEG...");
        uploadBuffer = await (0, heic_converter_1.convertHeicToJpeg)(file);
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: "LivingGo/panoramas",
            resource_type: "image",
            chunk_size: 60000000,
            format: "webp",
            transformation: [
                {
                    width: 6000,
                    height: 3000,
                    crop: "limit",
                    quality: "auto:good",
                    fetch_format: "auto",
                },
            ],
        }, (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Stream Error:", error);
                let message = "Unknown error from Cloudinary";
                if (typeof error === "string") {
                    message = error;
                }
                else if (error !== null &&
                    typeof error === "object" &&
                    "message" in error) {
                    message = String(error.message);
                }
                return reject(new Error(message));
            }
            if (!result) {
                return reject(new Error("Cloudinary returned no result"));
            }
            resolve(result);
        });
        stream_1.Readable.from(uploadBuffer).pipe(stream);
    });
}
async function uploadMany(files = []) {
    return Promise.all(files.map(uploadImage));
}
async function uploadManyPanoramas(files = []) {
    return Promise.all(files.map(uploadPanorama));
}
async function deleteCloudinaryImage(publicId) {
    return cloudinary_1.cloudinary.uploader.destroy(publicId);
}
