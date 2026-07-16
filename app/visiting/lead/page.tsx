"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

export default function LeadLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!username || !password) {
      setError("Enter username and password");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/visiting/lead/login", { username, password });
      localStorage.setItem("lead_token", res.data.token);
      localStorage.setItem("lead_name", res.data.intern.name);
      window.location.href = "/visiting/lead/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f6f6]">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-4xl font-black text-[#5B3416]">LivingGo</h1>
        <p className="mt-2 text-center text-lg font-semibold text-gray-500">Lead Login</p>

        <div className="mt-8 space-y-4">
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-[#5B3416] py-3 font-bold text-white hover:bg-[#4a2a10] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </main>
  );
}