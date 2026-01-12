# API Contract - Pinned & Starred Messages

## Status: ⏳ PENDING

> **Note:** This contract needs snapshots and HUMAN approval before implementation.

---

## 1. Pin Message

### Overview
| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| **Endpoint**  | `POST /api/messages/{id}/pin`             |
| **Base URL**  | `${VITE_APP_BASE_URL}`                     |
| **Auth**      | Required (Bearer token)                    |
| **Purpose**   | Pin a message in a chat group              |

### Request Headers
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Request Body
```typescript
interface PinMessageRequest {
  groupId: string;
}
```

### Validation Rules
| Field     | Required | Type   | Rules                          |
| --------- | -------- | ------ | ------------------------------ |
| groupId   | ✅       | string | UUID format, group must exist  |
| id        | ✅       | string | UUID format, message must exist|

### Response Success (200 OK)
```typescript
interface PinMessageResponse {
  success: true;
  data: {
    id: string;
    groupId: string;
    isPinned: true;
    pinnedAt: string; // ISO 8601
    pinnedBy: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
}
```

### Error Responses
| Status | Code                     | Message                                    |
| ------ | ------------------------ | ------------------------------------------ |
| 400    | INVALID_MESSAGE_ID       | Message ID is invalid or not found         |
| 401    | UNAUTHORIZED             | Missing or invalid authentication token    |
| 403    | FORBIDDEN                | User does not have permission to pin       |
| 404    | GROUP_NOT_FOUND          | Group not found                            |
| 409    | MAX_PINNED_REACHED       | Maximum pinned messages limit reached      |
| 500    | INTERNAL_SERVER_ERROR    | Server error occurred                      |

**Snapshots:** [v1/pin-success.json](snapshots/v1/pin-success.json), [v1/pin-error-401.json](snapshots/v1/pin-error-401.json)

---

## 2. Unpin Message

### Overview
| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| **Endpoint**  | `DELETE /api/messages/{id}/pin`           |
| **Base URL**  | `${VITE_APP_BASE_URL}`                     |
| **Auth**      | Required (Bearer token)                    |
| **Purpose**   | Unpin a message from a chat group          |

### Request Headers
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Request Body
```typescript
interface UnpinMessageRequest {
  groupId: string;
}
```

### Validation Rules
| Field     | Required | Type   | Rules                          |
| --------- | -------- | ------ | ------------------------------ |
| groupId   | ✅       | string | UUID format, group must exist  |
| id        | ✅       | string | UUID format, must be pinned    |

### Response Success (200 OK)
```typescript
interface UnpinMessageResponse {
  success: true;
  data: {
    id: string;
    groupId: string;
    isPinned: false;
  };
}
```

### Error Responses
| Status | Code                     | Message                                    |
| ------ | ------------------------ | ------------------------------------------ |
| 400    | INVALID_MESSAGE_ID       | Message ID is invalid or not pinned        |
| 401    | UNAUTHORIZED             | Missing or invalid authentication token    |
| 403    | FORBIDDEN                | User does not have permission to unpin     |
| 404    | MESSAGE_NOT_FOUND        | Message not found                          |
| 500    | INTERNAL_SERVER_ERROR    | Server error occurred                      |

**Snapshots:** [v1/unpin-success.json](snapshots/v1/unpin-success.json)

---

## 3. Get Pinned Messages

### Overview
| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| **Endpoint**  | `GET /api/conversations/{id}/pinned-messages`|
| **Base URL**  | `${VITE_APP_BASE_URL}`                     |
| **Auth**      | Required (Bearer token)                    |
| **Purpose**   | Get all pinned messages in a group         |

### Request Headers
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Query Parameters
```typescript
interface GetPinnedMessagesParams {
  limit?: number;  // Default: 10, Max: 50
}
```

### Validation Rules
| Field     | Required | Type   | Rules                          |
| --------- | -------- | ------ | ------------------------------ |
| id        | ✅       | string | UUID format, group must exist  |
| limit     | ❌       | number | 1-50                           |

### Response Success (200 OK)
```typescript
interface GetPinnedMessagesResponse {
  success: true;
  data: {
    messages: Array<{
      id: string;
      content: string;
      groupId: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      isPinned: true;
      pinnedAt: string; // ISO 8601
      pinnedBy: {
        id: string;
        name: string;
      };
      createdAt: string; // ISO 8601
    }>;
    total: number;
  };
}
```

### Error Responses
| Status | Code                     | Message                                    |
| ------ | ------------------------ | ------------------------------------------ |
| 401    | UNAUTHORIZED             | Missing or invalid authentication token    |
| 403    | FORBIDDEN                | User is not a member of the group          |
| 404    | GROUP_NOT_FOUND          | Group not found                            |
| 500    | INTERNAL_SERVER_ERROR    | Server error occurred                      |

**Snapshots:** [v1/get-pinned-success.json](snapshots/v1/get-pinned-success.json)

---

## 4. Star Message

### Overview
| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| **Endpoint**  | `POST /api/messages/{id}/star`            |
| **Base URL**  | `${VITE_APP_BASE_URL}`                     |
| **Auth**      | Required (Bearer token)                    |
| **Purpose**   | Star a message for personal reference      |

