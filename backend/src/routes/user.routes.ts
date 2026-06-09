import { Router } from "express";
import { clerkAuthenticate } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

export const userRouter = Router();

// Protect all user routes with Clerk authentication
userRouter.use(clerkAuthenticate);

userRouter.get("/profile", userController.getProfile);
userRouter.put("/profile", userController.updateProfile);
userRouter.patch("/profile", userController.updateProfile);