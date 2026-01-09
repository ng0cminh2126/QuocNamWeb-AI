# REALTIME CRITICAL FIXES - 2026-01-07

## 🚨 VẤN ĐỀ BÁO CÁO

User: "chưa thấy realtime gì luôn. Tui gửi tin nhắn vào group, tin nhắn đã gửi nhưng bên conversation list vẫn chưa thấy tin nhắn mới, thứ tự cũng không đổi luôn."

---

## 🔍 NGUYÊN NHÂN GỐC RỄ

### 1. ❌ Race Condition: invalidateQueries ngay sau setQueryData

**File:** `useConversationRealtime.ts`

**Vấn đề:**

```typescript
// WRONG CODE (CŨ)
queryClient.setQueryData(conversationKeys.groups(), {
  ...groupsData,
  pages: updatedPages,
});

// ❌ NGUY HIỂM: invalidateQueries ngay sau setQueryData
queryClient.invalidateQueries({
  queryKey: conversationKeys.groups(),
});
```

**Tại sao sai:**

1. `setQueryData` update cache với data mới (lastMessage, unreadCount)
2. `invalidateQueries` NGAY SAU ĐÓ trigger refetch từ server
3. Server response (data cũ) **override** data vừa set!
4. Kết quả: UI không update

**Fix:**

```typescript
// ✅ FIXED: Bỏ invalidateQueries
queryClient.setQueryData(conversationKeys.groups(), {
  ...groupsData,
  pages: updatedPages,
});

console.log("✅ [Realtime] Updated groups cache for:", conversationId);
```

---

### 2. ❌ Không có useMemo cho filtered & sorted data

**File:** `ConversationListSidebar.tsx`

**Vấn đề:**

```typescript
// WRONG CODE (CŨ)
const filteredApiGroups = sortConversationsByLatest(
  apiGroups.filter((g) => match(g.name) || match(g.lastMessage?.content))
);
```

**Tại sao sai:**

- Mỗi lần component re-render, tạo mảng MỚI
- React không track được array reference thay đổi
- Component con không re-render dù data đã change

**Fix:**

```typescript
// ✅ FIXED: Wrap trong useMemo
const filteredApiGroups = React.useMemo(() => {
  return sortConversationsByLatest(
    apiGroups.filter((g) => match(g.name) || match(g.lastMessage?.content))
  );
}, [apiGroups, q]); // Re-compute khi apiGroups hoặc search query thay đổi
```

**Giải thích:**

- `useMemo` cache result
- Chỉ re-compute khi `apiGroups` hoặc `q` thay đổi
- React detect dependency change → re-render component

---

### 3. ❌ TanStack Query không notify khi cache update

**File:** `useGroups.ts`, `useDirectMessages.ts`

**Vấn đề:**

```typescript
// WRONG CODE (CŨ)
return useInfiniteQuery({
  queryKey: conversationKeys.groups(),
  queryFn: ({ pageParam }) => getGroups(pageParam),
  // ... other options
  staleTime: 1000 * 30, // 30s
});
```

**Tại sao sai:**

- Default `notifyOnChangeProps = ['data']` trong TanStack Query v5
- Nhưng khi `setQueryData` update cache, không trigger re-render nếu `staleTime` chưa hết
- Component không biết data đã thay đổi

**Fix:**

```typescript
// ✅ FIXED: Thêm notifyOnChangeProps
return useInfiniteQuery({
  queryKey: conversationKeys.groups(),
  queryFn: ({ pageParam }) => getGroups(pageParam),
  // ... other options
  staleTime: 1000 * 30,
  // Force re-render on cache updates
  notifyOnChangeProps: ["data", "dataUpdatedAt"],
});
```

**Giải thích:**

- `notifyOnChangeProps: ['data', 'dataUpdatedAt']` force notify khi:
  - `data` thay đổi (from setQueryData)
  - `dataUpdatedAt` thay đổi (timestamp update)
- Component re-render ngay khi cache update

---

### 4. ⚠️ Thiếu debug logs

**Vấn đề:**

- Không biết:
  - Cache có tồn tại không?
  - Events có fire không?
  - SignalR có connected không?

**Fix:**

```typescript
// ✅ Added comprehensive logging

// 1. Hook setup
console.log("🎧 [Realtime] Setting up SignalR listeners, activeConversationId:", ...);
console.log("📡 [Realtime] SignalR state:", chatHub.state);

// 2. Event received
console.log("🔔 [Realtime] MessageSent:", {
  conversationId,
  content: message.content?.substring(0, 50),
  isActive: isActiveConversation,
  sentAt: message.sentAt,
});

// 3. Cache update success
console.log("✅ [Realtime] Updated groups cache for:", conversationId);

// 4. Cache not found warning
console.warn("⚠️ [Realtime] Groups cache not found, cannot update");

// 5. Data changes in component
console.log("📊 [ConversationList] apiGroups updated:", {
  count: apiGroups.length,
  firstItem: apiGroups[0],
  dataUpdatedAt: groupsQuery.dataUpdatedAt,
});
```

---

## ✅ TẤT CẢ FIXES ĐÃ ÁP DỤNG

### File 1: `useConversationRealtime.ts`

1. **Removed invalidateQueries** sau setQueryData (both groups & directs)
2. **Added warning log** khi cache không tồn tại
3. **Added setup logs** ở đầu useEffect

### File 2: `ConversationListSidebar.tsx`

1. **Wrapped filteredApiGroups** trong `useMemo` với deps `[apiGroups, q]`
2. **Wrapped filteredApiDirects** trong `useMemo` với deps `[apiDirects, q]`
3. **Added debug useEffect** để log khi apiGroups thay đổi

