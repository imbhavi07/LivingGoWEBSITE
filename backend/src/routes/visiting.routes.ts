import { Router } from "express";

import * as visitController from "../controllers/visit.controller";

import { supervisorAuthenticate } from "../middleware/supervisor.middleware";

export const visitingRouter = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

visitingRouter.post(
  "/send-otp",
  visitController.sendSupervisorOtp
);

visitingRouter.post(
  "/verify-otp",
  visitController.verifySupervisorOtp
);

/*
|--------------------------------------------------------------------------
| PROTECTED
|--------------------------------------------------------------------------
*/

visitingRouter.use(supervisorAuthenticate);

visitingRouter.get(
  "/dashboard",
  visitController.getAllVisits
);