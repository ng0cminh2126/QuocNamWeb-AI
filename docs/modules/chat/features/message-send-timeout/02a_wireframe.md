# [BƯỚC 2A] Wireframe - Message Send Timeout & Retry UI

**Feature:** Message Send Timeout & Retry UI  
**Module:** Chat  
**Version:** 1.0  
**Status:** ✅ APPROVED  
**Created:** 2026-01-13

---

## 📐 UI Components Overview

Feature này thêm 4 states mới cho message bubble:

1. **Sending State** - Đang gửi lần đầu
2. **Retrying State** - Đang thử lại (retry 2/3, 3/3)
3. **Failed State** - Gửi thất bại với nút Thử lại
4. **Success State** - Đã gửi thành công (existing)

---

## 🎨 Wireframe - Message Bubble States

### State 1: Sending (Initial Send - 0-5s)

```
┌─────────────────────────────────────────────────────────┐
│                                            [User Avatar] │
│                                                          │
│              ┌──────────────────────────────────────┐   │
│              │ Hello world! Đây là tin nhắn test   │   │
│              │                                      │   │
│              │ ┌────────────────────────────────┐  │   │
│              │ │ ⏱️ Đang gửi...         [●●○]   │  │   │
│              │ └────────────────────────────────┘  │   │
│              └──────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘

Components:
- Bubble: bg-brand-600 (green) with opacity-90
- Status bar: flex justify-between, text-xs text-gray-600
- Spinner: Loader2 icon rotating (size-3)
```

**Specifications:**

- Background: `bg-brand-600/90` (slightly transparent to indicate pending)
- Status text: "Đang gửi..." (text-xs, text-white/80)
- Spinner: `Loader2` icon, size-3, animate-spin
- No timestamp shown
- No checkmark

---

### State 2: Retrying (After 1st Fail - Retry 2/3)

```
┌─────────────────────────────────────────────────────────┐
│                                            [User Avatar] │
│                                                          │
│              ┌──────────────────────────────────────┐   │
│              │ Hello world! Đây là tin nhắn test   │   │
│              │                                      │   │
│              │ ┌────────────────────────────────┐  │   │
│              │ │ 🔄 Thử lại 2/3...      [●●○]   │  │   │
│              │ └────────────────────────────────┘  │   │
│              └──────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘

Components:
- Bubble: bg-brand-600 with opacity-90
- Status bar: flex justify-between, text-xs text-orange-600
- Icon: RefreshCw icon rotating (size-3)
- Text: "Thử lại 2/3..." or "Thử lại 3/3..."
```

**Specifications:**

- Background: `bg-brand-600/90` (same as sending)
- Status text: "🔄 Thử lại 2/3..." (text-xs, text-white/80)
- Icon: `RefreshCw` rotating, size-3
- Retry count: Dynamic "2/3" or "3/3"
- Color changes to `text-orange-400` to indicate retry

---

### State 3: Failed (After All Retries - Timeout)

```
┌─────────────────────────────────────────────────────────┐
│                                            [User Avatar] │
│                                                          │
│              ┌──────────────────────────────────────┐   │
│              │ Hello world! Đây là tin nhắn test   │   │
│              │                                      │   │
│              │ ┌────────────────────────────────┐  │   │
│              │ │ ❌ Gửi thất bại - Mất mạng      │  │   │
│              │ └────────────────────────────────┘  │   │
│              └──────────────────────────────────────┘   │
│                                                          │
│              ┌────────────────────┐                     │
│              │  🔄  Thử lại       │                     │
│              └────────────────────┘                     │
│                  (Button below bubble)                   │
└─────────────────────────────────────────────────────────┘

Components:
- Bubble: border-red-400 with bg-red-50/50
- Status bar: text-red-600 with AlertCircle icon
- Retry button: Below bubble, variant="outline", size="sm"
- Auto-hide after 30s (as per decision #4)
```

**Specifications:**

- Background: `bg-red-50/50` with `border-2 border-red-400`
- Content text: Normal opacity (not faded)
- Status bar:
  - Icon: `AlertCircle` size-3, text-red-600
  - Text: "Gửi thất bại - Mất mạng" (text-xs, text-red-600)
- Retry button:
  - Position: Below bubble, mt-1, self-end
  - Variant: `outline`
  - Size: `sm`
  - Text: "🔄 Thử lại"
  - Hover: bg-gray-100
- Auto-hide: After 30s, fade out and remove from DOM

---

