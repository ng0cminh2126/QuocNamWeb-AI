# [BƯỚC 2A] Category-Based Conversation Selector - Wireframes

**Feature ID:** `CBN-002`  
**Version:** 2.0  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📋 Context

**Component:** ChatHeader.tsx (trong ChatMainContainer)  
**UI Reference:** ChatMessagePanel.tsx WorkType tabs (lines 557-667)  
**Pattern:** LinearTabs với optional unread badges

**Key Principle:** Match style của ChatMessagePanel WorkType selector, nhưng implement vào ChatHeader với **minimal changes**.

---

## 🖼️ Wireframe 1: Current ChatHeader (Before Changes)

### Desktop View:

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • 12 thành viên • 3 đang online      │
└──────────────────────────────────────────────────────────┘
```

**Code Location:** `ChatHeader.tsx` lines ~90-130

```tsx
<div className="flex items-center justify-between border-b p-4 shrink-0">
  <div className="flex items-center gap-3 flex-1 min-w-0">
    <Avatar name={displayName} avatarUrl={avatarUrl} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-gray-800 truncate">
          {displayName}
        </div>
        {conversationCategory && conversationType === "GRP" && (
          <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 border border-brand-200">
            {conversationCategory}
          </span>
        )}
      </div>
      <div className="text-xs font-medium text-brand-600">{statusLine}</div>
    </div>
  </div>
  {/* Menu button */}
</div>
```

---

## 🖼️ Wireframe 2: NEW - ChatHeader với Conversation Tabs (Desktop)

### Option 1: Tabs Below Status Line (Recommended)

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • 12 thành viên • 3 đang online      │
│          [Conv 1] [Conv 2 🔴3] [Conv 3] [Conv 4]        │ ← 🆕 LinearTabs
└──────────────────────────────────────────────────────────┘
```

**Implementation:**

```tsx
<div className="flex items-center justify-between border-b p-4 shrink-0">
  {/* ... existing header content ... */}
  <div className="flex-1 min-w-0">
    {/* Name + category badge */}
    <div className="flex items-center gap-2">...</div>

    {/* Status line */}
    <div className="text-xs font-medium text-brand-600">{statusLine}</div>

    {/* 🆕 NEW: Conversation tabs */}
    {categoryConversations && categoryConversations.length > 0 && (
      <div className="mt-2">
        <LinearTabs
          tabs={categoryConversations.map((conv) => ({
            key: conv.conversationId,
            label: (
              <div className="relative inline-flex items-center gap-1">
                <span>{conv.conversationName}</span>
                {conv.unreadCount > 0 && (
                  <span className="ml-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ),
          }))}
          active={
            selectedConversationId ?? categoryConversations[0]?.conversationId
          }
          onChange={(id) => onChangeConversation?.(id)}
          textClass="text-xs"
          noWrap
        />
      </div>
    )}
  </div>
</div>
```

**Spacing:**

- `mt-2` between status line and tabs (8px gap)
- Tabs inherit padding from parent container

---

### Option 2: Tabs Inline with Name (Alternative)

```
┌────────────────────────────────────────────────────────────────┐
│ [Avatar] Category A                                   [⋮ Menu] │
│          Hoạt động • 12 thành viên                             │
│          [Conv 1] [Conv 2 🔴3] [Conv 3]                        │
└────────────────────────────────────────────────────────────────┘
```

**Trade-off:** Saves vertical space but may clash with category badge

---

## 🖼️ Wireframe 3: Mobile View

### Mobile Layout:

```
┌──────────────────────────────────────────┐
│ [<] [Avatar] Category A            [⋮]  │
│     Hoạt động • 12 thành viên           │
├──────────────────────────────────────────┤
│ [Conv 1] [Conv 2 🔴3] [Conv 3]          │ ← 🆕 Tabs (separate row)
└──────────────────────────────────────────┘
```

**Implementation:**

```tsx
<div className="flex items-center justify-between border-b p-4 shrink-0">
  {/* Mobile header (existing) */}
  {isMobile && (
    <>
      <div className="flex items-center gap-2 min-w-0">...</div>
      {/* Actions */}
    </>
  )}
</div>;

{
  /* 🆕 NEW: Mobile tabs (separate container below header) */
}
{
  isMobile && categoryConversations && categoryConversations.length > 0 && (
    <div className="border-b px-2 pb-0 mt-2">
      <LinearTabs
        tabs={categoryConversations.map((conv) => ({
          key: conv.conversationId,
          label: (
            <div className="relative inline-flex items-center gap-1">
              <span>{conv.conversationName}</span>
              {conv.unreadCount > 0 && (
                <span className="ml-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ),
        }))}
        active={
          selectedConversationId ?? categoryConversations[0]?.conversationId
        }
        onChange={(id) => onChangeConversation?.(id)}
        textClass="text-xs"
        noWrap
      />
    </div>
  );
}
```

