# [BƯỚC 4] Implementation Plan - Chat UX Improvements (Phase 6)

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6 - Error Handling & Persistence  
> **Document Type:** Implementation Plan  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Overview

Implementation plan cho Phase 6, bao gồm error handling, retry mechanisms, và conversation persistence. Tập trung vào SỬA ĐỔI logic existing code, không tạo components mới.

---

## 🗂️ Implementation Structure

### Files to Modify

```
src/
├── hooks/
│   └── mutations/
│       ├── useSendMessage.ts         ✏️ MODIFY - Thêm retry logic
│       └── useUploadFile.ts          ✏️ MODIFY - Thêm retry + error states
├── features/portal/components/chat/
│   ├── ChatMainContainer.tsx         ✏️ MODIFY - Integrate error UI
│   ├── FileAttachmentList.tsx        ✏️ MODIFY - Show errors, delete always visible
│   └── MessageBubbleSimple.tsx       ✏️ MODIFY - Show status indicators
├── utils/
│   ├── storage.ts                    ✏️ MODIFY/CREATE - LocalStorage helpers
│   └── errorHandling.ts              🆕 CREATE - Error classification & messages
└── stores/
    └── chatStore.ts                  ✏️ MODIFY - Add draft & failed message state
```

### Files to Create

```
src/
├── utils/
│   ├── errorHandling.ts              🆕 Error utilities
│   └── retryLogic.ts                 🆕 Retry strategies
└── types/
    └── errorTypes.ts                 🆕 Error type definitions
```

---

## 📝 Implementation Details

### Phase 1: Error Handling Utilities (Foundation)

**File:** `src/utils/errorHandling.ts` 🆕

**Purpose:** Classify errors và generate user-friendly messages

```typescript
/**
 * Error classification utilities for Phase 6
 */

export type ErrorType =
  | "NETWORK_OFFLINE"
  | "NETWORK_TIMEOUT"
  | "SERVER_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "UNKNOWN";

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  isRetryable: boolean;
  statusCode?: number;
}

/**
 * Classify axios error or general error
 */
export function classifyError(error: unknown): ClassifiedError {
  // Check network offline
  if (!navigator.onLine) {
    return {
      type: "NETWORK_OFFLINE",
      message: "Không có kết nối mạng. Vui lòng kiểm tra kết nối.",
      isRetryable: true,
    };
  }

  // Check axios error
  if (axios.isAxiosError(error)) {
    // Network error (no response)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return {
          type: "NETWORK_TIMEOUT",
          message: "Kết nối quá lâu. Vui lòng thử lại.",
          isRetryable: true,
        };
      }
      return {
        type: "NETWORK_OFFLINE",
        message: "Không thể kết nối đến máy chủ.",
        isRetryable: true,
      };
    }

    // HTTP status errors
    const status = error.response.status;

    if (status === 401) {
      return {
        type: "UNAUTHORIZED",
        message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        isRetryable: false,
        statusCode: status,
      };
    }

    if (status === 400) {
      return {
        type: "BAD_REQUEST",
        message:
          error.response.data?.message || "Định dạng file không được hỗ trợ",
        isRetryable: false,
        statusCode: status,
      };
    }

    if (status === 413) {
      return {
        type: "FILE_TOO_LARGE",
        message: "File quá lớn. Vui lòng chọn file nhỏ hơn 20MB.",
        isRetryable: false,
        statusCode: status,
      };
    }

    if (status === 415) {
      return {
        type: "UNSUPPORTED_FILE_TYPE",
        message: "Định dạng file không được hỗ trợ",
        isRetryable: false,
        statusCode: status,
      };
    }

    if (status >= 500) {
      return {
        type: "SERVER_ERROR",
        message: "Lỗi máy chủ. Vui lòng thử lại sau.",
        isRetryable: true,
        statusCode: status,
      };
    }
  }

  // Unknown error
  return {
    type: "UNKNOWN",
    message: "Đã xảy ra lỗi. Vui lòng thử lại.",
    isRetryable: true,
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const classified = classifyError(error);
  return classified.isRetryable;
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-1"

---

### Phase 2: Retry Logic Utilities

**File:** `src/utils/retryLogic.ts` 🆕

**Purpose:** Exponential backoff retry strategies

```typescript
/**
 * Retry logic utilities with exponential backoff
 */

