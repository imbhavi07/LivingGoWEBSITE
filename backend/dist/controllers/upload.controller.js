"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPropertyImages = void 0;
const cloudinary_service_1 = require("../services/cloudinary.service");
const async_handler_1 = require("../utils/async-handler");
exports.uploadPropertyImages = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const files = request.files ?? [];
    const uploads = await (0, cloudinary_service_1.uploadMany)(files);
    response.status(201).json({
        images: uploads.map((upload) => ({
            url: upload.secure_url,
            publicId: upload.public_id
        }))
    });
});
