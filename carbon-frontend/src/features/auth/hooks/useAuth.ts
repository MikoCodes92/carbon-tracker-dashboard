// src/features/auth/hooks/useAuth.ts
import { useState, useCallback } from "react";
import { message } from "antd";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      const user: User = {
        id: "1",
        email,
        name: email.split("@")[0],
      };

      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });

      message.success("Welcome back!");
      return true;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      message.error("Login failed. Please try again.");
      return false;
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setAuthState((prev) => ({ ...prev, loading: true }));

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock successful signup
        const user: User = {
          id: "1",
          email,
          name,
        };

        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });

        message.success("Account created successfully!");
        return true;
      } catch (error) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        message.error("Signup failed. Please try again.");
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    message.success("Logged out successfully");
  }, []);

  return {
    ...authState,
    login,
    signup,
    logout,
  };
};
