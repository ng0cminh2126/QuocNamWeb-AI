# [BƯỚC 1] Diagnostic Plan - Conversation List Realtime Debug

**Date:** 2026-01-13  
**Status:** ⏳ TODO  
**Objective:** Xác định root cause của vấn đề không nhận được tin mới realtime

---

## 🎯 Checklist Overview

| #   | Test Area          | Tools                | Expected Result                | Status |
| --- | ------------------ | -------------------- | ------------------------------ | ------ |
| 1   | SignalR Connection | DevTools Console     | State = "Connected"            | ⬜     |
| 2   | Event Listeners    | Console Logs         | Events registered              | ⬜     |
| 3   | Event Reception    | Network Tab          | Events received from server    | ⬜     |
| 4   | Cache Update       | React DevTools Query | Cache updated with new message | ⬜     |
| 5   | UI Re-render       | Visual Inspection    | Conversation list updates      | ⬜     |

---

## 📋 Detailed Diagnostic Steps

### ✅ TEST 1: SignalR Connection Status

**Goal:** Verify SignalR connection is established and stable

**Steps:**

1. **Open DevTools Console**

   - Press `F12` → Console tab

2. **Check Connection State**

   ```javascript
   // Run in console:
   window.chatHub?.state;
   // Expected: "Connected"
   ```

3. **Check Connection Object**

   ```javascript
   // Run in console:
   window.chatHub?.connection;
   // Expected: HubConnection object (not null)
   ```

4. **Monitor Connection Events**
   - Watch for these logs in console:
     - ✅ `SignalR: Connected successfully`
     - ✅ `SignalR: Reconnected with ID: ...`
     - ❌ `SignalR: Connection failed`
     - ❌ `SignalR: Connection closed`

**Troubleshooting if Failed:**

- If `window.chatHub` is undefined:
  → SignalR not initialized properly
  → Check `src/lib/signalr.ts` export

- If state is "Disconnected":
  → Check backend is running
  → Check `VITE_DEV_SIGNALR_HUB_URL` in `.env.local`
  → Check network connectivity

- If state is "Reconnecting" repeatedly:
  → Backend hub may be rejecting connection
  → Check JWT token validity
  → Check backend logs

**Evidence to Collect:**

- Screenshot of console showing `window.chatHub.state`
- Copy of any error messages
- Network tab showing WebSocket connection (or fallback transport)

---

### ✅ TEST 2: Event Listeners Registration

**Goal:** Verify `useConversationRealtime` hook is registering SignalR event listeners

**Steps:**

1. **Add Debug Logs to Hook**

   Temporarily modify `src/hooks/useConversationRealtime.ts`:

   ```typescript
   // After line ~282 (in useEffect)
   useEffect(() => {
     console.log('🔵 [DEBUG] Registering SignalR event listeners...');

     chatHub.on(SIGNALR_EVENTS.MESSAGE_SENT, handleMessageSent as any);
     console.log('✅ [DEBUG] Registered:', SIGNALR_EVENTS.MESSAGE_SENT);

     chatHub.on(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleMessageSent as any);
     console.log('✅ [DEBUG] Registered:', SIGNALR_EVENTS.RECEIVE_MESSAGE);

     chatHub.on(SIGNALR_EVENTS.MESSAGE_READ, handleMessageRead as any);
     console.log('✅ [DEBUG] Registered:', SIGNALR_EVENTS.MESSAGE_READ);

     // ... rest of code
   ```

2. **Reload Page and Check Console**

   - Expected logs:
     ```
     🔵 [DEBUG] Registering SignalR event listeners...
     ✅ [DEBUG] Registered: MessageSent
     ✅ [DEBUG] Registered: ReceiveMessage
     ✅ [DEBUG] Registered: MessageRead
     ```

3. **Verify Hook is Mounted**

   Check `ConversationListSidebar.tsx` (line ~146):

   ```typescript
   useConversationRealtime({ activeConversationId: selectedConversationId });
   ```

   Expected: Hook should be called when component mounts

4. **Check for Multiple Hook Calls**
   - If you see duplicate registration logs → Hook mounting/unmounting repeatedly
   - This can cause event listeners to be removed prematurely

**Troubleshooting if Failed:**

- No logs appearing:
  → Hook not being called
  → Check component is mounted
  → Check import path is correct

- Duplicate logs (many times):
  → Component re-rendering too often
  → Check dependencies in `useConversationRealtime` useEffect
  → May need to memoize callbacks

**Evidence to Collect:**

- Screenshot of console showing registration logs
- Count of how many times registration occurs
- Timestamp of registration vs page load

---

### ✅ TEST 3: Event Reception from Backend

**Goal:** Verify backend is actually sending SignalR events when new messages arrive

**Steps:**

1. **Open DevTools → Network Tab**

   - Filter: `WS` (WebSockets) or `signalr`
   - Find connection to `/hubs/chat`

