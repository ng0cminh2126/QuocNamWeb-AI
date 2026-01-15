/**
 * Security configuration
 * Loads security settings from environment variables
 */

import type { SecurityConfig } from "@/types/security";

export const securityConfig: SecurityConfig = {
  devToolsProtection: {
    enabled: import.meta.env.VITE_ENABLE_DEVTOOLS_PROTECTION === "true",
    detectionInterval: 1000, // 1 second
    action:
      (import.meta.env.VITE_DEVTOOLS_ACTION as
        | "toast"
        | "modal"
        | "redirect") || "toast",
    redirectUrl: "/blocked",
  },
  contextMenuProtection: {
    enabled: import.meta.env.VITE_ENABLE_CONTEXT_MENU_PROTECTION === "true",
    allowOnInputs: true, // Allow right-click on inputs/textareas
    showCustomMenu: false, // Don't show custom menu (just block)
  },
  contentProtection: {
    enabled: import.meta.env.VITE_ENABLE_CONTENT_PROTECTION === "true",
    fileTypes: import.meta.env.VITE_CONTENT_PROTECTION_FILE_TYPES?.split(
      ","
    ) || ["pdf", "docx", "xlsx"],
    showWarning: true, // Show toast when copy is blocked
  },
  whitelist: {
    emails: import.meta.env.VITE_SECURITY_WHITELIST_EMAILS?.split(",") || [],
  },
};
