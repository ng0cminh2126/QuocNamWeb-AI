# 🧪 Test Requirements Workflow - Feature Testing Guide

> **Version:** 1.0  
> **Last Updated:** 2026-01-06  
> **Purpose:** Hướng dẫn tạo và sử dụng test requirements file cho mỗi feature

---

## 📊 Tổng quan

**RULE:** Mọi feature mới PHẢI có file `06_testing.md` để định nghĩa test requirements TRƯỚC khi coding.

### Tại sao cần Test Requirements File?

| Lợi ích                   | Giải thích                                           |
| ------------------------- | ---------------------------------------------------- |
| ✅ **AI-Friendly**        | AI đọc file này và generate test code tự động        |
| ✅ **Pre-Planning**       | Định nghĩa test cases trước → không bị miss coverage |
| ✅ **Traceability**       | Mapping rõ ràng: implementation file → test file     |
| ✅ **Review Before Code** | HUMAN review test plan trước khi coding              |
| ✅ **Documentation**      | Track test results và coverage sau khi complete      |
| ✅ **Consistency**        | Mọi feature đều có cùng test structure               |

---

## 🔄 Workflow Tích hợp

### Vị trí trong Feature Development Workflow

```
┌──────────────────────────────────────────────────────────────┐
│  BƯỚC 1: Requirements → BƯỚC 2: Design → BƯỚC 3: API         │
│  → BƯỚC 4: Implementation Plan                               │
│  → BƯỚC 4.5: TEST REQUIREMENTS (06_testing.md) ⭐ NEW       │
│  → BƯỚC 5: Coding + Testing (reference 06_testing.md)       │
│  → BƯỚC 6: Test Verification (update 06_testing.md)         │
└──────────────────────────────────────────────────────────────┘
```

### BƯỚC 4.5: Test Requirements Generation

**Khi nào:** Ngay sau khi Implementation Plan (BƯỚC 4) được HUMAN approve

**File tạo:** `docs/modules/[module]/features/[feature]/06_testing.md`

**AI sẽ:**

1. Đọc implementation plan từ BƯỚC 4
2. Tạo test coverage matrix (implementation → test mapping)
3. Định nghĩa test cases cho từng file
4. Liệt kê test data/mocks requirements
5. Tạo test generation checklist
6. Thêm HUMAN CONFIRMATION section

**HUMAN cần:**

- [ ] Review test coverage matrix (có đủ files không?)
- [ ] Review test cases (có đủ comprehensive không?)
- [ ] Điền test data examples nếu cần
- [ ] ✅ APPROVED để AI tiếp tục BƯỚC 5

**⚠️ BLOCKING RULE:** AI KHÔNG ĐƯỢC code nếu `06_testing.md` chưa ✅ APPROVED

---

## 📄 File Structure: 06_testing.md

### Template Location

`docs/modules/_feature_template/06_testing.md`

### Required Sections

````markdown
# 🧪 [Feature Name] - Testing Requirements

## 📊 Test Coverage Matrix

### Unit Tests (70%)

| Implementation File | Test File                 | Test Cases | Status |
| ------------------- | ------------------------- | ---------- | ------ |
| src/api/xxx.api.ts  | tests/.../xxx.api.test.ts | 4          | ⏳     |
| src/hooks/useXxx.ts | tests/.../useXxx.test.tsx | 5          | ⏳     |

### Integration Tests (20%)

| Test File                   | Description   | Test Cases | Status |
| --------------------------- | ------------- | ---------- | ------ |
| tests/.../xxx-flow.test.tsx | Complete flow | 4          | ⏳     |

### E2E Tests (10%)

| Test File                    | User Flow           | Priority | Status |
| ---------------------------- | ------------------- | -------- | ------ |
| tests/.../happy-path.spec.ts | Login → Chat → Send | HIGH     | ⏳     |

## 🧪 Detailed Test Cases

### 1. Unit Test: xxx.api.test.ts

| #   | Test Case     | Priority | Input      | Expected        |
| --- | ------------- | -------- | ---------- | --------------- |
| 1   | Success case  | HIGH     | valid data | returns data    |
| 2   | Error 4xx     | HIGH     | invalid    | throws error    |
| 3   | Network error | HIGH     | timeout    | shows message   |
| 4   | Auth header   | HIGH     | token      | includes header |

### 2. Unit Test: useXxx.test.tsx

...

## 📦 Test Data & Mocks

### Mock Responses

```typescript
const mockSuccessResponse = { ... };
const mockErrorResponse = { ... };
```
````

### Test Fixtures

- User data: `test-user.json`
- Messages: `test-messages.json`

## ✅ Test Generation Checklist

- [ ] All implementation files have test mapping
- [ ] Test cases documented for each file
- [ ] Mock data prepared
- [ ] E2E scenarios defined

## 👤 HUMAN CONFIRMATION

- [ ] Reviewed test coverage matrix
- [ ] Verified test cases comprehensive
- [ ] ✅ APPROVED to proceed to BƯỚC 5

