# 🚀 Quick Start Guide - Realtime Debug

**Chuẩn bị trước khi test (5 phút)**

---

## ✅ Checklist Chuẩn Bị

### 1. Code đã có debug logs

- [x] `useConversationRealtime.ts` - Added debug logs
- [x] `ConversationListContainer.tsx` - Added debug logs

### 2. Tools cần thiết

- [ ] Chrome/Edge DevTools (F12)
- [ ] React DevTools extension đã cài
- [ ] Backend đang chạy
- [ ] 2 test accounts:
  - User A: `user@quoc-nam.com` / `User@123`
  - User B: `admin@quoc-nam.com` / `Admin@123`

### 3. Browser setup

- [ ] Main window: Login User A
- [ ] Incognito window: Login User B

---

## 🎬 Bắt Đầu Testing (5 bước)

### BƯỚC 1: Kiểm tra kết nối (2 phút)

1. Mở main window (User A)
2. F12 → Console
3. Gõ: `window.chatHub.state`
4. Kết quả mong đợi: `"Connected"`

✅ **Nếu OK** → Sang BƯỚC 2  
❌ **Nếu fail** → Ghi vào [02_findings.md](./02_findings.md) TEST 1

---

### BƯỚC 2: Kiểm tra listeners (2 phút)

1. Vẫn ở Console
2. Reload page (Ctrl+R)
3. Xem console có logs:
   ```
   🔵 [DEBUG] useConversationRealtime: Registering...
   ✅ [DEBUG] Registered: MessageSent
   ✅ [DEBUG] Registered: ReceiveMessage
   ✅ [DEBUG] Registered: MessageRead
   ```

✅ **Nếu thấy logs** → Sang BƯỚC 3  
❌ **Nếu không thấy** → Ghi vào [02_findings.md](./02_findings.md) TEST 2

---

### BƯỚC 3: Test nhận event (5 phút)

1. **User A:** Mở conversation list, chọn 1 conversation (KHÔNG mở chat)
2. **User B:** Mở CÙNG conversation đó
3. **User B:** Gửi tin: "Test realtime [timestamp]"
4. **User A:** Xem console có log:
   ```
   🟢 [REALTIME] MESSAGE_SENT received: {...}
      conversationId: abc123
      content: Test realtime...
   ```

✅ **Nếu thấy log** → Sang BƯỚC 4  
❌ **Nếu không thấy** → Ghi vào [02_findings.md](./02_findings.md) TEST 3

**Bonus check:** F12 → Network → WS → Frames tab → Xem incoming frames

---

### BƯỚC 4: Kiểm tra cache (3 phút)

1. Sau khi nhận event ở BƯỚC 3
2. Xem console có log:
   ```
   🔵 [CACHE] Groups cache updated
      Updated pages: 1
      Target conversationId: abc123
   ```
3. Mở React Query Devtools (góc dưới màn hình)
4. Tìm query: `["conversations", "groups"]`
5. Xem conversation có `lastMessage` mới không

✅ **Nếu cache update** → Sang BƯỚC 5  
❌ **Nếu không update** → Ghi vào [02_findings.md](./02_findings.md) TEST 4

---

### BƯỚC 5: Kiểm tra UI (2 phút)

1. Nhìn vào conversation list trên màn hình
2. Kiểm tra:

   - [ ] Conversation có jump lên đầu không?
   - [ ] Last message có hiển thị "Test realtime..." không?
   - [ ] Unread badge có xuất hiện/tăng không?
   - [ ] Timestamp có hiển thị "Vừa xong" không?

3. Xem console có log:
   ```
   🔄 [RENDER] ConversationListContainer rendered
      Conversations count: 10
      First conversation: [name]
      Last message: Test realtime...
   ```

✅ **Nếu UI update đúng** → HOÀN TẤT! 🎉  
❌ **Nếu UI không đổi** → Ghi vào [02_findings.md](./02_findings.md) TEST 5

---

## 📝 Ghi Kết Quả

Sau khi test xong mỗi bước:

1. Mở file: [02_findings.md](./02_findings.md)
2. Điền kết quả vào section tương ứng
3. Attach screenshots
4. Copy console logs

---

## 🎯 Xác Định Root Cause

**Nếu tất cả 5 tests PASS:**
→ Vấn đề có thể đã tự fix, hoặc không reproduce được  
→ Test lại với scenario khác

**Nếu 1 trong 5 tests FAIL:**
→ Root cause đã tìm thấy!  
→ Ghi vào section "ROOT CAUSE ANALYSIS" trong 02_findings.md

---

## 💡 Quick Reference

### Test Failed Ở Đâu?

```
❌ TEST 1 (Connection)
   → Check backend running
   → Check VITE_DEV_SIGNALR_HUB_URL
   → Check JWT token valid

❌ TEST 2 (Listeners)
   → Check useConversationRealtime được gọi
   → Check component mount đúng
   → Check dependencies trong useEffect

❌ TEST 3 (Event Reception)
   → Check backend có broadcast event không
   → Check user có join group không
   → Check event name đúng không

❌ TEST 4 (Cache)
   → Check queryClient.setQueryData được gọi
   → Check query key match
   → Check logic update đúng

❌ TEST 5 (UI)
   → Check component subscribe query
   → Check sorting logic
   → Check memoization
```

---

## ⏱️ Tổng Thời Gian

- Chuẩn bị: 5 phút
- Testing: 14 phút
- Ghi kết quả: 10 phút
- **TỔNG: ~30 phút**

---

**Sẵn sàng? Bắt đầu từ BƯỚC 1! 🚀**
