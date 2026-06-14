import { Router } from "express";
import multer from "multer";
import { submitKyc, getKycStatus, generateAadhaarOtp, verifyAadhaarOtp } from "../controllers/kyc.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/status", getKycStatus);

// New Aadhaar OTP Routes
router.post("/aadhaar/generate-otp", generateAadhaarOtp);
router.post("/aadhaar/verify-otp", verifyAadhaarOtp);

router.post(
  "/",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  submitKyc
);

export default router;