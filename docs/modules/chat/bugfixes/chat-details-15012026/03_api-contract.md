# [BƯỚC 3] API Contract - Chat Details Phase 7 Bugfixes

**Document:** API Contract & Snapshots  
**Created:** 2026-01-15  
**Status:** ⏳ PENDING HUMAN VERIFICATION  
**Version:** 1.0

---

## 📡 API Endpoint: GET /api/conversations/{id}/messages

### ✅ VERIFIED - Swagger Analysis Complete

**Swagger URL:** https://vega-chat-api-dev.allianceitsc.com/swagger/v1/swagger.json

**API HỖ TRỢ PAGINATION** với cơ chế:

- ✅ Request param: `beforeMessageId` (UUID, optional)
- ✅ Response có `nextCursor` (UUID, nullable)
- ✅ Response có `hasMore` (boolean)

### Overview

| Field             | Value                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| **Endpoint**      | `GET /api/conversations/{id}/messages`                                      |
| **Base URL**      | `https://vega-chat-api-dev.allianceitsc.com`                                |
| **Swagger**       | [Swagger UI](https://vega-chat-api-dev.allianceitsc.com/swagger/index.html) |
| **Auth Required** | ✅ Yes (Bearer token)                                                       |
| **Purpose**       | Fetch messages with cursor-based pagination (UUID)                          |
| **Pagination**    | ✅ CONFIRMED - Uses `beforeMessageId` param                                 |

---

## 🔍 Bug Analysis

### Current Implementation (\u274c WRONG)

```typescript
// File: src/api/messages.api.ts
export const getMessages = async ({
  conversationId,
  limit = 50,
  cursor, // \u274c WRONG PARAM NAME
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };
  if (cursor) {
    params.cursor = cursor; // \u274c API kh\u00f4ng nh\u1eadn param 'cursor'
  }

  const response = await apiClient.get<GetMessagesResponse>(
    `/api/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};
```

**\u274c ROOT CAUSE:**

- Code d\u00f9ng `cursor` param
- Nh\u01b0ng API th\u1ef1c t\u1ebf c\u1ea7n `beforeMessageId` param
- Khi g\u1ecdi API, param b\u1ecb ignore \u2192 Lu\u00f4n load l\u1ea1i 50 messages m\u1edbi nh\u1ea5t\n\n### Correct Implementation (\u2705 SHOULD BE)

````typescript
// File: src/api/messages.api.ts
export const getMessages = async ({
  conversationId,
  limit = 50,
  beforeMessageId,  // \u2705 CORRECT PARAM NAME
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };\n  if (beforeMessageId) {\n    params.beforeMessageId = beforeMessageId; // \u2705 API nh\u1eadn param n\u00e0y\n  }\n\n  const response = await apiClient.get<GetMessagesResponse>(\n    `/api/conversations/${conversationId}/messages`,\n    { params }\n  );\n  return response.data;\n};\n```

### Current Type Definition (\u2705 CORRECT)

```typescript
// File: src/types/messages.ts
export interface GetMessagesResponse {
  items: ChatMessage[];    // \u2705 CORRECT - Swagger c\u00f3 field 'items'\n  hasMore: boolean;        // \u2705 CORRECT - Swagger c\u00f3 field 'hasMore'\n  nextCursor?: string;     // \u2705 CORRECT - Swagger c\u00f3 field 'nextCursor' (UUID)\n  oldestMessageId?: string; // \u26a0\ufe0f Legacy field? C\u00f3 th\u1ec3 remove\n}\n```\n\n**\u2705 Type definition C\u00d3 TH\u1ec2 \u0110\u00c1NG - Swagger confirms:**\n- Field `items` \u2705\n- Field `hasMore` \u2705\n- Field `nextCursor` \u2705 (format: UUID string | null)

---

## 📥 Request Specification

### Path Parameters

| Parameter | Type          | Required | Description     |
| --------- | ------------- (\u2705 VERIFIED FROM SWAGGER)

### Path Parameters

