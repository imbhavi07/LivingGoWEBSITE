"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeDigilockerSession = exports.handleSandboxWebhook = exports.initiateDigilockerSession = exports.getKycStatus = exports.submitKyc = void 0;
const axios_1 = __importDefault(require("axios"));
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const prisma_1 = require("../config/prisma");
const cloudinary_service_1 = require("../services/cloudinary.service");
exports.submitKyc = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const clerkEmail = req.body.clerkEmail;
    if (!clerkEmail)
        throw new app_error_1.AppError("Email is required", 400);
    const owner = await prisma_1.prisma.user.findUnique({ where: { email: clerkEmail } });
    if (!owner)
        throw new app_error_1.AppError("Owner not found. Please sign up first.", 404);
    const ownerId = owner.id;
    if (owner.verificationStatus === "approved") {
        throw new app_error_1.AppError("Your KYC is already approved.", 400);
    }
    const { name, phone, ownerType, aadhaarNumber } = req.body;
    if (!name || !phone || !ownerType || !aadhaarNumber) {
        throw new app_error_1.AppError("All fields are required.", 400);
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new app_error_1.AppError("Aadhaar number must be exactly 12 digits.", 400);
    }
    const files = req.files;
    const frontFile = files?.aadhaarFront?.[0];
    const backFile = files?.aadhaarBack?.[0];
    if (!frontFile || !backFile) {
        throw new app_error_1.AppError("Both Aadhaar front and back images are required.", 400);
    }
    const uploads = await (0, cloudinary_service_1.uploadMany)([frontFile, backFile]);
    const updatedOwner = await prisma_1.prisma.user.update({
        where: { id: ownerId },
        data: {
            name,
            phone,
            ownerType,
            aadhaarNumber,
            aadhaarFrontUrl: uploads[0]?.secure_url,
            aadhaarBackUrl: uploads[1]?.secure_url,
            verificationStatus: "pending_approval",
            legalAcceptedAt: new Date(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            verificationStatus: true,
        },
    });
    res.status(200).json({
        success: true,
        message: "KYC submitted successfully. Awaiting admin approval.",
        data: updatedOwner,
    });
});
exports.getKycStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const clerkEmail = req.query.email;
    if (!clerkEmail)
        throw new app_error_1.AppError("Email is required", 400);
    const owner = await prisma_1.prisma.user.findUnique({
        where: { email: clerkEmail },
        select: {
            verificationStatus: true,
            aadhaarNumber: true,
            reviewedAt: true,
        },
    });
    if (!owner)
        throw new app_error_1.AppError("Owner not found", 404);
    res.status(200).json({
        success: true,
        data: {
            verificationStatus: owner.verificationStatus,
            aadhaarLast4: owner.aadhaarNumber?.slice(-4) ?? null,
            reviewedAt: owner.reviewedAt,
        },
    });
});
exports.initiateDigilockerSession = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const email = req.query.email;
    if (!email) {
        throw new app_error_1.AppError("Email is required to map the KYC session", 400);
    }
    const sandboxApiKey = process.env.SANDBOX_API_KEY;
    const sandboxApiSecret = process.env.SANDBOX_API_SECRET;
    if (!sandboxApiKey || !sandboxApiSecret) {
        throw new app_error_1.AppError("Sandbox API credentials missing", 500);
    }
    try {
        // 1. Authenticate with Sandbox to get the Access Token
        const authResponse = await axios_1.default.post("https://api.sandbox.co.in/authenticate", {}, {
            headers: {
                "x-api-key": sandboxApiKey,
                "x-api-secret": sandboxApiSecret,
                "x-api-version": "1.0"
            }
        });
        const accessToken = authResponse.data?.access_token || authResponse.data?.data?.access_token;
        // 2. Request the DigiLocker Portal Redirect URL
        const response = await axios_1.default.post("https://api.sandbox.co.in/kyc/digilocker/sessions/init", {
            "@entity": "in.co.sandbox.kyc.digilocker.session.request",
            "flow": "signin",
            "redirect_url": "https://livinggo.in/owner/kyc",
            "doc_types": ["aadhaar"]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": accessToken,
                "x-api-key": sandboxApiKey,
                "x-api-version": "1.0"
            }
        });
        // 3. Extract URL and send to frontend
        const authorizationUrl = response.data?.data?.authorization_url;
        if (!authorizationUrl) {
            throw new app_error_1.AppError("Failed to get DigiLocker URL from Sandbox", 500);
        }
        res.status(200).json({ success: true, redirectUrl: authorizationUrl });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("DigiLocker Init Error:", error.response?.data || error.message);
        }
        else {
            console.error("DigiLocker Init Error:", String(error));
        }
        throw new app_error_1.AppError("Failed to initiate secure DigiLocker session", 500);
    }
});
exports.handleSandboxWebhook = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const webhookSecret = req.headers['x-webhook-secret'] || req.headers['authorization'];
    if (webhookSecret !== process.env.SANDBOX_WEBHOOK_SECRET) {
        console.error("🚨 Unauthorized Webhook Attempt:", req.ip);
        throw new app_error_1.AppError("Unauthorized webhook", 401);
    }
    const payload = req.body;
    console.log("✅ Sandbox Webhook Received!", JSON.stringify(payload, null, 2));
    // If Sandbox sends a verification success status, mark user approved in DB
    if (payload?.data?.status === "VALID" || payload?.code === 200) {
        const email = payload?.data?.email; // Adjust key based on Sandbox's incoming body
        if (email) {
            await prisma_1.prisma.user.update({
                where: { email },
                data: { verificationStatus: "pending_approval" }
            });
        }
    }
    res.status(200).json({ success: true, message: "Webhook processed successfully" });
});
exports.completeDigilockerSession = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { email, sessionId } = req.body;
    if (!email || !sessionId)
        throw new app_error_1.AppError("Missing details", 400);
    try {
        // 1. Get Token
        const auth = await axios_1.default.post("https://api.sandbox.co.in/authenticate", {}, {
            headers: {
                "x-api-key": process.env.SANDBOX_API_KEY,
                "x-api-secret": process.env.SANDBOX_API_SECRET,
                "x-api-version": "1.0"
            }
        });
        const accessToken = auth.data.access_token;
        // 2. Fetch User Profile data
        const userProfileResponse = await axios_1.default.get(`https://api.sandbox.co.in/kyc/digilocker/sessions/${sessionId}/user/profile`, {
            headers: {
                "Authorization": accessToken,
                "x-api-key": process.env.SANDBOX_API_KEY,
                "x-api-version": "1.0"
            }
        });
        // 3. Fetch Document data
        const documentResponse = await axios_1.default.get(`https://api.sandbox.co.in/kyc/digilocker/sessions/${sessionId}/documents/aadhaar`, {
            headers: {
                "Authorization": accessToken,
                "x-api-key": process.env.SANDBOX_API_KEY,
                "x-api-version": "1.0"
            }
        });
        const userProfileData = userProfileResponse.data;
        const documentData = documentResponse.data;
        // Debug log after fetching document data
        console.log("SANDBOX DOCUMENT PAYLOAD:", JSON.stringify(documentData.data, null, 2));
        // Extract file URL and check if XML
        const fileUrl = documentData.data?.files?.[0]?.url;
        const isXml = documentData.data?.files?.[0]?.metadata?.ContentType === "application/xml" || fileUrl?.includes('.xml');
        let extractedId = null;
        let extractedPhoto = null;
        if (isXml && fileUrl) {
            try {
                const xmlResponse = await axios_1.default.get(fileUrl);
                const xmlText = xmlResponse.data;
                const uidMatch = xmlText.match(/uid="([^"]+)"/i);
                const numberMatch = xmlText.match(/number="([^"]+)"/i);
                extractedId = uidMatch ? uidMatch[1] : (numberMatch ? numberMatch[1] : null);
                // Extract photo from XML
                const photoMatch = xmlText.match(/<(?:Photo|Pht)>([^<]+)<\/(?:Photo|Pht)>/i);
                extractedPhoto = photoMatch ? `data:image/jpeg;base64,${photoMatch[1]}` : null;
            }
            catch (err) {
                console.error("Failed to parse XML", err);
            }
        }
        // 4. Sync to DB with verified data
        await prisma_1.prisma.user.update({
            where: { email },
            data: {
                name: userProfileData.data.name,
                phone: userProfileData.data?.phone || userProfileData.data?.mobile || "Not provided by DigiLocker",
                ownerType: "PG Owner",
                aadhaarNumber: extractedId || documentData.data?.parsed_data?.uid || documentData.data?.parsed_data?.id_number || "Verified via XML Document",
                aadhaarFrontUrl: extractedPhoto || documentData.data?.files?.[0]?.url || documentData.data?.url || null,
                aadhaarBackUrl: null,
                verificationStatus: "pending_approval",
                legalAcceptedAt: new Date()
            }
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("SANDBOX API ERROR:", error.response?.data || error.message);
            res.status(500).json({ error: "Failed to fetch data from Sandbox", details: error.response?.data });
        }
        else {
            console.error("SANDBOX API ERROR:", error);
            res.status(500).json({ error: "Failed to fetch data from Sandbox" });
        }
    }
});
