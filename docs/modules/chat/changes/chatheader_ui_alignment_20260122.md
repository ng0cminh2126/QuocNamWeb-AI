# ChatHeader UI Alignment - Implementation Plan

**Date:** 2026-01-22  
**Type:** UI Enhancement  
**Module:** Chat  
**Component:** ChatHeader  
**Status:** ⏳ PENDING APPROVAL

---

## 📋 OVERVIEW

Điều chỉnh UI của ChatHeader component để align với ChatMessagePanel desktop mode:

1. **Thứ tự hiển thị**: Sửa lại thứ tự Badge status, member count, và viewer count
2. **Toggle button**: Thêm button ẩn/hiện panel bên phải

---

## 🎯 REQUIREMENTS

### 1. Điều chỉnh thứ tự hiển thị thông tin

**Hiện tại (ChatHeader lines 143-155):**

```tsx
<Badge type={statusConfig.badgeType}>{statusConfig.label}</Badge>;
{
  !isDirect && (
    <span className="text-xs text-gray-600">
      {membersLoading ? "..." : memberCount} thành viên
    </span>
  );
}
{
  onlineCount !== undefined && onlineCount > 0 && (
    <span className="text-xs text-gray-600">{onlineCount} đang online</span>
  );
}
```

**Thứ tự mới (theo ChatMessagePanel desktop lines 551-556):**

```tsx
{memberCount > 0 && (
  <span className="text-xs text-gray-600">
    {memberCount} thành viên
  </span>
)}
{onlineCount !== undefined && onlineCount > 0 && (
  <>
    <span className="text-gray-400">•</span>
    <span className="text-xs text-gray-600">
      {onlineCount} người đang xem
    </span>
  </>
)}
<span className="text-gray-400">•</span>
<Badge type={statusConfig.badgeType}>{statusConfig.label}</Badge>
```

**Changes:**

- ✅ Thành viên trước, badge sau
- ✅ Thêm dấu chấm tròn `•` màu gray-400 ngăn cách giữa các phần tử
- ✅ Đổi "đang online" → "người đang xem" (align với ChatMessagePanel)

### 2. Thêm button Toggle Panel Phải

**Vị trí:** Đặt SAU button menu (chat-header-menu-button)

**Reference (ChatMessagePanel lines 605-627):**

```tsx
<IconButton
  className="rounded-full bg-white"
  label={showRight ? "Ẩn panel phải" : "Hiện panel phải"}
  onClick={() => setShowRight(!showRight)}
  icon={
    showRight ? (
      <PanelRightClose className="h-4 w-4 text-brand-600" />
    ) : (
      <PanelRightOpen className="h-4 w-4 text-brand-600" />
    )
  }
/>
```

**Props cần thêm:**

```tsx
interface ChatHeaderProps {
  // ... existing props ...

  // 🆕 NEW: Panel toggle
  showRightPanel?: boolean;
  onToggleRightPanel?: () => void;
}
```

---

## 📂 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

- (không có)

### Files sẽ sửa đổi:

#### 1. `src/features/portal/components/chat/ChatHeader.tsx`

**Changes:**

- **Props interface (lines 20-45):**
  - Thêm `showRightPanel?: boolean;`
  - Thêm `onToggleRightPanel?: () => void;`

- **Imports (lines 1-18):**
  - Thêm `PanelRightClose, PanelRightOpen` vào import từ `lucide-react`

- **Component body (lines 69-237):**
  - Destruct new props: `showRightPanel`, `onToggleRightPanel`
  - Sửa lại phần render thông tin (lines 143-155):
    - Đổi thứ tự: memberCount → onlineCount → Badge
    - Thêm dấu chấm tròn `•` giữa các element
    - Đổi text "đang online" → "người đang xem"
  - Thêm button toggle panel SAU button menu (after line 204):
    - Conditional render nếu có `onToggleRightPanel` prop
    - IconButton với PanelRightClose/Open icons
    - data-testid="chat-header-toggle-panel-button"

#### 2. Parent components sử dụng ChatHeader

**Các file cần check và update (optional):**

- `src/features/portal/workspace/ChatMain.tsx` - Nếu dùng ChatHeader
- `src/features/portal/lead/LeadChatMain.tsx` - Nếu dùng ChatHeader
- Các component khác có sử dụng ChatHeader

**Lưu ý:** Props mới là optional, nên không breaking changes cho các nơi chưa dùng

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- (không có - icons đã có trong lucide-react)

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                                       | Lựa chọn                                               | HUMAN Decision |
| --- | -------------------------------------------- | ------------------------------------------------------ | -------------- |
| 1   | Màu dấu chấm tròn `•`                        | `text-gray-400`, `text-gray-500`, hay `text-gray-600`? | ⬜ **\_\_\_**  |
| 2   | Spacing giữa các phần tử                     | `gap-2` (hiện tại) hay `gap-1.5`?                      | ⬜ **\_\_\_**  |
| 3   | Icon cho toggle button                       | PanelRightClose/Open hay PanelRight + ChevronRight?    | ⬜ **\_\_\_**  |
| 4   | Có cần thêm data-testid cho bullet `•`?      | Có hoặc Không?                                         | ⬜ **\_\_\_**  |
| 5   | Mobile mode có hiển thị button toggle không? | Có (với responsive) hay Không (desktop only)?          | ⬜ **\_\_\_**  |

