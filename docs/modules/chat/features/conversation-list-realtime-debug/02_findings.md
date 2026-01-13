# [BƯỚC 2] Findings - Conversation List Realtime Debug

**Date Started:** 2026-01-13  
**Status:** ⏳ IN PROGRESS  
**Tester:** [Your Name]

---

## 📊 Test Results Summary

| Test # | Test Name                    | Status  | Root Cause Found? |
| ------ | ---------------------------- | ------- | ----------------- |
| 1      | SignalR Connection           | ⏳ TODO | -                 |
| 2      | Event Listeners Registration | ⏳ TODO | -                 |
| 3      | Event Reception from Backend | ⏳ TODO | -                 |
| 4      | TanStack Query Cache Update  | ⏳ TODO | -                 |
| 5      | UI Re-render Verification    | ⏳ TODO | -                 |

---

## 🧪 TEST 1: SignalR Connection Status

**Date/Time:** [timestamp]

### Results:

- [ ] ✅ Connection state = "Connected"
- [ ] ❌ Connection failed

### Console Output:

```javascript
// Paste output of window.chatHub.state here
```

### Network Tab:

- [ ] WebSocket connection visible
- [ ] Transport type: ******\_\_\_\_******
- [ ] Connection ID: ******\_\_\_\_******

### Observations:

-
-

### Screenshots:

- 📸 Console showing chatHub.state: ********\_********
- 📸 Network tab WebSocket: ********\_********

### Issues Found:

-
-

### Next Steps:

-
-

---

## 🧪 TEST 2: Event Listeners Registration

**Date/Time:** [timestamp]

### Results:

- [ ] ✅ Listeners registered successfully
- [ ] ❌ Listeners not registered

### Console Logs:

```
// Paste registration logs here



```

### Events Registered:

- [ ] MessageSent
- [ ] ReceiveMessage
- [ ] MessageRead
- [ ] ConversationUpdated

### Observations:

- Number of times hook mounted: **\_\_**
- Any duplicate registrations? **\_\_**
-

### Screenshots:

- 📸 Console logs: ********\_********

### Issues Found:

-
-

### Next Steps:

-
-

---

## 🧪 TEST 3: Event Reception from Backend

**Date/Time:** [timestamp]

### Results:

- [ ] ✅ Event received when message sent
- [ ] ❌ No event received

### Test Setup:

- User A: ********\_\_\_\_********
- User B: ********\_\_\_\_********
- Conversation ID: ********\_\_\_\_********
- Message sent: "********\_\_\_\_********"
- Time sent: ********\_\_\_\_********

### Console Logs:

```
// Paste event reception logs here



```

### Network WebSocket Frames:

```json
// Paste incoming frame data here



```

### Event Structure:

```json
// Paste actual event payload here



```

### Does it match MessageSentEvent interface?

- [ ] ✅ Yes, structure matches
- [ ] ❌ No, structure different

**Differences (if any):**

```
Expected: { message: ChatMessage }
Actual:



```

### Observations:

- Event arrived? **\_\_**
- Correct conversationId? **\_\_**
- Event name: **\_\_**
-

### Screenshots:

- 📸 Network WebSocket frames: ********\_********
- 📸 Console event logs: ********\_********

### Issues Found:

-
-

### Next Steps:

-
-

---

## 🧪 TEST 4: TanStack Query Cache Update

**Date/Time:** [timestamp]

### Results:

- [ ] ✅ Cache updated successfully
- [ ] ❌ Cache not updated

### Cache Before Event:

```json
// Paste first conversation data from React Query Devtools



```

### Cache After Event:

```json
// Paste updated conversation data



```

### Changes Detected:

- [ ] lastMessage.content changed
- [ ] lastMessage.sentAt changed
- [ ] unreadCount incremented
- [ ] Conversation position changed

### Console Logs:

```
// Paste cache update logs here



```

### Query Keys Checked:

- [ ] ["conversations", "groups"]
- [ ] ["conversations", "directs"]

### Observations:

- Cache update triggered? **\_\_**
- Correct conversation found in cache? **\_\_**
- Update logic executed correctly? **\_\_**
-

### Screenshots:

- 📸 React Query Devtools before: ********\_********
- 📸 React Query Devtools after: ********\_********
- 📸 Console cache logs: ********\_********

### Issues Found:

-
-

### Next Steps:

-
-

---

## 🧪 TEST 5: UI Re-render Verification

**Date/Time:** [timestamp]

### Results:

- [ ] ✅ UI updated correctly
- [ ] ❌ UI did not update

### Visual Changes Observed:

- [ ] Conversation moved to top of list
- [ ] Last message text updated
- [ ] Timestamp shows "Vừa xong"
- [ ] Unread badge appeared/incremented

### Console Render Logs:

```
// Paste component render logs here



```

### React DevTools Profiler:

- Component re-rendered? **\_\_**
- Render duration: **\_\_** ms
- Render count after event: **\_\_**

### Props Inspection:

- conversations array length: **\_\_**
- First conversation ID: **\_\_**
- First conversation lastMessage: **\_\_**

### Observations:

- Component re-render triggered? **\_\_**
- Correct data passed to component? **\_\_**
- Sorting applied? **\_\_**
-

### Screenshots/Video:

- 📸 UI before message sent: ********\_********
- 📸 UI after message sent: ********\_********
- 🎥 Video of realtime update: ********\_********
- 📸 React DevTools Profiler: ********\_********

### Issues Found:

-
-

### Next Steps:

-
-

---

## 🎯 ROOT CAUSE ANALYSIS

### Primary Issue Identified:

```
[Describe the main root cause found]




```

### Evidence Supporting This:

1.
2.
3.

### Affected Components/Files:

-
-
-

### Why This Causes the Problem:

```
[Explain the mechanism of failure]




```

---

## 💡 RECOMMENDED FIX

### High-Level Solution:

```
[Brief description of what needs to be fixed]



```

### Files That Need Changes:

1.
2.
3.

### Confidence Level:

- [ ] 🟢 HIGH - Root cause clearly identified, fix is straightforward
- [ ] 🟡 MEDIUM - Root cause likely identified, fix needs testing
- [ ] 🔴 LOW - Need more investigation

---

## 📋 ADDITIONAL NOTES

### Environment Info:

- Browser: ******\_\_\_\_******
- OS: ******\_\_\_\_******
- Backend URL: ******\_\_\_\_******
- SignalR Hub URL: ******\_\_\_\_******

### Other Observations:

-
-

### Questions for Team:

-
-

---

## ✅ COMPLETION CHECKLIST

- [ ] All 5 tests executed
- [ ] Screenshots collected for each test
- [ ] Root cause identified with evidence
- [ ] Recommended fix documented
- [ ] HUMAN has reviewed findings

---

## 🔄 NEXT STEPS

1. **If root cause found:**

   - [ ] Create `03_fix_plan.md` with implementation details
   - [ ] Get HUMAN approval for fix plan
   - [ ] Implement fix
   - [ ] Verify with E2E test

2. **If more investigation needed:**
   - [ ] Document additional tests required
   - [ ] Update diagnostic plan
   - [ ] Re-run specific tests

---

**Status:** [TODO / IN PROGRESS / ✅ COMPLETE]  
**Next Document:** [03_fix_plan.md](./03_fix_plan.md)
