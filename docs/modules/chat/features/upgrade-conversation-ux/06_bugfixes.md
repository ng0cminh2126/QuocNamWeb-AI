# [BUGFIX] Phase 2 Post-Implementation Issues

> **Status:** ✅ APPROVED → IMPLEMENTING  
> **Created:** 2026-01-07  
> **Related:** Phase 2 UI Enhancements

---

## 🐛 Bug Reports

### Bug #1: RelativeTime không update khi nhận tin nhắn mới

**Reported by:** User  
**Date:** 2026-01-07

**Description:**  
Khi nhận tin nhắn mới qua SignalR, nội dung tin nhắn và số lượng tin chưa đọc (UnreadBadge) đã update đúng, nhưng thời gian (RelativeTime) vẫn hiển thị giá trị cũ.

**Steps to Reproduce:**

1. Mở conversation
2. Nhận tin nhắn mới từ user khác (qua SignalR)
3. Quan sát conversation item trong sidebar

**Expected:**  
RelativeTime hiển thị thời gian của tin nhắn mới nhất

**Actual:**  
RelativeTime vẫn giữ nguyên thời gian cũ

---

### Bug #2: Chat container không reset khi chuyển type (Nhóm ↔ Cá nhân)

**Reported by:** User  
**Date:** 2026-01-07

**Description:**  
Khi chuyển từ Nhóm sang Cá nhân (hoặc ngược lại), khung chat vẫn hiển thị conversation cũ thay vì clear hoặc hiển thị conversation mới.

**Steps to Reproduce:**

1. Chọn một conversation Nhóm
2. Xem chat hiển thị đúng
3. Chuyển sang tab Cá nhân
4. Chọn một conversation Cá nhân

**Expected:**  
Chat container hiển thị conversation Cá nhân đã chọn

**Actual:**  
Chat container vẫn hiển thị conversation Nhóm cũ

---

## 🔍 Root Cause Analysis

### Bug #1: RelativeTime

**Current Implementation:**

```tsx
// RelativeTime.tsx
export default function RelativeTime({
  timestamp,
  className,
}: RelativeTimeProps) {
  const [relativeText, setRelativeText] = useState(() =>
    formatRelativeTime(timestamp)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeText(formatRelativeTime(timestamp));
    }, 60000); // Update mỗi 60s

    return () => clearInterval(interval);
  }, [timestamp]);

  // ...
}
```

**Problem:**

- `useEffect` dependency là `[timestamp]`
- Khi conversation item update (tin nhắn mới), component re-render NHƯNG `timestamp` prop vẫn là reference cũ
- React không trigger useEffect nếu timestamp value không đổi (cùng string hoặc Date object)
- Interval chỉ update nội bộ, không lắng nghe external timestamp changes

**Proof:**

```tsx
// ConversationItem.tsx
<RelativeTime timestamp={lastMessage.sentAt} />

// lastMessage.sentAt có thể:
// - Là string: "2026-01-07T10:00:00Z"
// - Là Date object: new Date("2026-01-07T10:00:00Z")

// Khi tin nhắn mới update qua SignalR:
// - ConversationItem re-render
// - lastMessage object mới nhưng sentAt có thể vẫn là cùng value
// - RelativeTime không re-calculate vì timestamp không thay đổi
```

**Fix Strategy:**

**Option A: Force Re-calculate on Prop Change**

```tsx
// RelativeTime.tsx
useEffect(() => {
  // ALWAYS update when timestamp prop changes
  setRelativeText(formatRelativeTime(timestamp));
}, [timestamp]);

useEffect(() => {
  // Auto-update mỗi 60s
  const interval = setInterval(() => {
    setRelativeText(formatRelativeTime(timestamp));
  }, 60000);
  return () => clearInterval(interval);
}, [timestamp]);
```

**Pros:**

- Simple fix
- Immediately reflects timestamp changes
- Maintains auto-update behavior

**Cons:**

- Có 2 useEffect (nhưng không ảnh hưởng performance)

---

**Option B: useMemo for Derived State**

```tsx
// RelativeTime.tsx
const [tick, setTick] = useState(0);

const relativeText = useMemo(() => {
  return formatRelativeTime(timestamp);
}, [timestamp, tick]);

useEffect(() => {
  const interval = setInterval(() => {
    setTick((t) => t + 1); // Force re-calculate
  }, 60000);
  return () => clearInterval(interval);
}, []);
```

**Pros:**

- Cleaner separation (derived value vs auto-update)
- Single useEffect

**Cons:**

- More complex

---

