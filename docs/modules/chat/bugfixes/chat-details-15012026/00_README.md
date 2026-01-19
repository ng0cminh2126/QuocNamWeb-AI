# Chat Details Phase 7 - Critical Bugfixes

**Feature:** Chat Details Bugfixes (Load More & File Upload Limits)  
**Module:** Chat  
**Type:** Bugfix  
**Status:** ⏳ Pending Analysis  
**Created:** 2026-01-15  
**Priority:** 🔴 High

---

## 📋 Overview

Sửa 2 lỗi critical trong chat details:

### 🐛 Bug #1: Load More Messages (Tải tin nhắn cũ hơn) không hoạt động

- **Hiện tượng:** Khi nhấn "Tải thêm tin nhắn cũ", không load được tin nhắn
- **API:** `GET /api/conversations/{id}/messages`
- **✅ VERIFIED:** API dùng `beforeMessageId` (UUID), KHÔNG phải `cursor`
- **Request Params:**
  - `id` (path, required): UUID của conversation
  - `limit` (query, default=50): Số lượng message
  - `beforeMessageId` (query, optional, UUID): Load messages trước message ID này
- **Response:**
  - `items`: Array<MessageDto>
  - `nextCursor`: UUID (null nếu hết)
  - `hasMore`: boolean
- **Swagger:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

### 🐛 Bug #2: File Upload Limit Logic sai

- **Hiện tượng:**
  - Validation logic không nhất quán
  - Error messages gây confusing cho user
- **Yêu cầu mới:**
  - Giới hạn cứng: **Tối đa 10 file** (cả hình và file khác)
  - Tổng dung lượng: **Tối đa 100MB**
  - **KHÔNG cho chọn thêm** khi đã đủ 10 file (disable input)

---

## 📁 Affected Files (Initial Analysis)

### Bug #1 - Load More:

- `src/hooks/queries/useMessages.ts` - Infinite query hook
- `src/api/messages.api.ts` - API client
- `src/features/portal/components/chat/ChatMainContainer.tsx` - Load more button logic

### Bug #2 - Upload Limit:

- `src/features/portal/components/chat/ChatMainContainer.tsx` - File selection handler
- `src/utils/fileValidation.ts` - Validation logic
- `src/utils/fileHelpers.ts` - Batch validation
- `src/hooks/useFileValidation.ts` - Validation hook
- `src/types/files.ts` - DEFAULT_FILE_RULES constant

---

## 📝 Documents (7-Step Workflow)

| Step | Document                                           | Status                 |
| ---- | -------------------------------------------------- | ---------------------- |
| 1    | [Requirements](./01_requirements.md)               | ⏳ Pending             |
| 2A   | Wireframe                                          | ❌ N/A (No UI changes) |
| 2B   | Flow                                               | ❌ N/A (Bugfix only)   |
| 3    | [API Contract](./03_api-contract.md)               | ⏳ Pending             |
| 4    | [Implementation Plan](./04_implementation-plan.md) | ⏳ Pending             |
| 4.5  | [Testing Requirements](./06_testing.md)            | ⏳ Pending             |
| 5    | Progress                                           | ⬜ Not Started         |
| 6    | Testing Documentation                              | ⬜ Not Started         |
| 7    | E2E Testing                                        | ⬜ Optional            |

---

## ⚠️ Breaking Changes

- [ ] None expected - Pure bugfixes

---

## 🔗 Related Documents

- Original implementation: [docs/modules/chat/features/](../../features/)
- Previous bugfix: [docs/modules/chat/bugfixes/20260113_critical_fixes.md](../20260113_critical_fixes.md)

---

## 📊 Acceptance Criteria

### Bug #1 - Load More:

**Manual Load More:**

- [x] Khi scroll lên đầu danh sách tin nhắn, hiển thị button "Tải thêm"
- [x] Click "Tải thêm" → Load tin nhắn cũ hơn thành công
- [x] Tin nhắn mới load append vào đầu danh sách
- [x] Không có tin nhắn cũ hơn → Ẩn button "Tải thêm"
- [x] Sử dụng cursor từ API response

**Auto-load to Starred/Pinned (NEW):**

- [x] Click starred message (đã load) → Scroll đến, highlight
- [x] Click starred message (chưa load) → Auto-load cho đến khi tìm thấy, scroll + highlight
- [x] Click pinned message (chưa load) → Auto-load cho đến khi tìm thấy, scroll + highlight
- [x] Show loading overlay "Đang tìm tin nhắn..." khi auto-load
- [x] Tin nhắn không tồn tại → Load hết, toast "Không tìm thấy tin nhắn"
- [x] User có thể cancel khi đang auto-load

### Bug #2 - Upload Limit:

- [x] Chọn file lần 1 (5 file) → Thành công, hiển thị 5 previews
- [x] Chọn file lần 2 (5 file) → Thành công, tổng 10 previews
- [x] Chọn file lần 3 (1 file) → **Bị chặn**, toast "Đã đủ 10 file"
- [x] **Cả 2 nút Paperclip và Image bị disable** khi đã 10 file
- [x] Xóa 1 file → Buttons enable lại, cho phép chọn thêm
- [x] Chọn 11 file 1 lần → **Lấy 10 file đầu**, bỏ file thứ 11, toast "Chỉ chọn được 10 file. Đã tự động bỏ 1 file."
- [x] Tổng dung lượng hiện tại + file mới > 100MB → **Bị chặn**, toast "Tổng dung lượng vượt quá 100MB. Vui lòng chọn file nhỏ hơn."
- [x] Đã có 95MB files, chọn thêm file 10MB → **Bị chặn**, toast với remaining capacity
- [x] Buttons disabled khi tổng dung lượng gần 100MB (không đủ chỗ cho file nhỏ nhất 1KB)
