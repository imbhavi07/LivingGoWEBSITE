import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authLimiter } from "../middleware/security.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, signupSchema } from "../validations/auth.validation";

export const authRouter = Router();

authRouter.post("/signup", authLimiter, validate(signupSchema), authController.signup);
authRouter.post("/login", authLimiter, validate(loginSchema), authController.login);
authRouter.post("/admin/send-otp", authLimiter, authController.sendAdminOtp);
authRouter.post("/admin/verify-otp", authLimiter, authController.verifyAdminOtp);   