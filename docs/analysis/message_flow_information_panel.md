# Message Flow & File Fetching in InformationPanel

## 📊 Architecture Overview

This document describes how messages work and when files are fetched for the **InformationPanel** component in the QuocNam Portal application.

---

## 🔄 Message Flow Architecture

### 1. **Message Data Flow (Top-Level)**

```
┌──────────────────────────────────────────────────────────────┐
│                    WorkspaceView.tsx                          │
│  (receives messages from parent, stores in state)            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ passes: messages prop
                       ▼
┌──────────────────────────────────────────────────────────────┐
│            ConversationDetailPanel.tsx                        │
│  (manages tabs: "info" vs "order/tasks")                     │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    (info tab)                    (order/tasks tab)
        │                             │
        ▼                             ▼
┌──────────────────────────────┐   [Tasks UI]
│    InformationPanel.tsx      │
│  (displays file sections)    │
└──────────────┬───────────────┘
               │
               │ passes: messages prop
               │
    ┌──────────┴──────────────────────┐
    │                                  │
    ▼                                  ▼
[FileManagerPhase1A]          [ViewAllFilesModal]
(Ảnh/Video Grid)             (opens with extracted files)
(Tài liệu List)
```

### 2. **Message Props Definition**

**Location:** `src/features/portal/workspace/InformationPanel.tsx`

```typescript
interface InformationPanelProps {
  viewMode?: ViewMode;              // "lead" or "staff"
  groupId?: string;                 // Current group/conversation ID
  groupName?: string;               // Group display name
  workTypeName?: string;            // Work type (e.g., "Nhận hàng")
  selectedWorkTypeId?: string;      // Selected work type ID
  members?: MinimalMember[];        // Group members
  onAddMember?: () => void;         // Callback
  onOpenSourceMessage?: (messageId: string) => void;  // Jump to source
  messages?: any[];                 // ⚡ MAIN: Messages from API
}
```

### 3. **Message Structure (MessageLike Type)**

**Location:** `src/features/portal/components/FileManagerPhase1A.tsx:41-66`

```typescript
type MessageLike = {
  id: string;                   // Message ID
  groupId?: string;             // Group this message belongs to
  sender?: string | { id?: string; name?: string };  // Sender info
  type?: "text" | "image" | "file" | "system";
  contentType?: "text" | "image" | "file" | "system" | "task";
  createdAt?: string;           // ISO timestamp
  time?: string;                // Formatted time
  
  // API structure: attachments array (PRIMARY)
  attachments?: Array<{
    fileName?: string;
    name?: string;
    url?: string;
    fileUrl?: string;
    mimeType?: string;
    fileSize?: string;
    size?: string;
  }>;
  
  // Legacy structures (fallback)
  files?: { name: string; url: string; type: AttachmentType; size?: string }[];
  fileInfo?: { name: string; url: string; type: AttachmentType; size?: string };
};
```

---

## 📁 File Fetching for InformationPanel

### 1. **When Files Are Fetched**

Files are **extracted on-demand** using `React.useMemo` hooks:

#### **A. During Component Render (FileManagerPhase1A)**

**Location:** `src/features/portal/components/FileManagerPhase1A.tsx:127-175`

