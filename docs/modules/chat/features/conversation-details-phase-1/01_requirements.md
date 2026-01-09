# [BƯỚC 1] Requirements - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Version:** 1.1.0  
> **Status:** 🔄 UPDATING  
> **Last Update:** 2026-01-06 - Thêm file upload & auto-focus

---

## 📋 Functional Requirements

### FR-01: Header Area

| ID      | Requirement                              | Priority | Notes    |
| ------- | ---------------------------------------- | -------- | -------- |
| FR-01.1 | Hiển thị tên conversation (group/person) | HIGH     |          |
| FR-01.2 | Hiển thị avatar/initials                 | HIGH     |          |
| FR-01.3 | Hiển thị số thành viên (group)           | MEDIUM   |          |
| FR-01.4 | Hiển thị online status (DM)              | HIGH     | Realtime |
| FR-01.5 | Button toggle right panel                | MEDIUM   |          |
| FR-01.6 | Button back (mobile)                     | HIGH     |          |

### FR-02: Message List

| ID      | Requirement                      | Priority | Notes        |
| ------- | -------------------------------- | -------- | ------------ |
| FR-02.1 | Hiển thị danh sách messages      | HIGH     |              |
| FR-02.2 | Phân biệt sent/received messages | HIGH     | Bubble UI    |
| FR-02.3 | Hiển thị avatar sender (group)   | HIGH     |              |
| FR-02.4 | Hiển thị thời gian gửi           | HIGH     |              |
| FR-02.5 | Hiển thị trạng thái đã đọc       | MEDIUM   | ReceivedInfo |
| FR-02.6 | Infinite scroll (load more cũ)   | HIGH     |              |
| FR-02.7 | Auto scroll xuống tin mới        | HIGH     |              |
| FR-02.8 | Group messages theo ngày         | MEDIUM   | Date divider |

### FR-03: Message Types

| ID      | Requirement                        | Priority | Notes              |
| ------- | ---------------------------------- | -------- | ------------------ |
| FR-03.1 | Text message                       | HIGH     |                    |
| FR-03.2 | Image attachment                   | HIGH     | Preview + modal    |
| FR-03.3 | File attachment (PDF, DOC, etc)    | HIGH     | Download link      |
| FR-03.4 | **Excel attachment (.xlsx, .xls)** | HIGH     | 🆕 Download link   |
| FR-03.5 | **Word attachment (.docx, .doc)**  | HIGH     | 🆕 Download link   |
| FR-03.6 | Reply message                      | MEDIUM   | Quote original     |
| FR-03.7 | System message                     | LOW      | "User joined", etc |

### FR-04: Message Input

| ID       | Requirement                         | Priority | Notes                   |
| -------- | ----------------------------------- | -------- | ----------------------- |
| FR-04.1  | Text input với multiline            | HIGH     |                         |
| FR-04.2  | Send button                         | HIGH     |                         |
| FR-04.3  | Attach file button (📎)             | HIGH     | 🆕 Bên cạnh input       |
| FR-04.4  | Attach image button (🖼️)            | HIGH     | 🆕 Bên cạnh input       |
| FR-04.5  | Enter to send (Shift+Enter newline) | MEDIUM   |                         |
| FR-04.6  | Typing indicator                    | MEDIUM   | SignalR                 |
| FR-04.7  | Disable input khi sending           | MEDIUM   |                         |
| FR-04.8  | **Auto-focus sau khi gửi**          | HIGH     | 🆕 UX improvement       |
| FR-04.9  | **File upload (ảnh, PDF, Excel)**   | HIGH     | 🆕 Multi-file support   |
| FR-04.10 | **File preview trước khi gửi**      | MEDIUM   | 🆕 Show filename + size |
| FR-04.11 | **Validate file size & type**       | HIGH     | 🆕 Max 10MB             |

### FR-05: Real-time Updates (SignalR)

