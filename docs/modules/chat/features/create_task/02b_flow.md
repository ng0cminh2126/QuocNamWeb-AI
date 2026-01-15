# [BƯỚC 2B] User Flow - Create Task Feature

## Main User Flow (Happy Path)

```
USER JOURNEY: Create Task from Message
═════════════════════════════════════════════════════════════════

START: User viewing chat messages
│
├─→ User hovers over a message in chat
│   ├─ Hover menu appears with action buttons
│   └─ "Create Task" button visible
│
├─→ User clicks "Create Task"
│   ├─ Right-side modal slides in
│   ├─ API calls triggered:
│   │  ├─ GET /api/task-config/priorities (skipped if cached)
│   │  ├─ GET /api/checklist-templates (skipped if cached)
│   │  └─ GET /api/conversations/{id}/members (optional)
│   └─ Form pre-populated:
│      ├─ Task Name = Message content (auto-filled)
│      ├─ Assign To = Current user (default)
│      ├─ Checklist Template = "None" (empty)
│      └─ Task Priority = "Medium" (default)
│
├─→ User reviews auto-filled task name
│   ├─ If correct → Proceed
│   └─ If wrong → Edit and clear input
│
├─→ User selects "Assign To" member
│   ├─ Opens dropdown with group members
│   ├─ Selects team member
│   └─ Field updated
│
├─→ User optionally selects "Checklist Template"
│   ├─ Opens dropdown with templates
│   ├─ Selects template (or leaves empty)
│   └─ Field updated
│
├─→ User selects "Task Priority"
│   ├─ Opens dropdown with priorities (Low/Medium/High)
│   ├─ Selects priority
│   └─ Field updated
│
├─→ User validates form
│   ├─ Real-time validation feedback:
│   │  ├─ ✅ Task Name: valid (1-255 chars)
│   │  ├─ ✅ Assign To: valid (member selected)
│   │  ├─ ✅ Priority: valid (priority selected)
│   │  └─ ℹ️ Template: optional
│   └─ Create button becomes ENABLED (if all required fields valid)
│
├─→ User clicks "Create Task" button
│   ├─ Button state = "Creating..." (loading)
│   ├─ Form fields disabled
│   ├─ API call: POST /api/tasks
│   │  └─ Payload:
│   │     ├─ title: (from input)
│   │     ├─ priorityId: (selected)
│   │     ├─ assignedToId: (selected)
│   │     ├─ statusId: (auto = "Todo")
│   │     ├─ checklistTemplateId: (if selected)
│   │     └─ conversationId: (from context)
│   └─ Wait for response...
│
├─→ SUCCESS (201 Created)
│   ├─ Response contains task ID
│   ├─ Modal closes (slide out)
│   ├─ Chat view restored
│   ├─ Toast notification: "✅ Task created successfully!"
│   ├─ Optional: Navigate to task detail page
│   └─ Chat updates with linked task count
│
└─→ END: Task created successfully
```

---

## Error Scenarios

### Scenario 1: Validation Error (400)

```
User fills form with INVALID data
     ↓
User clicks "Create Task"
     ↓
API returns 400 Bad Request
     ├─ Error message: "Title is required"
     ├─ Error field highlighted: Task Name
     └─ Modal stays OPEN
     
User corrects field
     ↓
User clicks "Create Task" again
     ↓
SUCCESS ✅
```

### Scenario 2: Network Error

```
User fills valid form
     ↓
User clicks "Create Task"
     ↓
Network fails (timeout/offline)
     ├─ Loading spinner shown (5s)
     ├─ Error toast: "⚠️ Network error"
     ├─ Modal stays OPEN
     └─ Retry button available
     
User clicks "Retry"
     ↓
SUCCESS ✅
```

### Scenario 3: Permission Error (403)

```
User tries to create task
     ↓
API returns 403 Forbidden
     ├─ Error: "You don't have permission to create tasks"
     ├─ Modal closes
     └─ Error toast shown
```

### Scenario 4: Server Error (500)

```
User tries to create task
     ↓
API returns 500 Internal Server Error
     ├─ Generic error message shown
     ├─ Modal stays OPEN
     └─ Retry option available
```

---

## Alternative Flows

### Flow: Cancel/Close Modal

```
Modal is OPEN (any state)
     ├─ User clicks X button
     ├─ User clicks outside modal (overlay)
     ├─ User presses ESC key
     └─ User clicks Cancel button
          ↓
     Modal closes (slide out)
          ↓
     If form was DIRTY (edited):
     ├─ Show confirmation: "Discard changes?"
     ├─ User clicks "Keep Editing" → Modal stays open
     └─ User clicks "Discard" → Modal closes
          ↓
     Chat view restored
```

### Flow: Auto-fill from Attachment Only

```
Message has NO text content
Message has ONLY attachments
     ├─ First attachment: "screenshot.png"
     └─ Second attachment: "debug.log"
          ↓
Modal opens
     ├─ Task Name auto-filled with: "screenshot.png"
     ├─ User can edit name
     └─ Proceed with normal flow
```

