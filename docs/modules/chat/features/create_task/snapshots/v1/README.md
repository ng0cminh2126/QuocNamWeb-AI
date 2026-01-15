# API Snapshots for Create Task Feature

## How to Use This Folder

This folder will contain actual JSON responses from the APIs. These are needed for:
1. Test data mocking
2. API contract validation
3. Component testing
4. TypeScript type generation

## Files to Create (HUMAN ACTION)

### 1. `task-priorities.json`
**Source:** `GET /api/task-config/priorities`

Expected content:
```json
[
  {
    "id": "string (uuid)",
    "name": "Low|Medium|High",
    "description": "string",
    "color": "#hex-color",
    "displayOrder": 1
  },
  ...
]
```

### 2. `checklist-templates.json`
**Source:** `GET /api/checklist-templates`

Expected content:
```json
[
  {
    "id": "string (uuid)",
    "name": "Template Name",
    "description": "string",
    "items": [
      {
        "id": "string (uuid)",
        "content": "Checklist item text",
        "displayOrder": 1
      }
    ],
    "createdAt": "2026-01-09T10:00:00Z"
  },
  ...
]
```

### 3. `conversation-members.json`
**Source:** `GET /api/conversations/{conversationId}`

Expected content:
```json
{
  "id": "string (uuid)",
  "name": "Group Name",
  "members": [
    {
      "id": "string (uuid)",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "role": "Member|Admin"
    },
    ...
  ]
}
```

### 4. `create-task-success.json`
**Source:** `POST /api/tasks` (201 response)

Expected content:
```json
{
  "id": "string (uuid)",
  "title": "Task Title",
  "description": "string or null",
  "priorityId": "string (uuid)",
  "statusId": "string (uuid)",
  "assignedToId": "string (uuid)",
  "checklistTemplateId": "string (uuid) or null",
  "conversationId": "string (uuid)",
  "createdBy": "string (uuid)",
  "createdAt": "2026-01-09T10:30:00Z",
  "updatedAt": "2026-01-09T10:30:00Z"
}
```

### 5. `create-task-error-400.json`
**Source:** `POST /api/tasks` (400 response)

Expected content:
```json
{
  "type": "https://...",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Title is required and must be 1-255 characters",
  "instance": "/api/tasks"
}
```

## How to Capture Snapshots

### Option 1: Using Postman
1. Open Postman
2. Add request: `GET /api/task-config/priorities`
3. Add Authorization header with Bearer token
4. Click Send
5. Copy response JSON
6. Paste into file

### Option 2: Using curl
```bash
curl -X GET "http://api.local/api/task-config/priorities" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json" \
  | jq . > task-priorities.json
```

### Option 3: Using Insomnia
1. Create request for each endpoint
2. Set authorization
3. Send request
4. Copy raw JSON response
5. Save to file

## Instructions for HUMAN

Please provide these 5 JSON files:

1. [ ] `task-priorities.json` - From GET /api/task-config/priorities
2. [ ] `checklist-templates.json` - From GET /api/checklist-templates
3. [ ] `conversation-members.json` - From GET /api/conversations/{id}
4. [ ] `create-task-success.json` - From POST /api/tasks (201 success)
5. [ ] `create-task-error-400.json` - From POST /api/tasks (400 error)

Once these are provided, AI can:
- Generate types from responses
- Create accurate test mocks
- Validate API contracts
- Implement component tests

## Status
⏳ **Waiting for HUMAN** to provide actual API responses
