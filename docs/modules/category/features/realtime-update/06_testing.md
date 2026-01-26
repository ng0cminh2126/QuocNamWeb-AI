# [BƯỚC 6] Testing Plan - Category List Real-time Update

**Feature:** Category List Real-time Update  
**Version:** 1.0  
**Date:** 2026-01-23  
**Status:** ✅ APPROVED

---

## OVERVIEW

Test plan cho real-time category updates với coverage:

- Unit tests (hooks, utilities)
- Integration tests (components)
- E2E tests (user flows)
- Manual testing checklist

---

## 1. TEST COVERAGE MATRIX

| File                                              | Test File                             | Test Type   | Min Cases |
| ------------------------------------------------- | ------------------------------------- | ----------- | --------- |
| `src/types/categories.ts`                         | N/A                                   | Type check  | 0         |
| `src/hooks/queries/useCategories.ts`              | `useCategories.test.ts`               | Unit        | 3         |
| `src/hooks/useCategoriesRealtime.ts`              | `useCategoriesRealtime.test.ts`       | Unit        | 6         |
| `src/features/portal/components/CategoryCard.tsx` | `CategoryCard.test.tsx`               | Integration | 5         |
| E2E Flow                                          | `tests/e2e/category-realtime.spec.ts` | E2E         | 4         |

**Total:** ~18 test cases

---

## 2. UNIT TESTS

### File: `src/hooks/queries/__tests__/useCategories.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories } from '../useCategories';
import * as categoriesApi from '@/api/categories.api';

// Mock API
vi.mock('@/api/categories.api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCategories', () => {
  it('should transform categories and add unreadCount = 0', async () => {
    // Arrange
    const mockResponse = [
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          {
            conversationId: 'conv-1',
            conversationName: 'Backend',
            memberCount: 5,
            lastMessage: {
              messageId: 'msg-1',
              senderId: 'user-1',
              senderName: 'John',
              content: 'Hello',
              sentAt: '2026-01-23T10:00:00Z',
            },
          },
        ],
      },
    ];

    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockResponse);

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          {
            conversationId: 'conv-1',
            conversationName: 'Backend',
            memberCount: 5,
            lastMessage: {
              messageId: 'msg-1',
              senderId: 'user-1',
              senderName: 'John',
              content: 'Hello',
              sentAt: '2026-01-23T10:00:00Z',
            },
            unreadCount: 0,  // ✅ Added
          },
        ],
      },
    ]);
  });

  it('should handle empty conversations', async () => {
    // Arrange
    const mockResponse = [
      { id: 'cat-1', name: 'Empty', conversations: [] },
    ];
    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockResponse);

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].conversations).toEqual([]);
  });

  it('should handle null lastMessage', async () => {
    // Arrange
    const mockResponse = [
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          {
            conversationId: 'conv-1',
            conversationName: 'Backend',
            memberCount: 3,
            lastMessage: null,  // No messages yet
          },
        ],
      },
    ];
    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockResponse);

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].conversations[0]).toEqual({
      conversationId: 'conv-1',
      conversationName: 'Backend',
      memberCount: 3,
      lastMessage: null,
      unreadCount: 0,
    });
  });
});
```

---

### File: `src/hooks/__tests__/useCategoriesRealtime.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategoriesRealtime } from '../useCategoriesRealtime';
import { chatHub } from '@/lib/signalr';
import { useAuthStore } from '@/stores/authStore';

// Mock dependencies
vi.mock('@/lib/signalr', () => ({
  chatHub: {
    joinConversation: vi.fn(),
    leaveConversation: vi.fn(),
    onMessageSent: vi.fn(),
    onMessageRead: vi.fn(),
  },
}));

