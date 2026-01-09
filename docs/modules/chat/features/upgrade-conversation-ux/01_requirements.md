# [BƯỚC 1] Requirements - Upgrade Conversation UX

> **Status:** ✅ APPROVED (Phase 1 Completed) | ⏳ PENDING Phase 2 Approval  
> **Created:** 2026-01-07  
> **Phase 1 Approved:** 2026-01-07  
> **Phase 1 Completed:** 2026-01-07  
> **Phase 2 Created:** 2026-01-07  
> **Version:** 1.1 (Added Phase 2: UI Enhancements)

---

## 📋 Feature Requirements

### 1. Real-time Conversation List Updates

#### 1.1 Latest Message Display

**Requirement:** Khi nhận tin nhắn mới, conversation item phải hiển thị:

- Nội dung tin nhắn mới nhất (truncated nếu quá dài)
- Thời gian của tin nhắn mới nhất
- Tên người gửi (nếu là group chat)

**Acceptance Criteria:**

- ✅ Tin nhắn mới cập nhật ngay lập tức (< 1s delay)
- ✅ Thời gian hiển thị dạng relative ("5 phút trước", "hôm qua", etc.)
- ✅ Truncate message preview tại 50 ký tự với "..."
- ✅ Hiển thị icon attachment nếu tin nhắn có file

**Current State:**

- File: `src/features/portal/components/ConversationList.tsx`
- Dữ liệu conversation: Mock data trong `src/data/mockConversations.ts`
- Chưa có real-time update khi nhận tin nhắn mới

**Required Changes:**

- Integrate SignalR để lắng nghe tin nhắn mới
- Update conversation state khi nhận message
- Re-render conversation item với latest message

#### 1.2 Unread Count Badge

**Requirement:** Hiển thị số tin nhắn chưa đọc cho mỗi conversation

**Rules:**

- Chỉ hiển thị unread count khi user KHÔNG đang xem conversation đó
- Nếu user đang ở conversation A, nhận tin nhắn từ conversation B → show badge ở B
- Badge reset về 0 khi user click vào conversation
- Badge có màu khác biệt (ví dụ: red background)

**Acceptance Criteria:**

- ✅ Badge hiển thị số chính xác (1, 2, ..., 99+)
- ✅ Badge không hiện khi đang active conversation
- ✅ Badge reset khi click vào conversation
- ✅ Badge update real-time khi nhận tin mới

**API Requirement:**

- GET `/api/conversations/{id}/unread-count` - Lấy số tin chưa đọc
- POST `/api/conversations/{id}/mark-as-read` - Đánh dấu đã đọc
- SignalR event: `NewMessage` - Include unread count trong payload

**Current State:**

- Chưa có API cho unread count
- Chưa có logic tracking read/unread
- Chưa có UI cho badge

---

### 2. Smart Sorting - Latest First

**Requirement:** Conversations tự động sắp xếp theo thời gian tin nhắn mới nhất (mới nhất lên đầu)

**Acceptance Criteria:**

- ✅ Khi nhận tin mới, conversation đó tự động nhảy lên đầu list
- ✅ Animation smooth khi reorder (không jump đột ngột)
- ✅ Giữ scroll position nếu user đang scroll xuống
- ✅ Sorting persist sau khi refresh page

**Edge Cases:**

- User đang scroll xem conversation cũ → Không auto-scroll lên đầu
- User đang gõ tin nhắn → Không làm mất focus
- Multiple messages cùng lúc → Sort stable, không flicker

**Current State:**

- File: `src/features/portal/components/ConversationList.tsx`
- Hiện tại: Dữ liệu mock, chưa có sorting logic
- Cần: Sort function + real-time reordering

---

### 3. Enhanced Input UX

#### 3.1 Shift + Enter for New Line

**Requirement:**

- **Enter** → Gửi tin nhắn (behavior hiện tại)
- **Shift + Enter** → Xuống hàng mới (thêm `\n`)

**Acceptance Criteria:**

- ✅ Enter gửi tin, Shift+Enter xuống hàng
- ✅ Textarea tự expand khi có nhiều dòng
- ✅ Max height = 5 dòng, sau đó scrollable
- ✅ Submit button vẫn hoạt động bình thường

**Current State:**

- File: `src/features/portal/components/ChatMainContainer.tsx`
- Input type: `<Input>` hoặc `<Textarea>`
- Behavior: Enter luôn submit

**Required Changes:**

