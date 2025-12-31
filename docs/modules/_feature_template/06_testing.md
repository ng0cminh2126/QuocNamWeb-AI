# 🧪 [Feature Name] - Testing Documentation

> **[BƯỚC 6]** Testing Requirements & Coverage  
> **Feature:** [Feature Name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
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

## 🗂️ Test Files Mapping

### Example Structure

| Implementation File           | Test File                                    | Status | Test Cases |
| ----------------------------- | -------------------------------------------- | ------ | ---------- |
| `src/api/[module].api.ts`     | `src/api/__tests__/[module].api.test.ts`     | ⏳     | 4          |
| `src/hooks/queries/use[X].ts` | `src/hooks/queries/__tests__/use[X].test.ts` | ⏳     | 5          |
| `src/components/[X].tsx`      | `src/components/__tests__/[X].test.tsx`      | ⏳     | 4-6        |

---

## 📈 Testing Progress

### Overall Progress

| Phase                 | Files | Completed | Progress |
| --------------------- | ----- | --------- | -------- |
| **Unit Tests**        | -     | 0         | 0%       |
| **Integration Tests** | -     | 0         | 0%       |
| **E2E Tests**         | -     | 0         | 0%       |

**Overall:** 0%

---

## ✅ Testing Checklist

### Pre-Testing Setup

- [ ] Test framework configured
- [ ] Testing libraries installed
- [ ] Mock setup created
- [ ] Test utilities ready

### Unit Testing Phase

- [ ] API layer tests
- [ ] Hooks tests
- [ ] Components tests
- [ ] Utilities tests

### Integration Testing

- [ ] Feature flow tests
- [ ] Error handling tests

### E2E Testing (Optional)

- [ ] Happy path scenario
- [ ] Error scenarios

---

## 🎯 Test Data Requirements

```typescript
// TODO: Define mock data
```

---

## 📝 Testing Best Practices

### DO ✅

- ✅ Write tests alongside implementation
- ✅ Use `data-testid` for elements
- ✅ Test user behavior
- ✅ Mock external dependencies
- ✅ Use descriptive test names

### DON'T ❌

- ❌ Skip tests
- ❌ Test implementation details
- ❌ Use hardcoded delays
- ❌ Share state between tests

---

## ⚠️ HUMAN CONFIRMATION

| Item                        | Status     |
| --------------------------- | ---------- |
| All unit tests written      | ⬜ Pending |
| All tests passing           | ⬜ Pending |
| Coverage meets threshold    | ⬜ Pending |
| **APPROVED for deployment** | ⬜ PENDING |

**Approved By:** ******\_******  
**Date:** ******\_******

---

## 🔗 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **Testing Strategy:** [docs/guides/testing_strategy_20251226_claude_opus_4_5.md](../../../../guides/testing_strategy_20251226_claude_opus_4_5.md)