export interface RetryConfig {
  maxRetries: number;
  delays: number[]; // [1000, 2000, 4000] for exponential backoff
  shouldRetry: (error: unknown) => boolean;
}

export const MESSAGE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [1000, 2000, 4000],
  shouldRetry: isRetryableError,
};

export const FILE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [500, 1000, 2000],
  shouldRetry: isRetryableError,
};

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  currentRetry: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Check if should retry
    if (currentRetry >= config.maxRetries || !config.shouldRetry(error)) {
      throw error;
    }

    // Wait before retry
    const delay =
      config.delays[currentRetry] || config.delays[config.delays.length - 1];
    await sleep(delay);

    // Retry
    return retryWithBackoff(fn, config, currentRetry + 1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-2"

---

### Phase 3: LocalStorage Helpers

**File:** `src/utils/storage.ts` (MODIFY or CREATE)

**Purpose:** Helpers for drafts, failed messages, scroll positions

```typescript
/**
 * LocalStorage helpers for Phase 6
 */

// ============================================
// DRAFT MESSAGES
// ============================================

export interface DraftMessage {
  conversationId: string;
  content: string;
  attachedFiles: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
  }>;
  lastModified: number;
}

const DRAFTS_KEY = "chat-drafts";

export function saveDraft(draft: DraftMessage): void {
  const drafts = getAllDrafts();
  drafts[draft.conversationId] = draft;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function getDraft(conversationId: string): DraftMessage | null {
  const drafts = getAllDrafts();
  return drafts[conversationId] || null;
}

export function deleteDraft(conversationId: string): void {
  const drafts = getAllDrafts();
  delete drafts[conversationId];
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function getAllDrafts(): Record<string, DraftMessage> {
  const json = localStorage.getItem(DRAFTS_KEY);
  return json ? JSON.parse(json) : {};
}

// ============================================
// FAILED MESSAGES QUEUE
// ============================================

export interface FailedMessage {
  id: string; // Client-generated temporary ID
  content: string;
  attachedFileIds: string[];
  workspaceId: string;
  conversationId: string;
  retryCount: number;
  lastError: string;
  timestamp: number;
}

const FAILED_MESSAGES_KEY = "failed-messages";
const MAX_FAILED_MESSAGES = 50;

export function addFailedMessage(message: FailedMessage): void {
  let queue = getFailedMessages();

  // Add to queue
  queue.push(message);

  // Keep only latest 50 messages
  if (queue.length > MAX_FAILED_MESSAGES) {
    queue = queue.slice(-MAX_FAILED_MESSAGES);
  }

  localStorage.setItem(FAILED_MESSAGES_KEY, JSON.stringify(queue));
}

export function getFailedMessages(conversationId?: string): FailedMessage[] {
  const json = localStorage.getItem(FAILED_MESSAGES_KEY);
  const queue: FailedMessage[] = json ? JSON.parse(json) : [];

  if (conversationId) {
    return queue.filter((msg) => msg.conversationId === conversationId);
  }

  return queue;
}

export function removeFailedMessage(id: string): void {
  const queue = getFailedMessages();
  const updated = queue.filter((msg) => msg.id !== id);
  localStorage.setItem(FAILED_MESSAGES_KEY, JSON.stringify(updated));
}

export function incrementRetryCount(id: string): void {
  const queue = getFailedMessages();
  const message = queue.find((msg) => msg.id === id);

  if (message) {
    message.retryCount += 1;
    localStorage.setItem(FAILED_MESSAGES_KEY, JSON.stringify(queue));
  }
}

// ============================================
// SELECTED CONVERSATION PERSISTENCE
// ============================================

const SELECTED_CONVERSATION_KEY = "selected-conversation-id";

export function saveSelectedConversation(conversationId: string): void {
  localStorage.setItem(SELECTED_CONVERSATION_KEY, conversationId);
}

export function getSelectedConversation(): string | null {
  return localStorage.getItem(SELECTED_CONVERSATION_KEY);
}

export function clearSelectedConversation(): void {
  localStorage.removeItem(SELECTED_CONVERSATION_KEY);
}

// ============================================
// SCROLL POSITIONS
// ============================================

export interface ScrollPosition {
  conversationId: string;
  scrollTop: number;
  scrollHeight: number;
  timestamp: number;
}

const SCROLL_POSITIONS_KEY = "chat-scroll-positions";
const SCROLL_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export function saveScrollPosition(position: ScrollPosition): void {
  const positions = getAllScrollPositions();
  positions[position.conversationId] = position;

  // Clean expired positions
  const now = Date.now();
  Object.keys(positions).forEach((id) => {
    if (now - positions[id].timestamp > SCROLL_EXPIRE_TIME) {
      delete positions[id];
    }
  });

  localStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
}

export function getScrollPosition(
  conversationId: string
): ScrollPosition | null {
  const positions = getAllScrollPositions();
  const position = positions[conversationId];

  if (!position) return null;

  // Check expiration
  if (Date.now() - position.timestamp > SCROLL_EXPIRE_TIME) {
    delete positions[conversationId];
    localStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
    return null;
  }

  return position;
}

function getAllScrollPositions(): Record<string, ScrollPosition> {
  const json = localStorage.getItem(SCROLL_POSITIONS_KEY);
  return json ? JSON.parse(json) : {};
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-3"

---

### Phase 4: Modify Message Send Hook (with Retry)

**File:** `src/hooks/mutations/useSendMessage.ts` ✏️

**Changes:**

1. Wrap API call với `retryWithBackoff`
2. Track retry count
3. Save to failed queue nếu all retries fail
4. Return error classification

**Implementation:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api/messages.api";
import { messagesKeys } from "@/hooks/queries/useMessages";
import { retryWithBackoff, MESSAGE_RETRY_CONFIG } from "@/utils/retryLogic";
import { classifyError } from "@/utils/errorHandling";
import { addFailedMessage } from "@/utils/storage";
import { v4 as uuidv4 } from "uuid";

export function useSendMessage(workspaceId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessageRequest) => {
      // Retry with exponential backoff
      return retryWithBackoff(
        () => sendMessage(workspaceId, conversationId, payload),
        MESSAGE_RETRY_CONFIG
      );
    },

    onError: (error, variables) => {
      // Classify error
      const classified = classifyError(error);

      // If not retryable or max retries exceeded, save to failed queue
      if (!classified.isRetryable) {
        const failedMessage: FailedMessage = {
          id: uuidv4(),
          content: variables.content,
          attachedFileIds: variables.fileIds || [],
          workspaceId,
          conversationId,
          retryCount: MESSAGE_RETRY_CONFIG.maxRetries,
          lastError: classified.message,
          timestamp: Date.now(),
        };

        addFailedMessage(failedMessage);
      }

      // Show toast notification
      toast.error(classified.message);
    },

    onSuccess: () => {
      // Invalidate messages cache
      queryClient.invalidateQueries({
        queryKey: messagesKeys.list(workspaceId, conversationId),
      });

      // Clear draft
      deleteDraft(conversationId);
    },
  });
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-4"

---

### Phase 5: Modify File Upload Hook (with Retry)

**File:** `src/hooks/mutations/useUploadFile.ts` ✏️

**Changes:**

1. Wrap upload với `retryWithBackoff`
2. Client-side validation TRƯỚC upload
3. Return detailed error states
4. Track upload progress (optional)

**Implementation:**

```typescript
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/api/files.api";
import { retryWithBackoff, FILE_RETRY_CONFIG } from "@/utils/retryLogic";
import { classifyError } from "@/utils/errorHandling";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // ... more types
];

