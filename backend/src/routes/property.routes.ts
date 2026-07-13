// backend/src/routes/property.routes.ts  (FULL REPLACEMENT)

import { Router } from "express";
import * as propertyController from "../controllers/property.controller";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createPropertySchema,
  listPropertiesSchema,
  propertyIdSchema,
  updatePropertySchema,
  createReviewSchema,
  markResidenceSchema,
} from "../validations/property.validation";

export const propertyRouter = Router();

// Public routes
propertyRouter.get("/", validate(listPropertiesSchema), propertyController.getProperties);
// ← NEW: dropdown list for "existing tenant" selector (no auth needed)
propertyRouter.get("/list", propertyController.getApprovedPropertyList);

// 🔥 NEW: Featured route (Must be above /:id)
propertyRouter.get("/featured", propertyController.getFeaturedProperty);

// Get current user's properties (owner/dashboard route)
propertyRouter.get("/my-properties", clerkAuthenticate, authorize("owner"), propertyController.getOwnerProperties);

// === ACTION ROUTES (placed above GET/:id to avoid interception) ===
// Toggle property status (PATCH /:id/status)
propertyRouter.patch(
  "/:id/status",
  clerkAuthenticate,
  authorize("owner", "admin"),
  propertyController.togglePropertyStatus
);

// Delete property (DELETE /:id)
propertyRouter.delete(
  "/:id",
  clerkAuthenticate,
  authorize("owner", "admin"),
  validate(propertyIdSchema),
  propertyController.deleteProperty
);

// Get single property by ID (GET /:id)
propertyRouter.get("/:id", validate(propertyIdSchema), propertyController.getPropertyById);

// Owner / admin routes
propertyRouter.post("/", clerkAuthenticate, authorize("owner", "admin"), uploadImages, validate(createPropertySchema), propertyController.createProperty);
propertyRouter.put("/:id", clerkAuthenticate, authorize("owner", "admin"), validate(updatePropertySchema), propertyController.updateProperty);

// Student routes
propertyRouter.post(
  "/:id/review",
  clerkAuthenticate,
  authorize("student"),
  validate(createReviewSchema),
  propertyController.createReview
);

propertyRouter.post(
  "/:id/residence",
  clerkAuthenticate,
  authorize("student"),
  validate(markResidenceSchema),
  propertyController.markResidence
);