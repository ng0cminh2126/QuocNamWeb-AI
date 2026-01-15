# [BƯỚC 2B] View All Files - User Flow Diagram

**Module:** Chat  
**Feature:** View All Files  
**Phase:** User Interaction Flows  
**Created:** 2025-01-09  
**Approved By:** Khoa  
**Approval Date:** 09/01/2026

---

## 📊 Main User Flow - Happy Path

```
User in Conversation View
         ↓
Sees InformationPanel (Right side)
  ├─ Ảnh / Video section (4-5 thumbnails)
  │  └─ "Xem tất cả (15)" button ← CLICK
  │
  └─ Tài liệu section (3 files listed)
     └─ "Xem tất cả (8)" button ← CLICK
         ↓
    ┌─────────────────────────────────┐
    │ ViewAllFilesModal Opens         │ (Fade in + center)
    ├─────────────────────────────────┤
    │ Header: "Tất cả Ảnh - Group"    │
    │ [Search] [Filters] [Sort]       │
    │ [Grid of 50 files per page]     │
    │ [Pagination: 1 2 3 4 ...]       │
    └─────────────────────────────────┘
         ↓
    USER ACTIONS (All within modal):
    ├─ Search: Type filename → Real-time filter
    ├─ Filter: Check/uncheck types → Update grid
    ├─ Sort: Select sort order → Reorder files
    ├─ Paginate: Click page 2 → Load next 50 files
    ├─ Click file → Preview overlay opens
    │  ├─ View metadata
    │  ├─ Download
    │  ├─ Open in new tab
    │  ├─ Prev/Next navigation
    │  └─ ESC or click X to close preview
    │
    └─ Close Modal: Click X, ESC, or click outside
         ↓
    RETURN TO: InformationPanel
    (Modal state cleared, modal is closed)
```

---

## 🔄 Detailed Flow - Modal Lifecycle

```
STEP 1: TRIGGER
┌────────────────────────────────────────────────┐
│ User clicks "Xem tất cả (15)" button           │
│ (in either "Ảnh / Video" or "Tài liệu" section)│
└────────────────────────────────────────────────┘
         ↓
STEP 2: MODAL OPENS
┌────────────────────────────────────────────────┐
│ ✓ Modal appears (fade-in 200ms)                │
│ ✓ Title: "Tất cả [Type] - [Group Name]"       │
│ ✓ Loading skeleton shown initially             │
│ ✓ Focus moves to modal (keyboard trap)         │
│ ✓ Background slightly dimmed                   │
└────────────────────────────────────────────────┘
         ↓
STEP 3: DATA FETCH
┌────────────────────────────────────────────────┐
│ API Call: GET /api/conversations/{id}/messages │
│ Payload: limit=50, before=(cursor if page > 1) │
│ Extract: message.attachments[]                 │
│ Filter: By type (media or docs)                │
│ Sort: By uploadedAt (newest first - locked)    │
│ Result: 50 files loaded in state               │
└────────────────────────────────────────────────┘
         ↓
STEP 4: INITIAL RENDER
┌────────────────────────────────────────────────┐
│ ✓ Grid displays first 50 files                 │
│ ✓ All filter checkboxes checked (default)      │
│ ✓ Sort shows "Newest" (locked default)         │
│ ✓ Search input empty                           │
│ ✓ Pagination shows: Page 1 of N                │
│ ✓ "Showing 1-50 of 247 files" text             │
│ ✓ Skeleton loaders fade out                    │
└────────────────────────────────────────────────┘
```

---

## 🔍 Interaction Flow - Search

```
USER TYPES IN SEARCH
        ↓
Input: "proposal" → 300ms debounce
        ↓
FILTER (Client-side, no API call):
  Files.filter(f => f.name.toLowerCase().includes("proposal"))
        ↓
RESULTS:
  ├─ Match found: Show matching files
  │  └─ Pagination resets to page 1
  │  └─ Count updates: "Showing 1-5 of 5 matching files"
  │
  └─ No match: Show empty state
     └─ Icon: 🔍
     └─ Text: "Không tìm thấy tệp 'proposal'"
     └─ Subtext: "Thử tìm kiếm khác"
        ↓
CLEAR SEARCH:
  Click X button → Reset to original list
        ↓
PAGINATION:
  Still works during search! (filters applied across all pages)
```

---

## 🏷️ Interaction Flow - Filters