interface UploadFileOptions {
  file: File;
  onProgress?: (progress: number) => void;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, onProgress }: UploadFileOptions) => {
      // Client-side validation
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("FILE_TOO_LARGE");
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("UNSUPPORTED_FILE_TYPE");
      }

      // Upload with retry
      return retryWithBackoff(
        () => uploadFile(file, onProgress),
        FILE_RETRY_CONFIG
      );
    },

    onError: (error) => {
      const classified = classifyError(error);
      toast.error(classified.message);
    },
  });
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-5"

---

### Phase 6: Update ChatMainContainer (Conversation Persistence)

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx` ✏️

**Changes:**

1. Restore selected conversation from localStorage on mount
2. Save selected conversation on change
3. Handle empty state khi no conversation
4. Auto-select latest conversation nếu first visit

**Implementation:**

```typescript
export default function ChatMainContainer() {
  const { conversations } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Restore selected conversation on mount
  useEffect(() => {
    const saved = getSelectedConversation();

    if (saved && conversations?.some((c) => c.id === saved)) {
      // Restore saved conversation
      setSelectedId(saved);
    } else if (conversations && conversations.length > 0) {
      // First visit: Select latest conversation
      const latest = conversations[0]; // Assuming sorted by latest
      setSelectedId(latest.id);
      saveSelectedConversation(latest.id);
    }
  }, [conversations]);

  // Save on selection change
  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    saveSelectedConversation(id);
  };

  // Empty state
  if (!conversations || conversations.length === 0) {
    return <EmptyState message="Chưa có cuộc trò chuyện" />;
  }

  if (!selectedId) {
    return <EmptyState message="Chọn cuộc trò chuyện để bắt đầu" />;
  }

  return (
    <div className="flex h-full">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelectConversation}
      />
      <ChatMessages conversationId={selectedId} />
    </div>
  );
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-6"

