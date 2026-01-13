# Fix: Conversation List Realtime - Event Structure Mismatch

**Date:** 2026-01-13  
**Issue:** Backend event structure mismatch causing realtime updates to fail silently

---

## 🐛 Problem

Backend sends **unwrapped** message object directly:

```json
{
  "id": "...",
  "conversationId": "...",
  "content": "...",
  ...
}
```

Frontend expected **wrapped** structure:

```typescript
interface MessageSentEvent {
  message: ChatMessage;
}
const message = event.message; // ← undefined!
```

---

## ✅ Solution

Updated `handleMessageSent` in `useConversationRealtime.ts` to handle both:

```typescript
// Handle both wrapped and unwrapped
const message = event.message || event;
const conversationId = message?.conversationId;
```

---

## 📝 Files Changed

### Modified:

1. `src/hooks/useConversationRealtime.ts`

   - Fixed event structure handling (wrapped vs unwrapped)
   - Removed debug logs after verification

2. `src/features/portal/components/ConversationListContainer.tsx`

   - Removed debug logs

3. `src/lib/signalr.ts`
   - Exposed `chatHub` to window for debugging (kept for future use)

### Added:

4. `tests/chat/conversation-list/e2e/realtime-updates-v2.spec.ts`
   - E2E test for conversation list realtime updates
   - Test cases:
     - Message sent → Conversation updates immediately
     - Unread badge increments when conversation not active
     - Conversation moves to top of list
     - Last message and timestamp update

### Documentation:

5. `docs/modules/chat/features/conversation-list-realtime-debug/`
   - 00_README.md - Overview
   - 01_diagnostic_plan.md - Diagnostic methodology
   - 02_findings.md - Detailed test results (template)
   - FINDINGS_SUMMARY.md - Final summary
   - QUICK_START.md - Quick testing guide

---

## ✅ Verification

All realtime features working:

- ✅ SignalR connection stable
- ✅ Event listeners registered
- ✅ Events received from backend
- ✅ Cache updates correctly
- ✅ UI updates in realtime
- ✅ No console errors

---

## 🧪 Testing

Run E2E test:

```bash
npx playwright test tests/chat/conversation-list/e2e/realtime-updates-v2.spec.ts
```

Manual test:

1. Open 2 browsers (User A + User B)
2. User B sends message
3. User A sees conversation update immediately

---

## 📊 Impact

- **Before:** Silent failure, no logs, confusing for debugging
- **After:** Works with both event structures, robust handling

---

**Commit:** fix(chat): handle both wrapped and unwrapped SignalR message events
