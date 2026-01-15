# E2E Test Scenario: Task Creation and Linking to Messages

## Test Overview
Verify that the create task button is conditionally displayed based on whether a message already has a linked task.

## Pre-conditions
- User is logged in
- User is in a chat conversation with messages
- User has permission to create tasks

## Test Scenarios

### Scenario 1: Create Task from Message Without Linked Task
**Steps:**
1. Navigate to a chat conversation
2. Hover over a message that does NOT have a linked task
3. Verify "Giao việc" (Create Task) button appears
4. Click the "Giao việc" button
5. AssignTaskSheet modal opens
6. Fill in task details:
   - Title: Auto-filled from message content
   - Assignee: Select a member
   - Priority: Select priority
   - Checklist Template: Select template
7. Click "Giao việc" button
8. Wait for task creation and linking to complete
9. Verify success message appears
10. Verify the message now shows linked task indicator
11. Hover over the same message again
12. Verify "Giao việc" button is NO LONGER visible

**Expected Result:**
- Create task button only visible when message has no linked task
- After linking, button is hidden
- Task successfully linked to message

**Data-testids:**
- `create-task-button` - The create task button in hover actions
- `message-bubble-{messageId}` - The message bubble element

---

### Scenario 2: Message Already Has Linked Task
**Steps:**
1. Navigate to a chat conversation
2. Find a message that already has a linked task (linkedTaskId is not null)
3. Hover over the message
4. Verify "Giao việc" button is NOT visible

**Expected Result:**
- Create task button is hidden for messages with linkedTaskId
- No create task action available

---

### Scenario 3: Failed Task Linking (Graceful Degradation)
**Steps:**
1. Set up network to simulate API failure on link-task endpoint
2. Hover over a message without linked task
3. Click "Giao việc" button
4. Fill in task details
5. Click "Giao việc" button
6. Task creation succeeds but linking fails
7. Modal closes
8. Hover over message again
9. Verify "Giao việc" button is still visible (task not linked)

**Expected Result:**
- Task is created even if linking fails
- Button remains visible since message.linkedTaskId is still null
- User can attempt to link again

---

### Scenario 4: Multiple Messages Task Creation
**Steps:**
1. Navigate to a conversation with multiple messages
2. Create tasks from 3 different messages
3. Verify each message's button disappears after task linking
4. Verify other messages still show the button

**Expected Result:**
- Each message's button visibility is independent
- Only messages with linkedTaskId hide the button

---

## API Endpoints Involved

### 1. POST /api/tasks
Creates a new task.

**Request:**
```json
{
  "title": "string",
  "priority": "string",
  "assignTo": "string",
  "conversationId": "string",
  "checklistTemplateId": "string"
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "string",
  ...
}
```

### 2. PATCH /api/messages/{messageId}/link-task
Links a task to a message.

**Request:**
```json
{
  "taskId": "string"
}
```

**Response:**
```json
{
  "id": "message-uuid",
  "taskId": "task-uuid",
  "linkedTaskId": "task-uuid",
  "conversationId": "string",
  "content": "string",
  ...
}
```

### 3. GET /api/conversations/{conversationId}/messages
Fetches messages (initial and on refresh).

**Response includes linkedTaskId:**
```json
{
  "items": [
    {
      "id": "msg-uuid",
      "linkedTaskId": "task-uuid OR null",
      ...
    }
  ]
}
```

---

## Test Data Requirements

### Test User
- userId: "test-user-1"
- Name: "Test User"
- Permissions: Can create tasks

### Test Conversation
- conversationId: "conv-test-1"
- Has at least 5 messages
- 2 messages already have linkedTaskId
- 3 messages have linkedTaskId = null

### Sample Messages
```json
{
  "id": "msg-1",
  "content": "Please review the document",
  "linkedTaskId": null  // ← Should show button
},
{
  "id": "msg-2", 
  "content": "Fix the bug in login",
  "linkedTaskId": "task-existing-1"  // ← Should NOT show button
},
{
  "id": "msg-3",
  "content": "Update the API documentation", 
  "linkedTaskId": null  // ← Should show button
}
```

---

## Verification Checklist

- [ ] Create task button visible when message.linkedTaskId is null
- [ ] Create task button hidden when message.linkedTaskId has value
- [ ] Button appears/disappears on hover correctly
- [ ] Task creation flow completes successfully
- [ ] Task linking updates message.linkedTaskId
- [ ] Button disappears after successful linking
- [ ] Query invalidation refreshes message list
- [ ] Button state is independent per message
- [ ] Graceful error handling if linking fails

---

## Test Implementation File
`tests/chat/create-task-from-message.spec.ts`

## Component Files Involved
- `src/features/portal/components/chat/MessageBubbleSimple.tsx`
- `src/features/portal/components/MessageBubble.tsx`
- `src/components/sheet/AssignTaskSheet.tsx`
- `src/hooks/mutations/useLinkTaskToMessage.ts`
- `src/api/messages.api.ts`
