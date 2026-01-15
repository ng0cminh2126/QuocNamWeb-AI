# [BƯỚC 4] Implementation Plan - Client-Side Protection

> **Feature:** Client-Side Security Protection  
> **Module:** Security  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Overview

Chi tiết implementation plan cho Client-Side Protection features, bao gồm:

1. File structure
2. Implementation details per file
3. Integration points
4. Migration strategy

---

## 1. File Structure

```
src/
├── config/
│   └── security.config.ts          # 🆕 Security configuration
├── types/
│   └── security.ts                 # 🆕 Security types
├── utils/
│   └── security/                   # 🆕 Security utilities
│       ├── index.ts
│       ├── detectDevTools.ts
│       └── protectionHelpers.ts
├── hooks/
│   ├── useSecurity.ts              # 🆕 Main security hook
│   ├── useDevToolsProtection.ts    # 🆕 DevTools blocking
│   ├── useContextMenuProtection.ts # 🆕 Right-click blocking
│   └── useContentProtection.ts     # 🆕 Copy protection
├── App.tsx                         # ✏️ Integrate useSecurity
└── features/portal/
    └── workspace/
        └── FilePreview.tsx         # ✏️ Integrate useContentProtection (if exists)

.env.example                        # ✏️ Add security flags
README.md                           # ✏️ Document security features
```

---

## 2. Implementation Details

### 2.1 Security Configuration

**File:** `src/config/security.config.ts`

```typescript
interface SecurityConfig {
  devToolsProtection: {
    enabled: boolean;
    detectionInterval: number; // milliseconds
    action: "toast" | "modal" | "redirect";
    redirectUrl?: string;
  };
  contextMenuProtection: {
    enabled: boolean;
    allowOnInputs: boolean;
    showCustomMenu: boolean;
  };
  contentProtection: {
    enabled: boolean;
    fileTypes: string[];
    showWarning: boolean;
  };
  whitelist: {
    emails: string[];
  };
}

export const securityConfig: SecurityConfig = {
  devToolsProtection: {
    enabled: import.meta.env.VITE_ENABLE_DEVTOOLS_PROTECTION === "true",
    detectionInterval: 1000,
    action:
      (import.meta.env.VITE_DEVTOOLS_ACTION as
        | "toast"
        | "modal"
        | "redirect") || "toast",
    redirectUrl: "/blocked",
  },
  contextMenuProtection: {
    enabled: import.meta.env.VITE_ENABLE_CONTEXT_MENU_PROTECTION === "true",
    allowOnInputs: true,
    showCustomMenu: false,
  },
  contentProtection: {
    enabled: import.meta.env.VITE_ENABLE_CONTENT_PROTECTION === "true",
    fileTypes: import.meta.env.VITE_CONTENT_PROTECTION_FILE_TYPES?.split(
      ","
    ) || ["pdf", "docx", "xlsx"],
    showWarning: true,
  },
  whitelist: {
    emails: import.meta.env.VITE_SECURITY_WHITELIST_EMAILS?.split(",") || [],
  },
};
```

**Implementation:**

- Export typed config object
- Parse ENV variables
- Provide defaults for all options
- Type-safe access throughout app

---

### 2.2 Security Types

**File:** `src/types/security.ts`

```typescript
export interface SecurityConfig {
  devToolsProtection: DevToolsProtectionConfig;
  contextMenuProtection: ContextMenuProtectionConfig;
  contentProtection: ContentProtectionConfig;
  whitelist: WhitelistConfig;
}

export interface DevToolsProtectionConfig {
  enabled: boolean;
  detectionInterval: number;
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
  details?: Record<string, any>;
}
```

**Implementation:**

- Complete type definitions
- Export all interfaces
- Include JSDoc comments

---

### 2.3 DevTools Detection Utility

**File:** `src/utils/security/detectDevTools.ts`

```typescript
/**
 * Detects if DevTools is open using multiple methods
 * @returns true if DevTools detected, false otherwise
 */
export function detectDevTools(): boolean {
  // Method 1: Window size difference
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;

  if (widthThreshold || heightThreshold) {
    return true;
  }

  // Method 2: Debugger trap (with timeout)
  let devtoolsOpen = false;
  const before = Date.now();
  // eslint-disable-next-line no-debugger
  debugger;
  const after = Date.now();
  if (after - before > 100) {
    devtoolsOpen = true;
  }

  // Method 3: Console detection (check toString behavior)
  const element = new Image();
  let consoleOpen = false;
  Object.defineProperty(element, "id", {
    get: function () {
      consoleOpen = true;
      return "";
    },
  });
  console.log(element);

  return devtoolsOpen || consoleOpen;
}
```

