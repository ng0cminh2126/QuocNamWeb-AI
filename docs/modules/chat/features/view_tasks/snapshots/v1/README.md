# API Snapshot Instructions

**Feature:** View All Tasks  
**Module:** Chat  
**Date:** 2025-01-09

---

## 📋 Overview

This folder should contain actual JSON response snapshots from the APIs used by the View All Tasks feature. These are **real responses from the backend**, not mock data.

**Status:** ⏳ **WAITING FOR HUMAN TO PROVIDE ACTUAL API RESPONSES**

---

## 🔧 How to Capture Snapshots

### Method 1: Using Postman

1. Open Postman
2. Create a new request:
   - **Method:** GET
   - **URL:** `https://api.domain.com/api/conversations/{conversationId}/tasks`
   - **Headers:**
     ```
     Authorization: Bearer YOUR_JWT_TOKEN
     Content-Type: application/json
     ```
3. Click **Send**
4. Copy response JSON
5. Save to file (see filenames below)

### Method 2: Using cURL

```bash
# Get linked tasks
curl -X GET "https://api.domain.com/api/conversations/550e8400-e29b-41d4-a716-446655440000/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" > linked-tasks-success.json

# Get conversation details
curl -X GET "https://api.domain.com/api/conversations/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" > conversation-details.json

# Get task priorities
curl -X GET "https://api.domain.com/api/task-config/priorities" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" > task-priorities.json
```

### Method 3: Using Insomnia

1. Create environment variables for JWT token
2. Set up requests with Authorization header
3. Send requests and export responses

---

## 📁 Expected Files

### File 1: `linked-tasks-success.json`
**API Endpoint:** `GET /api/conversations/{conversationId}/tasks`  
**Description:** Success response with actual linked tasks

**Expected Structure:**
```json
[
  {
    "taskId": "string (UUID)",
    "task": {
      "id": "string",
      "title": "string",
      "description": "string or null",
      "status": "todo|in_progress|awaiting_review|done",
      "priority": "low|medium|high|urgent",
      "assignedTo": {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string or null"
      } or null,
      "createdAt": "ISO8601 datetime",
      "updatedAt": "ISO8601 datetime",
      "dueDate": "ISO8601 datetime or null",
      "checkItems": [
        {
          "id": "string",
          "title": "string",
          "completed": boolean,
          "order": number
        }
      ] or []
    },
    "messageId": "string (UUID) or null",
    "linkType": "string or null"
  }
  // ... more tasks
]
```

**Example Count:** At least 3-5 tasks with varied statuses and priorities

---

### File 2: `conversation-details.json`
**API Endpoint:** `GET /api/conversations/{conversationId}`  
**Description:** Conversation details for modal header and member list

**Expected Structure:**
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string or null",
  "type": "dm|group",
  "members": [
    {
      "id": "string (UUID)",
      "name": "string",
      "email": "string",
      "avatar": "string (URL) or null",
      "role": "owner|admin|member"
    }
  ],
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### File 3: `task-priorities.json`
**API Endpoint:** `GET /api/task-config/priorities`  
**Description:** Available task priority options

**Expected Structure:**
```json
[
  {
    "id": "string",
    "name": "string",
    "displayName": "string",
    "color": "hex color code or null",
    "order": number
  }
]
```

**Example:** Should have at least 4 priorities (Low, Medium, High, Urgent)

---

## ✅ Submission Checklist

When submitting snapshots, ensure:

- [ ] `linked-tasks-success.json` - Real response from API (3-5 tasks)
- [ ] `conversation-details.json` - Real conversation with members
- [ ] `task-priorities.json` - All available priority options
- [ ] All files valid JSON (use validator: https://jsonlint.com/)
- [ ] All files in `docs/modules/chat/features/view_tasks/snapshots/v1/` folder
- [ ] Credentials removed from JSON (no tokens, passwords)
- [ ] No PII exposed (sanitize real names if needed)

---

## 📝 Format

**Recommended Structure:**

```json
{
  "_meta": {
    "capturedAt": "2025-01-09T15:30:00Z",
    "environment": "development|staging|production",
    "apiVersion": "v1"
  },
  "_request": {
    "endpoint": "/api/conversations/{conversationId}/tasks",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer [TOKEN]",
      "Content-Type": "application/json"
    }
  },
  "_response": {
    "status": 200,
    "headers": {
      "content-type": "application/json",
      "x-total-count": "5"
    },
    "body": [
      // ... actual response data
    ]
  }
}
```

**Or Simplified (Just Response Body):**

```json
[
  {
    "taskId": "...",
    "task": { ... }
  }
]
```

Both formats are acceptable. Choose one and use consistently.

---

## 🔒 Security Notes

**⚠️ IMPORTANT:**
- Remove any JWT tokens, API keys, or sensitive headers
- Sanitize email addresses if using real ones
- Remove real user IDs (use generic UUIDs like `user-123`)
- This folder will be committed to git - ensure no secrets

**Good:** `user-123@company.com` → `john@example.com`  
**Bad:** `john.doe@company.com` (real email)

---

## 🔄 When to Update Snapshots

Update snapshots when:
- API response structure changes (breaking changes)
- New fields added to responses
- Validation rules change
- Database schema updates

**Version Control:**
- Keep old snapshots in `v1/` folder
- Create new `v2/` folder when API changes
- Update documentation with new snapshot structure

---

## ✅ Snapshots Status

| File | Status | Submitted By | Date |
|------|--------|--------------|------|
| linked-tasks-success.json | ⏳ PENDING | ⬜ HUMAN | ⬜ |
| conversation-details.json | ⏳ PENDING | ⬜ HUMAN | ⬜ |
| task-priorities.json | ⏳ PENDING | ⬜ HUMAN | ⬜ |

---

## 📞 Questions?

If you have questions about API responses:
1. Check the Swagger documentation in the project
2. Test endpoints with Postman
3. Ask backend team for confirmation of response format

---

**Created by:** AI (2025-01-09)  
**Last Updated:** 2025-01-09  
**Status:** ⏳ Awaiting snapshot submission

