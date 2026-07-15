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
exports.deleteAdminReview = exports.createAdminReview = exports.deletePropertyImage = exports.replacePropertyImage = exports.addPropertyImages = exports.getAdminCoupons = exports.getAllProperties = exports.updateListing = exports.rejectOwner = exports.approveOwner = exports.getPropertyManagement = exports.getUserProperties = exports.getOwnerApprovalById = exports.getOwnerApprovals = exports.deleteUser = exports.suspendUser = exports.getUsers = exports.removeListing = exports.rejectListing = exports.approveListing = exports.getListingDetails = exports.getListings = exports.getStats = void 0;
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
exports.getListingDetails = (0, async_handler_1.asyncHandler)(async (request, response) => {
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
    const id = String(request.params.id); // ← was request.params (bug fix from earlier)
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
// ← NEW: full property management detail
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
    // The uploadImages middleware will populate request.files
    const files = request.files ?? [];
    // The non-file fields are in request.body
    const data = request.body;
    // Update the property with the non-file fields
    const updated = await adminService.updateListingByAdmin(id, data);
    // If there are new files, upload them and add to the property
    if (files.length) {
        const uploads = await Promise.all(files.map(cloudinary_service_1.uploadImage));
        const imagesToAdd = uploads.map(u => ({
            url: u.secure_url,
            publicId: u.public_id
        }));
        await adminService.addImagesToProperty(id, imagesToAdd);
        // Refetch the property to get the updated images
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
    // Get all coupons with basic info and affiliateId
    const coupons = await prisma_1.prisma.coupon.findMany({
        select: {
            id: true,
            code: true,
            affiliateId: true,
        }
    });
    // For each coupon, get the partner name and count visits
    const couponsWithStats = await Promise.all(coupons.map(async (coupon) => {
        let partnerName = "Unknown";
        if (coupon.affiliateId) {
            const partner = await prisma_1.prisma.user.findUnique({
                where: { id: coupon.affiliateId },
                select: { name: true }
            });
            partnerName = partner?.name || "Unknown";
        }
        // Count total visits for this coupon
        const totalVisits = await prisma_1.prisma.visit.count({
            where: {
                couponCode: coupon.code
            }
        });
        // Count converted bookings (visits with leadStatus FULLY_BOOKED)
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
        publicId: u.public_id,
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
    const uploaded = await (0, cloudinary_service_1.uploadImage)(file);
    if (existing.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(existing.publicId);
    }
    const result = await adminService.replacePropertyImage(imageId, uploaded.secure_url, uploaded.public_id);
    res.json(result);
});
exports.deletePropertyImage = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const imageId = String(req.params.imageId);
    const image = await prisma_1.prisma.propertyImage.findUnique({
        where: { id: imageId },
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
// NEW: Admin review creation endpoint
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
    // Create admin-generated review mapping to your exact schema
    const review = await prisma_1.prisma.review.create({
        // Cast to any because the generated Prisma type may differ from
        // the runtime shape we want to persist for admin-generated reviews.
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
// NEW: Admin review deletion endpoint
exports.deleteAdminReview = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const { id } = request.params;
    const reviewId = String(id);
    // Verify review exists
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