| Parameter | Type          | Required | Description     |\n| --------- | ------------- | -------- | --------------- |\n| `id`      | string (UUID) | \u2705 Yes   | Conversation ID |\n\n### Query Parameters\n\n| Parameter          | Type    | Required | Default | Description                                      |\n| ------------------ | ------- | -------- | ------- | ------------------------------------------------ |\n| `limit`            | integer | \u274c No    | 50      | Number of messages to fetch                      |\n| `beforeMessageId`  | string  | \u274c No    | null    | UUID - Load messages BEFORE (older than) this ID |\n\n**\u2705 CONFIRMED FROM SWAGGER:**\n\n- \u2705 Param name l\u00e0 `beforeMessageId` (KH\u00d4NG ph\u1ea3i `cursor`, `before`, `after`)\n- \u2705 Format l\u00e0 UUID string (UUID v4)\n- \u2705 Semantic: Load messages C\u0168 H\u01a0N message c\u00f3 ID n\u00e0y (backwards pagination)\n- \u2705 Default limit = 50
### Success Response (200 OK)

**⚠️ NEED ACTUAL SNAPSHOT - Below is HYPOTHESIS:**

```typescript
interface GetMessagesResponse {
  items: ChatMessage[]; // Array of messages
  hasMore: boolean; // ⚠️ Or hasNext? hasPrevious?
  nextCursor?: string | null; // ⚠️ Or cursor? previousCursor?
  totalCount?: number; // Optional: Total messages in conversation
}

interface ChatMessage {
  id: string; (\u2705 VERIFIED FROM SWAGGER)

### Success Response (200 OK)

**From Swagger Schema: `MessageListResult`**

```typescript
interface GetMessagesResponse {\n  items: MessageDto[] | null;  // Array of messages (nullable)\n  nextCursor: string | null;   // UUID c\u1ee7a message c\u0169 nh\u1ea5t (null n\u1ebfu h\u1ebft)\n  hasMore: boolean;            // True n\u1ebfu c\u00f2n messages c\u0169 h\u01a1n\n}\n\ninterface MessageDto {\n  id: string;                     // UUID\n  conversationId: string;         // UUID\n  senderId: string;               // UUID\n  senderName: string | null;\n  senderIdentifier: string | null;\n  senderFullName: string | null;\n  senderRoles: string | null;\n  parentMessageId: string | null; // UUID (for thread replies)\n  content: string | null;\n  contentType: MessageContentType; // \"TXT\" | \"SYS\" | \"FILE\" | \"IMG\" | \"VID\"\n  sentAt: string;                 // ISO 8601 datetime\n  editedAt: string | null;\n  linkedTaskId: string | null;    // UUID\n  reactions: ReactionDto[] | null;\n  attachments: AttachmentDto[] | null;\n  replyCount: number;\n  isStarred: boolean;\n  isPinned: boolean;\n  threadPreview: MessageDto | null;\n  parentMessagePreview: MessageParentPreviewDto | null;\n  mentions: MessageMentionSummaryDto[] | null;\n}\n\ntype MessageContentType = \"TXT\" | \"SYS\" | \"FILE\" | \"IMG\" | \"VID\";\n```\n\n**\u2705 CONFIRMED FROM SWAGGER:**\n\n- \u2705 Response field l\u00e0 `items` (KH\u00d4NG ph\u1ea3i `data` hay `messages`)\n- \u2705 Pagination field l\u00e0 `nextCursor` (UUID string, nullable)\n- \u2705 Has more field l\u00e0 `hasMore` (boolean)\n- \u2705 `nextCursor` l\u00e0 UUID c\u1ee7a message c\u0169 nh\u1ea5t trong response → D\u00f9ng cho request ti\u1ebfp theo  | Invalid conversationId or params |
| 401    | Unauthorized          | Missing or invalid auth token    |
| 404    | Not Found             | Conversation not found           |
| 500    | Internal Server Error | Server error                     |

---

## 🔗 Snapshots Required

**⚠️ HUMAN ACTION REQUIRED:**

HUMAN cần capture actual API responses và save vào:

````

docs/api/chat/messages/
├── contract.md # This file
└── snapshots/v1/
├── README.md # How to capture
├── success-page1.json # First page (no cursor)
├── success-page2.json # Second page (with cursor)
├── success-last-page.json # Last page (hasMore = false)
└── error-401.json # Unauthorized error

````

### How to Capture Snapshots

**Using curl:**

```bash
# Get environment variables
$BASE_URL = "https://vega-chat-api-dev.allianceitsc.com"
$TOKEN = "your_access_token_here"
$CONVERSATION_ID = "your_conversation_guid_here"

# Page 1 (no cursor)
curl -X GET "$BASE_URL/api/conversations/$CONVERSATION_ID/messages?limit=50" `
  -H "Authorization: Bearer $TOKEN" `
  -o docs/api/chat/messages/snapshots/v1/success-page1.json

# Page 2 (with cursor from page 1 response)
$CURSOR = "cursor_value_from_page1_response"
curl -X GET "$BASE_URL/api/conversations/$CONVERSATION_ID/messages?limit=50&cursor=$CURSOR" `
  -H "Authorization: Bearer $TOKEN" `
  -o docs/api/chat/messages/snapshots/v1/success-page2.json
````

**Using Swagger UI:**

1. Go to https://vega-chat-api-dev.allianceitsc.com/swagger/index.html
2. Authorize with Bearer token
3. Find `GET /api/conversations/{id}/messages`
4. Execute with a conversationId that has 100+ messages
5. Copy response JSON
6. Paste into `success-page1.json`
7. Get `nextCursor` value from response
8. Execute again with cursor param
9. Paste into `success-page2.json`

---

## 📋 Implementation Checklist

### Phase 1: Verify API Contract

- [ ] HUMAN capture snapshot: `success-page1.json` (first page, no cursor)
- [ ] HUMAN capture snapshot: `success-page2.json` (second page, with cursor)
- [ ] HUMAN capture snapshot: `success-last-page.json` (hasMore = false)
- [ ] AI verify field names in snapshots
- [ ] AI update TypeScript types if needed

### Phase 2: Fix API Client

- [ ] Update `getMessages()` param name if wrong
- [ ] Update `GetMessagesResponse` type
- [ ] Add error handling

### Phase 3: Fix Query Hook

- [ ] Fix `getNextPageParam` logic
- [ ] Verify `initialPageParam`
- [ ] Add better error handling

---

## ⚠️ Critical Questions for HUMAN

| #   | Question                                                                                       | Answer               |
| --- | ---------------------------------------------------------------------------------------------- | -------------------- |
| 1   | What is the exact query param name? `cursor`, `before`, `after`, or something else?            | ⬜ **\_\_\_**        |
| 2   | What is the exact response field for "has more messages"? `hasMore`, `hasNext`, `hasPrevious`? | ⬜ **\_\_\_**        |
| 3   | What is the exact response field for next cursor? `nextCursor`, `cursor`, `previousCursor`?    | ⬜ **\_\_\_**        |
| 4   | Does cursor represent "load messages BEFORE this point" (going backward in time)?              | ⬜ **Yes/No**        |
| 5   | What is cursor format? (messageId GUID? timestamp? opaque string?)                             | ⬜ **\_\_\_**        |
| 6   | Are messages returned newest-first or oldest-first?                                            | ⬜ **Newest/Oldest** |

---

## 🔗 Related Documentation

- [Swagger API](https://vega-chat-api-dev.allianceitsc.com/swagger/index.html)
- [Existing API Implementation](../../../../api/chat/)
- [Message Types](../../../../src/types/messages.ts)

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                              | Status           |
| ------------------------------------- | ---------------- |
| Đã capture API snapshots              | ⬜ Chưa capture  |
| Đã verify field names từ Swagger      | ⬜ Chưa verify   |
| Đã trả lời Critical Questions         | ⬜ Chưa trả lời  |
| **Contract READY for implementation** | ⬜ **NOT READY** |

**HUMAN Signature:** [_________________]  
**Date:** [_________________]

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu contract status ≠ ✅ READY**
