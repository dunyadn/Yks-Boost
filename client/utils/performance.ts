/**
 * Performance monitoring utilities
 * Helps track and optimize app performance
 */

import { logger } from "./logger";

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly performanceLogger = logger.child("Performance");

  /**
   * Start tracking a performance metric
   */
  start(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: Date.now(),
    });
    this.performanceLogger.debug(`Started: ${name}`);
  }

  /**
   * Stop tracking and log the metric
   */
  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      this.performanceLogger.warn(`Metric not found: ${name}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    this.performanceLogger.info(`${name} completed in ${duration}ms`);

    // Clean up
    this.metrics.delete(name);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Create a performance decorator for class methods
   */
  createDecorator(metricName: string) {
    return (
      _target: unknown,
      _propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: unknown[]) {
        return performanceMonitor.measure(metricName, () =>
          originalMethod.apply(this, args)
        );
      };

      return descriptor;
    };
  }

  /**
   * Get all current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for custom instances
export default PerformanceMonitor;
