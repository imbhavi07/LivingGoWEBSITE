"use client";

import type { AuthResponse } from "@/types/auth";

const TOKEN_KEY = "LivingGo_token";
const USER_KEY = "LivingGo_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function setSession(session: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: session.token, role: session.user.role ?? "student" })
  }); 

  // ✅ Add this so silent failures are caught
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Session cookie failed: ${JSON.stringify(err)}`);
  }
}

export function getSessionUser() {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? (JSON.parse(user) as AuthResponse["user"]) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  await fetch("/api/auth/session", { method: "DELETE" });
}