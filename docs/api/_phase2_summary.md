# API Documentation Summary - Phase 2 Updates

> **Updated:** 2026-01-14  
> **Phase:** File Upload Phase 2 - Batch Upload & Multiple Attachments

---

## 🆕 New API Contracts

### 1. Batch File Upload

- **File:** [docs/api/file/batch-upload/contract.md](./file/batch-upload/contract.md)
- **Endpoint:** `POST /api/Files/batch`
- **Status:** ⏳ PENDING SNAPSHOTS
- **Description:** Upload nhiều file cùng lúc trong 1 request
- **Snapshots Required:**
  - ✅ Priority 1: `success-3-files.json`
  - ✅ Priority 1: `error-401-unauthorized.json`
  - ⏳ See [snapshots README](./file/batch-upload/snapshots/v1/README.md)

### 2. Send Message with Multiple Attachments

- **File:** [docs/api/chat/message-send-with-multiple-attachments/contract.md](./chat/message-send-with-multiple-attachments/contract.md)
- **Endpoint:** `POST /api/messages`
- **Status:** ⏳ PENDING SNAPSHOTS
- **Version:** v2.0.0 (Breaking change from v1.0)
- **Description:** Gửi tin nhắn với nhiều file đính kèm
- **Breaking Changes:**
  - `attachment` (single) → `attachments` (array)
- **Snapshots Required:**
  - ✅ Priority 1: `success-3-attachments.json`
  - ✅ Priority 2: `success-1-attachment.json`
  - ⏳ See [snapshots README](./chat/message-send-with-multiple-attachments/snapshots/v2/README.md)

---

## 📊 API Changes Impact

| API                     | Phase 1 (Old)         | Phase 2 (New)         | Impact       |
| ----------------------- | --------------------- | --------------------- | ------------ |
| File Upload             | Single file only      | Batch upload support  | **ADDITIVE** |
| Send Message - Request  | `attachment` (single) | `attachments` (array) | **BREAKING** |
| Send Message - Response | `attachments` (array) | Same (already array)  | No change    |

---

## 🔄 Migration Path

### For Developers:

1. **Review Contracts:**

   - Read batch upload contract
   - Read send message v2 contract
   - Note breaking changes

2. **Capture Snapshots:**

   - Priority 1: Core success cases
   - Priority 2: Error cases
   - See individual snapshot READMEs

3. **Update Types:**

   ```typescript
   // OLD (Phase 1)
   interface SendMessageRequest {
     attachment?: AttachmentInputDto; // Single
   }

   // NEW (Phase 2)
   interface SendMessageRequest {
     attachments?: AttachmentInputDto[]; // Array
   }
   ```

4. **Update Code:**
   - API clients: Add `uploadFilesBatch()`
   - Hooks: Add `useUploadFilesBatch()`
   - Components: Update form handling
   - Message bubbles: Add image grid rendering

---

## ⚠️ BLOCKING ISSUES

### Cannot Proceed Until:

1. **Snapshots Captured:**

   - [ ] Batch upload: `success-3-files.json`
   - [ ] Send message: `success-3-attachments.json`
   - [ ] Both: `error-401-unauthorized.json`

2. **Contracts Approved:**

   - [ ] Batch upload contract reviewed by HUMAN
   - [ ] Send message contract reviewed by HUMAN

3. **Requirements Approved:**
   - [ ] [01_requirements.md](../modules/chat/features/file-upload-phase-2/01_requirements.md) status = ✅ APPROVED

---

## 📋 Next Steps

### Step 1: HUMAN Actions (CURRENT)

- [ ] Review batch upload contract
- [ ] Review send message contract
- [ ] Capture priority snapshots
- [ ] Approve contracts (tick ✅ in HUMAN CONFIRMATION sections)

### Step 2: Requirements Approval

- [ ] Review [01_requirements.md](../modules/chat/features/file-upload-phase-2/01_requirements.md)
- [ ] Fill PENDING DECISIONS table
- [ ] Tick ✅ APPROVED để thực thi

### Step 3: Wireframe & Implementation Plan

- [ ] Create wireframe.md (image grid layouts)
- [ ] Create implementation-plan.md
- [ ] Approve both documents

### Step 4: Development

- [ ] AI can start coding (after all approvals)

---

## 🔗 Related Documents

### Feature Docs

- [File Upload Phase 2 - README](../modules/chat/features/file-upload-phase-2/00_README.md)
- [File Upload Phase 2 - Requirements](../modules/chat/features/file-upload-phase-2/01_requirements.md)

### Swagger References

- [File API Swagger](https://vega-file-api-dev.allianceitsc.com/swagger/index.html)
- [Chat API Swagger](https://vega-chat-api-dev.allianceitsc.com/swagger/index.html)

### Phase 1 (Baseline)

- [File Upload Phase 1 - Requirements](../modules/chat/features/file-upload/01_requirements.md)

---

## 📞 Support

If you encounter issues capturing snapshots:

1. Paste raw API responses in chat
2. AI will format and save to correct files
3. Tag files with `_meta.capturedBy: "manual"`