```
USER CLICKS FILTER CHECKBOX
(Example: Uncheck "Images")
        ↓
STATE UPDATE (Immediate, client-side):
  filters = { images: false, videos: true, pdf: true, ... }
        ↓
RE-FILTER (All currently loaded files):
  const filtered = files.filter(f => {
    if (f.type === 'image') return filters.images;
    if (f.type === 'video') return filters.videos;
    if (f.contentType.startsWith('application/pdf')) return filters.pdf;
    return true;
  });
        ↓
UPDATE DISPLAY:
  ├─ Remove image thumbnails from grid
  ├─ Show only Videos + Documents
  ├─ Recount: "Showing 1-30 of 30 files"
  ├─ Pagination resets to page 1
  │
  └─ If no files match any filter:
     └─ Show empty state: "Không tìm thấy tệp nào"
        ↓
REAPPLY FILTER:
  Click another checkbox → Same process
        ↓
CLEAR ALL FILTERS:
  Click "Clear all" button (if any filter active) → All checked again
```

---

## 📊 Interaction Flow - Sort

```
USER CLICKS SORT DROPDOWN
        ↓
SELECT SORT OPTION:
  ├─ "Newest" (Default, locked)
  │  └─ Sort by: uploadedAt DESC (latest → oldest)
  │
  ├─ "Oldest"
  │  └─ Sort by: uploadedAt ASC (oldest → latest)
  │
  ├─ "Name A-Z"
  │  └─ Sort by: fileName ASC (alphabetical)
  │
  ├─ "Size (Large → Small)" [Media only]
  │  └─ Sort by: fileSize DESC
  │
  └─ "Size (Small → Large)" [Media only]
     └─ Sort by: fileSize ASC
        ↓
RE-SORT (All currently loaded files):
  files.sort((a, b) => selectedSortFn(a, b))
        ↓
UPDATE DISPLAY:
  ├─ Grid reorders with new sort
  ├─ Pagination resets to page 1
  ├─ Sort dropdown shows: "Sắp xếp: [Selected]" ✓
  │
  └─ Files maintain current filters during sort
        ↓
SORT ACROSS PAGINATION:
  When user goes to page 2 → Fetch next 50 messages
  Extract files → Apply current sort + filters
```

---

## 📄 Interaction Flow - Pagination

```
INITIAL STATE:
  Page: 1 of 5 (247 total files, 50 per page)
  Showing: 1-50
  Display: [< Prev] [1] [2] [3] [4] [5] [Next >]
           (Prev disabled)        (Next enabled)
        ↓
USER CLICKS PAGE 2
        ↓
FETCH NEXT BATCH:
  API: GET /api/conversations/{id}/messages?limit=50&before={cursor}
  Extract & process files from new messages
  Combine with existing state
        ↓
UPDATE PAGINATION:
  Page: 2 of 5
  Showing: 51-100
  Display: [< Prev] [1] [2] [3] [4] [5] [Next >]
           (Both enabled)
        ↓
REAPPLY FILTERS & SORT:
  All current filters applied to new files
  All current sort applied to new files
        ↓
SCROLL TO TOP OF MODAL:
  Grid jumps to top (smooth scroll)
        ↓
USER CLICKS PAGE 5 (LAST PAGE)
        ↓
FETCH REMAINING FILES:
  (May be < 50 files on last page)
        ↓
UPDATE PAGINATION:
  Page: 5 of 5
  Showing: 201-247
  Display: [< Prev] [1] [2] [3] [4] [5] [Next >]
           (Enabled)           (Disabled ← LAST PAGE)
```

---

## 🖼️ Interaction Flow - File Preview

```
USER CLICKS FILE THUMBNAIL OR NAME
        ↓
PREVIEW OPENS:
  ├─ Modal overlay (centered on screen)
  ├─ Fade-in animation (200ms)
  ├─ Click outside to close
  ├─ ESC key closes
  └─ X button closes
        ↓
FOR IMAGES:
  ├─ Full resolution image displayed
  ├─ Show dimensions: "1920 × 1080"
  ├─ Show metadata:
  │  ├─ Filename: "screenshot_2025.png"
  │  ├─ Size: "2.5 MB"
  │  ├─ Date: "2025-01-08 15:45"
  │  └─ Sender: "Trần Thị B" (if doc; hide for media)
  │
  └─ Actions:
     ├─ [Download] → Opens download
     ├─ [Open in new tab] → Opens file URL
     ├─ [Copy link] → Copies to clipboard
     └─ [View message] → Scrolls to original message
        ↓
FOR DOCUMENTS:
  ├─ Document preview (PDF viewer or Office preview)
  ├─ Show metadata:
  │  ├─ Filename: "proposal_2025.pdf"
  │  ├─ Size: "2.5 MB"
  │  ├─ Date: "2025-01-08 15:45"
  │  └─ Sender: "Trần Thị B" ← SHOW (For docs only)
  │
  └─ Actions:
     ├─ [Download] → Opens download
     ├─ [Open in new tab] → Opens PDF in new window
     ├─ [Copy link] → Copies to clipboard
     └─ [View message] → Scrolls to original message
        ↓
NAVIGATION (While previewing):
  ├─ Prev button: Show previous file
  │  └─ If first file: Prev button disabled
  │
  ├─ Next button: Show next file
  │  └─ If last file: Next button disabled
  │
  ├─ Arrow keys: ← and → also navigate
  │
  └─ Maintain current filters/sort:
     └─ Only navigate files matching current filters
        ↓
CLOSE PREVIEW:
  Click X, ESC, or outside → Preview closes
  Return to modal with file grid visible
  (Modal stays open, ready for more interactions)
```

