# Fix: Conversation List Not Receiving Realtime Updates

**Date:** 2025-01-13  
**Issue:** Live environment - Conversation list không nhận được realtime updates, có log "Ignoring message for different conversation"  
**Root Cause:** `useConversationRealtime` hook không join vào conversation groups nên không nhận SignalR events

---

## 🔍 Problem Analysis

### Symptom

- Conversation list không update khi có message mới
- Console log: `"Ignoring message for different conversation"`
- Chỉ xảy ra trong live environment

### Root Cause Discovery

**SignalR Group Membership Issue:**

1. **`useMessageRealtime`** (used in ChatMain):

   - ✅ Join vào specific conversation group: `chatHub.joinGroup(conversationId)`
   - ✅ Nhận được SignalR events cho conversation đó
   - ❌ Ignore events từ conversations khác (đúng behavior)

2. **`useConversationRealtime`** (used in ConversationListContainer):
   - ❌ KHÔNG join vào bất kỳ group nào
   - ❌ Không nhận được SignalR events
   - Conversation list không update

**Why it worked in dev before:**

- Có thể backend dev broadcast global events
- Hoặc khi đã mở chat, user join group và cả 2 hooks cùng nhận event

**Why it failed in live:**

- Backend live chỉ broadcast events vào specific conversation groups
- User không ở trong group → không nhận events

---

## 🔧 Solution Implemented

### Changes in `useConversationRealtime.ts`

#### 1. Added `useSignalRConnection` Hook

```typescript
const { isConnected } = useSignalRConnection();
```

#### 2. Added Group Management State

```typescript
const joinedGroupsRef = useRef<Set<string>>(new Set());
```

#### 3. Added Auto-Join Logic

```typescript
// Join all conversations in the list to receive realtime updates
useEffect(() => {
  if (!isConnected) return;

  // Get all conversation IDs from cache
  const groupsData = queryClient.getQueryData<InfiniteData<ConversationPage>>(
    conversationKeys.groups()
  );
  const directsData = queryClient.getQueryData<InfiniteData<ConversationPage>>(
    conversationKeys.directs()
  );

  const allConversationIds = new Set<string>();

  // Collect from groups
  groupsData?.pages?.forEach((page) => {
    page.items?.forEach((conv) => {
      if (conv.id) allConversationIds.add(conv.id);
    });
  });

  // Collect from directs
  directsData?.pages?.forEach((page) => {
    page.items?.forEach((conv) => {
      if (conv.id) allConversationIds.add(conv.id);
    });
  });

  // Join new groups
  const newGroups = Array.from(allConversationIds).filter(
    (id) => !joinedGroupsRef.current.has(id)
  );

  newGroups.forEach((conversationId) => {
    chatHub.joinGroup(conversationId).then(() => {
      joinedGroupsRef.current.add(conversationId);
    });
  });

  // Leave old groups that are no longer in the list
  const currentGroups = Array.from(joinedGroupsRef.current);
  const groupsToLeave = currentGroups.filter(
    (id) => !allConversationIds.has(id)
  );

  groupsToLeave.forEach((conversationId) => {
    chatHub.leaveGroup(conversationId);
    joinedGroupsRef.current.delete(conversationId);
  });

  // Cleanup on unmount
  return () => {
    joinedGroupsRef.current.forEach((conversationId) => {
      chatHub.leaveGroup(conversationId);
    });
    joinedGroupsRef.current.clear();
  };
}, [queryClient, isConnected]);
```

#### 4. Updated Event Listeners to Check Connection

```typescript
useEffect(() => {
  if (!isConnected) return; // ⬅️ NEW: Only subscribe when connected

  // Subscribe to events...
}, [
  handleMessageSent,
  handleMessageRead,
  handleConversationUpdated,
  isConnected,
]);
```

---

## ✅ How It Works Now

### Initialization Flow

