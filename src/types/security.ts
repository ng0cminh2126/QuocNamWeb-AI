/**
 * Security module types
 * Defines interfaces for client-side security protection features
 */

export interface SecurityConfig {
  devToolsProtection: DevToolsProtectionConfig;
  contextMenuProtection: ContextMenuProtectionConfig;
  contentProtection: ContentProtectionConfig;
  whitelist: WhitelistConfig;
}

export interface DevToolsProtectionConfig {
  enabled: boolean;
  detectionInterval: number; // milliseconds
  action: "toast" | "modal" | "redirect";
  redirectUrl?: string;
}

export interface ContextMenuProtectionConfig {
  enabled: boolean;
  allowOnInputs: boolean;
  showCustomMenu: boolean;
}

export interface ContentProtectionConfig {
  enabled: boolean;
  fileTypes: string[];
  showWarning: boolean;
}

export interface WhitelistConfig {
  emails: string[];
}

export type ProtectionType = "devtools" | "contextmenu" | "content";

export interface ProtectionEvent {
  type: ProtectionType;
  timestamp: Date;
  userEmail?: string;
  details?: Record<string, unknown>;
}
