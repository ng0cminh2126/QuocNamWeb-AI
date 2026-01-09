# Realtime Debug Checklist

## ✅ ĐÃ FIX

### 1. ❌ Border khi hover conversation item

- **File:** `ConversationItem.tsx`
- **Fix:** Đổi `hover:bg-gray-100` → `hover:bg-gray-50`
- **Status:** ✅ FIXED

### 2. ❌ Multi-line không xuống dòng (Shift+Enter)

- **File:** `ChatInput.tsx`
- **Fix:** Thêm logic allow Shift+Enter pass through
- **Code:**
  ```typescript
  // Shift+Enter: Xuống dòng (default behavior)
  if (e.key === "Enter" && e.shiftKey) {
    return; // Let browser handle newline
  }
  ```
- **Status:** ✅ FIXED

### 3. ❌ Import path error

- **File:** `useMarkConversationAsRead.ts`
- **Fix:** `"./queries/keys/conversationKeys"` → `"@/hooks/queries/keys/conversationKeys"`
- **Status:** ✅ FIXED

---

## ⏳ CẦN KIỂM TRA - Realtime Updates

### Vấn đề: Không thấy realtime updates (tin mới nhất, thời gian, sort lại)

### Root Causes có thể:

#### A. SignalR chưa kết nối

**Cách kiểm tra:**

1. Mở DevTools Console
2. Gõ: `window.chatHub?.state`
3. Kỳ vọng: `"Connected"`
4. Nếu không:
   - Check backend đang chạy
   - Check env `VITE_SIGNALR_HUB_URL` đúng chưa
   - Xem logs có lỗi connection không

#### B. SignalR events không fire

**Cách kiểm tra:**

1. Thêm log vào `useConversationRealtime.ts`:
   ```typescript
   const handleMessageSent = useCallback((event: MessageSentEvent) => {
     console.log("🔔 MessageSent event:", event); // ADD THIS
     // ... existing code
   }, []);
   ```
2. Gửi tin nhắn từ browser khác (hoặc Postman)
3. Xem console có log không

**Nếu KHÔNG có log:**

- Backend không emit event `MessageSent`
- Hoặc event name sai (check backend code)
- Hoặc SignalR connection bị disconnect

#### C. Query cache không có data

**Cách kiểm tra:**

1. Mở React DevTools → Components
2. Tìm component `ConversationListSidebar`
3. Check hooks:
   - `groupsQuery.data` có array không?
   - `directsQuery.data` có array không?
4. Nếu `undefined`:
   - API chưa load xong
   - Hoặc API call lỗi (check Network tab)

#### D. Sorting không trigger re-render

**Cách kiểm tra:**

1. Thêm log vào `ConversationListSidebar.tsx`:
   ```typescript
   const filteredApiGroups = sortConversationsByLatest(
     apiGroups.filter(...)
   );
   console.log('🔄 Sorted groups:', filteredApiGroups.map(g => ({
     id: g.id,
     name: g.name,
     lastMessageTime: g.lastMessage?.sentAt
   })));
   ```
2. Gửi tin nhắn mới
3. Xem console có log mới không
4. Check thứ tự có thay đổi không

**Nếu log CÓ nhưng UI KHÔNG đổi:**

- React không re-render (cache reference giống nhau)
- Component bị memoized ở đâu đó
- Hoặc query staleTime quá cao

#### E. Active conversation ID không đúng

**Cách kiểm tra:**

1. Log trong `ConversationListSidebar.tsx`:
   ```typescript
   console.log("🎯 Active conversation:", selectedConversationId);
   ```
2. Mở conversation
3. Xem log có đúng ID không

**Nếu `undefined` hoặc sai:**

- Prop `selectedConversationId` không được truyền xuống
- Hoặc parent component không update state

---

## 🔧 QUICK FIXES

### Fix 1: Force query refetch sau khi nhận event

**File:** `useConversationRealtime.ts` (lines ~107-110)

