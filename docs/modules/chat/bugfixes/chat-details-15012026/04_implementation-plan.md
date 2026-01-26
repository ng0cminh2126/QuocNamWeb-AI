# [BƯỚC 4] Implementation Plan - Chat Details Phase 7 Bugfixes

**Document:** Implementation Plan  
**Created:** 2026-01-15  
**Status:** ✅ APPROVED  
**Version:** 1.0

---

## 🎯 Implementation Overview

Sửa 2 bugs độc lập:

1. **Load More Messages** - Fix API integration và infinite query
2. **File Upload Limit** - Fix validation logic và UI state

Estimated effort: **4-6 hours**

---

## 🔧 Bug #1: Load More Messages

### 🔍 Root Cause (After API Verification)

**Scenario 1: API param/field names sai**

- Code dùng `cursor` nhưng API cần `before` hoặc `after`
- Code expect `hasMore` nhưng API trả `hasNext`
- Code expect `nextCursor` nhưng API trả `cursor`

**Scenario 2: getNextPageParam logic sai**

- Không extract đúng cursor từ response
- Return undefined khi còn messages

**Fix Strategy:** Verify từ snapshot, update code match với API

---

### 📝 Implementation Steps

#### Step 1.1: Update API Client (nếu cần)

**File:** `src/api/messages.api.ts`

```typescript
// BEFORE (if wrong)
const params: Record<string, unknown> = { limit };
if (cursor) {
  params.cursor = cursor; // ❌ Wrong param name
}

// AFTER (example - depends on API snapshot)
const params: Record<string, unknown> = { limit };
if (cursor) {
  params.before = cursor; // ✅ Correct param name (example)
}
```

**Changes:**

- [ ] Update query param name to match Swagger
- [ ] Add JSDoc comment documenting cursor behavior
- [ ] Add error logging for debugging

---

#### Step 1.2: Update Response Type

**File:** `src/types/messages.ts`

```typescript
// BEFORE (if wrong)
export interface GetMessagesResponse {
  items: ChatMessage[];
  hasMore: boolean; // ❌ Wrong field name
  nextCursor?: string; // ❌ Wrong field name
}

// AFTER (example - depends on API snapshot)
export interface GetMessagesResponse {
  items: ChatMessage[];
  hasNext: boolean; // ✅ Correct field name (example)
  cursor?: string; // ✅ Correct field name (example)
}
```

**Changes:**

- [ ] Update field names to match API response
- [ ] Add JSDoc comments
- [ ] Keep backward compatibility (if possible)

---

#### Step 1.3: Fix Query Hook

**File:** `src/hooks/queries/useMessages.ts`

```typescript
// BEFORE (potentially wrong)
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
        cursor: pageParam, // ⚠️ May need to change param name
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined, // ❌ Wrong fields
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    enabled: enabled && !!conversationId,
  });
}

// AFTER (example - depends on API snapshot)
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
        cursor: pageParam, // ✅ Updated if needed
      }),
    getNextPageParam: (lastPage) => {
      // ✅ Fixed logic with correct field names
      console.log("[useMessages] getNextPageParam:", {
        hasNext: lastPage.hasNext,
        cursor: lastPage.cursor,
      });
      return lastPage.hasNext ? lastPage.cursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    enabled: enabled && !!conversationId,
  });
}
```

**Changes:**

- [ ] Update `getNextPageParam` to use correct field names
- [ ] Add console.log for debugging
- [ ] Add error handling
- [ ] Verify `flattenMessages()` still works

---

#### Step 1.4: Update handleLoadMore with Scroll Position Preservation

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

```typescript
// UPDATED implementation with scroll position preservation
const handleLoadMore = async () => {
  if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
    // Save scroll position BEFORE loading more messages
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollHeightBefore = container.scrollHeight;
    const scrollTopBefore = container.scrollTop;

    // Fetch next page
    await messagesQuery.fetchNextPage();

    // Restore scroll position AFTER new messages are added
    setTimeout(() => {
      if (container) {
        const scrollHeightAfter = container.scrollHeight;
        const addedHeight = scrollHeightAfter - scrollHeightBefore;

        // Adjust scroll position to maintain user's view
        container.scrollTop = scrollTopBefore + addedHeight;
      }
    }, 0);
  }
};

// UI remains the same
{
  messagesQuery.hasNextPage && (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLoadMore}
      disabled={messagesQuery.isFetchingNextPage}
      data-testid="load-more-button"
    >
      {messagesQuery.isFetchingNextPage
        ? "Đang tải..."
        : "Tải thêm tin nhắn cũ"}
    </Button>
  );
}
```

