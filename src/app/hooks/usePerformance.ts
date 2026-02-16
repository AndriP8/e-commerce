"use client";

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

interface UsePerformanceOptions {
  onMetric?: (metric: {
    name: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
  }) => void;
  enableLogging?: boolean;
}

/**
 * Hook for monitoring Core Web Vitals and performance metrics
 */
export function usePerformance({
  onMetric,
  enableLogging = false,
}: UsePerformanceOptions = {}) {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMetric = (name: string, value: number) => {
      metricsRef.current = {
        ...metricsRef.current,
        [name.toLowerCase()]: value,
      };

      // Determine rating based on Web Vitals thresholds
      let rating: "good" | "needs-improvement" | "poor" = "good";

      switch (name) {
        case "LCP":
          rating =
            value <= 2500
              ? "good"
              : value <= 4000
                ? "needs-improvement"
                : "poor";
          break;
        case "FID":
          rating =
            value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
          break;
        case "CLS":
          rating =
            value <= 0.1
              ? "good"
              : value <= 0.25
                ? "needs-improvement"
                : "poor";
          break;
        case "FCP":
          rating =
            value <= 1800
              ? "good"
              : value <= 3000
                ? "needs-improvement"
                : "poor";
          break;
        case "TTFB":
          rating =
            value <= 800
              ? "good"
              : value <= 1800
                ? "needs-improvement"
                : "poor";
          break;
      }

      if (enableLogging) {
        console.log(`${name}: ${value}ms (${rating})`);
      }

      onMetric?.({ name, value, rating });
    };

    // Monitor LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };
      handleMetric("LCP", lastEntry.startTime);
    });

    // Monitor FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry instanceof PerformanceEventTiming) {
          handleMetric("FID", entry.processingStart - entry.startTime);
        }
      });
    });

    // Monitor CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        // LayoutShift entry type
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value: number;
        };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          handleMetric("CLS", clsValue);
        }
      });
    });

    // Monitor FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          handleMetric("FCP", entry.startTime);
        }
      });
    });

    // Monitor Navigation Timing for TTFB
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const navEntry = entry as PerformanceNavigationTiming;
        if (navEntry.responseStart && navEntry.requestStart) {
          handleMetric("TTFB", navEntry.responseStart - navEntry.requestStart);
        }
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      fidObserver.observe({ entryTypes: ["first-input"] });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      fcpObserver.observe({ entryTypes: ["paint"] });
      navigationObserver.observe({ entryTypes: ["navigation"] });
    } catch (error) {
      console.warn("Performance Observer not supported:", error);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, [onMetric, enableLogging]);

  // Custom performance measurement function
  const customMeasurePerformance = (
    name: string,
    startTime?: number,
    endTime?: number,
  ) => {
    if (typeof window === "undefined") return;

    try {
      if (startTime !== undefined && endTime !== undefined) {
        const duration = endTime - startTime;
        console.log(`${name}: ${duration.toFixed(2)}ms`);
      } else {
        performance.mark(name);
      }
    } catch (error) {
      console.warn("Performance measurement failed:", error);
    }
  };

  return {
    metrics: metricsRef.current,
    measurePerformance: customMeasurePerformance,
  };
}

/**
 * Hook for monitoring resource loading performance
 */
export function useResourcePerformance() {
  const resourceMetrics = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "resource") {
          const resource = entry as PerformanceResourceTiming;
          resourceMetrics.current[resource.name] = resource.duration;
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch (error) {
      console.warn("Resource Performance Observer not supported:", error);
    }

    return () => observer.disconnect();
  }, []);

  return resourceMetrics.current;
}

/**
 * Utility to measure custom performance marks
 */
export function measurePerformance(
  name: string,
  startMark?: string,
  endMark?: string,
) {
  if (typeof window === "undefined") return;

  try {
    if (startMark && endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.mark(name);
    }
  } catch (error) {
    console.warn("Performance measurement failed:", error);
  }
}

/**
 * Get performance metrics summary
 */
export function getPerformanceSummary(): PerformanceMetrics {
  if (typeof window === "undefined") return {};

  const navigation = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType("paint");

  const fcp = paint.find(
    (entry) => entry.name === "first-contentful-paint",
  )?.startTime;
  const ttfb = navigation?.responseStart - navigation?.requestStart;

  return {
    fcp,
    ttfb,
  };
}
