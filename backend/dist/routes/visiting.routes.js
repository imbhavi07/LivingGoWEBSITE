"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitingRouter = void 0;
const express_1 = require("express");
const visitController = __importStar(require("../controllers/visit.controller"));
const internController = __importStar(require("../controllers/intern.controller"));
const intern_middleware_1 = require("../middleware/intern.middleware");
const supervisor_middleware_1 = require("../middleware/supervisor.middleware");
exports.visitingRouter = (0, express_1.Router)();
exports.visitingRouter.post("/send-otp", visitController.sendSupervisorOtp);
exports.visitingRouter.post("/verify-otp", visitController.verifySupervisorOtp);
exports.visitingRouter.post("/login", internController.internLogin);
exports.visitingRouter.get("/lead/dashboard", intern_middleware_1.internAuthenticate, internController.getInternDashboard);
exports.visitingRouter.patch("/lead/:id", intern_middleware_1.internAuthenticate, internController.updateInternVisitStatus);
exports.visitingRouter.use(supervisor_middleware_1.supervisorAuthenticate);
exports.visitingRouter.get("/dashboard", visitController.getAllVisits);
exports.visitingRouter.get("/:visitId/available-interns", visitController.getAvailableInterns);
exports.visitingRouter.post("/:visitId/assign-lead", visitController.assignLead);
exports.visitingRouter.post("/interns", internController.createIntern);
exports.visitingRouter.get("/interns", internController.getInterns);
exports.visitingRouter.patch("/interns/:id/toggle", internController.toggleInternStatus);
exports.visitingRouter.delete("/interns/:id", internController.deleteIntern);
