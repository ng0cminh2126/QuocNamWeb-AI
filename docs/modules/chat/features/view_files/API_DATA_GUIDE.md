# View All Files - API Data Guide & Implementation Reference

**Purpose:** Quick reference for understanding how to use Chat API data for file viewing  
**Created:** 2025-01-09

---

## 📊 Data Flow Chart

```
┌─────────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                                │
│                                                                 │
│  1. User clicks "Xem tất cả (15)" in InformationPanel          │
│     └─→ ViewAllFilesModal opens                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FRONTEND - FETCH PHASE                                         │
│                                                                 │
│  2. useConversationFiles hook triggered:                       │
│     ├─ GET /api/conversations/{conversationId}/messages        │
│     ├─ Parameters: limit=50, before=null (first page)          │
│     └─ Returns: MessageDto[] with attachments                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ BACKEND API RESPONSE                                            │
│                                                                 │
│  {                                                              │
│    data: [                                                      │
│      {                                                          │
│        id: "msg-001",                                           │
│        senderName: "Nguyễn Văn A",                              │
│        type: "file",                                            │
│        createdAt: "2025-01-08T14:30:00Z",                       │
│        attachments: [                                           │
│          {                                                      │
│            fileId: "file-abc123",    ← Use for URL            │
│            fileName: "proposal.pdf", ← Use for display        │
│            contentType: "application/pdf", ← Determine type   │
│            fileSize: 2524288,        ← Format & display       │
│            uploadedAt: "2025-01-08T14:30:00Z" ← Sort by this  │
│          }                                                      │
│        ]                                                        │
│      },                                                         │
│      ... more messages ...                                      │
│    ],                                                           │
│    hasMore: true,                                               │
│    oldestMessageId: "msg-005"                                   │
│  }                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FRONTEND - EXTRACT PHASE                                       │
│                                                                 │
│  3. Extract files from all messages:                           │
│     ├─ Loop through message.attachments[]                      │
│     ├─ Check contentType to categorize:                        │
│     │  ├─ image/* → Media (grid)                               │
│     │  ├─ video/* → Media (grid)                               │
│     │  └─ other → Documents (list)                             │
│     ├─ Store extracted file data with message context:         │
│     │  {                                                        │
│     │    id: fileId,                                            │
│     │    name: fileName,                                        │
│     │    url: `/api/files/${fileId}`,                           │
│     │    size: fileSize,                                        │
│     │    type: contentType,                                     │
│     │    uploadedAt: message.createdAt,                         │
│     │    sender: message.senderName,                            │
│     │    messageId: message.id                                  │
│     │  }                                                        │
│     └─ Create two arrays: mediaFiles[], docFiles[]             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FRONTEND - DISPLAY PHASE                                       │
│                                                                 │
│  4. Display files in modal:                                    │
│     ├─ Grid view (Images/Videos):                              │
│     │  ├─ Show thumbnail (thumbnail or file icon)              │
│     │  ├─ Hover: show filename                                 │
│     │  └─ Click: open preview                                  │
│     │                                                          │
│     ├─ List view (Documents):                                  │
│     │  ├─ Show icon + name                                     │
│     │  ├─ Show size + date + sender                            │
│     │  └─ Click: open preview or download                      │
│     │                                                          │
│     ├─ Search: Filter by filename                              │
│     ├─ Filter: By type, date range, sender                     │
│     ├─ Sort: By date (default), name, size                     │
│     └─ Pagination: Show 50 files/page, load more on click      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ USER INTERACTIONS                                               │
│                                                                 │
│  5a. Click file to preview:                                    │
│      └─ GET /api/files/{fileId}                                │
│         └─ Display in overlay                                  │
│                                                                 │
│  5b. Download file:                                            │
│      └─ <a href={`/api/files/${fileId}`} download={name}>      │
│         └─ Browser downloads file                              │
│                                                                 │
│  5c. Apply filters/search:                                     │
│      └─ Filter cached extracted files (no new API calls)       │
│                                                                 │
│  5d. Go to page 2:                                             │
│      └─ Either:                                                │
│         A) Paginate from cache (if have 100+ files)            │
│         B) Fetch next 50 messages with:                        │
│            GET /api/conversations/{id}/messages?before={id}    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 API Response Details

### Message Structure (from API)
```typescript
interface MessageDto {
  // Identity
  id: string;
  conversationId: string;
  
