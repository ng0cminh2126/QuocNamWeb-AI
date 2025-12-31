/**
 * Example: API Client Factory với Environment Config
 *
 * Demo cách sử dụng env.config.ts để tạo service-specific clients
 */

import axios, { AxiosInstance } from "axios";
import {
  CHAT_API_CONFIG,
  AUTH_API_CONFIG,
  TASK_API_CONFIG,
} from "@/config/api.config";
import { ENV_INFO } from "@/config/env.config";
import { getAccessToken } from "@/lib/auth/tokenStorage";

interface CreateClientOptions {
  baseURL: string;
  timeout: number;
  retries: number;
  requiresAuth?: boolean;
  serviceName: string;
}

/**
 * Factory function để tạo API client với retry logic
 */
export function createApiClient(options: CreateClientOptions): AxiosInstance {
  const { baseURL, timeout, requiresAuth = true, serviceName } = options;

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - Add auth token
  if (requiresAuth) {
    client.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Response interceptor - Error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (ENV_INFO.isDevelopment) {
        console.error(`[${serviceName}] API Error:`, error);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// ==========================================
// Service-Specific Clients
// ==========================================

/**
 * Chat API Client
 * Auto-uses correct URL based on environment
 */
export const chatApiClient = createApiClient({
  ...CHAT_API_CONFIG,
  serviceName: "ChatAPI",
  requiresAuth: true,
});

/**
 * Auth/Identity API Client
 */
export const authApiClient = createApiClient({
  ...AUTH_API_CONFIG,
  serviceName: "AuthAPI",
  requiresAuth: false, // Auth endpoints không cần token
});

/**
 * Task API Client
 */
export const taskApiClient = createApiClient({
  ...TASK_API_CONFIG,
  serviceName: "TaskAPI",
  requiresAuth: true,
});

// ==========================================
// Example Usage
// ==========================================

/*
// In your API modules:

// src/api/conversations.api.ts
import { chatApiClient } from './clients';

export async function getConversations() {
  const response = await chatApiClient.get('/api/conversations');
  return response.data;
}

// src/api/auth.api.ts
import { authApiClient } from './clients';

export async function login(credentials: LoginRequest) {
  const response = await authApiClient.post('/api/auth/login', credentials);
  return response.data;
}

// src/api/tasks.api.ts
import { taskApiClient } from './clients';

export async function getTasks() {
  const response = await taskApiClient.get('/api/tasks');
  return response.data;
}
*/
