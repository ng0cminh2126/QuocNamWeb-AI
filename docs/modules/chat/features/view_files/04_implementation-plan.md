# [BƯỚC 4] View All Files - Implementation Plan

**Module:** Chat  
**Feature:** View All Files  
**Phase:** Implementation Strategy & Code Structure  
**Created:** 2025-01-09  
**Approved By:** Khoa  
**Approval Date:** 09/01/2026

---

## 🎯 Implementation Strategy

This section outlines the complete code structure, components, hooks, utilities, and state management needed to implement the View All Files feature.

### Locked Design Decisions Reference

| Decision | Value |
|----------|-------|
| Pagination size | 50 items per page |
| Modal behavior | Modal dialog |
| Default sort | Newest first |
| Sender info | Only for documents |
| Bulk download | Disabled |
| Filter position | Top bar |

---

## 📁 Folder Structure

```
src/
├── features/
│   └── portal/
│       └── workspace/
│           ├── InformationPanel.tsx          [MODIFY] Add button
│           └── ViewAllFilesModal.tsx         [CREATE NEW]
│
├── components/
│   ├── ui/
│   │   └── [existing components - reuse]
│   │
│   └── files/                                 [CREATE NEW]
│       ├── FileGrid.tsx                      [CREATE] Image/video grid
│       ├── FileList.tsx                      [CREATE] Document list
│       ├── FileCard.tsx                      [CREATE] Single file grid item
│       ├── FileListItem.tsx                  [CREATE] Single file list item
│       ├── FileSearchBar.tsx                 [CREATE] Search input
│       ├── FileFilters.tsx                   [CREATE] Filter controls
│       ├── FileSortDropdown.tsx              [CREATE] Sort selector
│       ├── FilePagination.tsx                [CREATE] Pagination controls
│       └── FilePreviewOverlay.tsx            [CREATE or REUSE] Preview modal
│
├── hooks/
│   ├── queries/
│   │   └── useConversationFiles.ts           [CREATE] Fetch & extract files
│   │
│   └── mutations/
│       └── useDownloadFile.ts                [CREATE] Download handler
│
├── stores/
│   └── viewFilesStore.ts                     [CREATE] Modal state management
│
├── types/
│   ├── files.ts                              [CREATE] File-related types
│   └── api.ts                                [UPDATE] Message/attachment DTOs
│
├── utils/
│   ├── fileExtraction.ts                     [CREATE] Extract files from messages
│   ├── fileCategorization.ts                 [CREATE] Media vs docs logic
│   ├── fileFiltering.ts                      [CREATE] Search/filter logic
│   ├── fileSorting.ts                        [CREATE] Sort logic
│   ├── fileFormatting.ts                     [CREATE] Size/date formatting
│   └── fileIcons.ts                          [CREATE] Content-type → Icon mapping
│
└── test/
    ├── hooks/
    │   └── useConversationFiles.test.ts      [CREATE]
    │
    ├── utils/
    │   ├── fileExtraction.test.ts            [CREATE]
    │   ├── fileCategorization.test.ts        [CREATE]
    │   ├── fileSorting.test.ts               [CREATE]
    │   └── fileFormatting.test.ts            [CREATE]
    │
    └── components/
        ├── ViewAllFilesModal.test.ts         [CREATE]
        ├── FileGrid.test.ts                  [CREATE]
        └── FileFilters.test.ts               [CREATE]
```

---

## 🏗️ Component Architecture

### 1. ViewAllFilesModal (Main Container)

**File:** `src/features/portal/workspace/ViewAllFilesModal.tsx`

**Responsibilities:**
- Manage modal open/close state
- Orchestrate file fetching and caching
- Manage current filters, sort, search, pagination
- Pass data to child components

**Props:**
```typescript
interface ViewAllFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: 'media' | 'docs';     // Images or Documents tab
  conversationId: string;
  conversationName: string;
  groupName: string;
}
```

