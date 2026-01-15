# [BƯỚC 1] View All Files - Requirements

**Module:** Chat  
**Feature:** View All Files  
**Phase:** Functional & Technical Requirements  
**Created:** 2025-01-09  
**Approved By:** Khoa  
**Approval Date:** 09/01/2026

---

## 📋 Feature Requirements Overview

Based on wireframe approval and locked design decisions, this document defines all functional (FR) and non-functional (NFR) requirements for the View All Files feature.

### Locked Design Decisions Used

| Decision | Value |
|----------|-------|
| Pagination size | 50 items per page |
| Modal behavior | Modal dialog |
| Default sort | Newest first |
| Sender info | Only for documents |
| Bulk download | Disabled |
| Filter position | Top bar |

---

## 🎯 Functional Requirements (FR)

### Category A: Modal Trigger & Opening

**FR-A1: View All Files Button - Images**
- InformationPanel displays "Xem tất cả (N)" button in Ảnh/Video section
- Button shows count: "Xem tất cả (12)"
- Button disabled when no media files exist
- data-testid: `view-all-media-button`

**FR-A2: View All Files Button - Documents**
- InformationPanel displays "Xem tất cả (N)" button in Tài liệu section
- Button shows count: "Xem tất cả (8)"
- Same styling as FR-A1
- Button disabled when no documents exist
- data-testid: `view-all-docs-button`

**FR-A3: Modal Opens on Button Click**
- Clicking "Xem tất cả" button opens ViewAllFilesModal
- Modal displays appropriate title (Ảnh or Tài liệu)
- Modal title: "Tất cả Ảnh - Bộ phận Marketing"
- Modal is centered, max-width 1200px on desktop, 90vw on mobile

**FR-A4: Modal Close Functionality**
- X button, ESC key, click outside modal closes it
- Close animation: fade-out + scale-down (150ms)
- data-testid: `close-modal-button`

---

### Category B: File List Display - Images/Videos

**FR-B1: Grid Layout for Media Files**
- Desktop: 5 columns, Laptop: 4 columns, Tablet: 3 columns, Mobile: 2 columns
- Gap: 12-16px between items
- Aspect ratio: 1:1 square
- Hover state: shadow-md + scale-105 (200ms)

**FR-B2: Image Thumbnails**
- Thumbnail size: 120px × 120px
- Src: use thumbnailUrl from API
- Rounded corners: 8-12px
- Video files show play icon overlay
- data-testid: `file-thumbnail-{fileId}`

**FR-B3: File Name on Hover/Grid**
- Show file name on bottom of thumbnail
- Max 20 chars, truncate with ellipsis if longer
- Font: 13px, weight 500, color: gray-800
- data-testid: `file-name-{fileId}`

**FR-B4: File Size Display**
- Position: bottom-right of thumbnail
- Format: "2.5 MB" or "512 KB"
- Font: 12px, weight 400, color: gray-500

**FR-B5: Loading State - Grid**
- 15 skeleton cards matching actual grid layout
- Shimmer animation until data loads
- Show "Đang tải..." text
- data-testid: `loading-skeleton`

**FR-B6: Empty State - No Media Files**
- Display centered icon (📷)
- Text: "Không tìm thấy ảnh nào"
- Subtext: "Thử thay đổi bộ lọc hoặc tìm kiếm"
- data-testid: `empty-state-media`

---

### Category C: File List Display - Documents

**FR-C1: List Layout for Documents**
- One file per row, height: 48-56px
- Columns: Icon, Name, Size, Date
- Hover state: bg-gray-50 + shadow
- data-testid: `document-list`

**FR-C2: Document Icons**
- PDF: 📄, Word: 📝, Excel: 📊, PowerPoint: 🎯, Other: 📎
- Color-coded (red, blue, green, orange, gray)
- data-testid: `file-icon-{fileId}`

**FR-C3: Document Name & Truncation**
- Max width: 50% of row
- Truncate with ellipsis if longer
- Font: 13px, weight 500, color: gray-800
- Tooltip shows full name on hover
- data-testid: `file-name-{fileId}`

