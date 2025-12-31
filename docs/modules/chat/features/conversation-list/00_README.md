# Feature: Conversation List (Danh sách đoạn chat)

> **Module:** Chat  
> **Feature ID:** `conversation-list`  
> **Created:** 2025-12-30  
> **Status:** 🔄 IN PROGRESS

---

## 📋 Tổng Quan

Feature hiển thị danh sách các cuộc hội thoại (conversations), bao gồm:

- **Nhóm (Groups):** Các group chat trong tổ chức
- **Cá nhân (Direct Messages):** Chat 1-1 với các thành viên

### UI Reference

Giữ nguyên UI từ mockup `LeftSidebar.tsx`:

- Tabs chuyển đổi: Nhóm / Cá nhân
- Search box tìm kiếm
- Danh sách conversations với:
  - Avatar / Initials
  - Tên nhóm/người
  - Tin nhắn cuối
  - Thời gian
  - Badge số tin chưa đọc
  - Trạng thái online (cho DM)

---

## 📂 Documentation Structure

```
docs/modules/chat/features/conversation-list/
├── 00_README.md                 # [BƯỚC 0] Overview (file này)
├── 01_requirements.md           # [BƯỚC 1] ⏳ Yêu cầu chi tiết
├── 02a_wireframe.md             # [BƯỚC 2A] ✅ Giữ nguyên từ mockup
├── 02b_flow.md                  # [BƯỚC 2B] ⏳ User flow
├── 03_api-contract.md           # [BƯỚC 3] ⏳ Link tới docs/api/
├── 04_implementation-plan.md    # [BƯỚC 4] ⏳ Kế hoạch implement
├── 05_progress.md               # [BƯỚC 5] Auto-track
└── 06_testing.md                # [BƯỚC 6] ⏳ Test cases

docs/api/chat/conversation-list/
├── contract.md                  # API specification
└── snapshots/v1/                # Response snapshots
```

---

## 🔗 Related Files

### Source Code (Mockup)

- [LeftSidebar.tsx](../../../../../src/features/portal/workspace/LeftSidebar.tsx) - UI Component chính

### API Documentation

- [API Contract](../../../../api/chat/conversation-list/contract.md)

### Related Features

- [Conversation Detail](../conversation-detail/00_README.md)

---

## 📝 Changelog

| Version | Date       | Changes           | Author |
| ------- | ---------- | ----------------- | ------ |
| 1.0.0   | 2025-12-30 | Initial structure | AI     |
