# API Snapshots - Mark As Read

> **Version:** v1  
> **Captured:** 2026-01-26  
> **Environment:** DEV (vega-chat-api-dev.allianceitsc.com)

---

## 📋 Available Snapshots

| File                         | Description                              | Status Code |
| ---------------------------- | ---------------------------------------- | ----------- |
| `success-mark-all.json`      | Mark all messages as read (no messageId) | 200         |
| `success-mark-specific.json` | Mark up to specific messageId            | 200         |
| `error-404.json`             | Conversation not found                   | 404         |
| `error-403.json`             | User not a member                        | 403         |

---

## 🔧 How to Capture Snapshots Manually

### Prerequisites

- **Test Account:** Available in `.env.local`
  ```bash
  TEST_EMAIL=test@example.com
  TEST_PASSWORD=test_password
  ```
- **Access Token:** Login via `/api/auth/login` first to get token

### Step 1: Login and Get Token

```bash
curl -X POST https://vega-chat-api-dev.allianceitsc.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test_password"
  }' \
  | jq -r '.accessToken' > token.txt
```

### Step 2: Mark All Messages As Read

```bash
TOKEN=$(cat token.txt)
CONVERSATION_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST https://vega-chat-api-dev.allianceitsc.com/api/conversations/${CONVERSATION_ID}/mark-read \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v > success-mark-all.json 2>&1
```

### Step 3: Mark Up To Specific Message

```bash
MESSAGE_ID="660e8400-e29b-41d4-a716-446655440111"

curl -X POST https://vega-chat-api-dev.allianceitsc.com/api/conversations/${CONVERSATION_ID}/mark-read \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"messageId\": \"${MESSAGE_ID}\"}" \
  -v > success-mark-specific.json 2>&1
```

### Step 4: Test Error Cases

**404 - Conversation Not Found:**

```bash
INVALID_ID="00000000-0000-0000-0000-000000000000"

curl -X POST https://vega-chat-api-dev.allianceitsc.com/api/conversations/${INVALID_ID}/mark-read \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v > error-404.json 2>&1
```

**403 - Not a Member:**

```bash
# Use another user's conversation ID that test user is not a member of
OTHER_CONVERSATION_ID="770e8400-e29b-41d4-a716-446655440099"

curl -X POST https://vega-chat-api-dev.allianceitsc.com/api/conversations/${OTHER_CONVERSATION_ID}/mark-read \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v > error-403.json 2>&1
```

---

## 📊 Snapshot Format

Each snapshot file should contain:

```json
{
  "_meta": {
    "capturedAt": "2026-01-26T10:30:00Z",
    "environment": "dev",
    "endpoint": "POST /api/conversations/{id}/mark-read",
    "testAccount": "test@example.com"
  },
  "_request": {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "body": {}
  },
  "_response": {
    "status": 200,
    "headers": {
      "content-type": "application/json"
    },
    "body": {}
  }
}
```

---

## ⚠️ Notes

- **No Response Body:** API returns `200 OK` with empty body for success cases
- **Actual Snapshots:** Paste actual JSON responses captured from API into files above
- **Privacy:** Do NOT commit real tokens or sensitive data - use placeholders
- **Watermark:** Response data should contain watermarks if needed (per company policy)

---

## 🚀 Next Steps

1. Run cURL commands above to capture actual responses
2. Save responses into respective `.json` files
3. Commit snapshot files to Git (after removing sensitive data)
4. Update `contract.md` to link to these snapshots
