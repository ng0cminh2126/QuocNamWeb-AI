# Progress Tracking - Chat Details Phase 7 Bugfixes

**Last Updated:** 2026-01-16  
**Status:** ✅ Implementation Complete

---

## 📊 Overall Progress

| Phase                    | Status      | Date       |
| ------------------------ | ----------- | ---------- |
| 00. Folder Structure     | ✅ Complete | 2026-01-15 |
| 01. Requirements         | ✅ Complete | 2026-01-15 |
| 02A. Wireframe           | ❌ N/A      | -          |
| 02B. Flow                | ❌ N/A      | -          |
| 03. API Contract         | ✅ Complete | 2026-01-15 |
| 04. Implementation Plan  | ✅ Complete | 2026-01-15 |
| 06. Testing Requirements | ✅ Complete | 2026-01-15 |
| 05. Coding               | ✅ Complete | 2026-01-16 |
| 07. E2E Testing          | ⬜ Optional | -          |

**Status:** ✅ Implementation complete, ready for manual testing

---

## ✅ Completed Tasks

### Documentation Created:

- [x] `00_README.md` - Overview
- [x] `01_requirements.md` - Detailed requirements with acceptance criteria (APPROVED by MINH)
- [x] `03_api-contract.md` - API documentation with Swagger verification
- [x] `04_implementation-plan.md` - Implementation steps (APPROVED by MINH)
- [x] `06_testing.md` - Test requirements with 17 test cases (APPROVED by MINH)
- [x] `05_progress.md` - This file

### Bug #1: Load More Messages (✅ FIXED + ENHANCED)

**Files Modified:**

- [x] `src/api/messages.api.ts` - Changed `cursor` param to `beforeMessageId`
- [x] `src/hooks/queries/useMessages.ts` - Updated query hook to use `beforeMessageId`
- [x] `src/api/__tests__/messages.api.test.ts` - Updated test to use `beforeMessageId`
- [x] `src/features/portal/components/chat/ChatMainContainer.tsx` - Scroll position preservation

**Changes:**

- ✅ Updated `GetMessagesParams` interface: `cursor` → `beforeMessageId`
- ✅ Updated `getMessages()` function to use correct param name
- ✅ Added JSDoc documentation
- ✅ Updated `useMessages` hook queryFn
- ✅ Added debug logging in `getNextPageParam`
- ✅ Updated unit tests

**Scroll Position Enhancements:**

- ✅ Added scroll position preservation in `handleLoadMore`
  - Saves scrollHeight and scrollTop BEFORE fetch
  - Calculates addedHeight after new messages loaded
  - Restores scroll: `scrollTop = oldPosition + addedHeight`
- ✅ Fixed auto-scroll logic to only trigger on conversation change
  - Added `prevConversationIdForScrollRef` to track conversation
  - Prevents scroll to bottom when loading more messages
  - Real-time messages still scroll via `onNewMessage` callback

### Bug #2: File Upload Limit (✅ FIXED)

**Files Modified:**

- [x] `src/types/files.ts` - Added `MAX_FILES_PER_MESSAGE = 10` constant
- [x] `src/features/portal/components/chat/ChatMainContainer.tsx` - Improved validation logic

**Changes:**

- ✅ Added `MAX_FILES_PER_MESSAGE = 10` constant
- ✅ Updated `DEFAULT_FILE_RULES.maxFiles = 10`
- ✅ Added JSDoc comment
- ✅ Improved `handleFileSelect` validation with step-by-step checks
- ✅ Added `isFileLimitReached` computed value
- ✅ Disabled file/image buttons when limit reached
- ✅ Disabled input elements when limit reached
- ✅ Added better error messages with context
- ✅ Added success toast when files added
- ✅ Partial accept logic (take only what fits)

---

- [ ] Capture API snapshot: `docs/api/chat/messages/snapshots/v1/success-page1.json`
- [ ] Capture API snapshot: `docs/api/chat/messages/snapshots/v1/success-page2.json`

