# How to Use Task_Swagger.json & Chat_Swagger.json for File Viewing

**Purpose:** Guide for understanding the API documentation and extracting relevant information  
**Created:** 2025-01-09

---

## 📖 What Are Swagger Files?

**Swagger** (OpenAPI) files are **API specifications** that describe:
- ✅ Available endpoints (GET, POST, PUT, DELETE, etc.)
- ✅ Request parameters (path, query, body)
- ✅ Response formats (JSON structure, data types)
- ✅ Error codes and status codes
- ✅ Authentication requirements
- ✅ Data validation rules

They're like a **blueprint** showing:
- What endpoints exist
- What data they accept
- What data they return

---

## 📡 Key Endpoints for File Viewing

### Chat API - GET /api/conversations/{conversationId}/messages

**Location in Swagger:** Chat_Swagger.json → paths → /api/conversations/{id}/messages → get

**What it does:**
- Fetches all messages from a conversation
- Messages contain `attachments` array with file metadata
- **This is our data source** for the "View All Files" feature

**Structure:**
```json
{
  "operationId": "GetMessages",
  "summary": "Get messages from conversation with pagination",
  "parameters": [
    {
      "name": "conversationId",
      "in": "path",
      "type": "string",
      "required": true
    },
    {
      "name": "limit",
      "in": "query",
      "type": "integer",
      "default": 50
    }
  ],
  "responses": {
    "200": {
      "description": "Success",
      "schema": {
        "$ref": "#/components/schemas/MessageListResult"
      }
    }
  }
}
```

---

## 📊 Response Data Structure

From **Chat_Swagger.json → components → schemas**:

### MessageDto (What we get back)
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "conversationId": { "type": "string" },
    "senderId": { "type": "string" },
    "senderName": { "type": "string" },
    "type": { 
      "enum": ["text", "image", "file", "system"],
      "type": "string"
    },
    "content": { "type": "string", "nullable": true },
    
    // ⭐ THIS IS WHAT WE NEED - Files are here!
    "attachments": {
      "type": "array",
      "items": { "$ref": "#/components/schemas/AttachmentDto" }
    },
    
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "isPinned": { "type": "boolean" }
  }
}
```

### AttachmentDto (File metadata)
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "fileId": { "type": "string" },          // ← Use for URLs
    "fileName": { "type": "string" },        // ← Display name
    "contentType": { "type": "string" },     // ← MIME type: "image/png", "application/pdf"
    "fileSize": { "type": "integer" },       // ← Bytes (convert to MB)
    "uploadedAt": { "type": "string", "format": "date-time" },  // ← Sort key
    "thumbnailUrl": { "type": "string", "nullable": true },
    "duration": { "type": "integer", "nullable": true },  // ← For videos
    "dimensions": {
      "type": "object",
      "properties": {
        "width": { "type": "integer" },
        "height": { "type": "integer" }
      }
    }
  }
}
```

---

## 🎯 How to Read the Swagger File

### Step 1: Find the endpoint
```
Chat_Swagger.json
  ↓
paths (all available endpoints)
  ↓
/api/conversations/{id}/messages (our endpoint)
  ↓
get (HTTP method)
```

### Step 2: Check parameters
```json
"parameters": [
  {
    "name": "conversationId",
    "in": "path",        // Goes in URL path
    "required": true,
    "schema": { "type": "string" }
  },
  {
    "name": "limit",
    "in": "query",       // Goes in URL query string
    "schema": { "type": "integer" }
  }
]
```

**Translation:**
```
URL format: GET /api/conversations/{conversationId}/messages?limit={limit}
Example: GET /api/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50
```

### Step 3: Check response format
```json
"responses": {
  "200": {
    "description": "Success",
    "schema": {
      "$ref": "#/components/schemas/MessageListResult"  // ← Look up this schema
    }
  }
}
```

