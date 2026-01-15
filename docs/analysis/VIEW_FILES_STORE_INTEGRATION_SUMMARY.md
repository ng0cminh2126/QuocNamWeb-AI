# View Files Store - API Integration Summary

## What Was Done

I've enhanced the `viewFilesStore` to automatically sync files from API messages whenever these endpoints are called:

- `GET /api/conversations/{conversationId}/messages`
- `GET /api/groups/{groupId}/messages`

---

## Changes Made

### 1. **Updated `viewFilesStore.ts`**

Added three key features:

#### A. New Store Action: `updateFilesFromMessages()`

```typescript
updateFilesFromMessages: (
  messages: MessageDto[],
  groupId: string,
  workTypeId?: string
) => {
  // Extracts all files from messages
  // Applies filters & sorting
  // Updates store state
  // Handles errors gracefully
}
```

#### B. New Hook: `useSyncMessagesToFileStore()`

```typescript
useSyncMessagesToFileStore(
  messages,     // Array of messages from API
  groupId,      // Current group/conversation ID
  workTypeId    // Optional work type ID
)
```

This hook:
- Watches for message changes
- Automatically calls `updateFilesFromMessages()`
- Updates file store whenever API returns new messages
- Handles cleanup on unmount

#### C. New Imports

- Added `React` for `useEffect` in the hook
- Imported `extractAllFilesFromMessages` from utilities
- Imported `MessageDto` type from `/types/files`

---

## How to Use

### Quick Integration (3 lines of code)

In any component that receives messages from API:

```tsx
import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";

export const MyComponent = ({ messages, groupId, selectedWorkTypeId }) => {
  // ✅ One line - automatically syncs files to store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
  
  // Rest of component...
};
```

### Data Flow

```
API Response (/api/groups/{groupId}/messages)
        ↓
    Messages Array
        ↓
  Component receives as prop
        ↓
useSyncMessagesToFileStore() hook detects change
        ↓
Calls store.updateFilesFromMessages()
        ↓
Files extracted from message.attachments
        ↓
Files categorized by type
        ↓
Filters & sorting applied
        ↓
Store state updated
        ↓
ViewAllFilesModal displays all files
```

---

## Store Actions Available

| Action | Purpose |
|--------|---------|
| `updateFilesFromMessages()` | Auto-extract files from messages ✨ **NEW** |
| `openModal()` | Open modal with specific files |
| `closeModal()` | Close modal |
| `updateFiles()` | Manually update with extracted files |
| `setFilters()` | Change file type filters |
| `setSortBy()` | Change sort order |
| `setSearchQuery()` | Search files by name |
| `goToPage()` | Navigate to page |

---

## Store Selectors (Hooks)

| Selector | Returns |
|----------|---------|
| `usePaginationInfo()` | Page info (current page, total, hasNext, etc.) |
| `useFilterCounts()` | File count by type (images: 5, videos: 2, etc.) |

---

## File Types Supported

Automatically detected and categorized:

- 📷 **Images** - jpg, png, gif, etc.
- 🎥 **Videos** - mp4, avi, mov, etc.
- 📄 **PDF** - application/pdf
- 📝 **Word** - docx, doc
- 📊 **Excel** - xlsx, xls
- 🎪 **PowerPoint** - pptx, ppt
- 📎 **Other** - any other file type

---

## Example: Complete Integration

```tsx
// src/features/portal/workspace/InformationPanel.tsx

import React from "react";
import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";
import { ViewAllFilesModal } from "@/components/files";
import { FileManagerPhase1A } from "../components/FileManagerPhase1A";

export const InformationPanel: React.FC<InformationPanelProps> = ({
  groupId,
  messages = [],
  selectedWorkTypeId,
  // ... other props
}) => {
  // ✅ STEP 1: Auto-sync messages to file store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);

  return (
    <div className="space-y-4 min-h-0">
      {/* STEP 2: Display media files grid */}
      <FileManagerPhase1A
        mode="media"
        groupId={groupId}
        messages={messages}
      />

      {/* STEP 3: Display documents list */}
      <FileManagerPhase1A
        mode="docs"
        groupId={groupId}
        messages={messages}
      />

      {/* STEP 4: Modal with all files (reads from store) */}
      <ViewAllFilesModal isOpen={undefined} displayedFiles={undefined} />
    </div>
  );
};
```

---

## API Endpoints Supported

### Conversations
```
GET /api/conversations/{conversationId}/messages
```

Response structure:
```json
{
  "items": [
    {
      "id": "msg_123",
      "attachments": [
        {
          "fileId": "file_123",
          "fileName": "report.pdf",
          "contentType": "application/pdf",
          "fileSize": 1024,
          "uploadedAt": "2024-01-12T10:00:00Z"
        }
      ]
    }
  ]
}
```

### Groups
```
GET /api/groups/{groupId}/messages
```

Same structure as conversations.

---

## Error Handling

Errors are caught and stored in the store:

```typescript
const { error } = useViewFilesStore();

if (error) {
  console.error('File sync error:', error);
  // Show error UI to user
}
```

---

## Performance Features

✅ **Memoization** - Files only re-extracted when messages change  
✅ **Lazy Loading** - Pagination (50 items/page)  
✅ **Client-side Filtering** - No need for additional API calls  
✅ **Efficient Sorting** - Already sorted on store  

---

## Files Modified

1. **src/stores/viewFilesStore.ts**
   - Added `updateFilesFromMessages()` action
   - Added `useSyncMessagesToFileStore()` hook
   - Added imports for utilities and types

2. **Documentation Created**
   - `docs/guides/VIEW_FILES_STORE_INTEGRATION.md` - Detailed integration guide

---

## Next Steps

1. **Add hook to InformationPanel**
   ```tsx
   useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
   ```

2. **Test with real API messages**
   - Load a conversation
   - Verify files appear in modal
   - Test filtering/sorting

3. **Optional: Add in other components**
   - ConversationDetailPanel
   - ChatMessagePanel
   - Any other component receiving messages

---

## Testing

### Manual Test
1. Navigate to any conversation
2. Verify messages load
3. Click "Xem Tất Cả Tệp" button
4. Modal should show all files from messages
5. Test filters, sort, search

### Browser DevTools
```javascript
// Check store state in console
import { useViewFilesStore } from '@/stores/viewFilesStore';
const state = useViewFilesStore.getState();
console.log('All files:', state.allFiles);
console.log('Filtered files:', state.filteredFiles);
```

---

## Key Benefits

🎯 **Zero Configuration** - Works automatically with message changes  
🔄 **Real-time Sync** - Files update whenever messages change  
⚡ **Performance** - Memoized extraction, client-side filtering  
🛡️ **Type Safe** - Full TypeScript support  
🎨 **UI Ready** - Modal, filters, sorting, pagination all included  

---

## Questions?

Refer to:
- 📖 [Detailed Integration Guide](../guides/VIEW_FILES_STORE_INTEGRATION.md)
- 💾 [Store Code](../../src/stores/viewFilesStore.ts)
- 🔧 [File Extraction Utils](../../src/utils/fileExtraction.ts)
- 📋 [Types](../../src/types/files.ts)