**Implementation:**

- Combine 3 detection methods
- Return boolean
- Handle errors gracefully
- Performance optimized

---

### 2.4 Protection Helpers

**File:** `src/utils/security/protectionHelpers.ts`

```typescript
/**
 * Check if element is editable (input, textarea, contenteditable)
 */
export function isEditableElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    element.contentEditable === "true"
  );
}

/**
 * Check if current user is whitelisted
 */
export function isUserWhitelisted(
  userEmail: string | null,
  whitelist: string[]
): boolean {
  if (!userEmail) return false;
  return whitelist
    .map((e) => e.toLowerCase())
    .includes(userEmail.toLowerCase());
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Check if file type should be protected
 */
export function isProtectedFileType(
  filename: string,
  protectedTypes: string[]
): boolean {
  const extension = getFileExtension(filename);
  return protectedTypes.includes(extension);
}
```

**Implementation:**

- Utility functions for common checks
- Reusable across hooks
- Well-documented
- Unit testable

---

### 2.5 Main Security Hook

**File:** `src/hooks/useSecurity.ts`

```typescript
import { useEffect } from "react";
import { securityConfig } from "@/config/security.config";
import { useAuthStore } from "@/stores/authStore";
import { useDevToolsProtection } from "./useDevToolsProtection";
import { useContextMenuProtection } from "./useContextMenuProtection";
import { isUserWhitelisted } from "@/utils/security/protectionHelpers";

/**
 * Main security hook - initializes all protection features
 * Should be used at App root level
 */
export function useSecurity() {
  const user = useAuthStore((state) => state.user);
  const isWhitelisted = isUserWhitelisted(
    user?.email || null,
    securityConfig.whitelist.emails
  );

  // Skip all protections if user is whitelisted
  const shouldApplyProtection = !isWhitelisted;

  useDevToolsProtection(
    shouldApplyProtection && securityConfig.devToolsProtection.enabled
  );
  useContextMenuProtection(
    shouldApplyProtection && securityConfig.contextMenuProtection.enabled
  );

  useEffect(() => {
    if (isWhitelisted) {
      console.log("[Security] User is whitelisted - protections bypassed");
    }
  }, [isWhitelisted]);

  return {
    isProtected: shouldApplyProtection,
    isWhitelisted,
  };
}
```

**Implementation:**

- Orchestrates all protection hooks
- Checks whitelist
- Conditional protection based on config
- Returns protection status

---

### 2.6 DevTools Protection Hook

**File:** `src/hooks/useDevToolsProtection.ts`

```typescript
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { detectDevTools } from "@/utils/security/detectDevTools";
import { securityConfig } from "@/config/security.config";

export function useDevToolsProtection(enabled: boolean) {
  const navigate = useNavigate();
  const intervalRef = useRef<number>();

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
              // TODO: Implement blocking modal
              alert("Developer Tools không được phép sử dụng");
            } else if (action === "redirect") {
              navigate(
                securityConfig.devToolsProtection.redirectUrl || "/blocked"
              );
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
  }, [enabled, navigate]);
}
```

**Implementation:**

- Keyboard shortcut blocking
- Periodic DevTools detection
- Configurable action (toast/modal/redirect)
- Proper cleanup

---

### 2.7 Context Menu Protection Hook

**File:** `src/hooks/useContextMenuProtection.ts`

```typescript
import { useEffect } from "react";
import { securityConfig } from "@/config/security.config";
import { isEditableElement } from "@/utils/security/protectionHelpers";

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

      // TODO: Show custom context menu if enabled
      if (securityConfig.contextMenuProtection.showCustomMenu) {
        // Implement custom menu
      }

      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [enabled]);
}
```

**Implementation:**

- Block right-click context menu
- Allow on editable elements
- Optional custom menu placeholder
- Proper cleanup

---

### 2.8 Content Protection Hook

**File:** `src/hooks/useContentProtection.ts`