````

---

## 🎯 Test Coverage Rules

### Minimum Test Cases per File Type

| Implementation Type  | Test File Location         | Min Cases | Test Type   |
| -------------------- | -------------------------- | --------- | ----------- |
| API Client           | `tests/.../unit/xxx.api.test.ts` | 4         | Unit        |
| Query Hook           | `tests/.../unit/useXxx.test.tsx` | 5         | Unit        |
| Mutation Hook        | `tests/.../unit/useXxx.test.tsx` | 5         | Unit        |
| Component            | `tests/.../unit/Xxx.test.tsx`    | 4-6       | Unit        |
| Utility Function     | `tests/.../unit/xxx.test.ts`     | 3+        | Unit        |
| Feature Flow         | `tests/.../integration/xxx-flow.test.tsx` | 4 | Integration |
| Critical User Journey| `tests/.../e2e/xxx.spec.ts`      | Varies    | E2E         |

### Test Case Examples by Type

#### API Client (4 cases minimum)

```markdown
| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| 1 | Success - Returns data | valid params | returns data object |
| 2 | Error 401 - Auth failed | invalid token | throws AuthError |
| 3 | Error 400 - Bad request | invalid params | throws ValidationError |
| 4 | Network error - Timeout | slow network | throws NetworkError |
````

#### Query Hook (5 cases minimum)

```markdown
| #   | Test Case              | Input             | Expected                          |
| --- | ---------------------- | ----------------- | --------------------------------- |
| 1   | Initial loading state  | hook mount        | isLoading = true                  |
| 2   | Success - Returns data | API success       | data populated, isLoading = false |
| 3   | Error - Returns error  | API fails         | error object, isError = true      |
| 4   | Query key correct      | -                 | uses correct key from factory     |
| 5   | Refetch on invalidate  | invalidate called | refetches data                    |
```

#### Mutation Hook (5 cases minimum)

```markdown
| #   | Test Case                     | Input            | Expected                       |
| --- | ----------------------------- | ---------------- | ------------------------------ |
| 1   | Provides mutate function      | hook mount       | mutate function exists         |
| 2   | Loading state during mutation | mutate called    | isLoading = true               |
| 3   | Success callback fires        | mutation success | onSuccess called with data     |
| 4   | Error callback fires          | mutation fails   | onError called with error      |
| 5   | Optimistic update             | mutate called    | UI updates before API response |
```

#### Component (4-6 cases)

```markdown
| #   | Test Case         | Input          | Expected                      |
| --- | ----------------- | -------------- | ----------------------------- |
| 1   | Renders correctly | props          | matches snapshot              |
| 2   | Displays data     | data prop      | shows data in DOM             |
| 3   | User interaction  | button click   | callback called               |
| 4   | Loading state     | isLoading=true | shows skeleton                |
| 5   | Error state       | error prop     | shows error message           |
| 6   | Accessibility     | -              | has ARIA labels, keyboard nav |
```

---

## 🔧 AI Test Generation Process

### Step 1: Read Test Requirements

```
AI đọc file: docs/modules/[module]/features/[feature]/06_testing.md
↓
Parse test coverage matrix
↓
Xác định files cần tạo tests
```

### Step 2: Generate Test Files

```
For each implementation file:
  1. Tạo test file tương ứng
  2. Import dependencies (vitest, RTL, etc.)
  3. Setup mocks (API, stores, etc.)
  4. Generate test cases theo 06_testing.md
  5. Add data-testid to components (for E2E)
```

### Step 3: Verify & Update

```
1. Run tests: npm run test:run
2. Check coverage: npm run test:coverage
3. Update 06_testing.md status: ⏳ → ✅
4. Update coverage numbers
```

---

## 📝 Example: Login Feature

### Implementation Plan (BƯỚC 4)

```
Files to create:
- src/api/auth.api.ts
- src/hooks/mutations/useLogin.ts
- src/components/auth/LoginForm.tsx
```

### Test Requirements Generated (BƯỚC 4.5)

`docs/modules/auth/features/login/06_testing.md`:

```markdown
## 📊 Test Coverage Matrix

### Unit Tests

| Implementation File               | Test File                                | Cases | Status |
| --------------------------------- | ---------------------------------------- | ----- | ------ |
| src/api/auth.api.ts               | tests/auth/login/unit/auth.api.test.ts   | 4     | ⏳     |
| src/hooks/mutations/useLogin.ts   | tests/auth/login/unit/useLogin.test.tsx  | 5     | ⏳     |
| src/components/auth/LoginForm.tsx | tests/auth/login/unit/LoginForm.test.tsx | 6     | ⏳     |

### Integration Tests

| Test File                                        | Description         | Cases | Status |
| ------------------------------------------------ | ------------------- | ----- | ------ |
| tests/auth/login/integration/login-flow.test.tsx | Complete login flow | 4     | ⏳     |

### E2E Tests

