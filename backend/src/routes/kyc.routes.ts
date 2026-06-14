import { Router } from "express";
import multer from "multer";
import { submitKyc, getKycStatus, initiateDigilockerSession, handleSandboxWebhook, completeDigilockerSession } from "../controllers/kyc.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/status", getKycStatus);

// The Secure DigiLocker Redirect Route
router.get("/digilocker/init", initiateDigilockerSession);

// The Webhook to catch the approved KYC data later
router.post("/webhook", handleSandboxWebhook);

router.post("/digilocker/complete", completeDigilockerSession);

router.post(
  "/",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  submitKyc
);

export default router;