```typescript
import { useEffect, RefObject } from "react";
import { toast } from "sonner";
import { securityConfig } from "@/config/security.config";
import { isProtectedFileType } from "@/utils/security/protectionHelpers";

interface UseContentProtectionOptions {
  filename?: string;
  enabled?: boolean;
}

export function useContentProtection(
  elementRef: RefObject<HTMLElement>,
  options: UseContentProtectionOptions = {}
) {
  const { filename, enabled = true } = options;

  useEffect(() => {
    if (!enabled || !securityConfig.contentProtection.enabled) return;
    if (!elementRef.current) return;

    // Check if file type should be protected
    if (
      filename &&
      !isProtectedFileType(filename, securityConfig.contentProtection.fileTypes)
    ) {
      return;
    }

    const element = elementRef.current;

    // Apply CSS user-select: none
    element.style.userSelect = "none";
    element.style.webkitUserSelect = "none";

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent copy
    const handleCopy = (e: Event) => {
      e.preventDefault();
      if (securityConfig.contentProtection.showWarning) {
        toast.error("Sao chép nội dung không được phép");
      }
      return false;
    };

    // Prevent drag
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    element.addEventListener("selectstart", handleSelectStart);
    element.addEventListener("copy", handleCopy);
    element.addEventListener("dragstart", handleDragStart);

    return () => {
      // Cleanup
      element.style.userSelect = "";
      element.style.webkitUserSelect = "";
      element.removeEventListener("selectstart", handleSelectStart);
      element.removeEventListener("copy", handleCopy);
      element.removeEventListener("dragstart", handleDragStart);
    };
  }, [elementRef, filename, enabled]);
}
```

**Implementation:**

- Ref-based protection for specific elements
- File type checking
- CSS + JS combined approach
- Optional warning toast
- Proper cleanup

---

### 2.9 App Integration

**File:** `src/App.tsx` (modifications)

```typescript
import { useSecurity } from "@/hooks/useSecurity";

export default function App() {
  // Initialize security at app root
  const { isProtected, isWhitelisted } = useSecurity();

  // ... rest of app code

  return (
    <>
      {/* Optional: Show dev mode indicator */}
      {isWhitelisted && (
        <div className="fixed top-0 left-0 bg-yellow-500 text-black px-2 py-1 text-xs z-50">
          DEV MODE - Protections Bypassed
        </div>
      )}

      {/* Rest of app */}
    </>
  );
}
```

**Implementation:**

- Call useSecurity() at app root
- Optional dev mode indicator
- No other changes needed

---

### 2.10 Environment Variables

**File:** `.env.example` (additions)

```env
# Security Features
VITE_ENABLE_DEVTOOLS_PROTECTION=true
VITE_DEVTOOLS_ACTION=toast  # toast | modal | redirect
VITE_ENABLE_CONTEXT_MENU_PROTECTION=true
VITE_ENABLE_CONTENT_PROTECTION=true
VITE_CONTENT_PROTECTION_FILE_TYPES=pdf,docx,xlsx,png,jpg
VITE_SECURITY_WHITELIST_EMAILS=admin@example.com,dev@example.com
```

**Implementation:**

- Add to .env.example
- Document each variable in README
- Provide sensible defaults

---

## 3. Integration Points

### 3.1 App.tsx

**Changes:**

```typescript
// Add import
import { useSecurity } from "@/hooks/useSecurity";

// Inside App component
const { isProtected, isWhitelisted } = useSecurity();
```

### 3.2 FilePreview Component (if exists)

**Changes:**

```typescript
// Add import
import { useRef } from "react";
import { useContentProtection } from "@/hooks/useContentProtection";

// Inside component
const contentRef = useRef<HTMLDivElement>(null);
useContentProtection(contentRef, { filename: file.name });

// In JSX
<div ref={contentRef}>{/* File content */}</div>;
```

---

## 4. Migration Strategy

### Phase 1: Foundation (Week 1)

1. Create types and config
2. Implement utility functions
3. Write unit tests for utils

### Phase 2: Core Hooks (Week 1)

4. Implement useDevToolsProtection
5. Implement useContextMenuProtection
6. Implement useContentProtection
7. Write unit tests for hooks

### Phase 3: Integration (Week 1)

8. Create useSecurity orchestrator hook
9. Integrate into App.tsx
10. Add ENV variables
11. Integration tests

