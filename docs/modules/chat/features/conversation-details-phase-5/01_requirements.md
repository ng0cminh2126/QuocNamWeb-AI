# [BƯỚC 1] Requirements - Word & Excel Preview

> **Module:** Chat  
> **Feature:** Conversation Details Phase 5 - Word & Excel Preview  
> **Document Type:** Requirements Specification  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-12

---

## 📋 Feature Overview

Khi user click vào file attachment trong conversation details, system sẽ preview file content trực tiếp trong browser cho Word (.docx) và Excel (.xlsx, .xls) files.

---

## ✅ Functional Requirements

### FR-1: Word File Preview

| ID     | Requirement                                             | Priority | Acceptance Criteria                                                                       |
| ------ | ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| FR-1.1 | Hệ thống phải hiển thị Word file (.docx) dưới dạng HTML | MUST     | HTML content render với đúng formatting                                                   |
| FR-1.2 | Preserve headings (H1-H6) từ Word document              | MUST     | Headings hiển thị với đúng hierarchy                                                      |
| FR-1.3 | Preserve text formatting (bold, italic, underline)      | MUST     | Text styles hiển thị đúng                                                                 |
| FR-1.4 | Hiển thị tables từ Word document                        | MUST     | Tables render với rows/columns                                                            |
| FR-1.5 | Hiển thị images embedded trong Word                     | SHOULD   | Images show as base64 embedded                                                            |
| FR-1.6 | Hiển thị lists (ordered, unordered)                     | SHOULD   | Lists render với bullets/numbers                                                          |
| FR-1.7 | Show watermark trên preview                             | MUST     | Watermark visible dạng background pattern repeating, chỉ hiển thị user identifier (email) |
| FR-1.8 | Legacy .doc format show error message                   | MUST     | Clear error: "Only .docx supported"                                                       |

### FR-2: Excel File Preview

| ID      | Requirement                                                     | Priority | Acceptance Criteria                                                                                      |
| ------- | --------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| FR-2.1  | Hệ thống phải hiển thị Excel file (.xlsx, .xls) dưới dạng table | MUST     | Table với rows và columns                                                                                |
| FR-2.2  | Hiển thị cell values (text, numbers, dates)                     | MUST     | Values display với đúng type                                                                             |
| FR-2.3  | Hiển thị cell formatting (bold, colors, alignment)              | SHOULD   | Styles apply to cells                                                                                    |
| FR-2.4  | Hiển thị merged cells                                           | SHOULD   | Merged cells span correctly                                                                              |
| FR-2.5  | Hiển thị multiple sheets với tabs                               | MUST     | User có thể switch giữa sheets                                                                           |
| FR-2.6  | Show formatted values (e.g., $12,500.50 cho numbers)            | SHOULD   | Formatted display, không chỉ raw value                                                                   |
| FR-2.7  | Hiển thị column headers (A, B, C...)                            | SHOULD   | Column letters visible                                                                                   |
| FR-2.8  | Show watermark trên preview                                     | MUST     | Watermark visible trên mọi sheet dạng background pattern repeating, chỉ hiển thị user identifier (email) |
| FR-2.9  | Truncate large files (>500 rows, >50 cols, >5 sheets)           | MUST     | Show truncation message                                                                                  |
| FR-2.10 | Pagination cho Excel files với configurable rows per page       | MUST     | Pagination controls visible                                                                              |
| FR-2.11 | Default page size = 50 rows                                     | MUST     | First page shows 50 rows                                                                                 |
| FR-2.12 | User có thể chọn page size: 50 hoặc 100 rows                    | MUST     | Dropdown/select cho page size                                                                            |
| FR-2.13 | Hiển thị page info (e.g., "Page 1 of 10", "Rows 1-50 of 500")   | MUST     | Page info visible                                                                                        |
| FR-2.14 | Pagination controls: First, Prev, Next, Last                    | MUST     | All navigation buttons functional                                                                        |

### FR-3: Loading & Error States

| ID     | Requirement                                            | Priority | Acceptance Criteria                        |
| ------ | ------------------------------------------------------ | -------- | ------------------------------------------ |
| FR-3.1 | Show loading skeleton khi đang fetch file              | MUST     | Skeleton animation visible                 |
| FR-3.2 | Show error message nếu file không tồn tại (404)        | MUST     | User-friendly error với retry button       |
| FR-3.3 | Show error message nếu file format không support (415) | MUST     | Clear message: "File format not supported" |
| FR-3.4 | Show error message nếu network error                   | MUST     | Error message với retry option             |
| FR-3.5 | Timeout sau 30 seconds nếu API không response          | SHOULD   | Show timeout error                         |

