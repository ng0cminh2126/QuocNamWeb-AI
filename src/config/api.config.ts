/**
 * API Configuration
 *
 * Service-specific configurations cho API clients
 * Sử dụng endpoints từ env.config.ts
 */

import { API_ENDPOINTS } from "./env.config";

export interface ServiceConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

// ==========================================
// Chat Service Configuration
// ==========================================

export const CHAT_API_CONFIG: ServiceConfig = {
  baseURL: API_ENDPOINTS.chat,
  timeout: 30000, // 30s
  retries: 3,
};

// ==========================================
// Auth Service Configuration
// ==========================================

export const AUTH_API_CONFIG: ServiceConfig = {
  baseURL: API_ENDPOINTS.auth,
  timeout: 15000, // 15s
  retries: 2,
};

// ==========================================
// Task Service Configuration
// ==========================================

export const TASK_API_CONFIG: ServiceConfig = {
  baseURL: API_ENDPOINTS.task,
  timeout: 30000, // 30s
  retries: 3,
};

// ==========================================
// Export All Configs
// ==========================================

export const API_CONFIG = {
  chat: CHAT_API_CONFIG,
  auth: AUTH_API_CONFIG,
  task: TASK_API_CONFIG,
} as const;

export default API_CONFIG;