**Changes:**

- [ ] Make handleLoadMore async
- [ ] Save scrollHeight and scrollTop BEFORE fetchNextPage
- [ ] Calculate addedHeight after fetch completes
- [ ] Restore scroll position = old position + added height
- [ ] Use setTimeout to wait for DOM update

---

### 🆕 NEW FEATURE: Auto-load to Starred/Pinned Message

#### Step 1.5: Update Auto-Scroll Logic (Prevent Scroll on Load More)

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

```typescript
// BEFORE: Auto-scroll on ANY messages.length change
useEffect(() => {
  if (messagesQuery.isSuccess && messages.length > 0) {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 200);
  }
}, [conversationId, messagesQuery.isSuccess, messages.length]); // ❌ Scrolls even on load more

// AFTER: Auto-scroll ONLY on conversation change
const prevConversationIdForScrollRef = useRef<string | undefined>(undefined);
useEffect(() => {
  const isNewConversation =
    conversationId !== prevConversationIdForScrollRef.current;

  if (isNewConversation && messagesQuery.isSuccess && messages.length > 0) {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 200);
    prevConversationIdForScrollRef.current = conversationId;
  } else if (
    !prevConversationIdForScrollRef.current &&
    messagesQuery.isSuccess &&
    messages.length > 0
  ) {
    // Initial load (first conversation)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 200);
    prevConversationIdForScrollRef.current = conversationId;
  }
}, [conversationId, messagesQuery.isSuccess, messages.length]);
```

**Changes:**

- [ ] Add prevConversationIdForScrollRef to track conversation changes
- [ ] Only scroll to bottom when conversation ID changes
- [ ] Keep scroll position when messages.length increases (load more)
- [ ] Real-time messages still scroll via onNewMessage callback

---

#### Step 1.6: Add Scroll-to-Message Utility

**File:** `src/utils/messageHelpers.ts` (NEW)

```typescript
/**
 * Scroll to a specific message and highlight it
 */
export function scrollToMessage(
  messageId: string,
  options?: {
    behavior?: ScrollBehavior;
    highlightDuration?: number;
  }
) {
  const element = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!element) return false;

  element.scrollIntoView({
    behavior: options?.behavior ?? "smooth",
    block: "center",
  });

  // Add highlight animation
  element.classList.add("message-highlight");
  setTimeout(() => {
    element.classList.remove("message-highlight");
  }, options?.highlightDuration ?? 2000);

  return true;
}
```

**CSS for highlight:**

```css
/* src/features/portal/components/chat/ChatMain.module.css */
.message-highlight {
  animation: messageFlash 2s ease-in-out;
}

@keyframes messageFlash {
  0%,
  100% {
    background-color: transparent;
  }
  10%,
  30% {
    background-color: rgba(59, 130, 246, 0.1);
  }
}
```

---

#### Step 1.6: Add Auto-load Hook

**File:** `src/hooks/useScrollToMessage.ts` (NEW)

```typescript
import { useCallback, useState } from 'react';
import { scrollToMessage } from '@/utils/messageHelpers';

interface UseScrollToMessageOptions {
  conversationId: string;
  messagesQuery: UseInfiniteQueryResult<...>;
}

export function useScrollToMessage({
  conversationId,
  messagesQuery,
}: UseScrollToMessageOptions) {
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);

  const scrollToMessageById = useCallback(
    async (messageId: string) => {
      // Step 1: Check if message already loaded
      const allMessages = messagesQuery.data?.pages.flatMap(p => p.items) ?? [];
      const messageExists = allMessages.some(m => m.id === messageId);

      if (messageExists) {
        // Message đã có → Scroll trực tiếp
        const scrolled = scrollToMessage(messageId);
        if (scrolled) {
          toast.success('Đã tìm thấy tin nhắn');
          return;
        }
      }

      // Step 2: Message chưa load → Auto-load
      setIsAutoLoading(true);
      setTargetMessageId(messageId);
      toast.info('Đang tìm tin nhắn...', { duration: Infinity });

      try {
        // Load messages cho đến khi tìm thấy
        while (messagesQuery.hasNextPage) {
          await messagesQuery.fetchNextPage();

          // Check lại sau mỗi lần load
          const updatedMessages = messagesQuery.data?.pages.flatMap(p => p.items) ?? [];
          if (updatedMessages.some(m => m.id === messageId)) {
            // Tìm thấy!
            setTimeout(() => {
              const scrolled = scrollToMessage(messageId);
              toast.dismiss();
              if (scrolled) {
                toast.success('Đã tìm thấy tin nhắn');
              }
            }, 300); // Wait for DOM update
            break;
          }
        }

        // Đã load hết mà không thấy
        if (!messagesQuery.hasNextPage) {
          toast.dismiss();
          toast.error('Không tìm thấy tin nhắn');
        }
      } catch (error) {
        toast.dismiss();
        toast.error('Lỗi khi tải tin nhắn');
        console.error('[useScrollToMessage] Error:', error);
      } finally {
        setIsAutoLoading(false);
        setTargetMessageId(null);
      }
    },
    [messagesQuery]
  );

  return {
    scrollToMessageById,
    isAutoLoading,
    targetMessageId,
  };
}
```

