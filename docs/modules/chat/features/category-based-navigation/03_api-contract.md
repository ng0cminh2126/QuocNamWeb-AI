# [BƯỚC 3] Category-Based Conversation Selector - API Contract

**Feature ID:** `CBN-002`  
**Version:** 2.0  
**API Version:** v2 (với nested conversations)  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Status:** ⏳ PENDING - Chưa có snapshot

---

## 📋 Overview

| Property       | Value                                         |
| -------------- | --------------------------------------------- |
| **Endpoint**   | `GET /api/categories`                         |
| **Base URL**   | `https://vega-chat-api-dev.allianceitsc.com`  |
| **Auth**       | Bearer token (Authorization header)           |
| **Method**     | GET                                           |
| **Response**   | `Array<CategoryDto>`                          |
| **Pagination** | No (returns all categories cho user hiện tại) |

**Key Changes từ v1:**

- ✅ **NEW:** `conversations: ConversationInfoDto[]` - Nested conversations per category
- ✅ **NEW:** `userId: string` - Owner of category
- ✅ **NEW:** `order: number` - Display order (int32)
- ❌ **DEPRECATED:** `/api/categories/{id}/conversations` - Không cần gọi endpoint riêng nữa

---

## 📡 Request

### Headers:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### Query Parameters:

None (endpoint trả về tất cả categories của current user)

### Example Request:

```bash
curl -X GET 'https://vega-chat-api-dev.allianceitsc.com/api/categories' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -H 'Accept: application/json'
```

---

## 📥 Response - Success

### Status Code: `200 OK`

### Response Type:

```typescript
type GetCategoriesResponse = Array<CategoryDto>;

interface CategoryDto {
  /** Category unique ID */
  id: string;

  /** User ID who owns this category */
  userId: string;

  /** Category name (e.g., "Dự án A", "Khách hàng VIP") */
  name: string;

  /** Display order (ascending) */
  order: number;

  /** 🆕 NEW: Nested conversations trong category này */
  conversations: ConversationInfoDto[];

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

interface ConversationInfoDto {
  /** Conversation unique ID */
  conversationId: string;

  /** Conversation display name */
  conversationName: string;

  /** 🆕 Potential: Unread count (TBD - PENDING DECISION #9) */
  unreadCount?: number;

  /** 🆕 Potential: Last message preview (TBD - PENDING DECISION #10) */
  lastMessage?: string;
  lastMessageAt?: string;
}
```

### Example Response:

```json
[
  {
    "id": "cat-001",
    "userId": "user-123",
    "name": "Dự án Website",
    "order": 1,
    "conversations": [
      {
        "conversationId": "conv-abc",
        "conversationName": "Frontend Development"
      },
      {
        "conversationId": "conv-def",
        "conversationName": "Backend API"
      },
      {
        "conversationId": "conv-ghi",
        "conversationName": "DevOps & CI/CD"
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-19T08:45:00Z"
  },
  {
    "id": "cat-002",
    "userId": "user-123",
    "name": "Khách hàng VIP",
    "order": 2,
    "conversations": [
      {
        "conversationId": "conv-jkl",
        "conversationName": "Client A - Tư vấn"
      },
      {
        "conversationId": "conv-mno",
        "conversationName": "Client B - Support"
      }
    ],
    "createdAt": "2025-01-10T14:20:00Z",
    "updatedAt": "2025-01-18T16:00:00Z"
  },
  {
    "id": "cat-003",
    "userId": "user-123",
    "name": "Nội bộ",
    "order": 3,
    "conversations": [],
    "createdAt": "2025-01-05T09:00:00Z",
    "updatedAt": "2025-01-05T09:00:00Z"
  }
]
```

---

## ❌ Response - Error Cases

### 401 Unauthorized:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Causes:**

- Missing `Authorization` header
- Invalid Bearer token
- Token expired

**Handling:** Redirect to login, refresh token

---

### 403 Forbidden:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied"
}
```

**Causes:**

- User không có quyền truy cập categories

**Handling:** Show error message, contact admin

---

### 500 Internal Server Error:

```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Causes:**

- Database connection failed
- Server crashed

**Handling:** Retry với exponential backoff, show error toast

---

## 🔄 Data Flow

### 1. Component Mount (ChatMainContainer):

