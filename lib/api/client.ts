import axios from "axios";

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

  const isAdminRequest = window.location.pathname.startsWith("/admin");

  if (isAdminRequest) {
    const token = localStorage.getItem("LivingGo_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);