---

#### Step 1.7: Integrate with ChatMainContainer

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

```typescript
import { useScrollToMessage } from "@/hooks/useScrollToMessage";

export default function ChatMainContainer({ conversationId }: Props) {
  const messagesQuery = useMessages({ conversationId });

  // NEW: Auto-scroll hook
  const { scrollToMessageById, isAutoLoading } = useScrollToMessage({
    conversationId,
    messagesQuery,
  });

  // Handle click from starred/pinned list
  useEffect(() => {
    // Listen to events from starred/pinned components
    const handleScrollRequest = (event: CustomEvent<{ messageId: string }>) => {
      scrollToMessageById(event.detail.messageId);
    };

    window.addEventListener(
      "scrollToMessage",
      handleScrollRequest as EventListener
    );
    return () => {
      window.removeEventListener(
        "scrollToMessage",
        handleScrollRequest as EventListener
      );
    };
  }, [scrollToMessageById]);

  return (
    <div>
      {/* Loading overlay khi auto-loading */}
      {isAutoLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <Loader2 className="animate-spin" />
            <p className="mt-2">Đang tìm tin nhắn...</p>
          </div>
        </div>
      )}
      {/* Existing message list */}
      ...
    </div>
  );
}
```

---

#### Step 1.8: Update Starred/Pinned Components

**File:** `src/features/portal/components/chat/StarredMessagesList.tsx`

```typescript
function StarredMessageItem({ message }: Props) {
  const handleClick = () => {
    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("scrollToMessage", {
        detail: { messageId: message.id },
      })
    );
  };

  return (
    <button onClick={handleClick} data-testid="starred-message-item">
      {/* Message preview */}
    </button>
  );
}
```

**Similar changes for:**

- `PinnedMessageBadge.tsx`
- Any other components that need to jump to messages

---

## 🔧 Bug #2: File Upload Limit

### 🔍 Root Cause

1. **Hardcoded max files = 10** trong `validateBatchFileSelection()`
2. **DEFAULT_FILE_RULES.maxFiles = 5** trong validation
3. **Double validation** với 2 constants khác nhau
4. **Không disable input** khi đủ 5 file

### 📝 Implementation Steps

#### Step 2.1: Add Constant

**File:** `src/types/files.ts`

```typescript
// ADD: Single source of truth
/**
 * Maximum number of files that can be attached to a single message
 * Applies to both images and other file types combined
 * API limit: 10 files, 100MB total
 */
export const MAX_FILES_PER_MESSAGE = 10;

// UPDATE: Use constant
export const DEFAULT_FILE_RULES: FileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB per file
  maxFiles: MAX_FILES_PER_MESSAGE, // ✅ 10 files (API limit)
  allowedTypes: [
    // ... existing types
  ],
};
```

**Changes:**

- [ ] Add `MAX_FILES_PER_MESSAGE` constant
- [ ] Update `DEFAULT_FILE_RULES.maxFiles`
- [ ] Add JSDoc comment
- [ ] Export constant for use in components

---

#### Step 2.2: Update Validation Helper

**File:** `src/utils/fileHelpers.ts`

