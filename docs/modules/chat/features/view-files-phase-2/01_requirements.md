# [BƯỚC 1] View Files Phase 2 - Requirements

**Module:** Chat  
**Feature:** View All Files - Modal UX Enhancement & Jump to Message  
**Phase:** Requirements Definition  
**Created:** 2026-01-16  
**Status:** ⏳ PENDING APPROVAL

---

## 📋 Version History

| Version | Date       | Changes                      | Approved By |
| ------- | ---------- | ---------------------------- | ----------- |
| 2.0     | 2026-01-16 | Initial Phase 2 requirements | PENDING     |

---

## 🎯 Feature Overview

Phase 2 bổ sung chức năng **Jump to Message** cho ViewAllFilesModal:

- ⚠️ **KHÔNG thay đổi UI hiện tại** - Giữ nguyên 100% giao diện modal
- ✅ **CHỈ bổ sung logic** - Wire up button "Xem tin nhắn gốc" với scroll function

---

## 📖 Requirements

### Category A: Jump to Message Feature

#### FR-A1: "Xem tin nhắn gốc" Button

**Current State:**

✅ Button UI ĐÃ TỒN TẠI trong:

- File grid items (Ảnh/Video section)
- Document grid items (Tài liệu section)
- File preview modal footer

**Required (Phase 2):**

⚠️ KHÔNG CẦN tạo UI mới
✅ CHỈ CẦN implement `handleJumpToMessage` function

**Implementation:**

```tsx
// EXISTING UI - Chỉ cần wire up handler
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleJumpToMessage(messageId)} // ← Thêm handler này
  data-testid={`jump-to-message-${fileId}`}
>
  <MessageSquare className="h-4 w-4 mr-2" />
  Xem tin nhắn gốc
</Button>
```

**Acceptance Criteria:**

- [ ] Wire up existing button onClick to handleJumpToMessage
- [ ] Function receives correct messageId parameter
- [ ] Click triggers scroll to message logic

---

#### FR-A2: Scroll to Message Logic

**Behavior:**

1. **Check if message exists in current chat view:**

   - IF message is in currently loaded pages → Scroll to it
   - IF message NOT loaded yet → Show toast "Đang tải tin nhắn..." (future enhancement: load message via API)

2. **Scroll animation:**

   - Use `scrollIntoView({ behavior: 'smooth', block: 'center' })`
   - Message appears in CENTER of viewport

3. **Highlight message:**
   - Add CSS classes: `ring-2 ring-orange-400 ring-offset-2 bg-orange-50/80`
   - Highlight duration: 2500ms (2.5 seconds)
   - Smooth transition: `transition-all duration-300`
   - Auto-remove classes after timeout

**Code Structure:**

```typescript
const handleJumpToMessage = useCallback(
  async (messageId: string) => {
    // Step 1: Close modal
    onClose();

    // Step 2: Find message element
    const messageElement = document.querySelector(
      `[data-testid="message-bubble-${messageId}"]`
    );

    if (messageElement) {
      // Step 3: Scroll to message
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Step 4: Highlight
      messageElement.classList.add("ring-2", "ring-amber-400", "ring-offset-2");

      // Step 5: Remove highlight after 2s
      setTimeout(() => {
        messageElement.classList.remove(
          "ring-2",
          "ring-amber-400",
          "ring-offset-2"
        );
      }, 2000);
    } else {
      // Message not in current view
      toast.info("Đang tải tin nhắn...");
      // TODO Phase 3: Load message via API and jump to it
    }
  },
  [onClose]
);
```

**Acceptance Criteria:**

- [ ] Modal closes before scroll starts
- [ ] Scroll animation is smooth
- [ ] Message centered in viewport
- [ ] Highlight appears immediately
- [ ] Highlight disappears after exactly 2s
- [ ] Toast shows if message not loaded

---

#### FR-A3: Data Requirements for Jump

**ViewAllFilesModal needs:**

