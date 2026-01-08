"use client";

import { useCsrf } from "@/app/contexts/CsrfContext";
import { CSRF_TOKEN_HEADER } from "./csrf";

interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export function useApi() {
  const { csrfToken, refreshToken } = useCsrf();

  async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
    options?: ApiRequestOptions,
    isRetry = false,
  ): Promise<Response> {
    const headers = new Headers(options?.headers);

    const statefulMethods = ["POST", "PUT", "DELETE", "PATCH"];
    if (statefulMethods.includes(method) && csrfToken) {
      headers.set(CSRF_TOKEN_HEADER, csrfToken);
    }

    if (data !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const requestOptions: RequestInit = {
      ...options,
      method,
      headers,
      body: data !== undefined ? JSON.stringify(data) : options?.body,
    };

    const response = await fetch(url, requestOptions);

    // Retry logic on 403 (Invalid CSRF token)
    if (response.status === 403 && !isRetry) {
      try {
        await refreshToken();
        return apiRequest(method, url, data, options, true);
      } catch (error) {
        console.error("Failed to refresh CSRF token:", error);
        return response; // Return original 403 response
      }
    }

    return response;
  }

  return {
    get: (url: string, options?: ApiRequestOptions): Promise<Response> => {
      return apiRequest("GET", url, undefined, options);
    },

    post: (url: string, data?: unknown, options?: ApiRequestOptions): Promise<Response> => {
      return apiRequest("POST", url, data, options);
    },

    put: (url: string, data?: unknown, options?: ApiRequestOptions): Promise<Response> => {
      return apiRequest("PUT", url, data, options);
    },
    delete: (url: string, options?: ApiRequestOptions): Promise<Response> => {
      return apiRequest("DELETE", url, undefined, options);
    },
  };
}
