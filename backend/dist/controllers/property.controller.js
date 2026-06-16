"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markResidence = exports.createReview = exports.togglePropertyStatus = exports.deleteProperty = exports.updateProperty = exports.getOwnerStats = exports.getOwnerProperties = exports.getStudentResidence = exports.getApprovedPropertyList = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const cloudinary_service_1 = require("../services/cloudinary.service");
const propertyService = __importStar(require("../services/property.service"));
function requireUser(request) {
    if (!request.user)
        throw new app_error_1.AppError("Authentication required", 401);
    return request.user;
}
exports.createProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    // Only approved owners can list properties
    // admins bypass this check
    if (user.role === "owner" && user.verificationStatus !== "approved") {
        const statusMessages = {
            not_required: "Please complete your KYC verification before listing properties.",
            pending_email_verification: "Please verify your email before listing properties.",
            pending_approval: "Your KYC is under review. You can list properties once approved.",
            rejected: "Your KYC verification was rejected. Please contact support.",
        };
        const message = statusMessages[user.verificationStatus] ?? "KYC verification required.";
        throw new app_error_1.AppError(message, 403);
    }
    // Process image uploads through middleware
    const files = request.files ?? [];
    const uploads = await (0, cloudinary_service_1.uploadMany)(files);
    // Extract room-type mappings from request body
    // Expect format: roomTypeMappings=[{"index":0,"roomType":"Bedroom 1"},{"index":1,"roomType":"Bedroom 2"},...]
    const roomTypeMappings = request.body.roomTypeMappings
        ? JSON.parse(request.body.roomTypeMappings)
        : [];
    const property = await propertyService.createProperty(user.id, request.body, uploads.map((upload) => ({ url: upload.secure_url, publicId: upload.public_id })));
    response.status(201).json(property);
});
exports.getProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const result = await propertyService.getProperties(request.query, request.user?.role);
    response.json(result);
});
exports.getPropertyById = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role);
    const [rating, reviews] = await Promise.all([
        propertyService.getPropertyRating(String(request.params.id)),
        propertyService.getPropertyReviews(String(request.params.id)),
    ]);
    response.json({ ...property, rating, reviews });
});
exports.getApprovedPropertyList = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    const properties = await propertyService.getApprovedPropertyList();
    response.json(properties);
});
exports.getStudentResidence = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const residence = await propertyService.getStudentResidence(user.id);
    response.json(residence ?? null);
});
exports.getOwnerProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const result = await propertyService.getOwnerProperties(user.id, request.query);
    response.json(result);
});
exports.getOwnerStats = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    response.json(await propertyService.getOwnerStats(user.id));
});
exports.updateProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role);
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (user.role !== "admin" && property.ownerId !== user.id)
        throw new app_error_1.AppError("Forbidden", 403);
    // Process image uploads if any new files were provided
    let roomTypeMappings = [];
    let images = [];
    if (request.files?.length) {
        const files = request.files ?? [];
        const rawUploads = await (0, cloudinary_service_1.uploadMany)(files);
        images = rawUploads.map(upload => ({ url: upload.secure_url, publicId: upload.public_id }));
        // Extract room-type mappings from request body
        roomTypeMappings = request.body.roomTypeMappings
            ? JSON.parse(request.body.roomTypeMappings)
            : [];
    }
    const updatedProperty = await propertyService.updateProperty(String(request.params.id), user.id, user.role, {
        ...request.body,
        // Include uploads and mappings if new files were provided
        ...(images.length > 0 ? {
            images: { create: images },
            roomTypeMappings: roomTypeMappings
        } : {})
    });
    response.json(updatedProperty);
});
exports.deleteProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    await propertyService.deleteProperty(String(request.params.id), user.id, user.role);
    response.status(204).send();
});
exports.togglePropertyStatus = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const property = await propertyService.getPropertyById(String(request.params.id), user.role);
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (property.ownerId !== user.id)
        throw new app_error_1.AppError("Forbidden", 403);
    return propertyService.togglePropertyStatus(String(request.params.id), user.id, Boolean(request.body.isActive));
});
exports.createReview = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const propertyId = String(request.params.id);
    const review = await propertyService.createReview(user.id, propertyId, request.body);
    response.status(201).json(review);
});
exports.markResidence = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const propertyId = String(request.params.id);
    const result = await propertyService.markResidence(user.id, propertyId);
    response.json({ success: true, ...result });
});
