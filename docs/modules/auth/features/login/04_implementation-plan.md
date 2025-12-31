# 🔐 Login Feature - Implementation Plan

> **[BƯỚC 4]** Implementation Planning  
> **Feature ID:** `AUTH-001`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ✅ APPROVED

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới

#### Types

| File                | Description                                       |
| ------------------- | ------------------------------------------------- |
| `src/types/auth.ts` | Update với LoginRequest, LoginResponse interfaces |

#### API Layer

| File                                 | Description                  |
| ------------------------------------ | ---------------------------- |
| `src/api/auth.api.ts`                | API client functions (login) |
| `src/api/__tests__/auth.api.test.ts` | Unit tests                   |

#### Hooks Layer

| File                                             | Description         |
| ------------------------------------------------ | ------------------- |
| `src/hooks/mutations/useLogin.ts`                | Login mutation hook |
| `src/hooks/mutations/__tests__/useLogin.test.ts` | Hook tests          |

#### Components

| File                                               | Description                  |
| -------------------------------------------------- | ---------------------------- |
| `src/components/auth/LoginForm.tsx`                | Login form component         |
| `src/components/auth/IdentifierInput.tsx`          | Email/Phone input (flexible) |
| `src/components/auth/PasswordInput.tsx`            | Password input with toggle   |
| `src/components/auth/__tests__/LoginForm.test.tsx` | Component tests              |

#### Pages

| File                      | Description                  |
| ------------------------- | ---------------------------- |
| `src/pages/LoginPage.tsx` | Login page (centered layout) |

#### Utils

| File                           | Description                      |
| ------------------------------ | -------------------------------- |
| `src/lib/validation/auth.ts`   | Validation utilities             |
| `src/lib/auth/tokenStorage.ts` | Token storage abstraction        |
| `src/lib/auth/config.ts`       | Auth configuration               |
| `src/lib/auth/jwt.ts`          | JWT parsing (get exp from token) |

#### Hooks (Session Management)

| File                           | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `src/hooks/useTokenRefresh.ts` | Auto refresh token 10 phút trước khi hết hạn |

### Files sẽ sửa đổi

