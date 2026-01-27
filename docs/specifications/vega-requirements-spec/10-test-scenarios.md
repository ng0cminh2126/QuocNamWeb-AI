# 10. Test Scenarios (QC)

## 10.1 Testing Overview

### Test Objectives

This document provides comprehensive test scenarios for Quality Assurance team to validate:
- Functional requirements
- Business logic and rules
- Error handling
- Performance criteria
- Security controls
- Cross-platform compatibility

### Test Priority Levels

- **Critical:** Core functionality, data integrity, security
- **High:** Major features, common user workflows
- **Medium:** Secondary features, edge cases
- **Low:** Nice-to-have features, rare scenarios

### Test Environments

| Environment | Purpose | API Base URL |
|-------------|---------|--------------|
| Development | Feature testing, debugging | `vega-*-api-dev.allianceitsc.com` |
| Staging | Pre-release validation | (TBD) |
| Production | Smoke tests, monitoring | `vega-*-api-prod.allianceitsc.com` |

---

## 10.2 Authentication & Authorization Tests

### TC-AUTH-001: Successful Login
**Priority:** Critical

**Preconditions:**
- Valid user account exists: `testuser` / `TestPass123`

**Steps:**
1. Navigate to login page
2. Enter identifier: `testuser`
3. Enter password: `TestPass123`
4. Click "Login" button

**Expected Results:**
- HTTP 200 response
- Receive `accessToken` in response
- User redirected to Portal page
- Token stored in localStorage
- SignalR connection established

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-AUTH-002: Login with Invalid Credentials
**Priority:** Critical

**Steps:**
1. Enter identifier: `testuser`
2. Enter password: `WrongPassword`
3. Click "Login"

**Expected Results:**
- HTTP 401 response
- Error message displayed: "Invalid username or password"
- No token stored
- User remains on login page

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-AUTH-003: Token Expiration Handling
**Priority:** High

**Preconditions:**
- User logged in with expired token (manually set expiration)

**Steps:**
1. User logged in normally
2. Wait 24 hours OR manually expire token
3. Attempt to send message

**Expected Results:**
- HTTP 401 response
- User redirected to login page
- Error toast: "Session expired, please login again"
- No data loss (draft messages saved locally)

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-AUTH-004: Unauthorized Access to Protected Routes
**Priority:** Critical

**Steps:**
1. Open browser
2. Navigate directly to `/portal` without logging in
3. Clear localStorage
4. Try to access `/portal`

**Expected Results:**
- Redirected to `/login`
- No API calls made without token
- No error displayed (graceful redirect)

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.3 Chat & Messaging Tests

### TC-MSG-001: Send Text Message
**Priority:** Critical

**Preconditions:**
- User A and User B are members of "Test Group"
- Both users logged in on separate devices/browsers

**Steps:**
1. User A opens "Test Group"
2. User A types "Hello World" in input
3. User A clicks Send button
4. User B observes the conversation

**Expected Results:**
- User A sees message immediately with "sending" status
- Within 1 second, message shows "sent" status
- User B receives message via SignalR within 1 second
- Message displays with:
  - Correct sender name
  - Correct timestamp (within 1 second of current time)
  - Content: "Hello World"
- Message persists after page refresh

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-002: Send Message with Image Attachment
**Priority:** Critical

**Preconditions:**
- User A in "Test Group"
- Test image file: `test-image.jpg` (2MB, valid JPEG)

**Steps:**
1. User A clicks attachment button
2. Selects `test-image.jpg`
3. Waits for upload progress
4. Clicks Send

**Expected Results:**
- Upload progress bar displayed (0% → 100%)
- File upload completes within 5 seconds
- Message sent with image attachment
- User B sees image thumbnail
- Click thumbnail opens full preview with watermark
- Image dimensions preserved

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-003: Send Message - Network Failure
**Priority:** High

**Steps:**
1. User A types "Test message"
2. Disconnect network (airplane mode / disable WiFi)
3. Click Send
4. Observe UI state
5. Reconnect network
6. Click Retry button

**Expected Results:**
- Message shows "failed" status immediately
- Retry button appears
- Error toast: "Failed to send message. Check your connection."
- After reconnect + retry:
  - Message sends successfully
  - "failed" status changes to "sent"
  - Message appears in conversation

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-004: Send Empty Message
**Priority:** Medium

**Steps:**
1. User A clicks in message input
2. Types only spaces: "    "
3. Clicks Send

**Expected Results:**
- Send button remains disabled OR
- Error toast: "Message cannot be empty"
- No API call made
- No message sent

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-005: Send Message Exceeding Max Length
**Priority:** Medium

**Steps:**
1. User A types 5001 characters (exceeds 5000 limit)
2. Clicks Send

