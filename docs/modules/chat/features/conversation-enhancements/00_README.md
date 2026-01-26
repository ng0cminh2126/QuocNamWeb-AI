# [BƯỚC 0] Conversation Enhancements - Overview

**Feature:** Conversation Enhancements (Members Count, LocalStorage Persistence, Detail Panel)  
**Module:** Chat  
**Type:** Enhancement  
**Priority:** Medium  
**Status:** ⏳ REQUIREMENTS PENDING

---

## 📋 Feature Summary

Cải tiến trải nghiệm người dùng khi làm việc với conversations:

1. **Members Count Display** - Hiển thị số thành viên trong ChatHeader
2. **Conversation Persistence** - Lưu trạng thái category + conversation vào LocalStorage để restore khi reload
3. **Detail Panel Enhancement** - Hiển thị đúng category và loại việc trong ConversationDetailPanel

---

## 🎯 Business Goals

- **UX Improvement:** Người dùng biết được số thành viên trong conversation
- **Persistence:** Không mất context khi refresh/reload trang
- **Clarity:** Thông tin rõ ràng về nhóm và loại việc đang xem

---

## 📁 Implementation Checklist

### BƯỚC 1: Requirements ⏳ PENDING

- [ ] 01_requirements.md - Functional requirements
- [ ] Root cause analysis (why needed?)
- [ ] Acceptance criteria defined
- [ ] HUMAN approval

### BƯỚC 2: Design ⬜ SKIPPED

- Wireframe: Not needed (data display only)
- Flow: Not needed (straightforward logic)

### BƯỚC 3: API Contract ⏳ PENDING

- [ ] API Contract for GET /conversations/{id}/members
- [ ] Response snapshots captured
- [ ] HUMAN approval

### BƯỚC 4: Implementation Plan ⏳ PENDING

- [ ] 04_implementation-plan.md created
- [ ] Files to modify identified
- [ ] Impact analysis done
- [ ] HUMAN approval

### BƯỚC 4.5: Test Requirements ⏳ PENDING

- [ ] 06_testing.md created
- [ ] Test coverage matrix defined
- [ ] Test cases specified
- [ ] HUMAN approval

### BƯỚC 5: Coding ⬜ NOT STARTED

- [ ] API client implementation
- [ ] Query hook implementation
- [ ] ChatHeader integration
- [ ] LocalStorage implementation
- [ ] ConversationDetailPanel updates
- [ ] Unit tests written

### BƯỚC 6: Testing Documentation ⬜ NOT STARTED

- [ ] Manual testing completed
- [ ] Test results documented
- [ ] HUMAN verification

### BƯỚC 7: E2E Testing ⬜ OPTIONAL

- [ ] Playwright tests (optional)

---

## 🔗 Related Features

- **CBN-002:** Category-based Navigation
- **Chat Main:** ChatMainContainer, ChatHeader
- **Detail Panel:** ConversationDetailPanel

---

## 📊 Version History

| Version | Date       | Changes              | Status  |
| ------- | ---------- | -------------------- | ------- |
| 1.0     | 2026-01-20 | Initial requirements | PENDING |

---

## 🚀 Next Steps

1. **HUMAN:** Review and approve 01_requirements.md
2. **AI:** Create API contract in docs/api/chat/members/
3. **AI:** Create implementation plan
4. **HUMAN:** Approve implementation plan
5. **AI:** Implement code + tests

---

**Created:** 2026-01-20  
**Last Updated:** 2026-01-20  
**Author:** GitHub Copilot