### File 3: `useGroups.ts`

1. **Added notifyOnChangeProps: ['data', 'dataUpdatedAt']**

### File 4: `useDirectMessages.ts`

1. **Added notifyOnChangeProps: ['data', 'dataUpdatedAt']**

---

## 🧪 TESTING CHECKLIST

### 1. Unit Tests

```bash
npm test
```

**Expected:** All tests pass (194 passed | 3 skipped)

### 2. Manual Browser Test

**Setup:**

1. Mở 2 browser windows (Chrome + Firefox)
2. Login với 2 users khác nhau
3. Join cùng 1 group conversation

**Test Scenario:**

```
Browser A (User A):
1. Mở conversation X
2. Gửi tin "Hello from A"

Browser B (User B):
✅ Check console logs:
   - "🔔 [Realtime] MessageSent: ..."
   - "✅ [Realtime] Updated groups cache for: ..."
   - "📊 [ConversationList] apiGroups updated: ..."

✅ Check UI:
   - Conversation X move lên đầu list
   - lastMessage hiển thị "Hello from A"
   - Time shows "Vừa xong"
   - Unread badge shows "1" (if conversation not active)

Browser A (User A):
3. Check console logs (tương tự)
4. Check UI update
```

### 3. E2E Test (Playwright)

```bash
npx playwright test signalr-realtime.spec.ts
```

**Note:** E2E test đang stuck ở login step - cần check credentials hoặc backend API

---

## 📊 EXPECTED BEHAVIOR - FLOW ĐÚNG

```
┌─────────────────────────────────────────────────────────┐
│ User A gửi tin nhắn                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Backend nhận message, save to DB                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Backend emit SignalR event 'MessageSent'               │
│ {                                                       │
│   conversationId: "conv-123",                          │
│   message: { id, content, sentAt, ... }                │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ User B's browser: SignalR client nhận event            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ useConversationRealtime.handleMessageSent()            │
│ - Log: "🔔 [Realtime] MessageSent: ..."                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ queryClient.setQueryData(conversationKeys.groups(), {  │
│   pages: updatedPages  // lastMessage updated          │
│ })                                                      │
│ - Log: "✅ [Realtime] Updated groups cache for: ..."   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ TanStack Query notifies subscribers                    │
│ (notifyOnChangeProps: ['data', 'dataUpdatedAt'])       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ useGroups() re-renders, apiGroups updated              │
│ - Log: "📊 [ConversationList] apiGroups updated: ..."  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ useMemo re-computes filteredApiGroups                  │
│ - sortConversationsByLatest() sorts by sentAt          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ ConversationListSidebar re-renders                     │
│ - Conversation với tin mới nhất lên đầu                │
│ - lastMessage hiển thị text mới                        │
│ - RelativeTime shows "Vừa xong"                        │
│ - UnreadBadge shows count (nếu !isActive)              │
└─────────────────────────────────────────────────────────┘
                        ↓
                    ✅ SUCCESS!
```

---

## 🔍 DEBUGGING STEPS (nếu vẫn không work)

### Step 1: Check SignalR Connection

**Browser Console:**

```javascript
window.chatHub?.state;
```

**Expected:** `"Connected"`

**If not:**

- Backend không chạy
- URL sai trong .env
- CORS issues

---

### Step 2: Check Events Fire

**Expected Console Logs khi gửi tin:**

```
🎧 [Realtime] Setting up SignalR listeners, activeConversationId: conv-123
📡 [Realtime] SignalR state: Connected

🔔 [Realtime] MessageSent: {
  conversationId: "conv-123",
  content: "Hello from A",
  isActive: false,
  sentAt: "2026-01-07T12:00:00Z"
}

✅ [Realtime] Updated groups cache for: conv-123

📊 [ConversationList] apiGroups updated: {
  count: 5,
  firstItem: { id: "conv-123", lastMessage: { content: "Hello from A" } },
  dataUpdatedAt: 1704628800000
}
```

**If missing:**

- Backend không emit event
- Event name sai
- SignalR disconnected

---

### Step 3: Check Cache Update

**React DevTools → Components → ConversationListSidebar:**

**Check hooks:**

- `groupsQuery.data.pages[0].data[0].lastMessage.content` === "Hello from A" ✅
- `groupsQuery.dataUpdatedAt` changed ✅

**If not:**

- `setQueryData` failed
- Cache key mismatch
- Data structure wrong

---

### Step 4: Check Sorting

**Console:**

```javascript
// After message sent, check order
apiGroups[0].lastMessage.sentAt > apiGroups[1].lastMessage.sentAt;
```

**Expected:** `true` (newest first)

**If not:**

- `sortConversationsByLatest` logic wrong
- `useMemo` dependencies wrong

---

## 📝 RELATED FILES

| File                          | Changes                            | Status |
| ----------------------------- | ---------------------------------- | ------ |
| `useConversationRealtime.ts`  | Remove invalidateQueries, add logs | ✅     |
| `ConversationListSidebar.tsx` | Add useMemo, add debug logs        | ✅     |
| `useGroups.ts`                | Add notifyOnChangeProps            | ✅     |
| `useDirectMessages.ts`        | Add notifyOnChangeProps            | ✅     |

---

## 🎯 NEXT STEPS

1. **Chạy npm test** → verify all tests pass
2. **Test trong browser** với 2 users → check console logs
3. **Report kết quả:**
   - Console có logs không?
   - UI có update không?
   - Nếu không, paste console logs để debug tiếp

---

**Status:** ✅ ALL FIXES APPLIED  
**Waiting:** 👤 MANUAL BROWSER VERIFICATION
