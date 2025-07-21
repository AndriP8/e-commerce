"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === "production") {
      // You can send to your analytics service here
      // Example: analytics.track('Web Vitals', metric);
      
      // For now, we'll use a simple beacon API
      if (navigator.sendBeacon) {
        const body = JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          rating: metric.rating,
          navigationType: metric.navigationType,
          url: window.location.href,
          timestamp: Date.now(),
        });

        navigator.sendBeacon('/api/web-vitals', body);
      }
    }

    // Track specific metrics for optimization
    switch (metric.name) {
      case 'LCP':
        if (metric.value > 2500) {
          console.warn('LCP is slow:', metric.value);
        }
        break;
      case 'FID':
        if (metric.value > 100) {
          console.warn('FID is slow:', metric.value);
        }
        break;
      case 'CLS':
        if (metric.value > 0.1) {
          console.warn('CLS is high:', metric.value);
        }
        break;
      case 'FCP':
        if (metric.value > 1800) {
          console.warn('FCP is slow:', metric.value);
        }
        break;
      case 'TTFB':
        if (metric.value > 800) {
          console.warn('TTFB is slow:', metric.value);
        }
        break;
    }
  });

  return null;
}