| ID      | Requirement                       | Priority | Notes                 |
| ------- | --------------------------------- | -------- | --------------------- |
| FR-05.1 | Nhận tin nhắn mới → thêm vào list | HIGH     |                       |
| FR-05.2 | Nhận typing indicator             | MEDIUM   | "[User] đang nhập..." |
| FR-05.3 | Nhận read receipt                 | MEDIUM   |                       |
| FR-05.4 | Nhận message reaction             | LOW      | Phase 2               |
| FR-05.5 | Nhận message deleted              | LOW      | Phase 2               |

### FR-06: Loading States

| ID      | Requirement                 | Priority | Notes       |
| ------- | --------------------------- | -------- | ----------- |
| FR-06.1 | Skeleton khi load initial   | HIGH     |             |
| FR-06.2 | Loading indicator load more | HIGH     | Top of list |
| FR-06.3 | Sending indicator           | HIGH     |             |
| FR-06.4 | Error retry send            | HIGH     |             |

### FR-07: File Upload (🆕 New Feature)

| ID       | Requirement                                | Priority | Notes                            |
| -------- | ------------------------------------------ | -------- | -------------------------------- |
| FR-07.1  | Button upload file (📎) bên cạnh input     | HIGH     | IconButton component             |
| FR-07.2  | Button upload image (🖼️) bên cạnh file btn | HIGH     | IconButton component             |
| FR-07.3  | File picker cho file types                 | HIGH     | .pdf, .doc, .docx, .xls, .xlsx   |
| FR-07.4  | Image picker cho image types               | HIGH     | .jpg, .jpeg, .png, .gif, .webp   |
| FR-07.5  | Multi-file upload support                  | MEDIUM   | Chọn nhiều files cùng lúc        |
| FR-07.6  | File preview trước khi gửi                 | HIGH     | Show list với icon + name + size |
| FR-07.7  | Remove file khỏi preview                   | HIGH     | Button X cho mỗi file            |
| FR-07.8  | Validate file size (max 10MB)              | HIGH     | Client-side validation           |
| FR-07.9  | Validate file type                         | HIGH     | Client-side validation           |
| FR-07.10 | Upload progress indicator                  | MEDIUM   | Show % khi đang upload           |
| FR-07.11 | Error handling (size, type, upload failed) | HIGH     | Toast notification cho errors    |

---

## 🎨 UI Requirements

### UI-01: Layout

```
┌────────────────────────────────────────────────────────────┐
│ [←] [Avatar] Tên nhóm/người           [📎] [⋯] [Panel]    │ ← Header
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ─────────── Hôm nay ───────────                          │ ← Date divider
│                                                            │
│        ┌────────────────────┐                              │
│        │ Tin nhắn received  │ [12:30]                     │ ← Received
│        └────────────────────┘                              │
│                                                            │
│                     ┌────────────────────┐                 │
│          [12:35]    │ Tin nhắn sent      │                │ ← Sent
│                     └────────────────────┘                 │
│                                                            │
│ 🆕 [📎] [🖼️] │ Nhập tin nhắn... (auto-focus)   │ [Send]  │ ← Input
└────────────────────────────────────────────────────────────┘
           ↑
     Attach buttons bên cạnh input
```

### UI-02: File Attach Button

```
┌─────────────────────────────────────────────────────┐
│ [📎]  ← Button attach (bên trái input)              │
│       • Click → Open file picker                    │
│       • Accept: .pdf, .doc, .docx, .xls, .xlsx     │
│       • Max: 10MB                                   │
│                                                     │
│ [🖼️]  ← Button image (bên cạnh attach button)      │
│       • Click → Open image picker                   │
│       • Accept: .jpg, .jpeg, .png, .gif, .webp     │
│       • Max: 10MB                                   │
└─────────────────────────────────────────────────────┘
```

### UI-03: File Preview Before Send

```
┌─────────────────────────────────────────────────────┐
│ Đính kèm file:                                      │
│ ┌────────────────────────────────────────┐          │
│ │ 📄 report.pdf (2.5 MB)           [❌]  │          │
│ └────────────────────────────────────────┘          │
│ ┌────────────────────────────────────────┐          │
│ │ 📊 data.xlsx (1.2 MB)            [❌]  │          │
│ └────────────────────────────────────────┘          │
│                                                     │
│ [📎] [🖼️] │ Thêm ghi chú...            │ [Gửi]    │
└─────────────────────────────────────────────────────┘
```

