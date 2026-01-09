# [BƯỚC 2A] Wireframe - Upgrade Conversation UX

> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-07  
> **Version:** 1.0

---

## 🎨 UI Component Changes

### 1. Conversation List Item - Enhanced

#### Current Design

```
┌─────────────────────────────────────────────────┐
│ [Avatar] Group Name                             │
│          Last message preview...                │
└─────────────────────────────────────────────────┘
```

#### New Design

```
┌─────────────────────────────────────────────────┐
│ [Avatar] Group Name                    [Badge 3]│
│          Sender: Message preview...  5 phút trước│
│          [📎] (nếu có attachment)                │
└─────────────────────────────────────────────────┘
```

#### Specifications

**Layout:**

```
┌── Conversation Item (padding: 12px 16px, hover:bg-gray-50) ────┐
│                                                                  │
│  ┌─────┐  ┌────────────────────────────┐  ┌──────────────┐    │
│  │     │  │ Group Name (font-semibold) │  │ Unread Badge │    │
│  │ Img │  │                            │  │   (if > 0)   │    │
│  │ 48px│  │ Sender: Message preview... │  │              │    │
│  │     │  │ (text-gray-600, truncate)  │  │ Time: 5p ago │    │
│  └─────┘  │ [📎] Attachment indicator   │  │ (text-xs)    │    │
│           └────────────────────────────┘  └──────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Element Sizes:**

- Avatar: `48x48px`, rounded-full
- Group Name: `font-semibold text-base`, truncate if > 200px
- Message Preview: `text-sm text-gray-600`, max 50 characters + "..."
- Time: `text-xs text-gray-500`, relative format
- Unread Badge: `min-w-[20px] h-20px`, red background, white text

**Unread Badge:**

```css
Badge {
  background: #2f9132 (brand-600 - xanh lá)
  color: white
  border-radius: 9999px (rounded-full)
  padding: 0 6px
  font-size: 10px
  font-weight: 600 (semibold)
  min-width: 20px
  text-align: center
}

/* Số lượng hiển thị */
1-99: Hiển thị số chính xác ("3", "15", "99")
100+: Hiển thị "99+"
```

**Note:** Component này đã tồn tại trong codebase tại `ConversationListSidebar.tsx` với function `badgeUnread()`.

**Message Preview Format:**

```typescript
// Text message
"Sender: Content here truncated...";

// Image message
"Sender: [Hình ảnh] 📷";

// File message
"Sender: [File] 📎 filename.pdf";

// Task message
"Sender: [Task] 📋 Task title";
```

**Attachment Indicator:**

- Icon: `📎` hoặc `<Paperclip size={14} />`
- Position: Below message preview
- Color: text-gray-400
- Only show nếu `lastMessage.attachments?.length > 0`

---

### 2. Chat Input Area - Multi-line Support

#### Current Design

```
┌──────────────────────────────────────────────────┐
│ [Input - single line........................] 🔘│
└──────────────────────────────────────────────────┘
```

#### New Design

```
┌──────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────┐   │
│ │ Textarea - line 1                          │ 🔘│
│ │ line 2 (Shift+Enter)                       │   │
│ │ line 3...                                  │   │
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

#### Specifications

**Layout:**

```
┌── Input Container (border-t border-gray-200) ────────┐
│                                                       │
│  ┌── Textarea (auto-resize) ──────────┐  ┌────────┐ │
│  │                                    │  │ Send   │ │
│  │ Multi-line content here...        │  │ Button │ │
│  │ (min-height: 40px)                │  │ 40x40  │ │
│  │ (max-height: 120px = 5 lines)     │  │        │ │
│  └────────────────────────────────────┘  └────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Textarea Specs:**

```css
Textarea {
  min-height: 40px          /* 1 dòng */
  max-height: 120px         /* 5 dòng */
  padding: 10px 12px
  border: 1px solid #E5E7EB
  border-radius: 8px
  font-size: 14px
  line-height: 20px
  resize: none              /* Disable manual resize */
  overflow-y: auto          /* Scroll khi > 5 dòng */
}

