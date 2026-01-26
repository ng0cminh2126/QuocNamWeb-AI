# Changelog: Category List File/Image Preview Bug Fix

> **Bug ID:** CBN-PREVIEW-001  
> **Created:** 2026-01-26

---

## [1.0.0] - 2026-01-26

### ✅ VERIFIED & WORKING

**Category list file/image preview now works real-time** ✅

- Gửi ảnh → Shows "Đã gửi X ảnh" immediately ✅
- Gửi file → Shows "Đã gửi tệp [filename]" immediately ✅
- Mix file/ảnh → Shows "Đã gửi X tệp đính kèm" ✅
- No page reload needed ✅

**Verification:**

- Tested by HUMAN on 2026-01-26
- All test cases PASSED
- Production ready

**Root cause:** Frontend không extract `attachments` field từ SignalR event (backend đã gửi rồi)

**Fix:** 2 dòng code trong `useCategoriesRealtime.ts`:

1. Extract `attachments` từ message object
2. Include `attachments` vào lastMessage cache update

**Files changed:**

- `src/hooks/useCategoriesRealtime.ts` - Added attachments extraction

---

## [0.1.0] - 2026-01-26

### 🔍 Analysis Phase

**Status:** COMPLETED

**Activities:**

- ✅ Created bug documentation structure
- ✅ Analyzed root causes (2 identified)
- ✅ Investigated code flow (ConversationListSidebar → formatMessagePreview → useCategoriesRealtime)
- ✅ Verified backend sends attachments (frontend just not extracting)
- ✅ Created simple fix (extract attachments field)
- ✅ Implemented fix
- ✅ Documented changes

**Root Causes Identified:**

1. **Frontend destructuring:** Line 122 chỉ lấy 6 fields, bỏ qua attachments
2. **Frontend cache update:** lastMessage object không include attachments field

**Solution:**

- Simple 2-line fix in `useCategoriesRealtime.ts`
- No backend changes needed (đã đúng rồi)
- No API calls needed
- No new dependencies

**Files Modified:**

- `src/hooks/useCategoriesRealtime.ts` - Extract attachments từ event + include vào lastMessage

---

## Version History

| Version | Date       | Status      | Description                    |
| ------- | ---------- | ----------- | ------------------------------ |
| 1.0.0   | 2026-01-26 | ✅ VERIFIED | Tested & working in production |
| 0.1.0   | 2026-01-26 | ANALYZED    | Root cause analysis + plan     |

---

## References

- Main documentation: [00_README.md](./00_README.md)
- Analysis: [01_root-cause-analysis.md](./01_root-cause-analysis.md)
- Plan: [02_implementation-plan.md](./02_implementation-plan.md)
- Summary: [03_implementation-summary.md](./03_implementation-summary.md)
