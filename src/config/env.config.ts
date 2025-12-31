/**
 * Environment Configuration
 *
 * Centralized configuration cho multi-environment setup
 * Tự động switch giữa dev/prod URLs dựa trên build mode
 */

// ==========================================
// Environment Detection
// ==========================================

const APP_ENV =
  import.meta.env.VITE_APP_ENV || import.meta.env.MODE || "development";
const isDevelopment = APP_ENV === "development";
const isProduction = APP_ENV === "production";

// ==========================================
// API Endpoints Configuration
// ==========================================

interface ApiEndpoints {
  chat: string;
  auth: string;
  task: string;
}

/**
 * Development API Endpoints
 */
const DEV_API_ENDPOINTS: ApiEndpoints = {
  chat:
    import.meta.env.VITE_DEV_CHAT_API_URL ||
    "https://vega-chat-api-dev.allianceitsc.com",
  auth:
    import.meta.env.VITE_DEV_AUTH_API_URL ||
    "https://vega-identity-api-dev.allianceitsc.com",
  task:
    import.meta.env.VITE_DEV_TASK_API_URL ||
    "https://vega-task-api-dev.allianceitsc.com",
};

/**
 * Production API Endpoints
 */
const PROD_API_ENDPOINTS: ApiEndpoints = {
  chat:
    import.meta.env.VITE_PROD_CHAT_API_URL ||
    "https://vega-chat-api.allianceitsc.com",
  auth:
    import.meta.env.VITE_PROD_AUTH_API_URL ||
    "https://vega-identity-api.allianceitsc.com",
  task:
    import.meta.env.VITE_PROD_TASK_API_URL ||
    "https://vega-task-api.allianceitsc.com",
};

/**
 * Current API Endpoints (auto-selected based on environment)
 */
export const API_ENDPOINTS: ApiEndpoints = isProduction
  ? PROD_API_ENDPOINTS
  : DEV_API_ENDPOINTS;

// ==========================================
// Feature Flags
// ==========================================

interface FeatureFlags {
  enableSignalR: boolean;
  enableDebugLogs: boolean;
  enableReactQueryDevTools: boolean;
}

const DEV_FEATURE_FLAGS: FeatureFlags = {
  enableSignalR: import.meta.env.VITE_DEV_ENABLE_SIGNALR === "true",
  enableDebugLogs: import.meta.env.VITE_DEV_ENABLE_DEBUG_LOGS === "true",
  enableReactQueryDevTools:
    import.meta.env.VITE_DEV_ENABLE_REACT_QUERY_DEVTOOLS === "true",
};

const PROD_FEATURE_FLAGS: FeatureFlags = {
  enableSignalR: import.meta.env.VITE_PROD_ENABLE_SIGNALR === "true",
  enableDebugLogs: import.meta.env.VITE_PROD_ENABLE_DEBUG_LOGS === "false",
  enableReactQueryDevTools:
    import.meta.env.VITE_PROD_ENABLE_REACT_QUERY_DEVTOOLS === "false",
};

export const FEATURE_FLAGS: FeatureFlags = isProduction
  ? PROD_FEATURE_FLAGS
  : DEV_FEATURE_FLAGS;

// ==========================================
// Environment Info
// ==========================================

export const ENV_INFO = {
  mode: APP_ENV,
  isDevelopment,
  isProduction,
} as const;

// ==========================================
// SignalR Configuration
// ==========================================

export const SIGNALR_CONFIG = {
  hubUrl: `${API_ENDPOINTS.chat}/hubs/chat`,
  enabled: FEATURE_FLAGS.enableSignalR,
} as const;

// ==========================================
// Logging Utility
// ==========================================

/**
 * Log environment configuration (chỉ trong development)
 */
if (isDevelopment && FEATURE_FLAGS.enableDebugLogs) {
  console.group("🔧 Environment Configuration");
  console.log("Environment:", APP_ENV);
  console.log("API Endpoints:", API_ENDPOINTS);
  console.log("Feature Flags:", FEATURE_FLAGS);
  console.log("SignalR:", SIGNALR_CONFIG);
  console.groupEnd();
}

// ==========================================
// Validation (Runtime checks)
// ==========================================

function validateConfig() {
  const errors: string[] = [];

  // Check required API endpoints
  if (!API_ENDPOINTS.chat) errors.push("Missing Chat API URL");
  if (!API_ENDPOINTS.auth) errors.push("Missing Auth API URL");

  // Check URL format
  Object.entries(API_ENDPOINTS).forEach(([key, url]) => {
    if (url && !url.startsWith("http")) {
      errors.push(`Invalid ${key} API URL: ${url}`);
    }
  });

  if (errors.length > 0) {
    console.error("❌ Environment Configuration Errors:");
    errors.forEach((err) => console.error(`  - ${err}`));

    if (isProduction) {
      throw new Error("Invalid environment configuration");
    }
  }
}

validateConfig();

// ==========================================
// Export Default Config Object
// ==========================================

export const ENV_CONFIG = {
  ...ENV_INFO,
  api: API_ENDPOINTS,
  features: FEATURE_FLAGS,
  signalr: SIGNALR_CONFIG,
} as const;

export default ENV_CONFIG;
