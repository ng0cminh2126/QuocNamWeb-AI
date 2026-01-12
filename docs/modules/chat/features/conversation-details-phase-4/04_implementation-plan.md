# [BƯỚC 4] Phase 4 Implementation Plan: Message Display & Conversation Info

> **Module:** Chat  
> **Feature:** Message Display & Conversation Info Enhancements  
> **Version:** 4.0  
> **Status:** ⏳ PENDING - Awaiting HUMAN approval  
> **Created:** 2026-01-09

---

## 📋 Overview

Implementation plan cho Phase 4 với 5 improvements chính:

1. **Message Grouping** - Group tin nhắn theo người gửi + thời gian
2. **Line Break Rendering** - Fix hiển thị `\n` trong content
3. **Message Styling** - Update border-radius & padding
4. **Avatar Consistency** - Fix avatar display (giữ nguyên styling)
5. **Conversation Header Info** - Thêm status line

**Approach:** Progressive enhancement - giữ nguyên UI hiện có, chỉ fix bugs và thêm features.

---

## 🎯 Implementation Checklist

### Phase 4.1: Message Grouping Utility (Foundation)

- [ ] Create `src/utils/messageGrouping.ts`
- [ ] Create `src/utils/messageGrouping.test.ts`
- [ ] Implement grouping algorithm
- [ ] Test grouping logic

### Phase 4.2: Message Styling Updates

- [ ] Update MessageBubble component
- [ ] Update CSS for border-radius (1rem)
- [ ] Update CSS for padding (0.5rem/1rem)
- [ ] Add `white-space: pre-wrap` for line breaks
- [ ] Test message rendering

### Phase 4.3: Conversation Header Enhancement

- [ ] Update ConversationHeader component
- [ ] Add status line display
- [ ] Implement status formatting logic
- [ ] Test header on different conversation types

### Phase 4.4: Integration & Testing

- [ ] Integrate grouping into MessageList
- [ ] Manual testing all features
- [ ] Fix bugs if any
- [ ] Update session log

---

## 📂 File Structure

```
src/
├── utils/
│   ├── messageGrouping.ts          # [NEW] Grouping algorithm
│   └── messageGrouping.test.ts     # [NEW] Unit tests
│
├── features/portal/components/
│   ├── MessageBubble.tsx           # [MODIFY] Add grouping props
│   ├── MessageList.tsx             # [MODIFY] Apply grouping
│   └── ConversationHeader.tsx      # [MODIFY] Add status line
│
└── types/
    └── conversation.ts             # [MODIFY] Add status, memberCount, onlineCount
```

---

## 🔨 Implementation Details

### 1. Message Grouping Utility

**File:** `src/utils/messageGrouping.ts`

```typescript
/**
 * Message grouping utility
 * Groups consecutive messages from same sender within time threshold
 */

export interface GroupedMessage<T = any> {
  message: T;
  isFirstInGroup: boolean;
  isMiddleInGroup: boolean;
  isLastInGroup: boolean;
}

/**
 * Default time threshold: 10 minutes
 */
export const MESSAGE_GROUP_THRESHOLD_MS = 10 * 60 * 1000;

/**
 * Group messages by sender and time proximity
 */
export function groupMessages<
  T extends { senderId: string; timestamp: number }
>(
  messages: T[],
  thresholdMs: number = MESSAGE_GROUP_THRESHOLD_MS
): GroupedMessage<T>[] {
  if (messages.length === 0) return [];

  const grouped: GroupedMessage<T>[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const previous = messages[i - 1];
    const next = messages[i + 1];

    // Check if same group as previous message
    const sameAsPrevious =
      previous &&
      previous.senderId === current.senderId &&
      current.timestamp - previous.timestamp <= thresholdMs;

    // Check if same group as next message
    const sameAsNext =
      next &&
      next.senderId === current.senderId &&
      next.timestamp - current.timestamp <= thresholdMs;

    const isFirstInGroup = !sameAsPrevious;
    const isLastInGroup = !sameAsNext;
    const isMiddleInGroup = !isFirstInGroup && !isLastInGroup;

    grouped.push({
      message: current,
      isFirstInGroup,
      isMiddleInGroup,
      isLastInGroup,
    });
  }

  return grouped;
}
```