| Test File                                | User Flow                       | Status |
| ---------------------------------------- | ------------------------------- | ------ |
| tests/auth/login/e2e/happy-path.spec.ts  | Enter creds → Submit → Redirect | ⏳     |
| tests/auth/login/e2e/error-cases.spec.ts | Invalid creds → Error message   | ⏳     |

## 🧪 Detailed Test Cases

### 1. auth.api.test.ts (4 cases)

| #   | Test Case                    | Input            | Expected             |
| --- | ---------------------------- | ---------------- | -------------------- |
| 1   | Success login                | valid creds      | returns token + user |
| 2   | Invalid credentials          | wrong password   | throws 401 error     |
| 3   | Network error                | timeout          | throws NetworkError  |
| 4   | Request includes credentials | email + password | body contains both   |

### 2. useLogin.test.tsx (5 cases)

...

## ✅ Checklist

- [x] All files mapped to tests (3 unit, 1 integration, 2 e2e)
- [x] Test cases documented (15 unit + 4 integration + 2 e2e)
- [ ] Mock data prepared
- [ ] HUMAN APPROVED ⏳

## 👤 HUMAN CONFIRMATION

- [ ] ✅ APPROVED to proceed
```

### Coding Phase (BƯỚC 5)

AI viết code + tests đồng thời, reference `06_testing.md`:

```
1. Create src/api/auth.api.ts
2. Create tests/auth/login/unit/auth.api.test.ts (4 cases from 06_testing.md)
3. Run tests → ensure passing
4. Create src/hooks/mutations/useLogin.ts
5. Create tests/auth/login/unit/useLogin.test.tsx (5 cases from 06_testing.md)
...
```

### Verification (BƯỚC 6)

AI updates `06_testing.md`:

```markdown
## 📊 Test Coverage Matrix (UPDATED)

### Unit Tests

| Implementation File               | Test File                                | Cases | Status    |
| --------------------------------- | ---------------------------------------- | ----- | --------- |
| src/api/auth.api.ts               | tests/auth/login/unit/auth.api.test.ts   | 4     | ✅ PASSED |
| src/hooks/mutations/useLogin.ts   | tests/auth/login/unit/useLogin.test.tsx  | 5     | ✅ PASSED |
| src/components/auth/LoginForm.tsx | tests/auth/login/unit/LoginForm.test.tsx | 6     | ✅ PASSED |

## 📈 Test Results

### Coverage Report

- Unit Tests: 87% (✅ Target: ≥80%)
- Integration Tests: 65% (✅ Target: ≥60%)
- E2E Tests: 2/2 passed (✅)

### Test Execution

- Total Test Files: 5
- Total Tests: 21
- Passed: 21
- Failed: 0
- Skipped: 0
```

---

## ✅ Checklist for HUMAN Review

Khi AI tạo `06_testing.md`, HUMAN cần verify:

- [ ] **Completeness:** Mọi implementation file đều có test file mapping
- [ ] **Coverage:** Test cases đủ comprehensive (happy path + errors + edge cases)
- [ ] **Test Types:** Có đủ unit + integration + e2e (nếu cần)
- [ ] **Test Data:** Mock data/fixtures đã được prepare
- [ ] **Realistic:** Test cases có ý nghĩa thực tế, không phải chỉ để đạt coverage
- [ ] **E2E Scenarios:** Critical user flows được cover
- [ ] **Testability:** Components có `data-testid` để E2E test được

---

## 🔗 Related Documents

- **Feature Development Workflow:** [docs/guides/feature_development_workflow.md](./feature_development_workflow.md)
- **Testing Strategy:** [docs/guides/testing_strategy_20251226_claude_opus_4_5.md](./testing_strategy_20251226_claude_opus_4_5.md)
- **Testing Guide:** [docs/testing/README.md](../testing/README.md)
- **Template:** [docs/modules/\_feature_template/06_testing.md](../modules/_feature_template/06_testing.md)

---

## 📞 FAQ

### Q: Khi nào tạo 06_testing.md?

**A:** Ngay sau khi Implementation Plan (BƯỚC 4) được approve, trước khi bắt đầu coding (BƯỚC 5).

### Q: AI có bắt buộc phải có file này trước khi code không?

**A:** Có. Theo RULE 5, AI KHÔNG ĐƯỢC code nếu `06_testing.md` chưa được HUMAN approve.

### Q: Nếu feature không có API thì sao?

**A:** Vẫn phải có `06_testing.md`. Chỉ cần skip phần API tests, focus vào component/hook tests.

### Q: Test cases có thể thay đổi trong quá trình coding không?

**A:** Có thể. Nếu phát hiện cần thêm test cases, update `06_testing.md` và yêu cầu HUMAN re-approve.

### Q: AI có thể tự động generate test code không?

**A:** Có. AI đọc `06_testing.md` và generate test code theo test cases đã define.

### Q: Coverage target có bắt buộc không?

**A:** Có. Unit ≥80%, Integration ≥60%, E2E critical flows 100%.

---

**Last updated:** 2026-01-06  
**Next review:** When workflow changes or new test requirements emerge
