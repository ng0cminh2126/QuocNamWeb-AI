# [BƯỚC 2A] Wireframe - Category List Real-time Update

**Feature:** Category List Real-time Update  
**Version:** 1.1 (Enhanced)  
**Date:** 2026-01-23  
**Status:** ✅ APPROVED

---

## 1. DESKTOP LAYOUT (≥ 768px)

### Category List Item - Full Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Team Backend                    5 phút trước        │
│  │ TB│  John: Đã hoàn thành task XYZ                      [3]│
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
   ^      ^                                ^                ^
   |      |                                |                |
 Avatar  Line 1: Group Name           Timestamp
        Line 2: Sender + Message Preview          Unread Badge
```

### Component Breakdown

```
┌────────────────────────────────────────────────────────────────┐
│ Category Item Container                                        │
│ • padding: p-3 (12px)                                         │
│ • hover: bg-gray-50                                           │
│ • cursor: pointer                                             │
│ • flex items-start gap-3                                      │
│ • relative (for badge positioning)                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐  ┌──────────────────────────────────────┐   │
│  │   Avatar    │  │  Content Area (flex-1)               │   │
│  │   40x40px   │  │                                      │   │
│  │   rounded   │  │  ┌────────────────────────────────┐  │   │
│  │   bg-brand  │  │  │ Header Row (flex justify-between)│  │   │
│  └─────────────┘  │  │                                  │  │   │
│                   │  │  [Group Name]      [Timestamp]   │  │   │
│                   │  │  text-sm           text-xs       │  │   │
│                   │  │  font-medium       text-gray-400 │  │   │
│                   │  └────────────────────────────────┘  │   │
│                   │                                      │   │
│                   │  ┌────────────────────────────────┐  │   │
│                   │  │ Message Preview Row (flex)      │  │   │
│                   │  │                                  │  │   │
│                   │  │  [Sender]: [Message...] [Badge] │  │   │
│                   │  │  text-xs truncate    bg-brand   │  │   │
│                   │  │  text-gray-500       text-white │  │   │
│                   │  │                      min-w-20px │  │   │
│                   │  └────────────────────────────────┘  │   │
│                   └──────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. DETAILED EXAMPLES

### Example 1: Text Message

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Team Backend                    Vừa xong           │
│  │ TB│  John Doe: Đã hoàn thành task XYZ, cần review    [2]│
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Breakdown:**

- Avatar: `TB` (initials), 40x40px, bg-brand-600/10, text-brand-700
- Line 1 Left: `Team Backend` (font-medium text-sm)
- Line 1 Right: `Vừa xong` (text-xs text-gray-400)
- Line 2: Message preview (text-xs text-gray-500) + Badge inline
- Badge: `2` (bg-brand-600 text-white rounded-full, min-w-20px, h-4, text-[10px])

---

### Example 2: Image Message (Single)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Marketing Team                  15 phút trước      │
│  │ MT│  Sarah: đã gửi 1 ảnh                              [5]│
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Message Preview:** `Sarah: đã gửi 1 ảnh` (italicized optional)

---

### Example 3: Multiple Images

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Design Team                     2 giờ trước        │
│  │ DT│  Mike: đã gửi 5 ảnh                                  │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Message Preview:** `Mike: đã gửi 5 ảnh`

---

### Example 4: Single File

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Project Alpha                   1 ngày trước       │
│  │ PA│  Jane: đã gửi tệp report_final.pdf               [12]│
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Message Preview:** `Jane: đã gửi tệp report_final.pdf`

**Truncation:** Nếu filename quá dài:

```
Jane: đã gửi tệp report_final_v3...pdf
```

---

### Example 5: Multiple Files

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  HR Department                   23 giờ trước       │
│  │ HR│  Tom: đã gửi 3 tệp                                   │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Message Preview:** `Tom: đã gửi 3 tệp`

---

### Example 6: Old Message (> 7 days)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Old Project                     15/01              │
│  │ OP│  Alice: Meeting notes uploaded                       │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Timestamp:** `15/01` (DD/MM format)

---

### Example 7: No Messages

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  New Project                                         │
│  │ NP│  Chưa có tin nhắn                                    │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Empty State:** `Chưa có tin nhắn` (text-xs text-gray-400)

---

## 3. MOBILE LAYOUT (< 768px)

### Compact Version

```
┌───────────────────────────────────────┐
│ ┌─┐ Team Backend      Vừa xong       │
│ │T│ John: Hoàn thành task XYZ     [2]│
│ └─┘                                   │
└───────────────────────────────────────┘
```

**Changes:**

- Avatar: 32x32px (smaller)
- Padding: p-2 (8px)
- Font sizes: Same
- Truncate earlier (35 chars instead of 50)

---

## 4. STATES & INTERACTIONS

### Hover State

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Team Backend                    Vừa xong        [2]│
│  │ TB│  John: Đã hoàn thành task XYZ                        │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
   ↑ bg-gray-50 on hover
```

---

### Selected State

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Team Backend                    Vừa xong           │
│  │ TB│  John: Đã hoàn thành task XYZ                        │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
   ↑ bg-brand-50 ring-1 ring-brand-100
   ↑ Badge still visible (shows unread count from category)
```

---

### Loading State

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  ████████████                ████████               │
│  │ ░ │  ████████████████████████████                        │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
   ↑ Skeleton loader while fetching
```

---

### Real-time Update Animation

**Badge increment:**

```
[2] → [3]
  ↑
  Scale animation (0.8 → 1.2 → 1.0)
  Duration: 200ms
