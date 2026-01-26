# [BƯỚC 3] API Contract - Conversation Members

**Feature:** Get Conversation Members  
**Date:** 2026-01-20  
**Status:** ⏳ PENDING - Cần HUMAN cung cấp snapshot

---

## 📋 API Overview

| Property       | Value                                 |
| -------------- | ------------------------------------- |
| **Endpoint**   | `GET /api/conversations/{id}/members` |
| **Base URL**   | `https://api.quocnam.com`             |
| **Method**     | GET                                   |
| **Auth**       | ✅ Required (Bearer token)            |
| **Rate Limit** | Unknown (cần confirm)                 |

---

## 📤 Request

### Path Parameters

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `id`      | string | ✅ Yes   | Conversation ID |

### Headers

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Example Request

```bash
curl -X GET \
  'https://api.quocnam.com/api/conversations/conv-12345/members' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1...' \
  -H 'Content-Type: application/json'
```

---

## 📥 Response

### Success Response (200 OK)

**TypeScript Interface:**

```typescript
interface ConversationMembersResponse {
  success: boolean;
  data: {
    conversationId: string;
    members: Member[];
    totalCount: number;
  };
}

interface Member {
  id: string;
  fullName: string;
  email?: string;
  avatar?: string;
  role?: "admin" | "member" | "viewer";
  joinedAt?: string; // ISO 8601 datetime
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "conversationId": "conv-12345",
    "members": [
      {
        "id": "user-001",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "avatar": "https://cdn.example.com/avatars/user-001.jpg",
        "role": "admin",
        "joinedAt": "2025-12-01T10:30:00Z"
      },
      {
        "id": "user-002",
        "fullName": "Trần Thị B",
        "email": "tranthib@example.com",
        "avatar": null,
        "role": "member",
        "joinedAt": "2025-12-05T14:20:00Z"
      },
      {
        "id": "user-003",
        "fullName": "Lê Văn C",
        "email": "levanc@example.com",
        "avatar": "https://cdn.example.com/avatars/user-003.jpg",
        "role": "member",
        "joinedAt": "2025-12-10T09:15:00Z"
      }
    ],
    "totalCount": 3
  }
}
```

---

## ❌ Error Responses

| Status | Code                     | Message                   | When                            |
| ------ | ------------------------ | ------------------------- | ------------------------------- |
| 401    | `UNAUTHORIZED`           | "Authentication required" | Missing/invalid token           |
| 403    | `FORBIDDEN`              | "Access denied"           | User không phải member của conv |
| 404    | `CONVERSATION_NOT_FOUND` | "Conversation not found"  | ConversationId không tồn tại    |
| 500    | `INTERNAL_SERVER_ERROR`  | "An error occurred"       | Server error                    |

**Example Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "Conversation not found"
  }
}
```

---

## 🔄 Response Snapshots

### Location

```
docs/api/chat/members/
├── contract.md (this file)
└── snapshots/v1/
    ├── README.md
    ├── success.json          # ⏳ PENDING - HUMAN cần capture
    ├── error-401.json        # ⏳ PENDING
    └── error-404.json        # ⏳ PENDING
```

### How to Capture Snapshots

**1. Success Case:**

```bash
# Thay {conversationId} và {token} bằng giá trị thực tế
curl -X GET \
  'https://api.quocnam.com/api/conversations/{conversationId}/members' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  > docs/api/chat/members/snapshots/v1/success.json
```

**2. Error 401 (Unauthorized):**

```bash
# Sử dụng token invalid
curl -X GET \
  'https://api.quocnam.com/api/conversations/{conversationId}/members' \
  -H 'Authorization: Bearer invalid_token' \
  -H 'Content-Type: application/json' \
  > docs/api/chat/members/snapshots/v1/error-401.json
```

**3. Error 404 (Not Found):**

```bash
# Sử dụng conversationId không tồn tại
curl -X GET \
  'https://api.quocnam.com/api/conversations/non-existent-id/members' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  > docs/api/chat/members/snapshots/v1/error-404.json
```

---

## 🔧 Implementation Notes

### API Client

**File:** `src/api/conversations.api.ts`

```typescript
import { apiClient } from "./client";
import type { ConversationMembersResponse } from "@/types/conversation";

export async function getConversationMembers(
  conversationId: string,
): Promise<ConversationMembersResponse> {
  const response = await apiClient.get(
    `/conversations/${conversationId}/members`,
  );
  return response.data;
}
```

### Query Hook

**File:** `src/hooks/queries/useConversationMembers.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { getConversationMembers } from "@/api/conversations.api";

export const conversationMembersKeys = {
  all: ["conversation-members"] as const,
  detail: (id: string) => [...conversationMembersKeys.all, id] as const,
};

export function useConversationMembers(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationMembersKeys.detail(conversationId!),
    queryFn: () => getConversationMembers(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 60, // 1 minute - PENDING HUMAN decision
    retry: 2,
  });
}
```

### Usage in Component

```typescript
import { useConversationMembers } from '@/hooks/queries/useConversationMembers';

function ChatHeader({ conversationId }: { conversationId: string }) {
  const { data, isLoading, isError } = useConversationMembers(conversationId);

  if (isLoading) return <Skeleton className="h-4 w-20" />;
  if (isError) return null; // Silent fail or show error icon

  const memberCount = data?.data.totalCount ?? 0;

  return (
    <div>
      {/* Other header content */}
      <span className="text-sm text-gray-600">
        {memberCount} thành viên
      </span>
    </div>
  );
}
```

---

## ⚠️ Assumptions & Questions

### Assumptions:

1. API trả về mảng `members[]` với full user info
2. `totalCount` field tồn tại (nếu không, dùng `members.length`)
3. API không có pagination (trả về tất cả members)
4. Response format giống các API khác trong hệ thống (`success`, `data`, `error`)

### Questions for HUMAN:

1. **Pagination:** API có pagination không? Nếu conversation có 100+ members thì sao?
2. **Cache time:** Members thay đổi thường xuyên không? Nên cache bao lâu?
3. **Realtime updates:** Có cần subscribe SignalR khi members join/leave không?
4. **Performance:** Có cần lazy load members (chỉ fetch khi user mở detail panel)?

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                        | Status         |
| ------------------------------- | -------------- |
| API endpoint đúng format        | ⬜ Chưa verify |
| Success response structure đúng | ⬜ Chưa verify |
| Error codes đã đầy đủ           | ⬜ Chưa verify |
| Snapshots đã capture (3 files)  | ⬜ Chưa có     |
| Questions đã trả lời            | ⬜ Chưa trả    |
| **CONTRACT STATUS**             | ⏳ **PENDING** |

**HUMAN Actions Required:**

1. Capture 3 snapshot files (success, error-401, error-404)
2. Trả lời 4 questions về pagination, cache, realtime, performance
3. Verify API endpoint và response structure
4. Change status to ✅ READY

**Date:** ****\_\_\_****

> ⚠️ **CRITICAL: AI CHỈ ĐƯỢC code khi CONTRACT STATUS = ✅ READY**

---

**Created:** 2026-01-20  
**Status:** ⏳ PENDING SNAPSHOTS  
**Next Step:** HUMAN capture snapshots → Verify contract → Approve
