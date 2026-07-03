"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearSession, getSessionUser, getToken } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  refreshSession: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log("AuthProvider mounted");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  function refreshSession() {

  console.log("Loaded user:", user);
  console.log("Loaded token:", token);
  console.log(
  "Raw localStorage:",
  localStorage.getItem("LivingGo_user")
);
  const storedUser = getSessionUser();
  const storedToken = getToken();

 

  console.log("refreshSession()", {
    storedUser,
    storedToken,
  });

  setUser(() => storedUser);
  setToken(() => storedToken);
}

  async function logout() {
    await clearSession();
    setUser(null);
    setToken(null);
  }

  useEffect(() => {
    refreshSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      refreshSession,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used inside AuthProvider");
  return context;
}
