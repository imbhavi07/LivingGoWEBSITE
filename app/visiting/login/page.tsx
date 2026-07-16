"use client";

import { useState } from "react";
<<<<<<< HEAD
import { apiClient } from "@/lib/api/client";

export default function UnifiedLoginPage() {
  // Tab State: 'supervisor' or 'intern'
  const [activeTab, setActiveTab] = useState<"supervisor" | "intern">("supervisor");

  // --- Supervisor States ---
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // --- Intern / Lead States ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [internLoading, setInternLoading] = useState(false);
  const [internError, setInternError] = useState<string | null>(null);

  // --- Supervisor Logic ---
  const sendSupervisorOtp = async () => {
    try {
      setLoading(true);
      await apiClient.post("/visits/send-otp", { email });
      setOtpSent(true);
      alert("OTP sent successfully.");
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        alert(error?.response?.data?.message ?? "Failed to send OTP.");
=======
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !password) {
      alert("Please enter both phone number and password");
      return;
    }

    try {
      setLoading(true);
      // Ensure this matches your Express backend URL structure!
      const response = await fetch("/api/visiting/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            "Invalid phone number or password. Please try again."
        );
      }

      const { token, intern } = responseData;
      localStorage.setItem("intern_token", token);
      localStorage.setItem("intern_name", intern?.name || "");

      alert("Login successful!");
      router.push("/visiting/dashboard");
      
    } catch (error: unknown) {
      // ✅ FIXED: No more 'any' type error here
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Invalid phone number or password. Please try again.";
      
      alert(errorMessage);
>>>>>>> b9d7d75e05f47f8ca59188070d70e20f962bf940
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const verifySupervisorOtp = async () => {
    try {
      setVerifying(true);
      const response = await apiClient.post("/visits/verify-otp", { email, otp });
      const { token } = response.data;
      localStorage.setItem("visiting_token", token);
      alert("Login successful.");
      window.location.href = "/visiting/dashboard";
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        alert(error?.response?.data?.message ?? "Invalid OTP.");
    } finally {
      setVerifying(false);
    }
  };

  async function handleInternLogin() {
    if (!username || !password) {
      setInternError("Enter username and password");
      return;
    }
    setInternLoading(true);
    setInternError(null);
    try {
  const res = await apiClient.post("/visiting/login", {
    username,
    password,
  });

  localStorage.setItem("lead_token", res.data.token);
  localStorage.setItem("lead_name", res.data.intern.name);

window.location.href = "/visiting/lead/dashboard";
}catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setInternError(error?.response?.data?.message ?? "Invalid credentials");
    } finally {
      setInternLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f6f6f6] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        
        {/* 1. Tab Switcher Toggle Pill */}
        <div className="flex bg-[#FBF7F4] p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab("supervisor")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "supervisor"
                ? "bg-[#5B3416] text-white shadow-md"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            🎓 Supervisor
          </button>
          <button
            onClick={() => setActiveTab("intern")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "intern"
                ? "bg-[#5B3416] text-white shadow-md"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            🏢 Intern / Lead
          </button>
        </div>

        {/* 2. Logo Header */}
        <h1 className="text-center text-4xl font-black text-[#5B3416]">LivingGo</h1>
        <p className="mt-2 text-center text-sm font-medium text-gray-500">
          Welcome back! Sign in to your portal to continue.
        </p>

        <hr className="my-6 border-gray-100" />

        {/* 3. Render Form Dynamically Based on Active Tab */}
        {activeTab === "supervisor" ? (
          /* --- SUPERVISOR SECTION --- */
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#5B3416]"
              placeholder="Supervisor Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={sendSupervisorOtp}
              disabled={loading}
              className="w-full rounded-xl bg-[#5B3416] py-3 font-bold text-white hover:bg-[#4a2a10] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            {otpSent && (
              <div className="mt-5 space-y-4 pt-4 border-t border-dashed border-gray-200">
                <input
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  onClick={verifySupervisorOtp}
                  disabled={verifying}
                  className="w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* --- INTERN / LEAD SECTION --- */
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#5B3416]"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#5B3416]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInternLogin()}
            />

            {internError && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                {internError}
              </p>
            )}

            <button
              onClick={handleInternLogin}
              disabled={internLoading}
              className="w-full rounded-xl bg-[#5B3416] py-3 font-bold text-white hover:bg-[#4a2a10] disabled:opacity-50"
            >
              {internLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}
=======
  // ✅ ADDED: The missing UI return block so the page actually renders
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-black text-gray-900">Intern Login</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-blue-600 p-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
>>>>>>> b9d7d75e05f47f8ca59188070d70e20f962bf940
      </div>
    </main>
  );
}