### State 4: Success (Existing - After SignalR Delivery)

```
┌─────────────────────────────────────────────────────────┐
│                                            [User Avatar] │
│                                                          │
│              ┌──────────────────────────────────────┐   │
│              │ Hello world! Đây là tin nhắn test   │   │
│              │                                      │   │
│              │                         ✓ 10:30 AM   │   │
│              └──────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘

Components:
- Bubble: bg-brand-600 (full opacity)
- Timestamp: text-xs, text-white/60
- Checkmark: Check icon, size-3
```

**Specifications:**

- Background: `bg-brand-600` (full opacity, no transparency)
- Timestamp: "✓ 10:30 AM" (text-xs, text-white/60)
- Checkmark: `Check` icon, size-3
- This is existing design, no changes needed

---

## 🔘 Send Button States

### State A: Idle (Ready to Send)

```
┌────────────────────────────────────────────────────┐
│ [Type a message...]                    [ ⬆ Gửi ]  │
└────────────────────────────────────────────────────┘
                                           ↑
                                    bg-brand-600, enabled
```

**Specifications:**

- Icon: `Send` (Lucide icon)
- Text: "Gửi"
- Background: `bg-brand-600`
- Cursor: `pointer`
- Disabled: `false`

---

### State B: Sending/Retrying (Disabled)

```
┌────────────────────────────────────────────────────┐
│ [Type a message...]          [ ●●○ Đang gửi... ]  │
└────────────────────────────────────────────────────┘
                                       ↑
                              bg-gray-400, disabled
```

**Specifications:**

- Icon: `Loader2` rotating
- Text: "Đang gửi..."
- Background: `bg-gray-400` (disabled state)
- Cursor: `not-allowed`
- Disabled: `true`
- Animation: Spinner rotates continuously

---

## 📱 Responsive Behavior

### Desktop (≥768px)

- Bubble max-width: `max-w-[70%]`
- Retry button: `w-auto` (fit content)
- Status bar: Always visible inside bubble

### Mobile (<768px)

- Bubble max-width: `max-w-[85%]`
- Retry button: `w-auto` (fit content)
- Status bar: Always visible inside bubble
- Font sizes remain same (text-xs for status)

---

## 🌈 Color Palette

### Message Bubble Colors

| State    | Background        | Border           | Text Color      |
| -------- | ----------------- | ---------------- | --------------- |
| Sending  | `bg-brand-600/90` | None             | `text-white`    |
| Retrying | `bg-brand-600/90` | None             | `text-white`    |
| Failed   | `bg-red-50/50`    | `border-red-400` | `text-gray-900` |
| Success  | `bg-brand-600`    | None             | `text-white`    |

### Status Text Colors

| State    | Icon Color        | Text Color      |
| -------- | ----------------- | --------------- |
| Sending  | `text-white/80`   | `text-white/80` |
| Retrying | `text-orange-400` | `text-white/80` |
| Failed   | `text-red-600`    | `text-red-600`  |
| Success  | `text-white/60`   | `text-white/60` |

### Button Colors

| State       | Background     | Text Color      | Hover                |
| ----------- | -------------- | --------------- | -------------------- |
| Send (idle) | `bg-brand-600` | `text-white`    | `hover:bg-brand-700` |
| Sending     | `bg-gray-400`  | `text-white`    | None (disabled)      |
| Retry       | `bg-white`     | `text-gray-700` | `hover:bg-gray-100`  |

---

## 🎯 Interaction Patterns

### Pattern 1: Normal Send Flow

```
User types → Click "Gửi"
    ↓
Button changes: "Đang gửi..." (disabled, spinner)
    ↓
Bubble appears: "Đang gửi..." state
    ↓
After 0.5-2s: SignalR delivers message
    ↓
Bubble updates: "✓ 10:30 AM" (success state)
    ↓
Button resets: "Gửi" (enabled)
```

### Pattern 2: Network Error → Retry → Success

```
User types → Click "Gửi"
    ↓
Bubble: "Đang gửi..."
    ↓
Network error after 1s → Retry #1 starts
    ↓
Bubble: "🔄 Thử lại 2/3..."
    ↓
Success after retry
    ↓
Bubble: "✓ 10:30 AM"
```

### Pattern 3: Network Error → All Retries Fail

```
User types → Click "Gửi"
    ↓
Bubble: "Đang gửi..."
    ↓
Network error → Retry 2/3 → Retry 3/3
    ↓
All failed after 10s timeout
    ↓
Bubble: "❌ Gửi thất bại - Mất mạng"
    ↓
Show "Thử lại" button below bubble
    ↓
User clicks "Thử lại" → Restart flow from beginning
```

