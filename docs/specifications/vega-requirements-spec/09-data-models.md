# 9. Data Models

## 9.1 Core Domain Models

### 9.1.1 ChatMessage

Primary message model used throughout the application.

```typescript
interface ChatMessage {
  // Identifiers
  id: string;                          // UUID - Message ID
  conversationId: string;              // UUID - Parent conversation/group
  senderId: string;                    // UUID - Message sender

  // Sender Information
  senderName: string;                  // Username
  senderIdentifier: string | null;     // Email or username
  senderFullName: string | null;       // Display name
  senderRoles: string | null;          // Comma-separated roles (e.g., "Staff,Leader")

  // Message Content
  content: string | null;              // Message text (nullable if attachments-only)
  contentType: ChatMessageContentType; // "TXT", "IMG", "FILE", "TASK", "SYS", "VID"

  // Metadata
  sentAt: string;                      // ISO 8601 datetime (UTC)
  editedAt: string | null;             // ISO 8601 if edited, else null

  // Relationships
  parentMessageId: string | null;      // UUID if replying to another message
  linkedTaskId: string | null;         // UUID if linked to task

  // Attachments
  attachments: AttachmentDto[];        // Array of file attachments

  // Interactions
  reactions: ChatMessageReaction[];    // Array of reactions (future feature)
  replyCount: number;                  // Number of replies (threads)
  mentions: string[];                  // Array of mentioned user IDs

  // Flags
  isStarred: boolean;                  // User-specific starred status
  isPinned: boolean;                   // Group-wide pinned status

  // Future/Reserved
  threadPreview: unknown | null;       // Thread preview data

  // Client-side only (not from API)
  sendStatus?: "sending" | "retrying" | "failed" | "sent";
  retryCount?: number;
  failReason?: string;
}
```

**Kotlin Mapping (Android):**
```kotlin
data class ChatMessage(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val senderName: String,
    val senderIdentifier: String?,
    val senderFullName: String?,
    val senderRoles: String?,
    val content: String?,
    val contentType: ChatMessageContentType,
    val sentAt: String,
    val editedAt: String?,
    val parentMessageId: String?,
    val linkedTaskId: String?,
    val attachments: List<AttachmentDto>,
    val reactions: List<ChatMessageReaction>,
    val replyCount: Int,
    val mentions: List<String>,
    val isStarred: Boolean,
    val isPinned: Boolean,
    val threadPreview: Any?,

    // Client-side
    @Transient var sendStatus: SendStatus? = null,
    @Transient var retryCount: Int = 0,
    @Transient var failReason: String? = null
)

enum class SendStatus {
    SENDING, RETRYING, FAILED, SENT
}
```

**Swift Mapping (iOS):**
```swift
struct ChatMessage: Codable {
    let id: String
    let conversationId: String
    let senderId: String
    let senderName: String
    let senderIdentifier: String?
    let senderFullName: String?
    let senderRoles: String?
    let content: String?
    let contentType: ChatMessageContentType
    let sentAt: String
    let editedAt: String?
    let parentMessageId: String?
    let linkedTaskId: String?
    let attachments: [AttachmentDto]
    let reactions: [ChatMessageReaction]
    let replyCount: Int
    let mentions: [String]
    let isStarred: Bool
    let isPinned: Bool
    let threadPreview: Any?

    // Client-side
    var sendStatus: SendStatus?
    var retryCount: Int = 0
    var failReason: String?
}

enum SendStatus: String, Codable {
    case sending, retrying, failed, sent
}
```

---

### 9.1.2 AttachmentDto

File attachment data from API response.

```typescript
interface AttachmentDto {
  id: string;           // UUID - Database attachment ID
  fileId: string;       // UUID - File storage ID (use for fetching)
  fileName: string | null;
  fileSize: number;     // Bytes (int64)
  contentType: string | null;  // MIME type (e.g., "application/pdf")
  createdAt: string;    // ISO 8601 datetime
}
```

**Usage:**
- `fileId` is used to fetch thumbnails/previews: `/api/Files/{fileId}/preview`
- `contentType` determines icon/preview behavior

---

### 9.1.3 AttachmentInputDto

Used when sending messages with attachments.

```typescript
interface AttachmentInputDto {
  fileId: string;       // UUID from file upload response
  fileName: string | null;
  fileSize: number;     // Bytes
  contentType: string | null;
}
```

**Flow:**
1. Upload file → Receive `fileId`
2. Create `AttachmentInputDto` with `fileId`
3. Send message with `attachments` array

---

### 9.1.4 Conversation

Represents a group chat or direct message.

```typescript
interface Conversation {
  id: string;               // UUID
  name: string;             // Group name or DM participant name
  type: ConversationType;   // "Group" or "DirectMessage"

  // Last Message Info
  lastMessage: {
    content: string;
    sentAt: string;
    senderName: string;
  } | null;

  // Metadata
  unreadCount: number;      // Number of unread messages
  memberCount: number;      // Total members
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601

  // User-specific
  isMuted: boolean;         // Notifications muted
  isPinned: boolean;        // Pinned in conversation list
}

type ConversationType = "Group" | "DirectMessage";
```