2. **Add Event Reception Logs**

   Modify `src/hooks/useConversationRealtime.ts`:

   ```typescript
   // In handleMessageSent callback (~line 79)
   const handleMessageSent = useCallback(
     (event: MessageSentEvent) => {
       console.log('🟢 [REALTIME] MESSAGE_SENT received:', event);

       const message = event.message;
       const conversationId = message.conversationId;

       console.log('   conversationId:', conversationId);
       console.log('   content:', message.content);
       console.log('   sentAt:', message.sentAt);

       // ... rest of code
   ```

3. **Trigger New Message**

   **Method A: Use Another User (Recommended)**

   - Login User B in incognito window
   - User B sends message to conversation
   - User A (main window) should receive event

   **Method B: Use API Test**

   ```bash
   # Send message via API
   curl -X POST https://vega-chat-api-dev.allianceitsc.com/api/messages \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "conversationId": "CONVERSATION_ID",
       "content": "Test realtime message",
       "contentType": "TXT"
     }'
   ```

4. **Check Console for Event Reception**

   Expected logs:

   ```
   🟢 [REALTIME] MESSAGE_SENT received: { message: { ... } }
      conversationId: abc123
      content: Test realtime message
      sentAt: 2026-01-13T10:30:00Z
   ```

5. **Check Network Tab → WebSocket Frames**
   - Look for incoming frames with `MessageSent` event
   - Verify payload structure matches `MessageSentEvent` interface

**Troubleshooting if Failed:**

- No event received:
  → Backend NOT broadcasting event
  → Check backend SignalR hub implementation
  → Check user is in the correct SignalR group
  → Try calling `chatHub.joinGroup(conversationId)` manually

- Event received but wrong structure:
  → Backend event payload doesn't match `MessageSentEvent`
  → Check backend code for event naming/structure
  → May need to update TypeScript interfaces

- Event received but for different conversation:
  → Check `conversationId` in event payload
  → Verify conversation IDs match

**Evidence to Collect:**

- Screenshot of Network tab showing WebSocket frames
- Copy of event payload (JSON)
- Screenshot of console logs showing event reception
- Note: Does event arrive? If yes, what's the exact structure?

---

### ✅ TEST 4: TanStack Query Cache Update

**Goal:** Verify cache is updated when event is received

**Steps:**

1. **Install React Query Devtools** (if not already)

   Already added in project, should be visible in UI

2. **Open React Query Devtools**

   - Look for queries with key containing `conversations`
   - Example: `["conversations", "groups"]`, `["conversations", "directs"]`

3. **Add Cache Update Logs**

   Modify `src/hooks/useConversationRealtime.ts`:

   ```typescript
   // In handleMessageSent, after queryClient.setQueryData (~line 95)
   queryClient.setQueryData(conversationKeys.groups(), {
     ...groupsData,
     pages: updatedPages,
   });

   console.log("🔵 [CACHE] Groups cache updated");
   console.log("   Updated pages:", updatedPages.length);
   console.log("   Target conversationId:", conversationId);
   ```

4. **Trigger Message and Monitor Cache**

   - Send message from User B
   - Watch React Query Devtools
   - Expected: Query data should update in real-time

5. **Inspect Cache Data Structure**

   ```javascript
   // Run in console after event received:
   const cache = window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__;
   // OR use React DevTools → Components → find QueryClient
   ```

6. **Verify Conversation Update Logic**
   - Check if conversation with matching ID exists in cache
   - Check if `lastMessage`, `lastMessageAt` are updated
   - Check if `unreadCount` increments (when not active conversation)

**Troubleshooting if Failed:**

- Cache not updating:
  → `queryClient.setQueryData()` not called
  → Check event handler is executing
  → Check query key matches exactly

- Cache updates but wrong data:
  → Logic in `handleMessageSent` may be incorrect
  → Verify `conversationId` matching logic
  → Check spread operator isn't losing data

- Cache updates but component doesn't re-render:
  → React Query may not detect change
  → Try `queryClient.invalidateQueries()` instead
  → Check component is subscribed to query

**Evidence to Collect:**

- Screenshot of React Query Devtools before/after event
- Copy of cache data structure (JSON)
- Screenshot of console logs showing cache update
- Note: Which fields changed? Did unreadCount increment?

---

### ✅ TEST 5: UI Re-render Verification

**Goal:** Verify UI updates after cache is updated

**Steps:**

1. **Visual Inspection**

   - Open conversation list
   - Have User B send message
   - Watch conversation list for:
     - ✅ Conversation moves to top
     - ✅ Last message text updates
     - ✅ Timestamp shows "Vừa xong"
     - ✅ Unread badge appears/increments

