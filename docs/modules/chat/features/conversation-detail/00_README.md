# Feature: Conversation Detail (Chi tiết đoạn chat)

> **Module:** Chat  
> **Feature ID:** `conversation-detail`  
> **Created:** 2025-12-30  
> **Status:** 🔄 IN PROGRESS

---

## 📋 Tổng Quan

Feature hiển thị chi tiết một cuộc hội thoại, bao gồm:

- **Header:** Thông tin nhóm/người chat
- **Message List:** Danh sách tin nhắn với infinite scroll
- **Message Input:** Ô nhập tin nhắn + attachments
- **Right Panel:** Thông tin bổ sung (files, tasks, members)

### UI Reference

Giữ nguyên UI từ mockup `ChatMain.tsx`:

- Message bubbles (sent/received)
- File attachments
- Reply/Forward functionality
- Typing indicator
- Read receipts

---

## 📂 Documentation Structure

```
docs/modules/chat/features/conversation-detail/
├── 00_README.md                 # [BƯỚC 0] Overview (file này)
├── 01_requirements.md           # [BƯỚC 1] ⏳ Yêu cầu chi tiết
├── 02a_wireframe.md             # [BƯỚC 2A] ✅ Giữ nguyên từ mockup
├── 02b_flow.md                  # [BƯỚC 2B] ⏳ User flow
├── 03_api-contract.md           # [BƯỚC 3] ⏳ Link tới docs/api/
├── 04_implementation-plan.md    # [BƯỚC 4] ⏳ Kế hoạch implement
├── 05_progress.md               # [BƯỚC 5] Auto-track
└── 06_testing.md                # [BƯỚC 6] ⏳ Test cases

docs/api/chat/conversation-detail/
├── contract.md                  # API specification
└── snapshots/v1/                # Response snapshots
```

---

## 🔗 Related Files

### Source Code (Mockup)

- [ChatMain.tsx](../../../../../src/features/portal/workspace/ChatMain.tsx) - UI Component chính
- [MessageBubble.tsx](../../../../../src/features/portal/components/MessageBubble.tsx) - Message component
- [RightPanel.tsx](../../../../../src/features/portal/workspace/RightPanel.tsx) - Panel phải

### API Documentation

- [API Contract](../../../../api/chat/conversation-detail/contract.md)

### Related Features

- [Conversation List](../conversation-list/00_README.md)

---

## 📝 Changelog

| Version | Date       | Changes           | Author |
| ------- | ---------- | ----------------- | ------ |
| 1.0.0   | 2025-12-30 | Initial structure | AI     |
