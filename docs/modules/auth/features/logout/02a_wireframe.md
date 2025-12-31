# 🎨 Logout Feature - Wireframe Document

> **[BƯỚC 2A]** UI/UX Wireframe Design  
> **Feature ID:** `AUTH-002`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ⏳ PENDING APPROVAL

---

## 📐 Overview

Logout button nằm trong **Profile Popover** của **MainSidebar**. UI đã được implement sẵn, chỉ cần kết nối handler logic.

---

## 🖥️ Desktop Layout (Current Implementation)

### MainSidebar - Profile Popover

```
┌────────────────────────────────────────────────────┐
│  Main Sidebar (Left - 64px width)                 │
│  ┌──────────┐                                      │
│  │          │                                      │
│  │  [Logo]  │                                      │
│  │          │                                      │
│  │  [Chat]  │ ← Workspace icon                    │
│  │          │                                      │
│  │  [Tools] │ ← Tools popover                     │
│  │          │                                      │
│  │  [DM]    │ ← User Avatar Button (click to open)│
│  └──────────┘                                      │
│       ↓                                            │
│  ┌──────────────────────────────────┐              │
│  │  Profile Popover (right side)   │              │
│  │  ┌────────────────────────────┐ │              │
│  │  │  Xin chào Diễm My         │ │              │
│  │  └────────────────────────────┘ │              │
│  │                                  │              │
│  │  ┌────────────────────────────┐ │              │
│  │  │ [🚪] Đăng xuất            │ │ ← Logout btn │
│  │  └────────────────────────────┘ │              │
│  └──────────────────────────────────┘              │
└────────────────────────────────────────────────────┘
```

### Component Breakdown

**User Avatar Button:**
- Size: 40px × 40px
- Background: `bg-white/10` (default), `bg-white/20` (hover)
- Border: `ring-1 ring-white/20`
- Text: User initials (e.g., "DM" for Diễm My)
- Font: `text-sm font-semibold`
- Color: `text-white`

**Profile Popover:**
- Width: 224px (w-56)
- Padding: 8px (p-2)
- Background: `bg-white`
- Border: `border border-gray-200`
- Shadow: `shadow-xl`
- Border radius: `rounded-xl`

**Greeting Section:**
- Padding: `px-2 py-2`
- Text: "Xin chào {userName}"
- Font: `text-sm font-semibold`
- Color: `text-gray-800`

**Logout Button:**
- Width: Full width (w-full)
- Layout: Flex row with gap-2
- Padding: `px-2 py-2`
- Font: `text-sm`
- Color: `text-gray-700` (default), `text-brand-700` (hover)
- Background: Transparent (default), `bg-brand-50` (hover)
- Border radius: `rounded-md`
- Icon: LogOut from lucide-react
- Icon size: 16px (h-4 w-4)
- Icon color: `text-gray-600`

---

## 📱 Mobile Layout

**Same UI as desktop** - Profile popover vẫn hiển thị bên phải avatar button.

---

## 🎨 Component Specifications

### 1. User Avatar Button

| Property        | Value                  | Notes                    |
| --------------- | ---------------------- | ------------------------ |
| Size            | 40px × 40px            | Fixed square             |
| Background      | `bg-white/10`          | Semi-transparent white   |
| Border          | `ring-1 ring-white/20` | Subtle ring              |
| Hover BG        | `bg-white/20`          | Slightly brighter        |
| Text            | User initials          | Max 2 characters         |
| Font Size       | `text-sm`              | 14px                     |
| Font Weight     | `font-semibold`        | 600                      |
| Color           | `text-white`           | Always white             |
| Border Radius   | `rounded-full`         | Circular                 |
| Cursor          | `cursor-pointer`       | Clickable                |
| data-testid     | `user-avatar-button`   | For E2E testing          |

### 2. Profile Popover Container

| Property      | Value              | Notes                      |
| ------------- | ------------------ | -------------------------- |
| Width         | 224px (w-56)       | Fixed width                |
| Padding       | 8px (p-2)          | Inner spacing              |
| Background    | `bg-white`         | Solid white                |
| Border        | `border-gray-200`  | Subtle border              |
| Shadow        | `shadow-xl`        | Prominent shadow           |
| Border Radius | `rounded-xl`       | Rounded corners (12px)     |
| Position      | Right of avatar    | Aligned to start           |
| z-index       | High (Popover)     | Above other content        |

### 3. Greeting Text

