import { Router } from "express";
import { clerkAuthenticate } from "../middleware/auth.middleware";
import * as visitController from "../controllers/visit.controller";

export const visitRouter = Router();

visitRouter.post(
  "/send-otp",
  visitController.sendSupervisorOtp
);

visitRouter.post(
  "/verify-otp",
  visitController.verifySupervisorOtp
);

visitRouter.use(clerkAuthenticate);

visitRouter.get(
  "/all",
  visitController.getAllVisits
);

visitRouter.post(
  "/schedule",
  visitController.scheduleVisit
);