### Phase 4: Component Integration (Week 2)

12. Find/create FilePreview component
13. Integrate useContentProtection
14. E2E tests

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:

- `src/config/security.config.ts` - Security configuration from ENV
- `src/types/security.ts` - TypeScript interfaces for security
- `src/utils/security/index.ts` - Barrel export for utilities
- `src/utils/security/detectDevTools.ts` - DevTools detection logic
- `src/utils/security/protectionHelpers.ts` - Helper utilities
- `src/hooks/useSecurity.ts` - Main orchestrator hook
- `src/hooks/useDevToolsProtection.ts` - DevTools blocking hook
- `src/hooks/useContextMenuProtection.ts` - Right-click blocking hook
- `src/hooks/useContentProtection.ts` - Copy protection hook

### Files sẽ sửa đổi:

- `src/App.tsx`
  - Import useSecurity hook
  - Call hook at component root
  - Add optional dev mode indicator
- `.env.example`

  - Add 6 security ENV variables
  - Document each variable

- `README.md`

  - Add Security Features section
  - Document ENV variables
  - Usage instructions

- `src/features/portal/workspace/FilePreview.tsx` (if exists)
  - Import useContentProtection
  - Create ref for protected content
  - Integrate hook with filename prop

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- (không có - sử dụng built-in APIs)

### Test files sẽ tạo:

- `src/utils/security/__tests__/detectDevTools.test.ts`
- `src/utils/security/__tests__/protectionHelpers.test.ts`
- `src/hooks/__tests__/useDevToolsProtection.test.ts`
- `src/hooks/__tests__/useContextMenuProtection.test.ts`
- `src/hooks/__tests__/useContentProtection.test.ts`
- `src/hooks/__tests__/useSecurity.test.ts`

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                | Lựa chọn                                                         | HUMAN Decision          |
| --- | ------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| 1   | Detection interval default            | (1) 1000ms, (2) 2000ms, (3) 5000ms?                              | ✅ **1 - 1000ms**       |
| 2   | Default action cho DevTools detection | (1) toast, (2) modal, (3) redirect?                              | ✅ **1 - toast**        |
| 3   | FilePreview component location        | (1) Tạo mới, (2) Sửa existing, (3) Skip integration?             | ✅ **2 - Sửa existing** |
| 4   | Dev mode indicator                    | (1) Có, (2) Không, (3) Chỉ trong dev build?                      | ✅ **1 - Có**           |
| 5   | Blocking modal component              | (1) Dùng alert(), (2) Tạo custom modal, (3) Dùng existing modal? | ✅ **1 - Dùng alert()** |
| 6   | Redirect blocked page                 | (1) Tạo /blocked page, (2) Redirect về /, (3) Just toast?        | ✅ **3 - Just toast**   |

> ✅ **All decisions filled - Ready to proceed**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                         | Status       |
| -------------------------------- | ------------ |
| Đã review File Structure         | ✅ Đã review |
| Đã review Implementation Details | ✅ Đã review |
| Đã review Integration Points     | ✅ Đã review |
| Đã review Migration Strategy     | ✅ Đã review |
| Đã review Impact Summary         | ✅ Đã review |
| Đã điền Pending Decisions        | ✅ Đã điền   |
| **APPROVED để sang BƯỚC 6**      | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-13

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tiếp tục BƯỚC 6 nếu "APPROVED để sang BƯỚC 6" = ⬜ CHƯA APPROVED**

---

## 📌 Implementation Notes

### Code Quality:

- All functions must have JSDoc comments
- Proper TypeScript typing (no `any`)
- Error handling for all detection methods
- Performance considerations (debounce, throttle)

### Testing Strategy:

- Unit tests for all utility functions
- Hook tests using @testing-library/react-hooks
- Integration tests for App.tsx
- E2E tests for user workflows

### Security Considerations:

- Client-side only - không thay thế server security
- Obfuscate production build để khó bypass
- Log bypass attempts (optional)
- Document limitations in README

### Performance:

- Detection interval configurable
- Use passive event listeners where possible
- Cleanup all listeners properly
- No memory leaks

---

## 🔗 Related Documents

- [Requirements](./01_requirements.md) - ✅ Step 1
- [Flow](./02b_flow.md) - ✅ Step 2B
- [Testing Requirements](./06_testing.md) - ⏳ Next step after approval
