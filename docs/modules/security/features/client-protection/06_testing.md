# [BƯỚC 6] Testing Requirements - Client-Side Protection

> **Feature:** Client-Side Security Protection  
> **Module:** Security  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Overview

Tài liệu này định nghĩa test requirements cho Client-Side Protection features, bao gồm:

1. Test Coverage Matrix
2. Detailed Test Cases per file
3. Test Data & Mocks
4. E2E Test Scenarios

---

## 1. Test Coverage Matrix

| Implementation File                       | Test File                                    | Test Type   | Min Cases | Priority |
| ----------------------------------------- | -------------------------------------------- | ----------- | --------- | -------- |
| `src/config/security.config.ts`           | `security.config.test.ts`                    | Unit        | 3         | High     |
| `src/utils/security/detectDevTools.ts`    | `detectDevTools.test.ts`                     | Unit        | 5         | High     |
| `src/utils/security/protectionHelpers.ts` | `protectionHelpers.test.ts`                  | Unit        | 6         | High     |
| `src/hooks/useDevToolsProtection.ts`      | `useDevToolsProtection.test.tsx`             | Hook        | 5         | High     |
| `src/hooks/useContextMenuProtection.ts`   | `useContextMenuProtection.test.tsx`          | Hook        | 4         | High     |
| `src/hooks/useContentProtection.ts`       | `useContentProtection.test.tsx`              | Hook        | 5         | High     |
| `src/hooks/useSecurity.ts`                | `useSecurity.test.tsx`                       | Hook        | 4         | High     |
| `src/App.tsx` (integration)               | `App.integration.test.tsx`                   | Integration | 3         | Medium   |
| File Preview (E2E)                        | `tests/security/content-protection.spec.ts`  | E2E         | 4         | Medium   |
| DevTools (E2E)                            | `tests/security/devtools-protection.spec.ts` | E2E         | 3         | Low      |

**Total:** 42 minimum test cases

---

## 2. Detailed Test Cases

### 2.1 Security Config Tests

**File:** `src/config/__tests__/security.config.test.ts`

| #   | Test Case                            | Input           | Expected              |
| --- | ------------------------------------ | --------------- | --------------------- |
| 1   | Parse ENV variables correctly        | ENV vars set    | Config matches ENV    |
| 2   | Use defaults when ENV not set        | No ENV vars     | Default values loaded |
| 3   | Handle invalid ENV values gracefully | Invalid boolean | Fallback to false     |

**Test Data:**

```typescript
// Mock ENV values
const mockEnv = {
  VITE_ENABLE_DEVTOOLS_PROTECTION: "true",
  VITE_ENABLE_CONTEXT_MENU_PROTECTION: "false",
  VITE_CONTENT_PROTECTION_FILE_TYPES: "pdf,docx",
  VITE_SECURITY_WHITELIST_EMAILS: "admin@test.com,dev@test.com",
};
```

---

### 2.2 DevTools Detection Tests

**File:** `src/utils/security/__tests__/detectDevTools.test.ts`

| #   | Test Case                          | Setup                              | Expected                |
| --- | ---------------------------------- | ---------------------------------- | ----------------------- |
| 1   | Detect DevTools by window size     | Mock outerWidth > innerWidth + 160 | Returns true            |
| 2   | Not detect when DevTools closed    | Normal window dimensions           | Returns false           |
| 3   | Handle debugger trap               | Mock Date.now() with delay         | Returns true            |
| 4   | Handle console detection           | Mock console.log behavior          | Returns true            |
| 5   | Handle detection errors gracefully | Throw error in method              | Returns false, no crash |

**Mock Implementation:**

```typescript
// Mock window dimensions
Object.defineProperty(window, "outerWidth", { value: 1920, writable: true });
Object.defineProperty(window, "innerWidth", { value: 1700, writable: true });

// Mock Date.now() for debugger trap
vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1150); // 150ms delay
```

---

### 2.3 Protection Helpers Tests

**File:** `src/utils/security/__tests__/protectionHelpers.test.ts`

