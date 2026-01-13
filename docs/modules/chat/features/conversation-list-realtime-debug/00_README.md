# [VẤN ĐỀ] Conversation List Realtime - Mất Kết Nối Không Nhận Tin Mới

**Date Created:** 2026-01-13  
**Status:** 🔍 INVESTIGATING  
**Priority:** 🔴 HIGH

---

## 📋 Mô Tả Vấn Đề

**Hiện tượng:**  
Conversation list không nhận được tin nhắn mới qua SignalR realtime. Người dùng không thấy:

- Last message update
- Conversation move lên đầu list
- Unread badge tăng

**Tác động:**

- User không biết có tin nhắn mới → Phải refresh page
- UX kém, không realtime

---

## 🎯 Mục Tiêu Điều Tra

1. ✅ **Kiểm tra SignalR Connection** - Kết nối có stable không?
2. ✅ **Kiểm tra Event Listeners** - Hook có đăng ký events đúng không?
3. ✅ **Kiểm tra Event Reception** - Backend có gửi events không?
4. ✅ **Kiểm tra Cache Update** - TanStack Query cache có được update không?
5. ✅ **Kiểm tra UI Re-render** - Component có re-render sau khi cache update không?

---

## 📁 Files Liên Quan

### Core Files

- [src/lib/signalr.ts](../../../../src/lib/signalr.ts) - SignalR connection singleton
- [src/providers/SignalRProvider.tsx](../../../../src/providers/SignalRProvider.tsx) - Connection lifecycle manager
- [src/hooks/useConversationRealtime.ts](../../../../src/hooks/useConversationRealtime.ts) - Conversation list realtime hook
- [src/features/portal/workspace/ConversationListSidebar.tsx](../../../../src/features/portal/workspace/ConversationListSidebar.tsx) - UI Component chính
- [src/features/portal/components/ConversationListContainer.tsx](../../../../src/features/portal/components/ConversationListContainer.tsx) - Container component

### Test Files

- [tests/chat/conversation-list/e2e/realtime-updates.spec.ts](../../../../tests/chat/conversation-list/e2e/realtime-updates.spec.ts) - E2E test cho realtime updates

---

## 📝 Documents

1. **[01_diagnostic_plan.md](./01_diagnostic_plan.md)** - Kế hoạch kiểm tra chi tiết
2. **[02_findings.md](./02_findings.md)** - Kết quả kiểm tra (sẽ tạo sau khi thực hiện)
3. **[03_fix_plan.md](./03_fix_plan.md)** - Kế hoạch fix (sau khi xác định root cause)

---

## 🔄 Workflow

```
┌──────────────────┐
│  1. DIAGNOSTIC   │ → [01_diagnostic_plan.md]
│  (Kiểm tra)      │    ├─ Connection test
│                  │    ├─ Event listener test
│                  │    ├─ Network inspection
│                  │    └─ Cache verification
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  2. FINDINGS     │ → [02_findings.md]
│  (Ghi nhận)      │    ├─ Root cause identified
│                  │    ├─ Evidence collected
│                  │    └─ Screenshots/logs
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  3. FIX PLAN     │ → [03_fix_plan.md]
│  (Giải pháp)     │    ├─ Code changes needed
│                  │    ├─ Test cases
│                  │    └─ Verification steps
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  4. IMPLEMENT    │ → Code changes + Tests
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  5. VERIFY       │ → E2E test pass
└──────────────────┘
```

---

## ⏰ Timeline

| Phase             | Document                                         | Status     | Started | Completed |
| ----------------- | ------------------------------------------------ | ---------- | ------- | --------- |
| 1. Diagnostic     | [01_diagnostic_plan.md](./01_diagnostic_plan.md) | ⏳ TODO    | -       | -         |
| 2. Findings       | [02_findings.md](./02_findings.md)               | ⏳ PENDING | -       | -         |
| 3. Fix Plan       | [03_fix_plan.md](./03_fix_plan.md)               | ⏳ PENDING | -       | -         |
| 4. Implementation | Code                                             | ⏳ PENDING | -       | -         |
| 5. Verification   | Tests                                            | ⏳ PENDING | -       | -         |

---

## 📌 Notes

- **✅ Debug logs đã được thêm vào:**
  - `src/hooks/useConversationRealtime.ts` - Event registration và cache update logs
  - `src/features/portal/components/ConversationListContainer.tsx` - Component render logs
- **📖 Xem [QUICK_START.md](./QUICK_START.md)** để bắt đầu testing ngay
- **KHÔNG** thực hiện code changes cho đến khi có 02_findings.md với root cause rõ ràng
- **KHÔNG** skip bất kỳ bước nào trong diagnostic plan
- **GHI NHẬN** tất cả findings vào 02_findings.md kèm screenshots/logs
- **XÁC NHẬN** với HUMAN trước khi implement fix

---

**Last Updated:** 2026-01-13  
**Updated By:** AI Assistant
