/**
 * Context menu protection hook
 * Blocks right-click context menu to prevent inspect element
 */

import { useEffect } from "react";
import { securityConfig } from "@/config/security.config";
import { isEditableElement } from "@/utils/security/protectionHelpers";

/**
 * Hook to protect against right-click inspect
 * @param enabled - Whether protection is enabled
 */
export function useContextMenuProtection(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Allow context menu on inputs/textareas if configured
      if (
        securityConfig.contextMenuProtection.allowOnInputs &&
        isEditableElement(target)
      ) {
        return; // Allow default
      }

      // Block context menu
      e.preventDefault();
      e.stopPropagation();

      // Custom menu not implemented (per decision #5)
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [enabled]);
}