**Pattern:** Same as ChatMessagePanel mobile tabs (lines 633-667)

---

## 🎨 Design Specifications

### LinearTabs Component Props:

| Prop        | Value                                | Purpose                    |
| ----------- | ------------------------------------ | -------------------------- |
| `tabs`      | `Array<{ key, label }>`              | Tab data                   |
| `active`    | `selectedConversationId ?? first`    | Active tab highlighting    |
| `onChange`  | `(id) => onChangeConversation?.(id)` | Click handler              |
| `textClass` | `"text-xs"`                          | Font size (match WorkType) |
| `noWrap`    | `true`                               | Horizontal scrollable      |

### Badge Specifications:

| Property         | Value                                     | Reference              |
| ---------------- | ----------------------------------------- | ---------------------- |
| Container        | `relative inline-flex items-center gap-1` | Tab label wrapper      |
| Badge Position   | `ml-1` (after conversation name)          | Spacing from name      |
| Badge Layout     | `inline-flex min-w-[16px] h-4`            | Minimum width + height |
| Badge Alignment  | `items-center justify-center`             | Center text            |
| Badge Shape      | `rounded-full`                            | Circular badge         |
| Badge Background | `bg-rose-500`                             | Red color              |
| Badge Padding    | `px-1`                                    | Horizontal padding     |
| Badge Text       | `text-[10px] font-medium text-white`      | Small, white, medium   |

**Reference:** ChatMessagePanel lines 569-575

---

## 🖼️ Wireframe 4: States & Variations

### State 1: 🆕 No Conversations (Empty) - Full Notification Screen

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                     ┌─────────┐                          │
│                     │   📭   │  MessageSquareOff icon   │
│                     └─────────┘                          │
│                                                          │
│               Chưa có cuộc trò chuyện                    │
│                                                          │
│   Category này chưa có cuộc trò chuyện nào.             │
│   Vui lòng tạo cuộc trò chuyện mới hoặc                │
│   chọn category khác.                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Condition:** `categoryConversations` = `undefined` or `[]` or `null`  
**Behavior:** Hiển thị full-screen notification, KHÔNG render ChatHeader/ChatMain

**Implementation:**

```tsx
{categoryConversations.length === 0 ? (
  // Empty state notification
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="mb-4">
      <MessageSquareOff className="w-16 h-16 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">
      Chưa có cuộc trò chuyện
    </h3>
    <p className="text-sm text-gray-500 max-w-md">
      Category này chưa có cuộc trò chuyện nào. Vui lòng tạo cuộc trò chuyện mới hoặc chọn category khác.
    </p>
  </div>
) : (
  // Normal chat UI with tabs
  <>
    <ChatHeader categoryConversations={categoryConversations} ... />
    <ChatMain ... />
  </>
)}
```

---

### State 2: Single Conversation

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • 5 thành viên                        │
│          [Conversation ABC]                              │ ← Single tab
└──────────────────────────────────────────────────────────┘
```

**Behavior:** Vẫn hiển thị 1 tab (không auto-hide)

---

### State 3: Multiple Conversations with Unread

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • 12 thành viên                       │
│          [Conv A] [Conv B 🔴5] [Conv C 🔴12] [Conv D]    │
└──────────────────────────────────────────────────────────┘
```

**Badge Display:**

- Unread count > 0 → show badge
- Unread count = 0 or undefined → no badge
- Unread count > 99 → display "99+" (optional enhancement)

---

### State 3B: 🆕 Loading Messages (When Switching Conversation)

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • 12 thành viên                       │
│          [Conv A] [Conv B 🔴5] [Conv C 🔴12] [Conv D]    │ ← Tabs vẫn active
├──────────────────────────────────────────────────────────┤
│                                                          │
│                      [●] Loading...                    │ ← Loading state
│                                                          │
│  OR:                                                     │
│                                                          │
│  [███ Avatar] [███████████████████]               │ ← Skeleton
│  [███ Avatar] [███████████████████]               │
│  [███ Avatar] [███████████████████]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Condition:** `isLoadingMessages === true` (khi switch conversation)  
**Behavior:**