  // Sender info
  senderId: string;
  senderName: string;                 // ← IMPORTANT: Show file uploader
  senderAvatarUrl?: string;
  
  // Content
  type: "text" | "image" | "file" | "system";
  content?: string;
  
  // ⭐ FILES ARE HERE
  attachments: AttachmentDto[];       // ← This is what we need
  
  // Timestamps
  createdAt: string;                  // ← Use for sorting files
  updatedAt?: string;
  
  // Additional
  isPinned: boolean;
  isStarred?: boolean;
  workTypeId?: string;
  taskId?: string;
}

interface AttachmentDto {
  // File identity
  id: string;
  fileId: string;                     // ← Use this for file URL
  
  // File metadata
  fileName: string;                   // ← Display name
  contentType: string;                // ← "image/png", "application/pdf", etc.
  fileSize: number;                   // ← Size in bytes (convert to MB)
  uploadedAt: string;                 // ← ISO timestamp
  
  // Optional
  thumbnailUrl?: string;              // ← Pre-generated thumbnail for images
  duration?: number;                  // ← For videos in seconds
  dimensions?: {
    width: number;
    height: number;
  };
}
```

---

## 💾 Storage & Extraction Logic

### Extract Files from Messages

```typescript
// After fetching messages from API, extract like this:

type ExtractedFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  sizeFormatted: string;
  type: string;
  contentType: string;
  uploadedAt: string;
  senderId: string;
  senderName: string;
  messageId: string;
  thumbnailUrl?: string;
};

function extractFilesFromMessages(
  messages: MessageDto[]
): { media: ExtractedFile[]; docs: ExtractedFile[] } {
  const media: ExtractedFile[] = [];
  const docs: ExtractedFile[] = [];

  messages.forEach((msg) => {
    if (!msg.attachments || msg.attachments.length === 0) {
      return;
    }

    msg.attachments.forEach((att) => {
      // Format file size
      const sizeFormatted = formatBytes(att.fileSize);
      
      // Build file object
      const file: ExtractedFile = {
        id: att.fileId,
        name: att.fileName,
        url: `/api/files/${att.fileId}`,
        size: att.fileSize,
        sizeFormatted,
        type: getFileType(att.contentType),           // "image", "video", "pdf", etc.
        contentType: att.contentType,
        uploadedAt: att.uploadedAt,
        senderId: msg.senderId,
        senderName: msg.senderName,
        messageId: msg.id,
        thumbnailUrl: att.thumbnailUrl,
      };

      // Categorize: media or documents
      if (isMediaFile(att.contentType)) {
        media.push(file);
      } else {
        docs.push(file);
      }
    });
  });

  return { media, docs };
}

// Helper functions

function isMediaFile(contentType: string): boolean {
  return contentType.startsWith("image/") || contentType.startsWith("video/");
}

function getFileType(contentType: string): string {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType === "application/pdf") return "pdf";
  if (contentType.includes("word")) return "word";
  if (contentType.includes("sheet")) return "excel";
  return "other";
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
```

---

## 🎯 File Categorization Logic

### From MIME Type to Display

```typescript
// How to determine what to show:

type FileCategory = "media" | "docs";
type FileIcon = "image" | "video" | "pdf" | "word" | "excel" | "other";

function categorizeFile(contentType: string): FileCategory {
  // Media: show in grid with thumbnails
  if (contentType.startsWith("image/")) return "media";
  if (contentType.startsWith("video/")) return "media";
  
  // Documents: show in list
  return "docs";
}

function getFileIcon(contentType: string): FileIcon {
  const typeMap: Record<string, FileIcon> = {
    // Images
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/webp": "image",
    "image/gif": "image",
    
    // Videos
    "video/mp4": "video",
    "video/webm": "video",
    "video/mpeg": "video",
    
    // Documents
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
    "application/msword": "word",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
    "application/vnd.ms-excel": "excel",
  };
  
  return typeMap[contentType] || "other";
}

// Display Rules:
// - "image"  → Grid thumbnail
// - "video"  → Grid with play icon overlay
// - "pdf"    → List with PDF icon
// - "word"   → List with Doc icon
// - "excel"  → List with Sheet icon
// - "other"  → List with generic file icon
```

---

## 📝 Code Examples

### Hook: useConversationFiles

```typescript
// src/hooks/queries/useConversationFiles.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/chat.api";