- Each file item MUST have `messageId` field
- API response MUST include `messageId` in file metadata

**Example API Response:**

```json
{
  "data": [
    {
      "fileId": "uuid-1",
      "fileName": "image.jpg",
      "messageId": "msg-uuid-123", // ✅ Required for jump feature
      "sentAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**Acceptance Criteria:**

- [ ] API returns messageId for each file
- [ ] ViewAllFilesModal stores messageId in grid items
- [ ] handleJumpToMessage receives correct messageId

---

### Category B: Edge Cases & Error Handling

#### FR-B1: Message Not Found

**Scenario:** User clicks "Xem tin nhắn gốc" but message was deleted

**Behavior:**

- Toast error: "Tin nhắn không tồn tại hoặc đã bị xoá"
- Do NOT scroll
- Keep modal open

---

#### FR-B2: Different Conversation

**Scenario:** User in Conversation A, clicks file from Conversation B's "All Starred Messages" modal

**Behavior (Future Enhancement):**

- Navigate to correct conversation first
- Then scroll to message
- For Phase 2: Just show toast "Tin nhắn này ở cuộc trò chuyện khác"

---

#### FR-B3: Message Deleted During Scroll

**Scenario:** User clicks jump, but message gets deleted mid-scroll

**Behavior:**

- Gracefully fail
- Show toast "Không thể scroll tới tin nhắn"

---

## 📏 Technical Constraints

### Constraint 1: Reuse Existing Logic

- Scroll-to-message logic ALREADY exists in ChatMainContainer for pinned/starred messages
- MUST reuse `handleScrollToMessage` function
- DO NOT duplicate code

### Constraint 2: TypeScript Strict Mode

- All props MUST be typed
- No `any` types allowed
- File metadata MUST include `messageId: string`

### Constraint 3: Accessibility

- Close button MUST have aria-label
- Modal MUST trap focus
- ESC key MUST work
- Focus MUST return to trigger button after close

---

## 📋 PENDING DECISIONS (HUMAN Input Required)

> ✅ **RESOLVED:** Decision "Jump button location" - Button UI đã tồn tại sẵn

| #   | Decision            | Options                                 | HUMAN Decision           |
| --- | ------------------- | --------------------------------------- | ------------------------ |
| 1   | Highlight color     | orange-400 (with bg-orange-50/80)       | ✅ **orange-400**        |
| 2   | Highlight duration  | 2.5s                                    | ✅ **2.5s**              |
| 3   | Highlight style     | Background Glow (Option 2)              | ✅ **Background Glow**   |
| 3   | Modal close on jump | Close immediately OR close after scroll | ⬜ **Close immediately** |

---

## 📊 IMPACT SUMMARY

### Files Will Create:

- (None - only modifying existing files)

### Files Will Modify:

1. **`src/features/portal/components/information-panel/ViewAllFilesModal.tsx`**

   - ~~Update modal dimensions~~ ❌ GIỮ NGUYÊN UI
   - ~~Update header structure~~ ❌ GIỮ NGUYÊN UI
   - ~~Update close button styling~~ ❌ GIỮ NGUYÊN UI
   - ✅ Wire up existing "Xem tin nhắn gốc" button onClick handler
   - ✅ Implement handleJumpToMessage function

2. **`src/features/portal/components/chat/ChatMainContainer.tsx`** (Reference only)

   - Verify message bubbles have `data-testid="message-bubble-{id}"`
   - Existing `handleScrollToMessage` logic can be reused

3. **`src/types/files.ts`** (If needed)
   - Verify `messageId` exists in FileMetadata type

### Files Will Delete:

- (None)

### Dependencies Will Add:

- (None - using existing libraries)

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review Impact Summary  | ⬜ Chưa review   |
| Đã điền Pending Decisions | ⬜ Chưa điền     |
| **APPROVED để thực thi**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

**Next Step:** Create [02a_wireframe.md](./02a_wireframe.md) với before/after comparison