---

## ❌ Error Handling Flows

### Flow 1: Network Error on Initial Load

```
USER CLICKS "Xem tất cả"
        ↓
MODAL OPENS (empty state)
        ↓
API CALL FAILS:
  GET /api/conversations/{id}/messages → Error (500, timeout, etc.)
        ↓
SHOW ERROR STATE:
  ├─ Icon: ⚠️
  ├─ Title: "Không thể tải dữ liệu"
  ├─ Subtext: "Kiểm tra kết nối và thử lại"
  │
  └─ [Retry] button
        ↓
USER CLICKS RETRY:
  Retry API call (with exponential backoff: 1s, 2s, 4s)
        ↓
AFTER 3 FAILED RETRIES:
  ├─ Still show error
  ├─ Disable retry button
  └─ Log error for debugging
        ↓
USER CLOSES MODAL:
  Modal closes (error state cleared)
```

### Flow 2: Network Error During Pagination

```
USER CLICKS PAGE 2
        ↓
API CALL STARTS:
  GET /api/conversations/{id}/messages?before={cursor}
        ↓
API FAILS (Network error)
        ↓
SHOW TOAST/ALERT:
  "Failed to load more files. Try again?"
        ↓
USER CLICKS RETRY (or automatic retry):
  Retry same API call
        ↓
SUCCESS:
  Load new files, update pagination
        ↓
OR FAILURE:
  Keep user on current page
  Show persistent error banner
```

### Flow 3: Search Returns No Results

```
USER TYPES: "xyz123xyz"
        ↓
SEARCH FILTERS:
  No files match search term
        ↓
SHOW EMPTY STATE:
  ├─ Icon: 🔍
  ├─ Title: "Không tìm thấy tệp 'xyz123xyz'"
  ├─ Subtext: "Thử tìm kiếm khác"
  │
  └─ No retry button (client-side filter, no error)
        ↓
USER CLEARS SEARCH:
  Grid returns to showing all files
```

### Flow 4: Authentication Error

```
USER CLICKS "Xem tất cả"
        ↓
MODAL OPENS
        ↓
API RETURNS 401 UNAUTHORIZED:
  Token expired or invalid
        ↓
SHOW AUTHENTICATION ALERT:
  "Session expired. Please log in again."
        ↓
REDIRECT TO LOGIN:
  Modal closes
  Navigate to /login
  After successful login: Return to conversation
```

---

## 📱 Mobile Flow Differences

```
MOBILE USER (<600px)
        ↓
TAPS "Xem tất cả" BUTTON
        ↓
MODAL OPENS (Full-screen width 90vw):
  ├─ Less horizontal space
  ├─ Filters shown in TOP BAR (horizontal)
  ├─ Sort in same top bar (scrollable if needed)
  │
  ├─ Grid: 2 columns instead of 5
  │ (Smaller thumbnails: 80px × 80px)
  │
  ├─ Search: Below title (full width)
  │
  └─ Pagination: Buttons only (numbers on mobile if < 10 pages)
        ↓
USER INTERACTIONS (Same logic as desktop):
  ├─ Search: Type → Real-time filter
  ├─ Filter: Tap checkbox → Update
  ├─ Sort: Tap sort button → Dropdown
  ├─ Paginate: Tap "Next" button
  │
  └─ Preview: Tap thumbnail → Full-screen preview
     └─ Navigation: Swipe left/right to prev/next (optional)
        ↓
CLOSE: Tap X or swipe down (optional)
  Modal dismisses full-screen
```

---

## 🎯 Keyboard Navigation Flow

