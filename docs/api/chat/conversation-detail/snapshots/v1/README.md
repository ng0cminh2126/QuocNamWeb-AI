# Snapshots - Conversation Detail API

## Hướng Dẫn Capture

### Get Messages

```bash
curl -X GET "https://[API_URL]/api/conversations/[ID]/messages?limit=50" \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  > get-messages-success.json
```

### Send Message

```bash
curl -X POST "https://[API_URL]/api/conversations/[ID]/messages" \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}' \
  > send-message-success.json
```

---

## Files Cần Tạo

| File                             | Description            | Status     |
| -------------------------------- | ---------------------- | ---------- |
| `get-messages-success.json`      | Get messages response  | ⏳ Pending |
| `get-messages-empty.json`        | Empty conversation     | ⏳ Pending |
| `send-message-success.json`      | Send message response  | ⏳ Pending |
| `upload-attachment-success.json` | Upload file response   | ⏳ Pending |
| `error-401.json`                 | Unauthorized error     | ⏳ Pending |
| `error-404.json`                 | Conversation not found | ⏳ Pending |
