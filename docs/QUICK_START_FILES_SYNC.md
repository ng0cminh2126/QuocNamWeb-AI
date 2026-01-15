# Quick Start: Auto-Sync Files from API Messages

## TL;DR - Copy-Paste Solution

Add **ONE LINE** to any component that receives messages from API:

```tsx
import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";

export const MyComponent = ({ messages, groupId, selectedWorkTypeId }) => {
  // ✨ That's it! Files auto-sync to store
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
  
  return <div>{/* your UI */}</div>;
};
```

## What This Does

- 📥 **Listens** for message changes from API
- 🔍 **Extracts** all files from message attachments
- 📂 **Categorizes** files (images, videos, PDFs, Word, Excel, etc.)
- 💾 **Stores** in Zustand store
- 🎯 **Auto-Updates** when messages change

## API Endpoints It Watches

```
GET /api/conversations/{conversationId}/messages
GET /api/groups/{groupId}/messages
```

## Where to Add It

### Option 1: InformationPanel (Recommended)
```tsx
export const InformationPanel = ({ messages, groupId, selectedWorkTypeId }) => {
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
  // ... rest of component
};
```

### Option 2: ConversationDetailPanel
```tsx
export const ConversationDetailPanel = ({ messages, groupId, selectedWorkTypeId }) => {
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
  // ... rest of component
};
```

### Option 3: ChatMessagePanel
```tsx
export const ChatMessagePanel = ({ messages, groupId, selectedWorkTypeId }) => {
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
  // ... rest of component
};
```

## How Files Appear

Once synced, the `ViewAllFilesModal` automatically displays:

- ✅ All files from all messages
- ✅ Grouped by type (images, docs, etc.)
- ✅ Sortable (newest, name, size)
- ✅ Filterable by type
- ✅ Searchable
- ✅ Paginated (50 per page)

## File Types Auto-Detected

| Type | Extensions | Icon |
|------|-----------|------|
| Images | jpg, png, gif, etc. | 📷 |
| Videos | mp4, avi, mov, etc. | 🎥 |
| PDF | .pdf | 📄 |
| Word | .docx, .doc | 📝 |
| Excel | .xlsx, .xls | 📊 |
| PowerPoint | .pptx, .ppt | 🎪 |
| Other | all others | 📎 |

## Example: Full Component

```tsx
import React from "react";
import { useSyncMessagesToFileStore } from "@/stores/viewFilesStore";
import { ViewAllFilesModal } from "@/components/files";

export const InformationPanel = ({
  messages = [],
  groupId,
  selectedWorkTypeId,
}) => {
  // ✨ ONE LINE - auto-sync files
  useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);

  return (
    <div>
      {/* Your existing UI */}
      
      {/* Modal auto-shows all extracted files */}
      <ViewAllFilesModal isOpen={undefined} displayedFiles={undefined} />
    </div>
  );
};
```

## No Installation Needed

- ✅ Already implemented
- ✅ Works with existing API
- ✅ Zero configuration
- ✅ Type-safe (TypeScript)

## Testing It

1. Open DevTools Console
2. Paste this:
```javascript
import { useViewFilesStore } from '@/stores/viewFilesStore';
const state = useViewFilesStore.getState();
console.log('Files in store:', state.allFiles);
```
3. Should show all extracted files!

## Troubleshooting

**Files not showing?**
- Check messages have `attachments` array
- Check `extractAllFilesFromMessages()` is called
- Check console for errors

**Modal not opening?**
- Click "Xem Tất Cả Tệp" button
- Should open modal with all files

**Still stuck?**
- See detailed guide: [VIEW_FILES_STORE_INTEGRATION.md](../guides/VIEW_FILES_STORE_INTEGRATION.md)

## That's It! 🎉

Your files will automatically sync from API messages now.

Questions? Check the docs in `docs/guides/` and `docs/analysis/`.