### UI-04: Auto-focus Behavior

**Kịch bản 1: Sau khi gửi tin**

```
User nhập "Hello" → Click Send
  ↓
Message được gửi
  ↓
Input tự động clear
  ↓
🆕 Input tự động focus lại (cursor trong input)
  ↓
User có thể gõ tiếp ngay không cần click
```

**Kịch bản 2: Sau khi attach file**

```
User click [📎] → Chọn file → File added to preview
  ↓
🆕 Input tự động focus
  ↓
User có thể gõ message đi kèm file
│ [📎] [🖼️] │ Nhập tin nhắn...                    │ [Send]  │ ← Input
└────────────────────────────────────────────────────────────┘
```

### UI-05: Upload Button Specifications (🆕)

**Button Layout:**

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│ [📎]  [🖼️]  │ Nhập tin nhắn...          │  [Send]   │
│  ↑     ↑                                               │
│  │     │                                               │
│  │     └─ Image button (ImageUp icon)                 │
│  └─ File button (Paperclip icon)                      │
│                                                        │
│ Position: Bên trái input, trước textarea              │
│ Gap: 8px giữa 2 buttons                               │
└────────────────────────────────────────────────────────┘
```

**Button Specs:**

| Property    | File Button (📎)     | Image Button (🖼️)     | Notes                |
| ----------- | -------------------- | --------------------- | -------------------- |
| Component   | `IconButton`         | `IconButton`          | From UI library      |
| Icon        | `Paperclip`          | `ImageUp`             | From lucide-react    |
| Size        | `h-9 w-9`            | `h-9 w-9`             | 36×36 pixels         |
| Variant     | `ghost`              | `ghost`               | Transparent bg       |
| Color       | `text-gray-600`      | `text-gray-600`       | Default state        |
| Hover       | `hover:bg-gray-100`  | `hover:bg-gray-100`   | Light gray on hover  |
| Active      | `active:bg-gray-200` | `active:bg-gray-200`  | Darker on press      |
| Disabled    | `opacity-50`         | `opacity-50`          | When sending message |
| aria-label  | "Đính kèm file"      | "Đính kèm ảnh"        | Accessibility        |
| data-testid | `attach-file-button` | `attach-image-button` | E2E testing          |

**File Input (Hidden):**

```tsx
// File button
<input
  type="file"
  accept=".pdf,.doc,.docx,.xls,.xlsx"
  multiple
  style={{ display: 'none' }}
  ref={fileInputRef}
  onChange={handleFileChange}
/>

// Image button
<input
  type="file"
  accept="image/jpeg,image/png,image/gif,image/webp"
  multiple
  style={{ display: 'none' }}
  ref={imageInputRef}
  onChange={handleImageChange}
/>
```

### UI-06: File Preview Component (🆕)

**Preview Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Đính kèm file (2):                                     │
│ ┌──────────────────────────────────────────────┐       │
│ │ 📄 Báo cáo tháng 12.pdf          2.5 MB  [❌] │       │
│ └──────────────────────────────────────────────┘       │
│ ┌──────────────────────────────────────────────┐       │
│ │ 📊 Dữ liệu khách hàng.xlsx       1.2 MB  [❌] │       │
│ └──────────────────────────────────────────────┘       │
│                                                        │
│ [📎]  [🖼️]  │ Thêm ghi chú...          │  [Gửi]    │
└────────────────────────────────────────────────────────┘
```

**Preview Item Specs:**

| Element       | Specification                         | Notes                    |
| ------------- | ------------------------------------- | ------------------------ |
| Container     | `bg-gray-50 rounded-lg p-3`           | Light gray background    |
| Layout        | Flexbox horizontal                    | Icon + info + remove btn |
| Gap           | `gap-3`                               | 12px between elements    |
| Icon          | Based on file type                    | 📄 PDF, 📊 Excel, etc    |
| Icon size     | `h-8 w-8`                             | 32×32 pixels             |
| Filename      | `text-sm font-medium`                 | Max 40 chars, ellipsis   |
| File size     | `text-xs text-gray-500`               | Format: 2.5 MB           |
| Remove button | IconButton with X icon                | `h-6 w-6`                |
| Remove hover  | `hover:bg-red-100 hover:text-red-600` | Red tint on hover        |

