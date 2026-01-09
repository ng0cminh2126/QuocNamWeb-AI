# [BƯỚC 4B] Phase 2 Implementation Plan - UI Enhancements

> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-07  
> **Version:** 1.0  
> **Parent:** 04_implementation-plan.md (Phase 1 COMPLETED)

---

## 📋 Overview

Phase 2 focuses on 4 UI/UX enhancements requested by user:

1. **Message Input Auto-Grow** - Textarea tự động tăng chiều cao, scrollbar chỉ sau 5 dòng
2. **Auto-Focus Input** - Tự động focus khi chọn conversation khác
3. **Fix Border Hover** - Sửa visual issue với border khi hover conversation item
4. **Reposition Badge** - Di chuyển unread count xuống dưới message preview

---

## 🆕 Enhancement 1: Message Input Auto-Grow

### Objective

Textarea input tự động tăng chiều cao theo nội dung thay vì có scrollbar xuất hiện quá sớm.

### Requirements

- **Initial height:** 1 dòng (single line)
- **Auto-grow:** Chiều cao tăng theo content (1-5 dòng)
- **Maximum height:** 5 dòng (~120px)
- **Scrollbar:** CHỈ xuất hiện sau 5 dòng (overflow-y: auto)
- **Behavior:** Shift+Enter xuống dòng, Enter gửi tin (giữ nguyên)

### Implementation Options

#### Option A: react-textarea-autosize Library ✅ RECOMMENDED

**Install:**

```bash
npm install react-textarea-autosize@^8.5.0
```

**Pros:**

- Battle-tested (2M+ downloads/week)
- Handles edge cases (resize, paste, RTL, dynamic content)
- TypeScript support built-in
- Zero config needed

**Cons:**

- External dependency (+8KB gzipped)

**Code Changes:**

```typescript
// src/features/portal/components/ChatMainContainer.tsx

// 1. Import
import TextareaAutosize from "react-textarea-autosize";

// 2. Replace <textarea> element:
<TextareaAutosize
  ref={inputRef}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  minRows={1}
  maxRows={5}
  className="
    flex-1 px-3 py-2 
    text-sm
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500
    resize-none
    overflow-y-auto  // Important: Scrollbar after maxRows
  "
  placeholder="Nhập tin nhắn... (Shift+Enter để xuống dòng)"
/>;
```

**CSS Notes:**

- Library sets `overflow-y: hidden` by default
- Override with `overflow-y: auto` để có scrollbar sau 5 dòng

---

#### Option B: Custom Hook (useAutoGrowTextarea)

**Pros:**

- No external dependency
- Full control over behavior

**Cons:**

- Phải handle edge cases manually
- More code to maintain (~40 lines)

**Code:**

```typescript
// src/hooks/useAutoGrowTextarea.ts

import { useEffect, useRef } from "react";

export function useAutoGrowTextarea(value: string, maxRows: number = 5) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height để tính toán chính xác
    textarea.style.height = "auto";

    // Get line height
    const computedStyle = getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);

    // Calculate max height
    const maxHeight = lineHeight * maxRows;
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight <= maxHeight) {
      // Content fits within maxRows
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    } else {
      // Content exceeds maxRows
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = "auto";
    }
  }, [value, maxRows]);

  return textareaRef;
}

// Usage in ChatMainContainer:
const textareaRef = useAutoGrowTextarea(input, 5);

<textarea
  ref={textareaRef}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  className="resize-none" // Prevent manual resize
  // ... other props
/>;
```

**Test File:**

```typescript
// src/hooks/__tests__/useAutoGrowTextarea.test.ts

import { renderHook } from "@testing-library/react";
import { useAutoGrowTextarea } from "../useAutoGrowTextarea";

describe("useAutoGrowTextarea", () => {
  it("should return textarea ref", () => {
    const { result } = renderHook(() => useAutoGrowTextarea("", 5));
    expect(result.current.current).toBeNull(); // No element attached
  });

  it("should grow height when content increases", () => {
    // Mock getComputedStyle, scrollHeight
    // Test height calculation logic
  });

  it("should stop growing after maxRows", () => {
    // Test maxHeight limit
  });

  it("should show scrollbar after maxRows", () => {
    // Test overflowY = 'auto'
  });
});
```

---

### Decision Required

| Option      | Pros                        | Cons             | Recommendation                            |
| ----------- | --------------------------- | ---------------- | ----------------------------------------- |
| A - Library | Robust, tested, zero config | +8KB dependency  | ✅ Use if not concerned about bundle size |
| B - Custom  | No dependency, full control | More maintenance | Use if minimizing dependencies            |

---

## 🆕 Enhancement 2: Auto-Focus Input on Conversation Switch

### Objective

