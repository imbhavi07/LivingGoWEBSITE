import { apiClient } from "@/lib/api/client";
import type { AuthResponse, LoginPayload } from "@/types/auth";

export async function adminLogin(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>("/admin/auth/login", payload);
  return { ...data, user: { ...data.user, role: data.user.role ?? "admin" } };
}