---

### Phase 7: Update MessageBubbleSimple (Status Indicators)

**File:** `src/features/portal/components/chat/MessageBubbleSimple.tsx` ✏️

**Changes:**

1. Show sending spinner
2. Show sent checkmark
3. Show failed error icon + retry button
4. Different styles for failed state

**Implementation:**

```typescript
interface MessageBubbleSimpleProps {
  message: Message;
  status?: "sending" | "sent" | "failed";
  error?: string;
  onRetry?: () => void;
  onDelete?: () => void;
}

export default function MessageBubbleSimple({
  message,
  status = "sent",
  error,
  onRetry,
  onDelete,
}: MessageBubbleSimpleProps) {
  return (
    <div
      className={cn(
        "message-bubble",
        status === "failed" && "opacity-70 border border-red-200"
      )}
    >
      <div className="message-content">{message.content}</div>

      {/* Status indicators */}
      <div className="flex items-center gap-2 mt-1">
        {status === "sending" && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}

        {status === "sent" && <Check className="w-4 h-4 text-gray-400" />}

        {status === "failed" && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">
              {error || "Gửi thất bại"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              data-testid="message-retry-button"
            >
              Gửi lại
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              data-testid="message-delete-button"
            >
              Xoá
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-7"

---

### Phase 8: Update FileAttachmentList (Error States & Delete Button)

**File:** `src/features/portal/components/chat/FileAttachmentList.tsx` ✏️

**Changes:**

1. Show inline errors per file
2. Delete button ALWAYS visible (not just on hover)
3. Retry button for failed uploads
4. Different visual states: uploading, success, error

**Implementation:**

```typescript
interface FileAttachment {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
  uploadedFileId?: string;
}

