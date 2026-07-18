import { Router } from "express";
import * as visitController from "../controllers/visit.controller";
import * as internController from "../controllers/intern.controller"; 
import { internAuthenticate } from "../middleware/intern.middleware";
import { supervisorAuthenticate } from "../middleware/supervisor.middleware";

export const visitingRouter = Router();

visitingRouter.post("/send-otp", visitController.sendSupervisorOtp);
visitingRouter.post("/verify-otp", visitController.verifySupervisorOtp);

visitingRouter.post("/login", internController.internLogin); 

visitingRouter.get(
  "/lead/dashboard",
  internAuthenticate,
  internController.getInternDashboard
);

visitingRouter.patch(
  "/lead/:id",
  internAuthenticate,
  internController.updateInternVisitStatus
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
  internController.createIntern
);

visitingRouter.get(
  "/interns",
  internController.getInterns
);