---

### 9.1.5 TaskDetailResponse

Complete task information.

```typescript
interface TaskDetailResponse {
  // Identifiers
  id: string;               // UUID
  conversationId: string;   // UUID
  messageId: string | null; // UUID if linked to message

  // Task Info
  title: string;
  description: string | null;
  status: TaskStatus;       // "todo", "doing", "need_to_verified", "finished"
  priority: TaskPriority;   // "low", "normal", "high", "urgent"

  // Dates
  dueDate: string | null;   // ISO 8601
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;

  // People
  assignTo: {
    id: string;
    name: string;
    fullName: string | null;
  } | null;

  assignFrom: {
    id: string;
    name: string;
    fullName: string | null;
  };

  // Work Classification
  workType: {
    id: string;
    name: string;
  } | null;

  // Checklist
  checkList: CheckListItemDto[];

  // Progress
  checkListProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

type TaskStatus = "todo" | "doing" | "need_to_verified" | "finished";
type TaskPriority = "low" | "normal" | "high" | "urgent";
```

---

### 9.1.6 CheckListItemDto

Individual checklist item within a task.

```typescript
interface CheckListItemDto {
  id: string;               // UUID
  taskId: string;           // UUID
  content: string;          // Item text
  isCompleted: boolean;
  order: number;            // Display order (1-based)
  completedAt: string | null;
  completedBy: {
    id: string;
    name: string;
  } | null;
}
```

---

### 9.1.7 MemberDto

Group member information.

```typescript
interface MemberDto {
  userId: string;           // UUID
  userName: string;         // Username
  role: MemberRole;         // "MBR", "ADM", "OWN"
  joinedAt: string;         // ISO 8601
  isMuted: boolean;

  userInfo: UserInfoDto;    // Extended user details
}

type MemberRole = "MBR" | "ADM" | "OWN";

interface UserInfoDto {
  id: string;
  userName: string;
  fullName: string;
  identifier: string;       // Email or username
  roles: string;            // Comma-separated system roles
  email?: string;
  avatarUrl?: string | null;
}
```

**Role Hierarchy:**
- **OWN (Owner):** Full control, can promote/demote
- **ADM (Admin):** Can manage members, cannot promote
- **MBR (Member):** Regular member

---

## 9.2 Authentication Models

### 9.2.1 LoginRequest

```typescript
interface LoginRequest {
  identifier: string;   // Username (no validation)
  password: string;
}
```

### 9.2.2 LoginResponse

```typescript
interface LoginResponse {
  requiresMfa: boolean;       // Always false (MFA not implemented)
  mfaToken: string | null;    // Always null
  mfaMethod: string | null;   // Always null
  accessToken: string;        // JWT token
  user: LoginApiUser;
}

interface LoginApiUser {
  id: string;           // UUID
  identifier: string;   // Username
  roles: string[];      // Array of role names
}
```

---

## 9.3 File Models

### 9.3.1 UploadFileResult

Response from single file upload.

```typescript
interface UploadFileResult {
  fileId: string;           // UUID - Use this for attachments
  fileName: string;
  fileSize: number;         // Bytes
  contentType: string;      // MIME type
  uploadedAt: string;       // ISO 8601
}
```

### 9.3.2 BatchUploadResult

Response from batch file upload.

```typescript
interface BatchUploadResult {
  allSuccess: boolean;      // True if all files uploaded
  partialSuccess: boolean;  // True if some failed
  totalFiles: number;
  successCount: number;
  failedCount: number;

  results: FileUploadResult[];
}

interface FileUploadResult {
  success: boolean;
  fileId: string | null;
  fileName: string;
  error: string | null;
}
```

---

## 9.4 SignalR Event Models

### 9.4.1 NewMessageEvent

Broadcasted when message sent.

```typescript
interface NewMessageEvent {
  conversationId: string;
  message: ChatMessage;     // Complete message object
}
```

### 9.4.2 UserTypingEvent

Broadcasted when user types.

```typescript
interface UserTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
```

### 9.4.3 MessageReadEvent

Broadcasted when message marked read.

```typescript
interface MessageReadEvent {
  conversationId: string;
  messageId: string;
  userId: string;
  readAt: string;           // ISO 8601
}
```

---

## 9.5 Request Models

### 9.5.1 SendChatMessageRequest

Request body for sending message.

```typescript
interface SendChatMessageRequest {
  conversationId: string;           // Required
  content: string | null;           // Required if no attachments
  messageType?: ChatMessageContentType;  // Optional, defaults to "TXT"
  parentMessageId?: string | null;  // For replies
  mentions?: MentionInputDto[] | null;
  attachments?: AttachmentInputDto[] | null;
}

interface MentionInputDto {
  userId: string;           // UUID
  startIndex: number;       // Character index in content
  length: number;           // Length of mention text
  mentionText: string | null;
}
```

