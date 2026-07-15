import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as authController from "../controllers/auth.controller";
import * as propertyController from "../controllers/property.controller";
import * as couponController from "../controllers/coupon.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/security.middleware";
import { validate } from "../middleware/validate.middleware";
import { adminIdSchema, adminListSchema, adminUserListSchema } from "../validations/admin.validation";
import { loginSchema } from "../validations/auth.validation";
import { uploadImages, upload } from "../middleware/upload.middleware";
import { propertyIdSchema } from "../validations/property.validation";
import { createPropertySchema } from "../validations/property.validation";

export const adminRouter = Router();
const adminAuth = [authenticate, authorize("admin")];
adminRouter.post('/properties/:id/panoramas', ...adminAuth, upload.single('image'), adminController.addPanoramaController);

adminRouter.post("/auth/login", authLimiter, validate(loginSchema), authController.adminLogin);

adminRouter.use(authenticate, authorize("admin"));
adminRouter.get("/dashboard/stats", adminController.getStats);
adminRouter.get("/listings", validate(adminListSchema), adminController.getListings);
adminRouter.get("/properties/:id", validate(adminIdSchema), adminController.getAdminPropertyByIdController);
adminRouter.patch("/listings/:id/approve", validate(adminIdSchema), adminController.approveListing);
adminRouter.patch("/listings/:id/reject", validate(adminIdSchema), adminController.rejectListing);
adminRouter.delete("/listings/:id", validate(adminIdSchema), adminController.removeListing);
adminRouter.patch("/listings/:id", validate(adminIdSchema), adminController.updateListing);
adminRouter.get("/users", validate(adminUserListSchema), adminController.getUsers);
adminRouter.patch("/users/:id/suspend", validate(adminIdSchema), adminController.suspendUser);
adminRouter.delete("/users/:id", validate(adminIdSchema), adminController.deleteUser);
adminRouter.get("/users/:id/properties", validate(adminIdSchema), adminController.getUserProperties);
adminRouter.get("/approvals", adminController.getOwnerApprovals);
adminRouter.get("/approvals/:id", validate(adminIdSchema), adminController.getOwnerApprovalById);
adminRouter.patch("/approvals/:id/approve", validate(adminIdSchema), adminController.approveOwner);
adminRouter.patch("/approvals/:id/reject", validate(adminIdSchema), adminController.rejectOwner);
adminRouter.get("/properties", adminController.getAllProperties);
adminRouter.get("/properties/:id/manage", validate(adminIdSchema), adminController.getPropertyManagement);
// NEW: Admin property creation endpoint
adminRouter.post("/properties", uploadImages, validate(createPropertySchema), propertyController.createProperty);
// NEW: Admin coupon creation endpoint
adminRouter.post("/coupons", couponController.createCoupon);

// NEW: Admin review endpoints
adminRouter.post("/properties/:id/reviews", validate(propertyIdSchema), adminController.createAdminReview);
adminRouter.delete("/reviews/:id", validate(adminIdSchema), adminController.deleteAdminReview);

// Image management routes for properties
adminRouter.patch("/properties/:id", uploadImages, validate(adminIdSchema), adminController.updateListing);
adminRouter.post("/properties/:id/images", uploadImages, adminController.addPropertyImages);
adminRouter.put("/properties/:id/images/:imageId", uploadImages, adminController.replacePropertyImage);
adminRouter.delete("/properties/:id/images/:imageId", validate(adminIdSchema), adminController.deletePropertyImage);

// Panorama routes
adminRouter.put("/properties/panoramas/:panoramaId", adminController.updatePanorama);
adminRouter.delete("/properties/panoramas/:panoramaId", adminController.deletePanorama);
adminRouter.put("/properties/panoramas/:panoramaId/image", upload.single('image'), adminController.replacePanoramaImage);