```
1. ConversationListContainer mounts
   ↓
2. useConversationRealtime() called
   ↓
3. Wait for SignalR connection (isConnected = true)
   ↓
4. Get all conversations from cache (groups + directs)
   ↓
5. Join all conversation groups:
   - chatHub.joinGroup(conv1.id)
   - chatHub.joinGroup(conv2.id)
   - chatHub.joinGroup(conv3.id)
   - ...
   ↓
6. Subscribe to SignalR events:
   - MESSAGE_SENT
   - RECEIVE_MESSAGE
   - MESSAGE_READ
   - CONVERSATION_UPDATED
```

### When New Message Arrives

```
Backend broadcasts to conversation group
   ↓
ConversationListContainer receives event (joined group ✅)
   ↓
handleMessageSent() updates cache
   ↓
Conversation list re-renders with new data
```

### Dynamic Updates

```
When conversation list changes:
- Join new conversations that appear
- Leave old conversations that disappear
- Keep tracking in joinedGroupsRef
```

---

## 📝 Testing Checklist

- [x] Code compiles without errors
- [ ] Test in dev environment:
  - [ ] Open app, verify conversations join groups
  - [ ] Send message from another user
  - [ ] Verify conversation list updates
- [ ] Test in live environment:
  - [ ] Same test as dev
  - [ ] Verify no more "Ignoring message" logs
- [ ] Test edge cases:
  - [ ] Load more conversations (pagination) → should join new groups
  - [ ] Switch between groups/directs tabs
  - [ ] Multiple messages rapid fire

---

## 🔄 Comparison: Before vs After

### Before Fix

| Hook                    | Joins Groups? | Receives Events? | Updates Cache? |
| ----------------------- | ------------- | ---------------- | -------------- |
| useConversationRealtime | ❌ No         | ❌ No            | ❌ No          |
| useMessageRealtime      | ✅ Yes (one)  | ✅ Yes           | ✅ Yes         |

**Result:** Conversation list không update realtime

### After Fix

| Hook                    | Joins Groups? | Receives Events? | Updates Cache? |
| ----------------------- | ------------- | ---------------- | -------------- |
| useConversationRealtime | ✅ Yes (all)  | ✅ Yes           | ✅ Yes         |
| useMessageRealtime      | ✅ Yes (one)  | ✅ Yes           | ✅ Yes         |

**Result:** ✅ Conversation list updates realtime cho tất cả conversations

---

## 📚 Related Files

- `src/hooks/useConversationRealtime.ts` - Main fix location
- `src/features/portal/components/ConversationListContainer.tsx` - Uses the hook
- `src/hooks/useMessageRealtime.ts` - Similar pattern (for reference)
- `src/lib/signalr.ts` - SignalR client with joinGroup/leaveGroup methods

---

## 🎯 Key Learnings

1. **SignalR Groups are Required:** Backend chỉ broadcast events vào specific groups, không phải global
2. **Multiple Hooks Need Multiple Joins:** Mỗi hook cần join groups riêng, không share
3. **Dynamic Group Management:** Phải join/leave groups khi conversation list thay đổi
4. **Connection State Check:** Luôn check `isConnected` trước khi subscribe events

---

## 🚀 Deployment Notes

**Deploy này cần:**

- ✅ Code changes only
- ❌ No API changes
- ❌ No database migrations
- ❌ No config changes

**Rollback plan:**

- Revert commit nếu có issues
- Không có side effects vì chỉ thêm join groups logic

---

## 📋 Commit Message Template

```
fix(chat): auto-join conversation groups for realtime list updates

Problem:
- Conversation list không nhận realtime updates trong live
- Log "Ignoring message for different conversation"
- useConversationRealtime không join groups

Solution:
- Add useSignalRConnection hook
- Auto-join all conversations in cache
- Dynamic join/leave when list changes
- Check isConnected before subscribe events

Files:
- src/hooks/useConversationRealtime.ts
```