| Property    | Value                  | Notes          |
| ----------- | ---------------------- | -------------- |
| Text        | "Xin chào {userName}"  | Dynamic name   |
| Padding     | `px-2 py-2`            | 8px all around |
| Font Size   | `text-sm`              | 14px           |
| Font Weight | `font-semibold`        | 600            |
| Color       | `text-gray-800`        | Dark gray      |

### 4. Logout Button

| Property        | Value                              | Notes                     |
| --------------- | ---------------------------------- | ------------------------- |
| Width           | Full (w-full)                      | Stretch to container      |
| Layout          | Flex row, gap-2                    | Icon + text               |
| Padding         | `px-2 py-2`                        | 8px horizontal & vertical |
| Font Size       | `text-sm`                          | 14px                      |
| Color           | `text-gray-700`                    | Default gray              |
| Hover Color     | `text-brand-700`                   | Brand color on hover      |
| Background      | Transparent                        | No background default     |
| Hover BG        | `bg-brand-50`                      | Light brand color         |
| Border Radius   | `rounded-md`                       | 6px                       |
| Icon            | LogOut (lucide-react)              | Exit door icon            |
| Icon Size       | 16px (h-4 w-4)                     | Small icon                |
| Icon Color      | `text-gray-600`                    | Slightly lighter          |
| Cursor          | `cursor-pointer`                   | Clickable                 |
| data-testid     | `logout-button`                    | For E2E testing           |

---

## 🎯 Interaction States

### Avatar Button States

| State   | Background     | Ring              | Text         |
| ------- | -------------- | ----------------- | ------------ |
| Default | `bg-white/10`  | `ring-white/20`   | `text-white` |
| Hover   | `bg-white/20`  | `ring-white/20`   | `text-white` |
| Focused | `bg-white/20`  | `ring-2 ring-brand-400` | `text-white` |
| Active  | `bg-white/20`  | `ring-white/20`   | `text-white` |

### Logout Button States

| State   | Background     | Text Color       | Icon Color       |
| ------- | -------------- | ---------------- | ---------------- |
| Default | Transparent    | `text-gray-700`  | `text-gray-600`  |
| Hover   | `bg-brand-50`  | `text-brand-700` | `text-brand-600` |
| Focused | `bg-brand-50`  | `text-brand-700` | `text-brand-600` |
| Active  | `bg-brand-100` | `text-brand-800` | `text-brand-700` |

---

## 🔄 User Flow (Quick)

1. User clicks **User Avatar** button in MainSidebar bottom
2. **Profile Popover** opens to the right
3. User sees greeting "Xin chào {name}"
4. User clicks **"Đăng xuất"** button
5. Popover closes immediately
6. Auth store cleared, token removed
7. Redirect to `/login` page
8. Login page displayed

---

## ♿ Accessibility

- [ ] Avatar button has `aria-label="Tài khoản {userName}"`
- [ ] Logout button has `aria-label="Đăng xuất"`
- [ ] Popover has `role="dialog"`
- [ ] Keyboard navigation: Tab to button, Enter/Space to click
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces "Đăng xuất" button

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề                          | Lựa chọn                     | HUMAN Decision |
| --- | ------------------------------- | ---------------------------- | -------------- |
| 1   | Có cần thêm icon khác không?    | LogOut icon or Power icon?   | ⬜ **LogOut**  |
| 2   | Có cần thêm divider không?      | Yes (separator) or No?       | ⬜ **No**      |
| 3   | Có cần animation khi close không? | Fade out or Instant close? | ⬜ **Instant** |

> ⚠️ **AI KHÔNG ĐƯỢC tiếp tục nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                          | Status         |
| --------------------------------- | -------------- |
| Đã review Component Specifications | ⬜ Chưa review |
| Đã review Interaction States      | ⬜ Chưa review |
| Đã điền Pending Decisions         | ⬜ Chưa điền   |
| **APPROVED để tiếp tục**          | ⬜ PENDING     |

**HUMAN Signature:** ______  
**Date:** ______

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC chuyển sang BƯỚC 2B nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **User Flow (next):** [02b_flow.md](./02b_flow.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)

---

## 📝 Notes

- UI đã được implement trong MainSidebar component
- Chỉ cần connect handler `onSelect("logout")` với logout logic
- Không cần thêm CSS mới, sử dụng classes hiện tại
- Icon LogOut đã được import từ lucide-react

---
