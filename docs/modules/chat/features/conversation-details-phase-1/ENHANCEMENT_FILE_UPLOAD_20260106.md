# 📋 Feature Enhancement Summary - File Upload & Auto-Focus

> **Feature:** Conversation Detail  
> **Enhancement:** File Upload + Auto-focus Input  
> **Date:** 2026-01-06  
> **Status:** 📝 PENDING HUMAN REVIEW

---

## 🎯 Yêu Cầu

### 1. Upload File trong Chat

- **Mô tả:** User có thể gửi file đính kèm (ảnh, PDF, Excel, Word) trong tin nhắn
- **UI:** Button attach [📎] và image [🖼️] nằm bên cạnh khung "Nhập tin nhắn"
- **File types:**
  - Ảnh: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
  - Documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
- **Max size:** 10MB per file

### 2. Auto-focus Input

- **Mô tả:** Input "Nhập tin nhắn" tự động focus sau khi:
  1. Gửi tin nhắn thành công
  2. Attach file vào preview
- **UX:** User không cần click lại input để gõ tiếp

---

## 📄 Tài Liệu Đã Chuẩn Bị

### ✅ Completed Documents

| #   | Document                                                                | Status     | Description                                               |
| --- | ----------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| 1   | [01_requirements.md](./01_requirements.md)                              | ✅ Updated | Đã thêm FR-04.8 đến FR-04.11 cho file upload & auto-focus |
| 2   | [02a_wireframe.md](./02a_wireframe.md)                                  | ✅ Updated | Đã thêm UI spec chi tiết cho attach buttons, file preview |
| 3   | [06_testing.md](./06_testing.md)                                        | ✅ Created | Test coverage matrix + test cases mới (68 tests total)    |
| 4   | [API Contract - Upload File](../../../api/chat/upload-file/contract.md) | ✅ Created | API spec cho POST /upload endpoint                        |
| 5   | Snapshot README                                                         | ✅ Created | Hướng dẫn capture API snapshots                           |

---

## 📋 Checklist Để Bắt Đầu Code

### ⏳ PENDING - Cần HUMAN Action

| #   | Task                                                                       | Owner | Status     |
| --- | -------------------------------------------------------------------------- | ----- | ---------- |
| 1   | Review & approve [01_requirements.md](./01_requirements.md)                | HUMAN | ⬜ Pending |
| 2   | Điền PENDING DECISIONS (7-9) trong requirements                            | HUMAN | ⬜ Pending |
| 3   | Review & approve [02a_wireframe.md](./02a_wireframe.md)                    | HUMAN | ⬜ Pending |
| 4   | Review & approve [06_testing.md](./06_testing.md)                          | HUMAN | ⬜ Pending |
| 5   | Review & approve [API Contract](../../../api/chat/upload-file/contract.md) | HUMAN | ⬜ Pending |
| 6   | Capture API snapshots (upload file response)                               | HUMAN | ⬜ Pending |
| 7   | Điền PENDING DECISIONS trong API contract                                  | HUMAN | ⬜ Pending |

---

## 🔍 PENDING DECISIONS - Cần HUMAN Quyết Định

### Trong Requirements (01_requirements.md)

| #   | Question               | Options                                  | Your Decision   |
| --- | ---------------------- | ---------------------------------------- | --------------- |
| 7   | File types allowed     | Image + PDF only, or + Word/Excel?       | ⬜ ****\_\_**** |
| 8   | Multiple files at once | Allow upload many files, or single only? | ⬜ ****\_\_**** |
| 9   | Auto-focus delay       | 0ms (instant), 100ms, or 200ms?          | ⬜ ****\_\_**** |

### Trong API Contract

| #   | Question             | Options                          | Your Decision   |
| --- | -------------------- | -------------------------------- | --------------- |
| 1   | Storage location     | S3, Azure Blob, or local?        | ⬜ ****\_\_**** |
| 2   | File retention       | 30 days, 90 days, or forever?    | ⬜ ****\_\_**** |
| 3   | CDN for delivery     | CloudFront, CloudFlare, or none? | ⬜ ****\_\_**** |
| 4   | Thumbnail generation | Auto-generate for images?        | ⬜ ****\_\_**** |
| 5   | Virus scan           | Enable antivirus scan?           | ⬜ ****\_\_**** |

