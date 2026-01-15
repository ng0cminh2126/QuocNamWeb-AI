# [BƯỚC 2A] View All Files - Wireframe & UI Specs

**Module:** Chat  
**Feature:** View All Files  
**Phase:** UI Design & Wireframes  
**Created:** 2025-01-09

---

## 📐 Component Layout - Desktop

### WF-01: InformationPanel with "View All Files" Button

```
┌─────────────────────────────────────────────────────────────┐
│  InformationPanel (Right Panel)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nhóm: Bộ phận Marketing | Loại việc: Thiết kế         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Ảnh / Video ───────────────┐                            │ │
│ │                             │                            │ │
│ │  [Thumbnail] [Thumbnail]    │  ← 4-5 columns in grid   │ │
│ │  [Thumbnail] [Thumbnail]    │                            │ │
│ │                             │                            │ │
│ │  [Xem tất cả (12)] Button ──┘ ← NEW BUTTON              │ │
│ │                                                           │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Tài liệu ──────────────────┐                            │ │
│ │                             │                            │ │
│ │ 📄 proposal.pdf    2.5 MB   │                            │ │
│ │ 📊 budget.xlsx     512 KB   │                            │ │
│ │ 📝 notes.docx      756 KB   │                            │ │
│ │                             │                            │ │
│ │  [Xem tất cả (8)] Button ───┘ ← NEW BUTTON              │ │
│ │                                                           │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### WF-02: View All Files Modal - Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Tất cả Ảnh - Bộ phận Marketing              [X] Search [Close] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Filters:  [Type ▼] [Date ▼] [Sender ▼]  Sort: [Newest ▼]      │
│  ├─ Images ✓                                                       │
│  ├─ Videos ✓                                                       │
│  ├─ PDF                                                            │
│  └─ Other                                                          │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail]    │
│  [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail]    │
│  [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail]    │
│  [Thumbnail] [Thumbnail] [Thumbnail]                            │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  Showing 15 of 47 files  [< Prev] [1] [2] [3] [4] [Next >]       │
└─────────────────────────────────────────────────────────────────────┘
```

---

### WF-03: View All Files Modal - Document Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│  Tất cả Tài liệu - Bộ phận Marketing        [X] Search [Close] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Filters:  [Type ▼] [Date ▼] [Sender ▼]  Sort: [Newest ▼]      │
│  ├─ PDF ✓                                                          │
│  ├─ Word ✓                                                         │
│  ├─ Excel ✓                                                        │
│  └─ Other ✓                                                        │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ 📄 proposal_2025.pdf              2.5 MB  │ 2025-01-08 14:30   │ │
│ 📊 budget_allocation_q1_2025.xlsx 512 KB  │ 2025-01-08 16:20   │ │
│ 📝 project_guidelines_v3.docx     764 KB  │ 2025-01-08 17:30   │ │
│ 📄 meeting_notes.pdf              1.2 MB  │ 2025-01-07 10:15   │ │
│ 📊 sales_report_2024.xlsx         3.1 MB  │ 2025-01-06 09:00   │ │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  Showing 5 of 8 files  [< Prev] [1] [Next >]                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### WF-04: File Hover State

```
Grid View (Images):
┌─────────────┐
│  [Image]    │  ← Hover: shadow appears, scale 1.05
│             │     Show file name on bottom
│  filename.  │     Show size on bottom-right
│  png 2.5MB  │     Show overlay: "Click to preview"
└─────────────┘

List View (Documents):
┌──────────────────────────────────────────────┐
│ 📄 proposal_2025.pdf  2.5 MB │ 2025-01-08 │  ← Hover: bg-gray-50
│                       ↑                       Underline filename
│                Show on hover tooltip          Show hover shadow
└──────────────────────────────────────────────┘
```

---

### WF-05: File Preview Overlay

```
┌────────────────────────────────────────────────────────────────┐
│                    File Preview Overlay                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [< Prev]         [Full Resolution Image]        [Next >]     │
│                   (or document preview)                        │
│                   Click anywhere to close                      │
│                   or press ESC                                 │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Filename: screenshot_2025_01_08.png                      │ │
│  │ Size: 1.2 MB  │  Uploaded: 2025-01-08 15:45             │ │
│  │ Sender: Trần Thị B                                       │ │
│  │ [Download] [Open in New Tab] [Copy Link] [View Message] │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📱 Component Layout - Mobile (<600px)

### WF-06: Mobile InformationPanel

```
┌─────────────────────────────────┐
│ ← Bộ phận Marketing              │ Header
├─────────────────────────────────┤
│                                 │
│ ┌─ Ảnh / Video ───────────────┐ │
│ │ [T] [T] [T]                 │ │
│ │ [T] [T] [T]                 │ │
│ │ [Xem tất cả (12)]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ Tài liệu ──────────────────┐ │
│ │ 📄 proposal.pdf             │ │
│ │ 📊 budget.xlsx              │ │
│ │ [Xem tất cả (8)]            │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### WF-07: Mobile File Modal (Full Screen)

