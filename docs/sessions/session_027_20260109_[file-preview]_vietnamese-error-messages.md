# Session 027: Vietnamese Error Messages for File Preview

> **Date:** 2026-01-09  
> **Module:** File Preview (Phase 3.2)  
> **Type:** Localization Enhancement  
> **Status:** ✅ COMPLETE

---

## 📋 Summary

**Task:** Chuyển tất cả error messages trong file preview system từ tiếng Anh sang tiếng Việt

**Context:** User báo lỗi "File not found" vẫn còn tiếng Anh, yêu cầu rà soát và chuyển toàn bộ sang tiếng Việt

**Result:** ✅ Hoàn thành - Tất cả error messages đã được localize sang tiếng Việt

---

## 🎯 Scope

### Files Updated:

1. **src/api/filePreview.api.ts**

   - Error messages trong catch blocks
   - JSDoc @throws comments

2. **src/hooks/usePdfPreview.ts**

   - Fallback error messages

3. **src/api/**tests**/filePreview.api.test.ts**
   - Test expectations để match với error messages mới

---

## 📝 Changes Detail

### 1. API Error Messages (filePreview.api.ts)

#### Error Messages Updated:

| Original (English)         | Updated (Vietnamese)         | Location      |
| -------------------------- | ---------------------------- | ------------- |
| `"File not found"`         | `"Không tìm thấy tệp"`       | Line 102      |
| `"Page not found"`         | `"Không tìm thấy trang"`     | Line 158      |
| `"Failed to load preview"` | `"Không thể tải xem trước"`  | Line 105      |
| `"Failed to render page"`  | `"Không thể hiển thị trang"` | Line 161      |
| `"Unknown error"`          | `"Lỗi không xác định"`       | usePdfPreview |

#### JSDoc Comments Updated:

```typescript
// BEFORE:
@throws Error if file not found (404) or network error

// AFTER:
@throws Error nếu không tìm thấy tệp (404) hoặc lỗi kết nối mạng
```

```typescript
// BEFORE:
@throws Error if page not found (404) or network error

// AFTER:
@throws Error nếu không tìm thấy trang (404) hoặc lỗi kết nối mạng
```

### 2. Hook Error Messages (usePdfPreview.ts)

```typescript
// BEFORE:
error: err instanceof Error ? err : new Error("Unknown error");

// AFTER:
error: err instanceof Error ? err : new Error("Lỗi không xác định");
```

**Occurrences:** 2 chỗ (lines 129, 197)

### 3. Test Cases Updated (filePreview.api.test.ts)

#### TC-AP-004: Handles 404 errors

```typescript
// BEFORE:
it('should throw "File not found" error for 404 on preview', async () => {
  await expect(getFilePreview({ fileId: mockFileId })).rejects.toThrow(
    "File not found"
  );
});

// AFTER:
it('should throw "Không tìm thấy tệp" error for 404 on preview', async () => {
  await expect(getFilePreview({ fileId: mockFileId })).rejects.toThrow(
    "Không tìm thấy tệp"
  );
});
```

```typescript
// BEFORE:
it('should throw "Page not found" error for 404 on render', async () => {
  await expect(
    renderPdfPage({ fileId: mockFileId, pageNumber: 999 })
  ).rejects.toThrow("Page not found");
});

// AFTER:
it('should throw "Không tìm thấy trang" error for 404 on render', async () => {
  await expect(
    renderPdfPage({ fileId: mockFileId, pageNumber: 999 })
  ).rejects.toThrow("Không tìm thấy trang");
});
```

#### TC-AP-005: Handles network errors

```typescript
// BEFORE:
await expect(getFilePreview({ fileId: mockFileId })).rejects.toThrow(
  "Failed to load preview"
);

// AFTER:
await expect(getFilePreview({ fileId: mockFileId })).rejects.toThrow(
  "Không thể tải xem trước"
);
```

```typescript
// BEFORE:
await expect(
  renderPdfPage({ fileId: mockFileId, pageNumber: 2 })
).rejects.toThrow("Failed to render page");

// AFTER:
await expect(
  renderPdfPage({ fileId: mockFileId, pageNumber: 2 })
).rejects.toThrow("Không thể hiển thị trang");
```

---

## ✅ Verification

### Files Already Vietnamese:

- ✅ `src/components/FilePreviewModal.tsx` - All UI text already in Vietnamese:
  - Loading state: "Đang tải trang {currentPage}..."
  - Error titles: "Không tìm thấy tệp", "Không có quyền truy cập", "Lỗi kết nối mạng", "Không thể tải tệp"
  - Buttons: "Thử lại", "Trang trước", "Trang sau"
  - Navigation: "Trang {currentPage} / {totalPages}"
  - Close button: "Đóng"

### Test Results:

```bash
# API tests với error messages mới
npm test -- filePreview.api.test.ts

# Kết quả: ✅ PASS
# - TC-AP-004: Handles 404 errors ✅
# - TC-AP-005: Handles network errors ✅
```

### Coverage:

| File Type  | Total Strings | Vietnamese | English | Coverage |
| ---------- | ------------- | ---------- | ------- | -------- |
| Error Msgs | 5             | 5          | 0       | 100%     |
| UI Labels  | 8             | 8          | 0       | 100%     |
| JSDoc      | 2             | 2          | 0       | 100%     |
| **TOTAL**  | **15**        | **15**     | **0**   | **100%** |

---

## 📊 Impact Summary

### Files Modified:

| File                                        | Changes            | Lines |
| ------------------------------------------- | ------------------ | ----- |
| `src/api/filePreview.api.ts`                | Error msgs + JSDoc | ~10   |
| `src/hooks/usePdfPreview.ts`                | Error msgs         | ~2    |
| `src/api/__tests__/filePreview.api.test.ts` | Test expectations  | ~8    |
| **TOTAL**                                   | **3 files**        | ~20   |

### Dependencies:

- ✅ No breaking changes
- ✅ All existing tests updated
- ✅ Backward compatible (only messages changed)

### Test Status:

- ✅ API tests: PASS
- ✅ Hook tests: PASS (mock data unchanged)
- ✅ Component tests: PASS (already Vietnamese)

---

## 🎓 Lessons Learned

1. **Localization Checklist:**

   - ✅ Runtime error messages
   - ✅ JSDoc documentation
   - ✅ Test expectations
   - ✅ UI labels

2. **Test Data vs Display Text:**

   - Test mock errors (e.g., `new Error("File not found")`) are fixtures, không cần update
   - Chỉ update test expectations (.toThrow()) để match với production code

3. **JSDoc Localization:**
   - JSDoc comments nên localize để dev team đọc code dễ hiểu hơn
   - Đặc biệt là @throws, @param descriptions

---

## 🚀 Next Steps

- [ ] Manual QA: Test error states với browser DevTools

  - Simulate 404 error
  - Simulate network error
  - Verify Vietnamese messages hiển thị đúng

- [ ] Update Phase 3.2 completion checklist

  - [x] Error messages Vietnamese ✅

- [ ] Consider: Tạo i18n system cho multi-language support (future)

---

## 📎 References

- Related: [Phase 3.2 Implementation Plan](../modules/chat/features/conversation-details-phase-3/v3.2_04_implementation-plan.md)
- Related: [FilePreviewModal Component](../../src/components/FilePreviewModal.tsx)
- Coding Guide: [Code Conventions](../guides/code_conventions_20251226_claude_opus_4_5.md)

---

**Session End:** 2026-01-09  
**Status:** ✅ COMPLETE  
**Total Time:** ~15 minutes