### Priority 2: Review & Approve Documents

- [ ] Review [01_requirements.md](./01_requirements.md)
  - [ ] Verify Bug #1 requirements
  - [ ] Verify Bug #2 requirements (5 files max OK?)
  - [ ] Fill Pending Decisions table
  - [ ] Tick ✅ APPROVED
- [ ] Review [03_api-contract.md](./03_api-contract.md)
  - [ ] Answer Critical Questions
  - [ ] Tick ✅ Contract READY
- [ ] Review [04_implementation-plan.md](./04_implementation-plan.md)
  - [ ] Verify implementation approach
  - [ ] Fill Pending Decisions
  - [ ] Tick ✅ APPROVED
- [ ] Review [06_testing.md](./06_testing.md)
  - [ ] Verify test coverage (17 cases)
  - [ ] Tick ✅ APPROVED

---

## 🚫 Blocked Tasks (Cannot Start)

### Coding (BƯỚC 5):

**Blocked by:**

- ⏳ API Contract chưa có snapshots
- ⏳ Requirements chưa APPROVED
- ⏳ Implementation Plan chưa APPROVED
- ⏳ Testing Requirements chưa APPROVED

**Will implement:**

- Bug #1: Fix load more messages
  - Update API client
  - Update query hook
  - Update types
- Bug #2: Fix file upload limit
  - Add MAX_FILES_PER_MESSAGE constant
  - Update ChatMainContainer validation
  - Disable inputs at limit

---

## 📝 Notes

### Bug #1 - Load More Messages

**Hypothesis:** API integration issue với cursor pagination

- Có thể param name sai
- Có thể response field names sai
- Cần actual API snapshot để verify

**Approach:**

1. Get snapshot từ Swagger
2. Compare với code hiện tại
3. Fix mismatches
4. Test pagination

### Bug #2 - File Upload Limit

**Root Cause:** Confirmed

- Hardcoded maxFiles=10 vs DEFAULT_FILE_RULES.maxFiles=5
- Double validation với 2 constants khác nhau
- Không disable input khi đủ file

**Approach:**

1. Add MAX_FILES_PER_MESSAGE=5 constant
2. Use constant everywhere
3. Add isFileLimitReached computed value
4. Disable inputs when limit reached
5. Better error messages

---

## 📅 Timeline Estimate

**Assuming documents approved today (2026-01-15):**

| Task                    | Duration      | Date           |
| ----------------------- | ------------- | -------------- |
| HUMAN review docs       | 1-2 hours     | 2026-01-15     |
| HUMAN capture snapshots | 30 min        | 2026-01-15     |
| AI implement Bug #1     | 1 hour        | 2026-01-15     |
| AI implement Bug #2     | 1 hour        | 2026-01-15     |
| AI write tests          | 1.5 hours     | 2026-01-15     |
| Manual testing          | 1 hour        | 2026-01-15     |
| **Total**               | **5-6 hours** | **2026-01-15** |

---

## 🔗 Document Links

- [00_README.md](./00_README.md) - Overview
- [01_requirements.md](./01_requirements.md) - Requirements ⏳
- [03_api-contract.md](./03_api-contract.md) - API Contract ⏳
- [04_implementation-plan.md](./04_implementation-plan.md) - Plan ⏳
- [06_testing.md](./06_testing.md) - Testing ⏳
- [05_progress.md](./05_progress.md) - This file

---

## 📞 Next Steps for HUMAN

1. **Verify API documentation** (highest priority)

   - Capture snapshots as instructed in [03_api-contract.md](./03_api-contract.md)

2. **Review & approve all documents**

   - Start with [01_requirements.md](./01_requirements.md)
   - Fill Pending Decisions tables
   - Tick ✅ APPROVED checkboxes

3. **Notify AI when ready**
   - AI will wait until all documents APPROVED
   - AI will then proceed with coding

---

**AI Status:** ⏸️ Paused, waiting for HUMAN approval
