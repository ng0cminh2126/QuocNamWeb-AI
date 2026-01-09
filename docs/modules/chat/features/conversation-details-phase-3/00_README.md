# Phase 3: File Preview Modal - Overview

> **Module:** Chat  
> **Feature:** File Preview Modal for PDF/Documents  
> **Phase:** 3  
> **Status:** ✅ APPROVED - Implementation complete  
> **Created:** 2026-01-08

---

## 📋 Overview

**What is Phase 3?**

Phase 3 bổ sung tính năng preview files (đặc biệt là PDF) ngay trong ứng dụng thông qua modal, không cần download.

**Relationship to Other Phases:**

- **Phase 1** (conversation-details-phase-1): Base messaging - Display messages và basic file display
- **Phase 2** (conversation-details-phase-2): File attachment display - Icon, filename, size in message bubble
- **Phase 3** (THIS PHASE): **File preview modal** - Click vào file → mở modal xem nội dung

---

## 🎯 Goals

### Primary Goal

Cho phép user preview files (PDF, images, documents) ngay trong app bằng modal, không cần download về máy.

### Success Criteria

✅ Click vào file attachment → mở preview modal  
✅ Modal hiển thị file content theo pages (PDF: mỗi page là 1 ảnh)  
✅ Modal có header (tên file), close button, pagination  
✅ Scroll inside modal only (không scroll toàn trang)  
✅ Support PDF multi-page với next/prev buttons

---

## 📁 Folder Structure

```
docs/modules/chat/features/conversation-details-phase-3/
├── 00_README.md                    # This file - Overview
├── 01_requirements.md              # ✅ APPROVED - Feature requirements
├── 02a_wireframe.md                # ✅ APPROVED - Modal UI design
├── 02b_flow.md                     # ✅ APPROVED - User interaction flow
├── 03_api-contract.md              # ✅ APPROVED - Link to API docs
├── 04_implementation-plan.md       # ✅ APPROVED - Implementation tasks
├── 05_progress.md                  # ✅ COMPLETE - Progress tracker
└── 06_testing.md                   # ✅ APPROVED - Test specifications

docs/api/chat/file-preview/
├── contract.md                     # API specification
└── snapshots/v1/                   # API response examples
    ├── README.md                   # How to capture snapshots
    ├── preview-headers.txt         # Response headers (X-Total-Pages)
    ├── render-page-success.json    # Single page render
    └── preview-error.json          # Error cases
```

---

## 🔗 API Endpoints

Phase 3 chỉ cần 2 endpoints (đơn giản hơn v1):

### 1. File Preview (First Page + Headers)

- **Endpoint:** `GET /api/Files/{id}/preview`
- **Purpose:** Preview file (first page for PDF) + lấy total pages từ headers
- **Response Body:** Binary image với watermark
- **Response Headers:** `X-Total-Pages`, `X-Current-Page`
- **Note:** Đây là endpoint chính - vừa load page 1, vừa biết tổng số pages

### 2. Render Single Page (Pages 2+)

- **Endpoint:** `GET /api/pdf/{fileId}/pages/{pageNumber}/render`
- **Purpose:** Render page 2 trở đi thành image
- **Params:** `pageNumber` (1-based), `dpi` (default 300)
- **Response:** Binary PNG image

**Flow:**

```
User clicks file → GET /preview (page 1 + headers)
                 → Read X-Total-Pages header
                 → Display navigation if > 1 page
                 → User clicks Next → GET /render (page 2+)
```

---

## 🎨 UI Components

### FilePreviewModal Component

- **Location:** `src/components/FilePreviewModal.tsx`
- **Features:**
  - Header: Filename + Close button
  - Content: Scrollable container với file images
  - Pagination: Page X of Y, Prev/Next buttons
  - Loading states
  - Error handling

---

## 🧪 Testing

- **Unit Tests:** FilePreviewModal component behaviors
- **Integration Tests:** API calls + rendering
- **E2E Tests:** Click file → modal opens → navigate pages

---

## 📖 Related Documents

- [API Contract - File Preview](../../../../api/chat/file-preview/contract.md)
- [Phase 1 - Base Messaging](../conversation-details-phase-1/00_README.md)
- [Phase 2 - File Attachments](../conversation-details-phase-2/00_README.md)

---

**Next Step:** Create `01_requirements.md` với chi tiết requirements
