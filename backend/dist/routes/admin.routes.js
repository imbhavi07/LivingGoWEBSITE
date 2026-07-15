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
exports.adminRouter = void 0;
const express_1 = require("express");
const adminController = __importStar(require("../controllers/admin.controller"));
const authController = __importStar(require("../controllers/auth.controller"));
const propertyController = __importStar(require("../controllers/property.controller"));
const couponController = __importStar(require("../controllers/coupon.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const security_middleware_1 = require("../middleware/security.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const admin_validation_1 = require("../validations/admin.validation");
const auth_validation_1 = require("../validations/auth.validation");
const upload_middleware_1 = require("../middleware/upload.middleware");
const property_validation_1 = require("../validations/property.validation");
const property_validation_2 = require("../validations/property.validation");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/auth/login", security_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_validation_1.loginSchema), authController.adminLogin);
exports.adminRouter.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"));
exports.adminRouter.get("/dashboard/stats", adminController.getStats);
exports.adminRouter.get("/listings", (0, validate_middleware_1.validate)(admin_validation_1.adminListSchema), adminController.getListings);
exports.adminRouter.get("/properties/:id", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.getAdminPropertyByIdController);
exports.adminRouter.patch("/listings/:id/approve", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.approveListing);
exports.adminRouter.patch("/listings/:id/reject", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.rejectListing);
exports.adminRouter.delete("/listings/:id", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.removeListing);
exports.adminRouter.patch("/listings/:id", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.updateListing);
exports.adminRouter.get("/users", (0, validate_middleware_1.validate)(admin_validation_1.adminUserListSchema), adminController.getUsers);
exports.adminRouter.patch("/users/:id/suspend", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.suspendUser);
exports.adminRouter.delete("/users/:id", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.deleteUser);
exports.adminRouter.get("/users/:id/properties", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.getUserProperties);
exports.adminRouter.get("/approvals", adminController.getOwnerApprovals);
exports.adminRouter.get("/approvals/:id", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.getOwnerApprovalById);
exports.adminRouter.patch("/approvals/:id/approve", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.approveOwner);
exports.adminRouter.patch("/approvals/:id/reject", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.rejectOwner);
exports.adminRouter.get("/properties", adminController.getAllProperties);
exports.adminRouter.get("/properties/:id/manage", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.getPropertyManagement);
// NEW: Admin property creation endpoint
exports.adminRouter.post("/properties", upload_middleware_1.uploadImages, (0, validate_middleware_1.validate)(property_validation_2.createPropertySchema), propertyController.createProperty);
// NEW: Admin coupon creation endpoint
exports.adminRouter.post("/coupons", couponController.createCoupon);
// NEW: Admin review endpoints
exports.adminRouter.post("/properties/:id/reviews", (0, validate_middleware_1.validate)(property_validation_1.propertyIdSchema), adminController.createAdminReview);
exports.adminRouter.delete("/reviews/:id", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.deleteAdminReview);
// Image management routes for properties
exports.adminRouter.patch("/properties/:id", upload_middleware_1.uploadImages, (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.updateListing);
exports.adminRouter.post("/properties/:id/images", upload_middleware_1.uploadImages, adminController.addPropertyImages);
exports.adminRouter.put("/properties/:id/images/:imageId", upload_middleware_1.uploadImages, adminController.replacePropertyImage);
exports.adminRouter.delete("/properties/:id/images/:imageId", (0, validate_middleware_1.validate)(admin_validation_1.adminIdSchema), adminController.deletePropertyImage);
