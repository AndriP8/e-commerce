"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { User } from "../[locale]/(user-facing)/layout";
import { useCsrf } from "./CsrfContext";

type ContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isLoading: boolean;
};
const AuthContext = createContext<ContextType>({} as ContextType);

const fetchUser = async (): Promise<{ data: { user: User } } | null> => {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setLoading] = useState(true);

  const router = useRouter();
  const { csrfFetch } = useCsrf();

  const checkUser = useCallback(async () => {
    if (user) {
      return;
    }
    setLoading(true);
    const response = await fetchUser();
    const userData = response?.data.user || null;

    setUser(userData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await csrfFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Login failed");
        return false;
      }

      const data = await response.json();
      // Fetch complete user data after login
      const userResponse = await fetch("/api/auth/me");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data.user);
      } else {
        // Fallback to basic user data if /me fails
        setUser(data.user);
      }
      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("An unexpected error occurred during login.");
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await csrfFetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Logout failed");
        return false;
      }

      setUser(null);
      toast.success("Logged out successfully!");
      router.push("/login");
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("An unexpected error occurred during logout.");
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await csrfFetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Registration failed");
        return false;
      }

      // Fetch complete user data after registration
      const userResponse = await fetch("/api/auth/me");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data.user);
      }
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("An unexpected error occurred during registration.");
      return false;
    }
  };
  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return useContext(AuthContext);
};
