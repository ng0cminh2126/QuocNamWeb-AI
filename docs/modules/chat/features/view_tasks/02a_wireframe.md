# [BƯỚC 2A] View All Tasks - UI Wireframe

**Module:** Chat  
**Feature:** View All Tasks  
**Phase:** Design & Wireframes  
**Created:** 2025-01-09

---

## 📐 Layout Overview

### Desktop Layout (1920px)

```
┌─────────────────────────────────────────────────────────────┐
│  ✕ All Tasks (15 Tasks)                    [Search...] [X] │
├─────────────────────────────────────────────────────────────┤
│                         FILTERS                             │
│  ☑ Todo  ☑ In Progress  ☑ Awaiting  ☑ Done               │
│  ☑ Low  ☑ Medium  ☑ High  ☑ Urgent                        │
│  Sort: [Created Date ▼]                                     │
├─────────────────────────────────────────────────────────────┤
│  TASK LIST (scrollable)                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ HIGH │ Implement API integration                  │   │
│  │         Status: In Progress                         │   │
│  │         Assigned: John Doe  │  Created: 2 days ago │   │
│  │         Checklist: 3/5 items completed   [View >]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ MEDIUM │ Write documentation                      │   │
│  │           Status: Todo                              │   │
│  │           Assigned: Jane Smith  │  Created: Today   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ LOW │ Code review completed                       │   │
│  │        Status: Done                                 │   │
│  │        Assigned: Mike Johnson  │  Created: 1 week   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                        [Load more]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Mobile Layout (375px)

```
┌──────────────────────────────────────┐
│  ✕ All Tasks (15)          [X]      │
├──────────────────────────────────────┤
│  [Search tasks...]                  │
├──────────────────────────────────────┤
│  Filters  ▼ | Sort: Created Date ▼  │
├──────────────────────────────────────┤
│  TASK LIST (full-screen scrollable)  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ HIGH │ Implement API           │  │
│  │ In Progress - John Doe         │  │
│  │ Created: 2 days ago            │  │
│  │ 3/5 items completed   [View>] │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ MEDIUM │ Write documentation   │  │
│  │ Todo - Jane Smith              │  │
│  │ Created: Today                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ LOW │ Code review completed    │  │
│  │ Done - Mike Johnson            │  │
│  │ Created: 1 week ago            │  │
│  └────────────────────────────────┘  │
│                                      │
│                [Load more]           │
│                                      │
└──────────────────────────────────────┘
```

---

## 🎨 Component Specifications

### Header Section
| Element | Specification |
|---------|---|
| **Modal Title** | "All Tasks (Conversation Name)" or just "All Tasks ({count})" |
| **Close Button** | X button top-right, background: transparent, hover: bg-gray-100 |
| **Height** | 48px (padding: 12px 16px) |
| **Background** | White #FFFFFF |
| **Border** | border-bottom 1px #E5E7EB |

### Search Bar
| Property | Value |
|----------|-------|
| **Input Placeholder** | "Search tasks..." |
| **Icon** | Search icon (Lucide) on left |
| **Padding** | 12px 16px |
| **Border Radius** | 6px |
| **Background** | #F9FAFB |
| **Debounce** | 300ms |

### Filter Section
| Component | Details |
|-----------|---------|
| **Status Filters** | Checkboxes: Todo, In Progress, Awaiting, Done |
| **Priority Filters** | Checkboxes: Low, Medium, High, Urgent |
| **Layout** | Flex wrap, 12px gap |
| **Chip Style** | bg-white, border 1px #D1D5DB, rounded-full, 28px height |
| **Selected State** | bg-brand-100, border 1px #3B82F6 (blue) |

### Sort Dropdown
| Property | Value |
|----------|-------|
| **Default** | Created Date (newest first) or HUMAN choice |
| **Options** | Created Date, Updated Date, Priority, Assignee, Status |
| **Trigger** | Click dropdown to show options |
| **Position** | Top-right of filter area |

### Task Card (List Item)
```
┌──────────────────────────────────────────────────┐
│ ●[Priority Dot] │ TITLE TEXT HERE              │
│                │ Status: [Badge]  │ Date info  │
│                │ Assigned: Name   │ Progress   │
│                │ [Metadata line with icons]    │
└──────────────────────────────────────────────────┘
```

**Card Specifications:**
| Property | Value |
|----------|-------|
| **Background** | White #FFFFFF |
| **Border** | 1px #E5E7EB |
| **Border Radius** | 8px |
| **Padding** | 16px |
| **Margin** | 0 0 12px 0 |
| **Hover** | bg-gray-50, shadow: 0 4px 12px rgba(0,0,0,0.08) |
| **Cursor** | pointer |

### Priority Indicator (Colored Dot)
| Priority | Color | Size |
|----------|-------|------|
| Urgent | #DC2626 (red) | 10px |
| High | #EA580C (orange) | 10px |
| Medium | #F59E0B (amber) | 10px |
| Low | #10B981 (green) | 10px |

### Status Badge
| Status | Background | Text | Icon |
|--------|-----------|------|------|
| Todo | #F3F4F6 | #1F2937 | ○ |
| In Progress | #DBEAFE | #1E40AF | ▷ |
| Awaiting | #FEF3C7 | #92400E | ⏱ |
| Done | #D1FAE5 | #065F46 | ✓ |

### Meta Information Row
**Format:** `Assigned: {Name} | Created: {Relative Date} | {Checklist Progress}`

| Item | Format | Color |
|------|--------|-------|
| **Assignee** | Name or email (max 20px) | #6B7280 |
| **Created Date** | "2 days ago" relative format | #9CA3AF |
| **Checklist** | "3/5 items" or "All done" | #6B7280 |

---

## 📱 Responsive Breakpoints

### Desktop (≥1280px)
- Modal width: 800px (max-width: 90vw)
- Modal centered on screen
- Task cards: 2-column grid (optional, or keep 1 column)
- Filters: Horizontal layout

### Tablet (768px - 1279px)
- Modal width: 100vw - 40px (full screen with margins)
- Modal positioned bottom-sheet style or full overlay
- Task cards: 1 column
- Filters: Horizontal, wrapping if needed

### Mobile (< 768px)
- Modal: Full screen height with safe area inset
- Modal positioned as bottom-sheet or full screen overlay
- Task cards: 1 column, full width - 24px padding
- Filters: Collapsible into "Filters ▼" button to save space
- Search bar: Full width

---

## 🌙 Dark Mode Considerations

If dark mode is enabled in the application:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | #FFFFFF | #1F2937 |
| Text | #1F2937 | #F3F4F6 |
| Border | #E5E7EB | #374151 |
| Card | #FFFFFF | #111827 |
| Hover | #F9FAFB | #111827 |

---

## ♿ Accessibility Specifications

| Item | Requirement |
|------|-------------|
| **Focus States** | All interactive elements must have visible focus ring (2px, offset 2px) |
| **Color Contrast** | All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text) |
| **Keyboard Navigation** | Tab through filters, checkboxes, buttons; Enter to confirm |
| **Screen Reader** | Modal labeled with aria-labelledby; status updates announced with aria-live |
| **Data Test IDs** | All interactive elements have data-testid for E2E testing |

---

## ✅ Component Design Checklist

| Item | Desktop | Mobile | Status |
|------|---------|--------|--------|
| Header with close button | ✓ | ✓ | ⬜ Design |
| Search input with debounce | ✓ | ✓ | ⬜ Design |
| Status filters (4 options) | ✓ | ✓ | ⬜ Design |
| Priority filters (4 options) | ✓ | ✓ | ⬜ Design |
| Sort dropdown | ✓ | ✓ | ⬜ Design |
| Task list scrollable | ✓ | ✓ | ⬜ Design |
| Task card layout | ✓ | ✓ | ⬜ Design |
| Status badge colored | ✓ | ✓ | ⬜ Design |
| Priority dot indicator | ✓ | ✓ | ⬜ Design |
| Meta information line | ✓ | ✓ | ⬜ Design |
| Empty state message | ✓ | ✓ | ⬜ Design |
| Loading skeleton | ✓ | ✓ | ⬜ Design |
| Error state with retry | ✓ | ✓ | ⬜ Design |

---

## ⏳ PENDING DESIGN DECISIONS

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Modal vs Bottom Sheet | Full modal center / Sidebar overlay? | ✅ **Sidebar**  |
| 2   | Task Card Action | Click card to detail / Show preview | ✅ **Show preview** |
| 3   | Completed Tasks | Section collapsible / Hidden? | ✅ **Hidden by default**  |
| 4   | Filter Defaults | All checked / Only active tasks? | ✅ **All checked**  |
| 5   | Pagination Style | Infinite scroll / Load More button? | ✅ **No paginate (update later)**  |

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review wireframes (desktop & mobile) | ✅ Reviewed |
| Đã review component specifications | ✅ Reviewed |
| Đã điền Design Decisions | ✅ Filled |
| **APPROVED tiến tới BƯỚC 2B** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09012026

