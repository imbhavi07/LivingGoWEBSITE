import { Router } from "express";
import multer from "multer";
import { submitKyc, getKycStatus, initiateDigilockerSession } from "../controllers/kyc.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/status", getKycStatus);

// DigiLocker initiation route - protected by Clerk auth
router.get("/digilocker/init", initiateDigilockerSession);

router.post(
  "/",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  submitKyc
);

export default router;