```typescript
// Trigger: Messages prop changes OR groupId changes
const messageList = React.useMemo<MessageLike[]>(() => {
  if (!messages || messages.length === 0) return [];
  console.log("Processing messages", { groupId, messageCount: messages?.length });
  return (messages as MessageLike[]);
}, [groupId, messages]);

// Extract files from messages
const { mediaFiles, docFiles } = React.useMemo<{
  mediaFiles: Phase1AFileItem[];
  docFiles: Phase1AFileItem[];
}>(() => {
  const media: Phase1AFileItem[] = [];
  const docs: Phase1AFileItem[] = [];
  
  messageList.forEach((m) => {
    const attachments: { name: string; url: string; type: AttachmentType; size?: string }[] = [];

    // Handle API Message structure with attachments array
    if (Array.isArray(m.attachments)) {
      attachments.push(...m.attachments.map((att: any) => ({
        name: att.fileName || att.name || "",
        url: att.url || att.fileUrl || "",
        type: (att.mimeType?.includes("image") ? "image" : "pdf") as AttachmentType,
        size: att.fileSize || att.size || undefined,
      })));
    }
    
    // Handle legacy structures
    if (Array.isArray(m.files)) {
      attachments.push(...m.files);
    }
    if (m.fileInfo) {
      attachments.push(m.fileInfo);
    }

    // Convert to Phase1AFileItem
    attachments.forEach((att, index) => {
      const ext = (att.name.split(".").pop() || "").toLowerCase();
      const dateLabel = m.createdAt
        ? new Date(m.createdAt).toLocaleDateString("vi-VN")
        : m.time;

      const base: Phase1AFileItem = {
        id: `${m.id}__${index}`,
        name: att.name,
        kind: "doc", // override below
        url: att.url,
        ext,
        sizeLabel: att.size,
        dateLabel,
        messageId: m.id,
      };

      if (isMediaAttachment(att.type)) {
        media.push({ ...base, kind: "image" });
      } else if (isDocAttachment(att.type)) {
        docs.push({ ...base, kind: "doc" });
      }
    });
  });

  return { mediaFiles: media, docFiles: docs };
}, [messageList]);
```

#### **B. When "Xem Tất Cả Tệp" Button Clicked (View All Modal)**

**Location:** `src/features/portal/workspace/InformationPanel.tsx:47-56`

```typescript
const { openModal } = useViewFilesStore();

const handleOpenAllFiles = () => {
  if (groupId && messages) {
    try {
      // Extract ALL files (both media and docs) from messages
      const allFiles = extractFilesFromMessages(messages as MessageDto[]);
      // Open modal with extracted files
      openModal(allFiles, groupId, selectedWorkTypeId);
    } catch (error) {
      console.error("Error opening View All Files modal:", error);
    }
  }
};
```

**Extraction function:** `src/utils/fileExtraction.ts:1-55`

```typescript
export function extractFilesFromMessages(
  messages: MessageDto[],
  type: ViewFileType = 'media'
): ExtractedFile[] {
  const files: ExtractedFile[] = [];

  messages.forEach((msg) => {
    msg.attachments?.forEach((att) => {
      const isMedia =
        att.contentType.startsWith('image/') ||
        att.contentType.startsWith('video/');

      // Only include files matching the requested type
      if ((type === 'media' && isMedia) || (type === 'docs' && !isMedia)) {
        files.push({
          id: att.fileId,
          name: att.fileName,
          url: `/api/files/${att.fileId}`,
          thumbnailUrl: att.thumbnailUrl,
          size: att.fileSize,
          contentType: att.contentType,
          uploadedAt: att.uploadedAt,
          senderId: msg.senderId,
          senderName: msg.senderName,
          messageId: msg.id,
          dimensions: att.dimensions,
          duration: att.duration,
        });
      }
    });
  });

  return files;
}
```

### 2. **File Fetching Timeline**

```
┌────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                            │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│  1. User selects group OR messages prop changes                │
│     ↓ WorkspaceView updates messages state                     │
│     ↓ passes to ConversationDetailPanel                        │
│     ↓ passes to InformationPanel                               │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│  2. InformationPanel renders with messages                     │
│     ↓ FileManagerPhase1A useMemo triggers                      │
│     ↓ files extracted from message.attachments array           │
│     ↓ mediaFiles & docFiles computed                           │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│  3. InformationPanel displays:                                 │
│     • 6 media items (grid)                                    │
│     • 3 document items (list)                                 │
│     • "Xem Tất Cả Tệp" button                                 │
└────────────────────────────────────────────────────────────────┘
            │
            ├─────────────────────────────────────┐
            │                                     │
            ▼                                     ▼
   ┌─────────────────┐           ┌────────────────────────┐
   │ User clicks on  │           │ User clicks "Xem      │
   │ media/doc file  │           │ Tất Cả Tệp" button    │
   │ → opens preview │           │                        │
   │   modal         │           ▼                        │
   └─────────────────┘   ┌────────────────────────┐
                         │ extractAllFilesFromMsg │
                         │ (extract ALL files)    │
                         │                        │
                         ▼                        │
                    ┌─────────────┐              │
                    │ openModal() │ ◄────────────┘
                    │ store call  │
                    └─────────────┘
                         │
                         ▼
                 ┌─────────────────────┐
                 │ ViewAllFilesModal   │
                 │ displays all files  │
                 │ with filters        │
                 └─────────────────────┘
```

