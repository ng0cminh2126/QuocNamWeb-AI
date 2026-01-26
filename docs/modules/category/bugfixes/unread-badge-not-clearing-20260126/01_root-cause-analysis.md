# Root Cause Analysis: Unread Badge Không Cập Nhật

> **Bug ID:** CBN-UNREAD-001  
> **Date:** 2026-01-26  
> **Analyst:** AI Assistant

---

## 📋 Symptom Description

**Observed Behavior:**

1. User admin đang xem category B, conversation Group2
2. Nhận tin nhắn mới từ category A, conversation Group
3. ✅ Unread badge hiện lên trên category A (đúng)
4. User click vào category A
5. ❌ **BUG:** Unread badge KHÔNG biến mất (sai - expected là badge phải clear)

**Expected Behavior:**

- Click vào category → unread count reset về 0 → badge biến mất

---

## 🔄 Data Flow Analysis

### Current Flow (Có Bug)

```
1. MessageSent event
   ↓
   useCategoriesRealtime (line 117-143)
   ↓
   Update categoriesKeys.list() → unreadCount++
   ↓
   ✅ Badge hiện lên

2. User clicks category
   ↓
   ConversationListSidebar.onClick (line 699-720)
   ↓
   handleGroupSelect(conversationId, ...)
   ↓
   onSelectChat({ type: "group", id, ... })
   ↓
   ChatMainContainer receives new conversationId
   ↓
   useEffect (line 373-393) - CHỈ chạy khi conversationId THAY ĐỔI
   ↓
   markAsReadMutation.mutate({ conversationId })
   ↓
   useMarkConversationAsRead.onMutate (line 48-92)
   ↓
   ❌ CHỈ update conversationKeys.groups() và .directs()
   ❌ KHÔNG update categoriesKeys.list()
   ↓
   ❌ Badge vẫn hiển thị count cũ vì đọc data từ categoriesKeys.list()
```

### Vấn đề chính:

| Component                     | What It Does                              | Problem                                     |
| ----------------------------- | ----------------------------------------- | ------------------------------------------- |
| `ConversationListSidebar.tsx` | Hiển thị badge từ `categoriesKeys.list()` | ✅ OK - đúng data source                    |
| `useMarkConversationAsRead`   | Optimistic update `conversationKeys` only | ❌ **KHÔNG update categoriesKeys.list()**   |
| `ChatMainContainer` effect    | Gọi mark as read khi switch conversation  | ⚠️ KHÔNG chạy nếu conversationId không đổi  |
| API call                      | `POST /api/conversations/{id}/mark-read`  | ❌ **KHÔNG được gọi** (was optimistic only) |
| Backend SignalR event         | `MessageRead` event để sync cross-device  | ❌ **Backend không emit** (cần verify)      |

---

## 🐛 Root Causes

### Cause 1: Cache Mismatch (Primary)

**File:** `src/hooks/mutations/useMarkConversationAsRead.ts` (line 48-92)

**Problem:**

```typescript
// ❌ WRONG: Chỉ update conversationKeys
queryClient.setQueryData(conversationKeys.groups(), ...);
queryClient.setQueryData(conversationKeys.directs(), ...);

// ❌ MISSING: Không update categoriesKeys
// queryClient.setQueryData(categoriesKeys.list(), ...); // <-- THIẾU!
```

**Impact:**

- Category badge đọc data từ `categoriesKeys.list()`
- Khi mark as read chỉ update `conversationKeys` → badge không nhận được update

**Why This Happened:**

- `useMarkConversationAsRead` được tạo trước khi có `categoriesKeys`
- Lúc đầu chỉ có `conversationKeys.groups()` và `.directs()`
- Sau khi thêm categories API, dev quên update mutation hook

---

### Cause 2: No API Call (Secondary)

**File:** `src/hooks/mutations/useMarkConversationAsRead.ts` (line 40-43)

**Problem:**

