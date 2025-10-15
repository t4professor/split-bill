"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  // for the app we expose an async login that accepts email/password
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string
  ) => Promise<void>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string | null;
  }) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  // default no-op implementations
  login: async () => {},
  register: async () => {},
  updateProfile: () => {},
  logout: () => {},
  isLoading: false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Luôn đồng bộ user với localStorage khi mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Khi đăng nhập, cập nhật user và localStorage
  // The UI calls login(email, password) and expects a Promise
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Demo mode: accept any email/password. In real app call API here.
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 300));

    // reference password so linters don't complain (do NOT log it in real apps)
    void password;

    const fakeToken = btoa(`${email}:${Date.now()}`);
  const userData: User = { name: email.split("@")[0] || email, email };

    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    // Demo: accept any registration and directly login the user
    await new Promise((res) => setTimeout(res, 300));

    // reference password so linters don't complain (don't log real passwords)
    void password;

    const fakeToken = btoa(`${email}:${Date.now()}`);
    const userData: User = {
      name: name || email.split("@")[0] || email,
      email,
    };

    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  // Khi đăng xuất, xóa user và localStorage
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (data: {
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string | null;
  }) => {
    // update localStorage user object
    try {
      const existing = localStorage.getItem("user");
      const parsed = existing ? JSON.parse(existing) : {};
      const next = {
        ...parsed,
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.avatarUrl !== undefined
          ? data.avatarUrl === null
            ? { avatarUrl: undefined }
            : { avatarUrl: data.avatarUrl }
          : {}),
      };
      localStorage.setItem("user", JSON.stringify(next));
      if (data.phone !== undefined) {
        localStorage.setItem("phone", data.phone);
      }
      const sanitized = { ...next };
      if (data.avatarUrl === null) {
        delete sanitized.avatarUrl;
      }
      setUser(sanitized as User);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        updateProfile,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