---

## 🎨 UI Preview (Summary)

### Desktop Input Area

```
┌─────────────────────────────────────────────────────────┐
│ 🆕 [📎] [🖼️]  │  Nhập tin nhắn... (auto-focus)  │ [Gửi] │
└─────────────────────────────────────────────────────────┘
    ↑    ↑
  Attach Image
  button button
```

### File Preview (khi có file đính kèm)

```
Đính kèm (2 files):
┌───────────────────────────────────────────┐
│ 📄 Report_Q4.pdf          2.5 MB    [❌] │
│ 📊 Sales_Data.xlsx        1.2 MB    [❌] │
└───────────────────────────────────────────┘

[📎] [🖼️]  │  Thêm ghi chú...          │ [Gửi]
```

---

## 🧪 Testing Plan Summary

### New Test Files Needed

1. **`useUploadFile.test.ts`** - 7 test cases

   - Upload success
   - File size validation
   - File type validation
   - Error handling

2. **`MessageInput.test.tsx`** - 12 test cases (4 mới)

   - AUTO-FOCUS: After send
   - AUTO-FOCUS: After file attach
   - File attach button click
   - File preview rendering

3. **`FileAttachmentPreview.test.tsx`** - 6 test cases (component mới)
   - Render file info
   - Remove button
   - Multiple files

**Total:** ~23 new test cases

---

## 🚀 Implementation Flow (Khi Được Approve)

```
1. Create API client
   └─ src/api/upload.api.ts
   └─ Test: upload.api.test.ts

2. Create upload hook
   └─ src/hooks/mutations/useUploadFile.ts
   └─ Test: useUploadFile.test.ts

3. Create FileAttachmentPreview component
   └─ src/components/FileAttachmentPreview.tsx
   └─ Test: FileAttachmentPreview.test.tsx

4. Update MessageInput component
   └─ Add attach buttons
   └─ Add auto-focus logic
   └─ Integrate useUploadFile hook
   └─ Update tests

5. Integration testing
   └─ Manual test upload flow
   └─ Verify auto-focus behavior
```

---

## ✅ HUMAN APPROVAL SECTION

### Step 1: Review Documents

- [ ] Đã đọc [01_requirements.md](./01_requirements.md)
- [ ] Đã đọc [02a_wireframe.md](./02a_wireframe.md)
- [ ] Đã đọc [06_testing.md](./06_testing.md)
- [ ] Đã đọc [API Contract](../../../api/chat/upload-file/contract.md)

### Step 2: Fill Decisions

- [ ] Đã điền PENDING DECISIONS trong requirements (câu 7-9)
- [ ] Đã điền PENDING DECISIONS trong API contract (câu 1-5)

### Step 3: Capture Snapshots

- [ ] Đã chạy API server
- [ ] Đã upload file test → copy response vào `snapshots/v1/success.json`
- [ ] Đã test error cases → copy vào error snapshots
- [ ] Đã commit snapshot files

### Step 4: Final Approval

- [ ] Tất cả documents đã review
- [ ] Tất cả decisions đã điền
- [ ] Snapshots đã có
- [ ] **APPROVED để bắt đầu coding** ✅

**HUMAN Signature:** ******\_\_\_\_******  
**Date:** ******\_\_\_\_******

---

## 📞 Next Steps

**Sau khi HUMAN approve:**

1. AI sẽ implement theo thứ tự:

   - API client + tests
   - Upload hook + tests
   - Preview component + tests
   - Update MessageInput + tests
   - Integration testing

2. Mỗi bước sẽ:

   - Tạo code
   - Tạo tests
   - Run tests verify pass
   - Commit với conventional commit message

3. Cuối cùng:
   - Update progress document
   - Run full test suite
   - Build production
   - Ready for review

---

## 📎 Quick Links

- [Requirements](./01_requirements.md)
- [Wireframe](./02a_wireframe.md)
- [API Contract](../../../api/chat/upload-file/contract.md)
- [Testing](./06_testing.md)
- [Feature README](./00_README.md)

---

**⚠️ REMINDER: AI sẽ KHÔNG code cho đến khi HUMAN approve tất cả documents trên.**