Tự động focus vào message input khi user chọn conversation khác (không cần click thủ công).

### Requirements

- **Trigger 1:** Khi conversationId thay đổi
- **Trigger 2:** Sau khi gửi tin nhắn thành công
- **Timing:** Immediate focus (Option A)
- **Scope:** Desktop và mobile
- **Constraint:** KHÔNG focus khi component mount lần đầu (chỉ khi switch)

### Implementation

```typescript
// src/features/portal/components/ChatMainContainer.tsx

import { useRef, useEffect } from "react";

// 1. Create ref
const inputRef = useRef<HTMLTextAreaElement>(null);
const prevConversationIdRef = useRef<string>();

// 2. Add effect for conversation switch
useEffect(() => {
  // Only focus if conversationId CHANGED (not initial mount)
  const isConversationChanged =
    conversationId &&
    prevConversationIdRef.current !== undefined &&
    prevConversationIdRef.current !== conversationId;

  if (isConversationChanged) {
    inputRef.current?.focus(); // Immediate focus
  }

  // Update ref
  prevConversationIdRef.current = conversationId;
}, [conversationId]);

// 3. Focus after sending message
sendMessageMutation.mutate(
  { content, contentType },
  {
    onSuccess: () => {
      // Auto-focus after send
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    },
  }
);

// 4. Attach ref to textarea
<TextareaAutosize
  ref={inputRef}
  // ... other props
/>;
```

### Edge Cases

- **Mobile:** Focus triggers keyboard xuất hiện (expected behavior)
- **Desktop:** Focus ngay lập tức
- **Initial load:** Không focus (prevConversationIdRef undefined)
- **After send:** Focus để user tiếp tục nhập tin nhắn

### Implementation Decision

✅ **Selected:** Immediate focus (no delay)

- Focus ngay khi switch conversation
- Focus ngay sau khi gửi tin nhắn thành công
- Fast, direct UX

---

## 🆕 Enhancement 3: Fix Conversation Item Border Hover

### Problem

Hiện tại khi hover vào conversation item, border bị parent container border che mất hoặc không rõ ràng.

```tsx
// Current code issue:
<div className="border-b border-gray-200 hover:border-blue-500">
  {/* Border bị parent border overlap */}
</div>
```

### Solution Options

#### Option A: Remove Border, Use Background ✅ RECOMMENDED

```tsx
<div className="
  border-b border-gray-200
  hover:bg-blue-50
  transition-colors duration-150
  cursor-pointer
">
```

**Pros:**

- No z-index issues
- Clean visual
- Consistent với nhiều modern UIs

**Cons:**

- Different hover style (không phải border)

---

#### Option B: Adjust Z-Index

```tsx
<div className="
  relative
  border-b border-gray-200
  hover:border-blue-500
  hover:z-10
  transition-colors duration-150
">
```

**Pros:**

- Keep border style
- Minimal code change

**Cons:**

- May cause visual glitches với adjacent items
- Border vẫn có thể bị che một phần

---

#### Option C: Box Shadow Instead of Border

```tsx
<div className="
  border-b border-transparent
  hover:shadow-[inset_0_-2px_0_0_rgb(59,130,246)]
  transition-shadow duration-150
">
```

**Pros:**

- No z-index issues
- Precise control over visual

**Cons:**

- More complex CSS
- Box shadow có thể lag trên low-end devices

---

### Decision Required

| Option         | Visual        | Complexity | Recommendation                  |
| -------------- | ------------- | ---------- | ------------------------------- |
| A - Background | Clean, modern | Low        | ✅ IMPLEMENTED (brand-50 green) |
| B - Z-index    | Keep border   | Medium     | Not used                        |
| C - Shadow     | Precise       | High       | Not used                        |

**Implementation:** Đã chọn Option A với `hover:bg-brand-50` (brand green color) thay vì blue-50.

---

## 🆕 Enhancement 4: Reposition Unread Count Badge

### Current Layout

```tsx
// ConversationItem.tsx - Current structure
<div className="flex items-start gap-3 p-3">
  <Avatar />
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold">{name}</h4>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && <UnreadBadge count={unreadCount} />} {/* ❌ TOP */}
        <RelativeTime time={lastMessage.sentAt} />
      </div>
    </div>
    <MessagePreview content={lastMessage.content} />
  </div>
</div>
```

**Visual:**

```
┌─────────────────────────────────┐
│ Avatar  Name          [Badge] 2m│  ← Badge chung hàng với time
│         Message preview...       │
└─────────────────────────────────┘
```

---

### New Layout

