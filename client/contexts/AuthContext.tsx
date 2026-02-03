import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getApiUrl } from "@/lib/query-client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "attendee" | "staff";
  qrCodeValue: string;
  checkedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; needsPassword?: boolean; error?: string }>;
  setPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function removeToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string): Promise<User | null> => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/auth/me", baseUrl).href, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const userData = await fetchUser(token);
          if (userData) {
            setUser(userData);
          } else {
            await removeToken();
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; needsPassword?: boolean; error?: string }> => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/auth/login", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200 && data.token) {
        await setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      if (response.status === 202 && data.needsPassword) {
        return { success: false, needsPassword: true };
      }

      return { success: false, error: data.message || "Login failed" };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const setPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/auth/set-password", baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.message || "Failed to set password" };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const token = await getToken();
    if (token) {
      const userData = await fetchUser(token);
      if (userData) {
        setUser(userData);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        setPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
