# [BƯỚC 3] API Contract - Conversation List

> **Feature:** Danh sách đoạn chat  
> **Status:** ✅ READY - API đã có

---

## 📋 API Summary

| Endpoint             | Method | Description                       |
| -------------------- | ------ | --------------------------------- |
| `/api/groups`        | GET    | Lấy danh sách Group conversations |
| `/api/conversations` | GET    | Lấy danh sách DM conversations    |

---

## 📂 Full Documentation

👉 **Xem chi tiết tại:** [docs/api/chat/conversation-list/contract.md](../../../../api/chat/conversation-list/contract.md)

---

## 📊 Snapshots Available

| File                                                                                                         | Description                     | Status |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------- | ------ |
| [groups-success.json](../../../../api/chat/conversation-list/snapshots/v1/groups-success.json)               | Response GET /api/groups        | ✅     |
| [conversations-success.json](../../../../api/chat/conversation-list/snapshots/v1/conversations-success.json) | Response GET /api/conversations | ✅     |

---

## 🔑 Key Information

### Pagination

- **Type:** Cursor-based
- **Fields:** `items`, `nextCursor`, `hasMore`

### Conversation Types

- `GRP` - Group conversation
- `DM` - Direct message

### Authentication

```http
Authorization: Bearer {accessToken}
```

---

## 🔌 SignalR Events (Expected)

| Hub          | Event                | Direction | Description          |
| ------------ | -------------------- | --------- | -------------------- |
| `/hubs/chat` | `NewMessage`         | Receive   | Tin nhắn mới         |
| `/hubs/chat` | `UserOnline`         | Receive   | User online          |
| `/hubs/chat` | `UserOffline`        | Receive   | User offline         |
| `/hubs/chat` | `UnreadCountUpdated` | Receive   | Cập nhật số chưa đọc |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                | Status      |
| ----------------------- | ----------- |
| API endpoints confirmed | ✅ Done     |
| Snapshots captured      | ✅ Done     |
| **APPROVED**            | ✅ APPROVED |

**Confirmed by:** HUMAN  
**Date:** 2025-12-30
