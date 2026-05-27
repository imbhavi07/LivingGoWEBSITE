import { Router } from "express";
import multer from "multer";
import { submitKyc, getKycStatus } from "../controllers/kyc.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/status", getKycStatus);

router.post(
  "/",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  submitKyc
);

export default router;