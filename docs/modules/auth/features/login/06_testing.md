# 🧪 Login Feature - Testing Documentation

> **[BƯỚC 6]** Testing Requirements & Coverage  
> **Feature:** Login  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ⏳ PENDING

---

## 📋 Testing Overview

**Testing Philosophy:** "No Code Without Tests"

Mọi file implementation PHẢI đi kèm file test tương ứng. Testing được thực hiện song song với coding, không phải sau khi hoàn thành.

---

## 📊 Test Coverage Requirements

### Minimum Coverage Targets

| Test Type   | Coverage Target | Priority  |
| ----------- | --------------- | --------- |
| Unit Tests  | ≥ 80%           | ✅ MUST   |
| Integration | ≥ 60%           | ✅ MUST   |
| E2E Tests   | Key flows       | ⚠️ SHOULD |

---

## 🗂️ Test Files Structure

### API Layer Tests

| Implementation File   | Test File                            | Status | Test Cases |
| --------------------- | ------------------------------------ | ------ | ---------- |
| `src/api/auth.api.ts` | `src/api/__tests__/auth.api.test.ts` | ⏳     | 4          |

**Required Test Cases:**

1. ✅ Success case - Valid credentials return token
2. ✅ Error case - Invalid credentials return 401
3. ✅ Validation - Empty/invalid fields return 400
4. ✅ Network error handling

---

### Hooks Tests

| Implementation File               | Test File                                        | Status | Test Cases |
| --------------------------------- | ------------------------------------------------ | ------ | ---------- |
| `src/hooks/mutations/useLogin.ts` | `src/hooks/mutations/__tests__/useLogin.test.ts` | ⏳     | 5          |

**Required Test Cases:**

1. ✅ Loading state - Shows loading during mutation
2. ✅ Success state - Updates auth store on success
3. ✅ Error state - Shows error message on failure
4. ✅ Query key invalidation - Triggers cache refresh
5. ✅ Retry logic - Retries on network failure

---

### Component Tests

| Implementation File                       | Test File                                                | Status | Test Cases |
| ----------------------------------------- | -------------------------------------------------------- | ------ | ---------- |
| `src/components/auth/LoginForm.tsx`       | `src/components/auth/__tests__/LoginForm.test.tsx`       | ⏳     | 6          |
| `src/components/auth/IdentifierInput.tsx` | `src/components/auth/__tests__/IdentifierInput.test.tsx` | ⏳     | 4          |
| `src/components/auth/PasswordInput.tsx`   | `src/components/auth/__tests__/PasswordInput.test.tsx`   | ⏳     | 4          |

**LoginForm Test Cases:**

1. ✅ Renders correctly - All form elements present
2. ✅ Validation - Shows error for invalid email
3. ✅ Submit - Calls mutation with form data
4. ✅ Loading state - Disables button during submit
5. ✅ Success - Redirects after successful login
6. ✅ Accessibility - Proper labels and ARIA attributes

**IdentifierInput Test Cases:**

1. ✅ Renders with placeholder
2. ✅ Email validation feedback
3. ✅ Value change handling
4. ✅ Accessibility attributes

**PasswordInput Test Cases:**

1. ✅ Renders with hidden password
2. ✅ Toggle visibility works
3. ✅ Value change handling
4. ✅ Accessibility attributes

---

### Page Tests

| Implementation File       | Test File                                | Status | Test Cases |
| ------------------------- | ---------------------------------------- | ------ | ---------- |
| `src/pages/LoginPage.tsx` | `src/pages/__tests__/LoginPage.test.tsx` | ⏳     | 5          |

**Required Test Cases:**

1. ✅ Renders LoginForm component
2. ✅ Redirects if already authenticated
3. ✅ Shows error message on login failure
4. ✅ Navigation after successful login
5. ✅ Responsive layout (mobile/desktop)

---

### Utility Tests

| Implementation File            | Test File                                     | Status | Test Cases |
| ------------------------------ | --------------------------------------------- | ------ | ---------- |
| `src/lib/validation/auth.ts`   | `src/lib/validation/__tests__/auth.test.ts`   | ⏳     | 5          |
| `src/lib/auth/tokenStorage.ts` | `src/lib/auth/__tests__/tokenStorage.test.ts` | ⏳     | 4          |

**Validation Test Cases:**

1. ✅ Valid email passes
2. ✅ Invalid email fails
3. ✅ Password min length validation
4. ✅ Empty field validation
5. ✅ Edge cases (special chars, long strings)

**TokenStorage Test Cases:**

1. ✅ Save token to storage
2. ✅ Retrieve token from storage
3. ✅ Clear token
4. ✅ Handle missing token

---

## 🧪 E2E Test Scenarios (Optional)

**Test File:** `tests/e2e/auth/login.spec.ts`