```tsx
// ConversationItem.tsx - New structure
<div className="flex items-start gap-3 p-3">
  <Avatar />
  <div className="flex-1 min-w-0">
    {/* Row 1: Name + Time ONLY */}
    <div className="flex items-center justify-between mb-1">
      <h4 className="font-semibold truncate">{name}</h4>
      <RelativeTime time={lastMessage.sentAt} className="flex-shrink-0 ml-2" />
    </div>

    {/* Row 2: Message + Badge */}
    <div className="flex items-center gap-2">
      <MessagePreview
        content={lastMessage.content}
        className="flex-1 min-w-0"
      />
      {unreadCount > 0 && (
        <UnreadBadge count={unreadCount} className="flex-shrink-0" />
      )}
    </div>
  </div>
</div>
```

**Visual:**

```
┌─────────────────────────────────┐
│ Avatar  Name                  2m│  ← Time riêng hàng
│         Message preview... [Badge]│  ← Badge chung hàng message
└─────────────────────────────────┘
```

---

### CSS Considerations

```css
/* Prevent layout shift khi badge xuất hiện/biến mất */
.message-row {
  min-height: 20px; /* Reserve space */
  align-items: center;
}

/* Badge positioning */
.unread-badge {
  flex-shrink: 0; /* Không bị squash khi message dài */
}

/* Message preview truncation */
.message-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

### Animation Option

**Option A: Smooth Transition (CSS)**

```css
.unread-badge {
  transition: all 150ms ease-out;
}
```

**Pros:** Smooth visual
**Cons:** Badge "jumps" from top → bottom on first render (might be jarring)

**Option B: Instant Move**

No transition CSS.

**Pros:** Immediate, no animation delay
**Cons:** No smooth feedback

---

### Decision Required

| Aspect    | Options                         | Recommendation  |
| --------- | ------------------------------- | --------------- |
| Animation | (A) CSS transition, (B) Instant | ⬜ HUMAN decide |

---

## 📋 IMPACT SUMMARY

### Files sẽ sửa đổi:

1. **`src/features/portal/components/ChatMainContainer.tsx`** (~30 lines)

   - **Enhancement 1:** Import TextareaAutosize (or custom hook)
   - **Enhancement 1:** Replace <textarea> với <TextareaAutosize> (minRows=1, maxRows=5)
   - **Enhancement 2:** Add inputRef
   - **Enhancement 2:** Add auto-focus useEffect

2. **`src/features/portal/components/ConversationItem.tsx`** (~20 lines)

   - **Enhancement 3:** Fix hover border (option A/B/C)
   - **Enhancement 4:** Restructure layout: 2 rows (name+time, message+badge)
   - **Enhancement 4:** Move UnreadBadge from top row → bottom row
   - **Enhancement 4:** Adjust CSS classes (flex, gap, truncate)

3. **`package.json`** (if Option A cho Enhancement 1)
   - Add `"react-textarea-autosize": "^8.5.0"`

### Files sẽ tạo mới (if Option B cho Enhancement 1):

- **`src/hooks/useAutoGrowTextarea.ts`** (~40 lines)
- **`src/hooks/__tests__/useAutoGrowTextarea.test.ts`** (~60 lines)

### Files sẽ xoá:

- (Không có)

### Dependencies sẽ thêm:

- **Option A (Enhancement 1):** `react-textarea-autosize@^8.5.0` (+8KB gzipped)
- **Option B (Enhancement 1):** No dependencies

### Testing Impact:

- **Unit tests:** Update ConversationItem.test.tsx (badge position)
- **Integration tests:** Update chat input tests (auto-grow behavior)
- **E2E tests:** Update conversation-list.test.ts (hover, badge position)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                      | Lựa chọn                                                  | HUMAN Decision              |
| --- | --------------------------- | --------------------------------------------------------- | --------------------------- |
| 1   | Auto-grow implementation    | (A) `react-textarea-autosize` library, (B) Custom hook?   | ✅ **(A) Library**          |
| 2   | Max textarea rows           | 5 rows (user request) - CONFIRMED                         | ✅ **5 rows**               |
| 3   | Auto-focus timing           | (A) Immediate focus, (B) Delay 100ms?                     | ✅ **(A) Immediate**        |
| 4   | Conversation item hover fix | (A) Background color, (B) Z-index adjust, (C) Box shadow? | ✅ **(A) Background color** |
| 5   | Badge position animation    | (A) CSS transition (smooth), (B) Instant move?            | ✅ **(B) Instant move**     |

> ✅ **All decisions filled by HUMAN**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review Phase 2 Requirements    | ✅ Đã review |
| Đã review Implementation Options  | ✅ Đã review |
| Đã review Impact Summary          | ✅ Đã review |
| Đã điền Pending Decisions (#1-#5) | ✅ Đã điền   |
| **APPROVED để implement Phase 2** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

> ✅ **Phase 2 Plan approved - AI được phép implement**

---

_Created: 2026-01-07_
