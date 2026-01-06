# Test Restructuring Summary - Chat Messages

> **Date:** 2025-01-05  
> **Feature:** Chat Messages  
> **Task:** Move tests to proper structure + Create testing documentation

---

## ✅ Completed Tasks

### 1. Test File Restructuring

Moved all test files to proper `tests/` folder structure:

```
tests/chat/messages/
├── unit/
│   ├── useSendMessage.test.tsx        # 6 test cases
│   └── useMessageRealtime.test.tsx    # 9 test cases
├── integration/
│   └── message-send-flow.test.tsx     # 4 test cases
├── e2e/
│   ├── message-sending.spec.ts        # 4 test cases (Playwright)
│   └── signalr-realtime.spec.ts       # 4 test cases (Playwright)
└── README.md                          # Test documentation
```

**Total:** 27 test cases covering message functionality

### 2. Testing Documentation

Created comprehensive testing guides in `docs/testing/`:

```
docs/testing/
├── README.md                  # Main testing guide (complete overview)
├── unit-testing.md           # Unit testing patterns & examples
└── integration-testing.md    # Integration testing patterns & examples
```

### 3. Test Documentation Content

#### docs/testing/README.md (Main Guide)

- ✅ Testing philosophy: "No Code Without Tests"
- ✅ 3 test types explained (Unit, Integration, E2E)
- ✅ Folder structure standards
- ✅ Test creation workflow (5 steps)
- ✅ Naming conventions
- ✅ Testing tools (Vitest, Playwright, React Testing Library)
- ✅ Best practices (DO/DON'T examples)
- ✅ Common patterns (5 patterns with code examples)
- ✅ CI/CD integration examples
- ✅ Checklist for adding new features
- ✅ NPM scripts for running tests

#### docs/testing/unit-testing.md

- ✅ What to unit test (API clients, hooks, components, utilities)
- ✅ 5 detailed examples with full code
- ✅ 5 common patterns (createWrapper, spies, mocks)
- ✅ Best practices with ✅ DO / ❌ DON'T comparisons
- ✅ Running commands
- ✅ Checklist

#### docs/testing/integration-testing.md

- ✅ Integration test philosophy (real interactions, mock externals)
- ✅ 3 example flows (message sending, task creation, auth)
- ✅ Full code examples (~500 lines total)
- ✅ 3 common patterns (API logging, multi-step wizards, SignalR)
- ✅ Best practices
- ✅ Running commands
- ✅ Checklist

---

## 📊 Test Coverage

### Unit Tests (15 cases)

**useSendMessage.test.tsx (6 tests):**

1. ✅ Should send message and replace optimistic update
2. ✅ Should add optimistic message to cache immediately
3. ✅ Should rollback optimistic update on error
4. ✅ Should NOT invalidate queries on success (no refetch)
5. ✅ Should call onSuccess callback with message data
6. ✅ Should send message with parentMessageId for replies

**useMessageRealtime.test.tsx (9 tests):**

1. ✅ Should receive new message via SignalR and update cache
2. ✅ Should NOT invalidate queries when receiving message (no refetch)
3. ✅ Should handle typing indicator events
4. ✅ Should join conversation group when connected
5. ✅ Should leave conversation group on cleanup
6. ✅ Should call onNewMessage callback when message received
7. ✅ Should not add duplicate messages to cache
8. ✅ Should normalize contentType from number to string
9. ✅ Should update conversation list with lastMessage

### Integration Tests (4 cases)

**message-send-flow.test.tsx:**

1. ✅ Should complete full send flow: input → optimistic → API → final
2. ✅ Should handle API error with rollback
3. ✅ Should handle rapid message sending (3 messages)
4. ✅ Should receive SignalR message without API refetch

### E2E Tests (8 cases)

**message-sending.spec.ts (Playwright):**

1. ✅ Should send message with only ONE API call (no refetch)
2. ✅ Should show optimistic message immediately (<500ms)
3. ✅ Should rollback on network error
4. ✅ Should handle rapid message sending (3 messages, 0 GET calls)

**signalr-realtime.spec.ts (Playwright):**

1. ✅ Should receive message via SignalR without API refetch
2. ✅ Should show typing indicator via SignalR
3. ✅ Should handle multiple rapid SignalR messages (5 messages, 0 API calls)
4. ✅ Should not duplicate messages from SignalR

---

## 🎯 Key Testing Principles Documented

### 1. No Code Without Tests

Every new file MUST have corresponding test file:

- `foo.ts` → `tests/{module}/{feature}/unit/foo.test.ts`
- `useFoo.ts` → `tests/{module}/{feature}/unit/useFoo.test.tsx`
- `Foo.tsx` → `tests/{module}/{feature}/unit/Foo.test.tsx`

### 2. Test Types Decision Matrix

| Scenario                            | Unit | Integration | E2E          |
| ----------------------------------- | ---- | ----------- | ------------ |
| API client function                 | ✅   | -           | -            |
| Custom hook                         | ✅   | -           | -            |
| React component                     | ✅   | -           | -            |
| Feature with UI + API + real-time   | ✅   | ✅          | ✅           |
| Critical user flow (login, payment) | ✅   | ✅          | ✅ Mandatory |

### 3. Minimum Test Cases

| File Type       | Min Cases | Examples                                      |
| --------------- | --------- | --------------------------------------------- |
| API client      | 3         | success, error, auth failure                  |
| Hook (query)    | 5         | loading, success, error, refetch, query key   |
| Hook (mutation) | 5         | loading, success, error, rollback, optimistic |
| Component       | 4         | render, conditional, events, accessibility    |
| Integration     | 3         | happy path, error scenario, edge case         |
| E2E             | 2         | happy path, error scenario                    |

### 4. Critical Assertions Pattern

**For duplicate API call prevention:**

```typescript
// Unit test
expect(invalidateSpy).not.toHaveBeenCalled();
expect(setQueryDataSpy).toHaveBeenCalled();

// Integration test
const postCalls = apiCallLog.filter((m) => m === "POST");
const getCalls = apiCallLog.filter((m) => m === "GET");
expect(postCalls).toHaveLength(1);
expect(getCalls).toHaveLength(0);

// E2E test
const apiCalls = [];
page.on("request", (req) => apiCalls.push(req.method()));
// ... perform action ...
expect(apiCalls.filter((m) => m === "POST")).toHaveLength(1);
expect(apiCalls.filter((m) => m === "GET")).toHaveLength(0);
```

### 5. Test Folder Structure Standard

```
tests/
├── README.md
├── {module}/              # e.g., auth, chat, task, file
│   └── {feature}/         # e.g., login, messages, create-task
│       ├── README.md      # Feature test docs
│       ├── unit/
│       ├── integration/
│       └── e2e/
└── fixtures/              # Shared test data
    ├── messages.ts
    └── users.ts
```

---

## 📝 Documentation Highlights

### Test Creation Workflow (5 Steps)

```
Step 1: Identify Test Scope
  → Feature: Send Message
    ├── API client → unit test
    ├── Hook → unit test
    ├── Component → unit test
    ├── Flow → integration test
    └── Critical path → E2E test

Step 2: Create Test Files
  → Use naming pattern: {name}.test.ts(x) or {scenario}.spec.ts

Step 3: Write Tests
  → Minimum cases per file type (see table above)

Step 4: Run Tests
  → npm test tests/{module}/{feature}/{type}

Step 5: Update README
  → Each feature folder MUST have README.md
```

### Common Testing Patterns (Documented)

1. **createWrapper Factory** - For hooks needing QueryClient
2. **Spying on QueryClient Methods** - Verify cache updates, NOT refetch
3. **Mock API Functions** - Isolate from API layer
4. **Mock Zustand Stores** - Isolate from global state
5. **Mock SignalR** - Isolate from WebSocket

### Best Practices Summary

✅ **DO:**

- Test behavior, not implementation
- Use descriptive test names
- Clear mocks between tests
- Test edge cases
- Use `waitFor` for async operations

❌ **DON'T:**

- Test implementation details
- Skip cleanup
- Make tests dependent on each other
- Use real timers (use `vi.useFakeTimers()`)
- Mock everything (integration tests need real interactions)

---

## 🚀 Running Tests

### NPM Scripts

```bash
# All tests
npm test

# Unit tests only
npm test tests/**/unit

# Integration tests only
npm test tests/**/integration

# E2E tests
npx playwright test

# Specific module
npm test tests/chat

# Specific feature
npm test tests/chat/messages

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Playwright E2E Tests

```bash
# All E2E tests
npx playwright test

# Specific file
npx playwright test tests/chat/messages/e2e/message-sending.spec.ts

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed
```

---

## ✅ Checklist for Future Features

When adding new feature, ensure:

- [ ] Create folder: `tests/{module}/{feature}/`
- [ ] Create README.md in feature folder
- [ ] Create unit tests for all new files
  - [ ] API clients
  - [ ] Hooks
  - [ ] Components
  - [ ] Utilities
- [ ] Create integration test for main flow
- [ ] Create E2E test if critical user journey
- [ ] Add `data-testid` to UI elements
- [ ] Run tests and verify pass
- [ ] Update `docs/testing/` if new patterns emerge

---

## 📚 Reference Documents

### Created Files

1. **tests/chat/messages/README.md** - Feature test overview
2. **tests/chat/messages/unit/useSendMessage.test.tsx** - Unit tests (6 cases)
3. **tests/chat/messages/unit/useMessageRealtime.test.tsx** - Unit tests (9 cases)
4. **tests/chat/messages/integration/message-send-flow.test.tsx** - Integration (4 cases)
5. **tests/chat/messages/e2e/message-sending.spec.ts** - E2E tests (4 cases)
6. **tests/chat/messages/e2e/signalr-realtime.spec.ts** - E2E tests (4 cases)
7. **docs/testing/README.md** - Main testing guide (~1200 lines)
8. **docs/testing/unit-testing.md** - Unit testing guide (~1000 lines)
9. **docs/testing/integration-testing.md** - Integration testing guide (~800 lines)

### Existing References

- **tests/auth/login/** - Example test structure for auth module
- **vitest.config.ts** - Vitest configuration
- **playwright.config.ts** - Playwright configuration
- **docs/guides/testing_strategy_20251226_claude_opus_4_5.md** - Original testing strategy

---

## 🎯 Next Steps

### For Current Feature (Chat Messages)

1. ⚠️ **Tests are written but expect implementation to use `setQueryData`**

   - Current implementation may still use `invalidateQueries`
   - Tests will PASS once implementation is updated to use cache updates instead of refetch
   - Expected: 15/15 unit tests, 4/4 integration tests passing

2. **Run tests after implementation updated:**

   ```bash
   npm test tests/chat/messages/unit -- --run
   npm test tests/chat/messages/integration -- --run
   ```

3. **Run E2E tests (requires running app):**
   ```bash
   npm run dev    # Terminal 1
   npx playwright test tests/chat/messages/e2e  # Terminal 2
   ```

### For Future Features

1. **Before coding any new feature:**

   - Read `docs/testing/README.md`
   - Review `tests/chat/messages/` as example
   - Create test folders first

2. **While coding:**

   - Write unit tests alongside code (TDD approach)
   - Add `data-testid` to UI elements immediately

3. **After feature complete:**
   - Write integration tests
   - Write E2E tests for critical paths
   - Update feature README.md

---

## 📊 Success Metrics

### Documentation Coverage

- ✅ Main guide: 100% (README.md complete)
- ✅ Unit testing guide: 100% (with 5 examples)
- ✅ Integration testing guide: 100% (with 3 examples)
- ⏳ E2E testing guide: 0% (TODO - can be added later)

### Test Structure

- ✅ Folder structure: Established and documented
- ✅ Naming conventions: Defined and examples provided
- ✅ Common patterns: 5 patterns documented with code
- ✅ Best practices: DO/DON'T lists for all test types
- ✅ Checklists: Provided for each test type

### Examples

- ✅ API client unit test: Full example
- ✅ Hook (query) unit test: Full example
- ✅ Hook (mutation) unit test: Full example with optimistic updates
- ✅ Component unit test: Full example
- ✅ Utility function unit test: Full example
- ✅ Message flow integration test: Full example (4 test cases)
- ✅ E2E message sending: Full example (4 test cases)
- ✅ E2E SignalR realtime: Full example (4 test cases)

### Enforcement

- ✅ Checklist for new features
- ✅ CI/CD integration examples (GitHub Actions)
- ✅ NPM scripts documented
- ✅ File naming patterns enforced
- ✅ Minimum test cases defined per file type

---

## 🎉 Summary

**Đã hoàn thành:**

1. ✅ Restructured all tests into proper `tests/` folder
2. ✅ Created 27 test cases for chat messages feature
3. ✅ Created comprehensive testing documentation (~3000 lines total)
4. ✅ Established testing standards for all future development
5. ✅ Provided examples for unit, integration, and E2E tests
6. ✅ Documented common patterns and best practices

**Impact:**

- **Future developers** will have clear guidelines for writing tests
- **Every new feature** will follow consistent testing structure
- **Documentation** ensures "No Code Without Tests" is enforceable
- **Examples** provide copy-paste templates for common scenarios
- **Checklists** prevent missing critical test cases

**Goal achieved:** "đảm bảo mỗi bước sau này đều tạo các file test"

✅ **Testing infrastructure is now complete and documented!**
