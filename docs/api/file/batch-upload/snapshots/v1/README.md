# Snapshots for Batch Upload API

> **API:** POST /api/Files/batch  
> **Version:** v1  
> **Status:** ⏳ PENDING (Waiting for HUMAN to capture)

---

## 📋 Required Snapshots

### ✅ Success Cases

- [ ] **success-3-files.json** - Upload 3 files thành công (mixed types: pdf, jpg, xlsx)
- [ ] **success-1-file.json** - Upload 1 file (để so sánh với single API)
- [ ] **success-max-files.json** - Upload 10 files (max limit)

### ⚠️ Partial Success Cases

- [ ] **partial-success.json** - 2/3 files thành công, 1 file fail (size exceeded)
- [ ] **partial-invalid-type.json** - 1 file thành công, 1 file fail (invalid type)

### ❌ Error Cases

- [ ] **error-400-no-files.json** - Request không có file nào
- [ ] **error-400-size-exceeded.json** - Tổng size > 50MB
- [ ] **error-400-too-many-files.json** - Số file > 10
- [ ] **error-401-unauthorized.json** - Missing hoặc invalid token
- [ ] **error-413-payload-too-large.json** - Request quá lớn (server limit)

---

## 🔧 How to Capture

### Using cURL:

```bash
# Success case - 3 files
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files/batch" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@test-file1.pdf" \
  -F "files=@test-file2.jpg" \
  -F "files=@test-file3.xlsx" \
  -o success-3-files.json

# Error case - No files
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files/batch" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o error-400-no-files.json

# Error case - Unauthorized
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files/batch" \
  -F "files=@test.pdf" \
  -o error-401-unauthorized.json
```

### Using Postman:

1. Create new POST request to `https://vega-file-api-dev.allianceitsc.com/api/Files/batch`
2. Authorization tab → Type: Bearer Token → Paste your token
3. Body tab → form-data
4. Add multiple rows with key = "files", type = File
5. Select files to upload
6. Send request
7. Copy response JSON and save to appropriate file

---

## 📝 Snapshot Template

Each snapshot should follow this format (if capturing manually):

```json
{
  "_meta": {
    "capturedAt": "2026-01-14T10:30:00Z",
    "environment": "dev",
    "apiVersion": "v1",
    "tester": "HUMAN_NAME"
  },
  "_request": {
    "method": "POST",
    "endpoint": "/api/Files/batch",
    "filesCount": 3,
    "totalSize": "7.8 MB",
    "fileNames": ["report.pdf", "photo.jpg", "data.xlsx"]
  },
  "_response": {
    "status": 200,
    "body": {
      // Actual API response here
    }
  }
}
```

**Or simply paste the raw API response** (preferred for simplicity).

---

## ⚠️ HUMAN ACTION REQUIRED

**Vui lòng capture các snapshots sau và save vào folder này:**

1. `success-3-files.json` - **PRIORITY HIGH** (needed for development)
2. `error-401-unauthorized.json` - **PRIORITY HIGH** (needed for error handling)
3. Các snapshots còn lại - **PRIORITY MEDIUM**

**Sau khi capture xong:**

1. Update contract.md với link tới snapshots
2. Tick ✅ vào các snapshots đã có trong README này
3. Update contract status từ ⏳ PENDING → ✅ READY

---

## 📧 Contact

Nếu gặp khó khăn khi capture, vui lòng:

- Paste response trực tiếp vào chat
- AI sẽ format và save vào file