- Tabs vẫn hiển thị bình thường (không disabled)
- Active tab đã chuyển sang conversation mới
- Vùng chat hiển thị loading (spinner hoặc skeleton)
- Input area có thể disabled trong khi loading (optional)

---

### State 4: Long Conversation Names (Overflow)

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • 8 thành viên                        │
│ ← [Very Long Conversation Name That Ove...] [Conv B] →  │
└──────────────────────────────────────────────────────────┘
```

**Behavior:**

- LinearTabs `noWrap` prop → horizontal scroll
- Scroll arrows appear on overflow
- Active tab auto-scrolls into view

---

### State 5: Loading Conversations (Optional)

**Option A: No Skeleton (Simpler)**

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • ? thành viên                        │
│          (no tabs shown while loading)                   │
└──────────────────────────────────────────────────────────┘
```

**Option B: Skeleton Tabs (More Polish)**

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category A                             [⋮ Menu] │
│          Hoạt động • Loading...                          │
│          [▮▮▮▮] [▮▮▮▮▮▮] [▮▮▮]                           │ ← Skeleton
└──────────────────────────────────────────────────────────┘
```

**Decision:** HUMAN to choose (PENDING DECISION #7 in requirements)

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout                            | Notes                       |
| ---------- | --------------------------------- | --------------------------- |
| Desktop    | Tabs inline below status line     | `mt-2` spacing              |
| Tablet     | Same as desktop                   | LinearTabs handles overflow |
| Mobile     | Tabs in separate row below header | Border-top separation       |

**Media Query:** Handled by `isMobile` prop (parent responsibility)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                            | Lựa chọn                              | HUMAN Decision                 |
| --- | --------------------------------- | ------------------------------------- | ------------------------------ | --- | --- | --------------------------- | --------------------------- | ----------- |
| 1   | Tabs position?                    | Option 1 (below status) / Option 2    | ⬜ **Option 1 (below status)** |
| 2   | Mobile layout?                    | Separate row / Inline                 | ⬜ **Inline**                  |
| 3   | Empty state?                      | Hide tabs / Show message              | ⬜ **Hide tabs**               |
| 4   | Loading state?                    | No skeleton / Skeleton tabs           | ✅ **Skeleton** (giữ nguyên)   |
| 5   | Badge color?                      | Red (rose-500) / Blue / Brand         | ⬜ **Brand**                   |
| 6   | Badge for unread > 99?            | Show "99+" / Show exact number        | ⬜ ** Show "99+"**             |
| 7   | Spacing giữa status line và tabs? | mt-2 (8px) / mt-3 (12px) / mt-1 (4px) | ⬜ **mt-3 (12px)**             |
| 8   | Max conversation name length?     | Truncate / Let LinearTabs handle      | ⬜ **Truncate**                |     | 9   | 🆕 Empty state back button? | Show / Hide / Optional prop | ⬜ **Hide** |
| 10  | 🆕 Empty state message text?      | Fixed / Customizable per category     | ✅ **Giữ nguyên** (đã có)      |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## 📊 IMPACT SUMMARY

### ChatHeader.tsx Changes:

**Lines affected:** ~120-160 (estimated)

**Before:**

```tsx
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2">...</div>
  <div className="text-xs font-medium text-brand-600">{statusLine}</div>
</div>
```

**After:**

```tsx
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2">...</div>
  <div className="text-xs font-medium text-brand-600">{statusLine}</div>
  {/* 🆕 NEW: Conversation tabs */}
  {categoryConversations && categoryConversations.length > 0 && (
    <div className="mt-2">
      <LinearTabs ... />
    </div>
  )}
</div>
```

**Impact:** 🟢 LOW - Chỉ thêm 1 conditional block, không modify existing logic

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                           | Status       |
| ---------------------------------- | ------------ |
| Đã review Desktop wireframes       | ✅ Đã review |
| Đã review Mobile wireframes        | ✅ Đã review |
| Đã review States & Variations      | ✅ Đã review |
| Đã review Design Specifications    | ✅ Đã review |
| Đã điền Pending Decisions (10 mục) | ✅ Đã điền   |
| **APPROVED để thực thi**           | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-19

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- **UI Reference:** ChatMessagePanel WorkType tabs - `src/features/portal/workspace/ChatMessagePanel.tsx` (lines 557-667)
- **Component:** ChatHeader - `src/features/portal/components/chat/ChatHeader.tsx`
- **LinearTabs:** `src/features/portal/components/LinearTabs.tsx`
- **Requirements:** See `01_requirements.md`