- Đổi từ `<Input>` sang `<Textarea>`
- Add keydown handler: `if (e.key === 'Enter' && !e.shiftKey) { submit() }`
- Add auto-resize logic

#### 3.2 Paste Multi-line Text

**Requirement:** Khi paste text có nhiều dòng, giữ nguyên line breaks

**Acceptance Criteria:**

- ✅ Paste text từ notepad/word giữ nguyên dòng
- ✅ Textarea auto-expand để hiển thị full content
- ✅ Không trigger submit khi paste

**Current State:**

- Cần test behavior hiện tại
- Có thể đã support nếu dùng `<Textarea>`

---

### 4. Auto Focus Input After Send

**Requirement:** Sau khi gửi tin nhắn, tự động focus lại vào input để gõ tin tiếp

**Acceptance Criteria:**

- ✅ Click "Send" button → Focus input
- ✅ Press Enter → Focus input
- ✅ Cursor ở đầu input (hoặc cuối nếu có text còn lại)
- ✅ Không scroll page khi focus

**Implementation:**

```typescript
const inputRef = useRef<HTMLTextAreaElement>(null);

const handleSend = () => {
  // ... send logic
  inputRef.current?.focus();
};
```

**Current State:**

- Chưa có auto-focus
- Cần add ref và focus() call

---

## 🔌 API Requirements Summary

### ✅ Existing APIs (Đã có sẵn)

| Endpoint                       | Method | Purpose                                              | File Reference                 |
| ------------------------------ | ------ | ---------------------------------------------------- | ------------------------------ |
| `/api/conversations/{id}/read` | POST   | Mark conversation as read                            | `src/api/conversations.api.ts` |
| `/api/groups`                  | GET    | Get groups with `unreadCount` field                  | `src/api/conversations.api.ts` |
| `/api/conversations`           | GET    | Get conversations with `unreadCount` & `lastMessage` | `src/api/conversations.api.ts` |

### ❌ No New Endpoints Needed

**Kết luận:** Backend đã cung cấp đầy đủ APIs cần thiết:

- ✅ Field `unreadCount: number` trong response
- ✅ Field `lastMessage: LastMessage | null` trong response
- ✅ Endpoint `markConversationAsRead(conversationId)` để đánh dấu đã đọc
- ✅ SignalR events cho real-time updates

### SignalR Events (ĐÃ XÁC NHẬN)

| Event                 | Payload                      | Purpose                            | File Reference       |
| --------------------- | ---------------------------- | ---------------------------------- | -------------------- |
| `MessageSent`         | `MessageSentEvent`           | Real-time khi có tin nhắn mới      | `src/lib/signalr.ts` |
| `MessageRead`         | `{ conversationId, userId }` | Khi có người đọc tin nhắn          | `src/lib/signalr.ts` |
| `ConversationUpdated` | `ConversationUpdatedEvent`   | Khi conversation metadata thay đổi | `src/lib/signalr.ts` |

**✅ Confirmed:** SignalR events đã được implement trong `src/hooks/useMessageRealtime.ts`

---

## 🎨 UI/UX Requirements

### Conversation List Item Updates

**Before:**

```
[Avatar] Group Name
         Last message preview...
```

**After:**

```
[Avatar] Group Name              [Badge: 3]    ← Unread count
         Sender: Message preview...   2 phút trước
         [📎 if has attachment]
```

### Input Area Updates

**Before:**

```
[Input - single line]  [Send Button]
```

**After:**

```
[Textarea - auto-resize, max 5 lines]  [Send Button]
↑ Shift+Enter to new line
```

---

## 🧪 Testing Requirements

### Unit Tests

- [ ] Conversation sorting function
- [ ] Unread count badge logic
- [ ] Shift+Enter handler
- [ ] Auto-focus after send

### Integration Tests

- [ ] Real-time message updates conversation list
- [ ] Unread count updates when receiving messages
- [ ] Conversation reordering on new message
- [ ] Input multi-line behavior

### E2E Tests (Optional)

- [ ] Receive message from another user, see unread badge
- [ ] Click conversation, badge disappears
- [ ] Type multi-line message with Shift+Enter
- [ ] Send message, input auto-focuses

---

## 📦 Dependencies

### New Dependencies

- ❓ `react-textarea-autosize` - For auto-resizing textarea (optional)
- ❓ `framer-motion` - For smooth reordering animation (optional)

### Existing Dependencies

- ✅ `@microsoft/signalr` - Already in project
- ✅ `@tanstack/react-query` - For API calls
- ✅ Zustand - For client state

---

## 🚧 Technical Challenges

