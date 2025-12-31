# [BƯỚC 3] API Contract - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Status:** ✅ READY - API đã có

---

## 📋 API Summary

| Endpoint                             | Method | Description                        |
| ------------------------------------ | ------ | ---------------------------------- |
| `/api/conversations/{guid}/messages` | GET    | Lấy messages với pagination        |
| `/api/conversations/{guid}/messages` | POST   | Gửi tin nhắn mới (⏳ pending test) |

---

## 📂 Full Documentation

👉 **Xem chi tiết tại:** [docs/api/chat/conversation-detail/contract.md](../../../../api/chat/conversation-detail/contract.md)

---

## 📊 Snapshots Available

| File                                                                                                         | Description           | Status     |
| ------------------------------------------------------------------------------------------------------------ | --------------------- | ---------- |
| [get-messages-success.json](../../../../api/chat/conversation-detail/snapshots/v1/get-messages-success.json) | Response GET messages | ✅         |
| send-message-success.json                                                                                    | Response POST message | ⏳ Pending |

---

## 🔑 Key Information

### Pagination

- **Type:** Cursor-based
- **Default limit:** 50 messages
- **Fields:** `items`, `nextCursor`, `hasMore`

### Message Content Types

| Type   | Description         |
| ------ | ------------------- |
| `TXT`  | Text message        |
| `IMG`  | Image attachment    |
| `FILE` | File attachment     |
| `TASK` | Task linked message |

### Authentication

```http
Authorization: Bearer {accessToken}
```

---

## 🔌 SignalR Events

| Hub          | Event         | Direction | Description      |
| ------------ | ------------- | --------- | ---------------- |
| `/hubs/chat` | `NewMessage`  | Receive   | Tin nhắn mới     |
| `/hubs/chat` | `UserTyping`  | Receive   | User đang nhập   |
| `/hubs/chat` | `StopTyping`  | Receive   | User ngưng nhập  |
| `/hubs/chat` | `MessageRead` | Receive   | Tin đã đọc       |
| `/hubs/chat` | `Typing`      | Send      | Gửi typing event |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục               | Status          |
| ---------------------- | --------------- |
| GET messages confirmed | ✅ Done         |
| GET snapshot captured  | ✅ Done         |
| POST message           | ⏳ Pending test |
| **APPROVED for GET**   | ✅ APPROVED     |

**Confirmed by:** HUMAN  
**Date:** 2025-12-30
