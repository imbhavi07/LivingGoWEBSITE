"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

export default function InternLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    try {
      setLoading(true);

      const res = await apiClient.post(
        "/visiting/intern/login",
        {
          username,
          password,
        }
      );

      localStorage.setItem(
        "intern_token",
        res.data.token
      );

      router.push(
        "/visiting/intern/dashboard"
      );

    } catch (err: any) {

      alert(
        err.response?.data?.message ||
        "Invalid Username or Password"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="mb-8 text-center text-3xl font-bold">
          Intern Login
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Username"
            className="w-full rounded-xl border p-3 outline-none"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border p-3 outline-none"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>

        </div>

      </div>

    </main>
  );
}