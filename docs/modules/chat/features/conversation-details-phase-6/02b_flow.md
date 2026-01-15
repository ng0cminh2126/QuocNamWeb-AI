# [BƯỚC 2B] Flow Diagrams - Chat UX Improvements (Phase 6)

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6 - Error Handling & Persistence  
> **Document Type:** Flow Specification  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-12

---

## 📋 Overview

Flow diagrams cho error handling, retry mechanisms, và conversation persistence logic trong Phase 6.

---

## 🔄 Flow Diagrams

### Flow-1: File Upload Error Handling

```
User selects file(s)
        ↓
┌───────────────────┐
│ Validate file(s)  │
│ - Size < 20MB?    │
│ - Valid format?   │
└───────────────────┘
        ↓
     ┌──┴──┐
     │ OK? │
     └──┬──┘
   Yes ↓     ↓ No
┌──────────┐  ┌─────────────────────┐
│ Upload   │  │ Show inline error   │
│ file     │  │ + Toast notification│
└──────────┘  └─────────────────────┘
     ↓                ↓
     ↓         ┌─────────────┐
     ↓         │ User action │
     ↓         └─────────────┘
     ↓           ↙          ↘
     ↓    [Retry]          [Delete]
     ↓       ↓                ↓
     ↓    (Loop to          Remove
     ↓     Validate)         from list
     ↓
┌──────────────┐
│ Upload API   │
│ POST /files  │
└──────────────┘
     ↓
  ┌──┴──┐
  │ OK? │
  └──┬──┘
Yes ↓     ↓ No
┌─────────┐  ┌──────────────────────┐
│ Mark ✅ │  │ Show error + Retry   │
│ success │  │ + Toast (network err)│
└─────────┘  └──────────────────────┘
     ↓                ↓
     ↓         ┌─────────────┐
     ↓         │ User retry? │
     ↓         └─────────────┘
     ↓           ↙          ↘
     ↓        Yes           No
     ↓         ↓             ↓
     ↓    (Loop to        Keep
     ↓     Upload API)    error state
     ↓
┌──────────────────┐
│ File ready to    │
│ attach to message│
└──────────────────┘
```

**Key Points:**

