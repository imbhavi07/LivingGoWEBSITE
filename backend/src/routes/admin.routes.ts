import { NextFunction, Router, Request, Response } from "express";
import * as adminController from "../controllers/admin.controller";
import * as authController from "../controllers/auth.controller";
import * as couponController from "../controllers/coupon.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/security.middleware";
import { validate } from "../middleware/validate.middleware";
import { adminIdSchema, adminListSchema, adminUserListSchema } from "../validations/admin.validation";
import { loginSchema } from "../validations/auth.validation";
import { uploadImages } from "../middleware/upload.middleware";

export const adminRouter = Router();

adminRouter.post("/auth/login", authLimiter, validate(loginSchema), authController.adminLogin);

// Protect all routes after this middleware
adminRouter.use(authenticate, authorize("admin"));

// Additional restriction for super admins only (for coupon management)
const superAdminCheck = (req: Request, res: Response, next: NextFunction): void => {
  const allowedEmails = ["semwalb3@gmail.com", "rctaccommodations@gmail.com"];
  
  // Use optional chaining to safely check user payload shape
  if (!req.user || !req.user.email || !allowedEmails.includes(req.user.email)) {
    res.status(403).json({ message: "Access denied. Super admin only." });
    return;
  }
  next();
};

// Coupon management routes (super admin only)
adminRouter.route("/coupons")
  .get(couponController.getCoupons)
  .post(superAdminCheck, couponController.createCoupon);

adminRouter.route("/coupons/:id")
  .get(couponController.getCouponById)
  .put(superAdminCheck, couponController.updateCoupon)
  .delete(superAdminCheck, couponController.deleteCoupon);

// Existing admin routes
adminRouter.get("/dashboard/stats", adminController.getStats);
adminRouter.get("/listings", validate(adminListSchema), adminController.getListings);
adminRouter.get("/listings/:id", validate(adminIdSchema), adminController.getListingDetails);
adminRouter.patch("/listings/:id/approve", validate(adminIdSchema), adminController.approveListing);
adminRouter.patch("/listings/:id/reject", validate(adminIdSchema), adminController.rejectListing);
adminRouter.delete("/listings/:id", validate(adminIdSchema), adminController.removeListing);
adminRouter.get("/users", validate(adminUserListSchema), adminController.getUsers);
adminRouter.patch("/users/:id/suspend", validate(adminIdSchema), adminController.suspendUser);
adminRouter.delete("/users/:id", validate(adminIdSchema), adminController.deleteUser);
adminRouter.get("/approvals", adminController.getOwnerApprovals);
adminRouter.get("/approvals/:id", validate(adminIdSchema), adminController.getOwnerApprovalById);
adminRouter.patch("/approvals/:id/approve", validate(adminIdSchema), adminController.approveOwner);
adminRouter.patch("/approvals/:id/reject", validate(adminIdSchema), adminController.rejectOwner);
adminRouter.patch("/listings/:id", validate(adminIdSchema), adminController.updateListing);
adminRouter.get("/users/:id/properties", validate(adminIdSchema), adminController.getUserProperties);
adminRouter.post("/listings/:id/images", uploadImages, adminController.addPropertyImages);
adminRouter.delete(
  "/listings/:id/images/:imageId",
  adminController.deletePropertyImage
);

adminRouter.put(
  "/listings/:id/images/:imageId",
  uploadImages,
  adminController.replacePropertyImage
);

adminRouter.get(
  "/properties",
  adminController.getProperties
);

adminRouter.get(
  "/properties/:id",
  adminController.getPropertyManagement
);

adminRouter.get(
  "/properties",
  adminController.getProperties
);

adminRouter.get(
  "/properties/:id",
  adminController.getPropertyManagement
);