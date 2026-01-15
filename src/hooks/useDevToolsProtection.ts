/**
 * DevTools protection hook
 * Blocks developer tools keyboard shortcuts and detects if DevTools is open
 */

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { detectDevTools } from "@/utils/security/detectDevTools";
import { securityConfig } from "@/config/security.config";

/**
 * Hook to protect against developer tools usage
 * @param enabled - Whether protection is enabled
 */
export function useDevToolsProtection(enabled: boolean) {
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+C (Element picker)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Detection loop
    const startDetection = () => {
      intervalRef.current = window.setInterval(() => {
        try {
          if (detectDevTools()) {
            const action = securityConfig.devToolsProtection.action;

            if (action === "toast") {
              toast.error("Developer Tools không được phép sử dụng");
            } else if (action === "modal") {
              // Simple blocking alert for now
              alert("Developer Tools không được phép sử dụng");
            } else if (action === "redirect") {
              window.location.href =
                securityConfig.devToolsProtection.redirectUrl || "/blocked";
            }
          }
        } catch (error) {
          console.error("[DevTools Protection] Detection error:", error);
        }
      }, securityConfig.devToolsProtection.detectionInterval);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    startDetection();

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
}
