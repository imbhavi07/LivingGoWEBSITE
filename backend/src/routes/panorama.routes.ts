import { Router, RequestHandler } from "express";
import * as panoramaController from "../controllers/panorama.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

export const panoramaRouter = Router();

panoramaRouter.get(
  "/properties/:propertyId/panoramas",
  panoramaController.getPropertyPanoramas as unknown as RequestHandler
);

panoramaRouter.post(
  "/admin/properties/:propertyId/panoramas",
  authenticate as unknown as RequestHandler,
  authorize("admin") as unknown as RequestHandler,
  upload.single("image"),
  panoramaController.createPanorama as unknown as RequestHandler
);

panoramaRouter.put(
  "/admin/panoramas/:id",
  authenticate as unknown as RequestHandler,
  authorize("admin") as unknown as RequestHandler,
  panoramaController.updatePanorama as unknown as RequestHandler
);

panoramaRouter.put(
  "/admin/panoramas/:id/image",
  authenticate as unknown as RequestHandler,
  authorize("admin") as unknown as RequestHandler,
  upload.single("image"),
  panoramaController.replacePanoramaImage as unknown as RequestHandler
);

panoramaRouter.delete(
  "/admin/panoramas/:id",
  authenticate as unknown as RequestHandler,
  authorize("admin") as unknown as RequestHandler,
  authorize("admin") as unknown as RequestHandler,
  panoramaController.deletePanorama as unknown as RequestHandler
);