**Internal State (Zustand):**
```typescript
interface ViewFilesState {
  // Modal state
  isOpen: boolean;
  modalType: 'media' | 'docs';
  
  // Data
  files: ExtractedFile[];
  allFiles: ExtractedFile[];        // Full unfiltered list
  totalFiles: number;
  
  // Pagination
  currentPage: number;
  pageSize: number;                 // 50 (locked decision)
  hasMore: boolean;
  
  // Filters
  filters: FileFilters;
  
  // Sort
  sortBy: SortOption;               // 'newest' (locked default)
  
  // Search
  searchTerm: string;
  
  // Loading & errors
  isLoading: boolean;
  error: Error | null;
  
  // Preview
  previewFile: ExtractedFile | null;
  
  // Actions
  openModal: (type) => void;
  closeModal: () => void;
  setFilters: (filters) => void;
  setSortBy: (sort) => void;
  setSearchTerm: (term) => void;
  goToPage: (page) => void;
  setPreviewFile: (file) => void;
  setError: (error) => void;
  clearError: () => void;
}
```

**Render Structure:**
```tsx
return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-6xl max-h-[90vh]">
      {/* Header */}
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription />
        {/* Search bar on the right */}
      </DialogHeader>
      
      {/* Loading state */}
      {isLoading && <Skeleton />}
      
      {/* Error state */}
      {error && <ErrorBanner />}
      
      {/* Filter bar */}
      {!isLoading && <FileFilters />}
      
      {/* File grid or list */}
      {modalType === 'media' ? <FileGrid /> : <FileList />}
      
      {/* Pagination */}
      {!isLoading && <FilePagination />}
    </DialogContent>
  </Dialog>
);
```

---

### 2. FileGrid Component

**File:** `src/components/files/FileGrid.tsx`

**Responsibilities:**
- Display files in responsive grid layout
- Handle file clicks for preview
- Show loading skeleton
- Show empty state

**Props:**
```typescript
interface FileGridProps {
  files: ExtractedFile[];
  isLoading: boolean;
  onFileClick: (file: ExtractedFile) => void;
  emptyMessage?: string;
}
```

**Render:**
```tsx
return (
  <div className="grid grid-cols-5 gap-4 p-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
    {isLoading && Array(15).fill(0).map(() => <Skeleton />)}
    
    {!isLoading && files.length === 0 && <EmptyState />}
    
    {!isLoading && files.map(file => (
      <FileCard key={file.id} file={file} onClick={onFileClick} />
    ))}
  </div>
);
```

---

### 3. FileList Component

**File:** `src/components/files/FileList.tsx`

**Responsibilities:**
- Display documents in table/list format
- Show file metadata (name, size, date, sender for docs)
- Handle file clicks for preview

**Props:**
```typescript
interface FileListProps {
  files: ExtractedFile[];
  isLoading: boolean;
  onFileClick: (file: ExtractedFile) => void;
  emptyMessage?: string;
}
```

**Render:**
```tsx
return (
  <div className="p-4">
    {isLoading && Array(8).fill(0).map(() => <SkeletonRow />)}
    
    {!isLoading && files.length === 0 && <EmptyState />}
    
    {!isLoading && (
      <div className="space-y-1">
        {files.map(file => (
          <FileListItem 
            key={file.id} 
            file={file} 
            onClick={onFileClick}
          />
        ))}
      </div>
    )}
  </div>
);
```

---

### 4. FileCard Component

**File:** `src/components/files/FileCard.tsx`

**For media files (images/videos) in grid view**

```typescript
interface FileCardProps {
  file: ExtractedFile;
  onClick: (file: ExtractedFile) => void;
}

export function FileCard({ file, onClick }: FileCardProps) {
  return (
    <button
      onClick={() => onClick(file)}
      data-testid={`file-thumbnail-${file.id}`}
      className="relative aspect-square rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
    >
      {/* Image/Video thumbnail */}
      <img
        src={file.thumbnailUrl || '/placeholder.png'}
        alt={file.name}
        className="w-full h-full object-cover"
      />
      
      {/* Video play icon overlay */}
      {file.contentType.startsWith('video/') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <PlayIcon className="w-8 h-8 text-white" />
        </div>
      )}
      
      {/* File info overlay on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
        <p className="text-white text-sm truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-gray-300 text-xs">
          {formatFileSize(file.size)}
        </p>
      </div>
    </button>
  );
}
```

---

### 5. FileListItem Component

**File:** `src/components/files/FileListItem.tsx`

**For documents in list view**