### 9.5.2 CreateTaskRequest

Request body for creating task.

```typescript
interface CreateTaskRequest {
  title: string;                    // Required, max 200 chars
  description?: string | null;
  priority?: TaskPriority;          // Defaults to "normal"
  assignTo?: string | null;         // User UUID
  dueDate?: string | null;          // ISO 8601
  conversationId?: string | null;   // Link to conversation
  messageId?: string | null;        // Link to message
  workTypeId?: string | null;       // Work type UUID
  checklistTemplateId?: string | null;
}
```

---

## 9.6 Enum Types

### 9.6.1 ChatMessageContentType

```typescript
type ChatMessageContentType =
  | "TXT"   // Text message
  | "IMG"   // Image
  | "FILE"  // File attachment
  | "TASK"  // Task reference (system-generated)
  | "SYS"   // System message (member joined, etc.)
  | "VID";  // Video (future)
```

### 9.6.2 TaskStatus

```typescript
type TaskStatus =
  | "todo"              // Not started
  | "doing"             // In progress
  | "need_to_verified"  // Needs review
  | "finished";         // Completed
```

### 9.6.3 TaskPriority

```typescript
type TaskPriority =
  | "low"       // Low priority
  | "normal"    // Normal priority (default)
  | "high"      // High priority
  | "urgent";   // Urgent
```

### 9.6.4 MemberRole

```typescript
type MemberRole =
  | "MBR"   // Regular member
  | "ADM"   // Admin
  | "OWN";  // Owner
```

### 9.6.5 SourceModule

```typescript
enum SourceModule {
  Task = 0,
  Chat = 1,
  Company = 2,
  User = 3
}
```

---

## 9.7 Pagination Models

### 9.7.1 GetMessagesResponse

```typescript
interface GetMessagesResponse {
  items: ChatMessage[];
  nextCursor: string | null;  // UUID of last message
  hasMore: boolean;
}
```

**Usage:**
- First load: No cursor, returns newest 50 messages
- Load more: Pass `nextCursor` as `beforeMessageId`

### 9.7.2 GetGroupsResponse

```typescript
interface GetGroupsResponse {
  items: Conversation[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

---

## 9.8 Common Types

### 9.8.1 Timestamps

```typescript
interface Timestamps {
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

### 9.8.2 ID Type

```typescript
type ID = string;  // Always UUID v4
```

### 9.8.3 ISO 8601 Datetime Format

All timestamps use ISO 8601 with timezone (UTC):

```
2026-01-26T10:30:00Z
2026-01-26T10:30:00.123Z  (with milliseconds)
```

**Parsing:**
- JavaScript: `new Date("2026-01-26T10:30:00Z")`
- Kotlin: `Instant.parse("2026-01-26T10:30:00Z")`
- Swift: `ISO8601DateFormatter().date(from: "2026-01-26T10:30:00Z")`

---

## 9.9 Validation Rules

### Message Content

| Field | Min | Max | Required | Validation |
|-------|-----|-----|----------|------------|
| `content` | 0 | 5000 | Conditional | Required if no attachments |
| `attachments` | 0 | 10 | No | Valid fileIds required |

### Task Fields

| Field | Min | Max | Required | Validation |
|-------|-----|-----|----------|------------|
| `title` | 1 | 200 | Yes | Non-empty string |
| `description` | 0 | 2000 | No | - |
| `assignTo` | - | - | No | Must be valid user UUID |
| `dueDate` | - | - | No | Must be future date |

### File Upload

| Constraint | Value |
|------------|-------|
| Max file size | 10 MB (10,485,760 bytes) |
| Max batch size | 50 MB total |
| Max files per batch | 10 |
| Min files per batch | 2 |
| Allowed types | Images, PDF, Excel, Word, Text |

---

## 9.10 Mobile Mapping Guide

### Android (Kotlin)

**Date/Time:**
```kotlin
import java.time.Instant

val sentAt = Instant.parse(message.sentAt)
```

**Enums:**
```kotlin
enum class ChatMessageContentType {
    TXT, IMG, FILE, TASK, SYS, VID
}
```

**Nullability:**
- TypeScript `string | null` → Kotlin `String?`
- TypeScript `string[]` → Kotlin `List<String>`

### iOS (Swift)

**Date/Time:**
```swift
let formatter = ISO8601DateFormatter()
let sentAt = formatter.date(from: message.sentAt)
```

**Enums:**
```swift
enum ChatMessageContentType: String, Codable {
    case TXT, IMG, FILE, TASK, SYS, VID
}
```

**Optionals:**
- TypeScript `string | null` → Swift `String?`
- TypeScript `string[]` → Swift `[String]`

---

## Next Section

Continue to: [10. Test Scenarios (QC)](./10-test-scenarios.md)
