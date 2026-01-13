# [BƯỚC 2A] Wireframe - Chat UX Improvements (Phase 6)

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6 - Error Handling & Persistence  
> **Document Type:** UI Wireframe Specification  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-12

---

## 📋 Overview

Wireframes cho Phase 6 UX improvements: file upload errors, message send status, delete buttons, và empty states.

---

## 🎨 Component Wireframes

### Wire-1: File Upload Area - Error States

#### 1.1 Normal State (No Errors)

```
┌─────────────────────────────────────────────────────────────┐
│ Đính kèm files                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [📎 Attach]  [🖼️ Image]                                   │
│                                                             │
│  Files đã chọn:                                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 document.pdf                                      │  │
│  │ 2.3 MB                                          [✕]  │  │ ← Delete always visible
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📊 report.xlsx                                       │  │
│  │ 1.5 MB                                          [✕]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Delete Button Specs:**

- **Always visible** (không cần hover)
- Color: `text-gray-400` (default)
- Hover: `text-red-600` + `hover:bg-red-50` (rounded circle background)
- Size: `w-8 h-8` clickable area
- Icon: `✕` (X close icon) từ Lucide
- Position: `absolute top-2 right-2`

#### 1.2 Uploading State

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 presentation.pptx                                 │  │
│  │ 5.2 MB                                          [✕]  │  │
│  │                                                      │  │
│  │ [⏳ Spinner] Đang tải lên...                         │  │ ← Loading state
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Loading Specs:**

- Spinner: `animate-spin` border spinner (brand-600 green)
- Text: `text-sm text-gray-600`
- Delete button: Disabled during upload (`cursor-not-allowed`)

#### 1.3 Upload Failed State

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 large-file.xlsx                                   │  │
│  │ 25 MB                                           [✕]  │  │
│  │                                                      │  │
│  │ ⚠️ Lỗi: File quá lớn (max 20MB)                      │  │ ← Error message
│  │ [Thử lại]  [Xoá]                                     │  │ ← Action buttons
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Error State Specs:**

- Border: `border-red-300` (red border around file card)
- Background: `bg-red-50` (light red background)
- Error icon: `⚠️` - `text-red-600 text-lg`
- Error text: `text-sm text-red-700 font-medium`
- Buttons:
  - **[Thử lại]**: `bg-brand-600 text-white px-4 py-1.5 rounded-lg hover:bg-brand-700` - Brand primary
  - **[Xoá]**: `bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300`
  - Gap: `gap-2`

**Error Messages:**

- File too large: `Lỗi: File quá lớn (max 20MB)`
- Network error: `Lỗi: Không có kết nối mạng`
- Server error: `Lỗi: Máy chủ không phản hồi`
- Unsupported format: `Lỗi: Định dạng file không được hỗ trợ`

#### 1.4 Mixed States (Success + Failed)

```
┌─────────────────────────────────────────────────────────────┐
│  Files đã chọn:                                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✅ document.pdf                                      │  │ ← Success
│  │ 2.3 MB                                          [✕]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚠️ large-file.xlsx                                   │  │ ← Failed
│  │ 25 MB                                           [✕]  │  │
│  │ Lỗi: File quá lớn (max 20MB)                         │  │
│  │ [Thử lại]  [Xoá]                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 uploading.docx                                    │  │ ← Uploading
│  │ 1.5 MB                                          [✕]  │  │
│  │ [⏳] Đang tải lên...                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Visual Hierarchy:**

- ✅ Success: Normal border, checkmark icon `text-brand-600` (brand green)
- ⚠️ Failed: Red border + background, warning icon
- ⏳ Uploading: Normal border, spinner icon `text-brand-600` (brand spinner)

---

### Wire-2: Toast Notification - Upload Errors

#### 2.1 Single File Error