vi.mock('@/stores/authStore');

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCategoriesRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: 'user-1' } } as any);
  });

  it('should join all conversations on mount', () => {
    // Arrange
    const categories = [
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          { conversationId: 'conv-1', conversationName: 'A', memberCount: 5, lastMessage: null, unreadCount: 0 },
          { conversationId: 'conv-2', conversationName: 'B', memberCount: 3, lastMessage: null, unreadCount: 0 },
        ],
      },
    ];

    // Act
    renderHook(() => useCategoriesRealtime(categories), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(chatHub.joinConversation).toHaveBeenCalledWith('conv-1');
    expect(chatHub.joinConversation).toHaveBeenCalledWith('conv-2');
    expect(chatHub.joinConversation).toHaveBeenCalledTimes(2);
  });

  it('should leave conversations on unmount', () => {
    // Arrange
    const categories = [
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          { conversationId: 'conv-1', conversationName: 'A', memberCount: 5, lastMessage: null, unreadCount: 0 },
        ],
      },
    ];

    // Act
    const { unmount } = renderHook(() => useCategoriesRealtime(categories), {
      wrapper: createWrapper(),
    });

    unmount();

    // Assert
    expect(chatHub.leaveConversation).toHaveBeenCalledWith('conv-1');
  });

  it('should register MessageSent listener', () => {
    // Arrange
    const categories = [
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          { conversationId: 'conv-1', conversationName: 'A', memberCount: 5, lastMessage: null, unreadCount: 0 },
        ],
      },
    ];

    // Act
    renderHook(() => useCategoriesRealtime(categories), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(chatHub.onMessageSent).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should register MessageRead listener', () => {
    // Arrange
    const categories = [
      {
        id: 'cat-1',
        name: 'Team',
        conversations: [
          { conversationId: 'conv-1', conversationName: 'A', memberCount: 5, lastMessage: null, unreadCount: 0 },
        ],
      },
    ];

    // Act
    renderHook(() => useCategoriesRealtime(categories), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(chatHub.onMessageRead).toHaveBeenCalledWith(expect.any(Function));
  });

  // TODO: Test cache update logic (requires more complex setup)
  // - MessageSent updates lastMessage
  // - MessageSent increments unreadCount
  // - MessageSent does NOT increment for own messages
  // - MessageRead resets unreadCount
});
```

---

## 3. INTEGRATION TESTS

### File: `src/features/portal/components/__tests__/CategoryCard.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryCard from '../CategoryCard';
import type { CategoryWithUnread } from '@/types/categories';