**To find the schema:**
```
#/components/schemas/MessageListResult
  ↓
components section
  ↓
schemas subsection
  ↓
MessageListResult definition
```

### Step 4: Understand the schema
```json
"MessageListResult": {
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "items": { "$ref": "#/components/schemas/MessageDto" }  // ← Array of messages
    },
    "hasMore": { "type": "boolean" },      // ← More pages available?
    "oldestMessageId": { "type": "string" } // ← Cursor for pagination
  }
}
```

**Translation:**
```typescript
response = {
  data: MessageDto[],    // Array of messages
  hasMore: boolean,      // true if more messages exist
  oldestMessageId: string // Use this for next page
}
```

---

## 🔄 Full Example: Using the API

### 1. First Request
```
GET /api/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "msg-001",
      "senderName": "Nguyễn Văn A",
      "attachments": [
        {
          "fileId": "file-abc123",
          "fileName": "proposal.pdf",
          "contentType": "application/pdf",
          "fileSize": 2524288
        }
      ]
    },
    ... more messages ...
  ],
  "hasMore": true,
  "oldestMessageId": "msg-050"
}
```

### 2. Extract Files
```typescript
// From response.data array:
attachments = {
  id: "file-abc123",
  name: "proposal.pdf",
  url: "/api/files/file-abc123",      // Construct URL
  size: 2524288,                       // Format as 2.5 MB
  type: "pdf",                         // From contentType
  uploadedAt: message.createdAt
}
```

### 3. Next Page Request (if hasMore = true)
```
GET /api/conversations/550e8400-e29b-41d4-a716-446655440000/messages
  ?limit=50
  &before=msg-050    ← Use oldestMessageId from previous response

Response:
{
  "data": [ ... next 50 messages ... ],
  "hasMore": true,
  "oldestMessageId": "msg-100"
}
```

---

## 🔍 Key Fields for File Viewing

When reading Swagger, focus on these fields in AttachmentDto:

| Field | Source in Swagger | How to Use |
|-------|--|--|
| `fileId` | properties.fileId | Build URL: `/api/files/{fileId}` |
| `fileName` | properties.fileName | Display as file name |
| `contentType` | properties.contentType | Determine icon & category |
| `fileSize` | properties.fileSize | Convert to MB and display |
| `uploadedAt` | properties.uploadedAt | Sort files by date |
| `thumbnailUrl` | properties.thumbnailUrl | Show preview for images |
| `dimensions` | properties.dimensions | Image metadata |
| `duration` | properties.duration | Video length |

---

## ⚠️ Common Swagger Patterns

### $ref (References)
```json
"items": { "$ref": "#/components/schemas/AttachmentDto" }
```
**Means:** "Look up the definition of AttachmentDto in components/schemas"

### nullable
```json
"thumbnailUrl": { "type": "string", "nullable": true }
```
**Means:** This field can be `null` or a string

### enum (Fixed options)
```json
"type": { "enum": ["text", "image", "file", "system"] }
```
**Means:** Must be one of these 4 values

### array
```json
"attachments": {
  "type": "array",
  "items": { "$ref": "#/components/schemas/AttachmentDto" }
}
```
**Means:** This is an array where each item is an AttachmentDto

---

## 🧮 Converting Data Types

### File Size (bytes → human readable)
```
From Swagger: fileSize (type: integer)
Example: 2524288

Convert:
2524288 bytes
= 2524288 / 1024 = 2464 KB
= 2464 / 1024 = 2.41 MB

Display: "2.4 MB"
```

### Date (ISO 8601 → readable)
```
From Swagger: uploadedAt (type: string, format: date-time)
Example: "2025-01-08T14:30:00Z"

Convert: new Date("2025-01-08T14:30:00Z")
Display: "8 January 2025, 2:30 PM"
Or: "2 days ago"
```

