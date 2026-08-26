"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/contracts";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  walletAddress: string | null;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  linkWallet: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data.user);
    if (data.user.role === "BEEKEEPER") {
      router.push("/dashboard/beekeeper");
    } else if (data.user.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/supply-chain");
    }
  };

  const register = async (userData: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data.user);
    if (data.user.role === "BEEKEEPER") {
      router.push("/dashboard/beekeeper");
    } else {
      router.push("/dashboard/supply-chain");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  const linkWallet = async (walletAddress: string) => {
    const res = await fetch("/api/auth/link-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, linkWallet, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