### Pattern 4: Auto-Hide Failed Message

```
Failed message appears
    ↓
30 seconds countdown (invisible to user)
    ↓
After 30s: Fade out animation (opacity 0 over 300ms)
    ↓
Remove from DOM
    ↓
Message saved in localStorage `failedMessages` queue
```

---

## 🎭 Animation Specifications

### Spinner Animation (Sending/Retrying)

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Fade Out Animation (Auto-hide Failed)

```css
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-out {
  animation: fadeOut 300ms ease-out forwards;
}
```

### Retry Button Hover

```css
.retry-button:hover {
  background-color: rgb(243 244 246); /* gray-100 */
  transition: background-color 150ms ease-in-out;
}
```

---

## 📋 Component Hierarchy

```
ChatMainContainer
├── MessagesContainer
│   └── MessageBubbleSimple (for each message)
│       ├── MessageContent (text/attachments)
│       ├── MessageStatusIndicator (NEW)
│       │   ├── Sending: "⏱️ Đang gửi... [Spinner]"
│       │   ├── Retrying: "🔄 Thử lại 2/3... [RefreshCw]"
│       │   ├── Failed: "❌ Gửi thất bại - Mất mạng"
│       │   └── Success: "✓ 10:30 AM"
│       └── RetryButton (NEW - conditional, only for failed)
└── ChatInputArea
    ├── FilePreview (existing)
    ├── TextArea (existing)
    └── SendButton (modified with disabled state)
```

---

## 🔧 Props Specifications

### MessageBubbleSimple (Updated)

```typescript
interface MessageBubbleSimpleProps {
  message: ChatMessage;

  // NEW: Message send status
  sendStatus?: "sending" | "retrying" | "failed" | "sent";
  retryCount?: number; // 2 or 3
  maxRetries?: number; // 3

  // NEW: Retry handler
  onRetry?: (messageId: string) => void;

  // Existing props
  isOwn: boolean;
  senderName?: string;
  timestamp: string;
  avatar?: string;
  // ... other existing props
}
```

### MessageStatusIndicator (NEW Component)

```typescript
interface MessageStatusIndicatorProps {
  status: "sending" | "retrying" | "failed" | "sent";
  retryCount?: number; // For retrying state: 2 or 3
  maxRetries?: number; // For retrying state: 3
  timestamp?: string; // For sent state: "10:30 AM"
  errorMessage?: string; // For failed state: "Mất kết nối mạng"
}
```

### RetryButton (NEW Component)

```typescript
interface RetryButtonProps {
  messageId: string;
  onRetry: (messageId: string) => void;
  isLoading?: boolean; // True if currently retrying
}
```

---

## 📊 PENDING DECISIONS (UI-specific)

| #   | Vấn đề                         | Lựa chọn                             | HUMAN Decision            |
| --- | ------------------------------ | ------------------------------------ | ------------------------- |
| 1   | Failed bubble background       | red-50/50 or red-100/50?             | ⬜ **red-50/50**          |
| 2   | Retry button icon              | RefreshCw or RotateCw?               | ⬜ **RefreshCw**          |
| 3   | Auto-hide animation duration   | 300ms or 500ms?                      | ⬜ **300ms**              |
| 4   | Status bar position            | Top or bottom of bubble?             | ⬜ **bottom**             |
| 5   | Failed message border width    | border-2 or border?                  | ⬜ **border**             |
| 6   | Offline pre-check notification | Show banner at top or inline bubble? | ⬜ **Show banner at top** |

> ⚠️ **AI KHÔNG ĐƯỢC code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review UI Designs      | ⬜ Chưa review   |
| Đã điền Pending Decisions | ⬜ Chưa điền     |
| **APPROVED để tiếp tục**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [___________]  
**Date:** [___________]

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo flow/implementation nếu wireframe chưa approved**

---

## 📝 Notes

- **Auto-hide timing:** 30s countdown starts từ khi failed state xuất hiện
- **Navigator.onLine check:** Nếu offline trước khi gửi → Show banner "Không có kết nối mạng" (decision #6)
- **Toast notification:** Show toast error CÙNG LÚC với inline failed state (as per requirement decision #8)
- **Retry button always below bubble** (as per requirement decision #5)
- **Status bar font:** text-xs để không chiếm quá nhiều space
