# Create Task Feature - Overview

## Feature Summary
Allow users to create tasks directly from chat messages. The feature adds a button to the message hover menu that opens a modal form in the right sidebar to create a task with pre-filled data from the selected message.

## Version History

| Version | Date       | Status      | Key Changes                          |
| ------- | ---------- | ----------- | ------------------------------------ |
| 1.0     | 2026-01-09 | 🏗️ Planning | Initial feature design               |

## Feature Scope

### What's Included
- ✅ Create task from message with auto-filled title
- ✅ Assign task to conversation members
- ✅ Select checklist template from API
- ✅ Choose task priority from API
- ✅ Auto-set task status to "Todo"
- ✅ Right-side modal form (responsive)

### What's NOT Included (v2+)
- Task description (only in v2)
- Task attachments (only in v2)
- Task due date (only in v2)
- Task dependencies/links (only in v2)

## Technical Integration

### APIs Required
- **GET** `/api/tasks/config/priorities` - Task priorities
- **GET** `/api/checklist-templates` - Checklist templates
- **GET** `/api/conversations/{conversationId}` - Group members
- **POST** `/api/tasks` - Create task

### Modules Used
- Chat module (message context)
- Task module (task creation)
- Identity module (user/member info)

## Key Decisions

| # | Decision | Rationale |
| - | -------- | --------- |
| 1 | Modal in right sidebar | Non-blocking UX, keeps chat visible |
| 2 | Auto-fill task name | Reduces friction, improves UX |
| 3 | Exclude file attachments | Simplify MVP, add in v2 |
| 4 | Default status = "Todo" | Standardized workflow |

## Dependencies
- [ ] Message hover menu exists (from other features)
- [ ] Right sidebar modal system
- [ ] Task API integration
- [ ] Group member list API
