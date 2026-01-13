# [BƯỚC 1] Requirements - Chat UX Improvements (Phase 6)

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6 - Error Handling & Persistence  
> **Document Type:** Requirements Specification  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-12

---

## 📋 Feature Overview

Phase 6 cải thiện UX của chat với error handling tốt hơn, retry mechanisms, và conversation persistence khi user reload page hoặc reopen tab.

---

## ✅ Functional Requirements

### FR-1: File Upload Error Handling

| ID     | Requirement                                                         | Priority | Acceptance Criteria                                                |
| ------ | ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| FR-1.1 | Khi upload fail, hiển thị **toast error** phía trên màn hình        | MUST     | Toast hiện với message "Upload thất bại: [reason]", tự đóng sau 5s |
| FR-1.2 | Khi upload fail, hiển thị **inline error** ngay tại file trong chat | MUST     | Error message + icon hiện dưới file preview                        |
| FR-1.3 | Inline error PHẢI bao gồm reason (network, file too large, etc.)    | MUST     | Clear error text: "Lỗi: [reason]"                                  |
| FR-1.4 | User có thể **retry upload** từ inline error                        | MUST     | Button "Thử lại" visible, click để retry                           |
| FR-1.5 | User có thể **xoá failed file** từ inline error                     | MUST     | Button "Xoá" visible, click để remove                              |
| FR-1.6 | Failed files KHÔNG được include khi send message                    | MUST     | Only successfully uploaded files sent                              |
| FR-1.7 | Toast hiển thị số lượng files failed: "Upload thất bại: 2/5 files"  | SHOULD   | Count visible trong toast message                                  |

### FR-2: File Management UX

| ID     | Requirement                                                      | Priority | Acceptance Criteria                         |
| ------ | ---------------------------------------------------------------- | -------- | ------------------------------------------- |
| FR-2.1 | Button **delete file** LUÔN hiển thị (không chỉ khi hover)       | MUST     | Delete button (✕) visible at all times      |
| FR-2.2 | Delete button có clear visual affordance (icon + color)          | MUST     | Red/gray icon, hover effect                 |
| FR-2.3 | Delete button ở vị trí consistent (top-right corner của preview) | MUST     | Same position for all file types            |
| FR-2.4 | Confirm dialog khi delete file (optional - safety measure)       | SHOULD   | "Xác nhận xoá file?" dialog before deletion |

### FR-3: Message Send Error Handling

| ID     | Requirement                                                             | Priority | Acceptance Criteria                                             |
| ------ | ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| FR-3.1 | Message có **status indicators**: sending, sent, failed                 | MUST     | Visual indicator (icon/spinner) visible                         |
| FR-3.2 | Status "sending": Spinner animation hiển thị                            | MUST     | Spinner bên cạnh message bubble                                 |
| FR-3.3 | Status "sent": Checkmark (✓) hiển thị                                   | SHOULD   | Single checkmark, gray color                                    |
| FR-3.4 | Status "failed": Error icon (⚠) hiển thị + error message                | MUST     | Red warning icon + text "Gửi thất bại"                          |
| FR-3.5 | User có thể **retry send** từ failed message                            | MUST     | Button "Gửi lại" visible, click để retry                        |
| FR-3.6 | Failed message PHẢI detect reason: network error, server error, timeout | SHOULD   | Error message shows reason: "Lỗi mạng", "Lỗi server", "Timeout" |
| FR-3.7 | Network error detection: Check if offline                               | SHOULD   | Use `navigator.onLine` hoặc catch network errors                |
| FR-3.8 | Failed message có option **delete**                                     | SHOULD   | Button "Xoá" để remove failed message                           |
| FR-3.9 | Retry preserves original message content + attachments                  | MUST     | Same text + files khi retry                                     |

### FR-4: Conversation Persistence

| ID      | Requirement                                                                | Priority | Acceptance Criteria                                          |
| ------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| FR-4.1  | Khi user chọn conversation, save `conversationId` vào **localStorage**     | MUST     | `localStorage.setItem('selectedConversationId', id)`         |
| FR-4.2  | Khi user reload page, **restore** conversation từ localStorage             | MUST     | Auto-select saved conversation                               |
| FR-4.3  | Khi user reopen tab, restore conversation từ localStorage                  | MUST     | Same behavior as reload                                      |
| FR-4.4  | **First visit** (no saved conversation): Auto-open **latest** conversation | MUST     | Select first conversation từ list (sorted by latest message) |
| FR-4.5  | Nếu saved conversation **không tồn tại** (deleted): Show **empty state**   | MUST     | "Chọn cuộc trò chuyện để bắt đầu" screen                     |
| FR-4.6  | Empty state hiển thị placeholder text + icon                               | MUST     | Center-aligned, clear message                                |
| FR-4.7  | Clear localStorage khi user logout                                         | MUST     | Remove `selectedConversationId` on logout                    |
| FR-4.8  | Validate saved conversationId tồn tại trong conversation list              | MUST     | Check if ID exists before restoring                          |
| FR-4.9  | Nếu conversation list empty, show empty state (no auto-select)             | SHOULD   | "Chưa có cuộc trò chuyện" message                            |
| FR-4.10 | Support multiple tabs: Latest selection wins (last write wins strategy)    | COULD    | localStorage sync across tabs                                |

