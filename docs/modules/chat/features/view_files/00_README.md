# View All Files Feature - Overview

**Module:** Chat  
**Feature:** View All Files  
**Status:** 📝 In Planning  
**Created:** 2025-01-09  
**Last Updated:** 2025-01-09

---

## 📌 Feature Summary

Enhance the **InformationPanel** component to display all files (images, videos, documents) attached to messages in a conversation with expanded capabilities including:

- **View All Files** button in InformationPanel
- Expandable file list modal with search/filter controls
- File preview functionality
- File metadata display (name, size, date, sender)
- Integration with Chat API to fetch files on demand

---

## 🎯 Goals

1. **Current State Problem:**
   - Files are only extracted from messages in the initial load
   - As new messages arrive, their files aren't automatically added to the FileManager view
   - Users can't dynamically load all files without scrolling through messages

2. **Solution:**
   - Create a "View All Files" modal similar to view_tasks feature
   - Fetch files from `/api/conversations/{conversationId}/messages` endpoint
   - Display all files with pagination and filtering options
   - Allow viewing file metadata and previewing files

---

## 📐 Architecture Overview

```
InformationPanel (MODIFY)
├── FileManagerPhase1A (Ảnh / Video) - EXISTING
├── FileManagerPhase1A (Tài liệu) - EXISTING
└── "View All Files" Button (NEW)
    └── ViewAllFilesModal (NEW COMPONENT)
        ├── File Search
        ├── File Filters (Type, Date, Sender)
        ├── File List (Paginated)
        └── File Preview
```

**Data Flow:**

```
InformationPanel
  ↓
  [View All Files Button clicked]
  ↓
  ViewAllFilesModal (opens)
  ↓
  useConversationFiles hook (fetches from API)
  ↓
  GET /api/conversations/{conversationId}/messages
  ↓
  Extract files from messages
  ↓
  Display in modal with filters
```

---

## 📋 Acceptance Criteria

### AC-1: View All Files Button Visible
- ✅ Button appears in both "Ảnh / Video" and "Tài liệu" accordion headers
- ✅ Button text: "Xem tất cả (N)" where N = total file count
- ✅ Button only visible when file count > 0
- ✅ Button styled consistently with project design

### AC-2: Modal Opens with File List
- ✅ Clicking "Xem tất cả" opens full-screen modal
- ✅ Modal title: "Tất cả [Ảnh / Tài liệu] (Tên nhóm)"
- ✅ Modal displays paginated file grid/list
- ✅ Modal can be closed with ✕ button or pressing Escape

### AC-3: Files Loaded from API
- ✅ Modal fetches files from `/api/conversations/{conversationId}/messages`
- ✅ All message attachments extracted and displayed
- ✅ Files paginated (50 per page default, configurable)
- ✅ Loading state shown while fetching

### AC-4: File Filtering & Sorting
- ✅ Filter by: Type (image/pdf/excel/word), Date range, Sender
- ✅ Sort by: Newest first, Oldest first, Name (A-Z), Size
- ✅ Filters work in real-time without page reload
- ✅ Active filters shown as pills/badges

### AC-5: File Preview
- ✅ Click file to preview in overlay
- ✅ Image files show thumbnail + full resolution preview
- ✅ Documents show file icon + metadata
- ✅ "Open in new tab" option for non-image files

---

## 📁 Scope & Components

### Files to Create (NEW)

```
src/components/
├── ViewAllFilesModal.tsx          # Main modal component
├── FilePreview.tsx                 # File preview overlay
└── FileFilter.tsx                  # Filter controls (optional)

src/hooks/
├── queries/
│   └── useConversationFiles.ts    # Fetch files from messages
└── (mutations if needed)

src/types/
├── files.ts                        # File-related types

docs/modules/chat/features/view_files/
├── 00_README.md                    # This file
├── 01_requirements.md              # Functional requirements
├── 02a_wireframe.md                # UI mockups
├── 02b_flow.md                     # User flow diagrams
├── 03_api-contract.md              # API specifications
├── 04_implementation-plan.md       # Code implementation details
└── 06_testing.md                   # Test requirements

docs/api/chat/files/
├── contract.md                     # API contract for file endpoint
└── snapshots/v1/
    ├── get-messages-with-files.json
    └── media-files-response.json
```

### Files to Modify

```
src/features/portal/workspace/
├── InformationPanel.tsx            # Add "Xem tất cả" buttons
└── ConversationDetailPanel.tsx     # Pass props, handle modal state

src/features/portal/components/
└── FileManagerPhase1A.tsx          # Accept onViewAll callback prop

docs/modules/chat/
└── api-spec.md                     # Update message response docs
```

---

## 🔗 Related Features

- **view_tasks:** Similar implementation pattern for tasks modal
- **file-upload:** Existing file handling and display components
- **conversation-details-phase-2:** File attachment display logic

---

## 📊 Development Phases

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 0 | Feature documentation & API spec | 30 min | 📝 In Progress |
| 1 | Requirements & Wireframe | 1 hour | ⏳ Pending |
| 2 | API Contract & Snapshots | 30 min | ⏳ Pending |
| 3 | Implementation Plan | 1 hour | ⏳ Pending |
| 4 | Test Requirements | 30 min | ⏳ Pending |
| 5 | Code Implementation + Tests | 3-4 hours | ⏳ Pending |
| 6 | Manual Testing & E2E | 1 hour | ⏳ Pending |

---

## ⚠️ PENDING DECISIONS

| # | Decision | Options | HUMAN Input |
|---|----------|---------|------------|
| 1 | Files pagination size | 20 / 50 / 100 items per page | ✅ **50 items per page** |
| 2 | Modal opening behavior | Modal / Slide-in panel / New tab | ✅ **Modal** |
| 3 | Default sort order | Newest / Oldest / Name / Size | ✅ **Newest first** |
| 4 | Show file sender info | Yes / No / Only for docs | ✅ **Only for docs** |
| 5 | Allow bulk download | Yes / No | ✅ **No** |
| 6 | Filter position | Modal header / Sidebar / Popover | ✅ **Top bar** |

> **Decisions extracted from wireframe notes** - Ready for implementation phase

---

## 📚 Reference Documents

- [View Tasks Feature](../view_tasks/00_README.md) - Similar implementation pattern
- [Chat API Spec](../../api-spec.md) - Existing API documentation
- [File Upload Feature](../file-upload/00_README.md) - File handling patterns
- [InformationPanel Component](../../../../src/features/portal/workspace/InformationPanel.tsx) - Current component

---

## ✅ HUMAN CONFIRMATION

| Checkpoint | Status |
|-----------|--------|
| Reviewed architecture & scope | ✅ Reviewed |
| Reviewed AC acceptance criteria | ✅ Reviewed |
| Filled Pending Decisions table above | ✅ Filled |
| **APPROVED to proceed to Phase 1** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09/01/2026

> ✅ **READY FOR PHASE 1** - All decisions confirmed, proceeding to requirements generation.
