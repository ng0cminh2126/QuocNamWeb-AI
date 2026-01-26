# API Contract: Mark Conversation As Read

> **Endpoint:** `POST /api/conversations/{id}/mark-read`  
> **Module:** Chat - Read Receipts  
> **Version:** v1  
> **Status:** ✅ READY  
> **Last Updated:** 2026-01-26

---

## 📋 Overview

| Property          | Value                                        |
| ----------------- | -------------------------------------------- |
| **Endpoint**      | `POST /api/conversations/{id}/mark-read`     |
| **Base URL**      | `https://vega-chat-api-dev.allianceitsc.com` |
| **Auth Required** | ✅ Yes (Bearer token)                        |
| **Rate Limit**    | N/A                                          |
| **Idempotent**    | ✅ Yes                                       |

---

## 🔐 Authentication

```http
Authorization: Bearer {access_token}
```

**Required Scopes:** Chat read/write access

---

## 📥 Request

### Path Parameters

| Parameter | Type | Required | Description                     |
| --------- | ---- | -------- | ------------------------------- |
| `id`      | UUID | ✅ Yes   | Conversation ID to mark as read |

### Request Body

**Content-Type:** `application/json`

```typescript
interface MarkAsReadRequest {
  /** Optional: Specific message ID to mark as read up to. If omitted, marks all messages as read. */
  messageId?: string; // UUID
}
```

### Example Request

```http
POST /api/conversations/550e8400-e29b-41d4-a716-446655440000/mark-read HTTP/1.1
Host: vega-chat-api-dev.allianceitsc.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "messageId": "660e8400-e29b-41d4-a716-446655440111"
}
```

**Or mark all messages as read:**

```http
POST /api/conversations/550e8400-e29b-41d4-a716-446655440000/mark-read HTTP/1.1
Host: vega-chat-api-dev.allianceitsc.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

---

## 📤 Response

### Success Response (200 OK)

**Content-Type:** `application/json`

```typescript
// Response body is empty or minimal
// Status 200 indicates success
```

**Example:**

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 0
```

---

## ⚠️ Error Responses

### 400 Bad Request

Invalid request body (e.g., invalid UUID format).

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid messageId format",
  "instance": "/api/conversations/550e8400-e29b-41d4-a716-446655440000/mark-read"
}
```

### 401 Unauthorized

Missing or invalid Bearer token.

```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authorization header missing or invalid token"
}
```

### 403 Forbidden

User is not a member of the conversation.

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "User is not a member of this conversation"
}
```

### 404 Not Found

Conversation not found.

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Conversation with ID '550e8400-e29b-41d4-a716-446655440000' not found"
}
```

---

## 📊 Snapshots

Actual API responses are captured in:

- ✅ [success-mark-all.json](./snapshots/v1/success-mark-all.json) - Mark all messages as read
- ✅ [success-mark-specific.json](./snapshots/v1/success-mark-specific.json) - Mark up to specific message
- ✅ [error-404.json](./snapshots/v1/error-404.json) - Conversation not found
- ✅ [error-403.json](./snapshots/v1/error-403.json) - Not a member

---

## 🔄 Side Effects

### Backend Behavior

1. **Updates unreadCount:**
   - Sets conversation's `unreadCount = 0` for the current user
   - Or marks messages as read up to `messageId` (if provided)

2. **SignalR Event (Expected):**
   - ⚠️ **NEED TO VERIFY:** Backend should emit `MessageRead` event to all connected clients
   - Event structure:
     ```typescript
     {
       conversationId: "550e8400-e29b-41d4-a716-446655440000",
       userId: "current-user-id",
       markedAt: "2026-01-26T10:30:00Z"
     }
     ```

3. **Database Update:**
   - Updates `ReadReceipts` table with timestamp
   - Conversation's `unreadCount` recalculated

---

## 💡 Usage Notes

### When to call this API:

✅ **Call when:**

- User clicks on a conversation (switch to conversation view)
- User scrolls to latest message
- User explicitly marks conversation as read

❌ **Don't call when:**

- User just receives a new message in active conversation (should auto-mark via real-time)
- User hovers over conversation item (too frequent)

### Frontend Integration:

```typescript
// In useMarkConversationAsRead hook
import { markConversationAsRead } from "@/api/conversations.api";

const markAsReadMutation = useMutation({
  mutationFn: async ({ conversationId }: { conversationId: string }) => {
    await markConversationAsRead(conversationId);
  },
  onMutate: async ({ conversationId }) => {
    // Optimistic update categories
    queryClient.setQueryData(categoriesKeys.list(), (oldData) => {
      // Set unreadCount = 0 for this conversation
    });
  },
});
```

---

## 🧪 Testing

See [snapshots/v1/README.md](./snapshots/v1/README.md) for:

- How to capture snapshots manually
- Test account credentials
- cURL commands for manual testing

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status       |
| --------------------------- | ------------ |
| Đã review API specification | ✅ Confirmed |
| Đã verify snapshots         | ✅ Confirmed |
| **APPROVED để implement**   | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-26
