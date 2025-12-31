# [Feature Name] - Implementation Plan

> **[BƯỚC 4]** Implementation Planning  
> **Feature ID:** `[MODULE]-[NUMBER]`  
> **Module:** [Module Name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING APPROVAL

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới

#### Types

| File                    | Description           |
| ----------------------- | --------------------- |
| `src/types/[module].ts` | TypeScript interfaces |

#### API Layer

| File                                     | Description          |
| ---------------------------------------- | -------------------- |
| `src/api/[module].api.ts`                | API client functions |
| `src/api/__tests__/[module].api.test.ts` | Unit tests for API   |

#### Hooks Layer

| File                                                | Description               |
| --------------------------------------------------- | ------------------------- |
| `src/hooks/queries/use[Feature].ts`                 | Query hook (if read data) |
| `src/hooks/mutations/use[Action][Feature].ts`       | Mutation hook (if write)  |
| `src/hooks/queries/__tests__/use[Feature].test.ts`  | Query hook tests          |
| `src/hooks/mutations/__tests__/use[Action].test.ts` | Mutation hook tests       |

#### Components

| File                                                     | Description              |
| -------------------------------------------------------- | ------------------------ |
| `src/components/[module]/[Component].tsx`                | Component implementation |
| `src/components/[module]/__tests__/[Component].test.tsx` | Component tests          |

#### Pages (if new page)

| File                          | Description    |
| ----------------------------- | -------------- |
| `src/pages/[Feature]Page.tsx` | Page component |

#### Utils (if needed)

| File                                        | Description       |
| ------------------------------------------- | ----------------- |
| `src/lib/[module]/[util].ts`                | Utility functions |
| `src/lib/[module]/__tests__/[util].test.ts` | Utility tests     |

### Files sẽ sửa đổi

| File                       | Changes                               |
| -------------------------- | ------------------------------------- |
| `src/routes/routes.ts`     | Add new route (if applicable)         |
| `src/lib/queryClient.ts`   | Add query key factory (if applicable) |
| `[existing component].tsx` | Integrate new feature                 |

### Files sẽ xoá

- (Liệt kê files sẽ xoá, nếu có)
- (none) nếu không có

### Dependencies sẽ thêm/xoá

**Thêm:**

- (Liệt kê packages mới, nếu có)
- (none) nếu không cần thêm dependency

**Xoá:**

- (Liệt kê packages xoá, nếu có)
- (none) nếu không xoá

---

## 🧪 TESTING REQUIREMENTS

### Test Files Mapping

| Implementation File             | Test File                                      | Test Cases |
| ------------------------------- | ---------------------------------------------- | ---------- |
| `src/api/[module].api.ts`       | `src/api/__tests__/[module].api.test.ts`       | 4          |
| `src/hooks/queries/use[X].ts`   | `src/hooks/queries/__tests__/use[X].test.ts`   | 5          |
| `src/hooks/mutations/use[X].ts` | `src/hooks/mutations/__tests__/use[X].test.ts` | 5          |
| `src/components/[X].tsx`        | `src/components/__tests__/[X].test.tsx`        | 4-6        |

**Total Test Files:** [Number]

**Coverage Target:** ≥80% unit tests

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Type Definitions)

- [ ] Define TypeScript interfaces in `src/types/[module].ts`
  - [ ] Request types
  - [ ] Response types
  - [ ] Component props types
- [ ] Export types from `src/types/index.ts`

**Estimated Time:** [X hours]

---

### Phase 2: API Layer

- [ ] Create `src/api/[module].api.ts`
  - [ ] Import axios client
  - [ ] Define API functions
  - [ ] Add error handling
- [ ] Create test file `src/api/__tests__/[module].api.test.ts`
  - [ ] Test success case
  - [ ] Test error cases
  - [ ] Test validation
  - [ ] Test network errors

**Estimated Time:** [X hours]

---

### Phase 3: State Management (Hooks)

**Query Hooks (if read data):**

- [ ] Create `src/hooks/queries/use[Feature].ts`
  - [ ] Define query key factory
  - [ ] Implement useQuery hook
  - [ ] Add proper typing
- [ ] Create test file
  - [ ] Test loading state
  - [ ] Test success state
  - [ ] Test error state
  - [ ] Test query key
  - [ ] Test refetch