### MIME Type → File Type
```
From Swagger: contentType (type: string)

Examples:
"image/png"       → Image
"image/jpeg"      → Image
"video/mp4"       → Video
"application/pdf" → PDF
"application/vnd.openxmlformats-officedocument.wordprocessingml.document" → Word
```

---

## 📚 Reading the Chat_Swagger.json File

### Structure Overview
```
Chat_Swagger.json
├── openapi: "3.0.1"              # Swagger version
├── info:
│   ├── title: "Vega Chat API"
│   ├── description: ...
│   └── version: "v1"
│
├── paths:                        # ← All endpoints go here
│   ├── /api/conversations
│   ├── /api/conversations/{id}/messages    ← We use this one
│   ├── /api/groups
│   ├── /api/messages
│   └── ... more endpoints ...
│
├── components:                   # ← All data types go here
│   ├── schemas:
│   │   ├── MessageDto            ← Look up message structure
│   │   ├── AttachmentDto         ← Look up file structure
│   │   ├── MessageListResult
│   │   └── ... more types ...
│   │
│   └── securitySchemes:
│       └── Bearer: JWT token required
│
└── security:
    └── Bearer: []                # API requires token
```

### How to Search Swagger

1. **Find endpoint:** `paths` → endpoint path → HTTP method
2. **Find parameters:** Look at `parameters` array
3. **Find response:** Look at `responses` → HTTP code (200, 400, etc.) → schema
4. **Find schema:** `components` → `schemas` → schema name
5. **Follow $ref:** If schema has `$ref`, jump to that schema definition

---

## 🚀 Practical Example: Build File URL

### From Swagger to Code

**In Swagger:**
```json
"AttachmentDto": {
  "properties": {
    "fileId": { "type": "string" }
  }
}
```

**In Code:**
```typescript
// Get from API response
const attachment: AttachmentDto = {
  fileId: "file-abc123",
  fileName: "proposal.pdf"
};

// Build URL (following standard REST pattern)
const fileUrl = `/api/files/${attachment.fileId}`;

// Use for preview/download
<img src={fileUrl} />           // Image
<a href={fileUrl} download>     // Download
<iframe src={fileUrl} />        // PDF
```

---

## ⚡ Quick Reference - File Viewing Implementation

### What API provides (from Swagger)
✅ GET /api/conversations/{id}/messages → MessageDto[] with attachments

### What we extract (on frontend)
✅ Loop through message.attachments array
✅ For each attachment, use:
- `fileId` → Build download URL
- `fileName` → Display name
- `contentType` → Determine type (image, pdf, etc.)
- `fileSize` → Format and display
- `uploadedAt` → Sort by date

### What we don't need (from Task API)
❌ Task_Swagger.json is for task management
❌ File viewing doesn't directly use task API
✅ But shows patterns for file handling in other modules

---

## 📞 Questions to Ask Backend Team

When reviewing Swagger:

1. **Pagination:**
   - Is `oldestMessageId` always provided?
   - What happens when hasMore=false?

2. **Attachments:**
   - Can a message have multiple attachments?
   - Is `attachments` array ever empty vs null?

3. **Thumbnails:**
   - Do all images have `thumbnailUrl`?
   - What's the thumbnail size?

4. **Files:**
   - What's the max file size allowed?
   - Are there file type restrictions?

5. **URLs:**
   - Is `/api/files/{fileId}` the correct download endpoint?
   - Do we need authentication for file downloads?

---

## ✅ Checklist: Reading API Documentation

- [ ] Found the endpoint in `paths` section
- [ ] Identified HTTP method (GET, POST, etc.)
- [ ] Listed all required parameters
- [ ] Found response schema definition
- [ ] Followed all $ref chains to leaf schemas
- [ ] Identified data types (string, integer, array, object)
- [ ] Noted nullable fields
- [ ] Checked for authentication requirements
- [ ] Reviewed error responses (400, 401, 404, 500)

---

**Status:** ✅ Ready to Reference  
**Created:** 2025-01-09