| #   | Test Case                                | Input                          | Expected      |
| --- | ---------------------------------------- | ------------------------------ | ------------- |
| 1   | Identify input elements as editable      | `<input>` element              | Returns true  |
| 2   | Identify textarea as editable            | `<textarea>` element           | Returns true  |
| 3   | Identify contenteditable div as editable | `<div contenteditable="true">` | Returns true  |
| 4   | Identify regular div as not editable     | `<div>` element                | Returns false |
| 5   | Check user whitelist - in list           | Email in whitelist             | Returns true  |
| 6   | Check user whitelist - not in list       | Email not in whitelist         | Returns false |
| 7   | Extract file extension correctly         | "document.pdf"                 | Returns "pdf" |
| 8   | Check protected file type - match        | "doc.pdf", ["pdf"]             | Returns true  |
| 9   | Check protected file type - no match     | "doc.txt", ["pdf"]             | Returns false |

**Test Data:**

```typescript
const whitelist = ["admin@test.com", "dev@test.com"];
const protectedTypes = ["pdf", "docx", "xlsx"];
```

---

### 2.4 useDevToolsProtection Tests

**File:** `src/hooks/__tests__/useDevToolsProtection.test.tsx`

| #   | Test Case                             | Setup                     | Expected                                |
| --- | ------------------------------------- | ------------------------- | --------------------------------------- |
| 1   | Register event listeners when enabled | enabled=true              | keydown listener added                  |
| 2   | Not register listeners when disabled  | enabled=false             | No listeners added                      |
| 3   | Prevent F12 key                       | enabled=true, press F12   | preventDefault called                   |
| 4   | Prevent Ctrl+Shift+I                  | enabled=true, press combo | preventDefault called                   |
| 5   | Start detection interval              | enabled=true              | setInterval called with config interval |
| 6   | Cleanup on unmount                    | Mount then unmount        | Listeners removed, interval cleared     |

**Mock Setup:**

```typescript
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/config/security.config", () => ({
  securityConfig: {
    devToolsProtection: {
      enabled: true,
      detectionInterval: 1000,
      action: "toast",
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
```

---

### 2.5 useContextMenuProtection Tests

**File:** `src/hooks/__tests__/useContextMenuProtection.test.tsx`

| #   | Test Case                                  | Setup                                 | Expected                  |
| --- | ------------------------------------------ | ------------------------------------- | ------------------------- |
| 1   | Register contextmenu listener when enabled | enabled=true                          | Listener added            |
| 2   | Not register when disabled                 | enabled=false                         | No listener               |
| 3   | Prevent contextmenu on div                 | enabled=true, right-click div         | preventDefault called     |
| 4   | Allow contextmenu on input if configured   | allowOnInputs=true, right-click input | preventDefault NOT called |
| 5   | Cleanup on unmount                         | Mount then unmount                    | Listener removed          |

**Test Helper:**

```typescript
function simulateRightClick(element: HTMLElement) {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
  return event;
}
```

---

### 2.6 useContentProtection Tests

**File:** `src/hooks/__tests__/useContentProtection.test.tsx`

| #   | Test Case                       | Setup                             | Expected                        |
| --- | ------------------------------- | --------------------------------- | ------------------------------- |
| 1   | Apply protection to element     | enabled=true, ref set             | user-select: none applied       |
| 2   | Not apply when disabled         | enabled=false                     | user-select not changed         |
| 3   | Check file type before applying | filename="doc.txt", types=["pdf"] | No protection                   |
| 4   | Prevent copy event              | enabled=true, trigger copy        | preventDefault called           |
| 5   | Prevent selectstart event       | enabled=true, trigger selectstart | preventDefault called           |
| 6   | Cleanup on unmount              | Mount then unmount                | Styles reset, listeners removed |

**Mock Setup:**

```typescript
import { renderHook } from "@testing-library/react";
import { useRef } from "react";

function setup(options = {}) {
  const ref = { current: document.createElement("div") };
  const { result } = renderHook(() => useContentProtection(ref, options));
  return { ref, result };
}
```

---

### 2.7 useSecurity Tests

**File:** `src/hooks/__tests__/useSecurity.test.tsx`

| #   | Test Case                                            | Setup                 | Expected                              |
| --- | ---------------------------------------------------- | --------------------- | ------------------------------------- |
| 1   | Initialize all protections when user not whitelisted | user not in whitelist | All hooks called with enabled=true    |
| 2   | Bypass protections for whitelisted user              | user in whitelist     | All hooks called with enabled=false   |
| 3   | Return correct protection status                     | user not whitelisted  | isProtected=true, isWhitelisted=false |
| 4   | Return correct status for whitelisted user           | user whitelisted      | isProtected=false, isWhitelisted=true |

**Mock Setup:**

