import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as authController from "../controllers/auth.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/security.middleware";
import { validate } from "../middleware/validate.middleware";
import { adminIdSchema, adminListSchema, adminUserListSchema } from "../validations/admin.validation";
import { loginSchema } from "../validations/auth.validation";

export const adminRouter = Router();

adminRouter.post("/auth/login", authLimiter, validate(loginSchema), authController.adminLogin);

adminRouter.use(authenticate, authorize("admin"));
adminRouter.get("/dashboard/stats", adminController.getStats);
adminRouter.get("/listings", validate(adminListSchema), adminController.getListings);
adminRouter.get("/listings/:id", validate(adminIdSchema), adminController.getListingDetails);
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
adminRouter.get("/coupons", adminController.getAdminCoupons);