"use client";

import { useEffect, useState } from "react";
import { usePerformance } from "@/app/hooks/usePerformance";

interface PerformanceDashboardProps {
  enabled?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export default function PerformanceDashboard({
  enabled = process.env.NODE_ENV === "development",
  position = "bottom-right",
}: PerformanceDashboardProps) {
  const { metrics } = usePerformance();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Show dashboard only if enabled and we have metrics
    setIsVisible(enabled && Object.keys(metrics).length > 0);
  }, [enabled, metrics]);

  if (!isVisible) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const getMetricColor = (
    value: number,
    thresholds: { good: number; poor: number },
  ) => {
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.poor) return "text-yellow-600";
    return "text-red-600";
  };

  const formatMetric = (value: number, unit: string = "ms") => {
    if (unit === "ms") {
      return value < 1000
        ? `${Math.round(value)}ms`
        : `${(value / 1000).toFixed(2)}s`;
    }
    return `${value.toFixed(3)}${unit}`;
  };

  const getRating = (
    value: number,
    thresholds: { good: number; poor: number },
  ) => {
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.poor) return "needs-improvement";
    return "poor";
  };

  const coreWebVitals = [
    {
      name: "LCP",
      value: metrics.lcp,
      rating: metrics.lcp
        ? getRating(metrics.lcp, { good: 2500, poor: 4000 })
        : undefined,
      thresholds: { good: 2500, poor: 4000 },
      description: "Largest Contentful Paint",
    },
    {
      name: "FID",
      value: metrics.fid,
      rating: metrics.fid
        ? getRating(metrics.fid, { good: 100, poor: 300 })
        : undefined,
      thresholds: { good: 100, poor: 300 },
      description: "First Input Delay",
    },
    {
      name: "CLS",
      value: metrics.cls,
      rating: metrics.cls
        ? getRating(metrics.cls, { good: 0.1, poor: 0.25 })
        : undefined,
      thresholds: { good: 0.1, poor: 0.25 },
      description: "Cumulative Layout Shift",
      unit: "",
    },
    {
      name: "FCP",
      value: metrics.fcp,
      rating: metrics.fcp
        ? getRating(metrics.fcp, { good: 1800, poor: 3000 })
        : undefined,
      thresholds: { good: 1800, poor: 3000 },
      description: "First Contentful Paint",
    },
    {
      name: "TTFB",
      value: metrics.ttfb,
      rating: metrics.ttfb
        ? getRating(metrics.ttfb, { good: 800, poor: 1800 })
        : undefined,
      thresholds: { good: 800, poor: 1800 },
      description: "Time to First Byte",
    },
  ];

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 font-mono text-xs`}
    >
      <div className="bg-black bg-opacity-90 text-white rounded-lg shadow-lg border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-600">
          <span className="font-semibold text-green-400">⚡ Performance</span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-3 space-y-2 min-w-[200px]">
            {/* Core Web Vitals */}
            <div className="space-y-1">
              <h4 className="text-yellow-400 font-semibold mb-2">
                Core Web Vitals
              </h4>
              {coreWebVitals.map((metric) => (
                <div
                  key={metric.name}
                  className="flex justify-between items-center"
                >
                  <span
                    className="text-gray-300 cursor-help"
                    title={metric.description}
                  >
                    {metric.name}:
                  </span>
                  <span
                    className={
                      metric.value !== undefined
                        ? getMetricColor(metric.value, metric.thresholds)
                        : "text-gray-500"
                    }
                  >
                    {metric.value !== undefined
                      ? formatMetric(metric.value, metric.unit)
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Metrics */}
            {Object.keys(metrics).some(
              (key) => !["lcp", "fid", "cls", "fcp", "ttfb"].includes(key),
            ) && (
              <div className="space-y-1 border-t border-gray-600 pt-2">
                <h4 className="text-blue-400 font-semibold mb-2">
                  Custom Metrics
                </h4>
                {Object.entries(metrics)
                  .filter(
                    ([key]) =>
                      !["lcp", "fid", "cls", "fcp", "ttfb"].includes(key),
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-300">{key}:</span>
                      <span className="text-cyan-400">
                        {typeof value === "number"
                          ? formatMetric(value)
                          : "N/A"}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Performance Summary */}
            <div className="border-t border-gray-600 pt-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Overall:</span>
                <span
                  className={
                    coreWebVitals.every((m) => m.rating === "good")
                      ? "text-green-400"
                      : coreWebVitals.some((m) => m.rating === "poor")
                      ? "text-red-400"
                      : "text-yellow-400"
                  }
                >
                  {coreWebVitals.every((m) => m.rating === "good")
                    ? "Good"
                    : coreWebVitals.some((m) => m.rating === "poor")
                    ? "Poor"
                    : "Needs Improvement"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
