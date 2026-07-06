"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const kyc_controller_1 = require("../controllers/kyc.controller");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.get("/status", kyc_controller_1.getKycStatus);
router.get("/callback/status", kyc_controller_1.getKycStatus);
// The Secure DigiLocker Redirect Route
router.get("/digilocker/init", kyc_controller_1.initiateDigilockerSession);
// The Webhook to catch the approved KYC data later
router.post("/webhook", kyc_controller_1.handleSandboxWebhook);
router.post("/digilocker/complete", kyc_controller_1.completeDigilockerSession);
router.post("/", upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
]), kyc_controller_1.submitKyc);
exports.default = router;
