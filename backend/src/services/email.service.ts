import { resend } from "../config/resend";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

export async function sendOwnerOtpEmail(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
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
  } catch (error) {
    // Make OTP/resend failures visible in backend terminal logs
    console.error("[Resend] sendOwnerOtpEmail failed", {
      email,
      from: env.EMAIL_FROM,
      otpPreview: otp?.slice?.(0, 2) ? `${otp.slice(0, 2)}...` : "(unknown)",
      error
    });
    throw new AppError("Failed to send OTP email", 500);
  }
}