**File Type Icons:**

```tsx
const FILE_ICONS = {
  "application/pdf": "📄",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊", // .xlsx
  "application/vnd.ms-excel": "📊", // .xls
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝", // .docx
  "application/msword": "📝", // .doc
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "image/webp": "🖼️",
};
```

**Error States:**

```
┌────────────────────────────────────────────────────────┐
│ ⚠️ File quá lớn: report.pdf (15 MB)                   │
│    Kích thước tối đa: 10 MB                            │
│                                                  [Đóng]│
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ⚠️ Định dạng không hỗ trợ: virus.exe                  │
│    Chỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX, Images   │
│                                                  [Đóng]│
└────────────────────────────────────────────────────────┘
```

### UI-02: Message Bubble

| Type     | Style                                          |
| -------- | ---------------------------------------------- |
| Sent     | Background brand-600, text white, align right  |
| Received | Background gray-100, text gray-900, align left |
| System   | Center, italic, gray-500                       |

### UI-03: Responsive

| Breakpoint | Behavior                         |
| ---------- | -------------------------------- |
| Desktop    | Full layout với right panel      |
| Tablet     | Right panel có thể collapse      |
| Mobile     | Full screen, back button to list |

---

## 🔐 Security Requirements

| ID     | Requirement                         | Notes             |
| ------ | ----------------------------------- | ----------------- |
| SEC-01 | Gửi Bearer token trong API request  |                   |
| SEC-02 | Validate message content trước send | XSS prevention    |
| SEC-03 | File upload size limit              | Max 10MB          |
| SEC-04 | File type validation                | Server-side check |

---

## 🔗 API Requirements

> ✅ **API đã được xác nhận** - Xem chi tiết: [contract.md](../../../api/chat/conversation-details-phase-1/contract.md)

### Base URL

```
https://vega-chat-api-dev.allianceitsc.com
```

### Endpoints

| Endpoint                             | Method | Description      | Status     |
| ------------------------------------ | ------ | ---------------- | ---------- |
| `/api/conversations/{guid}/messages` | GET    | Lấy messages     | ✅ Ready   |
| `/api/conversations/{guid}/messages` | POST   | Gửi tin nhắn mới | ⏳ Pending |

### GET Messages Response

```typescript
interface GetMessagesResponse {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface Message {
  id: string; // UUID của message
  conversationId: string; // UUID của conversation
  senderId: string; // UUID của người gửi
  senderName: string; // Tên người gửi
  parentMessageId: string | null; // Reply message
  content: string; // Nội dung tin nhắn
  contentType: "TXT" | "IMG" | "FILE" | "TASK";
  sentAt: string; // ISO datetime
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: Reaction[];
  attachments: Attachment[];
  replyCount: number;
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: any | null;
  mentions: string[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}
```

### Query Parameters

| Param  | Type   | Required | Default | Description               |
| ------ | ------ | -------- | ------- | ------------------------- |
| limit  | number | ❌       | 50      | Số messages tối đa        |
| cursor | string | ❌       | -       | Cursor cho page tiếp theo |

### Pagination

API sử dụng **cursor-based pagination**:
🆕 Upload file (PDF, Excel, Word, Image) hoạt động

- [ ] 🆕 Validate file size (max 10MB)
- [ ] 🆕 Validate file type (allowed extensions only)
- [ ] 🆕 Preview files trước khi gửi
- [ ] 🆕 Remove file khỏi preview
- [ ] 🆕 Auto-focus input sau khi gửi message
- [ ] 🆕 Auto-focus input sau khi attach file

```http
GET /api/conversations/{guid}/messages?limit=50&cursor={nextCursor}
```

### Authentication

```http
Authorization: Bearer {accessToken}
```

### SignalR Events

