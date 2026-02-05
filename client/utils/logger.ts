/**
 * Centralized logging utility for the application
 * Provides consistent logging across client and server
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogConfig {
  enableDebug: boolean;
  enableInfo: boolean;
  enableWarn: boolean;
  enableError: boolean;
  prefix?: string;
}

class Logger {
  private config: LogConfig;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      enableDebug: __DEV__,
      enableInfo: true,
      enableWarn: true,
      enableError: true,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    switch (level) {
      case "debug":
        return this.config.enableDebug;
      case "info":
        return this.config.enableInfo;
      case "warn":
        return this.config.enableWarn;
      case "error":
        return this.config.enableError;
      default:
        return false;
    }
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : "";
    return `[${timestamp}] ${prefix} [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message), ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), error, ...args);

      // In production, you might want to send errors to a service like Sentry
      if (!__DEV__ && error instanceof Error) {
        // TODO: Send to error tracking service
      }
    }
  }

  /**
   * Create a child logger with a specific prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    });
  }
}

// Export a singleton instance
export const logger = new Logger({ prefix: "YKS-Boost" });

// Export the class for creating custom instances
export default Logger;
