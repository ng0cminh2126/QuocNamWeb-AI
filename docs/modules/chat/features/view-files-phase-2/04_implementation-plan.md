# [BƯỚC 4] View Files Phase 2 - Implementation Plan

**Module:** Chat  
**Feature:** View All Files - Jump to Message  
**Phase:** Implementation Roadmap  
**Created:** 2026-01-16  
**Status:** ✅ APPROVED - Ready to Code

---

## 📋 Implementation Overview

**Scope:** CHỈ bổ sung logic `handleJumpToMessage`, KHÔNG thay đổi UI

**Files to Modify:** 1 file only

- `src/features/portal/components/information-panel/ViewAllFilesModal.tsx`

**Estimated Time:** 2-3 hours

---

## 🎯 Step-by-Step Plan

### Step 1: Implement handleJumpToMessage Function

**File:** `src/features/portal/components/information-panel/ViewAllFilesModal.tsx`

```typescript
// ADD: Import dependencies
import { toast } from "sonner";
import { useCallback } from "react";

// ADD: Helper function to scroll and highlight
const scrollAndHighlight = (element: Element) => {
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Option 2: Background Glow (simple & effective)
  element.classList.add(
    "ring-2",
    "ring-orange-400",
    "ring-offset-2",
    "bg-orange-50/80",
    "transition-all",
    "duration-300"
  );

  setTimeout(() => {
    element.classList.remove(
      "ring-2",
      "ring-orange-400",
      "ring-offset-2",
      "bg-orange-50/80",
      "transition-all",
      "duration-300"
    );
  }, 2500);
};

// ADD: handleJumpToMessage function with auto-load retry
const handleJumpToMessage = useCallback(
  async (messageId: string) => {
    // Step 1: Close modal immediately
    onClose();

    // Step 2: Try to find message in current DOM
    let messageElement = document.querySelector(
      `[data-testid="message-bubble-${messageId}"]`
    );

    if (messageElement) {
      // ✅ Found immediately - scroll and highlight
      scrollAndHighlight(messageElement);
      return;
    }

    // Step 3: Message not loaded - trigger auto-load
    toast.info("Đang tải tin nhắn cũ hơn...", { duration: 3000 });

    // Step 4: Retry loop - load older messages
    const MAX_RETRIES = 5;
    for (let i = 0; i < MAX_RETRIES; i++) {
      // Call fetchNextPage from ChatMainContainer
      // Note: This requires exposing fetchNextPage via context or props
      if (messagesQuery?.hasNextPage && !messagesQuery?.isFetchingNextPage) {
        await messagesQuery.fetchNextPage();

        // Wait for DOM to update
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Check again
        messageElement = document.querySelector(
          `[data-testid="message-bubble-${messageId}"]`
        );

        if (messageElement) {
          // ✅ Found after loading!
          scrollAndHighlight(messageElement);
          toast.success("Đã tìm thấy tin nhắn!", { duration: 2000 });
          return;
        }
      } else {
        // No more pages to load
        break;
      }
    }

    // ❌ Still not found after all retries
    toast.error("Không tìm thấy tin nhắn (có thể đã bị xóa)", {
      duration: 3000,
    });
  },
  [onClose, messagesQuery]
);
```

**Checklist:**

- [ ] Import `toast` from sonner
- [ ] Import `useCallback` from react
- [ ] Add `scrollAndHighlight` helper function
- [ ] Add `handleJumpToMessage` async function
- [ ] Add `messagesQuery` prop to ViewAllFilesModal (from ChatMainContainer)
- [ ] Implement retry loop with MAX_RETRIES = 5
- [ ] Use amber-400 for highlight color
- [ ] 2s timeout for highlight removal
- [ ] 3s toast duration for loading, 2s for success
- [ ] Close modal immediately before scroll
- [ ] Check hasNextPage before fetchNextPage
- [ ] 300ms delay between retries for DOM update

---

### Step 2: Wire Up "Xem tin nhắn gốc" Button

**Location:** Existing button in grid item menu

```typescript
// FIND: Existing button in ViewAllFilesModal
// Current state (button exists, onClick empty or missing):
<Button
  variant="ghost"
  size="sm"
  onClick={() => {/* TODO */}}
>
  <MessageSquare className="h-4 w-4 mr-2" />
  Xem tin nhắn gốc
</Button>

// UPDATE TO:
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleJumpToMessage(file.messageId)} // ← ADD THIS
  data-testid={`jump-to-message-${file.fileId}`}
>
  <MessageSquare className="h-4 w-4 mr-2" />
  Xem tin nhắn gốc
</Button>
```

**Find Button Locations:**

1. Image grid items menu (Ảnh/Video tab)
2. Document grid items menu (Tài liệu tab)
3. File preview modal footer (if exists)

**Checklist:**

- [ ] Find all "Xem tin nhắn gốc" buttons
- [ ] Wire up onClick to handleJumpToMessage
- [ ] Pass correct messageId parameter
- [ ] Add data-testid for E2E testing

---

### Step 3: Add Debounce (Optional Enhancement)

**Prevent rapid clicks:**

