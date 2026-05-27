import { apiClient } from "@/lib/api/client";
import type { AuthResponse, LoginPayload } from "@/types/auth";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function signup(payload: { name: string; email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
  return data;
}