```
┌─────────────────────────────────┐
│ ✕ Tất cả Ảnh            Search │
├─────────────────────────────────┤
│                                 │
│ [Filter] [Sort]                 │
│                                 │
│ [T] [T] Grid (2 cols)          │
│ [T] [T]                         │
│ [T] [T]                         │
│                                 │
│ [< Prev] 1/5 [Next >]           │
│                                 │
│ [↑ Scroll for more]             │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 Visual Design Specifications

### Colors & Styling

| Element | Style | Notes |
|---------|-------|-------|
| **Modal Background** | White (`bg-white`) | Match existing modal style |
| **File Thumbnail** | Rounded corners (`rounded-md`) | 8-12px radius |
| **File Hover** | `shadow-md` + `scale-105` | 200ms transition |
| **Badge/Pill** | `bg-brand-100` text `text-brand-700` | For filter pills |
| **Loading Skeleton** | Gray gradient shimmer | Match modal design |
| **Error State** | Red border + icon | `border-red-300` |
| **Empty State** | Gray text centered | `text-gray-500` |

### Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Modal Title | System font | 18-20px | Bold (600) | Gray-900 |
| File Name | System font | 13-14px | Medium (500) | Gray-800 |
| File Size | System font | 12px | Regular (400) | Gray-500 |
| Filter Label | System font | 12px | Medium (500) | Gray-700 |
| Pagination Text | System font | 12px | Regular (400) | Gray-600 |

### Spacing

| Element | Padding | Margin | Notes |
|---------|---------|--------|-------|
| Modal Header | `p-4` | - | Title + search + close |
| Filter Bar | `px-4 py-3` | `mb-3` | Optional, above grid |
| File Grid | `p-4 gap-3` | - | Grid columns: 4-5 desktop, 3 tablet, 2 mobile |
| File Card | `p-2` | - | Thumbnail wrapper |
| List Item | `px-4 py-3` | `border-b` | One file per row |
| Pagination | `p-4 border-t` | `mt-4` | Footer area |

### Responsive Breakpoints

```
Desktop (>1200px):   Grid 5 columns, side filters
Laptop (992-1200px): Grid 4 columns, side filters
Tablet (600-992px):  Grid 3 columns, top filters
Mobile (<600px):     Grid 2 columns, full-width modal
```

---

## 🔄 Component States

### Loading State

```
┌──────────────────────────────────────────┐
│ Tất cả Ảnh - Bộ phận Marketing  [X]     │
├──────────────────────────────────────────┤
│                                          │
│  [████] [████] [████] [████] [████]     │
│  [████] [████] [████] [████] [████]     │
│  [████] [████] [████]                    │
│                                          │
│  Đang tải...                             │
│                                          │
└──────────────────────────────────────────┘
```

### Empty State

```
┌──────────────────────────────────────────┐
│ Tất cả Ảnh - Bộ phận Marketing  [X]     │
├──────────────────────────────────────────┤
│                                          │
│            📷 (empty icon)               │
│                                          │
│      Không tìm thấy ảnh nào              │
│                                          │
│  Thử thay đổi bộ lọc hoặc tìm kiếm      │
│                                          │
└──────────────────────────────────────────┘
```

### Error State

```
┌──────────────────────────────────────────┐
│ Tất cả Ảnh - Bộ phận Marketing  [X]     │
├──────────────────────────────────────────┤
│                                          │
│            ⚠️ (error icon)               │
│                                          │
│      Không thể tải dữ liệu                │
│                                          │
│    [Thử lại]                             │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🖱️ Interaction & Animation

### Button Animations
- **Hover:** `bg-opacity-90` + `scale-100`
- **Active:** `bg-opacity-80` + `scale-98`
- **Transition:** `200ms ease-in-out`

### File Card Animations
- **Hover:** `shadow-md` + `scale-105` + `duration-150`
- **Click:** `scale-95` (quick feedback)
- **Load:** Fade in from opacity 0 (100ms stagger per item)

### Modal Animations
- **Open:** Fade in (`opacity-0` → `opacity-100`, 200ms)
- **Close:** Fade out + scale down (150ms)
- **Content:** Slide up on load (300ms)

### Filter/Sort Animations
- **Dropdown open:** Slide down (150ms)
- **Filter apply:** Instant, fade items in/out
- **Pagination:** Fade in new items (200ms)

