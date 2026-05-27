import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
  timeout: 12000,
  headers: {
    "Content-Type": "application/json"
  }
});

export function isAuthApiError(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    // Try localStorage token first (existing owner login)
    const token = localStorage.getItem("LivingGo_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Try Clerk token via window.Clerk (client-side only)
      try {
        const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string> } } }).Clerk;
        if (clerk?.session) {
          const clerkToken = await clerk.session.getToken();
          if (clerkToken) config.headers.Authorization = `Bearer ${clerkToken}`;
        }
      } catch {
        // no clerk token available
      }
    }

    const user = localStorage.getItem("LivingGo_user");
    if (user) {
      try {
        const parsed = JSON.parse(user) as { role?: string };
        if (parsed.role) config.headers["x-LivingGo-role"] = parsed.role;
      } catch {
        localStorage.removeItem("LivingGo_user");
      }
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (typeof window !== "undefined" && status === 401) {
      localStorage.removeItem("LivingGo_token");
      void fetch("/api/auth/session", { method: "DELETE" });
      const pathname = window.location.pathname;
      const target = pathname.startsWith("/admin") ? "/admin/login" : pathname.startsWith("/owner") ? "/owner/login" : "/login";
      window.location.assign(target);
    }

    return Promise.reject(error);
  }
);
