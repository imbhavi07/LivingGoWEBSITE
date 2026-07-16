"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

export default function VisitingPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);
      await apiClient.post("/visits/send-otp", {
        email,
      });
      setOtpSent(true);
      alert("OTP sent successfully.");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ??
        "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

const verifyOtp = async () => {
  try {
    setVerifying(true);

    const response = await apiClient.post("/visits/verify-otp", {
      email,
      otp,
    });

    const { token } = response.data;
    localStorage.setItem("visiting_token", token);
    alert("Login successful.");
    window.location.href = "/visiting/dashboard";
  } 
  
  catch (error: any) {
    alert(
      error?.response?.data?.message ??
      "Invalid OTP."
    );
  } finally {
    setVerifying(false);
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f6f6]">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-4xl font-black">
          LivingGo Visiting Portal
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Supervisor Login
        </p>

        <input
          className="mt-8 w-full rounded-xl border p-3"
          placeholder="Supervisor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-black py-3 font-semibold text-white"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {otpSent && (
          <>
            <input
              className="mt-5 w-full rounded-xl border p-3"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={verifyOtp}
              disabled={verifying}
              className="mt-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}