```typescript
mutationFn: async ({ conversationId }: MarkAsReadVariables) => {
  // ❌ WRONG: No API call - just optimistic update
  return Promise.resolve();
},
```

**Impact:**

- Backend không biết user đã đọc conversation
- Reload page → unread count quay lại giá trị cũ (from server)
- Cross-device sync không hoạt động

**Why This Happened:**

- API chưa có sẵn khi implement mutation hook
- Dev dùng optimistic-only approach tạm thời
- Sau khi API ready, dev quên integrate

---

### Cause 3: Missing SignalR Event (Tertiary - Needs Verification)

**File:** Backend code (outside frontend scope)

**Problem:**

- Backend **MAY NOT** emit `MessageRead` event sau khi API success
- Frontend `useCategoriesRealtime` đã có listener (line 188-220) nhưng không nhận event

**Impact:**

- Cross-tab sync không hoạt động
- Khi user mark as read trên tab A → tab B vẫn hiện badge

**Expected Backend Behavior:**

```csharp
// After marking conversation as read
await _hubContext.Clients.Group(conversationId).SendAsync("MessageRead", new {
    conversationId,
    userId,
    markedAt = DateTime.UtcNow
});
```

**Verification Needed:**

- Check backend code `ConversationController.MarkAsRead`
- Check SignalR hub implementation

---

## 🔬 Evidence

### Evidence 1: Code Inspection