**Test File:** `src/utils/messageGrouping.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { groupMessages, MESSAGE_GROUP_THRESHOLD_MS } from "./messageGrouping";

describe("messageGrouping", () => {
  const createMessage = (senderId: string, timestamp: number) => ({
    id: `msg-${timestamp}`,
    senderId,
    timestamp,
    content: "test",
  });

  it("should mark single message as both first and last", () => {
    const messages = [createMessage("user1", 1000)];
    const grouped = groupMessages(messages);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(true);
    expect(grouped[0].isMiddleInGroup).toBe(false);
  });

  it("should group consecutive messages from same sender within threshold", () => {
    const messages = [
      createMessage("user1", 1000),
      createMessage("user1", 2000), // 1s later
      createMessage("user1", 3000), // 2s later total
    ];
    const grouped = groupMessages(messages);

    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(false);

    expect(grouped[1].isFirstInGroup).toBe(false);
    expect(grouped[1].isMiddleInGroup).toBe(true);
    expect(grouped[1].isLastInGroup).toBe(false);

    expect(grouped[2].isFirstInGroup).toBe(false);
    expect(grouped[2].isLastInGroup).toBe(true);
  });

  it("should NOT group messages from different senders", () => {
    const messages = [
      createMessage("user1", 1000),
      createMessage("user2", 2000),
      createMessage("user1", 3000),
    ];
    const grouped = groupMessages(messages);

    // All messages are both first and last (separate groups)
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(true);

    expect(grouped[1].isFirstInGroup).toBe(true);
    expect(grouped[1].isLastInGroup).toBe(true);

    expect(grouped[2].isFirstInGroup).toBe(true);
    expect(grouped[2].isLastInGroup).toBe(true);
  });

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

  it("should use custom threshold", () => {
    const customThreshold = 5000; // 5 seconds
    const messages = [
      createMessage("user1", 0),
      createMessage("user1", 4000), // Within 5s
      createMessage("user1", 10000), // Beyond 5s from previous
    ];
    const grouped = groupMessages(messages, customThreshold);

    // First two grouped, third separate
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[1].isLastInGroup).toBe(true);
    expect(grouped[2].isFirstInGroup).toBe(true);
    expect(grouped[2].isLastInGroup).toBe(true);
  });
});
```

**Acceptance Criteria:**

✅ Grouping algorithm works correctly  
✅ Time threshold configurable  
✅ All edge cases tested  
✅ 100% code coverage for utility

---

### 2. MessageBubble Component Updates

**File:** `src/features/portal/components/MessageBubble.tsx`

**Changes:**

1. Add new props: `isFirstInGroup`, `isMiddleInGroup`, `isLastInGroup`
2. Render timestamp ở trên nếu `isFirstInGroup`
3. Conditionally render avatar & sender name
4. Update border-radius based on position
5. Update padding: `py-2 px-4` (0.5rem/1rem)
6. Add `whitespace-pre-wrap` cho line breaks

**Implementation:**

