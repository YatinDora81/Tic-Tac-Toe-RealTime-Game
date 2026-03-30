"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as api from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  playAnonymous: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.getMe()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.signin(email, password);
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await api.signup(name, email, password);
    setUser(user);
  }, []);

  const playAnonymous = useCallback(async (name: string) => {
    const { user } = await api.playAnonymous(name);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await api.signout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, playAnonymous, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
