# View Files Store Integration Guide

## Overview

The `viewFilesStore` automatically syncs files extracted from messages when your application calls the following API endpoints:

- `GET /api/conversations/{conversationId}/messages`
- `GET /api/groups/{groupId}/messages`

This guide explains how to integrate the store with your message fetching logic.

---

## Architecture

```
API Call
  ↓
Messages Fetched
  ↓
useMessages() hook (TanStack Query)
  ↓
Component receives messages prop
  ↓
useSyncMessagesToFileStore() hook
  ↓
viewFilesStore.updateFilesFromMessages()
  ↓
Files extracted & stored
  ↓
ViewAllFilesModal displays all files
```

---

## Integration Steps

### Step 1: Update InformationPanel (or similar)

Add the `useSyncMessagesToFileStore` hook to automatically sync messages:

```tsx
// src/features/portal/workspace/InformationPanel.tsx

import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";

export const InformationPanel: React.FC<InformationPanelProps> = ({
  groupId,
  selectedWorkTypeId,
  messages = [],
  // ... other props
}) => {
  // Auto-sync messages to file store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);

  // ... rest of component
};
```

### Step 2: Update ConversationDetailPanel (if using messages there)

```tsx
// src/features/portal/workspace/ConversationDetailPanel.tsx

import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";

export const ConversationDetailPanel: React.FC<...> = ({
  messages,
  groupId,
  selectedWorkTypeId,
  // ... other props
}) => {
  // Auto-sync messages to file store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);

  // ... rest of component
};
```

### Step 3: Or use in ChatMessagePanel directly

```tsx
// src/features/portal/workspace/ChatMessagePanel.tsx

import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";

export const ChatMessagePanel: React.FC<...> = ({
  messages,
  groupId,
  selectedWorkTypeId,
  // ... other props
}) => {
  // Auto-sync messages to file store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);

  // ... rest of component
};
```

---

## How It Works

### Automatic Syncing

The `useSyncMessagesToFileStore` hook watches for changes to:
- `messages` array
- `groupId`
- `workTypeId`

When any of these change, it automatically calls `updateFilesFromMessages()` which:

1. **Extracts files** from message attachments using `extractAllFilesFromMessages()`
2. **Categorizes files** by type (images, videos, PDFs, Word, Excel, PowerPoint, other)
3. **Applies filters** based on current filter state
4. **Updates pagination** and display
5. **Sets context** (groupId, workTypeId) for reference

### Data Flow

```typescript
// Input: Messages from API
const messages = [
  {
    id: "msg_1",
    attachments: [
      {
        fileId: "file_123",
        fileName: "report.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        uploadedAt: "2024-01-12T10:00:00Z",
      }
    ]
  },
  // ... more messages
];

// Hook call
useSyncMessagesToFileStore(messages, "grp_123", "wt_nhan_hang");

// Store automatically:
// 1. Extracts files: [{ id: "file_123", name: "report.pdf", ... }]
// 2. Filters by type
// 3. Applies current filters/sort
// 4. Populates displayedFiles for ViewAllFilesModal
```

---

## Store Actions

### Manual Methods (if needed)

#### `updateFilesFromMessages(messages, groupId, workTypeId?)`

Manually update store with messages (called automatically by hook):

```typescript
import { useViewFilesStore } from "@/stores/viewFilesStore";

const component = () => {
  const updateFilesFromMessages = useViewFilesStore(
    (state) => state.updateFilesFromMessages
  );

  // When you get messages from API
  updateFilesFromMessages(messages, groupId, workTypeId);
};
```

#### `updateFiles(files)`

Update with pre-extracted files:

```typescript
const updateFiles = useViewFilesStore((state) => state.updateFiles);
updateFiles(extractedFiles);
```

#### `openModal(files, groupId, workTypeId?)`

Open modal with specific files:

```typescript
const openModal = useViewFilesStore((state) => state.openModal);
openModal(files, groupId, workTypeId);
```

---

## ViewAllFilesModal Component

The modal automatically displays files from the store:

```tsx
// src/features/portal/workspace/InformationPanel.tsx

import { ViewAllFilesModal } from "@/components/files";

export const InformationPanel = () => {
  // Modal reads from store automatically
  return (
    <>
      {/* Other content */}
      <ViewAllFilesModal isOpen={undefined} displayedFiles={undefined} />
    </>
  );
};
```

When `isOpen` and `displayedFiles` are `undefined`, the modal uses the store's state:
- `isModalOpen` for visibility
- `displayedFiles` for file list
- `filters`, `sortBy`, etc. for display logic

---

## File Extraction Details

### Supported File Types

The system automatically detects and categorizes:

| Type | Detection | Filter |
|------|-----------|--------|
| **Images** | `contentType.startsWith('image/')` | images |
| **Videos** | `contentType.startsWith('video/')` | videos |
| **PDF** | `contentType.includes('pdf')` | pdf |
| **Word** | `contentType.includes('word/msword')` | word |
| **Excel** | `contentType.includes('excel')` | excel |
| **PowerPoint** | `contentType.includes('powerpoint')` | powerpoint |
| **Other** | All others | other |

### Extracted File Structure

Each file is converted to `ExtractedFile`:

```typescript
{
  id: string;              // Unique file ID
  name: string;            // File name
  url: string;             // Access URL
  thumbnailUrl?: string;   // Thumbnail for media
  size: number;            // File size in bytes
  contentType: string;     // MIME type
  uploadedAt: string;      // ISO timestamp
  senderId: string;        // Who uploaded it
  senderName: string;      // Sender's name
  messageId: string;       // Source message ID
  dimensions?: {           // For images/videos
    width: number;
    height: number;
  };
  duration?: number;       // For videos (seconds)
}
```

---

## Display Features

### Filter Counts

The store provides `useFilterCounts()` hook to show file counts by type:

```tsx
import { useFilterCounts } from "@/stores/viewFilesStore";

export const FileFilters = () => {
  const counts = useFilterCounts();
  
  return (
    <div>
      <label>
        <input type="checkbox" />
        Images ({counts.images})
      </label>
      <label>
        <input type="checkbox" />
        Videos ({counts.videos})
      </label>
      {/* ... etc */}
    </div>
  );
};
```

### Pagination Info

Get pagination details:

```tsx
import { usePaginationInfo } from "@/stores/viewFilesStore";

export const FilePagination = () => {
  const paginationInfo = usePaginationInfo();
  
  return (
    <div>
      Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
      ({paginationInfo.totalFiles} files total)
    </div>
  );
};
```

---

## Filtering & Sorting

### Built-in Filters

```typescript
// Toggle filter type
const setFilters = useViewFilesStore((state) => state.setFilters);

setFilters({
  images: true,
  videos: false,
  pdf: true,
  word: true,
  excel: true,
  powerpoint: false,
  other: false,
});

// Reset to defaults
const resetFilters = useViewFilesStore((state) => state.resetFilters);
resetFilters();
```

### Sorting Options

```typescript
const setSortBy = useViewFilesStore((state) => state.setSortBy);

setSortBy('newest');      // Newest first (default)
setSortBy('oldest');      // Oldest first
setSortBy('name-asc');    // A-Z
setSortBy('size-desc');   // Largest first
setSortBy('size-asc');    // Smallest first
```

### Search

```typescript
const setSearchQuery = useViewFilesStore((state) => state.setSearchQuery);
setSearchQuery('report');

// Clear search
const clearSearch = useViewFilesStore((state) => state.clearSearch);
clearSearch();
```

---

## Error Handling

The store includes error handling:

```typescript
const { error, setError } = useViewFilesStore();

// Error is set if file extraction fails
if (error) {
  console.error('File extraction error:', error);
}

// Clear error
setError(null);
```

---

## Complete Example

Here's a complete integration example:

```tsx
// src/features/portal/workspace/InformationPanel.tsx

import React from "react";
import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";
import { ViewAllFilesModal } from "@/components/files";
import { FileManagerPhase1A } from "../components/FileManagerPhase1A";

interface InformationPanelProps {
  groupId?: string;
  groupName?: string;
  messages?: any[];
  selectedWorkTypeId?: string;
  // ... other props
}

export const InformationPanel: React.FC<InformationPanelProps> = ({
  groupId,
  groupName,
  messages = [],
  selectedWorkTypeId,
  // ... other props
}) => {
  // ✅ Auto-sync messages to file store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);

  return (
    <div className="space-y-4 min-h-0">
      {/* Group Info */}
      <div className="rounded-xl border p-6">
        <div className="text-sm font-semibold">{groupName}</div>
      </div>

      {/* Media Files Grid */}
      <div>
        <FileManagerPhase1A
          mode="media"
          groupId={groupId}
          messages={messages}
        />
      </div>

      {/* View All Files Button */}
      <div>
        <button onClick={() => {/* open modal */}}>
          View All Files
        </button>
      </div>

      {/* Document Files List */}
      <div>
        <FileManagerPhase1A
          mode="docs"
          groupId={groupId}
          messages={messages}
        />
      </div>

      {/* Modal - reads from store automatically */}
      <ViewAllFilesModal isOpen={undefined} displayedFiles={undefined} />
    </div>
  );
};
```

---

## Testing

### Unit Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useViewFilesStore } from '@/stores/viewFilesStore';

describe('viewFilesStore', () => {
  it('should update files from messages', () => {
    const { result } = renderHook(() => useViewFilesStore());
    
    const messages = [
      {
        id: 'msg_1',
        attachments: [{
          fileId: 'file_1',
          fileName: 'test.pdf',
          contentType: 'application/pdf',
        }]
      }
    ];
    
    act(() => {
      result.current.updateFilesFromMessages(messages, 'grp_1', 'wt_1');
    });
    
    expect(result.current.allFiles).toHaveLength(1);
    expect(result.current.allFiles[0].name).toBe('test.pdf');
  });
});
```

### E2E Testing

```typescript
// tests/chat/view-files-e2e.spec.ts
import { test, expect } from '@playwright/test';

test('should display files from messages in modal', async ({ page }) => {
  // Navigate to conversation
  await page.goto('/chat/conversation/grp_1');
  
  // Wait for messages to load
  await page.waitForSelector('[data-testid="message-bubble"]');
  
  // Open view all files
  await page.click('[data-testid="view-all-files-button"]');
  
  // Modal should show extracted files
  const modal = page.locator('[data-testid="chat-view-all-files-modal"]');
  await expect(modal).toBeVisible();
  
  // Files should be displayed
  const files = page.locator('[data-testid^="file-item-"]');
  await expect(files).toHaveCount(expect.any(Number));
});
```

---

## Migration Checklist

- [ ] Add `useSyncMessagesToFileStore` to InformationPanel
- [ ] Test file extraction with real API responses
- [ ] Verify ViewAllFilesModal displays correctly
- [ ] Test filtering/sorting functionality
- [ ] Test pagination
- [ ] Verify performance with large message sets
- [ ] Add error handling UI
- [ ] Update tests

---

## Troubleshooting

### Files not appearing in modal

1. Check that messages have `attachments` array
2. Verify `extractAllFilesFromMessages()` is called
3. Check browser console for extraction errors
4. Verify store state in React DevTools

### Modal not opening

1. Ensure `openModal()` is called with files
2. Check that `isModalOpen` state is true
3. Verify ViewAllFilesModal is rendered

### Filtering not working

1. Check that `filters` state is updated
2. Verify file types are correctly categorized
3. Check that `applyFilters()` function is working

---

## References

- Store: [src/stores/viewFilesStore.ts](../../../src/stores/viewFilesStore.ts)
- Utilities: [src/utils/fileExtraction.ts](../../../src/utils/fileExtraction.ts)
- Types: [src/types/files.ts](../../../src/types/files.ts)
- Component: [src/components/files/ViewAllFilesModal.tsx](../../../src/components/files/ViewAllFilesModal.tsx)