```typescript
interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  currentUserId: string;

  // NEW: Grouping props
  isFirstInGroup: boolean;
  isMiddleInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({
  message,
  isOutgoing,
  currentUserId,
  isFirstInGroup,
  isMiddleInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  const senderName = message.sender?.name || "Unknown";
  const senderInitial = senderName[0]?.toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex gap-2",
        isOutgoing && "flex-row-reverse",
        // Reduced margin for grouped messages
        isFirstInGroup ? "mt-4" : "mt-0.5"
      )}
      data-testid={`message-bubble-${message.id}`}
    >
      {/* Avatar - only for incoming first message */}
      {isFirstInGroup && !isOutgoing && (
        <Avatar className="h-10 w-10" data-testid="message-avatar">
          <AvatarFallback className="bg-emerald-500 text-white text-sm">
            {senderInitial}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer if not first (align with avatar) */}
      {!isFirstInGroup && !isOutgoing && <div className="w-10" />}

      <div className={cn("flex flex-col gap-1", isOutgoing && "items-end")}>
        {/* Timestamp - only at top of group */}
        {isFirstInGroup && (
          <span
            className={cn("text-xs text-gray-500", !isOutgoing && "text-left")}
            data-testid="message-timestamp-group"
          >
            {formatTime(message.createdAt)}
          </span>
        )}

        {/* Sender name - only for incoming first message */}
        {isFirstInGroup && !isOutgoing && (
          <span
            className="text-sm font-semibold text-gray-700"
            data-testid="message-sender"
          >
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            // NEW: Updated padding (0.5rem/1rem)
            "px-4 py-2",
            // NEW: Base border-radius (1rem)
            "rounded-2xl",
            // Colors
            isOutgoing
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-800",
            // Dynamic border-radius for grouped messages
            !isFirstInGroup && !isLastInGroup && isOutgoing && "rounded-tr-sm",
            !isFirstInGroup && !isLastInGroup && !isOutgoing && "rounded-tl-sm"
          )}
          data-testid="message-content"
        >
          {/* NEW: white-space: pre-wrap for line breaks */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* File attachments (if exists) */}
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.files.map((file) => (
                <FileAttachment key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**

✅ Timestamp hiển thị ở trên nhóm  
✅ Avatar & name chỉ hiển thị cho first message in group  
✅ Border-radius = 1rem  
✅ Padding = 0.5rem/1rem  
✅ Line breaks (`\n`) hiển thị đúng  
✅ File attachments vẫn hoạt động

---

### 3. MessageList Component Integration

**File:** `src/features/portal/components/MessageList.tsx` (or ChatMainContainer)

**Changes:**

1. Import `groupMessages` utility
2. Apply grouping trước khi render
3. Pass grouping props to MessageBubble
4. Memoize grouped messages

**Implementation:**

```typescript
import { useMemo } from "react";
import { groupMessages } from "@/utils/messageGrouping";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages, currentUserId }) {
  // Apply grouping with memoization
  const groupedMessages = useMemo(() => {
    return groupMessages(messages);
  }, [messages]);

  return (
    <div className="flex flex-col space-y-0" data-testid="message-list">
      {groupedMessages.map(
        ({ message, isFirstInGroup, isMiddleInGroup, isLastInGroup }) => {
          const isOutgoing = message.senderId === currentUserId;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOutgoing={isOutgoing}
              currentUserId={currentUserId}
              isFirstInGroup={isFirstInGroup}
              isMiddleInGroup={isMiddleInGroup}
              isLastInGroup={isLastInGroup}
            />
          );
        }
      )}
    </div>
  );
}
```

**Acceptance Criteria:**

✅ Messages được group đúng  
✅ Props truyền xuống MessageBubble đúng  
✅ Performance tốt (memoization)  
✅ Không break existing features

---

### 4. ConversationHeader Component Updates

**File:** `src/features/portal/components/ConversationHeader.tsx`

**Changes:**

1. Add status line below conversation name
2. Format status text: "Active • 5 members • 3 online"
3. Handle different conversation types (group vs DM)
4. Increase header height to 72px

**Implementation:**

```typescript
interface ConversationHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onMenuClick: () => void;
  onClose: () => void;
}

function formatStatusLine(
  status: string,
  memberCount: number,
  onlineCount: number,
  isDirect: boolean
): string {
  const parts: string[] = [status || "Active"];

  if (isDirect) {
    // Direct message: "Active • Online" or "Active"
    if (onlineCount > 0) {
      parts.push("Online");
    }
  } else {
    // Group chat: "Active • 5 members • 3 online"
    parts.push(`${memberCount} ${memberCount === 1 ? "member" : "members"}`);
    if (onlineCount > 0) {
      parts.push(`${onlineCount} online`);
    }
  }

  return parts.join(" • ");
}

export function ConversationHeader({
  conversation,
  onBack,
  onMenuClick,
  onClose,
}: ConversationHeaderProps) {
  const conversationName = conversation.name || "Conversation";
  const avatarLetter = conversationName[0]?.toUpperCase() || "?";

  const isDirect = conversation.type === "Direct"; // or check participants.length === 2
  const memberCount = conversation.participants?.length || 0;
  const onlineCount = conversation.onlineCount || 0;
  const status = conversation.status || "Active";

  const statusLine = formatStatusLine(
    status,
    memberCount,
    onlineCount,
    isDirect
  );

  return (
    <header
      className="h-18 px-4 flex items-center gap-3 border-b border-gray-200"
      data-testid="conversation-header"
    >
      {/* Back Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={onBack}
        data-testid="header-back-button"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Avatar - Default with first letter, gray bg, black text */}
      <Avatar className="h-10 w-10" data-testid="conversation-avatar">
        <AvatarFallback className="bg-gray-200 text-gray-800 text-base font-semibold">
          {avatarLetter}
        </AvatarFallback>
      </Avatar>

      {/* Name + Status Line */}
      <div className="flex-1 flex flex-col gap-1">
        <h2
          className="text-base font-semibold truncate"
          data-testid="conversation-name"
        >
          {conversationName}
        </h2>
        <p className="text-sm text-gray-600" data-testid="conversation-status">
          {statusLine}
        </p>
      </div>

      {/* Actions */}
      <Button
        size="icon"
        variant="ghost"
        onClick={onMenuClick}
        data-testid="header-menu-button"
      >
        <MoreVertical className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onClose}
        data-testid="header-close-button"
      >
        <X className="h-5 w-5" />
      </Button>
    </header>
  );
}
```

**CSS Updates:**

```css
/* Update header height */
.conversation-header {
  height: 72px; /* Was 60px */
}