### 3. **File Extraction Triggers (useMemo dependencies)**

| Trigger | Component | Dependency | Result |
|---------|-----------|-----------|--------|
| **Messages change** | FileManagerPhase1A | `[messageList]` | Files re-extracted |
| **Group changes** | FileManagerPhase1A | `[groupId]` | Filter messages by group (if needed) |
| **"View All" clicked** | InformationPanel | Manual call | All files extracted for modal |
| **Work type changes** | FileManagerPhase1A | `[selectedWorkTypeId]` | (Stored but not used in extraction) |

---

## 🔍 File Display Logic

### 1. **Media Files (Ảnh/Video) - Grid Display**

```typescript
// Display 6 most recent media files
const allFiles = mode === "media" ? mediaFiles : docFiles;
const limit = mode === "media" ? 6 : 3;  // 6 media / 3 docs
const visible = allFiles.slice(0, limit);  // First N items
```

**Grid Rendering:**
- Each media item rendered as 4:3 aspect ratio tile
- Shows thumbnail if image
- Shows play button icon if video
- Hover effects: darker overlay + "Xem tin nhắn gốc" button

### 2. **Document Files (Tài liệu) - List Display**

```typescript
// Display 3 most recent docs
const renderDocRow = (f: Phase1AFileItem) => (
  <div className="flex items-center justify-between">
    {/* Doc icon based on extension */}
    {getDocIcon(f.ext)}
    {/* File name, size, date */}
    {/* Actions: preview, source message */}
  </div>
);
```

**Doc Icons:**
- `.xlsx/.xls` → 📊 Spreadsheet (emerald)
- `.doc/.docx` → 📄 Word (sky)
- `.pdf` → 📄 PDF (rose)
- Others → 📄 Default (gray)

### 3. **File Sorting**

Files displayed in **reverse order** (newest first):
```typescript
const allFiles = mode === "media" ? mediaFiles : docFiles;
const visible = allFiles.slice(0, limit);  // First N = most recent
```

---

## 📋 Message Processing Flow

### Step-by-Step Message Processing

```
1. MESSAGE RECEIVED
   ├─ Has message.attachments array?
   │  ├─ YES → Extract each attachment
   │  │        - Map fileName/name → file name
   │  │        - Map url/fileUrl → file URL
   │  │        - Detect type from mimeType
   │  │        - Map fileSize/size → size label
   │  │
   │  └─ NO → Check legacy structures
   │           ├─ message.files array?
   │           └─ message.fileInfo object?
   │
   2. EXTRACT FILE METADATA
      ├─ Generate unique ID: ${messageId}__${index}
      ├─ Extract file extension from name
      ├─ Format date from createdAt
      └─ Determine kind: image | doc
      
   3. CATEGORIZE FILE
      ├─ mimeType.includes("image")?
      │  └─ Add to mediaFiles
      └─ Otherwise
         └─ Add to docFiles
   
   4. DISPLAY IN UI
      ├─ Media: Show in grid (6 max)
      ├─ Docs: Show in list (3 max)
      └─ Show "Xem Tất Cả" button
```

---

## 🎯 Key Components & Their Roles

| Component | Location | Responsibility |
|-----------|----------|-----------------|
| **WorkspaceView** | `workspace/WorkspaceView.tsx` | Passes messages prop to ConversationDetailPanel |
| **ConversationDetailPanel** | `workspace/ConversationDetailPanel.tsx` | Routes messages to InformationPanel (info tab) or Tasks (order tab) |
| **InformationPanel** | `workspace/InformationPanel.tsx` | Main component: manages file sections, handles "View All Files" |
| **FileManagerPhase1A** | `components/FileManagerPhase1A.tsx` | Extracts & displays files (media grid + docs list) |
| **ViewAllFilesModal** | (from store) | Modal overlay with comprehensive file browser |
| **fileExtraction.ts** | `utils/fileExtraction.ts` | Utility functions to extract files from messages |
| **viewFilesStore** | `stores/viewFilesStore.ts` | State management for modal visibility & file data |