export function useConversationFiles(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ["conversation", conversationId, "messages"],
    queryFn: ({ pageParam }) =>
      getMessages(conversationId, {
        before: pageParam,
        limit: 50,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.oldestMessageId : undefined,
    enabled: !!conversationId,
  });
}
```

### Component: ViewAllFilesModal

```typescript
// src/features/portal/components/ViewAllFilesModal.tsx

import { useConversationFiles } from "@/hooks/queries/useConversationFiles";
import { extractFilesFromMessages } from "@/utils/fileExtraction";

type ViewAllFilesModalProps = {
  conversationId: string;
  groupName: string;
  open: boolean;
  onClose: () => void;
};

export function ViewAllFilesModal({
  conversationId,
  groupName,
  open,
  onClose,
}: ViewAllFilesModalProps) {
  const { data, isLoading, fetchNextPage, hasNextPage } =
    useConversationFiles(conversationId);

  // Extract all files from fetched messages
  const allMessages = data?.pages.flatMap((p) => p.data) ?? [];
  const { media, docs } = extractFilesFromMessages(allMessages);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Tất cả Ảnh - {groupName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            {/* Tab: Images */}
            <div className="grid grid-cols-5 gap-3">
              {media.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPreview={() => {/* ... */}}
                />
              ))}
            </div>

            {/* Pagination */}
            {hasNextPage && (
              <button onClick={() => fetchNextPage()}>
                Load More
              </button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🔗 URL Construction

### Download/Preview File
```typescript
// After getting fileId from API:
const fileUrl = `/api/files/${fileId}`;

// For download:
<a href={fileUrl} download={fileName}>
  Download
</a>

// For preview (image):
<img src={fileUrl} alt={fileName} />

// For preview (PDF):
<iframe src={fileUrl} width="100%" height="600px" />
```

---

## 📊 Pagination Strategy

### Option A: Fetch & Cache
```
Step 1: Fetch messages page 1 (50 items, extract ~80 files)
Step 2: Display files page 1 (50 files) from cache
Step 3: User clicks "Next"
        → Paginate from cache (no API call)
Step 4: Cache runs out, show "Load More"
        → Fetch messages page 2 (with before=lastMessageId)
        → Extract files from new messages
        → Add to cache
Step 5: Continue from cache until end
```

### Option B: Simple Message Pagination
```
Step 1: Fetch messages page 1
        → Extract files
        → Display all extracted files
Step 2: User clicks "Next"
        → Fetch messages page 2 (with pagination cursor)
        → Extract files
        → Display new files
```

**Recommended:** Option A (cache extracted files, fetch more only when needed)

---

## ✅ Implementation Checklist

- [ ] Create `useConversationFiles` hook
  - [ ] Fetch messages with pagination
  - [ ] Handle loading/error states
  - [ ] Cache extracted files

- [ ] Create `ViewAllFilesModal` component
  - [ ] Display files in grid/list
  - [ ] Implement search
  - [ ] Implement filters
  - [ ] Implement sorting

- [ ] Create `FileCard` component
  - [ ] Show thumbnail/icon
  - [ ] Show metadata
  - [ ] Handle click for preview

- [ ] Create `FilePreview` component
  - [ ] Show full-size image
  - [ ] Show PDF viewer or download link
  - [ ] Navigation (prev/next)

- [ ] Modify `InformationPanel`
  - [ ] Add "Xem tất cả" buttons
  - [ ] Connect to modal state
  - [ ] Pass conversation data

- [ ] Create utilities
  - [ ] `extractFilesFromMessages()`
  - [ ] `formatBytes()`
  - [ ] `getFileIcon()`
  - [ ] `getFileType()`

---

## 📚 Related Types (from API Swagger)

From Chat_Swagger.json:
- `MessageDto` - Complete message with attachments
- `AttachmentDto` - File attachment metadata
- `MessageListResult` - Paginated response

From Task_Swagger.json:
- Not directly used (Task API is separate)
- But shows pattern for file handling in other modules

---

## 🧪 Testing with Snapshot Data

Use the JSON snapshot provided:
```
docs/api/chat/files/snapshots/v1/get-messages-with-files.json
```

Contains real example data with:
- Multiple message types
- Various file types (PDF, Image, Excel, Word)
- Complete metadata
- Pagination markers

Perfect for mock testing before API integration.

---

**Last Updated:** 2025-01-09  
**Status:** Ready for Implementation
