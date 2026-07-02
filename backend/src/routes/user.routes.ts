// backend/src/routes/user.routes.ts  (FULL REPLACEMENT)

import { Router } from "express";
import { clerkAuthenticate } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";
import * as propertyController from "../controllers/property.controller";

export const userRouter = Router();

userRouter.use(clerkAuthenticate);

userRouter.get("/profile", userController.getProfile);
userRouter.put("/profile", userController.updateProfile);
userRouter.patch("/profile", userController.updateProfile);

// ← NEW: Student's current residence (for dashboard)
userRouter.get("/residence", propertyController.getStudentResidence);