```typescript
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      user: { email: "test@test.com" },
    })
  ),
}));

vi.mock("./useDevToolsProtection", () => ({
  useDevToolsProtection: vi.fn(),
}));

vi.mock("./useContextMenuProtection", () => ({
  useContextMenuProtection: vi.fn(),
}));
```

---

### 2.8 App Integration Tests

**File:** `src/__tests__/App.integration.test.tsx`

| #   | Test Case                                     | Setup                | Expected                |
| --- | --------------------------------------------- | -------------------- | ----------------------- |
| 1   | App calls useSecurity on mount                | Render App           | useSecurity hook called |
| 2   | Dev mode indicator shown for whitelisted user | user whitelisted     | "DEV MODE" visible      |
| 3   | Dev mode indicator hidden for normal user     | user not whitelisted | "DEV MODE" not in DOM   |

---

### 2.9 E2E Tests - Content Protection

**File:** `tests/security/content-protection.spec.ts`

| #   | Test Scenario                                     | Steps                                         | Expected                      |
| --- | ------------------------------------------------- | --------------------------------------------- | ----------------------------- |
| 1   | User cannot select text in protected file preview | 1. Open PDF preview<br>2. Try to select text  | Selection fails, no highlight |
| 2   | User cannot copy from protected content           | 1. Open protected file<br>2. Press Ctrl+C     | Toast: "Copying disabled"     |
| 3   | Text selection works in normal content            | 1. Navigate to chat<br>2. Select message text | Text highlights normally      |
| 4   | Copy works in input fields                        | 1. Type in input<br>2. Select and Ctrl+C      | Copy succeeds                 |

**Playwright Code Snippet:**

```typescript
test("cannot select text in protected preview", async ({ page }) => {
  await page.goto("/files/document.pdf");

  const preview = page.getByTestId("file-preview-content");
  await preview.click();

  // Try to select text
  await page.keyboard.down("Control");
  await page.keyboard.press("A");
  await page.keyboard.up("Control");

  // Check no selection
  const selection = await page.evaluate(() =>
    window.getSelection()?.toString()
  );
  expect(selection).toBe("");
});
```

---

### 2.10 E2E Tests - DevTools Protection

**File:** `tests/security/devtools-protection.spec.ts`

| #   | Test Scenario               | Steps                                             | Expected                           |
| --- | --------------------------- | ------------------------------------------------- | ---------------------------------- |
| 1   | F12 does not open DevTools  | 1. Press F12                                      | DevTools not opened (manual check) |
| 2   | Ctrl+Shift+I blocked        | 1. Press Ctrl+Shift+I                             | DevTools not opened                |
| 3   | Right-click inspect blocked | 1. Right-click element<br>2. Try to click Inspect | Context menu blocked               |

**Note:** DevTools E2E tests khó automate hoàn toàn, cần manual verification

---

## 3. Test Data & Mocks

### 3.1 Mock ENV Variables

```typescript
// tests/setup/env.mock.ts
export const mockSecurityEnv = {
  VITE_ENABLE_DEVTOOLS_PROTECTION: "true",
  VITE_DEVTOOLS_ACTION: "toast",
  VITE_ENABLE_CONTEXT_MENU_PROTECTION: "true",
  VITE_ENABLE_CONTENT_PROTECTION: "true",
  VITE_CONTENT_PROTECTION_FILE_TYPES: "pdf,docx,xlsx",
  VITE_SECURITY_WHITELIST_EMAILS: "admin@test.com,dev@test.com",
};
```

### 3.2 Mock User Data

```typescript
// tests/fixtures/users.ts
export const regularUser = {
  id: "1",
  email: "user@test.com",
  name: "Regular User",
};

export const whitelistedUser = {
  id: "2",
  email: "admin@test.com",
  name: "Admin User",
};
```

### 3.3 Mock File Data

```typescript
// tests/fixtures/files.ts
export const protectedFile = {
  id: "1",
  name: "confidential.pdf",
  type: "application/pdf",
  url: "/files/confidential.pdf",
};

export const normalFile = {
  id: "2",
  name: "notes.txt",
  type: "text/plain",
  url: "/files/notes.txt",
};
```

---

## 4. Test Generation Checklist

### Unit Tests (Utilities)

- [ ] `detectDevTools.test.ts` - 5 cases
- [ ] `protectionHelpers.test.ts` - 9 cases

### Unit Tests (Config)

- [ ] `security.config.test.ts` - 3 cases

### Hook Tests

