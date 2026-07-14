"use strict";
// backend/src/routes/property.routes.ts  (FULL REPLACEMENT)
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
exports.propertyRouter = void 0;
const express_1 = require("express");
const propertyController = __importStar(require("../controllers/property.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const property_validation_1 = require("../validations/property.validation");
exports.propertyRouter = (0, express_1.Router)();
// Public routes
exports.propertyRouter.get("/", (0, validate_middleware_1.validate)(property_validation_1.listPropertiesSchema), propertyController.getProperties);
// ← NEW: dropdown list for "existing tenant" selector (no auth needed)
exports.propertyRouter.get("/list", propertyController.getApprovedPropertyList);
// 🔥 NEW: Featured route (Must be above /:id)
exports.propertyRouter.get("/featured", propertyController.getFeaturedProperties);
// Get current user's properties (owner/dashboard route)
exports.propertyRouter.get("/my-properties", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner"), propertyController.getOwnerProperties);
// === ACTION ROUTES (placed above GET/:id to avoid interception) ===
// Toggle property status (PATCH /:id/status)
exports.propertyRouter.patch("/:id/status", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner", "admin"), propertyController.togglePropertyStatus);
// Delete property (DELETE /:id)
exports.propertyRouter.delete("/:id", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner", "admin"), (0, validate_middleware_1.validate)(property_validation_1.propertyIdSchema), propertyController.deleteProperty);
// Get single property by ID (GET /:id)
exports.propertyRouter.get("/:id", (0, validate_middleware_1.validate)(property_validation_1.propertyIdSchema), propertyController.getPropertyById);
// Owner / admin routes
exports.propertyRouter.post("/", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner", "admin"), upload_middleware_1.uploadImages, (0, validate_middleware_1.validate)(property_validation_1.createPropertySchema), propertyController.createProperty);
exports.propertyRouter.put("/:id", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner", "admin"), (0, validate_middleware_1.validate)(property_validation_1.updatePropertySchema), propertyController.updateProperty);
// Student routes
exports.propertyRouter.post("/:id/review", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("student"), (0, validate_middleware_1.validate)(property_validation_1.createReviewSchema), propertyController.createReview);
exports.propertyRouter.post("/:id/residence", auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("student"), (0, validate_middleware_1.validate)(property_validation_1.markResidenceSchema), propertyController.markResidence);
