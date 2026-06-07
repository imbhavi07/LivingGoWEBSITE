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
exports.togglePropertyStatus = exports.deleteProperty = exports.updateProperty = exports.getOwnerStats = exports.getOwnerProperties = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const cloudinary_service_1 = require("../services/cloudinary.service");
const propertyService = __importStar(require("../services/property.service"));
const prisma_1 = require("../config/prisma");
function requireUser(request) {
    if (!request.user)
        throw new app_error_1.AppError("Authentication required", 401);
    return request.user;
}
exports.createProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    let userId;
    if (request.user) {
        userId = request.user.id;
    }
    else {
        // Clerk user — find by email
        const clerkEmail = request.body.clerkEmail;
        if (!clerkEmail)
            throw new app_error_1.AppError("Authentication required", 401);
        const owner = await prisma_1.prisma.user.findUnique({ where: { email: clerkEmail } });
        if (!owner)
            throw new app_error_1.AppError("Owner not found. Please sign up first.", 404);
        userId = owner.id;
    }
    const files = request.files ?? [];
    const uploads = await (0, cloudinary_service_1.uploadMany)(files);
    const property = await propertyService.createProperty(userId, request.body, uploads.map((upload) => ({ url: upload.secure_url, publicId: upload.public_id })));
    response.status(201).json(property);
});
exports.getProperties = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const result = await propertyService.getProperties(request.query, request.user?.role);
    response.json(result);
});
exports.getPropertyById = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role);
    response.json(property);
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
    const property = await propertyService.updateProperty(String(request.params.id), user.id, user.role, request.body);
    response.json(property);
});
exports.deleteProperty = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    await propertyService.deleteProperty(String(request.params.id), user.id, user.role);
    response.status(204).send();
});
exports.togglePropertyStatus = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    const property = await propertyService.togglePropertyStatus(String(request.params.id), user.id, Boolean(request.body.isActive));
    response.json(property);
});
