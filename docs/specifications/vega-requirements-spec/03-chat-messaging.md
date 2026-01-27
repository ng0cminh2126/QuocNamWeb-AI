# 3. Chat & Messaging Features

## 3.1 Overview

The Chat & Messaging system enables real-time text, image, and file communication between users in group conversations.

### Core Capabilities

- Send text messages
- Send images and files
- Reply to specific messages
- Edit and delete messages
- Pin important messages
- Star messages for personal reference
- View typing indicators
- Group messages by date

---

## 3.2 Message Types

### 3.2.1 Content Types

| Type | Code | Description | Use Case |
|------|------|-------------|----------|
| Text | `TXT` | Plain text message | Normal conversation |
| Image | `IMG` | Image file | Photos, screenshots |
| File | `FILE` | Any file attachment | Documents, PDFs, Excel |
| Task | `TASK` | Task reference message | System-generated when task linked |
| System | `SYS` | System notification | Member joined/left, etc. |
| Video | `VID` | Video file | (Future feature) |

### 3.2.2 Message Structure

**TypeScript Interface:**
```typescript
interface ChatMessage {
  id: string;                          // UUID
  conversationId: string;              // Group/DM UUID
  senderId: string;                    // User UUID
  senderName: string;                  // Display name
  senderIdentifier: string | null;     // Username/email
  senderFullName: string | null;       // Full name
  senderRoles: string | null;          // Comma-separated roles
  parentMessageId: string | null;      // UUID if replying
  content: string | null;              // Message text
  contentType: ChatMessageContentType; // TXT, IMG, FILE, etc.
  sentAt: string;                      // ISO 8601 datetime
  editedAt: string | null;             // ISO 8601 if edited
  linkedTaskId: string | null;         // UUID if task linked
  reactions: ChatMessageReaction[];    // (Future feature)
  attachments: AttachmentDto[];        // File attachments
  replyCount: number;                  // Number of replies
  isStarred: boolean;                  // User-specific starred status
  isPinned: boolean;                   // Group-wide pinned status
  threadPreview: unknown | null;       // (Future feature)
  mentions: string[];                  // User IDs mentioned

  // Client-side only
  sendStatus?: "sending" | "retrying" | "failed" | "sent";
  retryCount?: number;
  failReason?: string;
}
```

---

## 3.3 Send Message

### 3.3.1 API Endpoint

**POST** `/api/messages`

**Request Body:**
```typescript
{
  conversationId: string;           // Required - Group/DM UUID
  content: string | null;           // Required if no attachments
  messageType?: "TXT" | "IMG" | "FILE" | "TASK" | "SYS";
  parentMessageId?: string | null;  // For replies
  mentions?: MentionInputDto[] | null;
  attachments?: AttachmentInputDto[] | null;
}
```