```typescript
// UPDATE: Better error messages
export function validateBatchFileSelection(
  files: File[],
  maxFiles: number = BATCH_UPLOAD_LIMITS.MAX_FILES,
  maxSizePerFile: number = BATCH_UPLOAD_LIMITS.MAX_SIZE_PER_FILE,
  maxTotalSize: number = BATCH_UPLOAD_LIMITS.MAX_TOTAL_SIZE
): BatchValidationError | undefined {
  // Check empty batch
  if (!files || files.length === 0) {
    return {
      type: "empty-batch",
      message: "Vui lòng chọn ít nhất 1 file để upload",
    };
  }

  // Check max files
  if (files.length > maxFiles) {
    return {
      type: "too-many-files",
      message: `Chỉ được chọn tối đa ${maxFiles} file cùng lúc. Bạn đã chọn ${files.length} file.`,
    };
  }

  // ... rest of validation
}
```

**Changes:**

- [ ] Keep existing logic (it's correct)
- [ ] No changes needed (will pass correct maxFiles from component)

---

#### Step 2.3: Update Component Logic

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

```typescript
// ADD: Import constant
import { MAX_FILES_PER_MESSAGE } from "@/types/files";

// ADD: Computed values for both count and size
const totalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0);
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
const remainingSize = MAX_TOTAL_SIZE - totalSize;

const isFileLimitReached =
  selectedFiles.length >= MAX_FILES_PER_MESSAGE ||
  remainingSize < 1024; // Less than 1KB space left

// UPDATE: handleFileSelect with better validation
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);
  const currentCount = selectedFiles.length;
  const remainingSlots = MAX_FILES_PER_MESSAGE - currentCount;

  // ✅ STEP 1: Check total size FIRST (highest priority)
  const currentTotalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const newFilesSize = fileArray.reduce((sum, f) => sum + f.size, 0);
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
  const remainingSize = MAX_TOTAL_SIZE - currentTotalSize;

  if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
    toast.error(
      remainingSize <= 0
        ? "Đã đạt giới hạn 100MB. Vui lòng xóa file cũ để chọn file mới."
        : `Tổng dung lượng vượt quá 100MB. Còn trống ${formatFileSize(remainingSize)}.`
    );
    e.target.value = "";
    return;
  }

  // ✅ STEP 2: Check if already at file count limit
  if (remainingSlots === 0) {
    toast.error(
      `Đã đủ ${MAX_FILES_PER_MESSAGE} file. Vui lòng xóa file cũ để chọn file mới.`
    );
    e.target.value = "";
    return;
  }

  // ✅ If selecting more than remaining, take only what fits (PARTIAL ACCEPT)
  let filesToAdd = fileArray;
  if (fileArray.length > remainingSlots) {
    filesToAdd = fileArray.slice(0, remainingSlots);
    const discardedCount = fileArray.length - remainingSlots;
    toast.warning(
      remainingSlots === MAX_FILES_PER_MESSAGE
        ? `Chỉ chọn được ${MAX_FILES_PER_MESSAGE} file. Đã tự động bỏ ${discardedCount} file.`
        : `Đã có ${currentCount} file. Chỉ chọn thêm được ${remainingSlots} file nữa.`
    );
  }

  // ✅ Then validate batch (size, type) for files to add
  const validationError = validateBatchFileSelection(
    filesToAdd, // Validate only files we're actually adding
    MAX_FILES_PER_MESSAGE, // 10 files (API limit)
    10 * 1024 * 1024, // 10MB per file
    100 * 1024 * 1024 // 100MB total (API limit)
  );

  if (validationError) {
    toast.error(validationError.message);
    e.target.value = "";
    return;
  }

  // Add validated files
  const newFiles = filesToAdd.map(fileToSelectedFile);
  setSelectedFiles((prev) => [...prev, ...newFiles]);

  // Show success toast only if no warning was shown
  if (filesToAdd.length === fileArray.length) {
    toast.success(`Đã thêm ${newFiles.length} file`);
  }

  // Auto-focus input
  setTimeout(() => {
    inputRef.current?.focus();
  }, 0);

  e.target.value = "";
};

// UPDATE: Disable file inputs when limit reached
<Button
  variant="ghost"
  size="icon"
  onClick={() => fileInputRef.current?.click()}
  disabled={sendMessageMutation.isPending || isFileLimitReached} // ✅ Add limit check
  className="shrink-0 hover:bg-gray-100"
  aria-label="Đính kèm file"
  data-testid="file-upload-button"
>
  <Paperclip className="h-5 w-5 text-gray-600" />
</Button>

<Button
  variant="ghost"
  size="icon"
  onClick={() => imageInputRef.current?.click()}
  disabled={sendMessageMutation.isPending || isFileLimitReached} // ✅ Add limit check
  className="shrink-0 hover:bg-gray-100"
  aria-label="Đính kèm hình ảnh"
  data-testid="image-upload-button"
>
  <ImageIcon className="h-5 w-5 text-gray-600" />
</Button>

<input
  ref={fileInputRef}
  type="file"
  className="hidden"
  onChange={handleFileSelect}
  disabled={isFileLimitReached} // ✅ Disable input element
  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
  multiple
  data-testid="file-input"
/>

<input
  ref={imageInputRef}
  type="file"
  className="hidden"
  onChange={handleFileSelect}
  disabled={isFileLimitReached} // ✅ Disable input element
  accept={FILE_CATEGORIES.IMAGE.join(",")}
  multiple
  data-testid="image-input"
/>
```

**Changes:**

- [ ] Add `MAX_FILES_PER_MESSAGE` import
- [ ] Add `isFileLimitReached` computed value
- [ ] Improve `handleFileSelect` validation logic
- [ ] Disable buttons when limit reached
- [ ] Disable input elements when limit reached
- [ ] Better error messages with context
- [ ] Add success toast

---

## 📋 Testing Strategy

### Manual Testing Checklist

#### Bug #1 - Load More:

- [ ] Open conversation with 100+ messages
- [ ] Verify "Tải thêm" button shows at top
- [ ] Click "Tải thêm" → Load older messages
- [ ] **Verify scroll position EXACTLY maintained** - user sees same messages
- [ ] Measure scroll position before/after - should preserve visual position
- [ ] Click "Tải thêm" multiple times - scroll should stay stable each time
- [ ] Click until hasNextPage = false
- [ ] Verify button disappears
- [ ] Switch to different conversation → Should scroll to bottom
- [ ] Come back to original conversation → Should scroll to bottom (new conversation)
- [ ] Real-time message arrives → Should scroll to bottom

#### Bug #2 - Upload Limit:

- [ ] Select 5 files at once → Success
- [ ] Select 6 files at once → Rejected with toast
- [ ] Select 3 files, then 2 files → Success (total 5)
- [ ] Try to select more → Buttons disabled
- [ ] Remove 1 file → Buttons enabled
- [ ] Select 1 more → Success (total 5 again)
- [ ] Verify both Paperclip and Image buttons disabled

---

## 📊 IMPACT SUMMARY

### Files sẽ sửa đổi:

#### Bug #1 (Load More):

1. `src/api/messages.api.ts` - Fix param/field names
2. `src/hooks/queries/useMessages.ts` - Fix getNextPageParam
3. `src/types/messages.ts` - Update GetMessagesResponse type (if needed)

#### Bug #2 (Upload Limit):

1. `src/types/files.ts` - Add MAX_FILES_PER_MESSAGE constant
2. `src/features/portal/components/chat/ChatMainContainer.tsx` - Fix validation & UI
3. Import changes only (no logic changes needed):
   - `src/utils/fileHelpers.ts`
   - `src/utils/fileValidation.ts`

### Files KHÔNG sửa đổi:

- `src/hooks/useFileValidation.ts` - Keeps using DEFAULT_FILE_RULES
- `src/components/*` - No UI component changes
- API backend - No API changes needed

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                     | Lựa chọn                              | HUMAN Decision             |
| --- | -------------------------- | ------------------------------------- | -------------------------- |
| 1   | API snapshot captured?     | Need actual response                  | ✅ **Captured**            |
| 2   | Param name verified?       | cursor, before, after?                | ✅ **beforeMessageId**     |
| 3   | Response fields verified?  | hasMore/hasNext, nextCursor/cursor?   | ✅ **hasMore, nextCursor** |
| 4   | File limit confirm 5?      | 5 files max (image + file combined)   | ✅ **10 files (API)**      |
| 5   | Disable input behavior OK? | User cannot open picker when at limit | ✅ **OK**                  |

> ✅ **All decisions filled by HUMAN**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                        | Status          |
| ------------------------------- | --------------- |
| Đã review Implementation Plan   | ✅ Đã review    |
| Đã verify API contract (BƯỚC 3) | ✅ Đã verify    |
| Đã điền Pending Decisions       | ✅ Đã điền      |
| **APPROVED để code**            | ✅ **APPROVED** |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-16

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu "APPROVED để code" = ⬜**