| Scenario                      | Status | Priority |
| ----------------------------- | ------ | -------- |
| Happy path - Successful login | ⏳     | HIGH     |
| Invalid credentials           | ⏳     | HIGH     |
| Form validation errors        | ⏳     | MEDIUM   |
| Network error handling        | ⏳     | MEDIUM   |
| Mobile responsive             | ⏳     | LOW      |

**E2E Test Steps (Happy Path):**

```typescript
test("User can login successfully", async ({ page }) => {
  // 1. Navigate to login page
  await page.goto("/login");

  // 2. Fill credentials
  await page.getByTestId("identifier-input").fill("test@example.com");
  await page.getByTestId("password-input").fill("password123");

  // 3. Submit form
  await page.getByTestId("login-submit-button").click();

  // 4. Verify redirect to portal
  await expect(page).toHaveURL("/portal");

  // 5. Verify user is authenticated
  await expect(page.getByTestId("user-avatar")).toBeVisible();
});
```

---

## 📈 Testing Progress

### Overall Progress

| Phase                 | Files | Completed | Progress |
| --------------------- | ----- | --------- | -------- |
| **Unit Tests**        | 9     | 0         | 0%       |
| **Integration Tests** | 3     | 0         | 0%       |
| **E2E Tests**         | 1     | 0         | 0%       |

**Overall:** 0% (0/13 test files)

---

## ✅ Testing Checklist

### Pre-Testing Setup

- [ ] Test framework configured (Vitest/Jest)
- [ ] Testing libraries installed (@testing-library/react)
- [ ] Mock setup for API calls
- [ ] Test utilities created (render helpers, mock data)

### Unit Testing Phase

**API Layer:**

- [ ] `auth.api.test.ts` - 4 test cases

**Hooks:**

- [ ] `useLogin.test.ts` - 5 test cases

**Components:**

- [ ] `LoginForm.test.tsx` - 6 test cases
- [ ] `IdentifierInput.test.tsx` - 4 test cases
- [ ] `PasswordInput.test.tsx` - 4 test cases

**Pages:**

- [ ] `LoginPage.test.tsx` - 5 test cases

**Utilities:**

- [ ] `auth.validation.test.ts` - 5 test cases
- [ ] `tokenStorage.test.ts` - 4 test cases

### Integration Testing

- [ ] Form submission → API call → Store update
- [ ] Error handling → UI feedback
- [ ] Authentication flow → Route protection

### E2E Testing (Optional)

- [ ] Happy path scenario
- [ ] Error scenarios
- [ ] Mobile responsive

---

## 🎯 Test Data Requirements

### Mock User Data

```typescript
// src/__tests__/mocks/users.ts
export const mockUsers = {
  valid: {
    identifier: "test@quocnam.com",
    password: "Test@1234",
  },
  invalid: {
    identifier: "invalid@quocnam.com",
    password: "wrong-password",
  },
};
```

### Mock API Responses

```typescript
// src/__tests__/mocks/api/auth.ts
export const mockLoginSuccess = {
  accessToken: "mock-token-123",
  fullName: "Nguyễn Văn A",
  email: "test@quocnam.com",
  role: "Staff",
};

export const mockLoginError401 = {
  message: "Email hoặc mật khẩu không đúng",
  code: "INVALID_CREDENTIALS",
};
```

---

## 📝 Testing Best Practices

### DO ✅

- ✅ Write tests alongside implementation (TDD recommended)
- ✅ Use `data-testid` for elements (Playwright compatibility)
- ✅ Test user behavior, not implementation details
- ✅ Mock external dependencies (API, localStorage)
- ✅ Use descriptive test names
- ✅ Group related tests with `describe` blocks
- ✅ Keep tests simple and focused (one assertion per test ideally)

### DON'T ❌

- ❌ Skip tests for "simple" code
- ❌ Test implementation details (internal state)
- ❌ Use hardcoded delays (use waitFor)
- ❌ Share state between tests
- ❌ Mock everything (test real integrations when possible)

---

## 🔄 Test Execution Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- auth.api.test.ts
```

---

## ⚠️ HUMAN CONFIRMATION

> **Testing approval before deployment**

| Item                        | Status     |
| --------------------------- | ---------- |
| All unit tests written      | ⬜ Pending |
| All tests passing           | ⬜ Pending |
| Coverage meets threshold    | ⬜ Pending |
| E2E tests passing (if any)  | ⬜ Pending |
| **APPROVED for deployment** | ⬜ PENDING |

**Approved By:** ******\_******  
**Date:** ******\_******

> ⚠️ **Code CANNOT be deployed until all tests pass and meet coverage targets**

---

## 🔗 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **Progress Tracker:** [05_progress.md](./05_progress.md)
- **Testing Strategy:** [docs/guides/testing_strategy_20251226_claude_opus_4_5.md](../../../../guides/testing_strategy_20251226_claude_opus_4_5.md)