```typescript
// ChatMainContainer.tsx
import { useCategories } from "@/hooks/queries/useCategories";

function ChatMainContainer() {
  const { data: categories, isLoading } = useCategories();

  // Extract conversations from selected category
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
  const categoryConversations = selectedCategory?.conversations ?? [];

  // Auto-select first conversation
  useEffect(() => {
    if (categoryConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(categoryConversations[0].conversationId);
    }
  }, [selectedCategoryId, categoryConversations]);

  return (
    <ChatHeader
      categoryConversations={categoryConversations}
      selectedConversationId={selectedConversationId}
      onChangeConversation={setSelectedConversationId}
    />
  );
}
```

### 2. Hook Implementation (useCategories):

```typescript
// hooks/queries/useCategories.ts
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/categories.api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
```

### 3. API Client:

```typescript
// api/categories.api.ts
import { apiClient } from "@/api/client";
import type { CategoryDto } from "@/types/categories";

export async function getCategories(): Promise<CategoryDto[]> {
  const response = await apiClient.get<CategoryDto[]>("/api/categories");
  return response.data;
}
```

---

## 🔍 Validation Rules

| Field              | Rule                                   | Error Message                    |
| ------------------ | -------------------------------------- | -------------------------------- |
| `id`               | Required, non-empty string             | "Category ID is required"        |
| `userId`           | Required, non-empty string             | "User ID is required"            |
| `name`             | Required, 1-100 characters             | "Category name is invalid"       |
| `order`            | Required, integer >= 0                 | "Order must be non-negative"     |
| `conversations`    | Required, array (có thể empty)         | "Conversations must be an array" |
| `conversationId`   | Required if in array, non-empty string | "Conversation ID is required"    |
| `conversationName` | Required if in array, 1-200 characters | "Conversation name is invalid"   |
| `createdAt`        | Required, ISO 8601 format              | "Invalid createdAt format"       |
| `updatedAt`        | Required, ISO 8601 format              | "Invalid updatedAt format"       |

### Client-Side Validation:

```typescript
function isValidCategory(category: unknown): category is CategoryDto {
  if (typeof category !== "object" || category === null) return false;

  const c = category as Partial<CategoryDto>;

  return (
    typeof c.id === "string" &&
    c.id.length > 0 &&
    typeof c.userId === "string" &&
    c.userId.length > 0 &&
    typeof c.name === "string" &&
    c.name.length > 0 &&
    c.name.length <= 100 &&
    typeof c.order === "number" &&
    c.order >= 0 &&
    Array.isArray(c.conversations) &&
    c.conversations.every(isValidConversationInfo) &&
    typeof c.createdAt === "string" &&
    typeof c.updatedAt === "string"
  );
}

function isValidConversationInfo(conv: unknown): conv is ConversationInfoDto {
  if (typeof conv !== "object" || conv === null) return false;

  const c = conv as Partial<ConversationInfoDto>;

  return (
    typeof c.conversationId === "string" &&
    c.conversationId.length > 0 &&
    typeof c.conversationName === "string" &&
    c.conversationName.length > 0 &&
    c.conversationName.length <= 200
  );
}
```

---

## 📊 Performance Considerations

### Caching Strategy:

| Aspect             | Value      | Reason                           |
| ------------------ | ---------- | -------------------------------- |
| **staleTime**      | 5 minutes  | Categories ít thay đổi           |
| **gcTime**         | 30 minutes | Keep in memory for tab switching |
| **refetchOnMount** | `false`    | Use cached data                  |
| **refetchOnFocus** | `true`     | Refresh khi user quay lại app    |

### Expected Response Size:

- Mỗi CategoryDto: ~200-500 bytes (depending on conversations count)
- 10 categories với 5 conversations/category: ~2-5 KB
- **Impact:** 🟢 MINIMAL - Very lightweight

### Network Optimization:

- ✅ Single API call loads ALL categories + conversations
- ✅ No need for separate `/api/categories/{id}/conversations` calls
- ✅ Reduced network requests by ~80% vs old approach

---

## 🧪 Test Scenarios

### Scenario 1: Normal Case - Multiple Categories

**Request:** `GET /api/categories`  
**Expected Response:** Array with 3+ categories, each có conversations[]  
**Assertion:**

- Status code = 200
- Array length > 0
- Each category có `id`, `name`, `conversations`
- conversations là array (có thể empty)