```
USER IN MODAL (Keyboard-accessible)
        ↓
TAB KEY:
  Focus moves: Search → Filter 1 → Filter 2 → ... → Sort → File 1 → File 2 → ...
  (Tab order follows visual order, LTR)
        ↓
SHIFT+TAB: Reverse direction
        ↓
ENTER KEY:
  ├─ On checkbox: Toggle filter
  ├─ On sort: Open dropdown
  ├─ On file: Open preview
  └─ On button: Execute action
        ↓
ARROW KEYS:
  ├─ ← / →: Navigate between files in grid (within same row)
  ├─ ↑ / ↓: Navigate between rows
  │
  └─ In preview: ← / → navigate to prev/next file
        ↓
ESC KEY:
  ├─ In preview: Close preview, return to grid
  └─ In modal: Close modal
        ↓
CTRL/CMD+F:
  Focus search input (browser standard)
```

---

## 🔄 State Management Flow

```
Modal State (Zustand or Context):
┌─────────────────────────────────────────────────┐
│ {                                               │
│   isOpen: boolean                    ← Modal    │
│   modalType: 'media' | 'docs'        ← Type    │
│   files: File[]                      ← Data    │
│   page: number                       ← Current │
│   totalPages: number                 ← Total  │
│   isLoading: boolean                 ← Fetch  │
│   error: Error | null                ← Errors │
│   searchTerm: string                 ← Search │
│   filters: {                         ← Active │
│     images: boolean,                 │         │
│     videos: boolean,                 │ Filters │
│     pdf: boolean,                    │         │
│     word: boolean,                   │         │
│     excel: boolean                   │         │
│   },                                 │         │
│   sortBy: 'newest' | 'oldest' | ... ← Sort   │
│   previewFile: File | null           ← Shown  │
│ }                                               │
└─────────────────────────────────────────────────┘
        ↓
ACTIONS:
  ├─ openModal(type) → isOpen = true, fetch files
  ├─ closeModal() → isOpen = false, clear state
  ├─ updateFilters(filters) → Re-filter current files
  ├─ setSortBy(sort) → Re-sort current files
  ├─ setSearchTerm(term) → Re-filter current files
  ├─ goToPage(pageNum) → Fetch new batch, update page
  ├─ setPreviewFile(file) → Show preview
  ├─ setError(error) → Show error state
  └─ clearError() → Hide error
```

---

## 📊 Flow Diagram - All Paths

```
                        [User in Conversation]
                                 ↓
                    [Click "Xem tất cả" button]
                                 ↓
                    ┌────────────────────────┐
                    │  ViewAllFilesModal     │
                    │  Opens                 │
                    └────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Fetch files from API   │
                    └────────────────────────┘
                         ↙          ↓          ↘
                      Success   Loading    Error (401/500)
                         ↓          ↓          ↓
                      [Show]   [Skeleton] [Error State]
                    Initial 50      ↓         ↓
                      Files      [Wait] [Retry]
                         ↓          ↓         ↙
                      [Grid]   [Show Grid]   ↙
                         ↓          ↓        ↙
                    ┌────────────────────────┐
                    │ User Interactions:     │
                    │ - Search               │
                    │ - Filter               │
                    │ - Sort                 │
                    │ - Paginate             │
                    │ - Click file           │
                    └────────────────────────┘
                         ↙ ↓ ↓ ↓ ↓ ↘
                        ↓         ↓     ↓
                    [Search] [Filter] [Sort] [Page 2] [Preview]
                        ↓         ↓     ↓       ↓        ↓
                    [Filter] [Recount] [Sort] [Fetch] [Open]
                      List   Pagination      Files    Overlay
                        ↓         ↓           ↓        ↓
                    Return  Return        Return    [Close/
                     to      to            to        Next/
                    Grid   Page 1         Grid       Prev]
                         ↖     ↓     ↗             ↙
                         ┌────────────┐
                         │  Grid View │
                         │ (Ready for │
                         │   More     │
                         │   Actions) │
                         └────────────┘
                             ↓
                         [Close Modal]
                             ↓
                    [Return to Conversation]
                    (State is cleared)
```

---

## ✅ FLOW DIAGRAM APPROVAL

| Item | Status |
|------|--------|
| Main flow reviewed | ✅ Reviewed |
| Search flow reviewed | ✅ Reviewed |
| Filter flow reviewed | ✅ Reviewed |
| Sort flow reviewed | ✅ Reviewed |
| Pagination flow reviewed | ✅ Reviewed |
| Preview flow reviewed | ✅ Reviewed |
| Error handling reviewed | ✅ Reviewed |
| Mobile flow reviewed | ✅ Reviewed |
| Keyboard nav reviewed | ✅ Reviewed |
| State management reviewed | ✅ Reviewed |
| **FLOW DIAGRAM APPROVED** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09/01/2026

> ✅ **READY FOR BƯỚC 3** - All user flows documented and approved. Ready for API contract completion.