### Challenge 1: Real-time Sorting Performance

**Problem:** Reordering list on every message có thể gây lag nếu có nhiều conversations

**Solutions:**

- Option A: Debounce sorting (wait 500ms)
- Option B: Virtual scrolling (react-window)
- Option C: Only sort visible items

### Challenge 2: Unread Count Sync

**Problem:** Unread count có thể out-of-sync nếu user mở nhiều tabs

**Solutions:**

- Option A: Broadcast Channel API để sync giữa tabs
- Option B: Poll API mỗi 30s
- Option C: SignalR connection per tab

### Challenge 3: Scroll Position

**Problem:** Khi conversation reorder, scroll position có thể bị mất

**Solutions:**

- Option A: Lock scroll position khi có update
- Option B: Only reorder if user ở top của list
- Option C: Show "New messages" indicator thay vì auto-reorder

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:

- `src/hooks/queries/useConversationUnread.ts` - Query hook for unread count
- `src/hooks/mutations/useMarkAsRead.ts` - Mutation hook to mark as read
- `src/utils/conversationSort.ts` - Sorting logic
- `src/components/ui/UnreadBadge.tsx` - Unread count badge component
- `tests/chat/conversation-sorting.test.ts` - Unit tests for sorting
- `tests/chat/unread-badge.test.ts` - Unit tests for badge

### Files sẽ sửa đổi:

- `src/features/portal/components/ConversationList.tsx`
  - Add SignalR listener for new messages
  - Implement sorting logic
  - Add UnreadBadge component
  - Update latest message display
- `src/features/portal/components/ChatMainContainer.tsx` (hoặc file chứa input)

  - Change `<Input>` to `<Textarea>`
  - Add Shift+Enter handler
  - Add auto-focus ref
  - Implement auto-resize

- `src/types/conversations.ts`

  - Add `unreadCount?: number` field
  - Add `lastMessage?: Message` field

- `src/api/conversations.api.ts`
  - Add `getUnreadCount(conversationId)`
  - Add `markAsRead(conversationId)`

### Files sẽ xoá:

---

## 📋 PHASE 2: UI ENHANCEMENTS (Added 2026-01-07)

### 4. Message Input Auto-Grow

**Requirement:** Textarea input cho tin nhắn tự động tăng chiều cao theo nội dung

**Rules:**

- Initial height: 1 dòng (single line)
- Auto-grow khi user nhập nhiều dòng
- Maximum height: **5 dòng** (khoảng 120px)
- Sau 5 dòng: Hiện scrollbar (overflow-y: auto)
- Shift+Enter: Xuống dòng mới (giữ nguyên)
- Enter (không Shift): Gửi tin nhắn (giữ nguyên)

**Acceptance Criteria:**

- ✅ Textarea height tự động theo content (1-5 dòng)
- ✅ Scrollbar CHỈ xuất hiện sau 5 dòng
- ✅ Smooth transition khi height thay đổi
- ✅ Không làm layout jump (smooth expand/collapse)

**Current State:**

- File: `src/features/portal/components/ChatMainContainer.tsx`
- Hiện tại: Fixed height textarea với scrollbar xuất hiện quá sớm

**Required Changes:**

- Dùng `react-textarea-autosize` library (hoặc custom solution)
- Set `maxRows={5}` và `minRows={1}`
- Adjust CSS để scrollbar chỉ xuất hiện khi > 5 rows

---

### 5. Auto-Focus Input on Conversation Switch

**Requirement:** Tự động focus vào message input khi user chọn conversation khác

**Rules:**

- Khi user click vào conversation item → auto focus input
- Áp dụng cho cả desktop và mobile
- Không auto-focus khi component mount lần đầu (chỉ khi switch)

**Acceptance Criteria:**

- ✅ Focus vào input ngay sau khi chọn conversation
- ✅ Cursor sẵn sàng nhập tin nhắn (không cần click)
- ✅ Không focus khi mới load trang

**Current State:**

- User phải click vào input thủ công sau khi chọn conversation

**Required Changes:**

- Add `useEffect` hook lắng nghe `conversationId` change
- Call `inputRef.current?.focus()` khi `conversationId` thay đổi
- Thêm điều kiện: Chỉ focus nếu không phải lần đầu render

---

### 6. Fix Conversation Item Border Hover

**Requirement:** Sửa visual issue với border khi hover conversation item

**Problem:**

- Hiện tại: Border của conversation item bị container border che mất khi hover
- Hoặc: Border xuất hiện nhưng không smooth

