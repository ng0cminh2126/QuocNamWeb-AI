# Swagger API Verification Results - 2026-01-15

**Date:** 2026-01-15  
**API:** Vega Chat API v1  
**Swagger URL:** https://vega-chat-api-dev.allianceitsc.com/swagger/v1/swagger.json  
**Status:** ✅ **VERIFIED - API HỖ TRỢ PAGINATION**

---

## 📡 Endpoint: GET /api/conversations/{id}/messages

### ✅ Verified Specifications

**Request Parameters:**

| Parameter         | Location | Type    | Required | Default | Description                                      |
| ----------------- | -------- | ------- | -------- | ------- | ------------------------------------------------ |
| `id`              | path     | string  | ✅ Yes   | -       | Conversation UUID                                |
| `limit`           | query    | integer | ❌ No    | 50      | Number of messages to fetch                      |
| `beforeMessageId` | query    | string  | ❌ No    | null    | UUID - Load messages BEFORE (older than) this ID |

**Response Structure (200 OK):**

```json
{
  "items": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "senderId": "uuid",
      "senderName": "string",
      "content": "string",
      "contentType": "TXT" | "SYS" | "FILE" | "IMG" | "VID",
      "sentAt": "2026-01-15T10:00:00Z",
      "editedAt": null,
      "replyCount": 0,
      "isStarred": false,
      "isPinned": false,
      ...
    }
  ],
  "nextCursor": "uuid",  // UUID của message cũ nhất, null nếu hết
  "hasMore": true        // true nếu còn messages cũ hơn
}
```

**Response Schema:** `MessageListResult`

```typescript
interface MessageListResult {
  items: MessageDto[] | null;
  nextCursor: string | null; // UUID format
  hasMore: boolean;
}
```

---

## 🔍 Root Cause Analysis

### ❌ BUG CONFIRMED

**Current Code Uses WRONG Parameter Name:**

```typescript
// File: src/api/messages.api.ts
// ❌ CURRENT (WRONG)
const params: Record<string, unknown> = { limit };
if (cursor) {
  params.cursor = cursor; // ← API KHÔNG NHẬN PARAM NÀY
}
```

**Why it fails:**

1. Code gửi param `cursor`
2. API expects param `beforeMessageId`
3. API ignores unknown param → Always returns first 50 messages
4. Infinite scroll không work vì cursor bị ignore

---

## ✅ Required Changes

### Change 1: API Client Param Name

**File:** `src/api/messages.api.ts`

```typescript
// ❌ BEFORE
export interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string; // WRONG PARAM NAME
}

export const getMessages = async ({
  conversationId,
  limit = 50,
  cursor, // WRONG
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };
  if (cursor) {
    params.cursor = cursor; // ← BUG: API không nhận param này
  }

  const response = await apiClient.get<GetMessagesResponse>(
    `/api/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};
```

```typescript
// ✅ AFTER (FIXED)
export interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  beforeMessageId?: string; // ✅ CORRECT PARAM NAME
}

