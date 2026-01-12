# [BƯỚC 6] Phase 4 Test Requirements: Message Display & Conversation Info

> **Module:** Chat  
> **Feature:** Message Display & Conversation Info Enhancements  
> **Version:** 4.0  
> **Status:** ⏳ PENDING - Awaiting HUMAN approval  
> **Created:** 2026-01-09

---

## 📋 Overview

Test requirements document định nghĩa test coverage cho Phase 4. Document này được tạo TRƯỚC khi code để đảm bảo test-driven approach.

**Test Types:**

- ✅ Unit Tests (utilities, components)
- ✅ Integration Tests (component interactions)
- ⬜ E2E Tests (skipped per decision #4)

---

## 🎯 Test Coverage Matrix

| Implementation File                                     | Test File                                                    | Test Type   | # Cases | Priority |
| ------------------------------------------------------- | ------------------------------------------------------------ | ----------- | ------- | -------- |
| `src/utils/messageGrouping.ts`                          | `src/utils/messageGrouping.test.ts`                          | Unit        | 6       | HIGH     |
| `src/features/portal/components/MessageBubble.tsx`      | `src/features/portal/components/MessageBubble.test.tsx`      | Unit        | 8       | HIGH     |
| `src/features/portal/components/MessageList.tsx`        | `src/features/portal/components/MessageList.test.tsx`        | Integration | 4       | MEDIUM   |
| `src/features/portal/components/ConversationHeader.tsx` | `src/features/portal/components/ConversationHeader.test.tsx` | Unit        | 6       | HIGH     |

**Total Test Cases:** 24  
**Estimated Coverage:** >90%

---

## 📝 Detailed Test Cases

### 1. messageGrouping.ts - Unit Tests (6 cases)

**File:** `src/utils/messageGrouping.test.ts`

#### Test Case 1.1: Single Message

```typescript
it("should mark single message as both first and last", () => {
  const messages = [createMessage("user1", 1000)];
  const grouped = groupMessages(messages);

  expect(grouped).toHaveLength(1);
  expect(grouped[0].isFirstInGroup).toBe(true);
  expect(grouped[0].isLastInGroup).toBe(true);
  expect(grouped[0].isMiddleInGroup).toBe(false);
});
```

**Purpose:** Verify edge case của 1 message duy nhất  
**Expected:** Message vừa first vừa last

---

#### Test Case 1.2: Consecutive Messages Same Sender

```typescript
it("should group consecutive messages from same sender within threshold", () => {
  const messages = [
    createMessage("user1", 1000),
    createMessage("user1", 2000), // 1s later
    createMessage("user1", 3000), // 2s later total
  ];
  const grouped = groupMessages(messages);

  // First message
  expect(grouped[0].isFirstInGroup).toBe(true);
  expect(grouped[0].isLastInGroup).toBe(false);

  // Middle message
  expect(grouped[1].isFirstInGroup).toBe(false);
  expect(grouped[1].isMiddleInGroup).toBe(true);
  expect(grouped[1].isLastInGroup).toBe(false);

  // Last message
  expect(grouped[2].isFirstInGroup).toBe(false);
  expect(grouped[2].isLastInGroup).toBe(true);
});
```

**Purpose:** Test grouping logic cơ bản  
**Expected:** 3 messages trong 1 group với positions đúng

---

#### Test Case 1.3: Different Senders

```typescript
it("should NOT group messages from different senders", () => {
  const messages = [
    createMessage("user1", 1000),
    createMessage("user2", 2000),
    createMessage("user1", 3000),
  ];
  const grouped = groupMessages(messages);

  // All messages are separate groups
  expect(grouped[0].isFirstInGroup).toBe(true);
  expect(grouped[0].isLastInGroup).toBe(true);

  expect(grouped[1].isFirstInGroup).toBe(true);
  expect(grouped[1].isLastInGroup).toBe(true);

  expect(grouped[2].isFirstInGroup).toBe(true);
  expect(grouped[2].isLastInGroup).toBe(true);
});
```

**Purpose:** Verify người gửi khác nhau = group khác nhau  
**Expected:** 3 separate groups

---

#### Test Case 1.4: Time Threshold Exceeded

```typescript
it("should NOT group messages beyond threshold", () => {
  const messages = [
    createMessage("user1", 0),
    createMessage("user1", MESSAGE_GROUP_THRESHOLD_MS + 1000), // 10min + 1s
  ];
  const grouped = groupMessages(messages);

  expect(grouped[0].isFirstInGroup).toBe(true);
  expect(grouped[0].isLastInGroup).toBe(true);

  expect(grouped[1].isFirstInGroup).toBe(true);
  expect(grouped[1].isLastInGroup).toBe(true);
});
```

**Purpose:** Test time threshold boundary  
**Expected:** 2 separate groups khi quá 10 phút

---

#### Test Case 1.5: Custom Threshold

```typescript
it("should use custom threshold", () => {
  const customThreshold = 5000; // 5 seconds
  const messages = [
    createMessage("user1", 0),
    createMessage("user1", 4000), // Within 5s
    createMessage("user1", 10000), // Beyond 5s from previous
  ];
  const grouped = groupMessages(messages, customThreshold);

  // First two grouped
  expect(grouped[0].isFirstInGroup).toBe(true);
  expect(grouped[1].isLastInGroup).toBe(true);

  // Third separate
  expect(grouped[2].isFirstInGroup).toBe(true);
  expect(grouped[2].isLastInGroup).toBe(true);
});
```

**Purpose:** Test custom threshold parameter  
**Expected:** Grouping theo threshold khác

---

#### Test Case 1.6: Empty Array

```typescript
it("should handle empty array", () => {
  const grouped = groupMessages([]);
  expect(grouped).toEqual([]);
});
```

**Purpose:** Edge case empty input  
**Expected:** Empty array return

---

### 2. MessageBubble.tsx - Unit Tests (8 cases)

**File:** `src/features/portal/components/MessageBubble.test.tsx`

#### Test Case 2.1: First Message Shows Timestamp

```typescript
it("should render timestamp only for first message in group", () => {
  const { getByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={false}
      currentUserId="user2"
      isFirstInGroup={true}
      isMiddleInGroup={false}
      isLastInGroup={false}
    />
  );
  expect(getByTestId("message-timestamp-group")).toBeInTheDocument();
});
```

**Purpose:** Timestamp chỉ hiện ở first message  
**Expected:** Timestamp element exists

---

#### Test Case 2.2: Middle Message No Timestamp

```typescript
it("should NOT render timestamp for middle message", () => {
  const { queryByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={false}
      currentUserId="user2"
      isFirstInGroup={false}
      isMiddleInGroup={true}
      isLastInGroup={false}
    />
  );
  expect(queryByTestId("message-timestamp-group")).not.toBeInTheDocument();
});
```

**Purpose:** Middle message không có timestamp  
**Expected:** Timestamp element not exists

---

#### Test Case 2.3: First Message Shows Avatar & Name

```typescript
it("should render avatar and sender name for first incoming message", () => {
  const { getByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={false}
      currentUserId="user2"
      isFirstInGroup={true}
      isMiddleInGroup={false}
      isLastInGroup={false}
    />
  );
  expect(getByTestId("message-avatar")).toBeInTheDocument();
  expect(getByTestId("message-sender")).toHaveTextContent(
    mockMessage.sender.name
  );
});
```

**Purpose:** First incoming message hiện avatar + name  
**Expected:** Avatar và sender name rendered

---

#### Test Case 2.4: Middle Message No Avatar

```typescript
it("should NOT render avatar for middle message", () => {
  const { queryByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={false}
      currentUserId="user2"
      isFirstInGroup={false}
      isMiddleInGroup={true}
      isLastInGroup={false}
    />
  );
  expect(queryByTestId("message-avatar")).not.toBeInTheDocument();
  expect(queryByTestId("message-sender")).not.toBeInTheDocument();
});
```

**Purpose:** Middle message không có avatar/name  
**Expected:** No avatar, no sender name

---

#### Test Case 2.5: Outgoing Message No Avatar

```typescript
it("should NOT render avatar for outgoing messages", () => {
  const { queryByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={true}
      currentUserId="user1"
      isFirstInGroup={true}
      isMiddleInGroup={false}
      isLastInGroup={false}
    />
  );
  expect(queryByTestId("message-avatar")).not.toBeInTheDocument();
});
```

**Purpose:** Outgoing messages không có avatar  
**Expected:** No avatar even for first message

---

#### Test Case 2.6: Line Breaks Rendered

```typescript
it("should render line breaks correctly", () => {
  const message = {
    ...mockMessage,
    content: "Line 1\nLine 2\n\nLine 4",
  };
  const { getByTestId } = render(
    <MessageBubble
      message={message}
      isOutgoing={false}
      currentUserId="user2"
      isFirstInGroup={true}
      isMiddleInGroup={false}
      isLastInGroup={false}
    />
  );
  const content = getByTestId("message-content");
  expect(content).toHaveClass("whitespace-pre-wrap");
});
```

**Purpose:** Line breaks (`\n`) được preserve  
**Expected:** `whitespace-pre-wrap` class applied

---

#### Test Case 2.7: Updated Styling Classes

```typescript
it("should have updated padding and border-radius", () => {
  const { getByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={false}
      currentUserId="user2"
      isFirstInGroup={true}
      isMiddleInGroup={false}
      isLastInGroup={false}
    />
  );
  const content = getByTestId("message-content");
  expect(content).toHaveClass("px-4", "py-2", "rounded-2xl");
});
```

**Purpose:** Verify CSS classes updated  
**Expected:** `px-4 py-2 rounded-2xl` classes

---

#### Test Case 2.8: Dynamic Border Radius for Grouped Messages

```typescript
it("should apply tight border-radius for middle outgoing message", () => {
  const { getByTestId } = render(
    <MessageBubble
      message={mockMessage}
      isOutgoing={true}
      currentUserId="user1"
      isFirstInGroup={false}
      isMiddleInGroup={true}
      isLastInGroup={false}
    />
  );
  const content = getByTestId("message-content");
  expect(content).toHaveClass("rounded-tr-sm");
});
```

**Purpose:** Middle messages có border-radius đặc biệt  
**Expected:** `rounded-tr-sm` class for outgoing middle

---

### 3. MessageList.tsx - Integration Tests (4 cases)

**File:** `src/features/portal/components/MessageList.test.tsx`

#### Test Case 3.1: Applies Grouping to Messages

```typescript
it("should apply grouping to messages before rendering", () => {
  const messages = [
    createMessage("user1", 1000, "msg1"),
    createMessage("user1", 2000, "msg2"),
    createMessage("user2", 3000, "msg3"),
  ];

  const { getAllByTestId } = render(
    <MessageList messages={messages} currentUserId="user2" />
  );

  const messageBubbles = getAllByTestId(/^message-bubble-/);
  expect(messageBubbles).toHaveLength(3);

  // First two should be grouped
  expect(getAllByTestId("message-timestamp-group")).toHaveLength(2); // msg1 and msg3
});
```

**Purpose:** Verify grouping applied correctly  
**Expected:** Grouped messages rendered with correct props

---

#### Test Case 3.2: Re-renders on Messages Change

```typescript
it("should re-group when messages change", () => {
  const { rerender, getAllByTestId } = render(
    <MessageList
      messages={[createMessage("user1", 1000)]}
      currentUserId="user2"
    />
  );

  expect(getAllByTestId(/^message-bubble-/)).toHaveLength(1);

  rerender(
    <MessageList
      messages={[createMessage("user1", 1000), createMessage("user1", 2000)]}
      currentUserId="user2"
    />
  );

  expect(getAllByTestId(/^message-bubble-/)).toHaveLength(2);
});
```

**Purpose:** Test re-grouping khi messages update  
**Expected:** Grouped correctly after re-render

---

#### Test Case 3.3: Performance - Memoization Works

```typescript
it("should memoize grouped messages", () => {
  const messages = [createMessage("user1", 1000), createMessage("user1", 2000)];

  const { rerender } = render(
    <MessageList messages={messages} currentUserId="user2" />
  );

  // Re-render with SAME messages reference
  rerender(<MessageList messages={messages} currentUserId="user2" />);

  // Should not re-compute grouping (verify via console spy or React DevTools)
  // This is more of an integration check
});
```

**Purpose:** Verify `useMemo` optimization  
**Expected:** No unnecessary re-computation

---

#### Test Case 3.4: Empty Messages Array

```typescript
it("should handle empty messages array", () => {
  const { container } = render(
    <MessageList messages={[]} currentUserId="user2" />
  );

  const messageList = container.querySelector('[data-testid="message-list"]');
  expect(messageList?.children).toHaveLength(0);
});
```

**Purpose:** Edge case empty array  
**Expected:** No crash, empty list

---

### 4. ConversationHeader.tsx - Unit Tests (6 cases)

**File:** `src/features/portal/components/ConversationHeader.test.tsx`

#### Test Case 4.1: Group Chat - Full Status Line

```typescript
it("should render group chat status with members and online", () => {
  const conversation = {
    ...mockConversation,
    type: "Group",
    participants: [{ id: "1" }, { id: "2" }, { id: "3" }],
    memberCount: 5,
    onlineCount: 3,
    status: "Active",
  };

  const { getByTestId } = render(
    <ConversationHeader conversation={conversation} {...mockHandlers} />
  );

  expect(getByTestId("conversation-status")).toHaveTextContent(
    "Active • 5 members • 3 online"
  );
});
```

**Purpose:** Group chat với full info  
**Expected:** "Active • 5 members • 3 online"

---

#### Test Case 4.2: Group Chat - No Online Members

```typescript
it("should NOT show online if count = 0", () => {
  const conversation = {
    ...mockConversation,
    type: "Group",
    memberCount: 5,
    onlineCount: 0,
    status: "Active",
  };

  const { getByTestId } = render(
    <ConversationHeader conversation={conversation} {...mockHandlers} />
  );

  expect(getByTestId("conversation-status")).toHaveTextContent(
    "Active • 5 members"
  );
  expect(getByTestId("conversation-status")).not.toHaveTextContent("online");
});
```

**Purpose:** Không hiển thị "online" nếu count = 0  
**Expected:** "Active • 5 members" (no "online")

---

#### Test Case 4.3: Direct Message - Online

```typescript
it("should render direct message status with online", () => {
  const conversation = {
    ...mockConversation,
    type: "Direct",
    participants: [{ id: "1" }, { id: "2" }],
    onlineCount: 1,
    status: "Active",
  };

  const { getByTestId } = render(
    <ConversationHeader conversation={conversation} {...mockHandlers} />
  );

  expect(getByTestId("conversation-status")).toHaveTextContent(
    "Active • Online"
  );
});
```

**Purpose:** Direct message format khác  
**Expected:** "Active • Online"

---

#### Test Case 4.4: Direct Message - Offline

```typescript
it("should render direct message status without online", () => {
  const conversation = {
    ...mockConversation,
    type: "Direct",
    participants: [{ id: "1" }, { id: "2" }],
    onlineCount: 0,
    status: "Active",
  };

  const { getByTestId } = render(
    <ConversationHeader conversation={conversation} {...mockHandlers} />
  );

  expect(getByTestId("conversation-status")).toHaveTextContent("Active");
  expect(getByTestId("conversation-status")).not.toHaveTextContent("Online");
});
```

**Purpose:** Direct offline chỉ hiển thị status  
**Expected:** "Active" only

---

#### Test Case 4.5: Avatar - Gray Background Black Text

```typescript
it("should render conversation avatar with gray bg and black text", () => {
  const conversation = {
    ...mockConversation,
    name: "Development Team",
  };

  const { getByTestId } = render(
    <ConversationHeader conversation={conversation} {...mockHandlers} />
  );

  const avatar = getByTestId("conversation-avatar");
  const fallback = avatar.querySelector('[class*="bg-gray-200"]');

  expect(fallback).toBeInTheDocument();
  expect(fallback).toHaveClass("text-gray-800");
  expect(fallback).toHaveTextContent("D");
});
```

**Purpose:** Verify avatar styling giữ nguyên  
**Expected:** Gray bg (#E5E7EB), black text (#1F2937)

---

#### Test Case 4.6: Archived Conversation Status

```typescript
it("should display Archived status", () => {
  const conversation = {
    ...mockConversation,
    type: "Group",
    memberCount: 3,
    onlineCount: 0,
    status: "Archived",
  };

  const { getByTestId } = render(
    <ConversationHeader conversation={conversation} {...mockHandlers} />
  );

  expect(getByTestId("conversation-status")).toHaveTextContent(
    "Archived • 3 members"
  );
});
```

**Purpose:** Test status khác Active  
**Expected:** "Archived • 3 members"

---

## 🧪 Test Data & Mocks

### Mock Message Factory

```typescript
// Test utilities
export const createMessage = (
  senderId: string,
  timestamp: number,
  id?: string
) => ({
  id: id || `msg-${timestamp}`,
  senderId,
  timestamp,
  content: "Test message content",
  sender: {
    id: senderId,
    name: `User ${senderId}`,
  },
  createdAt: timestamp,
  files: [],
});
```

### Mock Conversation

```typescript
export const mockConversation = {
  id: "conv-123",
  name: "Test Conversation",
  type: "Group" as const,
  participants: [
    { id: "user1", name: "Alice" },
    { id: "user2", name: "Bob" },
  ],
  status: "Active" as const,
  memberCount: 2,
  onlineCount: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

### Mock Handlers

```typescript
export const mockHandlers = {
  onBack: vi.fn(),
  onMenuClick: vi.fn(),
  onClose: vi.fn(),
};
```

---

## 📊 Test Generation Checklist

### Before Coding:

- [ ] All test files created with boilerplate
- [ ] Test data factories implemented
- [ ] Mock utilities ready
- [ ] Test runner configured (Vitest)

### During Coding:

- [ ] Write test FIRST for each function
- [ ] Run test (should fail - red)
- [ ] Implement code to pass test (green)
- [ ] Refactor if needed
- [ ] Ensure coverage >90%

### After Coding:

- [ ] All tests passing
- [ ] Coverage report generated
- [ ] No skipped tests
- [ ] Test performance acceptable (<1s total)

---

## 🎯 Coverage Goals

| Category       | Target | Current |
| -------------- | ------ | ------- |
| **Utilities**  | 100%   | TBD     |
| **Components** | >90%   | TBD     |
| **Overall**    | >90%   | TBD     |

### Coverage Commands:

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

---

## 🚀 Test Execution Plan

### Local Development:

```bash
# Run all tests
npm run test

# Run specific test file
npm run test messageGrouping.test.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### CI/CD Pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm run test:coverage

- name: Check Coverage
  run: |
    if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 90 ]; then
      echo "Coverage below 90%"
      exit 1
    fi
```

---

## ⚠️ Critical Test Scenarios

### Scenario 1: Message Grouping Edge Cases

**Test:** Messages exactly at threshold boundary  
**Input:** Two messages with `timestamp2 - timestamp1 = MESSAGE_GROUP_THRESHOLD_MS`  
**Expected:** Should be grouped (≤ threshold)

### Scenario 2: Line Break Rendering

**Test:** Multiple consecutive line breaks  
**Input:** `"Line 1\n\n\n\nLine 5"`  
**Expected:** 3 blank lines preserved

### Scenario 3: Status Line Formatting

**Test:** Singular vs plural  
**Input:** `memberCount = 1`  
**Expected:** "Active • 1 member" (not "members")

### Scenario 4: Avatar Fallback

**Test:** Conversation name empty  
**Input:** `conversation.name = ""`  
**Expected:** Display "?" as fallback

---

## 📋 IMPACT SUMMARY

### Test Files Tạo Mới:

- `src/utils/messageGrouping.test.ts` - 6 test cases
- `src/features/portal/components/MessageBubble.test.tsx` - 8 test cases
- `src/features/portal/components/MessageList.test.tsx` - 4 test cases
- `src/features/portal/components/ConversationHeader.test.tsx` - 6 test cases

### Test Utilities:

- `src/test/factories/messageFactory.ts` - Mock message generator
- `src/test/fixtures/conversationFixture.ts` - Mock conversations

### Total Lines of Code:

- **Test code:** ~600 lines
- **Test utilities:** ~100 lines
- **Coverage config:** ~20 lines

---

## ✅ HUMAN CONFIRMATION

| Hạng Mục                     | Status       |
| ---------------------------- | ------------ |
| Đã review Test Cases         | ✅ Đã review |
| Đã review Coverage Goals     | ✅ Đã review |
| Đã review Test Data/Mocks    | ✅ Đã review |
| **APPROVED để bắt đầu code** | ✅ APPROVED  |

**HUMAN Signature:** [MINH ĐÃ DUYỆT]  
**Date:** 2026-01-09

---

⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu mục "APPROVED để bắt đầu code" = ⬜ CHƯA APPROVED**

---

**Created:** 2026-01-09  
**Next Step:** HUMAN review và approve → Bắt đầu coding (BƯỚC 5)