```

**Message update:**

```
Old: John: Old message
          ↓ fade-out (100ms)
          ↓ update content
          ↓ fade-in (100ms)
New: Jane: New message just arrived
```

---

## 5. COLOR PALETTE

```
• Avatar Background:     bg-brand-600/10   (#hex with 10% opacity)
• Avatar Text:           text-brand-700
• Group Name:            text-gray-900 font-medium
• Timestamp:             text-gray-400
• Sender Name:           text-gray-700 font-medium
• Message Content:       text-gray-500
• Empty State:           text-gray-400
• Unread Badge BG:       bg-brand-600
• Unread Badge Text:     text-white
• Hover Background:      bg-gray-50
• Selected Background:   bg-brand-50
• Selected Ring:         ring-brand-100
```

---

## 6. TYPOGRAPHY

```
• Group Name:        text-sm font-medium
• Timestamp:         text-xs font-normal
• Message Content:   text-xs font-normal (gray-500)
• Badge:             text-[10px] font-semibold
```

---

## 7. SPACING & SIZING

```
Desktop:
• Container padding:     p-3 (12px)
• Avatar size:           40x40px
• Gap between elements:  gap-3 (12px)
• Badge padding:         px-1.5 py-0 (height: h-4/16px)
• Badge position:        inline on Line 2, ml-2
• Badge size:            min-w-[20px] h-4

Mobile:
• Container padding:     p-2 (8px)
• Avatar size:           32x32px
• Gap between elements:  gap-2 (8px)
• Badge padding:         px-1.5 py-0 (height: h-4/16px)
• Badge position:        inline on Line 2
• Badge size:            min-w-[20px] h-4
```

---

## 8. TRUNCATION RULES

### Message Content

```
Desktop:  Max 50 characters
Mobile:   Max 35 characters

Method: CSS truncate with ellipsis
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
```

### Filename Truncation

```
Max length: 20 characters (excluding extension)

Example:
Input:  "project_final_report_v3_updated.pdf"
Output: "project_final_r...pdf"

Algorithm:
- Keep first 15 chars
- Add "..."
- Keep file extension (last 3-4 chars after dot)
```

---

## 9. ACCESSIBILITY

```
• Badge aria-label:        aria-label="3 tin nhắn chưa đọc"
• Category button:         role="button" aria-pressed="false"
• Timestamp:               <time datetime="2026-01-23T10:00:00Z">5 phút trước</time>
• Avatar alt text:         alt="Team Backend avatar"
• Keyboard navigation:     Tab index, Enter to select
• Focus visible:           ring-2 ring-brand-500 (keyboard focus)
```

---

## 10. RESPONSIVE BREAKPOINTS

```
Mobile:    < 768px
  - Smaller avatar (32px)
  - Compact padding
  - Shorter truncate (35 chars)

Tablet:    768px - 1024px
  - Same as desktop

Desktop:   ≥ 1024px
  - Full layout (40px avatar)
  - Standard truncate (50 chars)
```

---

## 11. EDGE CASES

### Very Long Group Name

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Super Long Project Name Th...   Vừa xong        [2]│
│  │ SL│  John: Message content                               │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
   ↑ Group name also truncates if needed (max 200px width)
```

### Very Long Sender Name

```
John Christopher Michael: Message...
 ↓ Truncate sender if needed
John Christopher M...: Message content here
```

### Badge > 99

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐  Spam Category                  1 giờ trước   [99+] │
│  │ SC│  Bot: Automated notification                         │
│  └───┘                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. TECHNICAL SPECS

### Message Type Detection

```typescript
function formatMessagePreview(message: LastMessageDto): string {
  const { senderName, content, attachments } = message;

  // Case 1: Text only
  if (!attachments || attachments.length === 0) {
    return `${senderName}: ${content}`;
  }

  // Case 2: Text + attachments - prioritize text
  if (content && content.trim().length > 0) {
    return `${senderName}: ${content}`;
  }

  // Case 3: Only attachments
  const images = attachments.filter((a) => a.type === "image");
  const files = attachments.filter((a) => a.type === "file");

  // Only images
  if (images.length > 0 && files.length === 0) {
    return images.length === 1
      ? `${senderName}: đã gửi 1 ảnh`
      : `${senderName}: đã gửi ${images.length} ảnh`;
  }

  // Only files
  if (files.length > 0 && images.length === 0) {
    return files.length === 1
      ? `${senderName}: đã gửi tệp ${truncateFilename(files[0].name)}`
      : `${senderName}: đã gửi ${files.length} tệp`;
  }

  // Mixed
  return `${senderName}: đã gửi ${attachments.length} tệp đính kèm`;
}
```

### Timestamp Formatting

```typescript
function formatRelativeTime(sentAt: string): string {
  const now = new Date();
  const sent = new Date(sentAt);
  const diffMs = now.getTime() - sent.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  // > 7 days: format as DD/MM
  const day = sent.getDate().toString().padStart(2, "0");
  const month = (sent.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}
```

---

## ✅ APPROVAL

| Item                | Status |
| ------------------- | ------ |
| Đã review wireframe | ⬜     |
| Layout hợp lý       | ⬜     |
| Responsive OK       | ⬜     |
| **APPROVED**        | ⬜     |

**Signature:** **\*\***\_**\*\***  
**Date:** **\*\***\_**\*\***

> AI chỉ được code nếu wireframe đã APPROVED
