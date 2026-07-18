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
  "/interns",
  visitController.getInterns
);

visitRouter.patch(
    "/lead/visit/:id/verify-otp",
    visitController.verifyVisitOtp
);

visitRouter.post(
  "/interns",
  visitController.createIntern
);

// visitRouter.put(
//   "/interns/:id/toggle",
//   visitController.toggleIntern
// );

// visitRouter.delete(
//   "/interns/:id",
//   visitController.deleteIntern
// );

visitRouter.get(
  "/all",
  visitController.getAllVisits
);

visitRouter.post(
  "/schedule",
  visitController.scheduleVisit
);