**Recommendation:** ✅ **Option A** (simpler, explicit)

---

### Bug #2: Chat Container Not Resetting

**Current Implementation:**

```tsx
// WorkspaceView.tsx
<ChatMainContainer
  conversationId={selectedChat.id}
  conversationName={chatTitle}
  conversationType={selectedChat.type === "group" ? "GRP" : "DM"}
  // ...
/>
```

**Problem:**

Có thể có 2 scenarios:

**Scenario A: selectedChat không được clear khi chuyển tab**

```tsx
// User flow:
1. Click Nhóm → selectedChat = { type: "group", id: "grp_123" }
2. Click tab Cá nhân (contacts)
3. selectedChat VẪN = { type: "group", id: "grp_123" }
4. Click Cá nhân conversation → selectedChat = { type: "dm", id: "dm_456" }
5. ChatMainContainer nhận conversationId="dm_456" nhưng có race condition
```

**Scenario B: React không unmount ChatMainContainer khi switch**

```tsx
// React key issue:
<ChatMainContainer
  key={selectedChat.id} // ❌ Nếu không có key
  conversationId={selectedChat.id}
/>

// Khi conversationId thay đổi, component update NHƯNG state cũ vẫn còn
```

**Fix Strategy:**

**Option A: Add React Key**

```tsx
// WorkspaceView.tsx
<ChatMainContainer
  key={selectedChat.id} // ✅ Force unmount/remount when conversation changes
  conversationId={selectedChat.id}
  // ...
/>
```

**Pros:**

- Forces complete reset
- Clears all internal state
- Simple one-line fix

**Cons:**

- Unmount/remount có thể slightly slower (nhưng acceptable)
- Loses any unsaved draft input (nhưng đây là expected behavior)

---

**Option B: Clear selectedChat When Switching Tabs**

```tsx
// WorkspaceView.tsx
const handleTabSwitch = (newTab: "contacts" | "messages") => {
  setLeftTab(newTab);
  onClearSelectedChat?.(); // ✅ Clear selection
};
```

**Pros:**

- Prevents stale selection
- More predictable UX

**Cons:**

- Requires state management changes
- May not fix if user clicks conversation trong cùng tab

---

**Option C: Reset ChatMainContainer State on ConversationId Change**

```tsx
// ChatMainContainer.tsx
useEffect(() => {
  // Reset state khi conversationId thay đổi
  setInputValue("");
  setSelectedFiles([]);
  // ...
}, [conversationId]);
```

**Pros:**

- Explicit state cleanup
- No unmount/remount

**Cons:**

- More code
- Easy to miss state that needs reset

---

**Recommendation:** ✅ **Option A (React key)** + **Option B (clear on tab switch)**

Combination approach:

1. Add `key={selectedChat.id}` to ChatMainContainer (ensures clean state)
2. Optionally clear selectedChat when switching tabs (better UX)

---

## 📋 IMPACT SUMMARY

### Files sẽ sửa đổi:

1. **`src/features/portal/components/RelativeTime.tsx`** (~5 lines)

   - Add `useEffect` to update relativeText when timestamp prop changes
   - Keep existing interval for auto-update

2. **`src/features/portal/workspace/WorkspaceView.tsx`** (~2 lines)
   - Add `key={selectedChat.id}` to ChatMainContainer
   - Ensures component unmount/remount when conversation changes

### Files sẽ tạo mới:

- (Không có)

### Files sẽ xoá:

- (Không có)

### Dependencies sẽ thêm:

- (Không có)

### Testing Impact:

- **RelativeTime.test.tsx:** Update tests to verify timestamp prop change triggers update
- **Manual testing:** Verify real-time message updates show correct time

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                      | Lựa chọn                                 | HUMAN Decision |
| --- | --------------------------- | ---------------------------------------- | -------------- |
| 1   | RelativeTime fix approach   | (A) Dual useEffect, (B) useMemo + tick?  | ⬜ **A**       |
| 2   | ChatMainContainer reset     | (A) React key only, (B) Key + clear tab? | ⬜ **A**       |
| 3   | Should clear draft on reset | Yes (safe), No (keep draft)?             | ⬜ **Yes**     |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Bug Reports     | ✅ Đã review |
| Đã review Root Cause      | ✅ Đã review |
| Đã review Impact Summary  | ✅ Đã review |
| Đã điền Pending Decisions | ✅ Đã điền   |
| **APPROVED để fix bugs**  | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

> ✅ **Bug fixes approved - AI được phép implement**

---

_Created: 2026-01-07_
