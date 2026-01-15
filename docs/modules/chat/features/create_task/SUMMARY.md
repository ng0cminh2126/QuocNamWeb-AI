# Create Task Feature - Documentation Summary

**Created:** 2026-01-09  
**Status:** ⏳ Awaiting HUMAN Review & Approval

---

## 📁 Documentation Structure

```
docs/modules/chat/features/create_task/
├── 00_README.md                    ✅ Overview & Scope
├── 01_requirements.md              ✅ Functional & Non-Functional Requirements
├── 02a_wireframe.md                ✅ UI Layout & Component Specs
├── 02b_flow.md                     ✅ User Journey & Data Flow
├── 03_api-contract.md              ✅ API Specifications & Contracts
├── 04_implementation-plan.md       ✅ Code Architecture & Structure
├── 05_progress.md                  ✅ Tracking & Timeline
├── 06_testing.md                   ✅ Test Coverage & Test Cases
└── SUMMARY.md (this file)          ℹ️ Quick Reference
```

---

## 🎯 Feature Overview

### What It Does
- Adds a **"Create Task" button** to the message hover menu
- Opens a **right-side modal form** to create a task
- **Auto-fills task name** from message content (or filename if attachments only)
- **Allows assignment** to conversation members
- **Optional checklist template** selection from API
- **Task priority** selection from API
- **Auto-sets status** to "Todo"

### Key UX Features
✅ Non-blocking modal (chat still visible)  
✅ Auto-fill reduces friction  
✅ Real-time form validation  
✅ Error handling with retry  
✅ Responsive design (desktop/tablet/mobile)  

### APIs Required
- `GET /api/task-config/priorities` - Priority options
- `GET /api/checklist-templates` - Template options
- `GET /api/conversations/{id}` - Group members (optional)
- `POST /api/tasks` - Create task

---

## ⏳ Approval Status

| BƯỚC | Document | Status | HUMAN Approval |
| ---- | -------- | ------ | -------------- |
| 0 | 00_README.md | ✅ Complete | ⬜ Pending |
| 1 | 01_requirements.md | ✅ Complete | ⬜ Pending |
| 2A | 02a_wireframe.md | ✅ Complete | ⬜ Pending |
| 2B | 02b_flow.md | ✅ Complete | ⬜ Pending |
| 3 | 03_api-contract.md | ✅ Complete | ⬜ Pending |
| 4 | 04_implementation-plan.md | ✅ Complete | ⬜ Pending |
| 4.5/6 | 06_testing.md | ✅ Complete | ⬜ Pending |
| 5 | 05_progress.md | ✅ Complete | ⬜ Pending |

---

## 🚫 BLOCKING ITEMS (HUMAN ACTION REQUIRED)

Before AI can proceed with implementation, HUMAN must:

### 1. **Fill Pending Decisions** in each document

**In 01_requirements.md:**
- [ ] Assign To field: Single-select OR Multi-select?
- [ ] Default Priority: Low, Medium, or High?
- [ ] Link Type: "Related", "Subtask", or "Duplicate"?
- [ ] Modal Width: 350px, 400px, or 450px?
- [ ] Auto-fill behavior: Include message author info?

**In 02a_wireframe.md:**
- [ ] Modal width: 350, 400, 450px?
- [ ] Mobile behavior: Full-width OR Bottom sheet?
- [ ] Assign To: Single-select OR Multi-select?
- [ ] Auto-fill rule: Message only OR Include author?

**In 04_implementation-plan.md:**
- [ ] Modal position: Right sidebar OR Bottom sheet?
- [ ] Auto-fill from: Message text OR Author name?
- [ ] Close on success: Auto-close OR Keep open?

### 2. **Provide API Snapshots** (JSON Response Examples)

Create snapshots folder with actual API responses:

```
docs/modules/chat/features/create_task/snapshots/v1/
├── task-priorities.json
├── checklist-templates.json
├── conversation-members.json
├── create-task-success.json
└── create-task-error-400.json
```

