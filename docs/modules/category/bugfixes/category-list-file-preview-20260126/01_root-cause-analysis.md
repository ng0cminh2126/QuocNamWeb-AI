# Root Cause Analysis: Category List File/Image Preview

> **Bug ID:** CBN-PREVIEW-001  
> **Analysis Date:** 2026-01-26  
> **Analyst:** AI Assistant  
> **Status:** ✅ ANALYSIS COMPLETE

---

## 🎯 Bug Reproduction

### Steps to Reproduce:

1. Login to app
2. Open category A
3. Send message with file/image attachment
4. Look at category list sidebar
5. **OBSERVE:** Category shows `[username]: ...`
6. Reload page (F5)
7. **OBSERVE:** Category now shows `[username]: Đã gửi 1 ảnh` (correct)

### Expected vs Actual:

| Scenario           | Expected                      | Actual (Before Reload) | Actual (After Reload)            |
| ------------------ | ----------------------------- | ---------------------- | -------------------------------- |
| Gửi 1 ảnh          | `John: Đã gửi 1 ảnh`          | `John: ...`            | `John: Đã gửi 1 ảnh` ✅          |
| Gửi 3 ảnh          | `Jane: Đã gửi 3 ảnh`          | `Jane: ...`            | `Jane: Đã gửi 3 ảnh` ✅          |
| Gửi 1 file         | `Mike: Đã gửi tệp report.pdf` | `Mike: ...`            | `Mike: Đã gửi tệp report.pdf` ✅ |
| Gửi 2 file         | `Anna: Đã gửi 2 tệp`          | `Anna: ...`            | `Anna: Đã gửi 2 tệp` ✅          |
| Gửi 1 ảnh + 1 file | `Bob: Đã gửi 2 tệp đính kèm`  | `Bob: ...`             | `Bob: Đã gửi 2 tệp đính kèm` ✅  |

---

## 🔍 Investigation

### 1. Code Flow Analysis

**Current Flow (Real-time Update):**

```
User sends message with attachment
  ↓
SignalR MessageSent event emitted
  ↓
useCategoriesRealtime.onMessageSent handler
  ↓
Updates categoriesKeys cache with new lastMessage
  ↓
ConversationListSidebar re-renders
  ↓
Calls formatMessagePreview(lastMessage)
  ↓
formatMessagePreview checks lastMessage.attachments
  ↓
❌ lastMessage.attachments = undefined (not provided by event)
  ↓
Falls back to Case 2: text only
  ↓
content = "" → Returns "[username]: ..."
```

**After Page Reload Flow:**

```
Page loads
  ↓
useCategories() fetches from API
  ↓
GET /api/categories returns full data
  ↓
LastMessageDto includes attachments field ✅
  ↓
formatMessagePreview(lastMessage) with attachments
  ↓
Returns correct format: "[username]: Đã gửi 1 ảnh"
```

### 2. Code Inspection

**File:** `src/utils/formatMessagePreview.ts`

```typescript
export function formatMessagePreview(
  message: LastMessageDto & { attachments?: any[] },
): string {
  const { senderName, content, attachments } = message;

  // Case 1: Has attachments
  if (attachments && attachments.length > 0) {
    // ... correct formatting logic
  }

  // Case 2: No attachments - text only or empty
  return content && content.trim().length > 0
    ? `${senderName}: ${content}`
    : `${senderName}: ...`; // ❌ Falls here when attachments missing
}
```

**File:** `src/types/categories.ts`

```typescript
export interface LastMessageDto {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  attachments?: Array<{
    // ✅ Type includes attachments
    type: "image" | "file" | string;
    name?: string;
    fileName?: string;
    contentType?: string;
  }>;
}
```

**File:** `src/hooks/useCategoriesRealtime.ts` (need to check)

---

## 🎯 Root Causes

### Root Cause 1: Frontend Không Extract Attachments từ SignalR Event ✅ VERIFIED

**Location:** `src/hooks/useCategoriesRealtime.ts` line 122

**Issue:** Backend **ĐÃ GỬI** đầy đủ `attachments` field trong MessageSent event, nhưng frontend code chỉ destructure 6 fields và **bỏ qua attachments**.

**Evidence:**

```typescript
// Line 122 - useCategoriesRealtime.ts
const { conversationId, senderId, id, senderName, content, sentAt } = message;
//                                                                    ❌ Missing: attachments

// Backend đã gửi:
{
  message: {
    id: "msg-789",
    conversationId: "abc-123",
    senderId: "user-456",
    senderName: "John",
    content: "",
    sentAt: "2026-01-26T10:30:00Z",
    attachments: [...]  // ✅ BACKEND GỬI RỒI!
  }
}
```

**Why it causes the bug:**

- Code chỉ extract 6 fields, không extract `attachments`
- `lastMessage` được update vào cache **không có attachments**
- `formatMessagePreview()` checks `attachments` field → undefined
- Falls back to text-only logic → returns `"[username]: ..."`

### Root Cause 2: LastMessage Object Không Include Attachments Field ✅ VERIFIED

**Location:** `src/hooks/useCategoriesRealtime.ts` lines 145-152

**Issue:** Code tạo `lastMessage` object chỉ với 5 fields, không include `attachments` mặc dù đã có data từ event.

**Evidence:**

