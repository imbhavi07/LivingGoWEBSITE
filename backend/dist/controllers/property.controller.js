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
exports.getOwnerProperties = exports.getOwnerStats = exports.getFeaturedProperty = exports.markResidence = exports.createReview = exports.togglePropertyStatus = exports.deleteProperty = exports.updateProperty = exports.getStudentResidence = exports.getApprovedPropertyList = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const cloudinary_service_1 = require("../services/cloudinary.service");
const propertyService = __importStar(require("../services/property.service"));
const client_1 = require("@prisma/client");
// Create a Prisma client instance for DB operations in this controller
const db = new client_1.PrismaClient();
function requireUser(request) {
    if (!request.user) {
        if (!request.user)
            throw new app_error_1.AppError("Authentication required");
    }
    return request.user;
}
exports.createProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    // Verify user exists in Prisma database (protect against Clerk-Prisma desync)
    const dbUser = await db.user.findFirst({
        where: {
            OR: [
                { id: user.id },
                { clerkId: user.id }
            ]
        }
    });
    if (!dbUser) {
        console.error("Failed to map Clerk ID:", user.id);
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    if (user.role === "owner" && user.verificationStatus !== "approved") {
        const statusMessages = {
            not_required: "Please complete your KYC verification before listing properties.",
            pending_email_verification: "Please verify your email before listing properties.",
            pending_approval: "Your KYC is under review. You can list properties once approved.",
            rejected: "Your KYC validation was rejected. Please contact support.",
        };
        const message = statusMessages[user.verificationStatus] ?? "KYC verification required.";
        throw new app_error_1.AppError(message, 403);
    }
    // Process image uploads through middleware
    const files = request.files ?? [];
    console.log("FILES RECEIVED:", files.length);
    const uploads = await (0, cloudinary_service_1.uploadMany)(files);
    console.log("UPLOADS COMPLETED:", uploads.length);
    // Extract room-type mappings from request body
    // Expect format: roomTypeMappings=[{"index":0,"roomType":"Bedroom 1"},{"index":1,"roomType":"Bedroom 2"},{"index":1,"roomType":"Bedroom 2"},...]
    let roomTypeMappings = [];
    try {
        roomTypeMappings = request.body.roomTypeMappings
            ? JSON.parse(request.body.roomTypeMappings)
            : [];
    }
    catch (err) {
        console.error("roomTypeMappings parse failed", err);
        roomTypeMappings = [];
    }
    console.log("BODY", request.body);
    console.log("FILES", files.length);
    console.log("USER", user.id);
    // Wrap database operation in try/catch to prevent unhandled rejections
    try {
        const property = await propertyService.createProperty(dbUser.id, // Use the internal user id (CUID)
        request.body, uploads.map((upload, index) => ({
            url: upload.secure_url,
            publicId: upload.public_id,
            roomCategory: roomTypeMappings[index]?.roomCategory ?? "common",
        })));
        response.status(201).json(property);
    }
    catch (error) {
        console.error("Property Creation Error:", error);
        return response.status(500).json({ error: "Failed to create property. Please try again." });
    }
});
// backend/src/controllers/property.controller.ts
exports.getProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const result = await propertyService.getProperties(request.query, request.user?.role);
    // Map the items to ensure the 'images' key exists and convert HEIC URLs
    if (result && typeof result === 'object' && 'items' in result && Array.isArray(result.items)) {
        result.items = result.items.map((item) => ({
            ...item,
            images: item.images?.map((image) => {
                let url = image.url;
                // Cloudinary auto-format injection for HEIC images
                if (url.includes('/upload/')) {
                    url = url.replace('/upload/', '/upload/f_auto,q_auto/');
                }
                // Fallback extension replacement for HEIC
                url = url.replace(/\.heic$/i, '.jpg');
                return { ...image, url };
            }) || []
        }));
    }
    response.json(result);
});
exports.getPropertyById = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const propertyId = String(request.params.id);
    let internalUserId;
    if (request.user?.id) {
        const user = await db.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            console.error("Failed to map Clerk ID:", request.user.id);
            return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
        }
        internalUserId = user.id;
    }
    const property = await propertyService.getPropertyById(propertyId, request.user?.role, internalUserId);
    // Map the property to ensure the 'images' key exists and convert HEIC URLs
    const mappedProperty = {
        ...property,
        images: property.images?.map((image) => {
            let url = image.url;
            // Cloudinary auto-format injection for HEIC images
            if (url.includes('/upload/')) {
                url = url.replace('/upload/', '/upload/f_auto,q_auto/');
            }
            // Fallback extension replacement for HEIC
            url = url.replace(/\.heic$/i, '.jpg');
            return { ...image, url };
        }) || []
    };
    const [rating, reviews] = await Promise.all([
        propertyService.getPropertyRating(propertyId),
        propertyService.getPropertyReviews(propertyId),
    ]);
    response.json({ ...mappedProperty, rating, reviews });
});
exports.getApprovedPropertyList = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    const properties = await propertyService.getApprovedPropertyList();
    response.json(properties);
});
exports.getStudentResidence = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const residence = await propertyService.getStudentResidence(internalUser.id);
    response.json(residence ?? null);
});
exports.updateProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role, internalUser.id);
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (user.role !== "admin" && property.ownerId !== internalUser.id)
        throw new app_error_1.AppError("Forbidden", 403);
    // Process image uploads if any new files were provided
    let roomTypeMappings = [];
    let images = [];
    if (request.files?.length) {
        const files = request.files ?? [];
        const rawUploads = await (0, cloudinary_service_1.uploadMany)(files);
        images = rawUploads.map((upload, index) => ({
            url: upload.secure_url,
            publicId: upload.public_id,
            roomCategory: roomTypeMappings[index]?.roomCategory ?? "common",
        }));
        // Extract room-type mappings from request body
        roomTypeMappings = request.body.roomTypeMappings
            ? JSON.parse(request.body.roomTypeMappings)
            : [];
    }
    const updatedProperty = await propertyService.updateProperty(String(request.params.id), internalUser.id, user.role, {
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
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    await propertyService.deleteProperty(String(request.params.id), internalUser.id, user.role);
    response.status(204).send();
});
exports.togglePropertyStatus = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const property = await propertyService.getPropertyById(String(request.params.id), user.role, internalUser.id);
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (property.ownerId !== internalUser.id)
        throw new app_error_1.AppError("Forbidden", 403);
    return propertyService.togglePropertyStatus(String(request.params.id), internalUser.id, Boolean(request.body.isActive));
});
exports.createReview = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const propertyId = String(request.params.id);
    const review = await propertyService.createReview(internalUser.id, propertyId, request.body);
    response.status(201).json(review);
});
exports.markResidence = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const propertyId = String(request.params.id);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const result = await propertyService.markResidence(internalUser.id, propertyId);
    return response.json({ success: true, ...result });
});
exports.getFeaturedProperty = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    const property = await propertyService.getFeaturedProperty();
    if (!property) {
        throw new app_error_1.AppError("No featured property found", 404);
    }
    // Fetch rating and reviews so the featured card can display them
    const [rating, reviews] = await Promise.all([
        propertyService.getPropertyRating(property.id),
        propertyService.getPropertyReviews(property.id),
    ]);
    return response.json({ ...property, rating, reviews });
});
exports.getOwnerStats = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const stats = await propertyService.getOwnerStats(internalUser.id);
    response.json(stats);
});
exports.getOwnerProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!internalUser) {
        return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    const result = await propertyService.getOwnerProperties(internalUser.id, request.query);
    // Map the items to ensure the 'images' key exists and convert HEIC URLs
    if (result && typeof result === 'object' && 'items' in result && Array.isArray(result.items)) {
        result.items = result.items.map((item) => ({
            ...item,
            images: item.images?.map((image) => {
                let url = image.url;
                // Cloudinary auto-format injection for HEIC images
                if (url.includes('/upload/')) {
                    url = url.replace('/upload/', '/upload/f_auto,q_auto/');
                }
                // Fallback extension replacement for HEIC
                url = url.replace(/\.heic$/i, '.jpg');
                return { ...image, url };
            }) || []
        }));
    }
    response.json(result);
});