### Flow: Empty Message

```
Message has NO text AND NO attachments
     ├─ Task Name input = empty
     ├─ User MUST fill manually
     └─ Validation error if left empty
          ↓
User types task name
     ├─ Real-time validation feedback
     └─ Create button becomes enabled
```

---

## Concurrent States

### State 1: Loading Config Data

```
Condition: API calls for priorities/templates still pending
Display:
├─ Modal is open
├─ Assign To dropdown: DISABLED (loading skeleton)
├─ Checklist Template: DISABLED (loading skeleton)
├─ Task Priority: DISABLED (loading skeleton)
├─ Create button: DISABLED
└─ User cannot interact until loaded
```

### State 2: Form Valid (Ready to Submit)

```
Condition: All required fields filled and valid
Display:
├─ Task Name: ✅ (filled, valid)
├─ Assign To: ✅ (member selected)
├─ Task Priority: ✅ (priority selected)
├─ Create button: ENABLED (blue, clickable)
└─ User can submit
```

### State 3: Form Invalid (Cannot Submit)

```
Condition: Required field is empty or invalid
Display:
├─ Empty field: Red border
├─ Field label: Red text
├─ Error message: Below input
├─ Create button: DISABLED (gray, not clickable)
└─ User must fix errors
```

### State 4: Submitting

```
Condition: User clicked Create, request in progress
Display:
├─ Create button: Loading spinner + "Creating..."
├─ Form fields: DISABLED (read-only)
├─ Cancel/Close: DISABLED
├─ Modal: Locked (cannot interact)
└─ Wait for response (5s timeout)
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────┐
│  ChatMessageList                     │
│  ├─ Message 1                        │
│  │  ├─ onHover → Show HoverMenu      │
│  │  └─ HoverMenu                     │
│  │     ├─ [Reply] [Copy] [...]       │
│  │     └─ [Create Task] ← NEW        │
│  │        │                          │
│  │        └─ onClick                 │
│  │           ↓                       │
│  │     setCreateTaskModal({          │
│  │       isOpen: true,               │
│  │       messageId: 'msg-1'          │
│  │     })                            │
│  │                                   │
│  ├─ Message 2 (normal)               │
│  ├─ Message 3 (with attachments)     │
│  └─ ...                              │
│                                      │
│  (Right sidebar)                     │
│  ┌──────────────────────────────┐    │
│  │ CreateTaskModal (NEW)        │    │
│  │                              │    │
│  │ [X] Create Task              │    │
│  │ ┌────────────────────────┐   │    │
│  │ │ Task Name              │   │    │
│  │ │ [Auto-filled text...]  │   │    │
│  │ └────────────────────────┘   │    │
│  │ ┌────────────────────────┐   │    │
│  │ │ Assign To [▼]          │   │    │
│  │ │ [John Doe selected]    │   │    │
│  │ └────────────────────────┘   │    │
│  │ ┌────────────────────────┐   │    │
│  │ │ Checklist Template     │   │    │
│  │ │ [None] ▼               │   │    │
│  │ └────────────────────────┘   │    │
│  │ ┌────────────────────────┐   │    │
│  │ │ Task Priority [▼]      │   │    │
│  │ │ [Medium selected]      │   │    │
│  │ └────────────────────────┘   │    │
│  │                              │    │
│  │ [Cancel] [Create Task]       │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

---

## Data Flow Summary

```
Message Component
     │
     ├─ Message content: "Fix login button styling"
     ├─ Message attachments: [filename.png]
     ├─ Conversation ID: "conv-123"
     └─ Author ID: "user-456"
          ↓
User clicks "Create Task"
     ↓
CreateTaskModal opens
     ├─ API: GET /api/task-config/priorities
     ├─ API: GET /api/checklist-templates
     └─ API: GET /api/conversations/conv-123/members
          ↓
Modal displays with:
     ├─ Task Name (auto): "Fix login button styling"
     ├─ Assign To options: [John, Jane, Bob]
     ├─ Priority options: [Low, Medium, High]
     └─ Template options: [None, Template1, Template2]
          ↓
User fills form and submits
     ↓
API: POST /api/tasks
     ├─ title: "Fix login button styling"
     ├─ priorityId: "p-medium"
     ├─ assignedToId: "u-john"
     ├─ statusId: "status-todo"
     ├─ conversationId: "conv-123"
     └─ checklistTemplateId: null
          ↓
Response: 201 Created
     ├─ Task created with ID
     ├─ Task linked to conversation
     └─ Task status = "Todo"
          ↓
Modal closes
     ↓
Toast: "✅ Task created successfully!"
     ↓
Chat view updates with linked task count
```

---

## ✅ HUMAN CONFIRMATION

| Hạng mục              | Status   |
| -------------------- | -------- |
| Đã review User Flow  | ⬜ rồi |
| **APPROVED**        | ⬜ rồi  |

**HUMAN Signature:** [Khoa]  
**Date:** [09012026]
