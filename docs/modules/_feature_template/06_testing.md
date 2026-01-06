# 🧪 [Feature Name] - Testing Requirements & Documentation

> **[BƯỚC 6]** Test Requirements Generation & Verification  
> **Feature:** [Feature Name]  
> **Module:** [module-name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING TEST GENERATION

---

## 📋 Purpose of This Document

**Tại sao cần file này:**

1. ✅ **Pre-coding Test Planning:** Định nghĩa test cases TRƯỚC khi code để đảm bảo coverage đầy đủ
2. ✅ **AI Test Generation:** AI có thể đọc file này và tự động generate test code
3. ✅ **Traceability:** Mapping rõ ràng giữa implementation files và test files
4. ✅ **Review:** HUMAN có thể review test requirements trước khi approve coding
5. ✅ **Documentation:** Track test coverage và results sau khi complete

**Workflow:**

```
BƯỚC 4: Implementation Plan (approved)
        ↓
BƯỚC 4.5: AI generates THIS FILE (06_testing.md)
        ↓
HUMAN reviews test requirements & approves
        ↓
BƯỚC 5: AI writes code + tests (referencing this file)
        ↓
BƯỚC 6: AI updates this file with actual test results
```

---

## 🎯 Testing Overview

**Testing Philosophy:** "No Code Without Tests"

Mọi file implementation PHẢI đi kèm file test tương ứng. Testing được thực hiện song song với coding, không phải sau khi hoàn thành.

### Testing Pyramid

```
           /\
          /  \     E2E Tests (Critical User Flows)
         /----\    10% - High confidence, slow
        /      \
       /--------\  Integration Tests (Feature Flows)
      /          \ 20% - Medium confidence, medium speed
     /------------\
    /              \Unit Tests (Components, Hooks, APIs)
   /----------------\ 70% - Low confidence, fast
```

---

## 📊 Test Coverage Requirements

### Minimum Coverage Targets

| Test Type   | Coverage Target | Priority | Tools                   |
| ----------- | --------------- | -------- | ----------------------- |
| Unit Tests  | ≥ 80%           | ✅ MUST  | Vitest, Testing Library |
| Integration | ≥ 60%           | ✅ MUST  | Vitest, MSW             |
| E2E Tests   | Key flows       | ✅ MUST  | Playwright              |

### Test File Structure

```
tests/
└── [module]/              # Module name (auth, chat, task, file)
    └── [feature]/         # Feature name (login, messages, create-task)
        ├── unit/          # Unit tests
        │   ├── [api].test.ts
        │   ├── [hook].test.tsx
        │   └── [component].test.tsx
        ├── integration/   # Integration tests
        │   └── [feature]-flow.test.tsx
        └── e2e/           # E2E tests (Playwright)
            ├── happy-path.spec.ts
            ├── error-cases.spec.ts
            └── edge-cases.spec.ts
```

**Example: Login Feature**

```
tests/
└── auth/
    └── login/
        ├── unit/
        │   ├── auth.api.test.ts
        │   ├── useLogin.test.tsx
        │   └── LoginForm.test.tsx
        ├── integration/
        │   └── login-flow.test.tsx
        └── e2e/
            ├── happy-path.spec.ts
            ├── error-cases.spec.ts
            └── validation.spec.ts
```

---

## 🧪 SECTION 1: UNIT TESTS (70%)

> Unit tests kiểm tra từng unit code độc lập (functions, components, hooks)

### 1.1 API Layer Tests

| Implementation File       | Test File                                            | Status | Cases |
| ------------------------- | ---------------------------------------------------- | ------ | ----- |
| `src/api/[module].api.ts` | `tests/[module]/[feature]/unit/[module].api.test.ts` | ⏳     | 4     |

**Required Test Cases:**

| #   | Test Case                      | Priority |
| --- | ------------------------------ | -------- |
| 1   | Success - Returns correct data | HIGH     |
| 2   | Error 4xx - Handles gracefully | HIGH     |
| 3   | Network error - Shows message  | HIGH     |
| 4   | Request params sent correctly  | MEDIUM   |

---

### 1.2 Hooks Tests

| Implementation File             | Test File                                       | Status | Cases |
| ------------------------------- | ----------------------------------------------- | ------ | ----- |
| `src/hooks/queries/use[X].ts`   | `tests/[module]/[feature]/unit/use[X].test.tsx` | ⏳     | 5     |
| `src/hooks/mutations/use[X].ts` | `tests/[module]/[feature]/unit/use[X].test.tsx` | ⏳     | 5     |

**Query Hook Test Cases:**

| #   | Test Case                   | Priority |
| --- | --------------------------- | -------- |
| 1   | Loading state initially     | HIGH     |
| 2   | Success - Returns data      | HIGH     |
| 3   | Error - Returns error state | HIGH     |
| 4   | Sends auth token            | HIGH     |
| 5   | Refetch on invalidate       | MEDIUM   |

**Mutation Hook Test Cases:**

| #   | Test Case                         | Priority |
| --- | --------------------------------- | -------- |
| 1   | Returns mutate function           | HIGH     |
| 2   | Loading state during mutation     | HIGH     |
| 3   | Success callback fires            | HIGH     |
| 4   | Error callback fires              | HIGH     |
| 5   | Optimistic update (if applicable) | MEDIUM   |

---

### 1.3 Component Tests

| Implementation File      | Test File                                    | Status | Cases |
| ------------------------ | -------------------------------------------- | ------ | ----- |
| `src/components/[X].tsx` | `tests/[module]/[feature]/unit/[X].test.tsx` | ⏳     | 5     |

**Component Test Cases:**

| #   | Test Case                     | Priority |
| --- | ----------------------------- | -------- |
| 1   | Renders correctly (snapshot)  | HIGH     |
| 2   | Displays data props correctly | HIGH     |
| 3   | Handles user interactions     | HIGH     |
| 4   | Shows loading/error states    | HIGH     |
| 5   | Accessibility (ARIA, labels)  | MEDIUM   |

---

### 1.4 Utility/Validation Tests

| Implementation File              | Test File                                                   | Status | Cases |
| -------------------------------- | ----------------------------------------------------------- | ------ | ----- |
| `src/lib/validation/[module].ts` | `tests/[module]/[feature]/unit/[module]-validation.test.ts` | ⏳     | 4     |

**Validation Test Cases:**

| #   | Test Case              | Priority |
| --- | ---------------------- | -------- |
| 1   | Valid input passes     | HIGH     |
| 2   | Invalid input fails    | HIGH     |
| 3   | Edge cases handled     | MEDIUM   |
| 4   | Error messages correct | MEDIUM   |

---

## 🔗 SECTION 2: INTEGRATION TESTS (20%)

> Integration tests kiểm tra nhiều units hoạt động cùng nhau

### 2.1 Feature Flow Tests

| Test File                                                      | Description             | Status | Cases |
| -------------------------------------------------------------- | ----------------------- | ------ | ----- |
| `tests/[module]/[feature]/integration/[feature]-flow.test.tsx` | End-to-end feature flow | ⏳     | 4     |

**Integration Test Cases:**

| #   | Scenario                            | Priority |
| --- | ----------------------------------- | -------- |
| 1   | Happy path - Complete flow works    | HIGH     |
| 2   | User action → API → UI update       | HIGH     |
| 3   | Error handling → UI feedback        | HIGH     |
| 4   | State persistence across navigation | MEDIUM   |

### 2.2 API + Hook Integration

| Test File                                        | Description              | Status | Cases |
| ------------------------------------------------ | ------------------------ | ------ | ----- |
| `src/__tests__/integration/[module]-api.test.ts` | API + Hook combined test | ⏳     | 3     |

**API Integration Test Cases:**

| #   | Scenario                       | Priority |
| --- | ------------------------------ | -------- |
| 1   | Real API call with mock server | HIGH     |
| 2   | Auth token sent in headers     | HIGH     |
| 3   | Error responses handled        | HIGH     |

---

## 🎭 SECTION 3: E2E TESTS (10%)

> E2E tests kiểm tra toàn bộ application từ góc độ user thực tế

### 3.1 E2E Test Files

| Test File                                          | Description             | Status |
| -------------------------------------------------- | ----------------------- | ------ |
| `tests/[module]/[feature]/e2e/happy-path.spec.ts`  | Main success flow       | ⏳     |
| `tests/[module]/[feature]/e2e/error-cases.spec.ts` | Error handling          | ⏳     |
| `tests/[module]/[feature]/e2e/edge-cases.spec.ts`  | Edge cases & boundaries | ⏳     |

### 3.2 E2E Test Scenarios

#### Happy Path (MUST)

| #   | Scenario                    | Steps | Priority |
| --- | --------------------------- | ----- | -------- |
| 1   | User completes main flow    | 5     | HIGH     |
| 2   | Data persists after refresh | 3     | MEDIUM   |

#### Error Cases (MUST)

| #   | Scenario                        | Steps | Priority |
| --- | ------------------------------- | ----- | -------- |
| 1   | Invalid input shows error       | 3     | HIGH     |
| 2   | Network error shows message     | 3     | HIGH     |
| 3   | Unauthorized redirects to login | 2     | HIGH     |

#### Edge Cases (SHOULD)

| #   | Scenario            | Steps | Priority |
| --- | ------------------- | ----- | -------- |
| 1   | Empty state handled | 2     | MEDIUM   |
| 2   | Mobile responsive   | 3     | MEDIUM   |

---

### 3.3 E2E Test Template

```typescript
// tests/e2e/[feature]/happy-path.spec.ts
import { test, expect } from "@playwright/test";

test.describe("[Feature Name] - Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login, navigate, etc.
  });

  test("User can complete main flow", async ({ page }) => {
    // Step 1: [Action]
    await page.getByTestId("[element]").click();

    // Step 2: [Action]
    await page.getByTestId("[input]").fill("[value]");

    // Step 3: [Action]
    await page.getByTestId("[button]").click();

    // Assert: Verify result
    await expect(page.getByTestId("[result]")).toBeVisible();
  });
});
```

---

## 📈 SECTION 4: TESTING PROGRESS

### Overall Progress

| Phase                 | Files | Completed | Progress |
| --------------------- | ----- | --------- | -------- |
| **Unit Tests**        | -     | 0         | 0%       |
| **Integration Tests** | -     | 0         | 0%       |
| **E2E Tests**         | -     | 0         | 0%       |

**Overall:** 0%

### Coverage Report

| Metric     | Target | Actual | Status |
| ---------- | ------ | ------ | ------ |
| Statements | ≥80%   | -      | ⏳     |
| Branches   | ≥75%   | -      | ⏳     |
| Functions  | ≥80%   | -      | ⏳     |
| Lines      | ≥80%   | -      | ⏳     |

---

## ✅ SECTION 5: TESTING CHECKLIST

### 5.1 Pre-Testing Setup

- [ ] Vitest configured (`vitest.config.ts`)
- [ ] Testing Library installed (`@testing-library/react`)
- [ ] MSW setup for API mocking
- [ ] Playwright configured
- [ ] Test utilities created
- [ ] Mock data files ready

### 5.2 Unit Tests

- [ ] All API functions tested
- [ ] All hooks tested
- [ ] All components tested
- [ ] All utilities tested
- [ ] Coverage ≥ 80%

### 5.3 Integration Tests

- [ ] Feature flow tested
- [ ] API integration tested
- [ ] Error handling tested
- [ ] Coverage ≥ 60%

### 5.4 E2E Tests

- [ ] Happy path scenarios pass
- [ ] Error scenarios pass
- [ ] Edge cases pass (if applicable)
- [ ] Mobile responsive (if applicable)

---

## 🎯 SECTION 6: TEST DATA & MOCKS

### 6.1 Mock Data Files

```
src/__tests__/
├── mocks/
│   ├── data/
│   │   └── [feature].mock.ts    # Mock data objects
│   ├── handlers/
│   │   └── [feature].handlers.ts # MSW handlers
│   └── setup.ts                  # Test setup
```

### 6.2 Mock Data Example

```typescript
// src/__tests__/mocks/data/[feature].mock.ts
export const mock[Feature]Success = {
  // Success response data
};

export const mock[Feature]Error = {
  message: "Error message",
  code: "ERROR_CODE",
};
```

### 6.3 MSW Handler Example

```typescript
// src/__tests__/mocks/handlers/[feature].handlers.ts
import { http, HttpResponse } from "msw";

export const [feature]Handlers = [
  http.get("/api/[endpoint]", () => {
    return HttpResponse.json(mock[Feature]Success);
  }),
  http.post("/api/[endpoint]", () => {
    return HttpResponse.json(mock[Feature]Success, { status: 201 });
  }),
];
```

---

## 📝 SECTION 7: TESTING BEST PRACTICES

### DO ✅

- ✅ Write tests alongside implementation (TDD recommended)
- ✅ Use `data-testid` for all interactive elements
- ✅ Test user behavior, not implementation details
- ✅ Mock external dependencies (API, localStorage)
- ✅ Use descriptive test names (`should [action] when [condition]`)
- ✅ Group related tests with `describe` blocks
- ✅ One assertion per test (when possible)
- ✅ Use `waitFor` for async operations

### DON'T ❌

- ❌ Skip tests for "simple" code
- ❌ Test implementation details (internal state)
- ❌ Use hardcoded delays (`setTimeout`)
- ❌ Share state between tests
- ❌ Test third-party library behavior
- ❌ Use `any` type in test files

---

## 🔄 SECTION 8: TEST COMMANDS

### 8.1 Install Playwright (if not installed)

```bash
# Install Playwright and browsers
npm install -D @playwright/test
npx playwright install
```

### 8.2 Test Commands

```bash
# Unit & Integration Tests
npm run test              # Run all tests
npm run test:run          # Run once without watch
npm run test:coverage     # With coverage report
npm run test -- [file]    # Run specific file

# E2E Tests (Playwright)
npx playwright test              # Run all E2E tests
npx playwright test --ui         # With Playwright UI
npx playwright test --debug      # Debug mode
npx playwright test [file]       # Run specific E2E file
npx playwright show-report       # Show last test report
```

---

## ⚠️ HUMAN CONFIRMATION

| Item                            | Status           |
| ------------------------------- | ---------------- |
| Unit test cases reviewed        | ⬜ Chưa review   |
| Integration test cases reviewed | ⬜ Chưa review   |
| E2E test cases reviewed         | ⬜ Chưa review   |
| Coverage targets approved       | ⬜ Chưa confirm  |
| **APPROVED để thực thi**        | ⬜ CHƯA APPROVED |

**HUMAN Signature:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***

> ⚠️ **CRITICAL: Code CANNOT be deployed until all tests pass and meet coverage targets**

---

## 🔗 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **Progress Tracker:** [05_progress.md](./05_progress.md)
- **Testing Strategy:** [docs/guides/testing_strategy_20251226_claude_opus_4_5.md](../../../../guides/testing_strategy_20251226_claude_opus_4_5.md)