2. **Add Component Re-render Logs**

   Modify `src/features/portal/components/ConversationListContainer.tsx`:

   ```typescript
   export const ConversationListContainer: React.FC<...> = ({...}) => {
     // At top of component (~line 38)
     console.log('🔄 [RENDER] ConversationListContainer rendered');
     console.log('   Conversations count:', conversations.length);
     console.log('   First conversation:', conversations[0]?.name);
     console.log('   Last message:', conversations[0]?.lastMessage?.content);

     // ... rest of code
   ```

3. **Check React DevTools → Profiler**

   - Record profile
   - Trigger message
   - Check if `ConversationListContainer` re-renders
   - Check render duration

4. **Verify Props and State**

   - Use React DevTools → Components
   - Find `ConversationListContainer`
   - Inspect props: `conversations` array
   - Check if `conversations` reference changes after event

5. **Check for Memoization Issues**

   In `ConversationListSidebar.tsx`:

   ```typescript
   // Line ~148-152
   const apiGroups = React.useMemo(() => {
     return flattenGroups(groupsQuery.data);
   }, [groupsQuery.data]);
   ```

   - Verify `groupsQuery.data` updates when cache changes
   - Verify `apiGroups` recomputes

**Troubleshooting if Failed:**

- Cache updates but no re-render:
  → Component not subscribed to query
  → Check `useGroups` or `useDirectMessages` hook is called
  → Check component is actually using the data

- Re-render occurs but UI doesn't change:
  → New data may be identical to old data
  → Check `flattenGroups` / `flattenDirectMessages` logic
  → Verify conversation sorting logic

- Partial UI update (e.g., text changes but position doesn't):
  → Sorting logic not applied
  → Check if conversations are sorted by `lastMessageAt`

**Evidence to Collect:**

- Screenshot/video of UI before/after message sent
- Screenshot of React DevTools Profiler
- Screenshot of Component props in React DevTools
- Note: What parts of UI updated? What didn't?

---

## 🔧 Debug Tools Checklist

Before starting diagnostic, ensure these tools are available:

- [ ] Chrome/Edge DevTools (F12)
- [ ] React DevTools extension installed
- [ ] React Query Devtools visible in UI
- [ ] Backend API running and accessible
- [ ] Test user accounts (User A, User B)
- [ ] Incognito/private browser window for User B
- [ ] Text editor for adding debug logs

---

## 📊 Data Collection Template

Use this template to record findings during each test:

```markdown
### Test X: [Test Name]

**Date/Time:** [timestamp]
**Tester:** [name]

#### Results:

- ✅ / ❌ [Main expected outcome]

#### Observations:

- [Observation 1]
- [Observation 2]

#### Evidence:

- Screenshot: [filename or link]
- Logs: [paste relevant logs]
- Network data: [paste relevant data]

#### Issues Found:

- [Issue 1 description]
- [Issue 2 description]

#### Next Steps:

- [Action item 1]
- [Action item 2]
```

---

## 🎬 Testing Sequence (Recommended Order)

1. **Start with TEST 1** - If connection fails, other tests are meaningless
2. **Then TEST 2** - If listeners not registered, events won't be received
3. **Then TEST 3** - If events not received, cache won't update
4. **Then TEST 4** - If cache doesn't update, UI won't change
5. **Finally TEST 5** - Verify end-to-end flow

**STOP at first failed test** - Document the failure, then decide next steps

---

## 📋 Completion Criteria

This diagnostic plan is complete when:

- [ ] All 5 tests executed
- [ ] Results documented in `02_findings.md`
- [ ] Evidence collected (screenshots, logs, videos)
- [ ] Root cause identified with confidence
- [ ] HUMAN has reviewed and confirmed findings

**DO NOT** proceed to fix implementation until completion criteria met.

---

## ⏰ Estimated Time

| Test      | Time Estimate |
| --------- | ------------- |
| TEST 1    | 5 min         |
| TEST 2    | 10 min        |
| TEST 3    | 15 min        |
| TEST 4    | 15 min        |
| TEST 5    | 10 min        |
| **Total** | **~55 min**   |

---

## 📝 Notes for AI

- **DO NOT** execute these tests automatically
- **WAIT** for HUMAN to perform tests manually
- **GUIDE** HUMAN through steps if needed
- **ASSIST** with adding debug logs if requested
- **DOCUMENT** findings when HUMAN reports results

---

## ✅ HUMAN CONFIRMATION

| Item                               | Status  |
| ---------------------------------- | ------- |
| Đã đọc và hiểu diagnostic plan     | ⬜ TODO |
| Đã chuẩn bị debug tools            | ⬜ TODO |
| Sẵn sàng thực hiện tests           | ⬜ TODO |
| **APPROVED để bắt đầu diagnostic** | ⬜ TODO |

**HUMAN Signature:** ********\_********  
**Date:** ********\_********

---

**Next Document:** [02_findings.md](./02_findings.md) (create after diagnostic completed)
