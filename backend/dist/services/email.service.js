"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOwnerOtpEmail = sendOwnerOtpEmail;
const resend_1 = require("../config/resend");
const env_1 = require("../config/env");
const app_error_1 = require("../utils/app-error");
async function sendOwnerOtpEmail(email, otp) {
    try {
        await resend_1.resend.emails.send({
            from: env_1.env.EMAIL_FROM,
            to: email,
            subject: "LivingGo owner verification OTP",
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>LivingGo Owner Verification</h2>
          <p>Your one-time verification code is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 16px 0;">${otp}</div>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `
        });
    }
    catch (error) {
        // Make OTP/resend failures visible in backend terminal logs
        console.error("[Resend] sendOwnerOtpEmail failed", {
            email,
            from: env_1.env.EMAIL_FROM,
            otpPreview: otp?.slice?.(0, 2) ? `${otp.slice(0, 2)}...` : "(unknown)",
            error
        });
        throw new app_error_1.AppError("Failed to send OTP email", 500);
    }
}