```typescript
// Lines 145-152 - useCategoriesRealtime.ts
return {
  ...conv,
  lastMessage: {
    messageId: id,
    senderId,
    senderName,
    content,
    sentAt,
    // ❌ THIẾU: attachments (mặc dù message.attachments có data!)
  },
  unreadCount: newUnreadCount,
};
```

**Why it causes the bug:**

- `lastMessage` được tạo **không có attachments field**
- Cache updated với incomplete data này
- UI renders với lastMessage thiếu attachments
- `formatMessagePreview()` không thấy attachments → shows "..."

### ~~Root Cause 3: No Fallback~~ ❌ NOT APPLICABLE

**Status:** KHÔNG CẦN - Backend đã gửi đầy đủ data rồi.

**Conclusion:** Chỉ cần fix Root Cause 1 và 2 (frontend extract và update attachments field).

---

## 💡 Possible Solutions

### Solution 1: Backend Includes Attachments in SignalR Event (RECOMMENDED)

**Approach:** Yêu cầu backend team thêm `attachments` field vào MessageSent event payload.

**Pros:**

- ✅ Simplest solution
- ✅ No frontend code changes needed
- ✅ Consistent with API response structure

**Cons:**

- ⏳ Requires backend deployment
- 📡 Slightly larger event payload

**Backend Change Required:**

```csharp
// In MessageHub or similar
await Clients.Group(conversationId.ToString()).SendAsync("MessageSent", new
{
    conversationId = message.ConversationId,
    userId = message.SenderId,
    lastMessage = new
    {
        messageId = message.Id,
        senderId = message.SenderId,
        senderName = message.Sender.DisplayName,
        content = message.Content,
        sentAt = message.Timestamp,
        attachments = message.Attachments.Select(a => new  // 🆕 ADD THIS
        {
            type = a.Type, // "image" or "file"
            name = a.FileName,
            fileName = a.FileName,
            contentType = a.ContentType
        }).ToArray()
    }
});
```

---

### Solution 2: Frontend Refetch Message After Real-time Event

**Approach:** Khi nhận MessageSent event, trigger API call để fetch full message data.

**Pros:**

- ✅ No backend changes needed
- ✅ Always gets complete data

**Cons:**

- ❌ Extra API call overhead
- ❌ Brief delay before showing correct preview
- ❌ More complex code

**Implementation:**

```typescript
const handleMessageSent = async (data: any) => {
  // 1. Update cache với data hiện có
  queryClient.setQueryData(categoriesKeys.list(), ...);

  // 2. Refetch complete message data
  const fullMessage = await getMessageById(data.lastMessage.messageId);

  // 3. Update lại cache với complete data
  queryClient.setQueryData(categoriesKeys.list(), (oldData) => {
    // Update với fullMessage có attachments
  });
};
```

---

### Solution 3: Use Message Type Field (If Available)

**Approach:** Nếu backend gửi `type` field (TXT, IMG, FILE), dùng để format preview.

**Pros:**

- ✅ Lightweight (không cần full attachments array)
- ✅ Works without attachments data

**Cons:**

- ❌ Cannot show exact filename for single file
- ❌ Cannot distinguish between 1 vs multiple files
- ❌ Less detailed preview

**Implementation:**

```typescript
export function formatMessagePreview(message: LastMessageDto): string {
  const { senderName, content, type, attachments } = message;

  // Try attachments first (if available)
  if (attachments && attachments.length > 0) {
    // ... existing logic
  }

  // Fallback: use type field
  if (type === "IMG") {
    return `${senderName}: đã gửi ảnh`;
  }
  if (type === "FILE") {
    return `${senderName}: đã gửi tệp`;
  }

  // Text message
  return content ? `${senderName}: ${content}` : `${senderName}: ...`;
}
```

---

## 📋 PENDING DECISIONS (Chờ HUMAN quyết định)

| #   | Vấn đề                          | Lựa chọn                                 | HUMAN Decision |
| --- | ------------------------------- | ---------------------------------------- | -------------- |
| 1   | Solution approach               | Backend event / Frontend refetch / Type  | ⬜ **\_\_\_**  |
| 2   | Backend team availability       | Có thể request backend change?           | ⬜ **\_\_\_**  |
| 3   | Performance priority            | Prioritize speed or accuracy?            | ⬜ **\_\_\_**  |
| 4   | Fallback behavior               | Show "..." or generic "đã gửi tệp"?      | ⬜ **\_\_\_**  |
| 5   | Message type field availability | Backend có gửi `type` field trong event? | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review Root Causes     | ⬜ Chưa review   |
| Đã điền Pending Decisions | ⬜ Chưa điền     |
| **APPROVED để tạo Plan**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [Chờ duyệt]  
**Date:** \***\*\_\_\_\*\***

> ⚠️ **CRITICAL: AI sẽ tạo implementation plan sau khi section này được approve**

---

## 🔗 Next Steps

1. ⏳ **HUMAN review analysis** - Xác nhận root causes đúng
2. ⏳ **HUMAN fill decisions** - Chọn solution approach
3. ⏳ **Create implementation plan** - Based on chosen solution
4. ⏳ **Backend coordination** - If Solution 1 chosen
5. ⏳ **Frontend implementation** - Based on approved plan

---

## 📚 References

- API Structure: [Categories API Contract](../../api/categories/contract.md)
- Related Code: [formatMessagePreview.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/utils/formatMessagePreview.ts)
- Real-time Docs: [Category Realtime Update](../../features/realtime-update/)
