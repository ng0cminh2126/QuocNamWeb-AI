# Updated Requirements - 2026-01-15

**Date:** 2026-01-15 14:30  
**Changes:** Thêm logic check dung lượng 100MB + Verify API pagination

---

## 🔄 Changes Made

### 1. File Upload: Thêm Total Size Limit Logic

**Yêu cầu mới từ HUMAN:**

> "với trường hợp bị lố dung lượng không cho upload nữa thì cũng disable button và có toast message khi lỡ chọn file quá nặng."

**Behavior mới:**

1. **Disable buttons khi approaching 100MB:**

   - Nếu còn < 1KB space → Disable cả 2 buttons (Paperclip và Image)
   - Tooltip: "Đã đạt giới hạn (10 file hoặc 100MB)"

2. **Check total size TRƯỚC khi check file count:**

   ```typescript
   // STEP 1: Check size first (highest priority)
   const currentTotalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0);
   const newFilesSize = fileArray.reduce((sum, f) => sum + f.size, 0);
   const MAX_TOTAL_SIZE = 100 * 1024 * 1024;
   const remainingSize = MAX_TOTAL_SIZE - currentTotalSize;

   if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
     toast.error(
       remainingSize <= 0
         ? "Đã đạt giới hạn 100MB. Vui lòng xóa file cũ để chọn file mới."
         : `Tổng dung lượng vượt quá 100MB. Còn trống ${formatFileSize(remainingSize)}.`
     );
     return;
   }

   // STEP 2: Then check file count
   if (fileArray.length > remainingSlots) { ... }
   ```

3. **Toast messages chi tiết:**
   - Khi = 100MB: "Đã đạt giới hạn 100MB. Vui lòng xóa file cũ..."
   - Khi vượt: "Tổng dung lượng vượt quá 100MB. Còn trống 5MB." (hiển thị remaining)

**Files updated:**

- ✅ [00_README.md](./00_README.md) - Acceptance criteria (3 cases mới)
- ✅ [01_requirements.md](./01_requirements.md) - Logic & table (12 cases total)
- ✅ [04_implementation-plan.md](./04_implementation-plan.md) - Step 2.2 & 2.3
- ✅ [06_testing.md](./06_testing.md) - Test 2.8 & 2.9 mới

---

### 2. API Pagination: Cần Verify Swagger

**Phát hiện từ HUMAN:**

> "cần kiểm tra lại swagger. Tui thấy api /conversations/{id}/message không có nhận cursor gì hết á."

**⚠️ CRITICAL ISSUE:**

API `GET /api/conversations/{id}/messages` có thể **KHÔNG hỗ trợ pagination**!

**Cần verify ngay:**

1. **Mở Swagger UI:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

2. **Kiểm tra endpoint `/api/conversations/{id}/messages`:**

   - [ ] API có param pagination không? (`cursor`, `before`, `after`, `page`, `offset`?)
   - [ ] Response có field `hasMore` / `hasNext` không?
   - [ ] Response có field `nextCursor` / `cursor` / `next` không?

3. **Kết quả:**
   - **Nếu KHÔNG có pagination** → Bug #1 KHÔNG thể fix (API limitation)
   - **Nếu CÓ pagination** → Cần update param names trong code

**Impact:**

- 🔴 **Bug #1 BLOCKED** cho đến khi có kết quả verify
- Code hiện tại giả định có `cursor` param → Có thể sai
- Cần HUMAN capture API snapshot để xác định chính xác structure

**Files updated:**

- ✅ [00_README.md](./00_README.md) - Added warning
- ✅ [01_requirements.md](./01_requirements.md) - Added CRITICAL WARNING section
- ✅ [03_api-contract.md](./03_api-contract.md) - Added verification checklist

---

## 📋 Next Actions for HUMAN

### Priority 1: Verify API Pagination (BLOCKING Bug #1)

1. Mở Swagger: https://vega-chat-api-dev.allianceitsc.com/swagger/index.html
2. Tìm endpoint `GET /api/conversations/{id}/messages`
3. Kiểm tra:
   - [ ] Request parameters (có cursor/page/offset không?)
   - [ ] Response structure (có hasMore/nextCursor không?)
4. Capture response snapshot theo [03_api-snapshot-guide.md](./03_api-snapshot-guide.md)

**Nếu KHÔNG có pagination:**

- → Cần liên hệ Backend team để thêm pagination
- → Hoặc đóng Bug #1 (cannot fix - API limitation)

**Nếu CÓ pagination:**

- → Paste snapshot vào docs/api/chat/messages/snapshots/v1/
- → AI sẽ update code với param names đúng

---

### Priority 2: Review & Approve Documents

**Before implementation, HUMAN PHẢI approve:**

1. ✅ Review [01_requirements.md](./01_requirements.md)

   - Kiểm tra 12 acceptance criteria cho Bug #2
   - Kiểm tra API verification warning cho Bug #1

2. ✅ Review [04_implementation-plan.md](./04_implementation-plan.md)

   - Verify logic check size TRƯỚC count
   - Verify toast messages

3. ✅ Review [06_testing.md](./06_testing.md)

   - Verify Test 2.8 (total size > 100MB)
   - Verify Test 2.9 (disable when approaching 100MB)

4. ✅ Tick APPROVED checkbox trong mỗi document

**⛔ AI KHÔNG ĐƯỢC code cho đến khi có APPROVED!**

---

## 📊 Summary

| Aspect             | Status              | Notes                                |
| ------------------ | ------------------- | ------------------------------------ |
| **Bug #1**         | ⏳ BLOCKED          | Chờ verify API có pagination không   |
| **Bug #2**         | ✅ Ready to approve | Đã update với total size limit logic |
| **Documentation**  | ✅ Complete         | 7 files updated                      |
| **Testing**        | ✅ Complete         | 2 test cases mới (2.8, 2.9)          |
| **Implementation** | ⏳ Pending approval | Chờ HUMAN approve documents          |

---

## 🔗 Updated Documents

1. [00_README.md](./00_README.md) - Overview & acceptance criteria
2. [01_requirements.md](./01_requirements.md) - Detailed specs với size logic
3. [03_api-contract.md](./03_api-contract.md) - API verification checklist
4. [04_implementation-plan.md](./04_implementation-plan.md) - Implementation với size checks
5. [06_testing.md](./06_testing.md) - Test cases với 2.8 & 2.9 mới

---

**Last Updated:** 2026-01-15 14:30  
**AI:** GitHub Copilot (Claude Sonnet 4.5)
