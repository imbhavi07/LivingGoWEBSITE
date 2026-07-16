"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.uploadPanorama = uploadPanorama;
exports.uploadMany = uploadMany;
exports.uploadManyPanoramas = uploadManyPanoramas;
exports.deleteCloudinaryImage = deleteCloudinaryImage;
const stream_1 = require("stream");
const cloudinary_1 = require("../config/cloudinary");
async function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: "LivingGo/properties",
            resource_type: "image",
            chunk_size: 60000000,
            transformation: [
                {
                    quality: "auto:good",
                    format: "jpg"
                }
            ]
        }, (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Stream Error:", error);
                let message = 'Unknown error from Cloudinary';
                if (typeof error === 'string') {
                    message = error;
                }
                else if (error !== null && typeof error === 'object' && 'message' in error) {
                    message = String(error.message);
                }
                else {
                    try {
                        message = JSON.stringify(error);
                    }
                    catch {
                        message = String(error);
                    }
                }
                return reject(new Error(message));
            }
            if (!result) {
                return reject(new Error("Cloudinary returned no result"));
            }
            resolve(result);
        });
        stream_1.Readable.from(file.buffer).pipe(stream);
    });
}
async function uploadPanorama(file) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: "LivingGo/panoramas",
            resource_type: "image",
            chunk_size: 0,
            transformation: [
                {
                    width: 6000,
                    height: 3000,
                    crop: "limit",
                    quality: "auto:good",
                    fetch_format: "webp"
                }
            ]
        }, (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Stream Error:", error);
                let message = 'Unknown error from Cloudinary';
                if (typeof error === 'string') {
                    message = error;
                }
                else if (error !== null && typeof error === 'object' && 'message' in error) {
                    message = String(error.message);
                }
                else {
                    try {
                        message = JSON.stringify(error);
                    }
                    catch {
                        message = String(error);
                    }
                }
                return reject(new Error(message));
            }
            if (!result) {
                return reject(new Error("Cloudinary returned no result"));
            }
            resolve(result);
        });
        stream_1.Readable.from(file.buffer).pipe(stream);
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