/* Tính toán height */
1 dòng: 40px (padding 20px + line 20px)
2 dòng: 60px
3 dòng: 80px
4 dòng: 100px
5 dòng: 120px (MAX)
6+ dòng: 120px + scrollbar
```

**Send Button:**

- Size: `40x40px`
- Icon: `<Send size={20} />`
- Background: `bg-brand-600` (#2f9132 - xanh lá) (enabled), `bg-gray-300` (disabled)
- Hover: `bg-brand-700` (#257229)
- Disabled khi: `input.trim() === ""`
- Position: `flex items-end` (align bottom)
- Text: `text-white font-medium`

**Note:** Màu brand-600 giống với design hiện tại trong `ChatMessagePanel.tsx`.

---

### 3. Responsive Behavior

#### Desktop (>= 1024px)

```
┌────── Conversation List (320px) ──┬────── Chat Main (flex-1) ──────┐
│                                   │                                │
│  [Conversation Item]              │  [Chat Messages]               │
│  [Conversation Item - Active]     │                                │
│  [Conversation Item w/ Badge]     │                                │
│                                   │  ┌─────────────────────────┐  │
│                                   │  │ Textarea (auto-resize)  │  │
│                                   │  └─────────────────────────┘  │
│                                   │                                │
└───────────────────────────────────┴────────────────────────────────┘
```

#### Tablet (768px - 1023px)

- Conversation List: `280px` width
- Textarea max-height: `100px` (4 dòng)
- Font sizes giảm 10%

#### Mobile (< 768px)

- Conversation List: Full width view
- Chat Main: Full width view (toggle)
- Textarea: Full width, max-height `80px` (3 dòng)
- Helper text: Hidden

---

## 🎨 Visual States

### Conversation Item States

#### 1. Default (Unread)

```css
{
  background: white
  border-left: 3px solid blue-500  /* Indicator */
  font-weight: semibold (group name)
  unreadBadge: visible
}
```

#### 2. Active (Selected)

```css
{
  background: blue-50
  border-left: 3px solid blue-600
  unreadBadge: hidden
}
```

#### 3. Read (No unread)

```css
{
  background: white
  border-left: none
  font-weight: normal
  unreadBadge: hidden
}
```

#### 4. Hover

```css
{
  background: gray-50
  cursor: pointer
  transition: background 150ms
}
```

#### 5. Just Updated (New message)

```css
{
  background: yellow-50  /* Flash effect */
  transition: background 2s ease-out
  /* Sau 2s → chuyển về state tương ứng */
}
```

---

### Input States

#### 1. Empty

```css
Textarea {
  placeholder: "Nhập tin nhắn..."
  border-color: gray-300
}
SendButton {
  background: gray-300
  cursor: not-allowed
  disabled: true
}
```

#### 2. Has Content

```css
Textarea {
  border-color: brand-200 (focus)
}
SendButton {
  background: brand-600 (#2f9132)
  color: white
  cursor: pointer
  disabled: false
  hover: brand-700 (#257229)
}
```

#### 3. Focus

```css
Textarea {
  border-color: brand-200
  outline: 2px solid brand-50
}
```

#### 4. Multi-line (> 1 line)

```css
Textarea {
  height: auto (40px → 120px)
  overflow-y: auto (if > 120px)
}
SendButton {
  align-self: flex-end  /* Stick to bottom */
}
```

---

## 🎬 Animations & Transitions

### 1. Conversation Reordering

**Decision:** No animation (theo PENDING DECISION #3)

**Behavior:**

- Conversation nhảy lên đầu list ngay lập tức
- Lock scroll position (theo DECISION #5)
- Không có slide/fade animation

```typescript
// Pseudocode
onNewMessage(message) {
  const scrollY = listRef.current.scrollTop;

  // Update & resort list
  sortConversations();

  // Restore scroll position
  listRef.current.scrollTop = scrollY;
}
```

### 2. Unread Badge Appearance

```css
@keyframes badgeFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.unread-badge {
  animation: badgeFadeIn 200ms ease-out;
}
```

### 3. Flash Effect (New Message)

```css
@keyframes flash {
  0% {
    background: #fef9c3;
  } /* yellow-50 */
  100% {
    background: white;
  }
}

.conversation-item.just-updated {
  animation: flash 2s ease-out;
}
```

### 4. Textarea Auto-resize

```css
/* Smooth transition khi expand/collapse */
textarea {
  transition: height 150ms ease-out;
}
```

---

## 🧩 Component Breakdown

### Components cần tạo mới:

1. **`<UnreadBadge>`**

   ```tsx
   interface UnreadBadgeProps {
     count: number;
     className?: string;
   }
   ```

2. **`<MessagePreview>`**

   ```tsx
   interface MessagePreviewProps {
     message: LastMessage;
     maxLength?: number; // default: 50
   }
   ```

3. **`<RelativeTime>`**

   ```tsx
   interface RelativeTimeProps {
     timestamp: string | Date;
     className?: string;
   }
   ```

4. **`<AutoResizeTextarea>`**
   ```tsx
   interface AutoResizeTextareaProps {
     value: string;
     onChange: (value: string) => void;
     onSubmit: () => void;
     maxHeight?: number; // default: 120px
   }
   ```

### Components cần modify:

1. **`<ConversationList>`**

   - Add sorting logic
   - Render UnreadBadge
   - Render MessagePreview
   - Listen SignalR events

2. **`<ChatMainContainer>` (hoặc input container)**
   - Replace Input with AutoResizeTextarea
   - Add auto-focus logic
   - Add Shift+Enter handler

---

## 📱 Accessibility (a11y)

### Conversation List

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Conversation with ${groupName}, ${unreadCount} unread messages`}
  data-testid={`conversation-item-${id}`}
>
  {/* ... */}
  {unreadCount > 0 && (
    <span
      aria-live="polite"
      aria-atomic="true"
      data-testid={`unread-badge-${id}`}
    >
      {unreadCount}
    </span>
  )}
</div>
```

### Chat Input

```tsx
<textarea
  aria-label="Nhập tin nhắn"
  placeholder="Nhập tin nhắn..."
  data-testid="chat-message-input"
/>
```

---

## ⏳ PENDING DECISIONS (UI-specific)

| #   | Vấn đề                     | Lựa chọn                                  | HUMAN Decision                               |
| --- | -------------------------- | ----------------------------------------- | -------------------------------------------- |
| 1   | Flash effect duration      | 1s, 2s (khuyến nghị), hay 3s?             | ⬜ **2s**                                    |
| 2   | Unread border indicator    | Blue left border hay none?                | ⬜ **Tuân theo design đang có trong source** |
| 3   | Mobile textarea max-height | 3 dòng (60px), 4 dòng (80px), hay 5 dòng? | ⬜ **3 dòng**                                |
| 4   | Attachment icon            | Emoji 📎 hay Lucide `<Paperclip />`?      | ⬜ **Giữ như đang có**                       |

> ⚠️ **AI KHÔNG ĐƯỢC code UI nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                         | Status       |
| -------------------------------- | ------------ |
| Đã review UI specifications      | ✅ Đã review |
| Đã review Component breakdown    | ✅ Đã review |
| Đã điền UI Pending Decisions     | ✅ Đã điền   |
| **APPROVED để tiếp tục BƯỚC 2B** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

> ✅ **Wireframe approved - Có thể tiếp tục BƯỚC 2B (Flow)**

---

_Last updated: 2026-01-07_