### FR-5: Loading & Error States

| ID     | Requirement                                                | Priority | Acceptance Criteria                       |
| ------ | ---------------------------------------------------------- | -------- | ----------------------------------------- |
| FR-5.1 | Khi retry upload, show loading spinner tại file            | MUST     | Spinner replaces error state              |
| FR-5.2 | Khi retry send message, show "sending" status              | MUST     | Spinner visible                           |
| FR-5.3 | Upload progress indicator (optional - if backend supports) | COULD    | Progress bar 0-100%                       |
| FR-5.4 | Network status indicator (online/offline)                  | SHOULD   | Banner "Bạn đang offline" khi no internet |

---

## 🔒 Non-Functional Requirements

### NFR-1: Performance

| ID      | Requirement                               | Target  | Measurement             |
| ------- | ----------------------------------------- | ------- | ----------------------- |
| NFR-1.1 | Retry upload response time < 3s           | < 3s    | Time to success/failure |
| NFR-1.2 | Retry send message response time < 2s     | < 2s    | Time to success/failure |
| NFR-1.3 | LocalStorage read/write < 50ms            | < 50ms  | Sync operation          |
| NFR-1.4 | Conversation restore on page load < 500ms | < 500ms | Time to render chat     |

### NFR-2: Usability

| ID      | Requirement                                                | Priority | Acceptance Criteria               |
| ------- | ---------------------------------------------------------- | -------- | --------------------------------- |
| NFR-2.1 | Error messages PHẢI user-friendly (Vietnamese, clear)      | MUST     | No technical jargon               |
| NFR-2.2 | Retry buttons PHẢI clear và prominent                      | MUST     | Blue/primary color, clear label   |
| NFR-2.3 | Delete button PHẢI có hover effect (color change)          | MUST     | Visual feedback on hover          |
| NFR-2.4 | Toast notifications KHÔNG block UI                         | MUST     | Top-center/top-right, dismissible |
| NFR-2.5 | Failed messages PHẢI visually distinct (lighter bg/border) | SHOULD   | Gray border or faded background   |

### NFR-3: Reliability

| ID      | Requirement                                        | Priority | Implementation                       |
| ------- | -------------------------------------------------- | -------- | ------------------------------------ |
| NFR-3.1 | Retry có exponential backoff nếu multiple failures | SHOULD   | 1s, 2s, 4s delays                    |
| NFR-3.2 | Max retry attempts = 3 cho upload/send             | SHOULD   | After 3 fails, show permanent error  |
| NFR-3.3 | LocalStorage có error handling nếu quota exceeded  | MUST     | Catch exception, fallback gracefully |
| NFR-3.4 | Validate localStorage data integrity (JSON parse)  | MUST     | Try-catch around JSON.parse          |

### NFR-4: Accessibility

| ID      | Requirement                                  | Priority | WCAG Level |
| ------- | -------------------------------------------- | -------- | ---------- |
| NFR-4.1 | Error icons có text alternative (aria-label) | MUST     | AA         |
| NFR-4.2 | Retry buttons keyboard accessible (Tab)      | MUST     | AA         |
| NFR-4.3 | Status indicators có text labels             | SHOULD   | AA         |
| NFR-4.4 | Toast có role="alert" cho screen readers     | SHOULD   | AA         |

---

## 🎨 UI/UX Requirements

### UI-1: File Upload Error Display

```
┌─────────────────────────────────────────────┐
│ [Attach] [Image]                            │
├─────────────────────────────────────────────┤
│ Files đã chọn:                              │
│                                             │
│ ✅ document.pdf (2.3 MB)              [✕]  │
│                                             │
│ ⚠️ large-file.xlsx (25 MB)            [✕]  │
│    ❌ Lỗi: File quá lớn (max 20MB)         │
│    [Thử lại] [Xoá]                         │
│                                             │
│ ⏳ uploading.docx (1.5 MB)            [✕]  │
│    [Spinner] Đang tải lên...               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐ (Toast - top-right)
│ ⚠️ Upload thất bại: 1/2 files              │
│ large-file.xlsx - File quá lớn         [✕] │
└─────────────────────────────────────────────┘
```

**Legend:**

- ✅ = Successfully uploaded
- ⚠️ = Upload failed
- ⏳ = Currently uploading
- [✕] = Delete button (ALWAYS visible)

### UI-2: Message Status Indicators

