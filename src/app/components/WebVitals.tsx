"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "production") return;

    const isDisableLog =
      process.env.NEXT_PUBLIC_DISABLE_WEB_VITALS_LOG === "true";

    if (isDisableLog) return;

    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, metric);
    }

    // Track specific metrics for optimization
    switch (metric.name) {
      case "LCP":
        if (metric.value > 2500) {
          console.warn("LCP is slow:", metric.value);
        }
        break;
      case "INP":
        if (metric.value > 200) {
          console.warn("INP is slow:", metric.value);
        }
        break;
      case "FID":
        if (metric.value > 100) {
          console.warn("FID is slow:", metric.value);
        }
        break;
      case "CLS":
        if (metric.value > 0.1) {
          console.warn("CLS is high:", metric.value);
        }
        break;
      case "FCP":
        if (metric.value > 1800) {
          console.warn("FCP is slow:", metric.value);
        }
        break;
      case "TTFB":
        if (metric.value > 800) {
          console.warn("TTFB is slow:", metric.value);
        }
        break;
    }
  });

  return null;
}