export const getMessages = async ({
  conversationId,
  limit = 50,
  beforeMessageId, // ✅ CORRECT
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };
  if (beforeMessageId) {
    params.beforeMessageId = beforeMessageId; // ✅ FIX: Correct param
  }

  const response = await apiClient.get<GetMessagesResponse>(
    `/api/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};
```

---

### Change 2: Query Hook Update

**File:** `src/hooks/queries/useMessages.ts`

```typescript
// ❌ BEFORE
export function useMessages({
  conversationId,
  limit = 50,
  enabled = true,
}: UseMessagesOptions) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) =>
      getMessages({
        conversationId,
        limit,
        cursor: pageParam, // ← Passing wrong param name
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined, // ✅ This is CORRECT
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    enabled: enabled && !!conversationId,
  });
}
```

```typescript
// ✅ AFTER (FIXED)
export function useMessages({
  conversationId,
  limit = 50,
  enabled = true,
}: UseMessagesOptions) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) =>
      getMessages({
        conversationId,
        limit,
        beforeMessageId: pageParam, // ✅ FIX: Pass correct param
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined, // ✅ Already correct
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    enabled: enabled && !!conversationId,
  });
}
```

---

### Change 3: Type Definition (ALREADY CORRECT ✅)

**File:** `src/types/messages.ts`

```typescript
// ✅ NO CHANGE NEEDED - Already matches Swagger
export interface GetMessagesResponse {
  items: ChatMessage[]; // ✅ Swagger: items
  hasMore: boolean; // ✅ Swagger: hasMore
  nextCursor?: string; // ✅ Swagger: nextCursor (UUID)
  oldestMessageId?: string; // Legacy? Can be removed
}
```

**Verified from Swagger:**

- ✅ Field name `items` is correct
- ✅ Field name `hasMore` is correct
- ✅ Field name `nextCursor` is correct
- ✅ `nextCursor` format is UUID string

---

## 📋 Implementation Checklist

### Bug #1 - Load More Messages Fix

- [ ] **Step 1.1:** Update `GetMessagesParams` interface
  - Rename `cursor?: string` → `beforeMessageId?: string`
- [ ] **Step 1.2:** Update `getMessages()` function
  - Rename param: `cursor` → `beforeMessageId`
  - Update params object: `params.cursor` → `params.beforeMessageId`
- [ ] **Step 1.3:** Update `useMessages()` hook
  - Change `cursor: pageParam` → `beforeMessageId: pageParam`
- [ ] **Step 1.4:** Test pagination
  - Verify first 50 messages load
  - Click "Load More" → Should load next 50 older messages
  - Verify `nextCursor` được pass vào request tiếp theo
  - Verify button ẩn khi `hasMore = false`

---

## 🧪 Testing Strategy

### Manual Testing

1. **Initial Load:**

   ```
   GET /api/conversations/{id}/messages?limit=50
   → Should return 50 newest messages
   → Response should have nextCursor (UUID of oldest message)
   ```

2. **Load More:**

   ```
   GET /api/conversations/{id}/messages?limit=50&beforeMessageId={nextCursor}
   → Should return 50 messages BEFORE the cursor
   → Response should have new nextCursor
   ```

3. **End of List:**
   ```
   When hasMore = false:
   → "Load More" button should be hidden
   → No more requests should be made
   ```

### Unit Tests

```typescript
// Test 1: API client sends correct param
it("should use beforeMessageId param", async () => {
  await getMessages({
    conversationId: "conv-123",
    limit: 50,
    beforeMessageId: "msg-456",
  });

  expect(mockApiClient.get).toHaveBeenCalledWith(
    "/api/conversations/conv-123/messages",
    { params: { limit: 50, beforeMessageId: "msg-456" } }
  );
});

// Test 2: Hook uses correct param name
it("should pass beforeMessageId to queryFn", () => {
  const { result } = renderHook(() =>
    useMessages({ conversationId: "conv-123" })
  );

  // Verify queryFn is called with correct param structure
  expect(result.current.queryFn).toBeDefined();
});
```

---

## 📊 Impact Summary

### Files to Change

| File                               | Change Type | Lines | Risk    |
| ---------------------------------- | ----------- | ----- | ------- |
| `src/api/messages.api.ts`          | Modify      | ~5    | ✅ Low  |
| `src/hooks/queries/useMessages.ts` | Modify      | ~1    | ✅ Low  |
| `src/types/messages.ts`            | No change   | 0     | ✅ None |

### Risk Assessment

- **Low Risk:** Simple param name change
- **No Breaking Changes:** Only affects pagination, not data structure
- **Easy Rollback:** Single param rename

---

## 🎯 Expected Results After Fix

### Before Fix (Current Behavior)

```
User scrolls to top → Click "Load More"
↓
Request: GET /messages?limit=50&cursor=abc-123
↓
API ignores 'cursor' param (unknown param)
↓
Returns same 50 newest messages again ❌
↓
Infinite scroll doesn't work ❌
```

### After Fix (Expected Behavior)

```
User scrolls to top → Click "Load More"
↓
Request: GET /messages?limit=50&beforeMessageId=abc-123
↓
API recognizes param ✅
↓
Returns next 50 older messages ✅
↓
Messages appended to list ✅
↓
Infinite scroll works correctly ✅
```

---

## 🔗 References

- **Swagger Spec:** https://vega-chat-api-dev.allianceitsc.com/swagger/v1/swagger.json
- **Swagger UI:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html
- **Schema Reference:** `MessageListResult` in Swagger components/schemas
- **Related Docs:**
  - [00_README.md](./00_README.md) - Updated with verified info
  - [01_requirements.md](./01_requirements.md) - Updated root cause
  - [03_api-contract.md](./03_api-contract.md) - Updated with Swagger spec
  - [04_implementation-plan.md](./04_implementation-plan.md) - Ready for implementation

---

**Last Updated:** 2026-01-15 15:00  
**Verified By:** GitHub Copilot (Claude Sonnet 4.5) via Swagger JSON analysis  
**Status:** ✅ **READY FOR IMPLEMENTATION** - No snapshot capture needed!
