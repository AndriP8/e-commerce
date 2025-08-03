// TODO: Operation name must be type safe
type PerformanceOperation =
  | "total"
  | "api-response"
  | "db-query"
  | "currency-conversion"
  | "render";

interface PerformanceMetrics {
  timestamp: number;
  operation: PerformanceOperation;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface DetailedMetrics {
  totalTime: number;
  apiResponseTime?: number;
  dbQueryTime?: number;
  currencyConversionTime?: number;
  renderTime?: number;
  breakdown: PerformanceMetrics[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private timers: Map<PerformanceOperation, number> = new Map();

  start(operation: PerformanceOperation = "total"): void {
    const now = performance.now();
    this.timers.set(operation, now);
    if (operation === "total") {
      this.metrics = [];
    }
  }

  end(
    operation: PerformanceOperation = "total",
    metadata?: Record<string, unknown>,
  ): number {
    const endTime = performance.now();
    const startTime = this.timers.get(operation);

    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = endTime - startTime;

    this.metrics.push({
      timestamp: startTime,
      operation,
      duration,
      metadata,
    });

    this.timers.delete(operation);
    return duration;
  }

  getDetailedMetrics(): DetailedMetrics {
    const totalTime =
      this.metrics.find((m) => m.operation === "total")?.duration || 0;
    const apiResponseTime = this.metrics.find(
      (m) => m.operation === "api-response",
    )?.duration;
    const dbQueryTime = this.metrics.find(
      (m) => m.operation === "db-query",
    )?.duration;
    const currencyConversionTime = this.metrics.find(
      (m) => m.operation === "currency-conversion",
    )?.duration;
    const renderTime = this.metrics.find(
      (m) => m.operation === "render",
    )?.duration;

    return {
      totalTime,
      apiResponseTime,
      dbQueryTime,
      currencyConversionTime,
      renderTime,
      breakdown: [...this.metrics],
    };
  }

  identifyBottlenecks(): string[] {
    const metrics = this.getDetailedMetrics();
    const bottlenecks: string[] = [];

    // Define thresholds (in milliseconds)
    const thresholds = {
      totalTime: 2000,
      apiResponseTime: 1000,
      dbQueryTime: 500,
      currencyConversionTime: 200,
      renderTime: 100,
    };

    if (metrics.totalTime > thresholds.totalTime) {
      bottlenecks.push(
        `Total time (${metrics.totalTime.toFixed(2)}ms) exceeds threshold`,
      );
    }

    if (
      metrics.apiResponseTime &&
      metrics.apiResponseTime > thresholds.apiResponseTime
    ) {
      bottlenecks.push(
        `API response time (${metrics.apiResponseTime.toFixed(2)}ms) is slow`,
      );
    }

    if (metrics.dbQueryTime && metrics.dbQueryTime > thresholds.dbQueryTime) {
      bottlenecks.push(
        `Database query time (${metrics.dbQueryTime.toFixed(2)}ms) is slow`,
      );
    }

    if (
      metrics.currencyConversionTime &&
      metrics.currencyConversionTime > thresholds.currencyConversionTime
    ) {
      bottlenecks.push(
        `Currency conversion (${metrics.currencyConversionTime.toFixed(
          2,
        )}ms) is slow`,
      );
    }

    if (metrics.renderTime && metrics.renderTime > thresholds.renderTime) {
      bottlenecks.push(
        `Frontend rendering (${metrics.renderTime.toFixed(2)}ms) is slow`,
      );
    }

    return bottlenecks;
  }

  logResults(context: string = "Performance"): void {
    const metrics = this.getDetailedMetrics();
    const bottlenecks = this.identifyBottlenecks();

    console.group(`🔍 ${context} Analysis`);
    console.log("📊 Detailed Metrics:", {
      "Total Time": `${metrics.totalTime.toFixed(2)}ms`,
      "API Response": metrics.apiResponseTime
        ? `${metrics.apiResponseTime.toFixed(2)}ms`
        : "N/A",
      "DB Query": metrics.dbQueryTime
        ? `${metrics.dbQueryTime.toFixed(2)}ms`
        : "N/A",
      "Currency Conversion": metrics.currencyConversionTime
        ? `${metrics.currencyConversionTime.toFixed(2)}ms`
        : "N/A",
      "Frontend Render": metrics.renderTime
        ? `${metrics.renderTime.toFixed(2)}ms`
        : "N/A",
    });

    if (bottlenecks.length > 0) {
      console.warn("⚠️ Performance Bottlenecks:", bottlenecks);
    } else {
      console.log("✅ No significant bottlenecks detected");
    }

    console.log("📋 Full Breakdown:", metrics.breakdown);
    console.groupEnd();
  }
}

// Singleton instance for global use
export const performanceMonitor = new PerformanceMonitor();

// Utility function for measuring async operations
export async function measureAsync<T>(
  operation: PerformanceOperation,
  asyncFn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  performanceMonitor.start(operation);
  try {
    const result = await asyncFn();
    performanceMonitor.end(operation, metadata);
    return result;
  } catch (error) {
    performanceMonitor.end(operation, { ...metadata, error: true });
    throw error;
  }
}

// Utility function for measuring sync operations
export function measureSync<T>(
  operation: PerformanceOperation,
  syncFn: () => T,
  metadata?: Record<string, unknown>,
): T {
  performanceMonitor.start(operation);
  try {
    const result = syncFn();
    performanceMonitor.end(operation, metadata);
    return result;
  } catch (error) {
    performanceMonitor.end(operation, { ...metadata, error: true });
    throw error;
  }
}

export type { PerformanceMetrics, DetailedMetrics, PerformanceOperation };