### Request Headers
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Request Body
```typescript
// No body required - user context from token
```

### Validation Rules
| Field     | Required | Type   | Rules                          |
| --------- | -------- | ------ | ------------------------------ |
| id        | ✅       | string | UUID format, message must exist|

### Response Success (200 OK)
```typescript
interface StarMessageResponse {
  success: true;
  data: {
    id: string;
    isStarred: true;
    starredAt: string; // ISO 8601
  };
}
```

### Error Responses
| Status | Code                     | Message                                    |
| ------ | ------------------------ | ------------------------------------------ |
| 400    | INVALID_MESSAGE_ID       | Message ID is invalid or not found         |
| 401    | UNAUTHORIZED             | Missing or invalid authentication token    |
| 409    | MAX_STARRED_REACHED      | Maximum starred messages limit reached     |
| 500    | INTERNAL_SERVER_ERROR    | Server error occurred                      |

**Snapshots:** [v1/star-success.json](snapshots/v1/star-success.json)

---

## 5. Unstar Message

### Overview
| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| **Endpoint**  | `DELETE /api/messages/{id}/star`          |
| **Base URL**  | `${VITE_APP_BASE_URL}`                     |
| **Auth**      | Required (Bearer token)                    |
| **Purpose**   | Unstar a message                           |

### Request Headers
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Response Success (200 OK)
```typescript
interface UnstarMessageResponse {
  success: true;
  data: {
    id: string;
    isStarred: false;
  };
}
```

### Error Responses
| Status | Code                     | Message                                    |
| ------ | ------------------------ | ------------------------------------------ |
| 400    | INVALID_MESSAGE_ID       | Message ID is invalid or not starred       |
| 401    | UNAUTHORIZED             | Missing or invalid authentication token    |
| 404    | MESSAGE_NOT_FOUND        | Message not found                          |
| 500    | INTERNAL_SERVER_ERROR    | Server error occurred                      |

**Snapshots:** [v1/unstar-success.json](snapshots/v1/unstar-success.json)

---

## 6. Get Starred Messages

### Overview
| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| **Endpoint**  | `GET /api/starred-messages`               |
| **Base URL**  | `${VITE_APP_BASE_URL}`                     |
| **Auth**      | Required (Bearer token)                    |
| **Purpose**   | Get all starred messages for current user  |

### Request Headers
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Query Parameters
```typescript
interface GetStarredMessagesParams {
  limit?: number;   // Default: 20, Max: 100
  offset?: number;  // Default: 0
}
```

### Validation Rules
| Field     | Required | Type   | Rules                          |
| --------- | -------- | ------ | ------------------------------ |
| limit     | ❌       | number | 1-100                          |
| offset    | ❌       | number | >= 0                           |

### Response Success (200 OK)
```typescript
interface GetStarredMessagesResponse {
  success: true;
  data: {
    messages: Array<{
      id: string;
      content: string;
      groupId: string;
      groupName: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      isStarred: true;
      starredAt: string; // ISO 8601
      createdAt: string; // ISO 8601
    }>;
    total: number;
    hasMore: boolean;
  };
}
```

### Error Responses
| Status | Code                     | Message                                    |
| ------ | ------------------------ | ------------------------------------------ |
| 401    | UNAUTHORIZED             | Missing or invalid authentication token    |
| 500    | INTERNAL_SERVER_ERROR    | Server error occurred                      |

**Snapshots:** [v1/get-starred-success.json](snapshots/v1/get-starred-success.json)

---

## IMPACT SUMMARY

### Files sẽ tạo mới:
- `src/api/pinned_and_starred.api.ts` - API client functions
- `src/hooks/queries/usePinnedMessages.ts` - Query hook for pinned messages
- `src/hooks/queries/useStarredMessages.ts` - Query hook for starred messages
- `src/hooks/mutations/usePinMessage.ts` - Mutation for pin/unpin
- `src/hooks/mutations/useStarMessage.ts` - Mutation for star/unstar
- `src/types/pinned_and_starred.ts` - TypeScript types

### Files sẽ sửa đổi:
- Chưa xác định (phụ thuộc vào UI integration)

### Dependencies sẽ thêm:
- Không có (sử dụng dependencies hiện có)

---

## PENDING DECISIONS

| #   | Vấn đề                    | Lựa chọn                 | HUMAN Decision |
| --- | ------------------------- | ------------------------ | -------------- |
| 1   | Max pinned per group      | 1, 3, 5, 10, unlimited?  | ⬜ **_____**   |
| 2   | Max starred per user      | 20, 50, 100, unlimited?  | ⬜ **_____**   |
| 3   | Pin permission            | All members, admin only? | ⬜ **_____**   |
| 4   | Cache stale time (pinned) | 30s, 60s, 5min?          | ⬜ **_____**   |
| 5   | Cache stale time (starred)| 30s, 60s, 5min?          | ⬜ **_____**   |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review API Contract    | ⬜ Chưa review |
| Đã điền Pending Decisions | ⬜ Chưa điền   |
| Đã có snapshots           | ⬜ Chưa có     |
| **APPROVED để thực thi**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [_____]  
**Date:** [_____]

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu "APPROVED để thực thi" = ⬜ CHƯA APPROVED**