```
Own Messages (right-aligned):
┌──────────────────────────────────────┐
│                 Hello! 10:30   [⏳]  │ ← Sending
│                 How are you? 10:31 ✓ │ ← Sent
│                 File.pdf 10:32 ⚠️    │ ← Failed
│                 Gửi thất bại         │
│                 [Gửi lại] [Xoá]      │
└──────────────────────────────────────┘

Received Messages (left-aligned):
┌──────────────────────────────────────┐
│ [Avatar] John                        │
│          I'm good! 10:33             │
└──────────────────────────────────────┘
```

**Status Icons:**

- ⏳ (Spinner) = Sending
- ✓ (Checkmark) = Sent successfully
- ⚠️ (Warning) = Failed to send

### UI-3: Empty State (No Conversation Selected)

```
┌─────────────────────────────────────────────┐
│ Conversations │ Chat                        │
├───────────────┼─────────────────────────────┤
│ [List]        │                             │
│               │        [💬 Icon]            │
│               │                             │
│               │  Chọn cuộc trò chuyện       │
│               │  để bắt đầu                 │
│               │                             │
│               │  Hoặc tạo cuộc trò chuyện   │
│               │  mới từ danh sách bên trái  │
│               │                             │
└───────────────┴─────────────────────────────┘
```

### UI-4: Delete Button Always Visible

**Before (Phase 5 - hover only):**

```
Hover OFF: document.pdf (2.3 MB)
Hover ON:  document.pdf (2.3 MB)  [✕]
```

**After (Phase 6 - always visible):**

```
Always:    document.pdf (2.3 MB)  [✕]
           (✕ in lighter gray, turns red on hover)
```

---

## ⏳ PENDING DECISIONS

| #   | Question                                              | Options                                  | HUMAN Decision                |
| --- | ----------------------------------------------------- | ---------------------------------------- | ----------------------------- |
| 1   | Toast auto-dismiss timeout?                           | 3s, 5s, 7s?                              | ⬜ **3s**                     |
| 2   | Max retry attempts cho upload/send?                   | 3, 5, unlimited?                         | ⬜ **3**                      |
| 3   | Confirm dialog khi delete file?                       | Yes/No                                   | ⬜ **Yes**                    |
| 4   | Message "sent" checkmark (✓) cần thiết?               | Yes/No (keep simple?)                    | ⬜ **No**                     |
| 5   | Network status banner position?                       | Top/Bottom                               | ⬜ **Top**                    |
| 6   | LocalStorage key naming convention?                   | `selectedConversationId` or `chatState`? | ⬜ **selectedConversationId** |
| 7   | Empty state có button "Tạo cuộc trò chuyện mới"?      | Yes/No (out of scope?)                   | ⬜ **No**                     |
| 8   | Failed message có option "Copy error details"?        | Yes/No (for debugging?)                  | ⬜ **No**                     |
| 9   | Upload progress bar (nếu backend support)?            | Yes/No                                   | ⬜ **No**                     |
| 10  | Delete button style: Icon only hay Icon + "Xoá" text? | Icon only / Icon + text                  | ⬜ **Icon only**              |

---

## 📊 Success Metrics

| Metric                             | Target | Measurement Method                  |
| ---------------------------------- | ------ | ----------------------------------- |
| Upload error visibility rate       | 100%   | All failed uploads show error       |
| Successful retry rate              | > 80%  | Retries succeed / Total retries     |
| Conversation persistence accuracy  | > 99%  | Correct conversation restored       |
| User satisfaction (error handling) | > 4/5  | User feedback survey                |
| Failed message retry success rate  | > 75%  | Retries succeed / Total failed msgs |

---

## 🚫 Out of Scope (Phase 6)

Các tính năng này KHÔNG implement trong Phase 6:

- ❌ Auto-retry failures (must be manual)
- ❌ Upload resume (partial upload continuation)
- ❌ Message delivery receipts (double checkmark "✓✓")
- ❌ Message read receipts (blue checkmark)
- ❌ Typing indicators
- ❌ Message editing
- ❌ Message deletion (server-side)
- ❌ Conversation archiving
- ❌ Push notifications for failed sends
- ❌ Offline queue (store messages to send when online)

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                              | Status       |
| ------------------------------------- | ------------ |
| Đã review Functional Requirements     | ✅ Đã review |
| Đã review Non-Functional Requirements | ✅ Đã review |
| Đã review UI/UX Requirements          | ✅ Đã review |
| Đã điền Pending Decisions             | ✅ Đã điền   |
| **APPROVED requirements**             | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-12

> ✅ **Requirements đã được approve - Proceed to BƯỚC 2 (Wireframe)**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 6 Overview
- Next: [02a_wireframe.md](./02a_wireframe.md) - UI Mockups (⏳ PENDING)
- Related: [../conversation-details-phase-5/](../conversation-details-phase-5/) - Phase 5 Docs

---

## 📝 Change Log

| Version | Date       | Changes                      | Author |
| ------- | ---------- | ---------------------------- | ------ |
| 1.0     | 2026-01-12 | Initial requirements created | AI     |
