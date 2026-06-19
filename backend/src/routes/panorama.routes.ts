import { Router } from "express";
import * as panoramaController from "../controllers/panorama.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

export const panoramaRouter = Router();

panoramaRouter.get(
  "/properties/:propertyId/panoramas",
  panoramaController.getPropertyPanoramas
);

panoramaRouter.post(
  "/admin/properties/:propertyId/panoramas",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  panoramaController.createPanorama
);

panoramaRouter.put(
  "/admin/panoramas/:id",
  authenticate,
  authorize("admin"),
  panoramaController.updatePanorama
);

panoramaRouter.put(
  "/admin/panoramas/:id/image",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  panoramaController.replacePanoramaImage
);

panoramaRouter.delete(
  "/admin/panoramas/:id",
  authenticate,
  authorize("admin"),
  panoramaController.deletePanorama
);