**FR-C4: Document Size**
- Position: right of filename
- Format: "2.5 MB" or "512 KB"
- Font: 12px, weight 400, color: gray-500
- Right-aligned in column

**FR-C5: Document Upload Date**
- Format: "2025-01-08 14:30"
- Font: 12px, weight 400, color: gray-500
- Right-aligned in column
- Show user's local time

**FR-C6: Document Sender (For Docs Only)**
- Show sender name for documents only (not images/videos)
- Format: "Trần Thị B"
- Font: 12px, weight 400, color: gray-600
- Can be in tooltip on hover
- data-testid: `file-sender-{fileId}`

**FR-C7: Loading State - Document List**
- 5-8 skeleton rows matching row height
- Shimmer animation
- Show "Đang tải..."
- data-testid: `loading-skeleton`

**FR-C8: Empty State - No Documents**
- Display centered icon (📄)
- Text: "Không tìm thấy tài liệu nào"
- Subtext: "Thử thay đổi bộ lọc hoặc tìm kiếm"
- data-testid: `empty-state-docs`

---

### Category D: Search Functionality

**FR-D1: Search Input Field**
- Position: top-right of modal
- Placeholder: "Tìm kiếm tệp..."
- Width: 200-250px on desktop
- Icon: 🔍 left of input
- Clear button (X) appears when typing
- data-testid: `search-input`

**FR-D2: Search by Filename**
- Debounce: 300ms
- Case-insensitive matching
- Match partial names: "pro" matches "proposal.pdf"
- Update list immediately on input
- data-testid: `search-results`

**FR-D3: Clear Search**
- Click X button clears search input
- Resets to original file list
- data-testid: `clear-search-button`

**FR-D4: No Results Message**
- Text: "Không tìm thấy tệp 'xxx'"
- Subtext: "Thử tìm kiếm khác"
- Show search term in message
- data-testid: `no-search-results`

---

### Category E: Filter Functionality

**FR-E1: Filter Bar Position**
- Position: Below modal header
- Full width of modal
- Horizontal layout (not sidebar)
- Padding: px-4 py-3
- data-testid: `filter-bar`

**FR-E2: File Type Filter (Images/Videos)**
- Checkbox options: Images, Videos
- Default: Both checked
- Reuse existing filter component from FileManagerPhase1A
- Update list immediately on toggle
- data-testid: `filter-type-{type}`

**FR-E3: File Type Filter (Documents)**
- Checkbox options: PDF, Word, Excel, PowerPoint, Other
- Default: All checked
- Update list immediately on toggle
- data-testid: `filter-type-{type}`

**FR-E4: Date Filter (Optional)**
- Options: Today, This week, This month, Older
- Single-select dropdown (not multi-select)
- Default: Show all dates
- data-testid: `filter-date`

**FR-E5: Sender Filter (Documents Only)**
- Multi-select dropdown
- Show list of senders in current files
- Default: All selected
- Only visible for document tab
- data-testid: `filter-sender`

**FR-E6: Filter Pills/Badges Display**
- Display selected filter values as pills
- Background: brand-100, Text: brand-700
- X button to remove individual filter
- "Clear all" option if multiple active
- data-testid: `filter-pill-{filterType}`

---

### Category F: Sort Functionality

**FR-F1: Sort Dropdown Position**
- Position: Same row as filters, right side
- Label: "Sắp xếp:"
- Dropdown button
- data-testid: `sort-dropdown`

**FR-F2: Sort Options - Media Files**
- Options: Newest, Oldest, Name A-Z, Size (Large to Small), Size (Small to Large)
- Default: Newest first
- Apply immediately on selection
- data-testid: `sort-option-{type}`

**FR-F3: Sort Options - Documents**
- Options: Newest, Oldest, Name A-Z, Size (Large to Small)
- Default: Newest first
- Apply immediately on selection
- data-testid: `sort-option-{type}`