```
                                    ┌───────────────────────────────────┐
                                    │ ⚠️ Upload thất bại            [✕]│
                                    │                                   │
                                    │ large-file.xlsx                   │
                                    │ File quá lớn (max 20MB)           │
                                    └───────────────────────────────────┘
                                              ↑ Top-center position
```

**Toast Specs:**

- Position: `fixed top-4 left-1/2 -translate-x-1/2` (top-center)
- Width: `max-w-md`
- Background: `bg-white border-l-4 border-red-500`
- Shadow: `shadow-lg`
- Padding: `p-4`
- Auto-dismiss: **3 seconds** (per pending decision #1)
- Animation: Slide down from top + fade in
- Close button: `text-gray-400 hover:text-gray-600`

#### 2.2 Multiple Files Error

```
                                    ┌───────────────────────────────────┐
                                    │ ⚠️ Upload thất bại: 2/5 files [✕]│
                                    │                                   │
                                    │ • large-file.xlsx - File quá lớn  │
                                    │ • image.png - Mất kết nối mạng    │
                                    └───────────────────────────────────┘
```

**Multiple Error Specs:**

- Title: `Upload thất bại: {failed}/{total} files`
- List: Bullet points, `text-sm text-gray-700`
- Max items shown: 3 (nếu > 3, show "... và {n} files khác")

---

### Wire-3: Message Bubble - Send Status

#### 3.1 Own Messages - Status Indicators

```
Right-aligned (Own Messages):
                                    ┌────────────────────────────┐
                                    │ Hello! How are you?   ⏳  │ ← Sending
                                    │ 10:30                      │
                                    └────────────────────────────┘

                                    ┌────────────────────────────┐
                                    │ I'm working on the report  │ ← Sent (No checkmark)
                                    │ 10:31                      │
                                    └────────────────────────────┘

                                    ┌────────────────────────────┐
                                    │ Here's the file       ⚠️  │ ← Failed
                                    │ 10:32                      │
                                    │                            │
                                    │ Gửi thất bại: Lỗi mạng     │
                                    │ [Gửi lại]  [Xoá]           │
                                    └────────────────────────────┘
```

**Status Specs:**

**⏳ Sending:**

- Icon: Spinner (`animate-spin` from Lucide)
- Color: `text-brand-600` (brand green spinner)
- Position: Inline after message content, before timestamp
- Size: `w-4 h-4`

**Sent (No visual indicator per decision #4):**

- No checkmark icon
- Just normal message bubble

**⚠️ Failed:**

- Icon: AlertCircle from Lucide
- Color: `text-red-600`
- Position: Top-right of bubble
- Message bubble: `border border-red-300 bg-red-50/50`
- Error text: `text-xs text-red-700 mt-1`
- Buttons:
  - **[Gửi lại]**: `bg-brand-600 text-white text-xs px-3 py-1 rounded hover:bg-brand-700` - Brand primary
  - **[Xoá]**: `text-gray-600 text-xs px-3 py-1 hover:bg-gray-100 rounded`
  - Layout: Horizontal, `gap-2`, `mt-2`

#### 3.2 Failed Message - Full Layout

```
                                    ┌────────────────────────────┐
                                    │                       ⚠️  │ ← Error icon top-right
                                    │ This is a long message     │
                                    │ that failed to send due    │
                                    │ to network issues          │
                                    │ 10:35                      │
                                    │                            │
                                    │ ❌ Gửi thất bại: Lỗi mạng  │ ← Error message
                                    │                            │
                                    │ [Gửi lại]  [Xoá]           │ ← Action buttons
                                    └────────────────────────────┘
```

**Failed Message Styling:**

- Overall bubble: Faded appearance
- Border: `border border-red-300`
- Background: `bg-red-50/30` (very light red)
- Text: Slightly faded `opacity-80`
- Error section: Clear separator (margin top)

---

### Wire-4: Empty State - No Conversation Selected

#### 4.1 Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Portal Home                                                     │
└─────────────────────────────────────────────────────────────────┘
┌───────────────────┬─────────────────────────────────────────────┐
│ Conversations     │                                             │
│                   │                                             │
│ [Search]          │                                             │
│                   │                                             │
│ ┌───────────────┐ │              [💬 Message Icon]             │
│ │ John Doe      │ │              (Large icon, gray)            │
│ │ Hello there   │ │                                             │
│ │ 2 mins ago    │ │                                             │
│ └───────────────┘ │        Chọn cuộc trò chuyện để bắt đầu     │
│                   │        (text-lg text-gray-600)             │
│ ┌───────────────┐ │                                             │
│ │ Jane Smith    │ │     Hoặc tạo cuộc trò chuyện mới từ        │
│ │ Meeting notes │ │        danh sách bên trái                  │
│ │ 1 hour ago    │ │        (text-sm text-gray-500)             │
│ └───────────────┘ │                                             │
│                   │                                             │
│      ...          │                                             │
│                   │                                             │
└───────────────────┴─────────────────────────────────────────────┘
```

**Empty State Specs (per decision #7 - No create button):**

- Layout: Center-aligned vertically and horizontally
- Icon: MessageCircle from Lucide, `w-16 h-16 text-gray-300`
- Title: `text-lg font-medium text-gray-600`
  - Text: "Chọn cuộc trò chuyện để bắt đầu"
- Subtitle: `text-sm text-gray-500 mt-2`
  - Text: "Hoặc tạo cuộc trò chuyện mới từ danh sách bên trái"
- No action buttons (per decision #7)

#### 4.2 Mobile Layout

```
┌─────────────────────────────┐
│ [←] Conversations           │
├─────────────────────────────┤
│                             │
│                             │
│      [💬 Icon]              │
│                             │
│  Chọn cuộc trò chuyện       │
│  để bắt đầu                 │
│                             │
│  Hoặc nhấn [←] để           │
│  quay lại danh sách         │
│                             │
│                             │
└─────────────────────────────┘
```

**Mobile Specs:**

- Same center layout
- Adjusted subtitle for mobile context
- Icon slightly smaller: `w-12 h-12`

---

### Wire-5: Network Status Banner

#### 5.1 Offline Banner (Top position per decision #5)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Bạn đang offline. Một số tính năng có thể không khả dụng.   │
└─────────────────────────────────────────────────────────────────┘
┌───────────────────┬─────────────────────────────────────────────┐
│ Conversations     │ Chat Main                                   │
│ ...               │ ...                                         │
└───────────────────┴─────────────────────────────────────────────┘
```

**Offline Banner Specs:**

- Position: `fixed top-0 left-0 right-0 z-50`
- Background: `bg-amber-100 border-b border-amber-300`
- Text: `text-amber-900 text-sm font-medium`
- Padding: `py-2 px-4`
- Icon: WifiOff from Lucide, `w-4 h-4 mr-2`

#### 5.2 Reconnecting Banner

```
┌─────────────────────────────────────────────────────────────────┐
│ [⏳] Đang kết nối lại...                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Reconnecting Specs:**

- Background: `bg-brand-100 border-b border-brand-300` (brand light green)
- Text: `text-brand-900` (brand dark green)
- Spinner icon `text-brand-600`
- Text: `text-blue-900`
- Spinner icon

---

### Wire-6: Confirm Delete Dialog (per decision #3)

```
                        ┌─────────────────────────────┐
                        │ Xác nhận xoá file           │
                        ├─────────────────────────────┤
                        │                             │
                        │ Bạn có chắc chắn muốn xoá   │
                        │ file này?                   │
                        │                             │
                        │ document.pdf (2.3 MB)       │
                        │                             │
                        │       [Huỷ]    [Xoá]        │
                        │                             │
                        └─────────────────────────────┘
```

**Confirm Dialog Specs:**

- Type: Modal overlay
- Background overlay: `bg-black/50`
- Dialog: `bg-white rounded-lg shadow-xl max-w-sm`
- Padding: `p-6`
- Title: `text-lg font-semibold text-gray-900 mb-4`
- Message: `text-sm text-gray-600 mb-4`
- File name: `text-sm font-medium text-gray-900 mb-6`
- Buttons:
  - **[Huỷ]**: `bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300`
  - **[Xoá]**: `bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700`
  - Layout: Right-aligned, `gap-2`

---

## 📐 Responsive Breakpoints

### Desktop (≥ 1024px)

- Conversation list: `w-80` (320px fixed)
- Chat main: `flex-1`
- Empty state icon: `w-16 h-16`
- Toast: `max-w-md`

### Tablet (768px - 1023px)

- Conversation list: `w-64` (256px)
- Chat main: `flex-1`
- Empty state icon: `w-12 h-12`
- Toast: `max-w-sm`

### Mobile (< 768px)

- Full-width screens (conversation list OR chat main)
- Empty state icon: `w-10 h-10`
- Toast: `max-w-[90vw]`
- Delete buttons: Larger touch targets (`min-w-10 min-h-10`)

---

## 🎨 Color Palette

### Brand Colors (Primary)

- `brand-50`: #e6f7e7 - Light backgrounds
- `brand-100`: #c5efc7 - Hover backgrounds
- `brand-200`: #9fe4a4 - Borders
- `brand-500`: #38ae3c - Main brand color
- `brand-600`: #2f9132 - Primary buttons
- `brand-700`: #257229 - Primary button hover

### Error States

- Border: `border-red-300` (#FCA5A5)
- Background: `bg-red-50` (#FEF2F2)
- Text: `text-red-700` (#B91C1C)
- Icon: `text-red-600` (#DC2626)

### Success States

- Icon: `text-brand-600` (#2f9132) - Brand green
- Background: `bg-brand-50` (#e6f7e7) - Light brand green
- (Consistent with brand identity)

### Loading States

- Spinner: `text-brand-600` (#2f9132) - Brand color spinner
- Text: `text-gray-600` (#4B5563)

### Buttons

- **Primary (Brand)**: `bg-brand-600 hover:bg-brand-700` (#2f9132 / #257229)
- Secondary: `bg-gray-200 hover:bg-gray-300` (#E5E7EB / #D1D5DB)
- Danger: `bg-red-600 hover:bg-red-700` (#DC2626 / #B91C1C)

### Delete Button

- Default: `text-gray-400` (#9CA3AF)
- Hover: `text-red-600 bg-red-50` (#DC2626, #FEF2F2)

---

## ⏳ PENDING DECISIONS

| #   | Question                                     | HUMAN Decision |
| --- | -------------------------------------------- | -------------- |
| 1   | Toast icon size: 20px hay 24px?              | ⬜ **20px**    |
| 2   | Empty state có animation (fade in)?          | ⬜ **Không**   |
| 3   | Failed message có glow effect around border? | ⬜ **Có**      |
| 4   | Delete button hover có tooltip "Xoá file"?   | ⬜ **Có**      |
| 5   | Network banner có close button?              | ⬜ **Có**      |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status           |
| --------------------------- | ---------------- |
| Đã review tất cả wireframes | ⬜ Chưa review   |
| Đã review responsive specs  | ⬜ Chưa review   |
| Đã review color palette     | ⬜ Chưa review   |
| Đã điền Pending Decisions   | ⬜ Chưa điền     |
| **APPROVED wireframes**     | ⬜ CHƯA APPROVED |

**HUMAN Signature:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC proceed to flow (BƯỚC 2B) nếu wireframes chưa approved**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 6 Overview
- [01_requirements.md](./01_requirements.md) - Requirements (✅ APPROVED)
- Next: [02b_flow.md](./02b_flow.md) - Flow Diagrams (⏳ PENDING)

---

## 📝 Change Log

| Version | Date       | Changes                    | Author |
| ------- | ---------- | -------------------------- | ------ |
| 1.0     | 2026-01-12 | Initial wireframes created | AI     |
