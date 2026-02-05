/**
 * API Client with enhanced error handling and retry logic
 */

import { logger } from "./logger";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultConfig: RequestConfig;
  private apiLogger = logger.child("API");

  constructor(baseUrl: string = "", defaultConfig: RequestConfig = {}) {
    this.baseUrl = baseUrl;
    this.defaultConfig = {
      retries: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...defaultConfig,
    };
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig,
  ): Promise<Response> {
    const timeout = config.timeout || this.defaultConfig.timeout || 30000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithRetry(
    url: string,
    config: RequestConfig,
    attempt: number = 1,
  ): Promise<Response> {
    const maxRetries = config.retries || this.defaultConfig.retries || 3;

    try {
      const response = await this.fetchWithTimeout(url, config);

      // Retry on server errors (5xx) or specific client errors
      if (response.status >= 500 && attempt < maxRetries) {
        const delay =
          config.retryDelay || this.defaultConfig.retryDelay || 1000;
        this.apiLogger.warn(
          `Request failed with ${response.status}, retrying (${attempt}/${maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        return this.fetchWithRetry(url, config, attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        const delay =
          config.retryDelay || this.defaultConfig.retryDelay || 1000;
        this.apiLogger.warn(
          `Request failed, retrying (${attempt}/${maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        return this.fetchWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedConfig = { ...this.defaultConfig, ...config };

    this.apiLogger.debug(`${config.method || "GET"} ${endpoint}`);

    try {
      const response = await this.fetchWithRetry(url, mergedConfig);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData,
        );
      }

      const data = await response.json();
      this.apiLogger.debug(`Response from ${endpoint}`, data);
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        this.apiLogger.error(`API Error: ${error.message}`, error);
        throw error;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      this.apiLogger.error(`Network Error: ${message}`, error);
      throw new ApiError(`Network error: ${message}`);
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// Create and export default API client instance
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";
export const apiClient = new ApiClient(API_BASE_URL);

export default ApiClient;
