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
exports.replacePropertyImage = exports.deletePropertyImage = exports.addPropertyImages = exports.updateListing = exports.rejectOwner = exports.approveOwner = exports.getUserProperties = exports.getOwnerApprovalById = exports.getOwnerApprovals = exports.deleteUser = exports.suspendUser = exports.getUsers = exports.removeListing = exports.rejectListing = exports.approveListing = exports.getListingDetails = exports.getListings = exports.getStats = void 0;
const async_handler_1 = require("../utils/async-handler");
const adminService = __importStar(require("../services/admin.service"));
const property_service_1 = require("../services/property.service");
const ownerVerificationService = __importStar(require("../services/owner-verification.service"));
const backend_1 = require("@clerk/backend");
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const property_service_2 = require("../services/property.service");
const cloudinary_service_1 = require("../services/cloudinary.service");
const clerkClient = (0, backend_1.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY,
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
    // Attach ratings to each property
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
exports.approveOwner = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    // 1. Update DB via service
    const result = await ownerVerificationService.reviewOwnerApproval(id, "approved");
    // 2. Fetch clerkId from DB
    const owner = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: { clerkId: true },
    });
    // 3. Update Clerk metadata so middleware sees role: "owner"
    if (owner?.clerkId) {
        await clerkClient.users.updateUserMetadata(owner.clerkId, {
            publicMetadata: {
                role: "owner",
                verificationStatus: "approved",
            },
        });
    }
    // 4. Send response
    response.json(result);
});
exports.rejectOwner = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    // 1. Update DB via service
    const result = await ownerVerificationService.reviewOwnerApproval(id, "rejected");
    // 2. Fetch clerkId from DB
    const owner = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: { clerkId: true },
    });
    // 3. Update Clerk metadata on rejection too
    if (owner?.clerkId) {
        await clerkClient.users.updateUserMetadata(owner.clerkId, {
            publicMetadata: {
                role: "owner",
                verificationStatus: "rejected",
            },
        });
    }
    // 4. Send response
    response.json(result);
});
exports.updateListing = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const id = String(request.params.id);
    const result = await adminService.updateListingByAdmin(id, request.body);
    response.json(result);
});
exports.addPropertyImages = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const propertyId = String(request.params.id);
    const files = request.files ?? [];
    const uploads = await (0, cloudinary_service_1.uploadMany)(files);
    const result = await adminService.addImagesToProperty(propertyId, uploads.map((u) => ({
        url: u.secure_url,
        publicId: u.public_id,
    })));
    response.json(result);
});
exports.deletePropertyImage = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const imageId = String(request.params.imageId);
    await adminService.deletePropertyImage(imageId);
    response.json({
        success: true
    });
});
exports.replacePropertyImage = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const imageId = String(request.params.imageId);
    const file = request.files?.[0];
    if (!file) {
        throw new app_error_1.AppError("Image is required", 400);
    }
    const uploads = await (0, cloudinary_service_1.uploadMany)([file]);
    const upload = uploads[0];
    const result = await adminService.replacePropertyImage(imageId, upload.secure_url, upload.public_id);
    response.json(result);
});
