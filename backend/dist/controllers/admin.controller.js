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
exports.replacePanoramaImage = exports.deletePanorama = exports.updatePanorama = exports.addPanoramaController = exports.deleteAdminReview = exports.createAdminReview = exports.deletePropertyImage = exports.replacePropertyImage = exports.addPropertyImages = exports.getAdminCoupons = exports.getAllProperties = exports.updateListing = exports.rejectOwner = exports.approveOwner = exports.getPropertyManagement = exports.getUserProperties = exports.getOwnerApprovalById = exports.getOwnerApprovals = exports.deleteUser = exports.suspendUser = exports.getUsers = exports.removeListing = exports.rejectListing = exports.approveListing = exports.getAdminPropertyByIdController = exports.getListings = exports.getStats = void 0;
const async_handler_1 = require("../utils/async-handler");
const adminService = __importStar(require("../services/admin.service"));
const property_service_1 = require("../services/property.service");
const ownerVerificationService = __importStar(require("../services/owner-verification.service"));
const backend_1 = require("@clerk/backend");
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const property_service_2 = require("../services/property.service");
const cloudinary_service_1 = require("../services/cloudinary.service");
const zod_1 = require("zod");
const clerkClient = (0, backend_1.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY,
});
// Validation schema for admin-created review
const createAdminReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentName: zod_1.z.string().min(1).max(100),
        rating: zod_1.z.number().min(1).max(5),
        content: zod_1.z.string().min(1).max(2000)
    })
});
exports.getStats = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    response.json(await adminService.getAdminStats());
});
exports.getListings = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await adminService.getSubmittedProperties(request.query));
});
exports.getAdminPropertyByIdController = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await (0, property_service_1.getPropertyById)(String(request.params.id), "admin"));
});
exports.approveListing = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await adminService.moderateProperty(String(request.params.id), "approved"));
});
exports.rejectListing = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await adminService.moderateProperty(String(request.params.id), "rejected"));
});
exports.removeListing = (0, async_handler_1.asyncHandler)(async (request, response) => {
    await adminService.removeListing(String(request.params.id));
    response.status(204).send();
});
exports.getUsers = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await adminService.getUsers(request.query));
});
exports.suspendUser = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await adminService.updateUserStatus(String(request.params.id), "suspended"));
});
exports.deleteUser = (0, async_handler_1.asyncHandler)(async (request, response) => {
    await adminService.deleteSpamUser(String(request.params.id));
    response.status(204).send();
});
exports.getOwnerApprovals = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    response.json(await ownerVerificationService.getPendingOwnerApprovals());
});
exports.getOwnerApprovalById = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await ownerVerificationService.getPendingOwnerApprovalById(String(request.params.id)));
});
exports.getUserProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            verificationStatus: true,
            createdAt: true,
            properties: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    status: true,
                    price: true,
                    occupiedBeds: true,
                    bedsSingle: true,
                    bedsDouble: true,
                    bedsTriple: true,
                    createdAt: true,
                    _count: { select: { reviews: true, tenants: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!user)
        throw new app_error_1.AppError("User not found", 404);
    const propertiesWithRatings = await Promise.all(user.properties.map(async (property) => {
        const rating = await (0, property_service_2.getPropertyRating)(property.id);
        const totalBeds = (property.bedsSingle ?? 0) +
            (property.bedsDouble ?? 0) +
            (property.bedsTriple ?? 0);
        return {
            ...property,
            totalBeds,
            availableBeds: Math.max(0, totalBeds - property.occupiedBeds),
            rating,
        };
    }));
    response.json({ user, properties: propertiesWithRatings });
});
exports.getPropertyManagement = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    const property = await adminService.getPropertyManagement(id);
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    response.json(property);
});
exports.approveOwner = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    const result = await ownerVerificationService.reviewOwnerApproval(id, "approved");
    const owner = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: { clerkId: true },
    });
    if (owner?.clerkId) {
        await clerkClient.users.updateUserMetadata(owner.clerkId, {
            publicMetadata: {
                role: "owner",
                verificationStatus: "approved",
            },
        });
    }
    response.json(result);
});
exports.rejectOwner = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    const result = await ownerVerificationService.reviewOwnerApproval(id, "rejected");
    const owner = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: { clerkId: true },
    });
    if (owner?.clerkId) {
        await clerkClient.users.updateUserMetadata(owner.clerkId, {
            publicMetadata: {
                role: "owner",
                verificationStatus: "rejected",
            },
        });
    }
    response.json(result);
});
exports.updateListing = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    const files = request.files ?? [];
    const data = request.body;
    const updated = await adminService.updateListingByAdmin(id, data);
    if (files.length) {
        const uploads = await Promise.all(files.map(cloudinary_service_1.uploadImage));
        const imagesToAdd = uploads.map(u => ({
            url: u.secure_url,
            publicId: u.public_id
        }));
        await adminService.addImagesToProperty(id, imagesToAdd);
        const refreshed = await (0, property_service_1.getPropertyById)(id);
        response.json(refreshed);
    }
    else {
        response.json(updated);
    }
});
exports.getAllProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    response.json(await adminService.getAllProperties(request.query));
});
exports.getAdminCoupons = (0, async_handler_1.asyncHandler)(async (_request, response) => {
    const coupons = await prisma_1.prisma.coupon.findMany({
        select: {
            id: true,
            code: true,
            affiliateId: true,
        }
    });
    const couponsWithStats = await Promise.all(coupons.map(async (coupon) => {
        let partnerName = "Unknown";
        if (coupon.affiliateId) {
            const partner = await prisma_1.prisma.user.findUnique({
                where: { id: coupon.affiliateId },
                select: { name: true }
            });
            partnerName = partner?.name || "Unknown";
        }
        const totalVisits = await prisma_1.prisma.visit.count({
            where: {
                couponCode: coupon.code
            }
        });
        const convertedBookingsCount = await prisma_1.prisma.visit.count({
            where: {
                couponCode: coupon.code,
                leadStatus: {
                    equals: "FULLY_BOOKED"
                }
            }
        });
        return {
            id: coupon.id,
            partnerName,
            couponCode: coupon.code,
            totalVisits,
            totalConvertedBookings: convertedBookingsCount
        };
    }));
    response.json(couponsWithStats);
});
exports.addPropertyImages = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const propertyId = String(req.params.id);
    const files = req.files ?? [];
    if (!files.length) {
        throw new app_error_1.AppError("No images uploaded", 400);
    }
    const uploads = await Promise.all(files.map(cloudinary_service_1.uploadImage));
    const result = await adminService.addImagesToProperty(propertyId, uploads.map((u) => ({
        url: u.secure_url,
        publicId: u.public_id
    })));
    res.json(result);
});
exports.replacePropertyImage = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const imageId = String(req.params.imageId);
    const file = req.files?.[0];
    if (!file) {
        throw new app_error_1.AppError("Image required", 400);
    }
    const existing = await prisma_1.prisma.propertyImage.findUnique({
        where: { id: imageId },
    });
    if (!existing) {
        throw new app_error_1.AppError("Image not found", 404);
    }
    // FIXED: Changed uploadPanorama to uploadImage
    const uploaded = await (0, cloudinary_service_1.uploadImage)(file);
    if (existing.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(existing.publicId);
    }
    const result = await adminService.replacePropertyImage(imageId, uploaded.secure_url, uploaded.public_id);
    res.json(result);
});
exports.deletePropertyImage = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const propertyId = String(req.params.id);
    const imageId = String(req.params.imageId);
    const image = await prisma_1.prisma.propertyImage.findUnique({
        where: { id: imageId, propertyId },
    });
    if (!image) {
        throw new app_error_1.AppError("Image not found", 404);
    }
    if (image.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(image.publicId);
    }
    await adminService.deletePropertyImage(imageId);
    res.status(204).send();
});
exports.createAdminReview = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const propertyId = String(id);
    const { studentName, rating, content } = req.body;
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: propertyId }
    });
    if (!property) {
        throw new app_error_1.AppError("Property not found", 404);
    }
    const review = await prisma_1.prisma.review.create({
        data: {
            propertyId,
            studentName,
            isAdminGenerated: true,
            content: content,
            cleanliness: Number(rating),
            food: Number(rating),
            security: Number(rating),
            management: Number(rating),
            location: Number(rating),
        },
    });
    res.status(201).json(review);
});
exports.deleteAdminReview = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const { id } = request.params;
    const reviewId = String(id);
    const review = await prisma_1.prisma.review.findUnique({
        where: { id: reviewId }
    });
    if (!review) {
        throw new app_error_1.AppError("Review not found", 404);
    }
    await prisma_1.prisma.review.delete({
        where: { id: reviewId }
    });
    response.status(204).send();
});
const addPanoramaController = async (req, res) => {
    console.log("1. Reached addPanoramaController");
    try {
        const propertyId = String(req.params.id);
        console.log("2. Property ID:", propertyId);
        const file = req.file;
        console.log("3. File received:", file ? { filename: file.originalname, size: file.size, mimetype: file.mimetype } : "undefined");
        if (!file) {
            console.log("4. No file provided");
            return res.status(400).json({ success: false, message: "Panorama image is required" });
        }
        console.log("5. Starting cloud upload...");
        // FIXED: Changed uploadImage to uploadPanorama
        const uploaded = await (0, cloudinary_service_1.uploadPanorama)(file);
        console.log("6. Cloud upload successful. URL:", uploaded.secure_url);
        const { title, sortOrder } = req.body;
        console.log("7. Request body:", { title, sortOrder });
        const panorama = await prisma_1.prisma.propertyPanorama.create({
            data: {
                propertyId,
                title,
                imageUrl: uploaded.secure_url,
                publicId: uploaded.public_id,
                sortOrder: sortOrder ? Number(sortOrder) : 0,
            },
        });
        console.log("8. Panorama saved to Prisma:", panorama.id);
        console.log("9. Sending success response");
        return res.status(201).json({ success: true, data: panorama });
    }
    catch (error) {
        console.error("10. Error in addPanoramaController:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ success: false, message: "Upload failed", error: message });
    }
};
exports.addPanoramaController = addPanoramaController;
exports.updatePanorama = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const panoramaId = String(req.params.panoramaId);
    const { title, sortOrder } = req.body;
    const panorama = await prisma_1.prisma.propertyPanorama.update({
        where: { id: panoramaId },
        data: {
            title,
            sortOrder: sortOrder ? Number(sortOrder) : undefined,
        },
    });
    res.json(panorama);
});
exports.deletePanorama = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const panoramaId = String(req.params.panoramaId);
    const panorama = await prisma_1.prisma.propertyPanorama.findUnique({
        where: { id: panoramaId },
    });
    if (!panorama) {
        throw new app_error_1.AppError("Panorama not found", 404);
    }
    if (panorama.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(panorama.publicId);
    }
    await prisma_1.prisma.propertyPanorama.delete({
        where: { id: panoramaId },
    });
    res.status(204).send();
});
exports.replacePanoramaImage = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const panoramaId = String(req.params.panoramaId);
    const file = req.file;
    if (!file) {
        throw new app_error_1.AppError("Panorama image is required", 400);
    }
    const panorama = await prisma_1.prisma.propertyPanorama.findUnique({
        where: { id: panoramaId },
    });
    if (!panorama) {
        throw new app_error_1.AppError("Panorama not found", 404);
    }
    // Upload new image
    const uploaded = await (0, cloudinary_service_1.uploadImage)(file);
    if (panorama.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(panorama.publicId);
    }
    const updatedPanorama = await prisma_1.prisma.propertyPanorama.update({
        where: { id: panoramaId },
        data: {
            imageUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
        },
    });
    res.json(updatedPanorama);
});
// ✅ FIXED: Removed the fake uploadPanorama function completely!