| File                            | Changes                                       |
| ------------------------------- | --------------------------------------------- |
| `src/stores/authStore.ts`       | Add login action, token management, expiresAt |
| `src/api/client.ts`             | Add auth interceptor, 401 handling            |
| `src/routes/index.tsx`          | Add login route, "/" redirect to portal       |
| `src/routes/ProtectedRoute.tsx` | Redirect to login if not authenticated        |
| `tailwind.config.js`            | Add green theme colors (#2f9132)              |

### Dependencies sẽ thêm

```json
{
  "react-hook-form": "^7.49.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.22.0",
  "sonner": "^1.3.0"
}
```

---

## 📊 TESTING REQUIREMENTS

### Test Coverage Target: ≥80%

| File                   | Test File                  | Cases | Type      |
| ---------------------- | -------------------------- | ----- | --------- |
| `auth.api.ts`          | `auth.api.test.ts`         | 5     | Unit      |
| `useLogin.ts`          | `useLogin.test.ts`         | 5     | Hook      |
| `LoginForm.tsx`        | `LoginForm.test.tsx`       | 8     | Component |
| `IdentifierInput.tsx`  | `IdentifierInput.test.tsx` | 4     | Component |
| `PasswordInput.tsx`    | `PasswordInput.test.tsx`   | 4     | Component |
| `auth.ts` (validation) | `auth.test.ts`             | 5     | Unit      |

### Test Cases Breakdown

#### `auth.api.test.ts` (5 cases)

1. ✅ Success - Returns accessToken and user
2. ✅ Error 401 - Invalid credentials
3. ✅ Error 400 - Validation error
4. ✅ Network error handling
5. ✅ Correct payload format

#### `useLogin.test.ts` (5 cases)

1. ✅ Loading state management
2. ✅ Success - Calls onSuccess callback
3. ✅ Error - Calls onError callback
4. ✅ Stores token on success
5. ✅ Updates authStore on success

#### `LoginForm.test.tsx` (8 cases)

1. ✅ Renders all fields correctly
2. ✅ Validates email format
3. ✅ Validates required fields
4. ✅ Shows/hides password
5. ✅ Submits with valid data
6. ✅ Displays API errors
7. ✅ Disables form during submission
8. ✅ Enter key submits form

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Foundation (Priority: HIGH)

**Goal:** Setup infrastructure

| Task                    | Files                          | Est. Time |
| ----------------------- | ------------------------------ | --------- |
| Update types            | `src/types/auth.ts`            | 15m       |
| Create auth config      | `src/lib/auth/config.ts`       | 15m       |
| Create token storage    | `src/lib/auth/tokenStorage.ts` | 30m       |
| Create validation utils | `src/lib/validation/auth.ts`   | 20m       |

### Phase 2: API Layer (Priority: HIGH)

**Goal:** API integration

| Task                   | Files                                | Est. Time |
| ---------------------- | ------------------------------------ | --------- |
| Create auth API client | `src/api/auth.api.ts`                | 30m       |
| Update axios client    | `src/api/client.ts`                  | 30m       |
| Write API tests        | `src/api/__tests__/auth.api.test.ts` | 30m       |

### Phase 3: State Management (Priority: HIGH)

**Goal:** Auth state + Token refresh

| Task                   | Files                                            | Est. Time |
| ---------------------- | ------------------------------------------------ | --------- |
| Update auth store      | `src/stores/authStore.ts`                        | 45m       |
| Create JWT parser      | `src/lib/auth/jwt.ts`                            | 20m       |
| Create useLogin hook   | `src/hooks/mutations/useLogin.ts`                | 30m       |
| Create useTokenRefresh | `src/hooks/useTokenRefresh.ts`                   | 45m       |
| Write hook tests       | `src/hooks/mutations/__tests__/useLogin.test.ts` | 30m       |

### Phase 4: UI Components (Priority: HIGH)

**Goal:** Build UI

| Task                   | Files                                      | Est. Time |
| ---------------------- | ------------------------------------------ | --------- |
| Create IdentifierInput | `src/components/auth/IdentifierInput.tsx`  | 30m       |
| Create PasswordInput   | `src/components/auth/PasswordInput.tsx`    | 30m       |
| Create LoginForm       | `src/components/auth/LoginForm.tsx`        | 45m       |
| Create LoginPage       | `src/pages/LoginPage.tsx`                  | 30m       |
| Write component tests  | `src/components/auth/__tests__/*.test.tsx` | 60m       |

### Phase 5: Routing (Priority: HIGH)

**Goal:** Route protection + "/" redirect

| Task                  | Files                           | Est. Time |
| --------------------- | ------------------------------- | --------- |
| Update routes         | `src/routes/index.tsx`          | 30m       |
| Update ProtectedRoute | `src/routes/ProtectedRoute.tsx` | 30m       |
| "/" → portal redirect | `src/routes/index.tsx`          | 15m       |

### Phase 6: Styling (Priority: MEDIUM)

**Goal:** Apply design

| Task                   | Files                | Est. Time |
| ---------------------- | -------------------- | --------- |
| Update Tailwind config | `tailwind.config.js` | 15m       |
| Style components       | Various              | 30m       |

---

## ⏳ ESTIMATED TIMELINE

| Phase                     | Duration | Cumulative |
| ------------------------- | -------- | ---------- |
| Phase 1: Foundation       | 1.5h     | 1.5h       |
| Phase 2: API Layer        | 1.5h     | 3h         |
| Phase 3: State Management | 3h       | 6h         |
| Phase 4: UI Components    | 3.5h     | 9.5h       |
| Phase 5: Routing          | 1.25h    | 10.75h     |
| Phase 6: Styling          | 1h       | 11.75h     |
| **Total**                 | **~12h** |            |

---

## ✅ IMPLEMENTATION CHECKLIST

### Pre-Implementation

- [x] Requirements document approved
- [x] API contract confirmed
- [x] Snapshots captured
- [x] Implementation plan approved

### Phase 1: Foundation

- [ ] Update `src/types/auth.ts`
- [ ] Create `src/lib/auth/config.ts`
- [ ] Create `src/lib/auth/tokenStorage.ts`
- [ ] Create `src/lib/validation/auth.ts`
- [ ] Tests pass

### Phase 2: API Layer

- [ ] Create `src/api/auth.api.ts`
- [ ] Update `src/api/client.ts`
- [ ] Create `src/api/__tests__/auth.api.test.ts`
- [ ] Tests pass (5/5)

### Phase 3: State Management

- [ ] Update `src/stores/authStore.ts`
- [ ] Create `src/lib/auth/jwt.ts`
- [ ] Create `src/hooks/mutations/useLogin.ts`
- [ ] Create `src/hooks/useTokenRefresh.ts`
- [ ] Create `src/hooks/mutations/__tests__/useLogin.test.ts`
- [ ] Tests pass (5/5)

### Phase 4: UI Components

- [ ] Create `src/components/auth/IdentifierInput.tsx`
- [ ] Create `src/components/auth/PasswordInput.tsx`
- [ ] Create `src/components/auth/LoginForm.tsx`
- [ ] Create `src/pages/LoginPage.tsx`
- [ ] Error messages hiển thị inline trên form
- [ ] Create component tests
- [ ] Tests pass (16/16)

### Phase 5: Routing

- [ ] Update `src/routes/index.tsx`
- [ ] Update `src/routes/ProtectedRoute.tsx`
- [ ] "/" route redirect to portal khi đã login
- [ ] Test route protection

### Phase 6: Styling

- [ ] Update `tailwind.config.js`
- [ ] Apply green theme (#2f9132)
- [ ] Responsive testing

### Quality Assurance

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Manual testing (Desktop, Tablet, Mobile)
- [ ] Accessibility testing

### Documentation

- [ ] Update action log
- [ ] Update changelog

---

## 🔄 ROLLBACK PLAN

Nếu cần rollback:

1. Revert commits với `git revert`
2. Files affected:
   - `src/api/auth.api.ts`
   - `src/hooks/mutations/useLogin.ts`
   - `src/components/auth/*`
   - `src/pages/LoginPage.tsx`
   - `src/stores/authStore.ts`
   - `src/routes/*`

---

## ✅ HUMAN Confirmation

| Item                      | Status |
| ------------------------- | ------ |
| Impact Summary reviewed   | ✅     |
| Timeline acceptable       | ✅     |
| **APPROVED to implement** | ✅     |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2025-12-27