**Expected Results:**
- Character counter shows "5001 / 5000" (red)
- Send button disabled OR
- HTTP 400 error: "Message exceeds maximum length"

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-006: Edit Message
**Priority:** High

**Preconditions:**
- Message "Original text" sent by User A

**Steps:**
1. User A clicks Edit on own message
2. Changes content to "Edited text"
3. Clicks Save

**Expected Results:**
- Message content updated to "Edited text"
- "(edited)" label appears next to timestamp
- User B sees updated message via SignalR
- Message edit timestamp (`editedAt`) updated

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-007: Delete Message
**Priority:** High

**Steps:**
1. User A sends message "Test message"
2. User A clicks Delete
3. Confirms deletion

**Expected Results:**
- Message content replaced with "[Message deleted]"
- Attachments hidden
- User B sees deleted message via SignalR
- Message cannot be un-deleted
- Replies to deleted message still visible

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-008: Reply to Message
**Priority:** High

**Steps:**
1. User A sends "Original message"
2. User B clicks Reply on message
3. User B types "Reply message"
4. User B clicks Send

**Expected Results:**
- Reply UI shows preview: "Replying to @userA: Original message"
- Reply sent with `parentMessageId` set
- Reply displays with reference to parent
- Click parent preview scrolls to original message
- Parent message shows `replyCount: 1`

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-009: Pin Message (Admin)
**Priority:** Medium

**Preconditions:**
- User A has Admin role in group

**Steps:**
1. User A clicks Pin on message
2. User B observes

**Expected Results:**
- Message added to pinned messages list
- Pinned messages panel shows message
- User B sees pin update via SignalR
- Max 10 pinned messages enforced

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-010: Pin Message (Non-Admin)
**Priority:** Medium

**Preconditions:**
- User B has Member role (not Admin)

**Steps:**
1. User B attempts to pin message

**Expected Results:**
- Pin button disabled OR
- HTTP 403 error: "Insufficient permissions"
- Error toast displayed

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-011: Star Message
**Priority:** Low

**Steps:**
1. User A clicks Star on message
2. Navigates to Starred Messages view