/* Mobile */
@media (max-width: 768px) {
  .conversation-header {
    height: 64px;
  }
}
```

**Acceptance Criteria:**

✅ Status line hiển thị đúng format  
✅ Group chat: "Active • 5 members • 3 online"  
✅ Direct message: "Active • Online"  
✅ Không hiển thị "online" nếu count = 0  
✅ Avatar giữ nguyên gray bg + black text  
✅ Header height = 72px (desktop), 64px (mobile)

---

### 5. TypeScript Types Updates

**File:** `src/types/conversation.ts`

**Add fields:**

```typescript
export interface Conversation {
  id: string;
  name: string;
  type: "Group" | "Direct";
  participants: Participant[];

  // NEW FIELDS (may not exist in current API)
  status?: "Active" | "Archived" | "Muted";
  memberCount?: number; // Can fallback to participants.length
  onlineCount?: number; // Default to 0 if not provided
  avatarFileId?: string | null; // Future use

  // Existing fields...
  createdAt: number;
  updatedAt: number;
}
```

---

## 🧪 Testing Strategy

### Unit Tests

**Files to test:**

1. `messageGrouping.test.ts` - ✅ Already defined above
2. `MessageBubble.test.tsx` - Test grouping props rendering
3. `ConversationHeader.test.tsx` - Test status line formatting

**MessageBubble Tests:**

```typescript
describe("MessageBubble", () => {
  it("should render timestamp only for first message in group", () => {
    const { getByTestId, queryByTestId } = render(
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

  it("should render line breaks correctly", () => {
    const message = { ...mockMessage, content: "Line 1\nLine 2\n\nLine 4" };
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
});
```

**ConversationHeader Tests:**

```typescript
describe("ConversationHeader - Status Line", () => {
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

  it("should NOT show online if count = 0", () => {
    const conversation = {
      ...mockConversation,
      type: "Group",
      memberCount: 5,
      onlineCount: 0,
    };
    const { getByTestId } = render(
      <ConversationHeader conversation={conversation} {...mockHandlers} />
    );
    expect(getByTestId("conversation-status")).toHaveTextContent(
      "Active • 5 members"
    );
  });

  it("should render direct message status", () => {
    const conversation = {
      ...mockConversation,
      type: "Direct",
      participants: [{ id: "1" }, { id: "2" }],
      onlineCount: 1,
    };
    const { getByTestId } = render(
      <ConversationHeader conversation={conversation} {...mockHandlers} />
    );
    expect(getByTestId("conversation-status")).toHaveTextContent(
      "Active • Online"
    );
  });
});
```

### Manual Testing Checklist

- [ ] Message grouping works for consecutive messages
- [ ] Timestamp appears only at top of group
- [ ] Line breaks display correctly (`\n` → new line)
- [ ] Border-radius looks softer (1rem)
- [ ] Padding looks tighter vertically
- [ ] Avatar displays correctly (gray bg, black text)
- [ ] Status line shows correct info
- [ ] Mobile responsive (header height, avatar size)
- [ ] No regression on file attachments
- [ ] Performance acceptable (no lag)

---

## 🚀 Deployment Steps

### 1. Pre-deployment

- [ ] All unit tests passing
- [ ] Manual testing completed
- [ ] Code review passed
- [ ] No console errors/warnings

### 2. Deployment

- [ ] Merge to main branch
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production

### 3. Post-deployment

- [ ] Monitor for errors
- [ ] Verify features work in production
- [ ] Update session log
- [ ] Mark Phase 4 as complete

---

## ⚠️ Potential Issues & Solutions

### Issue 1: API không có `status`, `onlineCount` fields

**Solution:** Use fallback values

```typescript
const status = conversation.status || "Active";
const onlineCount = conversation.onlineCount || 0;
const memberCount =
  conversation.memberCount || conversation.participants?.length || 0;
```

### Issue 2: Line breaks không hiển thị

**Solution:** Đảm bảo CSS `whitespace-pre-wrap` applied

```typescript
<p className="whitespace-pre-wrap">{message.content}</p>
```

### Issue 3: Grouping algorithm slow với nhiều messages

**Solution:** Sử dụng `useMemo` để cache kết quả

```typescript
const groupedMessages = useMemo(() => groupMessages(messages), [messages]);
```

### Issue 4: Avatar không đúng màu

**Solution:** Kiểm tra class names

```typescript
// Conversation avatar: gray bg, black text
<AvatarFallback className="bg-gray-200 text-gray-800">

// Member avatar: keep existing (emerald/generated colors)
<AvatarFallback className="bg-emerald-500 text-white">
```

---

## 📊 Performance Considerations

### Grouping Algorithm

- **Complexity:** O(n) - single pass through messages
- **Memory:** O(n) - creates new array with grouped metadata
- **Optimization:** Use `useMemo` to prevent re-computation

### Re-rendering

- **Trigger:** Only when `messages` array changes
- **Scope:** Only MessageList and children re-render
- **Optimization:** MessageBubble memoized if needed

### Expected Impact

- **Bundle size:** +2KB (grouping utility + tests)
- **Runtime performance:** Negligible (<1ms for 100 messages)
- **Memory:** +~1KB per 100 messages (grouping metadata)

---

## 📋 IMPACT SUMMARY

### Files Tạo Mới:

- `src/utils/messageGrouping.ts` - Grouping algorithm (~80 lines)
- `src/utils/messageGrouping.test.ts` - Unit tests (~150 lines)

### Files Sửa Đổi:

- **`src/features/portal/components/MessageBubble.tsx`** (~40 lines changed)

  - Add 3 props: `isFirstInGroup`, `isMiddleInGroup`, `isLastInGroup`
  - Conditional render timestamp, avatar, sender name
  - Update padding: `py-2 px-4`
  - Update border-radius: `rounded-2xl`
  - Add `whitespace-pre-wrap` class
  - Dynamic border-radius for grouped messages

- **`src/features/portal/components/MessageList.tsx`** (~15 lines changed)

  - Import `groupMessages`
  - Apply grouping với `useMemo`
  - Pass grouping props to MessageBubble

- **`src/features/portal/components/ConversationHeader.tsx`** (~30 lines changed)

  - Add status line rendering
  - Implement `formatStatusLine` logic
  - Update layout structure (2 lines instead of 1)
  - Ensure avatar gray bg + black text

- **`src/types/conversation.ts`** (~5 lines changed)
  - Add optional fields: `status`, `memberCount`, `onlineCount`, `avatarFileId`

### Test Files Tạo Mới:

- `src/features/portal/components/MessageBubble.test.tsx` - Component tests
- `src/features/portal/components/ConversationHeader.test.tsx` - Header tests (nếu chưa có)

### Dependencies:

- ✅ Không cần thêm dependencies mới
- ✅ Sử dụng existing: React, TailwindCSS, Radix UI

### Breaking Changes:

- ⚠️ MessageBubble component props thay đổi (thêm 3 props bắt buộc)
- ⚠️ Conversation type có thể cần update (add optional fields)

---

## 🎯 Success Criteria

✅ **Functionality:**

- Message grouping works correctly
- Line breaks render properly
- Status line displays correct information
- Avatar consistency maintained

✅ **Testing:**

- All unit tests pass (100% coverage for new code)
- Manual testing checklist completed
- No regressions in existing features

✅ **Performance:**

- No noticeable lag with 100+ messages
- Grouping algorithm completes in <5ms
- No memory leaks

✅ **Code Quality:**

- TypeScript types correct
- No console errors/warnings
- Code follows conventions
- Tests cover edge cases

---

## ⏳ PENDING DECISIONS (HUMAN PHẢI ĐIỀN)

| #   | Decision Point                       | Options                        | HUMAN Choice           |
| --- | ------------------------------------ | ------------------------------ | ---------------------- |
| 1   | Apply grouping to ALL conversations? | Yes / No (opt-in only)         | ⬜ **Yes**             |
| 2   | Fallback for missing API fields?     | Default values / Hide feature  | ⬜ **Default values**  |
| 3   | Mobile header height                 | 60px / 64px / 68px             | ⬜ **64px**            |
| 4   | Skip E2E tests for this phase?       | Yes (only unit) / No (add E2E) | ⬜ **Yes (only unit)** |

---

## ✅ HUMAN CONFIRMATION

| Hạng Mục                              | Status       |
| ------------------------------------- | ------------ |
| Đã review Implementation Plan         | ✅ Đã review |
| Đã review Code Examples               | ✅ Đã review |
| Đã điền Pending Decisions             | ✅ Đã điền   |
| **APPROVED để tạo Test Requirements** | ✅ APPROVED  |

**HUMAN Signature:** [MINH ĐÃ DUYỆT]  
**Date:** 2026-01-09

---

⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tiếp tục BƯỚC 6 (test requirements) nếu mục "APPROVED để tạo Test Requirements" = ⬜ CHƯA APPROVED**

---

**Created:** 2026-01-09  
**Next Step:** HUMAN review và approve → Tạo test requirements (BƯỚC 6)
