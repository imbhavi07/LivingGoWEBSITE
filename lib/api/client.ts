import axios, { AxiosResponse } from "axios";

type ClerkInstance = {
  session?: { getToken: () => Promise<string> } | null;
};

function getClerkWithTimeout(timeoutMs = 5000): Promise<ClerkInstance | null> {
  return new Promise((resolve) => {
    const clerk = (window as Window & { Clerk?: ClerkInstance }).Clerk;

    if (clerk?.session) return resolve(clerk);

    const deadline = Date.now() + timeoutMs;

    const poll = setInterval(() => {
      const c = (window as Window & { Clerk?: ClerkInstance }).Clerk;
      if (c?.session) {
        clearInterval(poll);
        return resolve(c);
      }
      if (Date.now() > deadline) {
        clearInterval(poll);
        resolve(null);
      }
    }, 50);
  });
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
  timeout: 100000000,
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
  if (typeof window === "undefined") return config;

  const pathname = window.location.pathname;

  const isAdminRequest = pathname.startsWith("/admin");
  const isVisitingRequest = pathname.startsWith("/visiting");

  if (isAdminRequest) {
    const token = localStorage.getItem("LivingGo_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }

  if (window.location.pathname.startsWith("/visiting/lead")) {
    const token = localStorage.getItem("lead_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }

  if (isVisitingRequest) {
    const token = localStorage.getItem("visiting_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }

  try {
    const clerk = await getClerkWithTimeout();
    if (clerk?.session) {
      const token = await clerk.session.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Clerk not available — request proceeds without token
  }

  return config;
});

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response, // ✅ FIXED: Explicitly typed as AxiosResponse
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Handle logout for different sections
      if (window.location.pathname.startsWith("/admin")) {
        // Remove token and redirect to admin login
        localStorage.removeItem("LivingGo_token");
        window.location.href = "/admin/login";
      } else if (
        window.location.pathname.startsWith("/visiting/lead/dashboard") ||
        window.location.pathname.startsWith("/visiting/lead/visit/") ||
        window.location.pathname === "/visiting/interns/leads" ||
        window.location.pathname.startsWith("/visiting/lead/")
      ) {
        // Remove intern token and redirect to login
        localStorage.removeItem("intern_token");
        window.location.href = "/visiting/login";
      } else if (window.location.pathname.startsWith("/visiting")) {
        // Remove visiting token and redirect to visiting login
        localStorage.removeItem("visiting_token");
        window.location.href = "/visiting/login";
      } else {
        // For other routes, you might want to handle Clerk session expiration
        // For now, just reject the error
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);