### FR-4: User Interactions

| ID     | Requirement                                     | Priority | Acceptance Criteria                       |
| ------ | ----------------------------------------------- | -------- | ----------------------------------------- |
| FR-4.1 | User có thể close preview sheet                 | MUST     | Close button functional                   |
| FR-4.2 | User có thể switch giữa sheets trong Excel      | MUST     | Tab clicks work, active sheet highlighted |
| FR-4.3 | User có thể scroll long documents (Word/Excel)  | MUST     | Scroll works smoothly                     |
| FR-4.4 | User có thể retry nếu preview fail              | SHOULD   | Retry button refetches                    |
| FR-4.5 | User có thể navigate giữa pages trong Excel     | MUST     | Prev/Next/First/Last buttons work         |
| FR-4.6 | User có thể change page size (50 hoặc 100 rows) | MUST     | Dropdown changes, data reloads            |

---

## 🔒 Non-Functional Requirements

### NFR-1: Performance

| ID      | Requirement                                    | Target | Measurement                     |
| ------- | ---------------------------------------------- | ------ | ------------------------------- |
| NFR-1.1 | Preview load time < 3 seconds cho file < 5MB   | < 3s   | Time to first render            |
| NFR-1.2 | Preview load time < 10 seconds cho file 5-20MB | < 10s  | Time to first render            |
| NFR-1.3 | Smooth scrolling (60fps)                       | 60fps  | No jank during scroll           |
| NFR-1.4 | API timeout 30 seconds                         | 30s    | Request cancelled after timeout |

### NFR-2: Security

| ID      | Requirement                                                   | Priority | Implementation                                                                                                                                                                     |
| ------- | ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-2.1 | Watermark PHẢI hiển thị trên mọi preview                      | MUST     | User identifier (email) visible dạng repeating background pattern (SVG), font-weight 400, font-size 16px, opacity 0.12, rotated -30deg, pattern size 300x200px (~4 watermarks/row) |
| NFR-2.2 | Preview chỉ view-only (không edit)                            | MUST     | No editing functionality                                                                                                                                                           |
| NFR-2.3 | API calls PHẢI có authentication token                        | MUST     | Bearer token trong headers                                                                                                                                                         |
| NFR-2.4 | Sensitive data trong Word/Excel PHẢI redacted (if applicable) | SHOULD   | Follow backend redaction rules                                                                                                                                                     |

### NFR-3: Usability

| ID      | Requirement                                                | Priority | Acceptance Criteria                   |
| ------- | ---------------------------------------------------------- | -------- | ------------------------------------- | --- | ------- | ------------------------------------------------ | ---- | ------------------------- | --- | ------- | -------------------------------------- | ----- | -------------------------------- |
| NFR-3.1 | Error messages PHẢI user-friendly (không technical jargon) | MUST     | Clear Vietnamese messages             |
| NFR-3.2 | Loading state PHẢI có progress indicator                   | MUST     | Spinner "Đang tải dữ liệu..." visible |
| NFR-3.3 | Preview PHẢI responsive (desktop, tablet, mobile)          | SHOULD   | Layout adapts to screen size          |
| NFR-3.4 | UI style PHẢI giống 100% với PDF/Image preview modal       | MUST     | Header, loading, error states match   |
| NFR-3.5 | Header height h-[60px], padding px-6, FileText icon        | MUST     | Exact same styling as PDF modal       |
| NFR-3.6 | Close button (✕) native element with hover effects         | MUST     | Same button styling as PDF modal      |
| NFR-3.7 | Content area background bg-gray-50, document bg-white      | MUST     | Consistent color scheme               |     | NFR-3.8 | Document content padding p-6 (matches PDF modal) | MUST | 24px padding on all sides |     | NFR-3.4 | Keyboard navigation support (Tab, Esc) | COULD | Tab to close, Esc to close sheet |

### NFR-4: Accessibility

| ID      | Requirement                               | Priority | WCAG Level |
| ------- | ----------------------------------------- | -------- | ---------- |
| NFR-4.1 | All interactive elements có `data-testid` | MUST     | -          |
| NFR-4.2 | Error messages có contrast ratio > 4.5:1  | SHOULD   | AA         |
| NFR-4.3 | Loading skeleton có aria-label            | SHOULD   | AA         |

---

## 🎨 UI/UX Requirements

### UI-1: Word Preview Layout

