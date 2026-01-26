# View Files Phase 2 - Jump to Message Feature

**Module:** Chat  
**Feature:** View All Files - Jump to Message Logic  
**Version:** 2.0  
**Created:** 2026-01-16  
**Status:** ⏳ PENDING APPROVAL

---

## 📌 Overview

Phase 2 của tính năng View All Files **CHỈ bổ sung logic**, KHÔNG thay đổi UI:

- ❌ **KHÔNG thay đổi** modal dimensions, header, close button, grid layout
- ✅ **CHỈ THÊM** logic `handleJumpToMessage` vào button "Xem tin nhắn gốc" đã có sẵn

---

## 🎯 Goals

### Primary Goals

- Cho phép user click "Xem tin nhắn gốc" để scroll tới message chứa file/image
- Highlight message trong 2s sau khi scroll
- Error handling khi message không tìm thấy

### Success Metrics

- Click "Xem tin nhắn gốc" scroll đúng tới message trong ChatMain
- Message highlight trong 2s rồi tự động biến mất
- Toast notification nếu message không load yet hoặc bị xoá

---

## 📂 Document Structure

```
view-files-phase-2/
├── 00_README.md              # This file - Overview
├── 01_requirements.md        # [BƯỚC 1] ⏳ Functional & technical requirements
├── 02a_wireframe.md          # [BƯỚC 2A] ⏳ UI/UX design with comparison
├── 02b_flow.md               # [BƯỚC 2B] ⏳ User flow diagrams
├── 03_api-contract.md        # [BƯỚC 3] N/A - No new API needed
├── 04_implementation-plan.md # [BƯỚC 4] ⏳ Step-by-step dev plan
├── 05_progress.md            # [BƯỚC 5] Auto-updated during coding
└── 06_testing.md             # [BƯỚC 6] ⏳ Test requirements
```

---

## 🔄 Version History

| Version | Date       | Changes                          | Approved By |
| ------- | ---------- | -------------------------------- | ----------- |
| 2.0     | 2026-01-16 | Initial Phase 2 requirements doc | PENDING     |

---

## 📖 Related Documents

- **Phase 1:** `docs/modules/chat/features/view_files/`
- **FilePreviewModal Reference:** `src/components/FilePreviewModal.tsx`
- **ChatMainContainer:** `src/features/portal/components/chat/ChatMainContainer.tsx`

---

## 🚀 Quick Links

- [Requirements](./01_requirements.md) - Functional & technical specs
- [Wireframe](./02a_wireframe.md) - UI mockups & comparisons
- [Implementation Plan](./04_implementation-plan.md) - Dev roadmap
- [Testing](./06_testing.md) - Test coverage matrix

---

## ⚠️ Important Notes

- **No API Changes** - This is purely frontend UX improvement
- **Backward Compatible** - Does NOT break existing ViewAllFiles functionality
- **Reusable Logic** - Scroll-to-message logic can be reused for other features (pinned messages, starred messages, etc.)

---

**Next Step:** Create [01_requirements.md](./01_requirements.md)