**Mutation Hooks (if write data):**

- [ ] Create `src/hooks/mutations/use[Action][Feature].ts`
  - [ ] Implement useMutation hook
  - [ ] Add optimistic updates (if applicable)
  - [ ] Add cache invalidation
- [ ] Create test file
  - [ ] Test mutation success
  - [ ] Test mutation error
  - [ ] Test loading state
  - [ ] Test cache invalidation
  - [ ] Test optimistic updates

**Estimated Time:** [X hours]

---

### Phase 4: UI Components

- [ ] Create components in `src/components/[module]/`
  - [ ] [Component 1]: [Description]
  - [ ] [Component 2]: [Description]
  - [ ] [Component 3]: [Description]
- [ ] Add `data-testid` attributes for E2E testing
- [ ] Ensure accessibility (ARIA labels)
- [ ] Create test files
  - [ ] Test rendering
  - [ ] Test user interactions
  - [ ] Test conditional rendering
  - [ ] Test accessibility

**Estimated Time:** [X hours]

---

### Phase 5: Pages (if new page)

- [ ] Create `src/pages/[Feature]Page.tsx`
  - [ ] Layout structure
  - [ ] Integrate components
  - [ ] Add loading states
  - [ ] Add error handling
- [ ] Add route in `src/routes/routes.ts`
- [ ] Add route protection (if needed)
- [ ] Create test file

**Estimated Time:** [X hours]

---

### Phase 6: Integration & Testing

- [ ] Integration testing
  - [ ] Test complete user flow
  - [ ] Test error scenarios
  - [ ] Test edge cases
- [ ] Run all tests: `npm run test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Fix any failing tests
- [ ] Ensure coverage ≥80%

**Estimated Time:** [X hours]

---

### Phase 7: Code Review & Refinement

- [ ] Code review checklist
  - [ ] Follow code conventions
  - [ ] No console.logs
  - [ ] No commented code
  - [ ] Proper error handling
  - [ ] Type safety (no `any`)
- [ ] Performance optimization
  - [ ] Memoization where needed
  - [ ] Lazy loading (if applicable)
  - [ ] Image optimization
- [ ] Accessibility check
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Focus management

**Estimated Time:** [X hours]

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề kỹ thuật   | Lựa chọn            | HUMAN Decision |
| --- | ----------------- | ------------------- | -------------- |
| 1   | Pagination size   | 20, 50, or 100?     | ⬜ **\_\_\_**  |
| 2   | Cache stale time  | 30s or 60s?         | ⬜ **\_\_\_**  |
| 3   | Error retry count | 3 or 5 times?       | ⬜ **\_\_\_**  |
| 4   | Loading skeleton  | Simple or detailed? | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC code nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                       | Status         |
| ------------------------------ | -------------- |
| Đã review Impact Summary       | ⬜ Chưa review |
| Đã review Testing Requirements | ⬜ Chưa review |
| Đã review Implementation Plan  | ⬜ Chưa review |
| Đã điền Pending Decisions      | ⬜ Chưa điền   |
| **APPROVED để code**           | ⬜ PENDING     |

**HUMAN Signature:** ******\_******  
**Date:** ******\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **API Contract:** [03_api-contract.md](./03_api-contract.md)
- **Progress Tracker:** [05_progress.md](./05_progress.md)
- **Testing:** [06_testing.md](./06_testing.md)

---

## 📊 Estimated Timeline

| Phase                  | Hours | Dependencies |
| ---------------------- | ----- | ------------ |
| Phase 1: Foundation    | X     | -            |
| Phase 2: API Layer     | X     | Phase 1      |
| Phase 3: State Mgmt    | X     | Phase 2      |
| Phase 4: UI Components | X     | Phase 3      |
| Phase 5: Pages         | X     | Phase 4      |
| Phase 6: Integration   | X     | Phase 5      |
| Phase 7: Review        | X     | Phase 6      |
| **Total**              | **X** | -            |

---

## 📝 Notes

- Add any special implementation considerations
- Link to coding standards or patterns
- Reference similar implementations

---

## 📚 Version History

| Version | Date       | Changes                     |
| ------- | ---------- | --------------------------- |
| v1.0    | YYYY-MM-DD | Initial implementation plan |