**Options:**

1. **Bỏ border khi hover** (đơn giản nhất)
2. **Giữ border nhưng adjust z-index** để không bị che
3. **Dùng background color thay border**

**Acceptance Criteria:**

- ✅ Hover effect rõ ràng, không bị che
- ✅ Không làm item jump khi hover
- ✅ Consistent design với các UI element khác

**Current State:**

- File: `src/features/portal/components/ConversationItem.tsx`
- Border bị parent container border che mất

**Required Changes:**

- TBD: Tùy vào HUMAN chọn option nào (Decision #9)

---

### 7. Reposition Unread Count Badge

**Requirement:** Di chuyển unread count badge xuống dưới message preview

**Current Layout:**

```
┌─────────────────────────────────┐
│ Avatar  Name          [Badge] 2m│  <-- Badge chung hàng với time
│         Message preview...       │
└─────────────────────────────────┘
```

**New Layout:**

```
┌─────────────────────────────────┐
│ Avatar  Name                  2m│  <-- Time riêng 1 hàng
│         Message preview... [Badge]│  <-- Badge chung hàng với message
└─────────────────────────────────┘
```

**Acceptance Criteria:**

- ✅ Badge nằm ở cuối message preview line
- ✅ Time nằm ở góc phải trên cùng
- ✅ Không làm layout shift khi badge xuất hiện/biến mất
- ✅ Responsive trên mobile (không bị overflow)

**Current State:**

- File: `src/features/portal/components/ConversationItem.tsx`
- Badge và time cùng nằm trên row đầu tiên

**Required Changes:**

- Restructure layout: Badge move từ top row sang bottom row
- Adjust CSS grid/flex để badge align-right ở message preview row
- Test overflow cases (long message + badge)

---

## 📋 IMPACT SUMMARY (Phase 2)

### Files sẽ sửa đổi:

1. **`src/features/portal/components/ChatMainContainer.tsx`**

   - Add auto-grow textarea (maxRows={5})
   - Add auto-focus effect khi conversationId change
   - Dependencies: `react-textarea-autosize` hoặc custom hook

2. **`src/features/portal/components/ConversationItem.tsx`**

   - Fix border hover issue (remove hoặc adjust z-index)
   - Reposition unread badge: từ top row → bottom row
   - Adjust layout grid/flex

3. **`package.json`** (nếu dùng library)
   - Thêm `react-textarea-autosize@^8.5.0`

### Files sẽ tạo mới:

- **`src/hooks/useAutoGrowTextarea.ts`** (nếu dùng custom solution thay vì library)
- **`src/hooks/__tests__/useAutoGrowTextarea.test.ts`**

### Files sẽ xoá:

- (Không có)

### Dependencies sẽ thêm:

- `react-textarea-autosize@^8.5.0` (option 1)
- Hoặc: Custom implementation (option 2)

---

## ⏳ PENDING DECISIONS (Phase 2)

| #   | Vấn đề                      | Lựa chọn                                                                    | HUMAN Decision                                                                          |
| --- | --------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 9   | Auto-grow implementation    | `react-textarea-autosize` library vs Custom hook?                           | ⬜ **react-textarea-autosize**                                                          |
| 10  | Max textarea rows           | 5 rows (khuyến nghị) hay 3/7/10 rows?                                       | ⬜ **5 rows**                                                                           |
| 11  | Auto-focus timing           | Immediate vs Delay 100ms (để UX mượt hơn)?                                  | ⬜ **Immediate**                                                                        |
| 12  | Conversation item hover fix | (A) Bỏ border, (B) Adjust z-index, hay (C) Background color thay vì border? | ⬜ **Background color thay vì border nhưng màu cần nhạt hơn màu background lúc active** |
| 13  | Badge position animation    | Smooth transition (CSS transition) hay instant move?                        | ⬜ **mục này không cần thiết. Để badge nằm phía dưới thời gian là được**                |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code Phase 2 nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION (Phase 1)

| Hạng mục                        | Status       |
| ------------------------------- | ------------ |
| Đã review Impact Summary        | ✅ Đã review |
| Đã điền Pending Decisions       | ✅ Đã điền   |
| **APPROVED để tiếp tục BƯỚC 2** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

---

## ✅ HUMAN CONFIRMATION (Phase 2)

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review Phase 2 Requirements    | ✅ Đã review |
| Đã review Impact Summary Phase 2  | ✅ Đã review |
| **APPROVED để implement Phase 2** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

_Last updated: 2026-01-07_