```
┌─────────────────────────────────────────────────┐
│ [FileText Icon] Document.docx            [✕]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  <Rendered HTML Content>                        │
│  - Headings with hierarchy                      │
│  - Paragraphs with text formatting              │
│  - Tables                                        │
│  - Images (base64)                              │
│                                                 │
│  [Watermark Pattern: user@example.com]          │
│  (Repeating background, rotated -30deg)         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### UI-2: Excel Preview Layout

```
┌─────────────────────────────────────────────────┐
│ [FileText Icon] Spreadsheet.xlsx         [✕]   │
├─────────────────────────────────────────────────┤
│ [Sheet 1] [Sheet 2] [Sheet 3]  ← Tabs          │
├─────────────────────────────────────────────────┤
│    A         B         C         D              │
│ ┌─────────┬─────────┬─────────┬─────────┐      │
│ │ Header1 │ Header2 │ Header3 │ Header4 │  1   │
│ ├─────────┼─────────┼─────────┼─────────┤      │
│ │ Value1  │ 123.45  │ Date    │ Text    │  2   │
│ │ ...     │ ...     │ ...     │ ...     │  ... │
│ │ Value50 │ 678.90  │ Date    │ Text    │  50  │
│ └─────────┴─────────┴─────────┴─────────┘      │
│                                                 │
│ Rows per page: [50 ▼] [100]  Rows 1-50 of 500  │
│ [« First] [‹ Prev] Page 1 of 10 [Next ›] [Last »]│
│                                                 │
│  [Watermark Pattern: user@example.com]          │
│  (Repeating background, rotated -30deg)         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⏳ PENDING DECISIONS

| #   | Question                                       | Options                           | HUMAN Decision                                                                                                                                                                                   |
| --- | ---------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Word max content length?                       | 500K chars (default) or custom?   | ⬜ \***500K chars**                                                                                                                                                                              |
| 2   | Excel default rows per page?                   | 50 rows (default) or 100?         | ⬜ **\*50 rows**                                                                                                                                                                                 |
| 3   | Excel default maxColumns?                      | 50 cols (default) or custom?      | ⬜ \***50 cols**                                                                                                                                                                                 |
| 4   | Excel default maxSheets?                       | 5 sheets (default) or custom?     | ⬜ \***5 sheets**                                                                                                                                                                                |
| 5   | Watermark position?                            | Bottom-right, top-right, overlay? | ✅ **Repeating background pattern - SVG data URL với text rotated -30deg, font-weight 400, pattern size 300x200px (~4 watermarks/row), chỉ hiển thị userIdentifier (email), không có timestamp** |
| 6   | Có cần print functionality?                    | Yes/No (out of scope?)            | ⬜ \***No**                                                                                                                                                                                      |
| 7   | Có cần export to PDF?                          | Yes/No (out of scope?)            | ⬜ \***No**                                                                                                                                                                                      |
| 8   | Excel pagination: Load all data hay lazy load? | Load all/Lazy load per page       | ⬜ **\*Load all**                                                                                                                                                                                |
| 9   | Có hiển thị "Jump to page" input?              | Yes/No                            | ⬜ **\*No**                                                                                                                                                                                      |

---

## 📊 Success Metrics

| Metric                              | Target | Measurement Method                   |
| ----------------------------------- | ------ | ------------------------------------ |
| Preview success rate                | > 95%  | Successful previews / Total attempts |
| Average preview load time           | < 3s   | Time to first render                 |
| User satisfaction (preview quality) | > 4/5  | User feedback survey                 |
| Error rate                          | < 5%   | Failed previews / Total attempts     |

---

## 🚫 Out of Scope (Phase 5)

Các tính năng này KHÔNG implement trong Phase 5:

- ❌ Editing Word/Excel files
- ❌ Commenting on documents
- ❌ Version comparison
- ❌ Export to PDF
- ❌ Print functionality
- ❌ Track changes display (Word)
- ❌ Formula evaluation (Excel)
- ❌ Charts/graphs display (Excel)
- ❌ Pivot tables (Excel)
- ❌ Macros execution

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                              | Status       |
| ------------------------------------- | ------------ |
| Đã review Functional Requirements     | ✅ Đã review |
| Đã review Non-Functional Requirements | ✅ Đã review |
| Đã review UI/UX Requirements          | ✅ Đã review |
| Đã điền Pending Decisions             | ✅ Đã điền   |
| **APPROVED requirements**             | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-12

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC proceed to wireframe (BƯỚC 2) nếu requirements chưa approved**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 5 Overview
- [03_api-contract.md](./03_api-contract.md) - API Contracts
- Next: [02a_wireframe.md](./02a_wireframe.md) - UI Mockups
