import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";

export const uploadRouter = Router();

uploadRouter.post("/properties", authenticate, authorize("owner", "admin"), uploadImages, uploadController.uploadPropertyImages);