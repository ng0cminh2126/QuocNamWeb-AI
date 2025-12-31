/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Environment
  readonly VITE_APP_ENV: "development" | "production";

  // Development URLs
  readonly VITE_DEV_CHAT_API_URL: string;
  readonly VITE_DEV_AUTH_API_URL: string;
  readonly VITE_DEV_TASK_API_URL: string;

  // Production URLs
  readonly VITE_PROD_CHAT_API_URL: string;
  readonly VITE_PROD_AUTH_API_URL: string;
  readonly VITE_PROD_TASK_API_URL: string;

  // Feature Flags - Development
  readonly VITE_DEV_ENABLE_SIGNALR: string;
  readonly VITE_DEV_ENABLE_DEBUG_LOGS: string;
  readonly VITE_DEV_ENABLE_REACT_QUERY_DEVTOOLS: string;

  // Feature Flags - Production
  readonly VITE_PROD_ENABLE_SIGNALR: string;
  readonly VITE_PROD_ENABLE_DEBUG_LOGS: string;
  readonly VITE_PROD_ENABLE_REACT_QUERY_DEVTOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