```typescript
interface FileListItemProps {
  file: ExtractedFile;
  onClick: (file: ExtractedFile) => void;
}

export function FileListItem({ file, onClick }: FileListItemProps) {
  return (
    <button
      onClick={() => onClick(file)}
      data-testid={`file-list-item-${file.id}`}
      className="w-full px-4 py-3 hover:bg-gray-50 border-b flex items-center gap-3 text-left transition-colors"
    >
      {/* File icon */}
      <FileIcon type={file.contentType} className="w-5 h-5 flex-shrink-0" />
      
      {/* File name (50% width, truncate) */}
      <span 
        className="flex-1 text-sm font-medium text-gray-800 truncate"
        title={file.name}
      >
        {file.name}
      </span>
      
      {/* File size */}
      <span className="text-xs text-gray-500 flex-shrink-0">
        {formatFileSize(file.size)}
      </span>
      
      {/* Upload date */}
      <span className="text-xs text-gray-500 flex-shrink-0 w-32 text-right">
        {formatDate(file.uploadedAt)}
      </span>
      
      {/* Sender name (docs only) */}
      {!file.contentType.startsWith('image/') && !file.contentType.startsWith('video/') && (
        <span className="text-xs text-gray-600 flex-shrink-0 w-24">
          {file.senderName}
        </span>
      )}
    </button>
  );
}
```

---

### 6. FileSearchBar Component

**File:** `src/components/files/FileSearchBar.tsx`

```typescript
interface FileSearchBarProps {
  value: string;
  onChange: (term: string) => void;
  placeholder?: string;
}

export function FileSearchBar({ value, onChange, placeholder }: FileSearchBarProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Tìm kiếm tệp..."}
        data-testid="search-input"
        className="pl-9 pr-8 py-2 w-full border rounded-lg text-sm"
      />
      
      {value && (
        <button
          onClick={() => onChange('')}
          data-testid="clear-search-button"
          className="absolute right-2 top-2.5"
        >
          <XIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
```

---

### 7. FileFilters Component

**File:** `src/components/files/FileFilters.tsx`

```typescript
interface FileFiltersProps {
  filters: FileFilters;
  onChange: (filters: FileFilters) => void;
  fileType: 'media' | 'docs';
}

export function FileFilters({ filters, onChange, fileType }: FileFiltersProps) {
  const filterOptions = fileType === 'media'
    ? ['images', 'videos']
    : ['pdf', 'word', 'excel', 'powerpoint', 'other'];
  
  return (
    <div className="px-4 py-3 border-b flex gap-4 items-center flex-wrap">
      <span className="text-sm font-medium text-gray-700">Filters:</span>
      
      {filterOptions.map(option => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters[option]}
            onChange={(e) => onChange({
              ...filters,
              [option]: e.target.checked
            })}
            data-testid={`filter-type-${option}`}
            className="w-4 h-4"
          />
          <span className="text-sm capitalize">{option}</span>
        </label>
      ))}
      
      {/* Clear all button if any filter unchecked */}
      {Object.values(filters).some(v => !v) && (
        <button
          onClick={() => onChange(
            Object.fromEntries(
              Object.keys(filters).map(k => [k, true])
            )
          )}
          className="text-sm text-blue-600 hover:underline ml-auto"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
```

---

### 8. FileSortDropdown Component

**File:** `src/components/files/FileSortDropdown.tsx`

```typescript
interface FileSortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  fileType: 'media' | 'docs';
}

const MEDIA_SORTS = ['newest', 'oldest', 'name-asc', 'size-desc', 'size-asc'];
const DOCS_SORTS = ['newest', 'oldest', 'name-asc', 'size-desc'];

export function FileSortDropdown({ value, onChange, fileType }: FileSortDropdownProps) {
  const options = fileType === 'media' ? MEDIA_SORTS : DOCS_SORTS;
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      data-testid="sort-dropdown"
      className="px-3 py-2 border rounded-lg text-sm"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          Sắp xếp: {getSortLabel(opt)}
        </option>
      ))}
    </select>
  );
}
```

---

### 9. FilePagination Component

**File:** `src/components/files/FilePagination.tsx`

```typescript
interface FilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function FilePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: FilePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className="px-4 py-3 border-t flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {totalItems} files
      </span>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          data-testid="page-prev-button"
          className="px-3 py-1 border rounded text-sm disabled:opacity-50"
        >
          &lt; Prev
        </button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              data-testid={`page-${page}`}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === page ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {page}
            </button>
          );
        })}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          data-testid="page-next-button"
          className="px-3 py-1 border rounded text-sm disabled:opacity-50"
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}
```

---

## 🪝 Custom Hooks

### 1. useConversationFiles

