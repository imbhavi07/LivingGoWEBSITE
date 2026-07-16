import { Router } from "express";
import * as visitController from "../controllers/visit.controller";
// ✅ IMPORT THE NEW INTERN CONTROLLER
import * as internController from "../controllers/intern.controller"; 
import { internAuthenticate } from "../middleware/intern.middleware";
import { supervisorAuthenticate } from "../middleware/supervisor.middleware";

export const visitingRouter = Router();

// ==========================================
// 1. PUBLIC / AUTH ROUTES
// ==========================================
visitingRouter.post("/send-otp", visitController.sendSupervisorOtp);
visitingRouter.post("/verify-otp", visitController.verifySupervisorOtp);

// Pointing intern login to the correct intern controller
visitingRouter.post("/login", internController.internLogin); 

// ==========================================
// 2. INTERN PROTECTED ROUTES
// ==========================================
// Prefixed with /lead/ to prevent collisions with the supervisor dashboard
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

// ==========================================
// 3. SUPERVISOR PROTECTED ROUTES
// ==========================================
// Everything below this line requires a supervisor token
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

// Consolidated to a single POST /interns route under supervisor auth
visitingRouter.post(
  "/interns",
  internController.createIntern
);

visitingRouter.get(
  "/interns",
  internController.getInterns
);