| Hub          | Event         | Direction | Description    |
| ------------ | ------------- | --------- | -------------- |
| `/hubs/chat` | `NewMessage`  | Receive   | Tin nhắn mới   |
| `/hubs/chat` | `SendMessage` | Send      | Gửi tin nhắn   |
| `/hubs/chat` | `Typing`      | Send      | Đang nhập      |
| `/hubs/chat` | `UserTyping`  | Receive   | User đang nhập |
| `/hubs/chat` | `MessageRead` | Receive   | Tin đã đọc     |

### Snapshots

- [get-messages-success.json](../../../api/chat/conversation-details-phase-1/snapshots/v1/get-messages-success.json)

---

## 📊 Component Architecture (Updated: 2026-01-06)

### Components Đang Sử Dụng (Production)

| Component                   | Location                                                    | Description                                                                       | Status        |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------- |
| **ChatMainContainer**       | `src/features/portal/components/ChatMainContainer.tsx`      | Container chính cho conversation detail với API, TanStack Query, SignalR realtime | ✅ **ACTIVE** |
| **MessageBubble**           | `src/features/portal/components/MessageBubble.tsx`          | Component hiển thị từng message bubble (sent/received)                            | ✅ Active     |
| **MessageSkeleton**         | `src/features/portal/components/MessageSkeleton.tsx`        | Loading skeleton cho messages                                                     | ✅ Active     |
| **EmptyChatState**          | `src/features/portal/components/EmptyChatState.tsx`         | Empty state hiển thị khi chưa chọn conversation                                   | ✅ Active     |
| **ConversationListSidebar** | `src/features/portal/workspace/ConversationListSidebar.tsx` | Sidebar danh sách conversations                                                   | ✅ Active     |
| **WorkspaceView**           | `src/features/portal/workspace/WorkspaceView.tsx`           | Layout chứa sidebar + chat container + detail panel                               | ✅ Active     |

### Components Deprecated (Mockup - Không còn dùng)

| Component            | Location                                             | Status            | Notes                           |
| -------------------- | ---------------------------------------------------- | ----------------- | ------------------------------- |
| ~~ChatMessagePanel~~ | `src/features/portal/workspace/ChatMessagePanel.tsx` | ❌ **DEPRECATED** | Thay thế bởi ChatMainContainer  |
| ~~ChatMain~~         | (không tồn tại)                                      | ❌ **DELETED**    | Renamed thành ChatMainContainer |

### Component Features (Production)

**ChatMainContainer** (Component chính - ĐANG SỬ DỤNG):

- ✅ Fetch messages from API via useMessages hook
- ✅ Send messages via useSendMessage mutation
- ✅ Realtime updates via SignalR (useMessageRealtime)
- ✅ Typing indicators (useSendTypingIndicator)
- ✅ Infinite scroll pagination (cursor-based)
- ✅ Message grouping by date
- ✅ Auto-scroll to bottom on new messages
- ✅ File upload support (📎 File, 🖼️ Image buttons) - Added 2026-01-06
- ✅ Mobile responsive with back button
- ✅ Loading states (skeleton, sending, error with retry)
- ✅ Empty state handling

**MessageBubble:**

- ✅ Render sent/received message styles
- ✅ Display avatar, sender name, timestamp
- ✅ Support attachments (images, files)
- ✅ Reply/quoted message display

**EmptyChatState:**

- ✅ Desktop layout: Icon 16x16 + hướng dẫn chi tiết
- ✅ Mobile layout: Icon 12x12 + text ngắn gọn
- ✅ Responsive design
- ✅ Prop `isMobile` để switch layout

### Component Naming Convention

**Từ Mockup → Production:**

| Mockup Name        | Production Name     | Status         | Lý do                                    |
| ------------------ | ------------------- | -------------- | ---------------------------------------- |
| `ChatMain`         | `ChatMainContainer` | ✅ **ACTIVE**  | Rõ nghĩa hơn, tránh conflict             |
| `ChatMessagePanel` | (deprecated)        | ❌ **REMOVED** | Thay thế hoàn toàn bởi ChatMainContainer |
| `MessageBubble`    | `MessageBubble`     | ✅ Active      | Giữ nguyên                               |
| `Message` (type)   | `ChatMessage`       | ✅ Active      | Tránh conflict với Message type          |
| `messages`         | `messages`          | ✅ Active      | Giữ nguyên                               |
| `selectedGroup`    | `conversation`      | ✅ Active      | Bao quát hơn (group + DM)                |