- [ ] `useDevToolsProtection.test.tsx` - 6 cases
- [ ] `useContextMenuProtection.test.tsx` - 5 cases
- [ ] `useContentProtection.test.tsx` - 6 cases
- [ ] `useSecurity.test.tsx` - 4 cases

### Integration Tests

- [ ] `App.integration.test.tsx` - 3 cases

### E2E Tests

- [ ] `content-protection.spec.ts` - 4 scenarios
- [ ] `devtools-protection.spec.ts` - 3 scenarios

**Total:** 48 test cases

---

## 5. Coverage Goals

| Category    | Target | Priority |
| ----------- | ------ | -------- |
| Utilities   | 100%   | High     |
| Hooks       | 90%    | High     |
| Config      | 100%   | Medium   |
| Integration | 80%    | Medium   |
| E2E         | 70%    | Low      |

**Overall Target:** > 85% coverage

---

## 📋 IMPACT SUMMARY

### Test Files sẽ tạo mới:

**Unit Tests:**

- `src/config/__tests__/security.config.test.ts`
- `src/utils/security/__tests__/detectDevTools.test.ts`
- `src/utils/security/__tests__/protectionHelpers.test.ts`

**Hook Tests:**

- `src/hooks/__tests__/useDevToolsProtection.test.tsx`
- `src/hooks/__tests__/useContextMenuProtection.test.tsx`
- `src/hooks/__tests__/useContentProtection.test.tsx`
- `src/hooks/__tests__/useSecurity.test.tsx`

**Integration Tests:**

- `src/__tests__/App.integration.test.tsx`

**E2E Tests:**

- `tests/security/content-protection.spec.ts`
- `tests/security/devtools-protection.spec.ts`

**Test Fixtures:**

- `tests/setup/env.mock.ts`
- `tests/fixtures/users.ts`
- `tests/fixtures/files.ts`

### Test Dependencies cần thêm:

- (Đã có sẵn: vitest, @testing-library/react, playwright)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                           | Lựa chọn                                                       | HUMAN Decision          |
| --- | -------------------------------- | -------------------------------------------------------------- | ----------------------- |
| 1   | Coverage threshold enforcement   | (1) Strict (fail < 85%), (2) Warning only, (3) No enforcement? | ✅ **2 - Warning only** |
| 2   | E2E tests priority               | (1) High (implement now), (2) Low (defer), (3) Skip E2E?       | ✅ **2 - Low (defer)**  |
| 3   | Mock DevTools detection in tests | (1) Full mock, (2) Partial real, (3) Integration only?         | ✅ **1 - Full mock**    |
| 4   | Test data location               | (1) tests/fixtures/, (2) Inline in tests, (3) Both?            | ✅ **2 - Inline**       |

> ✅ **All decisions filled - Ready to proceed**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                                 | Status       |
| ---------------------------------------- | ------------ |
| Đã review Test Coverage Matrix           | ✅ Đã review |
| Đã review Detailed Test Cases            | ✅ Đã review |
| Đã review Test Data & Mocks              | ✅ Đã review |
| Đã review E2E Test Scenarios             | ✅ Đã review |
| Đã review Coverage Goals                 | ✅ Đã review |
| Đã điền Pending Decisions                | ✅ Đã điền   |
| **APPROVED để thực thi CODING (BƯỚC 5)** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-13

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu "APPROVED để thực thi CODING" = ⬜ CHƯA APPROVED**

---

## 📌 Testing Best Practices

### 1. Test Organization

- Group related tests with `describe` blocks
- Use descriptive test names: `it('should prevent F12 when enabled')`
- Follow AAA pattern: Arrange, Act, Assert

### 2. Mock Strategy

- Mock external dependencies (stores, router)
- Don't mock the code under test
- Reset mocks between tests

### 3. Async Testing

- Use `waitFor` for async behavior
- Test loading states
- Test error states

### 4. Hook Testing

- Use `renderHook` from @testing-library/react
- Test cleanup with `unmount()`
- Test re-renders with `rerender()`

### 5. E2E Testing

- Use data-testid for stable selectors
- Test user workflows, not implementation
- Keep tests independent

---

## 🔗 Related Documents

- [Requirements](./01_requirements.md) - ✅ Step 1
- [Flow](./02b_flow.md) - ✅ Step 2B
- [Implementation Plan](./04_implementation-plan.md) - ✅ Step 4
- [Testing Strategy Guide](../../../guides/testing_strategy_20251226_claude_opus_4_5.md)
