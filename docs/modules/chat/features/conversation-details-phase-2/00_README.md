# [BƯỚC 0] Feature Overview - Image Message Display with Preview

> **Module:** Chat  
> **Feature:** Image Message Display (Phase 2 Enhancement)  
> **Version:** 2.0  
> **Status:** ⏳ IN PROGRESS  
> **Created:** 2026-01-08  
> **Last Updated:** 2026-01-08

---

## 📋 Feature Summary

Nâng cấp hiển thị hình ảnh trong tin nhắn chat với watermark và preview popup.

**Key Changes:**

- ✅ Image attachments hiển thị trong message riêng (full width, watermark)
- ✅ Click vào ảnh → mở preview modal (full-size, watermarked)
- ✅ File attachments (PDF, DOC, etc.) giữ nguyên UI hiện tại
- ✅ 1 ảnh = 1 message riêng (không mixed content)

---

## 🎯 Business Goals

1. **Improve UX** - Users xem ảnh rõ ràng hơn trong chat
2. **Protect Content** - Mọi ảnh đều có watermark (không thể copy trực tiếp)
3. **Consistent Experience** - File attachments giữ nguyên behavior quen thuộc

---

## 📊 Scope

### ✅ In Scope (Phase 2)

- Image-only messages (JPEG, PNG, GIF, WebP)
- Full-width image display với watermark (400px max)
- Preview modal với full-size watermarked image
- File type detection (image vs non-image)
- Error handling (404, network errors)
- Unit tests (11+ test cases)

### ❌ Out of Scope (Future Phases)

- Multiple images trong 1 message (Phase 3)
- Lazy loading với Intersection Observer (Phase 3)
- Zoom controls trong preview modal (Phase 3)
- PDF thumbnail rendering (Phase 3)
- Image compression/optimization (backend responsibility)

---

## 🗂️ Document Structure

| File                                                     | Status         | Description                       |
| -------------------------------------------------------- | -------------- | --------------------------------- |
| [00_README.md](./00_README.md)                           | ✅             | Feature overview (this file)      |
| [01_requirements.md](./01_requirements.md)               | ✅ READY       | Business & technical requirements |
| [02a_wireframe.md](./02a_wireframe.md)                   | ⏳ PENDING     | UI designs & layouts              |
| [02b_flow.md](./02b_flow.md)                             | ⏳ PENDING     | User flow diagrams                |
| [03_api-contract.md](./03_api-contract.md)               | ✅ READY       | Links to API contracts            |
| [04_implementation-plan.md](./04_implementation-plan.md) | ⏳ PENDING     | Step-by-step implementation       |
| [05_progress.md](./05_progress.md)                       | ⏳ NOT STARTED | Implementation progress tracking  |
| [06_testing.md](./06_testing.md)                         | ⏳ PENDING     | Test requirements & coverage      |

---

## 🔗 Dependencies

### API Contracts (READY ✅)

- [Thumbnail API](../../../api/file/thumbnail/contract.md) - `GET /api/Files/{id}/watermarked-thumbnail?size=large`
- [Preview API](../../../api/file/preview/contract.md) - `GET /api/Files/{id}/preview`
- Both have mock snapshots (9 total files)

### Existing Features

- Phase 2 File Upload - Already implemented, tested, 88% complete
- MessageAttachment component - Existing file icon display

### Tech Stack

- React 19, TypeScript 5
- TanStack Query (server state)
- Radix UI (modal primitive)
- Axios (HTTP client)
- Vitest + @testing-library/react (testing)

---

## 👥 Stakeholders

- **Product Owner:** QUOC NAM Portal team
- **Developer:** GitHub Copilot (AI)
- **Reviewer:** HUMAN (approval required at each step)

---

## ⏱️ Timeline Estimate

| Phase             | Tasks                               | Estimated Time | Status         |
| ----------------- | ----------------------------------- | -------------- | -------------- |
| **Documentation** | Requirements, Wireframe, Flow, Plan | ~2h            | 🔄 IN PROGRESS |
| **API Layer**     | files.api.ts with 2 functions       | ~30min         | ⏳ PENDING     |
| **Components**    | MessageImage, ImagePreviewModal     | ~2h            | ⏳ PENDING     |
| **Integration**   | Update MessageAttachment routing    | ~30min         | ⏳ PENDING     |
| **Testing**       | Unit tests (11 test cases)          | ~1h            | ⏳ PENDING     |
| **Manual QA**     | 6 test scenarios                    | ~30min         | ⏳ PENDING     |
| **Total**         | -                                   | **~6.5 hours** | -              |

---

## 🚨 Critical Notes

1. **Watermark Mandatory** - NEVER use `/download` endpoint for display
2. **Blob URL Cleanup** - Must revoke on unmount to prevent memory leak
3. **HUMAN Approval Required** - AI cannot code until documents approved
4. **Existing UI Unchanged** - File attachments keep current format
5. **Single Upload Only** - Phase 2 constraint (1 file at a time)

---

## 📝 Change Log

| Date       | Version | Changes                                   |
| ---------- | ------- | ----------------------------------------- |
| 2026-01-08 | 2.0     | Initial version with HUMAN clarifications |
| -          | -       | - Image-only messages (Option A)          |
| -          | -       | - Full width display (no filename/size)   |
| -          | -       | - File attachments unchanged              |

---

## ✅ Next Steps

1. ⏳ **HUMAN Review** - Review 01_requirements.md
2. ⏳ **Create Wireframe** - AI tạo 02a_wireframe.md
3. ⏳ **Create Flow** - AI tạo 02b_flow.md
4. ⏳ **HUMAN Approval** - Approve wireframe & flow
5. ⏳ **Create Implementation Plan** - AI tạo 04_implementation-plan.md
6. ⏳ **Implementation** - Code & tests (after final approval)

---

**For questions or clarifications, refer to [01_requirements.md](./01_requirements.md)**
