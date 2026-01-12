# Phase 5 - Word & Excel File Preview in Conversation Details

> **Module:** Chat  
> **Feature:** Conversation Details - File Preview Enhancement  
> **Phase:** 5  
> **Status:** ⏳ PENDING (Chờ API snapshots + HUMAN approval)  
> **Created:** 2026-01-12  
> **Last Updated:** 2026-01-12

---

## 📋 Overview

Phase 5 mở rộng file preview capability trong conversation details để hỗ trợ 2 loại file mới:

- **Word files (.docx)** - Convert sang HTML để preview trực tiếp trong browser
- **Excel files (.xlsx, .xls)** - Parse và hiển thị dạng table với cells, styles, merged cells

### Context

Trong conversation details, khi user click vào file attachment:

- **Trước đây (Phase 1-4):** Chỉ preview được images, PDFs
- **Phase 5:** Thêm preview cho Word và Excel files

### Backend API Changes

| Old Endpoint              | New Endpoints (Phase 5)         | Change Type |
| ------------------------- | ------------------------------- | ----------- |
| `/api/Files/{id}/preview` | Giữ nguyên (generic preview)    | No change   |
| -                         | `/api/Files/{id}/preview/word`  | 🆕 NEW      |
| -                         | `/api/Files/{id}/preview/excel` | 🆕 NEW      |

---

## 🎯 Goals

1. **User Experience:**

   - Preview Word documents as formatted HTML (headings, tables, images)
   - Preview Excel spreadsheets with cell formatting, colors, merged cells
   - Hiển thị watermark để bảo vệ dữ liệu
   - Smooth loading states

2. **Technical:**

   - Integrate 2 APIs mới từ File service
   - Reusable preview components
   - Proper TypeScript typing
   - Comprehensive testing

3. **Security:**
   - Watermark visible trên mọi preview
   - View-only mode (không có editing)
   - Token-based authentication

---

## 📁 Related Documentation

### Phase 5 Documents (Follow Workflow)

| File                        | Status       | Description                              |
| --------------------------- | ------------ | ---------------------------------------- |
| `00_README.md`              | ✅ This file | Overview và navigation                   |
| `01_requirements.md`        | ⏳ To create | Functional & non-functional requirements |
| `02a_wireframe.md`          | ⏳ To create | UI mockups cho Word/Excel preview        |
| `03_api-contract.md`        | ✅ Ready     | Link to File API contracts               |
| `04_implementation-plan.md` | ⏳ To create | Implementation checklist                 |
| `05_progress.md`            | ⏳ Auto      | Auto-generated progress tracker          |
| `06_testing.md`             | ⏳ To create | Test requirements & coverage             |

### External API Documentation

| Document                   | Location                                    | Status     |
| -------------------------- | ------------------------------------------- | ---------- |
| Word Preview API Contract  | `docs/api/file/preview-word/contract.md`    | ✅ Created |
| Excel Preview API Contract | `docs/api/file/preview-excel/contract.md`   | ✅ Created |
| Word Snapshots Guide       | `docs/api/file/preview-word/snapshots/v1/`  | ✅ Created |
| Excel Snapshots Guide      | `docs/api/file/preview-excel/snapshots/v1/` | ✅ Created |

---

## 🔗 Quick Links

### API Documentation

- [Word Preview Contract](../../../../api/file/preview-word/contract.md)
- [Excel Preview Contract](../../../../api/file/preview-excel/contract.md)
- [Swagger API](https://vega-file-api-dev.allianceitsc.com/swagger/index.html)

### Previous Phases

- [Phase 1](../conversation-details-phase-1/00_README.md) - Basic conversation details
- [Phase 2](../conversation-details-phase-2/00_README.md) - Enhanced UI
- [Phase 3](../conversation-details-phase-3/00_README.md) - Advanced features
- [Phase 4](../conversation-details-phase-4/00_README.md) - Message grouping

---

## 📝 Next Steps

1. **HUMAN:** Review API contracts và cung cấp snapshots
2. **AI:** Tạo `01_requirements.md` - Define functional requirements
3. **AI:** Tạo `02a_wireframe.md` - UI mockups cho preview components
4. **AI:** Tạo `04_implementation-plan.md` - Implementation checklist
5. **AI:** Tạo `06_testing.md` - Test requirements
6. **HUMAN:** Approve all documents
7. **AI:** Start coding implementation

---

## ⚠️ Current Blockers

- ⏳ **API Snapshots:** Chưa có actual response data từ dev API
- ⏳ **Requirements:** Chưa define chi tiết UI/UX requirements
- ⏳ **Wireframes:** Chưa có mockups cho preview layout

**Status:** ⬜ CHƯA SẴN SÀNG để coding