---

## ♿ Accessibility Specifications

### Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Navigate through filters, buttons, files |
| **Enter** | Activate button, open file preview |
| **Arrow Keys** | Navigate files in grid (Left/Right/Up/Down) |
| **Escape** | Close modal or preview |
| **Ctrl/Cmd+F** | Focus search input |

### ARIA Labels

```tsx
// Modal dialog
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">

// File grid
<div role="grid" aria-label="File list">
  <div role="gridcell">
    <button aria-label="Open image: screenshot_2025.png">
      <img alt="File thumbnail" />
    </button>
  </div>
</div>

// Search input
<input 
  type="search" 
  aria-label="Search files by name"
  aria-describedby="search-hint"
/>

// Filter button
<button aria-expanded="false" aria-haspopup="menu">
  Filters
</button>
```

### Color Contrast

- All text: WCAG AA minimum (4.5:1 ratio)
- Interactive elements: WCAG AAA where possible
- Error messages: Red color + icon (not color-only)

### Focus Indicators

- All interactive elements: Visible focus ring (2px, brand color)
- Focus should not be hidden or low-contrast
- Tab order follows visual order (LTR)

---

## 📋 UI Component Requirements

### 1. Modal Dialog
- **Library:** Use existing Dialog/Modal from project (Radix UI)
- **Size:** 90vw max-width 1200px on desktop
- **Animation:** Fade + slight scale up
- **Close:** X button + ESC key + click outside (optional)

### 2. File Grid
- **Columns:** 5 (desktop), 4 (laptop), 3 (tablet), 2 (mobile)
- **Gap:** 12-16px between items
- **Aspect Ratio:** 1:1 square for images
- **Loading:** Skeleton cards matching dimensions

### 3. File List (Documents)
- **Layout:** One row per file
- **Columns:** Icon, Name, Size, Date, Actions (optional)
- **Row Height:** 48-56px
- **Hover:** Subtle background change

### 4. Search Input
- **Position:** Modal header, right of title
- **Width:** 200-250px on desktop
- **Placeholder:** "Tìm kiếm tệp..."
- **Debounce:** 300ms

### 5. Filter Controls
- **Trigger:** Dropdown button or collapsible section
- **Type:** Checkboxes for multi-select
- **Position:** Top bar (above grid) or side panel
- **Apply:** Real-time (no submit button)

### 6. Sort Dropdown
- **Options:** Newest, Oldest, Name A-Z, Size
- **Default:** Newest first
- **Position:** Top-right of file list

### 7. Pagination
- **Style:** Numbers + Prev/Next buttons (if pagination_size < 100)
- **Position:** Bottom footer
- **Show:** "Showing X of Y" text
- **Disable:** Prev/Next buttons at boundaries

---

## 📐 Figma/Design File References

**Recommended Components to Reuse:**

From existing design system:
- ✅ `RightAccordion` - for section headers
- ✅ `Dialog` / `Modal` - from Radix UI
- ✅ `Button` - for all interactive elements
- ✅ `Input` - for search field
- ✅ `Badge` - for filter pills
- ✅ `Checkbox` - for filter options
- ✅ `FileIcon` - for document type icons
- ✅ Skeleton loaders - for loading state

---

## ⏳ PENDING DESIGN DECISIONS

| # | Decision | Options | Decision |
|---|----------|---------|----------|
| 1 | Filter position | Top bar / Side panel / Tab menu | ✅ **Top bar** (reuse FileManagerPhase1A) |
| 2 | Sort position | Top-right / Filter menu / Bottom | ✅ **Top-right** (add to FileManagerPhase1A) |
| 3 | Pagination style | Numbers / Infinite scroll / Load more | ✅ **Numbers** (Prev/Next buttons) |
| 4 | Show sender name | Always / On hover / Only for docs | ✅ **Only for docs** (show in doc list, not grid) |
| 5 | File size display | Always / On hover / List view only | ✅ **Always** (match FileManagerPhase1A) |
| 6 | File preview | Modal overlay / New tab / Inline | ✅ **Modal overlay** (reuse existing FilePreview) |

**Decisions locked in** - Ready for Phase 2B onwards

---

## ✅ WIREFRAME APPROVAL

| Item | Status |
|------|--------|
| Desktop layout reviewed | ✅ Reviewed |
| Mobile layout reviewed | ✅ Reviewed |
| Component states reviewed | ✅ Reviewed |
| Accessibility specs reviewed | ✅ Reviewed |
| **Wireframe APPROVED** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09/01/2026

> ✅ **READY FOR PHASE 1** - Wireframe approved, proceeding to requirements generation.
