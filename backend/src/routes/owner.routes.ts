import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as propertyController from "../controllers/property.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/security.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, ownerSignupSchema, sendOtpSchema, verifyOtpSchema } from "../validations/auth.validation";
import { createPropertySchema, propertyIdSchema, togglePropertyStatusSchema, updatePropertySchema } from "../validations/property.validation";

export const ownerRouter = Router();

ownerRouter.post("/auth/send-otp", authLimiter, validate(sendOtpSchema), authController.sendOwnerOtp);
ownerRouter.post("/auth/verify-otp", authLimiter, validate(verifyOtpSchema), authController.verifyOwnerOtp);
ownerRouter.post("/auth/signup", authLimiter, uploadImages, validate(ownerSignupSchema), authController.ownerSignup);
ownerRouter.post("/auth/login", authLimiter, validate(loginSchema), authController.ownerLogin);

ownerRouter.use(authenticate, authorize("owner", "admin"));
ownerRouter.get("/dashboard/stats", propertyController.getOwnerStats);
ownerRouter.get("/properties", propertyController.getOwnerProperties);
ownerRouter.post("/properties", uploadImages, validate(createPropertySchema), propertyController.createProperty);
ownerRouter.put("/properties/:id", validate(updatePropertySchema), propertyController.updateProperty);
ownerRouter.delete("/properties/:id", validate(propertyIdSchema), propertyController.deleteProperty);
ownerRouter.patch("/properties/:id/status", validate(togglePropertyStatusSchema), propertyController.togglePropertyStatus);