**File:** [src/hooks/mutations/useMarkConversationAsRead.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/hooks/mutations/useMarkConversationAsRead.ts#L48-L92)

```typescript
// Line 48-92: onMutate callback
onMutate: async ({ conversationId }) => {
  // ...

  // Update groups ✅
  queryClient.setQueryData(conversationKeys.groups(), ...);

  // Update directs ✅
  queryClient.setQueryData(conversationKeys.directs(), ...);

  // ❌ MISSING: categoriesKeys.list() update

  return { previousGroups, previousDirects }; // No previousCategories!
},
```

### Evidence 2: Badge Rendering Code

**File:** [src/features/portal/workspace/ConversationListSidebar.tsx](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/features/portal/workspace/ConversationListSidebar.tsx#L775-L793)

```typescript
// Line 775: Calculate totalUnread from category.conversations
const totalUnread = category.conversations?.reduce(
  (sum, conv) => sum + (conv.unreadCount || 0),
  0,
) || 0;

// Line 788: Display badge if totalUnread > 0
{totalUnread > 0 && (
  <span data-testid={`category-unread-badge-${category.id}`}>
    {totalUnread > 99 ? "99+" : totalUnread}
  </span>
)}
```

**Analysis:**

- Badge reads `category.conversations[].unreadCount`
- This data comes from `categoriesQuery.data` (line 161)
- Which uses `categoriesKeys.list()` (line 46)
- **BUT** `useMarkConversationAsRead` doesn't update this key!

### Evidence 3: Real-time Update Working

**File:** [src/hooks/useCategoriesRealtime.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/hooks/useCategoriesRealtime.ts#L117-143)

```typescript
// Line 117-143: MessageSent event handler
queryClient.setQueryData<CategoryWithUnread[]>(
  categoriesKeys.list(), // ✅ Updates categories correctly
  (oldData) => {
    // ...
    return updatedData; // ✅ Badge updates immediately
  },
);
```

**Analysis:**

- Real-time updates **DO** update `categoriesKeys.list()` ✅
- Badge appears immediately when new message arrives ✅
- **Proof that categories cache is the correct data source**
- **Proof that useMarkConversationAsRead should also update it**

---

## 📊 Impact Assessment

### User Impact

| Severity  | Description                                                      | Frequency  |
| --------- | ---------------------------------------------------------------- | ---------- |
| 🔴 High   | User không biết đã đọc hay chưa → confusion                      | Every time |
| 🟡 Medium | Badge không clear → user click lại nhiều lần                     | Often      |
| 🟡 Medium | Phải reload page để clear badge → poor UX                        | Sometimes  |
| 🟢 Low    | Cross-device sync không hoạt động (nếu backend không emit event) | Rare       |

### Business Impact

- **Usability:** ⬇️ Reduced user experience
- **Trust:** ⬇️ Users lose trust in notification system
- **Support Load:** ⬆️ More support tickets about "badge not clearing"

---

## ✅ Proposed Fix

See [02_api-contract.md](../../api/chat/mark-as-read/contract.md) for API details.

### Fix Level 1: Update Categories Cache (Essential)

```typescript
// In useMarkConversationAsRead.ts
onMutate: async ({ conversationId }) => {
  // ... existing code ...

  // 🆕 ADD: Update categories
  const previousCategories = queryClient.getQueryData<CategoryWithUnread[]>(
    categoriesKeys.list(),
  );

  if (previousCategories) {
    queryClient.setQueryData<CategoryWithUnread[]>(
      categoriesKeys.list(),
      previousCategories.map((category) => ({
        ...category,
        conversations: category.conversations.map((conv) =>
          conv.conversationId === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv,
        ),
      })),
    );
  }

  return { previousGroups, previousDirects, previousCategories };
};
```

### Fix Level 2: Add API Call (Essential)

```typescript
// In conversations.api.ts
export const markConversationAsRead = async (
  conversationId: string,
  messageId?: string
): Promise<void> => {
  const body = messageId ? { messageId } : {};
  await apiClient.post(`/api/conversations/${conversationId}/mark-read`, body);
};

// In useMarkConversationAsRead.ts
mutationFn: async ({ conversationId }) => {
  await markConversationAsReadApi(conversationId); // 🆕 Call API
},
```

### Fix Level 3: Backend Event (Optional - Depends on Backend)

Request backend team to emit `MessageRead` event:

```csharp
// In ConversationController.cs (backend)
[HttpPost("{id}/mark-read")]
public async Task<IActionResult> MarkAsRead(Guid id, [FromBody] MarkAsReadRequest request)
{
    // ... mark as read logic ...

    // 🆕 ADD: Emit SignalR event
    await _hubContext.Clients.Group(id.ToString()).SendAsync("MessageRead", new
    {
        conversationId = id,
        userId = CurrentUserId,
        markedAt = DateTime.UtcNow
    });

    return Ok();
}
```

---

## 🧪 Verification Plan

After implementing fix:

### Test Case 1: Basic Flow

1. ✅ Login as admin
2. ✅ Go to category B, conversation Group2
3. ✅ Send message from another account to category A, Group
4. ✅ Verify badge appears on category A
5. ✅ Click category A
6. ✅ **EXPECT:** Badge disappears immediately
7. ✅ Reload page
8. ✅ **EXPECT:** Badge still gone (API persisted state)

### Test Case 2: Cross-Tab Sync (If backend emits event)

1. ✅ Open app in 2 tabs
2. ✅ Tab A: Mark conversation as read
3. ✅ **EXPECT:** Tab B badge also clears

### Test Case 3: Error Handling

1. ✅ Disconnect network
2. ✅ Click conversation
3. ✅ **EXPECT:** Badge clears optimistically
4. ✅ Wait for API timeout
5. ✅ **EXPECT:** Badge reappears (rollback)
6. ✅ Reconnect network
7. ✅ Click again
8. ✅ **EXPECT:** Badge clears and persists

---

## 📚 References

- Swagger API: [POST /api/conversations/{id}/mark-read](https://vega-chat-api-dev.allianceitsc.com/swagger/index.html)
- API Contract: [docs/api/chat/mark-as-read/contract.md](../../api/chat/mark-as-read/contract.md)
- Code Files:
  - [useMarkConversationAsRead.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/hooks/mutations/useMarkConversationAsRead.ts)
  - [ConversationListSidebar.tsx](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/features/portal/workspace/ConversationListSidebar.tsx)
  - [useCategoriesRealtime.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/hooks/useCategoriesRealtime.ts)
