import { Router } from "express";
import * as propertyController from "../controllers/property.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
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
propertyRouter.post("/", authenticate, authorize("owner", "admin"), uploadImages, validate(createPropertySchema), propertyController.createProperty);
propertyRouter.put("/:id", authenticate, authorize("owner", "admin"), validate(updatePropertySchema), propertyController.updateProperty);
propertyRouter.delete("/:id", authenticate, authorize("owner", "admin"), validate(propertyIdSchema), propertyController.deleteProperty);