- Validation happens client-side first (fast feedback)
- Upload happens immediately after validation passes
- Network errors trigger toast + inline error
- Max 3 retry attempts (per decision #2)
- After 3 fails, permanent error state

---

### Flow-2: Message Send Error Handling

```
User types message + clicks Send
        ↓
┌───────────────────────┐
│ Create message object │
│ - Text content        │
│ - Attached files (✅) │
│ - Timestamp           │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Add to chat UI        │
│ Status: ⏳ Sending    │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Send API              │
│ POST /messages        │
└───────────────────────┘
        ↓
     ┌──┴──┐
     │ OK? │
     └──┬──┘
  Yes ↓     ↓ No
┌──────────┐  ┌────────────────────┐
│ Update   │  │ Detect error type  │
│ Status:  │  │ - Network offline? │
│ Sent     │  │ - Server error?    │
│ (no ✓)   │  │ - Timeout?         │
└──────────┘  └────────────────────┘
     ↓                ↓
     ↓         ┌──────────────────┐
     ↓         │ Update Status:   │
     ↓         │ ⚠️ Failed        │
     ↓         │ + Error message  │
     ↓         │ + Action buttons │
     ↓         └──────────────────┘
     ↓                ↓
     ↓         ┌─────────────┐
     ↓         │ User action │
     ↓         └─────────────┘
     ↓           ↙          ↘
     ↓    [Gửi lại]      [Xoá]
     ↓       ↓              ↓
     ↓  ┌─────────────┐  Remove
     ↓  │ Check retry │  message
     ↓  │ count < 3?  │  from UI
     ↓  └─────────────┘
     ↓      ↙      ↘
     ↓    Yes      No
     ↓     ↓        ↓
     ↓  (Loop    Show error:
     ↓   to      "Max retries
     ↓   Send    exceeded"
     ↓   API)
     ↓
┌──────────────┐
│ Message sent │
│ successfully │
└──────────────┘
```

**Key Points:**

- Message added to UI immediately (optimistic update)
- Status changes: ⏳ Sending → Sent (no icon) OR ⚠️ Failed
- No "sent" checkmark (per decision #4)
- Max 3 retries with exponential backoff (1s, 2s, 4s)
- Retry preserves original content + files

---

### Flow-3: Conversation Persistence

```
User opens app
        ↓
┌─────────────────────────┐
│ Read localStorage       │
│ key: selectedConvId     │
└─────────────────────────┘
        ↓
     ┌──┴──┐
     │ Has │
     │ ID? │
     └──┬──┘
  Yes ↓     ↓ No
       ↓     ↓
       ↓  ┌─────────────────┐
       ↓  │ First visit     │
       ↓  │ - Fetch convs   │
       ↓  │ - Select latest │
       ↓  └─────────────────┘
       ↓          ↓
       ↓          ↓
┌──────────────────────┐
│ Fetch conversations  │
│ GET /conversations   │
└──────────────────────┘
        ↓
┌──────────────────────┐
│ Find conversation    │
│ by saved ID          │
└──────────────────────┘
        ↓
     ┌──┴──┐
     │ ID  │
     │exist│
     └──┬──┘
  Yes ↓     ↓ No
┌──────────┐  ┌─────────────────────┐
│ Restore  │  │ Show empty state    │
│ selected │  │ "Chọn cuộc trò      │
│ conv     │  │  chuyện để bắt đầu" │
└──────────┘  └─────────────────────┘
     ↓                ↓
     ↓         ┌─────────────┐
     ↓         │ User selects│
     ↓         │ new conv    │
     ↓         └─────────────┘
     ↓                ↓
     ↓←───────────────┘
     ↓
┌──────────────────────┐
│ Save to localStorage │
│ selectedConvId = id  │
└──────────────────────┘
     ↓
┌──────────────────────┐
│ Load conversation    │
│ messages             │
└──────────────────────┘
```

**Special Cases:**

**Case 1: Reload/Reopen Tab**

```
Page reload/reopen
        ↓
Read localStorage (has ID)
        ↓
Validate ID exists in list
        ↓
Restore conversation
```

**Case 2: First Visit (No saved ID)**

```
First visit
        ↓
No localStorage ID
        ↓
Fetch conversations
        ↓
   ┌────┴────┐
   │ List    │
   │ empty?  │
   └────┬────┘
    Yes ↓   ↓ No
  Empty    Select
  state    latest
           (first item)
```

**Case 3: Saved Conversation Deleted**

```
Reload page
        ↓
Read localStorage (has ID)
        ↓
Fetch conversations
        ↓
ID not found in list
        ↓
Show empty state
        ↓
Clear localStorage
```

**Case 4: User Logout**

```
User clicks Logout
        ↓
Clear auth tokens
        ↓
Clear localStorage
  - selectedConvId
  - Other chat state
        ↓
Redirect to Login
```

---

### Flow-4: Delete File Confirmation (per decision #3)

```
User clicks [✕] delete button
        ↓
┌─────────────────────┐
│ Show confirm dialog │
│ "Xác nhận xoá file?"│
└─────────────────────┘
        ↓
┌─────────────────┐
│ User clicks...  │
└─────────────────┘
      ↙        ↘
  [Huỷ]      [Xoá]
    ↓           ↓
Close      ┌──────────────┐
dialog     │ Remove file  │
           │ from list    │
           └──────────────┘
                  ↓
           ┌──────────────┐
           │ If uploaded: │
           │ Call DELETE  │
           │ API (if need)│
           └──────────────┘
                  ↓
           ┌──────────────┐
           │ Update UI    │
           │ (file gone)  │
           └──────────────┘
```

**Key Points:**

- Confirmation dialog shows file name
- If file uploaded to server, optionally call DELETE API
- If file only in local state, just remove from UI

---

### Flow-5: Network Status Detection

```
App mounted
        ↓
┌─────────────────────┐
│ Listen to events:   │
│ - window.online     │
│ - window.offline    │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ navigator.onLine    │
│ check               │
└─────────────────────┘
        ↓
     ┌──┴──┐
     │Online│
     └──┬──┘
  Yes ↓     ↓ No
┌──────────┐  ┌─────────────────────┐
│ Normal   │  │ Show offline banner │
│ mode     │  │ (top, amber)        │
└──────────┘  └─────────────────────┘
     ↓                ↓
     ↓         ┌─────────────────────┐
     ↓         │ Listen for 'online' │
     ↓         │ event               │
     ↓         └─────────────────────┘
     ↓                ↓
     ↓              Online
     ↓                ↓
     ↓         ┌─────────────────────┐
     ↓         │ Hide offline banner │
     ↓         │ Show reconnecting   │
     ↓         └─────────────────────┘
     ↓                ↓
     ↓         ┌─────────────────────┐
     ↓         │ Retry pending       │
     ↓         │ requests (if any)   │
     ↓         └─────────────────────┘
     ↓                ↓
     ↓←───────────────┘
     ↓
┌──────────────┐
│ Normal mode  │
└──────────────┘
```

**Event Listeners:**

```javascript
window.addEventListener("online", handleOnline);
window.addEventListener("offline", handleOffline);
```

**Offline Behavior:**

- Upload attempts: Immediately fail with network error
- Send attempts: Immediately fail with network error
- Show amber banner at top (per decision #5)
- Disable Send button (optional)

---

### Flow-6: Toast Notification Lifecycle

```
Error occurs
  (Upload fail OR Send fail)
        ↓
┌─────────────────────┐
│ Create toast        │
│ - Error message     │
│ - File name (if any)│
│ - Auto-dismiss: 3s  │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Animate in          │
│ (slide + fade)      │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Show toast          │
│ (visible state)     │
└─────────────────────┘
        ↓
     ┌──┴──┐
     │User │
     │act? │
     └──┬──┘
      ↙    ↘
  [✕ Click]  Wait 3s
     ↓         ↓
Close      Timeout
now           ↓
     ↓         ↓
     └────┬────┘
          ↓
┌─────────────────────┐
│ Animate out         │
│ (fade + slide up)   │
└─────────────────────┘
          ↓
┌─────────────────────┐
│ Remove from DOM     │
└─────────────────────┘
```

**Multiple Toasts:**

```
Error 1 occurs
        ↓
Show Toast 1
        ↓
(1 second later)
Error 2 occurs
        ↓
Show Toast 2
  (stacked below Toast 1)
        ↓
Toast 1 timeout (3s)
        ↓
Remove Toast 1
        ↓
Toast 2 moves up
        ↓
Toast 2 timeout (3s)
        ↓
Remove Toast 2
```

**Stacking Strategy:**

- Max 3 toasts visible
- New toasts push from bottom
- Oldest toast auto-dismissed first
- Position: `fixed top-4` with `gap-2` between toasts

---

## 🔀 Edge Cases & Error Scenarios

### Edge-1: Concurrent Retries

```
User clicks Retry on Message 1
        ↓
Request 1 in progress
        ↓
User clicks Retry on Message 2
        ↓
Request 2 in progress (parallel)
        ↓
Both can succeed/fail independently
```

**Handling:**

- Each retry tracked independently
- No queue needed
- Concurrent requests allowed

---

### Edge-2: Page Reload During Upload

```
Upload in progress (50%)
        ↓
User reloads page
        ↓
Upload cancelled (browser behavior)
        ↓
Page loads
        ↓
File lost (not in localStorage)
        ↓
User must re-select file
```

**Handling:**

- No upload resume (out of scope)
- Clear explanation if user asks
- File state not persisted across reloads

---

### Edge-3: Multiple Tabs - Conversation Selection

```
Tab A: Select Conversation X
        ↓
localStorage.setItem('selectedConvId', 'X')
        ↓
Tab B: Select Conversation Y
        ↓
localStorage.setItem('selectedConvId', 'Y')
  (Overwrites X)
        ↓
Tab A: Reload page
        ↓
Read localStorage → 'Y'
        ↓
Restores Conversation Y (not X)
```

**Behavior (per decision #10 - Last write wins):**

- No conflict resolution
- Latest selection persists
- Simple and predictable

---

### Edge-4: Max Retries Exceeded

```
Retry attempt 1 → Fail
        ↓
Retry attempt 2 → Fail
        ↓
Retry attempt 3 → Fail
        ↓
┌─────────────────────────┐
│ Disable retry button    │
│ Show: "Đã thử tối đa    │
│ 3 lần. Vui lòng kiểm    │
│ tra kết nối mạng."      │
└─────────────────────────┘
        ↓
Only [Xoá] button available
```

---

## 📊 State Transitions Summary

### File Upload States

```
[Selected] → [Validating] → [Valid/Invalid]
                               ↓       ↓
                         [Uploading] [Error]
                               ↓       ↓
                          [Success] [Retry]
                                      ↓
                               (Loop to Uploading)
```

### Message Send States

```
[Draft] → [Sending] → [Sent/Failed]
                          ↓     ↓
                      [Done] [Retry]
                              ↓
                       (Loop to Sending)
```

### Conversation Selection States

```
[No Selection] → [Selecting] → [Selected]
       ↓                            ↓
   [Empty State]            [Persisted to localStorage]
                                    ↓
                            [Restored on reload]
```

---

## ⏳ PENDING DECISIONS

| #   | Question                                      | HUMAN Decision |
| --- | --------------------------------------------- | -------------- |
| 1   | Retry có exponential backoff hay fixed delay? | ⬜ **\_\_\_**  |
| 2   | Network banner auto-hide khi reconnect?       | ⬜ **\_\_\_**  |
| 3   | Failed files có auto-remove sau X phút?       | ⬜ **\_\_\_**  |
| 4   | Conversation list có auto-refresh interval?   | ⬜ **\_\_\_**  |
| 5   | Toast có sound notification (beep)?           | ⬜ **\_\_\_**  |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status           |
| ------------------------------ | ---------------- |
| Đã review tất cả flow diagrams | ⬜ Chưa review   |
| Đã review edge cases           | ⬜ Chưa review   |
| Đã review state transitions    | ⬜ Chưa review   |
| Đã điền Pending Decisions      | ⬜ Chưa điền     |
| **APPROVED flows**             | ⬜ CHƯA APPROVED |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC proceed to implementation plan (BƯỚC 4) nếu flows chưa approved**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 6 Overview
- [01_requirements.md](./01_requirements.md) - Requirements (✅ APPROVED)
- [02a_wireframe.md](./02a_wireframe.md) - Wireframes (⏳ PENDING)
- Next: [04_implementation-plan.md](./04_implementation-plan.md) - Implementation Plan (⏳ PENDING)

---

## 📝 Change Log

| Version | Date       | Changes                       | Author |
| ------- | ---------- | ----------------------------- | ------ |
| 1.0     | 2026-01-12 | Initial flow diagrams created | AI     |