```typescript
// ADD: Debounce state
const [isJumping, setIsJumping] = useState(false);

const handleJumpToMessage = useCallback(
  (messageId: string) => {
    // Debounce: Prevent rapid clicks
    if (isJumping) return;

    setIsJumping(true);

    // ... rest of logic ...

    // Reset after animation completes
    setTimeout(() => {
      setIsJumping(false);
    }, 500); // 500ms debounce per HUMAN decision
  },
  [onClose, isJumping]
);
```

**Checklist:**

- [ ] Add isJumping state
- [ ] Check state before executing
- [ ] Reset after 500ms

---

### Step 4: Verify MessageBubbleSimple data-testid

**File:** `src/features/portal/components/chat/MessageBubbleSimple.tsx`

```typescript
// VERIFY: MessageBubbleSimple has correct data-testid
<div
  data-testid={`message-bubble-${message.id}`} // ✅ Must exist
  className={/* ... */}
>
  {/* message content */}
</div>
```

**Checklist:**

- [ ] Open MessageBubbleSimple.tsx
- [ ] Verify data-testid exists
- [ ] Verify format: `message-bubble-{messageId}`
- [ ] If missing, add it to root div

---

## 📝 Code Changes Summary

### Files Modified (2)

**1. ViewAllFilesModal.tsx**

Changes:

- ✅ Add `scrollAndHighlight` helper function
- ✅ Add `handleJumpToMessage` async function with retry logic
- ✅ Add `messagesQuery` prop (from ChatMainContainer)
- ✅ Wire up existing button onClick
- ✅ Add debounce state (optional)

Lines added: ~75 lines (including retry logic)
Lines modified: ~3 lines (button onClick)

**2. ChatMainContainer.tsx** (or wrapper component)

Changes:

- ✅ Pass `messagesQuery` prop to ViewAllFilesModal
- ✅ Ensure `fetchNextPage` and `hasNextPage` exposed

Lines modified: ~5 lines (prop passing)

### Files Verified (1)

**1. MessageBubbleSimple.tsx**

Verification:

- ✅ Check data-testid exists
- ⚠️ Add if missing

---

## 🧪 Testing Checklist

### Manual Testing

**Test Case 1: Happy Path**

- [ ] Open ViewAllFilesModal (Ảnh tab)
- [ ] Hover file item → Click [⋮] menu
- [ ] Click "Xem tin nhắn gốc"
- [ ] Expected: Modal closes, scrolls to message, amber ring appears
- [ ] Expected: Ring disappears after 2s

**Test Case 2: Message Not Loaded - Auto-Load**

- [ ] Open ViewAllFilesModal
- [ ] Click "Xem tin nhắn gốc" for very old message (not in current view)
- [ ] Expected: Toast "Đang tải tin nhắn cũ hơn..." appears
- [ ] Expected: Modal closes immediately
- [ ] Expected: Messages auto-load (up to 5 retries)
- [ ] Expected: Either success toast "Đã tìm thấy!" or error toast after 5 retries

**Test Case 3: Message Found After Retries**

- [ ] Click jump on message from 200 messages ago
- [ ] Expected: Auto-load triggers 3-4 times
- [ ] Expected: Success toast appears when message loaded
- [ ] Expected: Message scrolled and highlighted

**Test Case 4: Rapid Clicks**

- [ ] Click "Xem tin nhắn gốc" rapidly 5 times
- [ ] Expected: Only first click executes
- [ ] Expected: No duplicate scrolls or fetches

**Test Case 5: Different File Types**

- [ ] Test with image file
- [ ] Test with document file
- [ ] Expected: All work consistently with auto-load

---

## 📋 PENDING DECISIONS (From Requirements)

> ✅ All decisions RESOLVED by HUMAN

| Decision           | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Highlight color    | ✅ orange-400 + bg-orange-50/80 (Option 2: Background Glow) |
| Highlight duration | ✅ 2.5s                                                     |
| Transition         | ✅ transition-all duration-300                              |
| Modal close timing | ✅ Close immediately                                        |
| Debounce time      | ✅ 500ms                                                    |
| Max retry count    | ✅ 5 times                                                  |
| Retry delay        | ✅ 300ms                                                    |

---

## 📊 IMPACT SUMMARY

### Changes:

- ✅ Add 2 functions: `scrollAndHighlight`, `handleJumpToMessage` (async)
- ✅ Update 1-3 buttons: wire up onClick
- ✅ Add 2 states: `isJumping` (optional)
- ✅ Add 1 prop: `messagesQuery` to ViewAllFilesModal
- ✅ Modify ChatMainContainer: pass messagesQuery to modal
- ❌ NO UI changes
- ❌ NO new API endpoints (uses existing fetchNextPage)
- ❌ NO new components

### Risk Assessment:

| Risk                   | Severity | Mitigation                       |
| ---------------------- | -------- | -------------------------------- |
| Message ID mismatch    | Medium   | Verify data-testid format        |
| Scroll fails on mobile | Low      | Test on mobile viewport          |
| Highlight not visible  | Low      | Test with different themes       |
| Modal close race       | Low      | Close before scroll (sequential) |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                        | Status        |
| ------------------------------- | ------------- |
| Đã review implementation steps  | ✅ Đã review  |
| Đã verify feasibility           | ✅ Đã verify  |
| Đã confirm no UI changes needed | ✅ Đã confirm |
| **APPROVED để thực thi**        | ✅ APPROVED   |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-16

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

**Next Step:** Create [06_testing.md](./06_testing.md) với test coverage matrix
