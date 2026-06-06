import { Router } from "express";
import * as propertyController from "../controllers/property.controller";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createPropertySchema,
  listPropertiesSchema,
  propertyIdSchema,
  updatePropertySchema
} from "../validations/property.validation";

export const propertyRouter = Router();

propertyRouter.get("/", validate(listPropertiesSchema), propertyController.getProperties);
propertyRouter.get("/:id", validate(propertyIdSchema), propertyController.getPropertyById);
propertyRouter.post("/", clerkAuthenticate, authorize("owner", "admin"), uploadImages, validate(createPropertySchema), propertyController.createProperty);
propertyRouter.put("/:id", clerkAuthenticate, authorize("owner", "admin"), validate(updatePropertySchema), propertyController.updateProperty);
propertyRouter.delete("/:id", clerkAuthenticate, authorize("owner", "admin"), validate(propertyIdSchema), propertyController.deleteProperty);
