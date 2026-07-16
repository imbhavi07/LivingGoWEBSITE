import { Router } from "express";
import * as visitController from "../controllers/visit.controller";
import { internAuthenticate } from "../middleware/intern.middleware";
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

visitingRouter.post(
  "/lead/login",
  visitController.internLogin
);

visitingRouter.get(
  "/lead/dashboard",
  internAuthenticate,
  visitController.getInternDashboard
);

visitingRouter.patch(
  "/lead/visit/:id",
  internAuthenticate,
  visitController.updateInternVisitStatus
);

visitingRouter.get(
  "/lead/dashboard",
  internAuthenticate,
  visitController.getInternDashboard
);

visitingRouter.use(supervisorAuthenticate);

visitingRouter.get(
  "/dashboard",
  visitController.getAllVisits
);

visitingRouter.get(
  "/:visitId/available-interns",
  visitController.getAvailableInterns
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