**Example Request:**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello team, please review the attached document.",
  "messageType": "TXT",
  "attachments": [
    {
      "fileId": "660e8400-e29b-41d4-a716-446655440111",
      "fileName": "report.pdf",
      "fileSize": 1048576,
      "contentType": "application/pdf"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "senderId": "880e8400-e29b-41d4-a716-446655440333",
  "senderName": "john_doe",
  "content": "Hello team, please review the attached document.",
  "contentType": "TXT",
  "sentAt": "2026-01-26T10:30:00Z",
  "attachments": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440444",
      "fileId": "660e8400-e29b-41d4-a716-446655440111",
      "fileName": "report.pdf",
      "fileSize": 1048576,
      "contentType": "application/pdf",
      "createdAt": "2026-01-26T10:30:00Z"
    }
  ],
  "isStarred": false,
  "isPinned": false
}
```

### 3.3.2 Business Rules

**Message Content:**
- Content can be null IF attachments are provided
- Content max length: 5000 characters (configurable)
- Empty/whitespace-only content is rejected

**Message Type:**
- Defaults to `TXT` if not specified
- Automatically set based on attachments:
  - Has image attachment → `IMG`
  - Has non-image attachment → `FILE`

**Attachments:**
- Maximum 10 attachments per message
- Files must be uploaded first (see File Management)
- Attachments are immutable after message sent

**Replies:**
- `parentMessageId` must exist in same conversation
- Cannot reply to deleted messages
- Reply depth is unlimited

### 3.3.3 Client-side Behavior

**Optimistic Update:**
1. Add message to UI immediately with `sendStatus: "sending"`
2. Send API request
3. On success: Update with server response
4. On failure: Mark as `sendStatus: "failed"` with retry button

**Retry Logic:**
- Max 3 retry attempts
- Exponential backoff: 1s, 2s, 4s
- User can manually retry after max attempts

**Timeout:**
- Request timeout: 30 seconds
- AbortController used for cancellation

---

## 3.4 Fetch Messages

### 3.4.1 API Endpoint

**GET** `/api/conversations/{conversationId}/messages`

**Query Parameters:**
- `limit` (integer, optional): Messages per page, default 50, max 100
- `beforeMessageId` (UUID, optional): Load messages older than this message

**Example Request:**
```
GET /api/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50&beforeMessageId=770e8400-e29b-41d4-a716-446655440222
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "senderId": "880e8400-e29b-41d4-a716-446655440333",
      "content": "Older message",
      "sentAt": "2026-01-26T09:00:00Z",
      ...
    }
  ],
  "nextCursor": "660e8400-e29b-41d4-a716-446655440111",
  "hasMore": true
}
```

### 3.4.2 Pagination Strategy

**Cursor-based pagination:**
- Load newest messages first (no cursor)
- Scroll up to load older messages (pass `beforeMessageId`)
- Messages ordered by `sentAt DESC` (newest first)

**Mobile Implementation:**
- Use RecyclerView (Android) or UITableView (iOS)
- Reverse scroll direction for chat UX
- Implement pull-to-load-more at top

---

## 3.5 Edit Message

### 3.5.1 API Endpoint

**PUT** `/api/messages/{messageId}`

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response (200 OK):** Returns updated `ChatMessage`

### 3.5.2 Business Rules

**Edit Permissions:**
- Only message sender can edit
- Cannot edit deleted messages
- Cannot edit messages older than 24 hours (configurable)

**Edit Behavior:**
- Only `content` can be edited
- Attachments cannot be modified
- `editedAt` timestamp updated
- `isEdited` flag set to true

**Real-time Update:**
- SignalR event `MessageUpdated` broadcasted to conversation
- All clients update message in UI
- Show "(edited)" label next to timestamp

---

## 3.6 Delete Message

### 3.6.1 API Endpoint

**DELETE** `/api/messages/{messageId}`

**Response (204 No Content)**

### 3.6.2 Business Rules

**Delete Permissions:**
- Message sender can delete own messages
- Group Admins/Owners can delete any message

**Delete Behavior:**
- Soft delete (not removed from database)
- Content replaced with "[Message deleted]"
- Attachments hidden
- `isDeleted` flag set to true
- Cannot be un-deleted

**Real-time Update:**
- SignalR event `MessageDeleted` broadcasted
- All clients hide/update message

---

## 3.7 Reply to Message

### 3.7.1 User Flow

```
User long-presses message (mobile) or clicks Reply button (web)
  ↓
Reply UI shown at bottom with preview of original message
  ↓
User types reply
  ↓
POST /api/messages with parentMessageId
  ↓