**FR-F4: Current Sort Display**
- Display selected sort in dropdown button
- Example: "Sắp xếp: Mới nhất"
- Icon indicates sort direction (↓ or ↑)

---

### Category G: Pagination

**FR-G1: Pagination Style**
- Number-based pagination (not infinite scroll)
- Items per page: 50
- Style: Numbers + Prev/Next buttons
- Position: Bottom footer
- data-testid: `pagination`

**FR-G2: Page Numbers Display**
- Show max 5 page numbers at once
- Previous/Next buttons
- Prev button disabled on page 1
- Next button disabled on last page
- Current page highlighted
- data-testid: `page-{number}`

**FR-G3: Items Count Display**
- Format: "Showing 1-50 of 247 files"
- Left side of pagination
- Font: 12px, color: gray-600

**FR-G4: Page Change**
- Click page number loads that page
- Click Prev/Next goes to adjacent page
- Scroll to top of modal on page change
- Show loading state while fetching

---

### Category H: File Preview

**FR-H1: File Click to Preview**
- Click thumbnail opens preview
- Click filename opens preview
- Preview opens as modal overlay
- data-testid: `file-preview-{fileId}`

**FR-H2: Preview Overlay Layout**
- Centered overlay on modal
- Shows full resolution image or document preview
- Close button (X) top-right
- Prev/Next navigation buttons
- Click outside or ESC to close
- data-testid: `preview-overlay`

**FR-H3: Preview File Information**
- Filename: "screenshot_2025_01_08.png"
- File size: "1.2 MB"
- Upload date: "2025-01-08 15:45"
- Sender name (for docs)
- data-testid: `file-info-{fileId}`

**FR-H4: Preview Actions**
- Download button: Opens file download
- Open in new tab: Opens file URL in new window
- Copy link: Copies download URL to clipboard
- View message: Links back to original message
- data-testid: `preview-action-{action}`

**FR-H5: Preview Navigation**
- Prev button: Show previous file (disabled if first)
- Next button: Show next file (disabled if last)
- Arrow keys (← →) also navigate
- Maintain current filters/sort when navigating
- data-testid: `preview-nav-{direction}`

**FR-H6: Document Preview**
- Use existing FilePreview component
- Show PDF viewer for PDFs
- Show document preview for Office files
- Fallback to download link if preview unavailable
- data-testid: `document-preview`

---

### Category I: API Integration

**FR-I1: Fetch Messages with Files**
- Endpoint: GET /api/conversations/{conversationId}/messages
- Query param: limit=50
- Extract message.attachments from response
- Map attachments to File objects
- data-testid: `api-fetch-messages`

**FR-I2: File URL Construction**
- Pattern: /api/files/{fileId}
- Use API base URL + fileId from attachment
- Validate fileId is not empty
- Handle URL encoding for special chars

**FR-I3: File Categorization**
- Media: contentType.startsWith("image/") or "video/"
- Documents: All other contentTypes
- Use contentType from attachment DTO
- Consistent categorization across all views

**FR-I4: Pagination Cursor**
- First page: No cursor param
- Next page: Use "before" cursor from previous response
- Cursor value: oldestMessageId from previous response
- Increment page offset: itemsPerPage * pageNumber

**FR-I5: Error Handling - Network**
- Show error message: "Không thể tải dữ liệu"
- Show retry button
- Log error details
- Retry button re-fetches data
- data-testid: `error-state` + `retry-button`

**FR-I6: Error Handling - No Auth**
- If 401: Redirect to login
- If 403: Show "Không có quyền truy cập"
- Clear auth token on 401
- data-testid: `auth-error`

---

### Category J: Accessibility (A11y)

**FR-J1: Keyboard Navigation**
- Tab: Navigate through controls
- Enter: Activate buttons, open previews
- ESC: Close modal/preview
- Arrow keys: Navigate files in grid/list
- Tab order follows visual order (LTR)

**FR-J2: ARIA Labels**
- Modal: role="dialog" + aria-labelledby
- Buttons: aria-label describing action
- File grid: role="grid" + aria-label
- Inputs: aria-label + aria-describedby
- Filter checkboxes: aria-checked, aria-label

