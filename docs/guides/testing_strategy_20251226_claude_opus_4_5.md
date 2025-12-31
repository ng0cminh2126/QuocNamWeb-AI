# 🧪 Testing Strategy - Quoc Nam Portal

> **Version:** 1.0 - DRAFT  
> **Status:** 🔍 Pending Review  
> **Last updated:** 2025-12-26  
> **Model AI:** Claude Opus 4.5

---

## 📋 Mục Lục

1. [Testing Philosophy](#1-testing-philosophy)
2. [Mandatory Testing Rules](#2-mandatory-testing-rules)
3. [Test-Driven Prompts](#3-test-driven-prompts)
4. [Testing Checklist Template](#4-testing-checklist-template)
5. [Test Coverage Requirements](#5-test-coverage-requirements)
6. [Testing Patterns by Type](#6-testing-patterns-by-type)
7. [CI/CD Integration](#7-cicd-integration)

---

## 1. Testing Philosophy

### 1.1 Nguyên tắc: "No Code Without Tests"

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 RULE: Mọi code mới PHẢI đi kèm với test tương ứng          │
│                                                                 │
│  ❌ KHÔNG ĐƯỢC:                                                 │
│  - Tạo function mới mà không có unit test                      │
│  - Tạo hook mới mà không có test                               │
│  - Tạo component mới mà không có test                          │
│  - Merge code mà test coverage < threshold                      │
│                                                                 │
│  ✅ PHẢI:                                                       │
│  - Viết test TRƯỚC hoặc CÙNG LÚC với code                      │
│  - Test phải cover happy path + error cases                    │
│  - Test phải pass trước khi commit                             │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Test Types & Responsibilities

| Type | Tool | Ai viết? | Khi nào? | Coverage Target |
|------|------|----------|----------|-----------------|
| **Unit Test** | Vitest | AI + Dev | Cùng lúc với code | 80% |
| **Integration Test** | RTL + Vitest | AI + Dev | Sau unit test | 60% |
| **E2E Test** | Playwright | QA Team | Sau feature complete | Critical flows |

---

## 2. Mandatory Testing Rules

### 2.1 Rule Matrix - Loại code nào cần loại test nào?

| Loại Code | Unit Test | Integration Test | E2E Test |
|-----------|:---------:|:----------------:|:--------:|
| **Utils/Helpers** | ✅ BẮT BUỘC | ⬜ Optional | ⬜ N/A |
| **API Clients** | ✅ BẮT BUỘC | ✅ BẮT BUỘC (với MSW) | ⬜ Optional |
| **Query Hooks** | ✅ BẮT BUỘC | ✅ BẮT BUỘC | ⬜ Optional |
| **Mutation Hooks** | ✅ BẮT BUỘC | ✅ BẮT BUỘC | ⬜ Optional |
| **Zustand Stores** | ✅ BẮT BUỘC | ⬜ Optional | ⬜ N/A |
| **UI Components** | ⬜ Optional | ✅ BẮT BUỘC | ⬜ Optional |
| **Form Components** | ⬜ Optional | ✅ BẮT BUỘC | ✅ Recommended |
| **User Flows** | ⬜ N/A | ⬜ Optional | ✅ BẮT BUỘC |

### 2.2 Minimum Test Cases per Type

```typescript
// ============================================
// UTILS/HELPERS: Tối thiểu 3 test cases
// ============================================
describe('formatDate', () => {
  it('should format valid date correctly');           // Happy path
  it('should handle invalid date input');             // Error case
  it('should return fallback for null/undefined');    // Edge case
});

// ============================================
// API CLIENT: Tối thiểu 4 test cases
// ============================================
describe('getMessages', () => {
  it('should return messages on success');            // Happy path
  it('should pass correct params to API');            // Request validation
  it('should handle 401 Unauthorized');               // Auth error
  it('should handle network error');                  // Network error
});

// ============================================
// QUERY HOOK: Tối thiểu 5 test cases
// ============================================
describe('useMessages', () => {
  it('should return loading state initially');        // Loading
  it('should return data on success');                // Success
  it('should return error on failure');               // Error
  it('should use correct query key');                 // Key validation
  it('should refetch when params change');            // Reactivity
});

// ============================================
// MUTATION HOOK: Tối thiểu 5 test cases
// ============================================
describe('useSendMessage', () => {
  it('should call API with correct payload');         // Request
  it('should return success state on success');       // Success
  it('should return error state on failure');         // Error
  it('should invalidate queries on success');         // Side effects
  it('should call onSuccess callback');               // Callbacks
});

// ============================================
// ZUSTAND STORE: Tối thiểu 4 test cases
// ============================================
describe('useAuthStore', () => {
  it('should have correct initial state');            // Initial
  it('should update state with setUser');             // Action
  it('should clear state on logout');                 // Reset
  it('should persist to localStorage');               // Persistence
});

// ============================================
// UI COMPONENT: Tối thiểu 4 test cases
// ============================================
describe('MessageBubble', () => {
  it('should render message content');                // Render
  it('should apply correct styles for own message');  // Conditional render
  it('should call onClick when clicked');             // Events
  it('should be accessible');                         // Accessibility
});
```

---

## 3. Test-Driven Prompts

### 3.1 Prompt Template: Tạo Function + Test

```markdown
## Yêu cầu: Tạo [tên function]

### Mô tả:
[Mô tả function cần làm gì]

### Input/Output:
- Input: [types]
- Output: [types]

### Yêu cầu test coverage:
1. Happy path: [mô tả]
2. Error case: [mô tả]
3. Edge case: [mô tả]

### Output mong đợi:
1. File implementation: `src/[path]/[name].ts`
2. File test: `src/[path]/[name].test.ts`
3. Test phải pass khi chạy `npm test`
```

### 3.2 Prompt Template: Tạo Hook + Test

```markdown
## Yêu cầu: Tạo hook [tên hook]

### Mục đích:
[Mô tả hook dùng để làm gì]

### API Endpoint:
- Method: [GET/POST/...]
- URL: [endpoint]
- Response: [type]

### Yêu cầu test coverage:
1. Loading state test
2. Success state test  
3. Error state test
4. Refetch behavior test
5. Query key validation

### Mock data:
```typescript
const mockResponse = {
  // ...
};
```

### Output mong đợi:
1. Hook file: `src/hooks/queries/[useName].ts`
2. Test file: `src/hooks/queries/__tests__/[useName].test.ts`
3. MSW handler: `src/mocks/handlers/[module].ts` (nếu chưa có)
```

### 3.3 Prompt Template: Tạo Component + Test

```markdown
## Yêu cầu: Tạo component [tên component]

### Props interface:
```typescript
interface [Name]Props {
  // define props
}
```

### Behavior:
- [Mô tả các behavior]

### Yêu cầu test coverage:
1. Render test: Component renders với props cơ bản
2. Conditional render: Test các điều kiện render khác nhau
3. Event handlers: Test các sự kiện (click, change, etc.)
4. Accessibility: Test a11y attributes

### data-testid cần có:
- `[feature]-[element]-[action]`

### Output mong đợi:
1. Component: `src/components/[Name].tsx`
2. Test: `src/components/__tests__/[Name].test.tsx`
```

### 3.4 Master Prompt: Bắt AI luôn tạo test

```markdown
🚨 IMPORTANT: Mọi code bạn tạo PHẢI đi kèm test file tương ứng.

Quy tắc:
1. Nếu tạo `foo.ts` → PHẢI tạo `foo.test.ts` hoặc `__tests__/foo.test.ts`
2. Nếu tạo `useFoo.ts` → PHẢI tạo `__tests__/useFoo.test.ts`
3. Nếu tạo `Foo.tsx` → PHẢI tạo `__tests__/Foo.test.tsx`

Test requirements:
- Minimum 3 test cases cho utils
- Minimum 5 test cases cho hooks
- Minimum 4 test cases cho components

Nếu không tạo test, hãy giải thích lý do và tạo TODO comment.
```

---

## 4. Testing Checklist Template

### 4.1 Checklist cho mỗi PR/Feature

```markdown
## 🧪 Testing Checklist

### Unit Tests
- [ ] Tất cả functions mới có unit test
- [ ] Tất cả hooks mới có unit test
- [ ] Tất cả stores mới có unit test
- [ ] Test coverage ≥ 80%

### Integration Tests  
- [ ] API calls được mock với MSW
- [ ] Component interactions được test
- [ ] Error states được test
- [ ] Loading states được test

### E2E Tests (nếu applicable)
- [ ] Happy path user flow được test
- [ ] Error scenarios được test
- [ ] Critical paths được cover

### Test Quality
- [ ] Tests có descriptive names
- [ ] Tests là independent (không phụ thuộc nhau)
- [ ] Tests không có hardcoded timeouts
- [ ] Tests sử dụng proper assertions

### Accessibility
- [ ] Components có đủ ARIA attributes
- [ ] Keyboard navigation hoạt động
- [ ] Screen reader compatible
```

### 4.2 Checklist trong Implementation Document

Mỗi Implementation Plan document PHẢI có section:

```markdown
## 🧪 Testing Requirements

### Files cần có test:

| File Implementation | File Test | Test Cases | Status |
|---------------------|-----------|------------|--------|
| `src/api/messages.api.ts` | `src/api/__tests__/messages.api.test.ts` | 4 | ⬜ |
| `src/hooks/queries/useMessages.ts` | `src/hooks/queries/__tests__/useMessages.test.ts` | 5 | ⬜ |
| `src/stores/chatStore.ts` | `src/stores/__tests__/chatStore.test.ts` | 4 | ⬜ |

### Minimum test cases per file:
- Utils: 3 cases (happy, error, edge)
- API: 4 cases (success, params, auth error, network error)
- Hooks: 5 cases (loading, success, error, key, refetch)
- Stores: 4 cases (initial, action, reset, persist)
- Components: 4 cases (render, conditional, events, a11y)

### Test Commands:
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- messages.api.test.ts
```
```

---

## 5. Test Coverage Requirements

### 5.1 Coverage Thresholds

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        // Global thresholds
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        // Per-folder thresholds
        'src/utils/**': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
        'src/hooks/**': {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
        'src/api/**': {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
```

### 5.2 Coverage Report trong CI

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Check coverage thresholds
        run: npm run test:coverage -- --coverage.thresholdAutoUpdate=false
      
      - name: Upload coverage report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 6. Testing Patterns by Type

### 6.1 Utils Testing Pattern

```typescript
// src/utils/formatDate.ts
export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('vi-VN');
}

// src/utils/__tests__/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  // Happy path
  it('should format Date object correctly', () => {
    const date = new Date('2025-12-26');
    expect(formatDate(date)).toBe('26/12/2025');
  });

  it('should format ISO string correctly', () => {
    expect(formatDate('2025-12-26T10:00:00Z')).toBe('26/12/2025');
  });

  // Error cases
  it('should return "Invalid date" for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });

  // Edge cases
  it('should return "N/A" for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should return "N/A" for undefined', () => {
    expect(formatDate(undefined as any)).toBe('N/A');
  });
});
```

### 6.2 API Client Testing Pattern

```typescript
// src/api/__tests__/messages.api.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getMessages, sendMessage } from '../messages.api';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getMessages', () => {
  it('should return messages on success', async () => {
    const mockMessages = [
      { id: '1', content: 'Hello' },
      { id: '2', content: 'World' },
    ];

    server.use(
      http.get('/api/groups/:groupId/messages', () => {
        return HttpResponse.json({
          data: mockMessages,
          hasMore: false,
        });
      })
    );

    const result = await getMessages('group-1');
    expect(result.data).toEqual(mockMessages);
    expect(result.hasMore).toBe(false);
  });

  it('should pass query params correctly', async () => {
    let capturedParams: URLSearchParams | null = null;

    server.use(
      http.get('/api/groups/:groupId/messages', ({ request }) => {
        capturedParams = new URL(request.url).searchParams;
        return HttpResponse.json({ data: [], hasMore: false });
      })
    );

    await getMessages('group-1', { workTypeId: 'wt-1', limit: 50 });

    expect(capturedParams?.get('workTypeId')).toBe('wt-1');
    expect(capturedParams?.get('limit')).toBe('50');
  });

  it('should handle 401 Unauthorized', async () => {
    server.use(
      http.get('/api/groups/:groupId/messages', () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    await expect(getMessages('group-1')).rejects.toThrow();
  });

  it('should handle network error', async () => {
    server.use(
      http.get('/api/groups/:groupId/messages', () => {
        return HttpResponse.error();
      })
    );

    await expect(getMessages('group-1')).rejects.toThrow();
  });
});
```

### 6.3 Query Hook Testing Pattern

```typescript
// src/hooks/queries/__tests__/useMessages.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useMessages } from '../useMessages';

const server = setupServer();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useMessages', () => {
  it('should return loading state initially', () => {
    server.use(
      http.get('/api/groups/:groupId/messages', async () => {
        await new Promise(r => setTimeout(r, 100));
        return HttpResponse.json({ data: [], hasMore: false });
      })
    );

    const { result } = renderHook(
      () => useMessages('group-1'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return data on success', async () => {
    const mockData = {
      data: [{ id: '1', content: 'Hello' }],
      hasMore: false,
    };

    server.use(
      http.get('/api/groups/:groupId/messages', () => {
        return HttpResponse.json(mockData);
      })
    );

    const { result } = renderHook(
      () => useMessages('group-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]).toEqual(mockData);
  });

  it('should return error on failure', async () => {
    server.use(
      http.get('/api/groups/:groupId/messages', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useMessages('group-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should use correct query key', () => {
    const { result } = renderHook(
      () => useMessages('group-1', 'wt-1'),
      { wrapper: createWrapper() }
    );

    // Query key should include groupId and workTypeId
    // This is implementation specific - adjust as needed
  });
});
```

### 6.4 Component Testing Pattern

```typescript
// src/components/__tests__/MessageBubble.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from '../MessageBubble';

describe('MessageBubble', () => {
  const defaultProps = {
    id: 'msg-1',
    content: 'Hello, world!',
    sender: { id: 'user-1', name: 'John Doe' },
    timestamp: '2025-12-26T10:00:00Z',
    isMine: false,
  };

  // Render test
  it('should render message content', () => {
    render(<MessageBubble {...defaultProps} />);
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  // Conditional render
  it('should apply correct styles for own message', () => {
    render(<MessageBubble {...defaultProps} isMine={true} />);
    
    const bubble = screen.getByTestId('message-bubble-msg-1');
    expect(bubble).toHaveClass('bg-brand-500');
  });

  it('should apply correct styles for other message', () => {
    render(<MessageBubble {...defaultProps} isMine={false} />);
    
    const bubble = screen.getByTestId('message-bubble-msg-1');
    expect(bubble).toHaveClass('bg-gray-100');
  });

  // Event handlers
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<MessageBubble {...defaultProps} onClick={handleClick} />);
    
    await userEvent.click(screen.getByTestId('message-bubble-msg-1'));
    
    expect(handleClick).toHaveBeenCalledWith('msg-1');
  });

  // Accessibility
  it('should have correct accessibility attributes', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const bubble = screen.getByTestId('message-bubble-msg-1');
    expect(bubble).toHaveAttribute('role', 'article');
    expect(bubble).toHaveAttribute('aria-label', expect.stringContaining('John Doe'));
  });

  // data-testid
  it('should have correct data-testid', () => {
    render(<MessageBubble {...defaultProps} />);
    
    expect(screen.getByTestId('message-bubble-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-content-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-timestamp-msg-1')).toBeInTheDocument();
  });
});
```

---

## 7. CI/CD Integration

### 7.1 Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests for staged files
npm run test:staged

# Check coverage thresholds
npm run test:coverage -- --silent
```

### 7.2 package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:staged": "vitest related --run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

### 7.3 Required Checks for PR

```yaml
# Branch protection rules (GitHub):
- Required status checks:
  - test (unit + integration)
  - test-e2e (critical flows only)
  - coverage-check (must pass thresholds)
```

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:
- `vitest.config.ts` - Vitest configuration với coverage thresholds
- `src/mocks/handlers/` - MSW handlers for API mocking
- `src/test-utils/` - Testing utilities và wrappers
- `.github/workflows/test.yml` - CI workflow

### Files sẽ sửa đổi:
- `package.json` - Thêm test scripts và devDependencies

### Dependencies sẽ thêm:
```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitest/coverage-v8": "^3.0.0",
    "msw": "^2.7.0",
    "@playwright/test": "^1.50.0",
    "happy-dom": "^15.0.0"
  }
}
```

---

## ⏳ PENDING DECISIONS

| # | Vấn đề | Lựa chọn | HUMAN Decision |
|---|--------|----------|----------------|
| 1 | Global coverage threshold | 70% hoặc 80%? | ⬜ _______ |
| 2 | Utils coverage threshold | 85% hoặc 90%? | ⬜ _______ |
| 3 | Block PR nếu coverage giảm? | Yes / No | ⬜ _______ |
| 4 | Run E2E on every PR? | Yes / Only critical | ⬜ _______ |
| 5 | Use Husky pre-commit hook? | Yes / No | ⬜ _______ |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục | Status |
|----------|--------|
| Đã review Testing Strategy | ⬜ Chưa / ✅ Đã review |
| Đã điền Pending Decisions | ⬜ Chưa / ✅ Đã điền |
| **APPROVED để thực thi** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** _________________  
**Date:** _________________

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC setup testing infrastructure nếu chưa APPROVED**

---

**© 2025 - Quoc Nam Portal Team**