### File Naming (Production)

| Type      | Pattern                 | Example          | Status        | Location                          |
| --------- | ----------------------- | ---------------- | ------------- | --------------------------------- |
| Component | `ChatMainContainer.tsx` | Main container   | ✅ **ACTIVE** | `src/features/portal/components/` |
| Component | `MessageBubble.tsx`     | Message bubble   | ✅ Active     | `src/features/portal/components/` |
| Component | `MessageSkeleton.tsx`   | Loading skeleton | ✅ Active     | `src/features/portal/components/` |
| Component | `EmptyChatState.tsx`    | Empty state      | ✅ Active     | `src/features/portal/components/` |
| Hook      | `useMessages.ts`        | Query hook       | ✅ Active     | `src/hooks/queries/`              |
| Hook      | `useSendMessage.ts`     | Mutation hook    | ✅ Active     | `src/hooks/mutations/`            |
| Hook      | `useMessageRealtime.ts` | SignalR hook     | ✅ Active     | `src/hooks/`                      |
| API       | `messages.api.ts`       | API client       | ✅ Active     | `src/api/`                        |
| Types     | `messages.ts`           | Type definitions | ✅ Active     | `src/types/`                      |

---

B** |
| 5 | Typing indicator debounce | 500ms hay 1000ms? | ✅ **500ms** |
| 6 | Message cache staleTime | 30s, 60s, hay 5m? | ✅ **30s** |
| 7 | 🆕 File types allowed | Which extensions? | ⬜ \*\***_** |
| 8 | 🆕 Multiple files at once | Allow multiple or single? | ⬜ **_\***\* |
| 9 | 🆕 Auto-focus delay | 0ms, 100ms, or 200ms? | ⬜ **\_\_\_

- [ ] | Load và hiển thị messages từ API |
      | -------------------------------- | ---------------- |
      | Đã review Requirements           | ⬜ Chưa review   |
      | Đã review Impact Summary         | ⬜ Chưa review   |
      | Đã điền Pending Decisions        | ⬜ Chưa điền     |
      | API Contract ready               | ⬜ Chưa có       |
      | **APPROVED để thực thi**         | ⬜ CHƯA APPROVED |

**HUMAN Signature:** **\_\_**  
**Date:** 2026-01-06g requests

- [ ] Unit tests pass (≥80% coverage)

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files đã tạo (Implementation Complete):

| File                                                      | Description           | Status  | Date       |
| --------------------------------------------------------- | --------------------- | ------- | ---------- |
| ✅ `src/api/messages.api.ts`                              | API client            | ✅ Done | Earlier    |
| ✅ `src/hooks/queries/useMessages.ts`                     | Query hook (infinite) | ✅ Done | Earlier    |
| ✅ `src/hooks/mutations/useSendMessage.ts`                | Mutation hook         | ✅ Done | Earlier    |
| ✅ `src/types/messages.ts`                                | Message types         | ✅ Done | Earlier    |
| ✅ `src/features/portal/components/ChatMainContainer.tsx` | Main container        | ✅ Done | Earlier    |
| ✅ `src/features/portal/components/EmptyChatState.tsx`    | Empty state component | ✅ Done | 2026-01-06 |

### Files sẽ tạo (🆕 File Upload Feature):

| File                                      | Description               | Status     | Priority |
| ----------------------------------------- | ------------------------- | ---------- | -------- |
| ⏳ `src/components/FilePreview.tsx`       | File preview component    | ⏳ Pending | HIGH     |
| ⏳ `src/hooks/mutations/useUploadFile.ts` | File upload mutation hook | ⏳ Pending | HIGH     |
| ⏳ `src/utils/fileValidation.ts`          | File validation utilities | ⏳ Pending | HIGH     |
| ⏳ `src/utils/fileHelpers.ts`             | File format/icon helpers  | ⏳ Pending | MEDIUM   |
| ⏳ `src/api/files.api.ts`                 | File upload API client    | ⏳ Pending | HIGH     |

