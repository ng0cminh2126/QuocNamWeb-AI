# API Snapshots - Upload File

> **Endpoint:** POST `/api/chat/conversations/{conversationId}/upload`  
> **Version:** v1  
> **Last Updated:** 2026-01-06

---

## 📸 Cách Capture Snapshots

### Prerequisites

- API server đang chạy
- Access token hợp lệ
- File mẫu để test: `test-image.jpg`, `test-document.pdf`

### Capture Command

```bash
# Success case - Upload image
curl -X POST "https://api.example.com/api/chat/conversations/conv-123/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "type=image" \
  -o success.json

# Success case - Upload PDF
curl -X POST "https://api.example.com/api/chat/conversations/conv-123/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-document.pdf" \
  -F "type=document" \
  -o success-pdf.json

# Error case - File too large (use >10MB file)
curl -X POST "https://api.example.com/api/chat/conversations/conv-123/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large-file.pdf" \
  -o error-file-too-large.json

# Error case - Invalid file type
curl -X POST "https://api.example.com/api/chat/conversations/conv-123/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.exe" \
  -o error-invalid-type.json

# Error case - Unauthorized
curl -X POST "https://api.example.com/api/chat/conversations/conv-123/upload" \
  -F "file=@test-image.jpg" \
  -o error-401.json
```

---

## 📂 Snapshot Files Needed

| File                        | Description            | Status    |
| --------------------------- | ---------------------- | --------- |
| `success.json`              | Upload image success   | ⬜ Cần có |
| `success-pdf.json`          | Upload PDF success     | ⬜ Cần có |
| `error-file-too-large.json` | File > 10MB            | ⬜ Cần có |
| `error-invalid-type.json`   | Wrong file type (.exe) | ⬜ Cần có |
| `error-401.json`            | Unauthorized           | ⬜ Cần có |
| `error-403.json`            | Access denied          | ⬜ Cần có |
| `error-404.json`            | Conversation not found | ⬜ Cần có |

---

## ⚠️ IMPORTANT

**AI KHÔNG THỂ tự capture snapshots cho multipart/form-data requests.**

**HUMAN cần:**

1. Chạy API server
2. Sử dụng Postman, cURL, hoặc browser DevTools
3. Upload file thật
4. Copy response JSON vào snapshot files
5. Commit snapshots vào repo

**Sau khi có snapshots, update contract.md với link:**

```markdown
### Snapshots

- [success.json](snapshots/v1/success.json)
- [error-file-too-large.json](snapshots/v1/error-file-too-large.json)
```