```typescript
queryClient.setQueryData(conversationKeys.groups(), {
  ...groupsData,
  pages: updatedPages,
});

// ADD THIS: Force refetch để trigger re-render
queryClient.invalidateQueries({
  queryKey: conversationKeys.groups(),
});
```

### Fix 2: Add debug logs (temporary)

**File:** `useConversationRealtime.ts` (line ~65)

```typescript
const handleMessageSent = useCallback(
  (event: MessageSentEvent) => {
    console.log("🔔 [Realtime] MessageSent:", {
      conversationId: event.conversationId,
      content: event.message.content,
      isActive: activeConversationId === event.conversationId,
    });

    // ... existing code
  },
  [activeConversationId, onNewMessage, queryClient]
);
```

### Fix 3: Ensure SignalR auto-reconnect

**File:** `src/lib/signalr.ts` (check constructor)

```typescript
withAutomaticReconnect({
  nextRetryDelayInMilliseconds: (retryContext) => {
    // Exponential backoff: 0s, 2s, 10s, 30s
    if (retryContext.previousRetryCount === 0) return 0;
    if (retryContext.previousRetryCount < 3) return 2000;
    if (retryContext.previousRetryCount < 5) return 10000;
    return 30000;
  },
});
```

---

## 🧪 TEST STEPS

### Manual Testing Workflow:

1. **Setup:**

   - Mở 2 browser windows (Chrome + Firefox)
   - Login với 2 users khác nhau
   - Join cùng 1 conversation

2. **Test Realtime Message:**

   - Browser A: Gửi tin "Test 1"
   - Browser B: Kiểm tra:
     - [ ] Conversation move lên đầu
     - [ ] lastMessage hiển thị "Test 1"
     - [ ] Time update (e.g. "Vừa xong")
     - [ ] Unread badge tăng (nếu không active)

3. **Test Sort Order:**

   - Browser A: Gửi tin vào Conversation X
   - Browser B: Check Conversation X lên đầu list

4. **Test Active Conversation:**

   - Browser B: Mở Conversation X
   - Browser A: Gửi tin vào Conversation X
   - Browser B: Check unread count = 0 (không tăng)

5. **Test Multi-line Input:**
   - Nhập text
   - Nhấn Shift+Enter
   - Kiểm tra: [ ] Cursor xuống dòng (KHÔNG gửi)
   - Nhập thêm text dòng 2
   - Nhấn Enter (không Shift)
   - Kiểm tra: [ ] Tin được gửi (2 dòng)

---

## 📊 EXPECTED BEHAVIOR

### ✅ Correct Flow:

```
1. User B gửi tin nhắn
   ↓
2. Backend emit SignalR event 'MessageSent'
   ↓
3. User A's browser nhận event
   ↓
4. useConversationRealtime.handleMessageSent() runs
   ↓
5. Update conversation cache (lastMessage, unreadCount)
   ↓
6. queryClient.setQueryData() triggers re-render
   ↓
7. sortConversationsByLatest() sorts conversations
   ↓
8. ConversationListSidebar re-renders with new order
   ↓
9. User A thấy conversation mới lên đầu ✅
```

### ❌ Hiện tại (nếu không work):

```
1-3: OK (SignalR nhận event)
4: ??? (event handler có chạy không?)
5: ??? (cache có update không?)
6: ??? (React có re-render không?)
7: OK (sorting logic correct)
8-9: FAIL (UI không update)
```

---

## 🎯 NEXT ACTIONS

### Cho AI:

- [ ] Add debug logs vào `useConversationRealtime.ts`
- [ ] Add `invalidateQueries` sau `setQueryData`
- [ ] Verify SignalR event names match backend

### Cho HUMAN:

- [ ] Check console logs khi gửi tin
- [ ] Verify backend đang emit events
- [ ] Test với 2 browsers
- [ ] Report kết quả debugging

---

**Created:** 2026-01-07  
**Status:** ⏳ PENDING VERIFICATION