---

### Scenario 2: Empty Conversations

**Request:** `GET /api/categories`  
**Expected Response:**

```json
[
  {
    "id": "cat-empty",
    "userId": "user-123",
    "name": "Empty Category",
    "order": 1,
    "conversations": [],
    "createdAt": "2025-01-19T10:00:00Z",
    "updatedAt": "2025-01-19T10:00:00Z"
  }
]
```

**Assertion:**

- conversations = `[]` (not null, not undefined)
- UI không crash, không hiển thị tabs

---

### Scenario 3: Unauthorized

**Request:** `GET /api/categories` (no token)  
**Expected Response:** 401 error  
**Assertion:**

- Status code = 401
- Error message contains "Unauthorized"

---

### Scenario 4: Malformed Response (Error Handling)

**Mocked Response:**

```json
[
  {
    "id": "cat-bad",
    "name": "Bad Category"
    // Missing conversations field
  }
]
```

**Assertion:**

- Client validation fails
- Fallback to empty array
- Show error toast
- Log error to console

---

## 📁 Snapshot Requirements

### Snapshot File Structure:

```
docs/api/chat/categories/
├── contract.md              # This file
└── snapshots/
    └── v2/
        ├── README.md        # Capture instructions
        ├── success.json     # Normal case (multiple categories + conversations)
        ├── empty.json       # Category with no conversations
        ├── error-401.json   # Unauthorized error
        └── error-500.json   # Server error
```

### Required Snapshots:

| File             | Description                           | Priority  |
| ---------------- | ------------------------------------- | --------- |
| `success.json`   | Multiple categories với conversations | 🔴 HIGH   |
| `empty.json`     | Category có conversations = []        | 🟡 MEDIUM |
| `error-401.json` | Unauthorized error response           | 🟡 MEDIUM |
| `error-500.json` | Server error response                 | 🟢 LOW    |

### Capture Instructions:

**Step 1:** Login to dev environment

```bash
# Get access token
TOKEN=$(curl -X POST 'https://vega-chat-api-dev.allianceitsc.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.accessToken')
```

**Step 2:** Capture success case

```bash
curl -X GET 'https://vega-chat-api-dev.allianceitsc.com/api/categories' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/json' | jq '.' > success.json
```

**Step 3:** Capture 401 error

```bash
curl -X GET 'https://vega-chat-api-dev.allianceitsc.com/api/categories' \
  -H 'Accept: application/json' -w '\n%{http_code}' > error-401.json
```

**Step 4:** Manually create empty.json

Copy `success.json` và edit 1 category để `conversations: []`

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                | Lựa chọn                         | HUMAN Decision |
| --- | ------------------------------------- | -------------------------------- | -------------- |
| 1   | ConversationInfoDto có `unreadCount`? | Yes / No / Later                 | ⬜ **\_\_\_**  |
| 2   | ConversationInfoDto có `lastMessage`? | Yes / No / Later                 | ⬜ **\_\_\_**  |
| 3   | Cần snapshot cho dev environment?     | Yes / No / Use mock              | ⬜ **\_\_\_**  |
| 4   | Validation level?                     | Strict / Lenient                 | ⬜ **\_\_\_**  |
| 5   | Retry strategy cho 500 errors?        | 3 retries / 5 retries / No retry | ⬜ **\_\_\_**  |
| 6   | Cache stale time?                     | 5 min / 10 min / 30 min          | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review API endpoint spec       | ✅ Đã review |
| Đã review CategoryDto v2 schema   | ✅ Đã review |
| Đã review ConversationInfoDto     | ✅ Đã review |
| Đã review Error responses         | ✅ Đã review |
| Đã review Validation rules        | ✅ Đã review |
| Đã capture snapshots (hoặc skip)  | ✅ Skip      |
| Đã điền Pending Decisions (6 mục) | ✅ Đã điền   |
| **APPROVED để thực thi**          | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-19

**Contract Status:** ✅ READY

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code API client/hook nếu contract chưa ✅ READY**

---

## 🔗 References

- **Swagger API:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html
- **CategoryDto Schema:** See above TypeScript interface
- **Related Endpoint (deprecated):** `GET /api/categories/{id}/conversations` - No longer needed
- **Requirements:** See `01_requirements.md` FR-4
- **Type Definitions:** Will be in `src/types/categories.ts`