Reply sent and displayed with parent reference
```

### 3.7.2 UI Display

**Reply Message Display:**
- Show parent message preview above reply
- Include parent sender name
- Truncate parent content to 100 characters
- Click parent preview to scroll to original

**Example:**
```
┌─────────────────────────────────────┐
│ Replying to @john_doe               │
│ "Hello team, please review..."      │ ← Preview
├─────────────────────────────────────┤
│ [Text Input]                        │
└─────────────────────────────────────┘
```

---

## 3.8 Pin Message

### 3.8.1 API Endpoint

**POST** `/api/conversations/{conversationId}/messages/{messageId}/pin`

**DELETE** `/api/conversations/{conversationId}/messages/{messageId}/pin` (unpin)

### 3.8.2 Business Rules

**Pin Permissions:**
- Group Admins and Owners can pin
- Regular members cannot pin

**Pin Behavior:**
- Max 10 pinned messages per conversation
- Pinned messages shown at top of chat
- Order: Most recently pinned first

**Get Pinned Messages:**
- **GET** `/api/conversations/{conversationId}/pinned-messages`
- Returns array of pinned messages

---

## 3.9 Star Message

### 3.9.1 API Endpoint

**POST** `/api/messages/{messageId}/star`

**DELETE** `/api/messages/{messageId}/star` (unstar)

### 3.9.2 Business Rules

**Star Behavior:**
- User-specific (not shared with group)
- Unlimited starred messages
- No expiration

**Get Starred Messages:**
- **GET** `/api/users/me/starred-messages`
- Filter by conversation: `?conversationId={uuid}`

---

## 3.10 Typing Indicators

### 3.10.1 SignalR Events

**Send Typing:**
- Client invokes `SendTyping(conversationId, isTyping: true)`
- Invoke when user types (debounced 300ms)
- Invoke `isTyping: false` when user stops (3s timeout)

**Receive Typing:**
- Listen to `UserTyping` event
- Payload: `{ conversationId, userId, userName, isTyping }`

### 3.10.2 UI Display

- Show "John is typing..." at bottom of chat
- Multiple users: "John, Sarah are typing..."
- Max 3 names shown, then "John, Sarah, +2 others are typing..."

---

## 3.11 Message Grouping (UI)

### 3.11.1 Date Headers

Group messages by date:
- Today → "Today"
- Yesterday → "Yesterday"
- This week → Day name (e.g., "Monday")
- Older → Full date (e.g., "January 20, 2026")

### 3.11.2 Sender Grouping

Group consecutive messages from same sender:
- Show avatar + name only on first message
- Subsequent messages indented
- Break group if >2 minutes between messages

**Example:**
```
┌─────────────────────────────────────┐
│          January 26, 2026           │ ← Date header
├─────────────────────────────────────┤
│ 🟢 John Doe          10:30 AM      │
│    Hello team                       │
│    How are you?            10:30 AM │ ← Grouped
│                                     │
│ 🟢 Sarah Smith       10:32 AM      │ ← New group
│    I'm good, thanks!                │
└─────────────────────────────────────┘
```

---

## 3.12 Real-time Synchronization

### 3.12.1 SignalR Events

**MessageSent:**
```typescript
{
  conversationId: string;
  message: ChatMessage;
}
```
- Broadcasted when any user sends message
- All conversation members receive
- Includes sender's own message (confirmation)

**MessageUpdated:**
```typescript
{
  conversationId: string;
  message: ChatMessage;
}
```
- Broadcasted when message edited
- UI updates message content + shows "(edited)"

**MessageDeleted:**
```typescript
{
  conversationId: string;
  messageId: string;
}
```
- Broadcasted when message deleted
- UI replaces with "[Message deleted]"

### 3.12.2 Connection Management

**On Connect:**
1. Join all conversation groups: `JoinConversation(conversationId)`
2. Load recent messages (last 50)

**On Disconnect:**
- Automatic reconnection handles rejoining
- No manual intervention needed

**On Screen Change:**
- Leave previous conversation: `LeaveConversation(oldId)`
- Join new conversation: `JoinConversation(newId)`

---

## 3.13 Test Scenarios (QC)

### 3.13.1 Critical Tests

**TC-MSG-001: Send Text Message**
- **Priority:** Critical
- **Steps:**
  1. User A logs in and opens conversation
  2. User A types "Hello" and sends
  3. User B (in same conversation) observes
- **Expected:**
  - Message appears immediately in User A's UI with "sending" status
  - Within 1 second, message delivered and shows "sent"
  - User B receives message via SignalR within 1 second
  - Message displays with correct timestamp, sender name

**TC-MSG-002: Send Message with Attachment**
- **Priority:** Critical
- **Steps:**
  1. User A uploads file (< 10MB)
  2. User A sends message with file
- **Expected:**
  - File upload shows progress bar
  - Message sent after upload completes
  - Attachment preview shown correctly
  - User B can download/preview file

**TC-MSG-003: Message Delivery Failure**
- **Priority:** High
- **Steps:**
  1. Disconnect network
  2. User A sends message
- **Expected:**
  - Message shows "failed" status
  - Retry button appears
  - On reconnect + retry, message sends successfully

**TC-MSG-004: Real-time Synchronization**
- **Priority:** Critical
- **Steps:**
  1. User A and B in same conversation
  2. User A sends message
  3. User B sends message immediately after
- **Expected:**
  - Both messages appear in correct order
  - No duplicate messages
  - Timestamps accurate

### 3.13.2 Edge Cases

**TC-MSG-005: Long Message**
- Send message with 5000 characters (max)
- Verify truncation UI on mobile
- Verify "Show more" button

**TC-MSG-006: Special Characters**
- Send message with emojis, Unicode, code blocks
- Verify correct rendering

**TC-MSG-007: Concurrent Edits**
- User A edits message
- User B views during edit
- Verify User B sees updated version

**TC-MSG-008: Delete Pinned Message**
- Pin a message
- Delete the message
- Verify removed from pinned list

### 3.13.3 Performance Tests

**TC-MSG-009: Load 1000+ Messages**
- Conversation with 1000 messages
- Load and scroll through all
- **Expected:** Smooth scrolling, no lag

**TC-MSG-010: Multiple Users Typing**
- 10 users typing simultaneously
- **Expected:** Typing indicator updates correctly, no duplicates

---

## 3.14 Mobile Implementation Notes

### Android (Kotlin)

**Libraries:**
- Retrofit for API calls
- SignalR for Android
- Room for local caching
- Coil for image loading

**Key Components:**
- RecyclerView with DiffUtil for message list
- ViewBinding for views
- Coroutines for async operations

### iOS (Swift)

**Libraries:**
- Alamofire for API calls
- SignalRClient for iOS
- CoreData for local caching
- Kingfisher for image loading

**Key Components:**
- UITableView with diffable data source
- Combine for reactive updates
- async/await for async operations

---

## Next Section

Continue to: [4. Task Management Features](./04-task-management.md)