describe('CategoryCard', () => {
  it('should render category name', () => {
    // Arrange
    const category: CategoryWithUnread = {
      id: 'cat-1',
      name: 'Team Development',
      conversations: [],
    };

    // Act
    render(<CategoryCard category={category} />);

    // Assert
    expect(screen.getByText('Team Development')).toBeInTheDocument();
  });

  it('should display last message from latest conversation', () => {
    // Arrange
    const category: CategoryWithUnread = {
      id: 'cat-1',
      name: 'Team',
      conversations: [
        {
          conversationId: 'conv-1',
          conversationName: 'Backend',
          memberCount: 5,
          lastMessage: {
            messageId: 'msg-1',
            senderId: 'user-1',
            senderName: 'John',
            content: 'Old message',
            sentAt: '2026-01-23T09:00:00Z',
          },
          unreadCount: 0,
        },
        {
          conversationId: 'conv-2',
          conversationName: 'Frontend',
          memberCount: 3,
          lastMessage: {
            messageId: 'msg-2',
            senderId: 'user-2',
            senderName: 'Jane',
            content: 'Latest message',
            sentAt: '2026-01-23T10:00:00Z',
          },
          unreadCount: 0,
        },
      ],
    };

    // Act
    render(<CategoryCard category={category} />);

    // Assert
    expect(screen.getByText(/Frontend:/)).toBeInTheDocument();
    expect(screen.getByText(/Latest message/)).toBeInTheDocument();
  });

  it('should display unread badge when totalUnread > 0', () => {
    // Arrange
    const category: CategoryWithUnread = {
      id: 'cat-1',
      name: 'Team',
      conversations: [
        {
          conversationId: 'conv-1',
          conversationName: 'Backend',
          memberCount: 5,
          lastMessage: null,
          unreadCount: 3,
        },
        {
          conversationId: 'conv-2',
          conversationName: 'Frontend',
          memberCount: 3,
          lastMessage: null,
          unreadCount: 5,
        },
      ],
    };

    // Act
    render(<CategoryCard category={category} />);

    // Assert
    const badge = screen.getByText('8');  // 3 + 5
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-rose-500');
  });

  it('should display 99+ when totalUnread > 99', () => {
    // Arrange
    const category: CategoryWithUnread = {
      id: 'cat-1',
      name: 'Team',
      conversations: [
        {
          conversationId: 'conv-1',
          conversationName: 'Backend',
          memberCount: 5,
          lastMessage: null,
          unreadCount: 100,
        },
      ],
    };

    // Act
    render(<CategoryCard category={category} />);

    // Assert
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should display empty state when no messages', () => {
    // Arrange
    const category: CategoryWithUnread = {
      id: 'cat-1',
      name: 'Team',
      conversations: [
        {
          conversationId: 'conv-1',
          conversationName: 'Backend',
          memberCount: 5,
          lastMessage: null,
          unreadCount: 0,
        },
      ],
    };

    // Act
    render(<CategoryCard category={category} />);

    // Assert
    expect(screen.getByText('Chưa có tin nhắn')).toBeInTheDocument();
  });
});
```

---

## 4. E2E TESTS

### File: `tests/e2e/category-realtime.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Category List Real-time Updates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="category-list"]');
  });

  test("should display categories with last messages", async ({ page }) => {
    // Wait for categories to load
    const categoryCard = page.locator('[data-testid="category-card"]').first();
    await expect(categoryCard).toBeVisible();

    // Check category name
    await expect(categoryCard.locator("h3")).toContainText("Team");

    // Check last message preview (if exists)
    const lastMessage = categoryCard.locator(
      '[data-testid="last-message-preview"]',
    );
    if (await lastMessage.isVisible()) {
      await expect(lastMessage).toContainText(":"); // Format: "ConvName: Content"
    }
  });

  test("should show unread badge when unread > 0", async ({ page }) => {
    // Simulate: User 2 sends message (trigger via backend/mock)
    // This test requires SignalR event simulation or backend setup

    // Check badge appears
    const badge = page.locator('[data-testid="category-unread-badge"]').first();
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/\d+/); // Numeric badge
  });

  test("should update last message in real-time", async ({ page }) => {
    // Get initial last message
    const lastMessage = page
      .locator('[data-testid="last-message-preview"]')
      .first();
    const initialText = await lastMessage.textContent();

    // Simulate: Send new message via API/SignalR
    // await sendTestMessage('conv-1', 'New test message');

    // Check last message updates (without reload)
    await expect(lastMessage).not.toContainText(initialText!);
    await expect(lastMessage).toContainText("New test message");
  });

  test("should hide badge when messages read", async ({ page }) => {
    // Assume initial unread > 0
    const badge = page.locator('[data-testid="category-unread-badge"]').first();
    await expect(badge).toBeVisible();

    // Click category to open (triggers MessageRead)
    await page.locator('[data-testid="category-card"]').first().click();

    // Badge should disappear
    await expect(badge).not.toBeVisible({ timeout: 2000 });
  });
});
```

---

## 5. MANUAL TESTING CHECKLIST

### Setup:

- [ ] Run dev server: `npm run dev`
- [ ] Open app in browser
- [ ] Login with test account
- [ ] Open DevTools Console (check SignalR logs)

### Test Cases:

#### TC1: Initial Load

**Steps:**

1. Navigate to workspace
2. Observe category list

**Expected:**

- [ ] Categories load successfully
- [ ] Last messages hiển thị (nếu có)
- [ ] Unread badges = 0 hoặc không hiển thị (initial load)
- [ ] No console errors

---

#### TC2: Receive Message from Another User

**Steps:**

1. Open app với User A
2. Gửi message từ User B trong conversation thuộc category X
3. Observe category X trong User A's screen

**Expected:**

- [ ] Last message update trong < 1 giây
- [ ] Content match với message vừa gửi
- [ ] Unread badge tăng +1
- [ ] Badge animation smooth
- [ ] No page reload

**Console Check:**

```
SignalR: MessageSent event received
Cache updated: category X
```

---

#### TC3: Send Message as Current User

**Steps:**

1. Gửi message trong conversation thuộc category Y
2. Observe category Y

**Expected:**

- [ ] Last message update
- [ ] Unread badge KHÔNG tăng (vì own message)
- [ ] Badge vẫn giữ nguyên giá trị cũ

---

#### TC4: Mark as Read

**Steps:**

1. Category có unread > 0
2. Click vào category (hoặc conversation)
3. Observe badge

**Expected:**

- [ ] Badge biến mất ngay lập tức
- [ ] Fade-out animation smooth
- [ ] MessageRead event triggered (check console)

**Console Check:**

```
SignalR: MessageRead event received
Cache updated: unreadCount = 0
```

---

#### TC5: Multiple Messages Rapid Fire

**Steps:**

1. Gửi 5 messages liên tiếp (< 1 giây apart)
2. Observe UI

**Expected:**

- [ ] Last message = message cuối cùng
- [ ] Unread count = 5 (hoặc +5 từ giá trị cũ)
- [ ] UI không bị lag/flicker

---

#### TC6: SignalR Reconnection

**Steps:**

1. Open app
2. Disconnect internet 5 giây
3. Reconnect internet
4. Gửi message từ user khác

**Expected:**

- [ ] SignalR auto-reconnect
- [ ] Re-join conversations
- [ ] Message event received normally
- [ ] UI updates correctly

**Console Check:**

```
SignalR: Reconnecting...
SignalR: Reconnected
Re-joining conversations: [conv-1, conv-2, ...]
```

---

#### TC7: Edge Case - No Messages

**Steps:**

1. View category không có conversation nào có lastMessage
2. Observe UI

**Expected:**

- [ ] Display "Chưa có tin nhắn"
- [ ] No badge hiển thị
- [ ] No errors

---

#### TC8: Edge Case - 99+ Unread

**Steps:**

1. Simulate category với unread > 99
2. Observe badge

**Expected:**

- [ ] Badge hiển thị "99+"
- [ ] Badge không overflow container

---

## 6. PERFORMANCE TESTING

### Load Test:

**Scenario:** 50 categories, 200 conversations total

**Steps:**

1. Load page
2. Measure:
   - Initial load time
   - Time to join all conversations
   - Memory usage

**Expected:**

- [ ] Load < 3 seconds
- [ ] Join complete < 5 seconds
- [ ] Memory < 100MB increase

---

### Real-time Update Performance:

**Scenario:** Nhận 10 MessageSent events trong 1 giây

**Steps:**

1. Trigger rapid events
2. Observe UI

**Expected:**

- [ ] No UI lag
- [ ] All messages processed
- [ ] No dropped events

---

## 7. BROWSER COMPATIBILITY

Test trên:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest) - nếu có Mac

---

## 8. ACCESSIBILITY TESTING

- [ ] Badge có sufficient color contrast (WCAG AA)
- [ ] Screen reader đọc được unread count
- [ ] Keyboard navigation works (Tab, Enter)

---

## 9. ERROR HANDLING TESTING

### TC: SignalR Connection Failed

**Steps:**

1. Block SignalR hub URL (hosts file hoặc firewall)
2. Load app

**Expected:**

- [ ] App vẫn load (không crash)
- [ ] Fallback to polling (nếu có) hoặc manual refresh
- [ ] Error message hiển thị (nếu có)

---

### TC: Cache Update Failed

**Steps:**

1. Inject error vào queryClient.setQueryData
2. Trigger MessageSent

**Expected:**

- [ ] Error logged to console
- [ ] UI vẫn stable (không crash)
- [ ] Background refetch triggered

---

## 10. REGRESSION TESTING

**Ensure không break existing features:**

- [ ] Category list vẫn render đúng
- [ ] Click category vẫn navigate
- [ ] Conversation list vẫn hoạt động
- [ ] Chat messages vẫn send/receive bình thường

---

## TEST DATA

### Mock Categories:

```json
[
  {
    "id": "cat-1",
    "name": "Team Development",
    "conversations": [
      {
        "conversationId": "conv-1",
        "conversationName": "Backend Team",
        "memberCount": 5,
        "lastMessage": {
          "messageId": "msg-1",
          "senderId": "user-2",
          "senderName": "John Doe",
          "content": "Sprint planning today at 3pm",
          "sentAt": "2026-01-23T10:30:00Z"
        }
      }
    ]
  },
  {
    "id": "cat-2",
    "name": "Marketing",
    "conversations": []
  }
]
```

### Mock SignalR Events:

```typescript
// MessageSent
{
  message: {
    id: 'msg-new',
    conversationId: 'conv-1',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    content: 'Test message for real-time',
    sentAt: new Date().toISOString(),
  }
}

// MessageRead
{
  conversationId: 'conv-1',
  userId: 'user-1',
}
```

---

## SUCCESS CRITERIA

### Unit Tests:

- [ ] All tests pass
- [ ] Coverage > 80% for hooks

### Integration Tests:

- [ ] Component tests pass
- [ ] No visual regressions

### E2E Tests:

- [ ] All user flows pass
- [ ] No console errors

### Manual Tests:

- [ ] All TCs pass
- [ ] No critical bugs

---

## ✅ APPROVAL

| Item                | Status |
| ------------------- | ------ |
| Đã review test plan | ⬜     |
| Test coverage đủ    | ⬜     |
| **APPROVED**        | ⬜     |

**Signature:** **\*\***\_**\*\***  
**Date:** **\*\***\_**\*\***

> AI được code tests sau khi implementation xong
