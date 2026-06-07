"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.uploadMany = uploadMany;
const stream_1 = require("stream");
const cloudinary_1 = require("../config/cloudinary");
async function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: "LivingGo/properties",
            resource_type: "image"
        }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve(result);
        });
        stream_1.Readable.from(file.buffer).pipe(stream);
    });
}
async function uploadMany(files = []) {
    return Promise.all(files.map(uploadImage));
}
