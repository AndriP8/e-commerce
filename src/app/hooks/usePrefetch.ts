"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type NetworkEffectiveType = "slow-2g" | "2g" | "3g" | "4g";

interface NetworkInformation extends EventTarget {
  effectiveType: NetworkEffectiveType;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: "change", listener: EventListener): void;
  removeEventListener(type: "change", listener: EventListener): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

/**
 * Check if network conditions allow prefetching
 * Avoids prefetching on slow connections to save bandwidth
 */
export function canPrefetch(): boolean {
  if (typeof navigator === "undefined") return true;

  const connection = navigator.connection;
  if (!connection) return true;

  // Don't prefetch on slow connections or if user has data saver enabled
  if (connection.saveData) return false;

  const slowConnections: NetworkEffectiveType[] = ["slow-2g", "2g"];
  if (slowConnections.includes(connection.effectiveType)) return false;

  return true;
}

/**
 * Hook to get current network effective type
 */
export function useNetworkType(): NetworkEffectiveType | null {
  const [effectiveType, setEffectiveType] =
    useState<NetworkEffectiveType | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const connection = navigator.connection;
    if (!connection) return;

    setEffectiveType(connection.effectiveType);

    const handleChange = () => {
      setEffectiveType(connection.effectiveType);
    };

    connection.addEventListener("change", handleChange);
    return () => connection.removeEventListener("change", handleChange);
  }, []);

  return effectiveType;
}

/**
 * Hook for debounced prefetching on hover
 * @param delay - Debounce delay in ms (default: 300ms)
 */
export function useHoverPrefetch(delay: number = 300) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetch = useCallback(
    (href: string) => {
      // Skip if already prefetched or can't prefetch
      if (prefetchedRef.current.has(href) || !canPrefetch()) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        router.prefetch(href);
        prefetchedRef.current.add(href);
      }, delay);
    },
    [router, delay],
  );

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { prefetch, cancelPrefetch };
}

/**
 * Hook for delayed prefetching (e.g., prefetch checkout after being on cart page)
 * @param href - URL to prefetch
 * @param delay - Delay in ms before prefetching
 */
export function useDelayedPrefetch(href: string, delay: number = 2000) {
  const router = useRouter();
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (prefetchedRef.current || !canPrefetch()) return;

    const timeout = setTimeout(() => {
      router.prefetch(href);
      prefetchedRef.current = true;
    }, delay);

    return () => clearTimeout(timeout);
  }, [router, href, delay]);
}

/**
 * Hook for prefetching multiple routes
 * Useful for prefetching popular search results
 */
export function usePrefetchRoutes(routes: string[], delay: number = 0) {
  const router = useRouter();
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (prefetchedRef.current || !canPrefetch()) return;

    const timeout = setTimeout(() => {
      routes.forEach((route) => {
        router.prefetch(route);
      });
      prefetchedRef.current = true;
    }, delay);

    return () => clearTimeout(timeout);
  }, [router, routes, delay]);
}
