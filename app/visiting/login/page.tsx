"use client";

import { useState } from "react";
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
    } finally {
      setLoading(false);
    }
  };

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
      </div>
    </main>
  );
}