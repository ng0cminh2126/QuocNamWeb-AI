# [BƯỚC 2A] View Files Phase 2 - Wireframe

**Module:** Chat  
**Feature:** View All Files - Jump to Message  
**Phase:** UI/UX Design  
**Created:** 2026-01-16  
**Status:** ⏳ PENDING APPROVAL

---

## 🚨 CRITICAL: NO UI CHANGES

> ⚠️ **Phase 2 KHÔNG thay đổi UI hiện tại**  
> ✅ **CHỈ bổ sung logic** cho button "Xem tin nhắn gốc" đã có sẵn

ViewAllFilesModal UI **GIỮ NGUYÊN 100%**:

- Modal dimensions: `max-w-4xl` (current)
- Header: Giữ nguyên style hiện tại
- Close button: Giữ nguyên
- Content area: Giữ nguyên
- Grid layout: Giữ nguyên

---

## 📱 Jump to Message Flow

### Wireframe: Grid Item with Jump Button (EXISTING UI)

> ✅ **LƯU Ý:** Button "Xem tin nhắn gốc" ĐÃ TỒN TẠI trong UI hiện tại  
> Phase 2 chỉ cần thêm logic `handleJumpToMessage` vào button có sẵn

```
┌─────────────────────┐
│                     │
│      [Image]        │ 120x120px thumbnail
│                     │
├─────────────────────┤
│ image.jpg           │ File name
│ 2.4 MB • 15/01/2026 │ Size + date
│                     │
│ [⋮] <-- Click       │ 3-dot menu
└─────────────────────┘

Click [⋮] opens menu (✅ EXISTING):
┌──────────────────────────┐
│ 💾 Tải xuống             │
│ 📋 Sao chép link         │
│ 💬 Xem tin nhắn gốc   ← ✅ ĐÃ CÓ, chỉ thêm logic │
└──────────────────────────┘
```

### Jump to Message Animation Flow

```
Step 1: User clicks "Xem tin nhắn gốc"
┌──────────────────────────┐
│ ViewAllFilesModal        │ Modal visible
│                          │
│ [Image grid]             │
│                          │
│ User clicks [💬 Xem...]  │
└──────────────────────────┘

Step 2: Modal fades out (150ms)
┌──────────────────────────┐
│ ViewAllFilesModal        │ opacity: 0.5
│                          │
│ [Image grid]             │ Fading...
│                          │
└──────────────────────────┘

Step 3: ChatMain scrolls to message (smooth animation)
┌──────────────────────────────────┐
│ ChatMain                         │
│                                  │
│ Message 1                        │
│ Message 2                        │
│ ┌────────────────────────────┐   │
│ │ Message 3 (with file)      │ <-- Scrolling to center
│ │ [📷 image.jpg]             │
│ └────────────────────────────┘   │
│ Message 4                        │
│ Message 5                        │
└──────────────────────────────────┘

Step 4: Message highlighted (ring-2 ring-amber-400)
┌──────────────────────────────────┐
│ ChatMain                         │
│                                  │
│ Message 1                        │
│ Message 2                        │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │ <-- Amber ring
│ ┃ Message 3 (with file)      ┃   │     around message
│ ┃ [📷 image.jpg]             ┃   │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│ Message 4                        │
│ Message 5                        │
└──────────────────────────────────┘

Step 5: After 2s, highlight fades out
┌──────────────────────────────────┐
│ ChatMain                         │
│                                  │
│ Message 1                        │
│ Message 2                        │
│ ┌────────────────────────────┐   │ <-- Ring removed
│ │ Message 3 (with file)      │   │
│ │ [📷 image.jpg]             │   │
│ └────────────────────────────┘   │
│ Message 4                        │
│ Message 5                        │
└──────────────────────────────────┘
```

---

## Animation Specifications

### Modal Open/Close

```css
/* Open animation */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Close animation */
@keyframes modal-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Duration: 150ms */
/* Timing: ease-out */
```

### Message Highlight

```css
/* Highlight ring */
.message-highlight {
  @apply ring-2 ring-amber-400 ring-offset-2;
  transition: all 200ms ease-out;
}

/* Auto-remove after 2000ms */
setTimeout(() => {
  element.classList.remove('message-highlight');
}, 2000);
```

---

## 📋 PENDING DECISIONS (From Requirements)

> ✅ **RESOLVED:** Decision "Jump button location" - Button UI đã tồn tại sẵn

| #   | Decision           | Options                         | HUMAN Decision    |
| --- | ------------------ | ------------------------------- | ----------------- |
| 1   | Highlight color    | orange-400 with bg-orange-50/80 | ✅ **orange-400** |
| 2   | Highlight duration | 2.5s                            | ✅ **2.5s**       |
| 3   | Highlight style    | Background Glow (Option 2)      | ✅ **Approved**   |

---

## 📊 IMPACT SUMMARY

### Files Will Modify:

1. **`src/features/portal/components/information-panel/ViewAllFilesModal.tsx`**
   - ~~Update modal container classes~~ ❌ NO CHANGE
   - ~~Update header component~~ ❌ NO CHANGE
   - ~~Update close button~~ ❌ NO CHANGE
   - ✅ Wire up "Xem tin nhắn gốc" button onClick handler
   - ✅ Implement handleJumpToMessage function

### Components Referenced:

- **FilePreviewModal** - For style consistency
- **ChatMainContainer** - For scroll-to-message logic
- **MessageBubbleSimple** - For data-testid attribute

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review wireframes      | ⬜ Chưa review   |
| Đã điền Pending Decisions | ⬜ Chưa điền     |
| **APPROVED để thực thi**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

**Next Step:** Create [02b_flow.md](./02b_flow.md) với detailed user interaction flow