**File:** `src/hooks/queries/useConversationFiles.ts`

**Purpose:** Fetch messages and extract files using TanStack Query

```typescript
interface UseConversationFilesOptions {
  limit?: number;  // Default: 50 (locked)
  workTypeId?: string;
}

export function useConversationFiles(
  conversationId: string,
  options: UseConversationFilesOptions = {}
) {
  const { limit = 50, workTypeId } = options;
  
  return useInfiniteQuery({
    queryKey: ['conversationFiles', conversationId, { limit, workTypeId }],
    
    queryFn: async ({ pageParam }) => {
      const response = await api.getMessages(conversationId, {
        limit,
        before: pageParam,
        workTypeId
      });
      
      // Extract files from messages
      const files = extractFilesFromMessages(response.data);
      
      return {
        files,
        hasMore: response.hasMore,
        nextCursor: response.oldestMessageId
      };
    },
    
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 10,    // 10 minutes
  });
}
```

**Usage:**
```typescript
const { data, isLoading, error, fetchNextPage, hasNextPage } = 
  useConversationFiles(conversationId);

const allFiles = data?.pages.flatMap(p => p.files) ?? [];
```

---

### 2. useDownloadFile

**File:** `src/hooks/mutations/useDownloadFile.ts`

```typescript
export function useDownloadFile() {
  return useMutation({
    mutationFn: async (fileId: string, fileName: string) => {
      const url = `/api/files/${fileId}`;
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      toast.error('Failed to download file');
    },
    onSuccess: () => {
      toast.success('Download started');
    }
  });
}
```

---

## 🛠️ Utility Functions

### 1. fileExtraction.ts

```typescript
export function extractFilesFromMessages(
  messages: MessageDto[],
  type: 'media' | 'docs' = 'media'
): ExtractedFile[] {
  const files: ExtractedFile[] = [];
  
  messages.forEach((msg) => {
    msg.attachments?.forEach((att) => {
      const isMedia = att.contentType.startsWith('image/') || 
                      att.contentType.startsWith('video/');
      
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
        });
      }
    });
  });
  
  return files;
}
```

### 2. fileSorting.ts

```typescript
export function sortFiles(
  files: ExtractedFile[],
  sortBy: SortOption,
  fileType: 'media' | 'docs'
): ExtractedFile[] {
  const sorted = [...files];
  
  switch(sortBy) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    
    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      );
    
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'size-desc':
      return sorted.sort((a, b) => b.size - a.size);
    
    case 'size-asc':
      return sorted.sort((a, b) => a.size - b.size);
    
    default:
      return sorted;
  }
}
```

### 3. fileFormatting.ts

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN');
}
```

### 4. fileIcons.ts

```typescript
export function getFileIcon(contentType: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    'application/pdf': <FileText className="text-red-600" />,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 
      <FileText className="text-blue-600" />,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      <BarChart3 className="text-green-600" />,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      <Presentation className="text-orange-600" />,
    'image/': <Image className="text-purple-600" />,
    'video/': <Video className="text-pink-600" />,
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (contentType.startsWith(key)) return icon;
  }
  
  return <Paperclip className="text-gray-600" />;
}
```

---

## 📝 Types

### types/files.ts

```typescript
export interface ExtractedFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  senderId: string;
  senderName: string;
  messageId: string;
}

export interface FileFilters {
  images: boolean;
  videos: boolean;
  pdf: boolean;
  word: boolean;
  excel: boolean;
  powerpoint: boolean;
  other: boolean;
}

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'size-desc'
  | 'size-asc';