---

## 💾 State Management

### InformationPanel State
```typescript
const { openModal } = useViewFilesStore();  // Controls modal visibility
```

### FileManagerPhase1A State
```typescript
const [previewFile, setPreviewFile] = useState<Phase1AFileItem | null>(null);
const [showAll, setShowAll] = useState(false);
const [senderFilter, setSenderFilter] = useState<string>("all");
const [datePreset, setDatePreset] = useState<string>("all");
const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
```

### Zustand Store (viewFilesStore)
```typescript
interface ViewFilesStore {
  files: ExtractedFile[];           // All extracted files
  isOpen: boolean;                  // Modal visibility
  groupId?: string;
  selectedWorkTypeId?: string;
  openModal: (files, groupId, workTypeId?) => void;
  closeModal: () => void;
}
```

---

## 🚀 Performance Considerations

### Memoization Strategy
- **useMemo for message processing**: Prevents re-extraction on every render
- **Dependency arrays**: Only re-compute when `messages` or `groupId` changes
- **Limited display**: Only show first 6/3 files (rest in modal)

### File URL Handling
```typescript
// Files are displayed directly from URLs in message.attachments
// OR converted to API path: `/api/files/${att.fileId}`

url: att.url || att.fileUrl || "",  // Use provided URL
// OR
url: `/api/files/${att.fileId}`,    // Convert to API path
```

---

## 📌 Important Notes

### Message Sources
1. **From WorkspaceView props**: `messages` state is passed down through component hierarchy
2. **Real API data** (not mock): Messages contain actual attachments from API responses

### File Attachment Support
- ✅ Images (jpg, png, etc.)
- ✅ Videos
- ✅ Documents (pdf, xlsx, docx, etc.)
- ✅ Mixed types in single message

### Legacy Support
The component supports multiple message structures:
- API format: `message.attachments` (PRIMARY)
- Legacy format 1: `message.files` (FALLBACK)
- Legacy format 2: `message.fileInfo` (FALLBACK)

### Limitations
- ⚠️ Files only extracted from message attachments (not from linked tasks)
- ⚠️ File preview is modal-based (not inline)
- ⚠️ No server-side filtering (all filtering client-side)

---

## 🔗 Related Files

```
src/
├── features/portal/
│   ├── workspace/
│   │   ├── WorkspaceView.tsx           # Top-level, passes messages
│   │   ├── ConversationDetailPanel.tsx # Routes to InformationPanel
│   │   ├── InformationPanel.tsx        # Main orchestrator
│   │   └── ChatMessagePanel.tsx        # Chat display
│   │
│   ├── components/
│   │   ├── FileManagerPhase1A.tsx      # File extraction & display
│   │   └── ViewAllFilesModal.tsx       # (via store)
│   │
│   └── types/
│       └── index.ts                    # Message, FileAttachment types
│
├── stores/
│   └── viewFilesStore.ts               # Modal state management
│
├── utils/
│   └── fileExtraction.ts               # File extraction utilities
│
└── types/
    └── files.ts                        # MessageDto, ExtractedFile types
```

---

## 📞 Summary

**How messages work:**
1. Messages flow from `WorkspaceView` → `ConversationDetailPanel` → `InformationPanel`
2. Each message contains an `attachments` array (or legacy `files`/`fileInfo`)
3. Files are extracted from attachments on-demand using React.useMemo

**When files are fetched:**
1. **Automatically**: When component renders with new messages (via useMemo dependency)
2. **On-demand**: When user clicks "Xem Tất Cả Tệp" button (manual extraction + modal)
3. **Latest first**: Files are displayed newest first, with limits (6 media / 3 docs)

**File display:**
- Media files: Grid view with 6 items max
- Documents: List view with 3 items max
- Full view: "View All Files" modal with filters (sender, date range)