**Expected Results:**
- Message marked as starred (yellow star icon)
- Message appears in Starred Messages list
- Star status is user-specific (User B doesn't see it)

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-012: Typing Indicator
**Priority:** Low

**Steps:**
1. User A starts typing in chat input
2. User B observes bottom of chat

**Expected Results:**
- User B sees "userA is typing..." within 500ms
- Indicator disappears 3 seconds after User A stops
- Multiple users: "userA, userB are typing..."

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-013: Load Old Messages (Pagination)
**Priority:** High

**Preconditions:**
- Conversation has 200+ messages

**Steps:**
1. User A opens conversation
2. Scrolls to top
3. Pulls to load more

**Expected Results:**
- First load: 50 newest messages
- Scroll to top triggers load of next 50
- No duplicate messages
- Smooth scrolling (no lag)
- Oldest messages loaded last

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-MSG-014: Real-time Message Sync (Multiple Devices)
**Priority:** Critical

**Setup:**
- User A logged in on 2 devices (Browser A, Browser B)

**Steps:**
1. Browser A sends message "Test sync"
2. Observe Browser B

**Expected Results:**
- Message appears on Browser B within 1 second
- Message appears exactly once (no duplicates)
- Both browsers show identical conversation state

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.4 Task Management Tests

### TC-TASK-001: Create Task
**Priority:** Critical

**Steps:**
1. User A clicks "Create Task"
2. Fills form:
   - Title: "Fix login bug"
   - Description: "Test description"
   - Priority: High
   - Assign to: User B
   - Due date: Tomorrow
3. Clicks Create

**Expected Results:**
- HTTP 200 response
- Task created with status "todo"
- Task appears in task list
- User B sees task in "Assigned to me"
- (Future) User B receives notification

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-002: Create Task from Message
**Priority:** High

**Steps:**
1. User A sends message "Please review the document"
2. User A clicks "Convert to Task" on message
3. Fills task form
4. Clicks Create

**Expected Results:**
- Task created and linked to message
- Message shows task badge/icon
- Task detail shows original message reference
- Click task scrolls to message

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-003: Update Task Status
**Priority:** Critical

**Steps:**
1. User B opens task "Fix login bug"
2. Changes status from "todo" to "doing"
3. User A observes

**Expected Results:**
- Task status updated immediately
- User A sees status change (real-time or after refresh)
- Task audit log records status change
- Task appears in "Doing" section

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-004: Complete Checklist Item
**Priority:** High

**Preconditions:**
- Task has checklist: ["Review code", "Write tests", "Deploy"]

**Steps:**
1. User B checks "Review code"
2. User B checks "Write tests"

**Expected Results:**
- Checkboxes marked as completed
- Progress bar shows 66% (2 of 3 completed)
- Task status remains unchanged (still "doing")
- Completed items show timestamp + user

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-005: Add Checklist Item
**Priority:** Medium

**Steps:**
1. User B opens task
2. Clicks "Add checklist item"
3. Enters "Run regression tests"
4. Clicks Save

**Expected Results:**
- New item added to checklist
- Item order preserved (appears at bottom)
- Progress percentage recalculated

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-006: Create Task - Missing Required Field
**Priority:** Medium

**Steps:**
1. User A clicks "Create Task"
2. Leaves Title empty
3. Clicks Create

**Expected Results:**
- Validation error: "Title is required"
- Form not submitted
- Focus moves to Title field

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-007: Filter Tasks by Status
**Priority:** High

**Preconditions:**
- Tasks exist in various statuses

**Steps:**
1. User A opens Workspace
2. Clicks filter: "Doing"

**Expected Results:**
- Only tasks with status "doing" displayed
- Count badge shows correct number
- Other tasks hidden

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-TASK-008: Filter Tasks by Work Type
**Priority:** Medium

**Preconditions:**
- User has selected default work type "Nhận hàng"

**Steps:**
1. User A logs in
2. Opens Workspace

**Expected Results:**
- Only tasks with work type "Nhận hàng" shown
- Filter indicator visible
- User can clear filter to see all

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.5 File Management Tests

### TC-FILE-001: Upload Single Image
**Priority:** Critical

**Steps:**
1. User A selects image file (2MB JPEG)
2. Clicks Upload

**Expected Results:**
- Upload progress shown (0% → 100%)
- Upload completes within 10 seconds
- Receive `fileId` in response
- File can be attached to message

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-FILE-002: Upload File Exceeding Size Limit
**Priority:** High

**Steps:**
1. User A selects 15MB file
2. Attempts upload

**Expected Results:**
- HTTP 413 error: "File size exceeds maximum (10MB)"
- Error toast displayed
- Upload aborted

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-FILE-003: Upload Unsupported File Type
**Priority:** Medium

**Steps:**
1. User A selects `.exe` file
2. Attempts upload

**Expected Results:**
- HTTP 415 error: "Unsupported file type"
- Error toast displayed

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-FILE-004: Batch Upload (3 Files)
**Priority:** High

**Steps:**
1. User A selects 3 PDF files (2MB each)
2. Clicks Upload

**Expected Results:**
- All 3 files upload in parallel
- Combined progress shown
- Response contains 3 `fileId`s
- All files attachable to message

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-FILE-005: View Watermarked Image Preview
**Priority:** Medium

**Steps:**
1. User A sends message with image
2. User B clicks image thumbnail
3. Preview modal opens

**Expected Results:**
- Full-size image displayed
- Watermark visible on image
- Zoom in/out works
- Close button functional

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-FILE-006: Download PDF File
**Priority:** High

**Steps:**
1. User A sends message with PDF attachment
2. User B clicks "Download" button

**Expected Results:**
- File downloads to device
- Filename preserved
- File size matches original
- File opens correctly in PDF viewer

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.6 Group Management Tests

### TC-GROUP-001: Add Member to Group
**Priority:** High

**Preconditions:**
- User A is Admin of "Test Group"
- User C is not a member

**Steps:**
1. User A opens Group Settings
2. Clicks "Add Member"
3. Selects User C
4. Clicks Confirm

**Expected Results:**
- HTTP 200 response
- User C added to group
- User C sees group in conversation list
- Other members notified (system message)

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-GROUP-002: Remove Member from Group
**Priority:** High

**Steps:**
1. User A clicks "Remove" on User C
2. Confirms action

**Expected Results:**
- User C removed from group
- User C no longer sees group
- System message: "User C was removed"
- User C cannot send messages

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-GROUP-003: Promote Member to Admin
**Priority:** Medium

**Preconditions:**
- User A is Owner
- User B is Member

**Steps:**
1. User A clicks "Promote" on User B
2. Confirms action

**Expected Results:**
- User B role changed to Admin
- User B can now add/remove members
- User B cannot promote others (only Owner can)

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-GROUP-004: Non-Admin Attempts to Add Member
**Priority:** Medium

**Preconditions:**
- User B is regular Member

**Steps:**
1. User B opens Group Settings
2. Attempts to add member

**Expected Results:**
- "Add Member" button disabled OR
- HTTP 403 error
- Error toast: "Only admins can add members"

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-GROUP-005: Attempt to Remove Group Owner
**Priority:** Medium

**Steps:**
1. Admin attempts to remove Owner

**Expected Results:**
- HTTP 400 error: "Cannot remove group owner"
- Error toast displayed
- Owner remains in group

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.7 Real-time & SignalR Tests

### TC-REALTIME-001: SignalR Connection on Login
**Priority:** Critical

**Steps:**
1. User A logs in
2. Check browser DevTools (Network tab)

**Expected Results:**
- WebSocket connection established to `/hubs/chat`
- Connection state: "Connected"
- No errors in console

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-REALTIME-002: SignalR Reconnection
**Priority:** High

**Steps:**
1. User A connected and viewing chat
2. Disable network for 5 seconds
3. Re-enable network

**Expected Results:**
- Connection state changes: "Reconnecting"
- Automatic reconnection within 10 seconds
- Connection state: "Connected"
- User receives missed messages

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-REALTIME-003: Join/Leave Conversation
**Priority:** Medium

**Steps:**
1. User A opens "Group A"
2. Switches to "Group B"
3. Check SignalR traffic

**Expected Results:**
- Invoke `LeaveConversation(groupA_id)`
- Invoke `JoinConversation(groupB_id)`
- User A receives messages only from Group B

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.8 Performance Tests

### TC-PERF-001: Load Conversation with 1000+ Messages
**Priority:** High

**Preconditions:**
- Conversation has 1500 messages

**Steps:**
1. User A opens conversation
2. Scrolls through all messages

**Expected Results:**
- Initial load: < 3 seconds
- Scrolling smooth (60 FPS)
- No browser freeze/lag
- Memory usage stable

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-PERF-002: Send 10 Messages Rapidly
**Priority:** Medium

**Steps:**
1. User A sends 10 messages in 5 seconds

**Expected Results:**
- All messages sent successfully
- No rate limiting errors (< 30 per minute)
- Messages appear in correct order
- No duplicates

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-PERF-003: Upload Large File (9.5MB)
**Priority:** Medium

**Steps:**
1. User A uploads 9.5MB PDF

**Expected Results:**
- Upload completes within 30 seconds
- Progress bar updates smoothly
- No timeout errors

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.9 Security Tests

### TC-SEC-001: Access API Without Token
**Priority:** Critical

**Steps:**
1. Open browser DevTools
2. Remove Authorization header
3. Attempt to call `/api/messages`

**Expected Results:**
- HTTP 401 Unauthorized
- No data returned
- User redirected to login

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-SEC-002: Access Other User's Messages
**Priority:** Critical

**Steps:**
1. User A gets messageId from User B's private conversation
2. User A attempts to delete that message

**Expected Results:**
- HTTP 403 Forbidden OR 404 Not Found
- Message not deleted
- Error logged

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

### TC-SEC-003: DevTools Protection
**Priority:** Low

**Steps:**
1. User A presses F12
2. User A right-clicks page

**Expected Results:**
- F12 blocked (no DevTools open)
- Right-click context menu disabled
- Warning toast displayed (if configured)

**Actual Result:** _____

**Status:** ☐ Pass ☐ Fail

---

## 10.10 Cross-platform & Browser Tests

### TC-COMPAT-001: Chrome Desktop
**Priority:** Critical

**Browser:** Chrome 120+

**Test:** Execute critical test cases (Login, Send Message, Create Task)

**Expected:** All features work correctly

**Status:** ☐ Pass ☐ Fail

---

### TC-COMPAT-002: Firefox Desktop
**Priority:** High

**Status:** ☐ Pass ☐ Fail

---

### TC-COMPAT-003: Safari Desktop (macOS)
**Priority:** Medium

**Status:** ☐ Pass ☐ Fail

---

### TC-COMPAT-004: Edge Desktop
**Priority:** Medium

**Status:** ☐ Pass ☐ Fail

---

### TC-COMPAT-005: Chrome Mobile (Android)
**Priority:** High

**Status:** ☐ Pass ☐ Fail

---

### TC-COMPAT-006: Safari Mobile (iOS)
**Priority:** High

**Status:** ☐ Pass ☐ Fail

---

## 10.11 Test Summary Template

### Test Execution Report

**Date:** ___________

**Tester:** ___________

**Environment:** Development / Staging / Production

**Build Version:** ___________

| Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| Authentication | 4 | | | | |
| Messaging | 14 | | | | |
| Tasks | 8 | | | | |
| Files | 6 | | | | |
| Groups | 5 | | | | |
| Real-time | 3 | | | | |
| Performance | 3 | | | | |
| Security | 3 | | | | |
| **TOTAL** | **46** | | | | |

### Critical Bugs Found

| ID | Test Case | Description | Severity | Status |
|----|-----------|-------------|----------|--------|
| | | | | |

### Notes

_____________________

---

## 10.12 Regression Test Checklist

Run these tests before every release:

- ☐ TC-AUTH-001: Login
- ☐ TC-MSG-001: Send message
- ☐ TC-MSG-014: Real-time sync
- ☐ TC-TASK-001: Create task
- ☐ TC-TASK-003: Update task status
- ☐ TC-FILE-001: Upload file
- ☐ TC-REALTIME-001: SignalR connection
- ☐ TC-SEC-001: API auth check

---

**End of Test Scenarios**