```

---

## 📊 Implementation Checklist

### Phase 1: Setup & Infrastructure
- [ ] Create file structure & directories
- [ ] Define TypeScript types
- [ ] Setup Zustand store for modal state
- [ ] Create utility functions (sorting, formatting, extraction)

### Phase 2: Components - Core
- [ ] Create ViewAllFilesModal (main container)
- [ ] Create FileGrid (media display)
- [ ] Create FileList (document display)
- [ ] Create FileCard (grid item)
- [ ] Create FileListItem (list item)

### Phase 3: Components - Controls
- [ ] Create FileSearchBar
- [ ] Create FileFilters
- [ ] Create FileSortDropdown
- [ ] Create FilePagination

### Phase 4: Hooks & Integration
- [ ] Create useConversationFiles hook
- [ ] Create useDownloadFile hook
- [ ] Integrate with TanStack Query
- [ ] Setup error handling & retry logic

### Phase 5: UI Integration
- [ ] Modify InformationPanel to add buttons
- [ ] Add button to "Ảnh / Video" section
- [ ] Add button to "Tài liệu" section
- [ ] Connect buttons to modal open/close

### Phase 6: Testing
- [ ] Unit tests for utilities (sorting, formatting)
- [ ] Component tests (FileGrid, FileList, filters)
- [ ] Hook tests (useConversationFiles)
- [ ] Integration tests (full user flow)
- [ ] E2E tests with Playwright

### Phase 7: Polish
- [ ] Add loading states & skeletons
- [ ] Add error boundaries
- [ ] Accessibility review (ARIA, keyboard nav)
- [ ] Performance optimization
- [ ] Documentation & storybook

---

## 🧪 Testing Strategy

### Unit Tests

**fileExtraction.test.ts**
- Test extracting media files
- Test extracting document files
- Test mixed file extraction
- Test empty attachments

**fileSorting.test.ts**
- Test sort by newest
- Test sort by oldest
- Test sort by name
- Test sort by size

**fileFormatting.test.ts**
- Test formatFileSize (bytes → MB)
- Test formatDate with locale
- Test edge cases (0 bytes, very large)

### Component Tests

**FileGrid.test.ts**
- Test grid renders files
- Test grid responds to clicks
- Test loading skeleton
- Test empty state

**FileFilters.test.ts**
- Test filter checkboxes toggle
- Test onChange callback
- Test "clear all" button

**FilePagination.test.ts**
- Test pagination buttons
- Test disabled states
- Test page change callback

### Integration Tests

**ViewAllFilesModal.test.ts**
- Test modal opens/closes
- Test fetching files
- Test search filters files
- Test sort reorders files
- Test pagination loads next page
- Test file click opens preview

### E2E Tests (Playwright)

**view-all-files-e2e.spec.ts**
- Happy path: Open → Search → Filter → Sort → Paginate → Preview → Close
- Error handling: Network error recovery
- Accessibility: Keyboard navigation, ARIA labels

---

## 🚀 Deployment Steps

1. **BƯỚC 5:** Implement code (components, hooks, utilities)
2. **BƯỚC 5.5:** Add unit & integration tests
3. **BƯỚC 6:** Manual testing & bug fixes
4. **BƯỚC 7:** E2E testing with Playwright
5. **Merge:** To dev branch, then to main
6. **Release:** Deploy with feature flag (optional)

---

## ✅ IMPLEMENTATION PLAN APPROVAL

| Item | Status |
|------|--------|
| Folder structure reviewed | ✅ Reviewed |
| Components designed | ✅ Designed |
| Hooks specified | ✅ Specified |
| Utilities planned | ✅ Planned |
| Types defined | ✅ Defined |
| Testing strategy defined | ✅ Defined |
| Checklist complete | ✅ Complete |
| **IMPLEMENTATION PLAN APPROVED** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09/01/2026

> ✅ **READY FOR BƯỚC 5** - Implementation plan complete. Ready to begin coding components, hooks, and utilities.

---

## 📚 Next Steps

1. **BƯỚC 5:** Coding (Start with utility functions, then hooks, then components)
2. **BƯỚC 5.5:** Unit & Integration Tests (Min 80% coverage)
3. **BƯỚC 6:** Manual Testing & QA
4. **BƯỚC 7:** E2E Testing with Playwright
5. **Deployment:** Merge & Release

---

## 📞 Implementation Notes

### Why This Structure?

1. **Separation of Concerns:** Utilities, hooks, and components are separate
2. **Reusability:** Utilities can be used in other features
3. **Testability:** Each utility and component has clear inputs/outputs
4. **Maintainability:** Easy to find and modify specific functionality
5. **Performance:** Memoization and query caching built in

### Design Patterns Used

- **Custom Hooks:** useConversationFiles (TanStack Query pattern)
- **Zustand Store:** Modal state management
- **Compound Components:** ViewAllFilesModal contains FileGrid/FileList
- **Utility Functions:** Pure functions for extraction, sorting, formatting
- **Component Composition:** Small, focused components

### Technology Stack

- **React 19:** Component framework
- **TypeScript 5:** Type safety
- **TanStack Query:** Data fetching and caching
- **Zustand:** Client state management
- **Tailwind CSS:** Styling
- **Vitest + Playwright:** Testing