export default function FileAttachmentList({
  files,
  onRetry,
  onDelete,
}: FileAttachmentListProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {files.map((fileAttachment) => (
        <div
          key={fileAttachment.id}
          className={cn(
            "relative border rounded-lg p-2",
            fileAttachment.status === "error" && "border-red-300 bg-red-50"
          )}
        >
          {/* File preview */}
          <FilePreview file={fileAttachment.file} />

          {/* Delete button - ALWAYS visible */}
          <button
            onClick={() => onDelete(fileAttachment.id)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            data-testid={`file-delete-button-${fileAttachment.id}`}
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Status indicators */}
          {fileAttachment.status === "uploading" && (
            <div className="mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {fileAttachment.progress && (
                <div className="w-full bg-gray-200 rounded h-1 mt-1">
                  <div
                    className="bg-blue-500 h-1 rounded"
                    style={{ width: `${fileAttachment.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {fileAttachment.status === "success" && (
            <CheckCircle className="w-4 h-4 text-green-500 mt-2" />
          )}

          {fileAttachment.status === "error" && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">
                  {fileAttachment.error || "Upload thất bại"}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(fileAttachment.id)}
                className="w-full"
                data-testid={`file-retry-button-${fileAttachment.id}`}
              >
                Thử lại
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Tests needed:** ✅ See 06_testing.md section "Test-Group-8"

---

## 📊 Implementation Checklist

### Foundation (Phase 1-3)

- [ ] Create `src/utils/errorHandling.ts` với `classifyError()`
- [ ] Create `src/utils/retryLogic.ts` với `retryWithBackoff()`
- [ ] Modify/Create `src/utils/storage.ts` với draft & failed message helpers
- [ ] Create `src/types/errorTypes.ts` với type definitions
- [ ] Write tests cho error utilities
- [ ] Write tests cho retry logic
- [ ] Write tests cho storage helpers

### Hooks (Phase 4-5)

- [ ] Modify `useSendMessage.ts` với retry logic
- [ ] Modify `useUploadFile.ts` với client-side validation + retry
- [ ] Thêm error classification vào hooks
- [ ] Write tests cho useSendMessage retry scenarios
- [ ] Write tests cho useUploadFile validation + retry

### UI Components (Phase 6-8)

- [ ] Modify `ChatMainContainer.tsx` với conversation persistence
- [ ] Modify `MessageBubbleSimple.tsx` với status indicators
- [ ] Modify `FileAttachmentList.tsx` với error states + always-visible delete
- [ ] Thêm empty state component (hoặc reuse existing)
- [ ] Write tests cho conversation persistence
- [ ] Write tests cho message status indicators
- [ ] Write tests cho file error UI

### Integration & Testing

- [ ] Integration test: File upload → error → retry → success
- [ ] Integration test: Message send → error → retry → success
- [ ] Integration test: Conversation persistence across page reload
- [ ] E2E test: Full flow với network errors (Playwright)
- [ ] E2E test: Draft message persistence
- [ ] Manual QA: Toast notifications
- [ ] Manual QA: Error messages user-friendly

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

- `src/utils/errorHandling.ts` - Error classification & user-friendly messages
- `src/utils/retryLogic.ts` - Exponential backoff retry strategies
- `src/types/errorTypes.ts` - Type definitions cho errors
- `src/utils/errorHandling.test.ts` - Unit tests
- `src/utils/retryLogic.test.ts` - Unit tests
- `src/utils/storage.test.ts` - Unit tests

### Files sẽ sửa đổi:

- `src/hooks/mutations/useSendMessage.ts` - Thêm retry logic với retryWithBackoff
- `src/hooks/mutations/useUploadFile.ts` - Thêm client-side validation + retry
- `src/features/portal/components/chat/ChatMainContainer.tsx` - Conversation persistence từ localStorage
- `src/features/portal/components/chat/MessageBubbleSimple.tsx` - Status indicators (sending/sent/failed)
- `src/features/portal/components/chat/FileAttachmentList.tsx` - Error states + always-visible delete button
- `src/utils/storage.ts` - Thêm helpers cho drafts, failed messages, scroll positions

### Files sẽ xoá:

- KHÔNG có

### Dependencies sẽ thêm:

- `uuid` - Generate temporary IDs cho failed messages (nếu chưa có)

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                              | Lựa chọn                                | HUMAN Decision    |
| --- | ----------------------------------- | --------------------------------------- | ----------------- |
| 1   | Max retry count cho messages        | 3, 5, or unlimited?                     | ✅ **3**          |
| 2   | Max retry count cho file uploads    | 3, 5, or unlimited?                     | ✅ **3**          |
| 3   | Exponential backoff delays          | [1s,2s,4s] or [500ms,1s,2s]?            | ✅ **[1s,2s,4s]** |
| 4   | LocalStorage max failed messages    | 50, 100, or 200?                        | ✅ **50**         |
| 5   | Draft auto-save debounce            | 300ms, 500ms, or 1000ms?                | ✅ **500ms**      |
| 6   | Scroll position expire time         | 1 hour, 24 hours, or 7 days?            | ✅ **24 hours**   |
| 7   | File upload timeout                 | 30s, 60s, or 120s?                      | ✅ **60s**        |
| 8   | Delete file confirmation dialog?    | Yes or No?                              | ✅ **No**         |
| 9   | Network status indicator (banner)?  | Show or Don't show?                     | ✅ **Don't show** |
| 10  | Package `uuid` đã có trong project? | Yes (skip install) or No (need install) | ✅ **Yes**        |

> ✅ **Tất cả quyết định đã được HUMAN xác nhận**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                      | Status       |
| ----------------------------- | ------------ |
| Đã review Implementation Plan | ✅ Đã review |
| Đã review Impact Summary      | ✅ Đã review |
| Đã review file modifications  | ✅ Đã review |
| Đã điền Pending Decisions     | ✅ Đã điền   |
| **APPROVED để thực thi**      | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-13

> ✅ **APPROVED: AI được phép thực thi code**