**FR-J3: Color Contrast**
- WCAG AA minimum (4.5:1 for normal text)
- Error states: Red + icon (not color-only)
- Focus indicators: 2px border, high contrast

**FR-J4: Focus Management**
- Focus ring: 2px, brand color
- Focus visible on all buttons, inputs, links
- Focus moves to modal on open
- Focus trapped in modal (no tab outside)
- Focus restored to trigger button on close

---

## 🔧 Non-Functional Requirements (NFR)

### Performance (NFR-P)

**NFR-P1: Modal Load Time**
- Initial modal open should load within 500ms
- Include fetch time + rendering
- Show skeleton loaders while loading

**NFR-P2: Search Response**
- Search should respond within 300ms (debounced)
- Filter updates should be instant (client-side)
- Sort updates should be instant (client-side)

**NFR-P3: Image Thumbnail Load**
- Thumbnails should load within 2s
- Use lazy loading for off-screen images
- Show placeholder while loading

**NFR-P4: Preview Load**
- File preview should open within 1s
- Use cached thumbnails when available
- Show loading indicator for documents

**NFR-P5: Pagination Performance**
- Page change should load within 800ms
- Limit API calls to 50 items per page
- Don't pre-load all pages

---

### Reliability (NFR-R)

**NFR-R1: API Retry Logic**
- Retry failed requests 3 times
- Exponential backoff: 1s, 2s, 4s
- Show error after 3 failed attempts

**NFR-R2: State Persistence**
- Don't persist filter/sort state across sessions
- Reset to defaults when modal reopens
- Keep pagination state during session

**NFR-R3: Memory Management**
- Unload previous page data when navigating
- Clear preview data on modal close
- Prevent memory leaks on component unmount

---

### Scalability (NFR-S)

**NFR-S1: Large File Lists**
- Support conversations with 1000+ files
- Pagination handles large counts efficiently
- Limit grid renders to viewport items (virtual scroll optional)

**NFR-S2: Concurrent Users**
- No database locks for read-only file listing
- API should handle high concurrent requests
- Cache file listings when possible

---

### Security (NFR-SC)

**NFR-SC1: Access Control**
- User can only view files from their conversation
- Validate conversationId ownership on backend
- No exposure of sensitive data in URLs

**NFR-SC2: File Download Security**
- Download URLs require authentication
- Use signed URLs with expiration
- Log file downloads for audit

**NFR-SC3: XSS Prevention**
- Sanitize all user-generated content
- Escape filenames in display
- Validate file types from API

---

### Maintainability (NFR-M)

**NFR-M1: Code Structure**
- Use custom hooks for API logic
- Separate components: FileGrid, FileList, SearchBar, etc.
- Reuse existing components (FileManagerPhase1A, FilePreview)

**NFR-M2: Test Coverage**
- Minimum 80% code coverage
- Unit tests for utility functions
- Integration tests for API flows
- E2E tests for user workflows

**NFR-M3: Documentation**
- JSDoc comments for all functions
- Storybook stories for components
- API documentation in contract.md

---

## 📊 Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Functional Requirements | 49 | ✅ Complete |
| Non-Functional Requirements | 10 | ✅ Complete |
| **Total Requirements** | **59** | ✅ Locked |
| Locked Decisions | 6/6 | ✅ All Set |
| Wireframe Approval | ✅ | ✅ Approved |
| Requirements Ready | ✅ | ✅ Ready for BƯỚC 2B |

---

## ✅ REQUIREMENTS APPROVAL

| Checkpoint | Status |
|-----------|--------|
| All FR requirements reviewed | ✅ Reviewed |
| All NFR requirements reviewed | ✅ Reviewed |
| Requirements align with wireframe | ✅ Aligned |
| Requirements aligned with locked decisions | ✅ Aligned |
| **APPROVED for BƯỚC 2B** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09/01/2026

> ✅ **READY FOR BƯỚC 2B** - All 59 requirements locked and approved. Ready for flow diagram and API contract.
