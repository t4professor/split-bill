"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  authApi,
  setAuthToken,
  removeAuthToken,
  setAuthUser,
  removeAuthUser,
  getAuthUser,
  getAuthToken,
} from "@/lib/api";
import {
  AuthContextType,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from "@/lib/types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = getAuthUser();

        if (token && userData) {
          // Validate token by fetching fresh user data
          try {
            const freshUser = await authApi.getProfile();
            setUser(freshUser);
            setAuthUser(freshUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear everything
            console.error("Invalid token, clearing auth data:", error);
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    removeAuthToken();
    removeAuthUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Login implementation
  const login = async (userNameOrEmail: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authApi.login({ userNameOrEmail, password });

      // Store token and user data
      setAuthToken(response.access_token);
      setAuthUser(response.user);

      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Clear any existing auth data on failed login
      clearAuthData();

      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register implementation
  const register = async (data: RegisterRequest) => {
    setIsLoading(true);

    try {
      const response = await authApi.register(data);

      // After successful registration, we need to login
      // The register response doesn't include a token, so we login with the credentials
      await login(data.userName, data.password);
    } catch (error) {
      // Clear any existing auth data on failed registration
      clearAuthData();

      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout implementation
  const logout = () => {
    clearAuthData();
  };

  const refreshProfile = async () => {
    if (!isAuthenticated) {
      throw new Error("User not authenticated");
    }

    try {
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
      setAuthUser(freshUser);
    } catch (error) {
      console.error("Failed to refresh profile:", error);

      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("Unauthorized"))
      ) {
        clearAuthData();
      }

      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    if (!isAuthenticated) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await authApi.updateProfile(data);

      setUser(response.user);
      setAuthUser(response.user);
    } catch (error) {
      console.error("Failed to update profile:", error);

      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("Unauthorized"))
      ) {
        clearAuthData();
      }

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
