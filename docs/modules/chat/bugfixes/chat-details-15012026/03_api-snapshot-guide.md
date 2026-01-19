# API Snapshots - How to Capture

**Location:** `docs/api/chat/messages/snapshots/v1/`  
**Purpose:** Capture actual API responses to verify implementation

---

## 📋 Required Snapshots

1. `success-page1.json` - First page (no cursor)
2. `success-page2.json` - Second page (with cursor)
3. `success-last-page.json` - Last page (hasMore/hasNext = false)
4. `error-401.json` - Unauthorized error

---

## 🔧 Method 1: Using Swagger UI

### Step 1: Open Swagger

https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

### Step 2: Authorize

1. Click **Authorize** button (top right)
2. Paste your Bearer token
3. Click **Authorize**, then **Close**

### Step 3: Get First Page

1. Find endpoint: `GET /api/conversations/{id}/messages`
2. Click **Try it out**
3. Fill parameters:
   - `id`: Your conversation GUID (pick one with 100+ messages)
   - `limit`: 50 (optional)
   - Leave cursor empty
4. Click **Execute**
5. Copy entire Response body JSON
6. Save as `success-page1.json`

### Step 4: Get Second Page

1. From `success-page1.json`, find the cursor field (could be `nextCursor`, `cursor`, etc.)
2. Copy cursor value
3. In Swagger, click **Try it out** again
4. Fill parameters:
   - `id`: Same conversation GUID
   - `limit`: 50
   - `cursor`: Paste cursor value
5. Click **Execute**
6. Copy Response body
7. Save as `success-page2.json`

### Step 5: Get Last Page (Optional)

1. Keep calling with cursor until `hasMore`/`hasNext` = false
2. Save that response as `success-last-page.json`

---

## 🔧 Method 2: Using PowerShell

### Prerequisites

```powershell
# Set environment variables
$BASE_URL = "https://vega-chat-api-dev.allianceitsc.com"
$TOKEN = "your_bearer_token_here"
$CONVERSATION_ID = "your_conversation_guid_here"
```

### Capture First Page

```powershell
# Create output directory
New-Item -Path "docs/api/chat/messages/snapshots/v1" -ItemType Directory -Force

# Get first page
$response = Invoke-RestMethod `
  -Uri "$BASE_URL/api/conversations/$CONVERSATION_ID/messages?limit=50" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Accept" = "application/json"
  }

# Save to file
$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "docs/api/chat/messages/snapshots/v1/success-page1.json" -Encoding UTF8

Write-Host "✅ Saved success-page1.json"
Write-Host "Cursor: $($response.cursor)" # Or $response.nextCursor
```

### Capture Second Page

```powershell
# Get cursor from first response
$cursor = $response.cursor # Or $response.nextCursor

# Get second page
$response2 = Invoke-RestMethod `
  -Uri "$BASE_URL/api/conversations/$CONVERSATION_ID/messages?limit=50&cursor=$cursor" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Accept" = "application/json"
  }

# Save to file
$response2 | ConvertTo-Json -Depth 10 | Out-File -FilePath "docs/api/chat/messages/snapshots/v1/success-page2.json" -Encoding UTF8

Write-Host "✅ Saved success-page2.json"
```

---

## 📝 What to Check in Snapshots

After capturing, verify these in the JSON files:

### 1. Response Structure

```json
{
  "items": [...],          // Array of messages
  "hasMore": true,         // ⚠️ Or hasNext?
  "nextCursor": "...",     // ⚠️ Or cursor?
  "totalCount": 123        // Optional
}
```

### 2. Field Names to Verify

- [ ] Pagination flag: `hasMore`, `hasNext`, or `hasPrevious`?
- [ ] Cursor field: `cursor`, `nextCursor`, `previousCursor`, or `before`?
- [ ] Items array: `items`, `messages`, or `data`?

### 3. Message Object Structure

```json
{
  "id": "guid",
  "conversationId": "guid",
  "content": "text",
  "senderId": "guid",
  "senderName": "string",
  "senderAvatarUrl": "url",
  "createdAt": "2026-01-15T10:00:00Z",
  "contentType": "TXT",
  "attachments": [...],
  // ... other fields
}
```

---

## ✅ Verification Checklist

After capturing snapshots, verify:

- [ ] `success-page1.json` exists and is valid JSON
- [ ] `success-page2.json` exists and is valid JSON
- [ ] Both files have different cursor values
- [ ] Field names are consistent between pages
- [ ] Message objects have required fields
- [ ] Can answer Critical Questions in [03_api-contract.md](../../03_api-contract.md)

---

## 🔗 Next Steps

1. Capture snapshots using one of the methods above
2. Open [03_api-contract.md](../../03_api-contract.md)
3. Answer the Critical Questions table
4. Tick ✅ Contract READY checkbox
5. Notify AI to proceed with implementation
