import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, getStoredToken, login as apiLogin, logout as apiLogout, subscribeToAuthExpired } from "../api/client";
import type { User } from "../api/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }

      try {
        setUser(await getMe());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void hydrate();
  }, []);

  useEffect(() => {
    return subscribeToAuthExpired(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  async function login(input: { username: string; password: string }) {
    const payload = await apiLogin(input);
    setUser(payload.user);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
}
