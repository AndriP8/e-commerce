"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CSRF_TOKEN_HEADER } from "../utils/csrf";

interface CsrfContextType {
  csrfToken: string | null;
  refreshToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType>({
  csrfToken: null,
  refreshToken: async () => {},
});

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/csrf");
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }, []);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  return (
    <CsrfContext.Provider value={{ csrfToken, refreshToken }}>
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrf() {
  const { csrfToken, refreshToken } = useContext(CsrfContext);

  const csrfFetch = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const headers = new Headers(options.headers);

    const method = options.method?.toUpperCase() || "GET";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      if (csrfToken) {
        headers.set(CSRF_TOKEN_HEADER, csrfToken);
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { csrfToken, refreshToken, csrfFetch };
}
