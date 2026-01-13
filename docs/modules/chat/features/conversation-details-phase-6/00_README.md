# Phase 6: Chat UX Improvements - Error Handling & Persistence

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6  
> **Status:** 📝 PLANNING  
> **Created:** 2026-01-12

---

## 📋 Overview

Phase 6 tập trung vào cải thiện UX với error handling, retry mechanisms, và conversation persistence khi reload/reopen tab.

---

## 🎯 Goals

1. **Better Error Visibility**: Upload failures và message send failures có clear feedback
2. **Retry Mechanisms**: User có thể retry failed actions
3. **Improved File Management**: Delete button luôn visible
4. **Conversation Persistence**: Maintain conversation selection across page reloads

---

## 📦 Deliverables

### 1. File Upload Error Handling

- Toast notification khi upload fail
- Inline error display tại file trong chat
- Retry upload functionality

### 2. Message Send Error Handling

- Message status indicators (sending, sent, failed)
- Retry button cho failed messages
- Network error detection

### 3. File Management UX

- Delete button always visible (không chỉ hover)
- Clear visual affordance

### 4. Conversation Persistence

- Save selected conversation to localStorage
- Auto-restore on reload/reopen
- Fallback to latest conversation nếu first visit
- Empty state nếu saved conversation không tồn tại

---

## 📁 Documentation Structure

```
docs/modules/chat/features/conversation-details-phase-6/
├── 00_README.md                    # [BƯỚC 0] This file
├── 01_requirements.md              # [BƯỚC 1] ⏳ PENDING
├── 02a_wireframe.md                # [BƯỚC 2A] ⏳ PENDING
├── 02b_flow.md                     # [BƯỚC 2B] ⏳ PENDING
├── 03_api-contract.md              # [BƯỚC 3] ⏳ (link to existing APIs)
├── 04_implementation-plan.md       # [BƯỚC 4] ⏳ PENDING
├── 05_progress.md                  # [BƯỚC 5] Auto-generated
└── 06_testing.md                   # [BƯỚC 4.5/6] ⏳ PENDING
```

---

## 🔗 Dependencies

### APIs Required:

- ✅ Message send API (existing)
- ✅ File upload API (existing)
- No new APIs needed

### Components to Modify:

- `ChatMain.tsx` - Message retry, status display
- `MessageBubbleSimple.tsx` - Message status indicators
- `FileUploadArea.tsx` - Error handling, delete button
- `ConversationList.tsx` - Persistence integration
- New: `MessageStatusIndicator.tsx`
- New: `FileUploadError.tsx`

### State Management:

- New Zustand store: `conversationPersistenceStore.ts`
- Update: `fileUploadStore.ts` - Add error states
- Update: Message mutation hooks - Add retry logic

---

## 📊 Success Criteria

- [ ] Upload errors show toast + inline error
- [ ] Failed messages có retry button
- [ ] Delete button visible without hover
- [ ] Conversation selection persists across reloads
- [ ] Auto-open latest conversation on first visit
- [ ] Empty state shows if saved conversation gone

---

## 🚀 Next Steps

1. ✅ Create 01_requirements.md
2. ⏳ HUMAN approve requirements
3. ⏳ Create wireframes (02a)
4. ⏳ Create flow diagrams (02b)
5. ⏳ Create implementation plan (04)
6. ⏳ Create test requirements (06)
7. ⏳ Implementation

---

**Last Updated:** 2026-01-12  
**Version:** 1.0