### Files đã sửa đổi:

| File                                                 | Changes                                               | Status  | Date       |
| ---------------------------------------------------- | ----------------------------------------------------- | ------- | ---------- |
| ✅ `src/features/portal/workspace/WorkspaceView.tsx` | Import EmptyChatState, removed inline empty state JSX | ✅ Done | 2026-01-06 |
| ✅ `src/lib/signalr.ts`                              | Message events                                        | ✅ Done | Earlier    |

### Files sẽ sửa đổi (🆕 File Upload Feature):

| File                                                      | Changes                                                 | Status     | Priority |
| --------------------------------------------------------- | ------------------------------------------------------- | ---------- | -------- |
| ⏳ `src/features/portal/components/ChatMainContainer.tsx` | Thêm file upload buttons, file preview, upload handlers | ⏳ Pending | HIGH     |
| ⏳ `src/types/messages.ts`                                | Thêm FileAttachment type, upload-related types          | ⏳ Pending | HIGH     |

### Files sẽ xoá:

- Không xoá (giữ mockup để reference)

### Dependencies:

- Không cần thêm dependencies mới

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                      | Lựa chọn                                    | HUMAN Decision                                                                                                                                                                                     |
| --- | --------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Message pagination          | Page number hay cursor-based?               | ✅ **Cursor-based** (từ API: limit param + response structure)                                                                                                                                     |
| 2   | Page size                   | 20, 50, hay 100 messages?                   | ✅ **50** (default từ API: `?limit=50`)                                                                                                                                                            |
| 3   | File upload                 | Direct upload hay presigned URL?            | ✅ **Direct upload**                                                                                                                                                                               |
| 4   | Max file size               | 5MB, 10MB, hay 25MB?                        | ✅ **10MB**                                                                                                                                                                                        |
| 5   | Typing indicator debounce   | 500ms hay 1000ms?                           | ✅ **500ms**                                                                                                                                                                                       |
| 6   | Message cache staleTime     | 30s, 60s, hay 5m?                           | ✅ **30s**                                                                                                                                                                                         |
| 7   | 🆕 File types allowed       | Which extensions?                           | ⬜ \***\*Theo đề xuất .pdf, .doc, .docx, .xls, .xlsx, images nhưng cần nhận thông tin từ api để dễ dàng thay đổi. Chuẩn bị trước phương án\*\*** (đề xuất: .pdf, .doc, .docx, .xls, .xlsx, images) |
| 8   | 🆕 Multiple files at once   | Allow multiple or single?                   | ⬜ \***\*Multiple mặc định max 5 file chuẩn bị trước phương án nhận thông tin từ api để thay đổi\*\*** (đề xuất: Multiple - max 5 files)                                                           |
| 9   | 🆕 Auto-focus delay         | 0ms, 100ms, or 200ms?                       | ⬜ \***\*immediate\*\*** (đề xuất: 0ms - immediate)                                                                                                                                                |
| 10  | 🆕 File preview position    | Above input or below input?                 | ⬜ \***\*above input\*\*** (đề xuất: Above input)                                                                                                                                                  |
| 11  | 🆕 Upload API endpoint      | `/files/upload` or `/messages/attachments`? | ⬜ \***\*Bổ sung sau\*\*** (cần kiểm tra API docs)                                                                                                                                                 |
| 12  | 🆕 Image preview in message | Thumbnail or full image?                    | ⬜ \***\*Thumbnail \*\*** (đề xuất: Thumbnail with modal)                                                                                                                                          |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Requirements    | ✅ Đã review |
| Đã review Impact Summary  | ✅ Đã review |
| Đã điền Pending Decisions | ✅ Đã điền   |
| API Contract ready        | ✅ READY     |
| **APPROVED để thực thi**  | ✅ APPROVED  |

**HUMAN Signature:** HUMAN  
**Date:** 2025-12-30

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**