**Example task-priorities.json:**
```json
[
  {
    "id": "uuid",
    "name": "Low",
    "color": "#10b981",
    "displayOrder": 1
  },
  ...
]
```

**How to get snapshots:**
1. Log into API testing tool (Postman/Insomnia)
2. Call each endpoint with authorization
3. Copy JSON response
4. Save to snapshot file

### 3. **Sign Off on Documentation**

For each BƯỚC document, fill:
- [ ] "Đã review [Document Name]" → Check ✅
- [ ] "Đã điền Pending Decisions" → Check ✅
- [ ] "APPROVED để thực thi" → Check ✅
- [ ] "HUMAN Signature" → Add name/date
- [ ] "Date" → Add date

---

## 📋 Quick Decisions Checklist

Copy-paste this into your approval email:

```
DECISIONS FILLED:
─────────────────
1. Assign To field: [ ] Single OR [ ] Multi-select
2. Default Priority: [ ] Low [ ] Medium [ ] High
3. Link Type: [ ] Related [ ] Subtask [ ] Duplicate
4. Modal Width: [ ] 350px [ ] 400px [ ] 450px
5. Auto-fill: [ ] Text only [ ] Include author
6. Mobile: [ ] Full-width [ ] Bottom sheet
7. Close behavior: [ ] Auto-close [ ] Keep open

API SNAPSHOTS PROVIDED:
──────────────────────
[ ] task-priorities.json
[ ] checklist-templates.json
[ ] conversation-members.json
[ ] create-task-success.json
[ ] create-task-error.json

SIGN-OFF COMPLETED:
──────────────────
[ ] All 8 documents reviewed
[ ] All pending decisions filled
[ ] All snapshots provided
[ ] Ready for implementation

SIGNATURE:
──────────
Name: ________________________
Date: ________________________
```

---

## 🚀 Implementation Timeline (After Approval)

| Phase | Tasks | Time | Status |
| ----- | ----- | ---- | ------ |
| **Phase 1** | API client + types | 30 min | ⏳ Waiting |
| **Phase 2** | Hooks (query/mutation) | 1 hr | ⏳ Waiting |
| **Phase 3** | Modal component | 2 hrs | ⏳ Waiting |
| **Phase 4** | All test cases | 2 hrs | ⏳ Waiting |
| **Phase 5** | Integration & Polish | 1.5 hrs | ⏳ Waiting |
| **Total** | Complete feature | ~7.5 hrs | ⏳ Waiting |

---

## 📞 Next Steps

### For HUMAN:
1. ✅ Read all 8 documents in `docs/modules/chat/features/create_task/`
2. ✅ Fill out all Pending Decisions tables
3. ✅ Provide API snapshots (5 JSON files)
4. ✅ Sign approval in each document
5. ✅ Reply to AI with completion confirmation

### For AI (After Approval):
1. Create API client (`src/api/create_task.api.ts`)
2. Create hooks (`src/hooks/queries/useTaskConfig.ts` + `useCreateTask.ts`)
3. Create modal component (`src/features/portal/components/CreateTaskModal.tsx`)
4. Write all tests (~21 test cases)
5. Integration with message menu
6. Final review and E2E testing

---

## 📚 Related Features

- **Pinned & Starred Messages** (`docs/modules/chat/features/pinned_and_starred/`)
- **Message Context Menu** (existing hover menu)
- **Task Module** (vega-task-api)
- **Chat Integration** (linked tasks display)

---

## 🔗 API Documentation Links

From attached swagger files:
- **Task Creation:** `POST /api/tasks` (line ~1830 in swagger)
- **Priorities:** `GET /api/task-config/priorities` (line ~720)
- **Templates:** `GET /api/checklist-templates` (line ~18)
- **Conversation:** (Need group member endpoint)

---

**Created by:** AI Assistant  
**Last Updated:** 2026-01-09 10:45 UTC  
**Status:** Ready for HUMAN Review
