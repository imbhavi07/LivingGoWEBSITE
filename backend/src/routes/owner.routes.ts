import { Router } from "express";
import * as propertyController from "../controllers/property.controller";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import { AppError } from "../utils/app-error";
import {
  createPropertySchema,
  propertyIdSchema,
  togglePropertyStatusSchema,
  updatePropertySchema
} from "../validations/property.validation";

export const ownerRouter = Router();

// All owner routes protected by Clerk
ownerRouter.use(clerkAuthenticate, authorize("owner", "admin"));

ownerRouter.get("/dashboard/stats", propertyController.getOwnerStats);
ownerRouter.get("/properties", propertyController.getOwnerProperties);
ownerRouter.get(
  "/properties/:id",
  validate(propertyIdSchema),
  propertyController.getPropertyById
);
ownerRouter.post("/properties", uploadImages, validate(createPropertySchema), propertyController.createProperty);
ownerRouter.put("/properties/:id", validate(updatePropertySchema), propertyController.updateProperty);
ownerRouter.delete("/properties/:id", validate(propertyIdSchema), propertyController.deleteProperty);
ownerRouter.patch("/properties/:id/status", validate(togglePropertyStatusSchema), propertyController.togglePropertyStatus);