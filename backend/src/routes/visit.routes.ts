import { Router } from "express";
import { clerkAuthenticate } from "../middleware/auth.middleware";
import * as visitController from "../controllers/visit.controller";

export const visitRouter = Router();

visitRouter.use(clerkAuthenticate);

visitRouter.post("/schedule", visitController.scheduleVisit);