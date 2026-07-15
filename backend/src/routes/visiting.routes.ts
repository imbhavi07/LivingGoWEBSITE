import { Router } from "express";

import * as visitController from "../controllers/visit.controller";

import { supervisorAuthenticate } from "../middleware/supervisor.middleware";

export const visitingRouter = Router();

visitingRouter.post(
  "/send-otp",
  visitController.sendSupervisorOtp
);

visitingRouter.post(
  "/verify-otp",
  visitController.verifySupervisorOtp
);

visitingRouter.use(supervisorAuthenticate);

visitingRouter.get(
  "/dashboard",
  visitController.getAllVisits
);

visitingRouter.post(
  "/:visitId/assign-lead",
  visitController.assignLead
);

visitingRouter.post(
  "/interns",
  visitController.createIntern
);

visitingRouter.get(
  "/interns",
  visitController.getInterns
);

visitingRouter.post(
  "/interns",
  supervisorAuthenticate,
  visitController.createIntern
);