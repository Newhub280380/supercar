"use client";

import { createContext, useContext, useCallback, useState, useRef } from "react";
import type { Role } from "@/types";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  phone: string | null;
  settings: Record<string, unknown> | null;
}

interface AuthContextValue {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserData | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef<Promise<void> | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        return data as UserData;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  if (initRef.current == null) {
    initRef.current = fetchUser().then((data) => {
      setUser(data);
      setLoading(false);
    });
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return {};
      }
      return { error: data.error || "Login failed" };
    } catch {
      return { error: "Network error" };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return {};
      }
      return { error: data.error || "Registration failed" };
    } catch {
      return { error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext value={{ user, loading, login, register, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