---

## 🧪 TESTING REQUIREMENTS

### Test Coverage Matrix

| Implementation File | Test File | Test Cases |
| ------------------- | --------- | ---------- |
| ChatHeader.tsx      | (manual)  | 6 cases    |

### Test Cases

#### ChatHeader.tsx - Manual Testing

**TC-1: Thứ tự hiển thị thông tin**

- ✅ Render với memberCount > 0
- ✅ Kiểm tra thứ tự: "X thành viên" trước Badge
- ✅ Kiểm tra dấu chấm tròn `•` giữa các phần tử

**TC-2: Text "người đang xem"**

- ✅ Render với onlineCount > 0
- ✅ Verify text hiển thị "người đang xem" thay vì "đang online"

**TC-3: Spacing và separator**

- ✅ Verify `gap-2` hoặc theo HUMAN decision
- ✅ Verify dấu `•` render đúng màu

**TC-4: Toggle panel button - Show**

- ✅ Render với `onToggleRightPanel` prop
- ✅ Verify icon PanelRightClose khi `showRightPanel=true`
- ✅ Click button → trigger `onToggleRightPanel()`

**TC-5: Toggle panel button - Hide**

- ✅ Verify icon PanelRightOpen khi `showRightPanel=false`
- ✅ Verify button position (trước menu button)

**TC-6: Toggle button không hiển thị**

- ✅ Render KHÔNG có `onToggleRightPanel` prop
- ✅ Verify button không render (backward compatible)

### Test Data & Mocks

**Props for testing:**

```tsx
// Case 1: Full info
{
  conversationName: "Test Group",
  conversationType: "GRP",
  memberCount: 10,
  onlineCount: 3,
  status: "Active",
  showRightPanel: true,
  onToggleRightPanel: mockFn
}

// Case 2: No toggle button
{
  conversationName: "Test Group",
  memberCount: 5,
  // No showRightPanel/onToggleRightPanel props
}

// Case 3: DM conversation
{
  conversationName: "DM: User A <> User B",
  conversationType: "DM",
  onlineCount: 1,
  showRightPanel: false,
  onToggleRightPanel: mockFn
}
```

---

## 🎨 UI/UX SPECIFICATIONS

### Desktop Layout

**Before (hiện tại):**

```
[Avatar] [Conversation Name]
         [Badge Active] [10 thành viên] [3 đang online]
         [Tabs...]
                                                  [Menu Button]
```

**After (mới):**

```
[Avatar] [Conversation Name]
         [10 thành viên] • [3 người đang xem] • [Badge Active]
         [Tabs...]
                                   [Menu Button] [Toggle Panel]
```

### Mobile Layout

- Thứ tự thông tin: SAME as desktop
- Toggle panel button: Theo PENDING DECISION #5

---

## 📝 IMPLEMENTATION STEPS

### Step 1: Update ChatHeader props interface

- Add `showRightPanel?: boolean;`
- Add `onToggleRightPanel?: () => void;`

### Step 2: Update imports

- Add `PanelRightClose, PanelRightOpen` to lucide-react import

### Step 3: Update info display section

- Reorder: memberCount → separator → onlineCount → separator → Badge
- Change text: "đang online" → "người đang xem"
- Add bullet separator `<span className="text-gray-400">•</span>`

### Step 4: Add toggle panel button

- Add after menu button (after line 237)
- Conditional render based on `onToggleRightPanel` prop
- Use IconButton component
- Add data-testid="chat-header-toggle-panel-button"

### Step 5: Test manually

- All 6 test cases in Testing Requirements

---

## 🔄 ROLLBACK PLAN

Nếu có issue sau khi deploy:

1. **Git revert:** Revert commit của PR này
2. **Component restore:** Restore ChatHeader.tsx từ commit trước
3. **Parent components:** Không cần update vì props mới là optional

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status       |
| ------------------------------ | ------------ |
| Đã review Impact Summary       | ✅ Đã review |
| Đã điền Pending Decisions      | ✅ Đã điền   |
| Đã review Testing Requirements | ✅ Đã review |
| **APPROVED để thực thi**       | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-22

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 📚 REFERENCES

- **ChatMessagePanel Desktop Header:** `src/features/portal/workspace/ChatMessagePanel.tsx` (lines 546-627)
- **ChatHeader Current:** `src/features/portal/components/chat/ChatHeader.tsx`
- **Icon Reference:** lucide-react `PanelRightClose`, `PanelRightOpen`
