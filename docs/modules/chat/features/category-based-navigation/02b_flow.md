# [BƯỚC 2B] Category-Based Conversation Selector - Flow Diagrams

**Feature ID:** `CBN-002`  
**Version:** 2.0  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📋 Overview

Flow diagrams cho conversation selector feature trong ChatHeader. Focus vào **minimal impact** - chỉ thêm conversation switching logic, không thay đổi category selection flow hiện có.

---

## 🔄 Flow 1: Component Initialization (ChatMainContainer)

### High-Level Flow:

```
User clicks category trong Sidebar
    ↓
ChatMainContainer receives selectedCategoryId prop
    ↓
useCategories hook returns cached data (already loaded)
    ↓
Extract conversations from selected category:
    selectedCategory = categories.find(c => c.id === selectedCategoryId)
    categoryConversations = selectedCategory?.conversations ?? []
    ↓
Auto-select first conversation (useEffect):
    IF categoryConversations.length > 0 AND !selectedConversationId
        THEN setSelectedConversationId(categoryConversations[0].conversationId)
    ↓
Pass props to ChatHeader:
    - categoryConversations
    - selectedConversationId
    - onChangeConversation handler
    ↓
ChatHeader renders LinearTabs (if conversations exist)
    ↓
Load messages for selected conversation
```

**Key Point:** Không có thêm API call - data đã có từ `GET /api/categories`

---

## 🔄 Flow 2: Auto-Select First Conversation

### Detailed Logic:

```
┌──────────────────────────────────────────────────┐
│ ChatMainContainer mounted/selectedCategory changed│
└───────────────┬──────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────┐
│ Extract categoryConversations from selected category│
└───────────────┬──────────────────────────────────┘
                ↓
         ┌──────────────┐
         │ Check: categoryConversations.length > 0? │
         └──────┬───────────────┬──────────────────┘
                │               │
           YES  │               │ NO
                ↓               ↓
    ┌───────────────────┐   ┌──────────────────────────┐
    │ useEffect:        │   │ 🆕 Show Empty State      │
    │ Auto-select first │   │ Notification Screen      │
    │ conversation if   │   │                          │
    │ !selectedConversationId│   │ - Render empty UI    │
    │                   │   │ - NO ChatHeader          │
    │ setSelectedConversationId(│   │ - NO ChatMain        │
    │   categoryConversations[0]│   │ - NO messages load   │
    │   .conversationId │   │                          │
    │ )                 │   └──────────────────────────┘
    └───────────────────┘
                ↓
    ┌───────────────────────────────────────────┐
    │ Render ChatHeader with tabs              │
    │ Load messages for selected conversation   │
    └───────────────────────────────────────────┘
```

### Edge Cases:

| Case                                | Behavior                           |
| ----------------------------------- | ---------------------------------- |
| Category có 0 conversations         | Không auto-select, tabs không hiện |
| User đã chọn conversation trước đó  | Giữ nguyên selection (không reset) |
| Category thay đổi                   | Auto-select first của category mới |
| Selected conversation không tồn tại | Fallback to first conversation     |

---

## 🔄 Flow 3: Conversation Switching

### User Action Flow:

```
User clicks conversation tab trong ChatHeader
    ↓
LinearTabs onChange event fires
    ↓
onChangeConversation(conversationId) called
    ↓
ChatMainContainer updates state:
    setSelectedConversationId(conversationId)
    ↓
Re-render với new selectedConversationId
    ↓
ChatHeader highlights active tab (LinearTabs active prop)
    ↓
Load messages for new conversation:
    useMessages(selectedConversationId, ...)
    ↓
ChatMain component displays new messages
```

### State Update Diagram:

```
┌─────────────────────────────────────────────┐
│ User clicks "Conversation B" tab           │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ onChange("conv-def") triggered              │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ ChatMainContainer:                          │
│   setSelectedConversationId("conv-def")     │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ Re-render cycle:                            │
│   1. ChatHeader active tab = "conv-def"     │
│   2. ChatMain loads messages for "conv-def" │
└─────────────────────────────────────────────┘
```

---

## 🔄 Flow 4: Data Flow (Categories → Conversations → Messages)

### Complete Data Flow:

```
┌──────────────────────────────────────────────────────┐
│ App Mount                                            │
└───────────────┬──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────────┐
│ ConversationListSidebar:                             │
│   useCategories() → GET /api/categories              │
│   Returns: Array<CategoryDto> with nested conversations│
└───────────────┬──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────────┐
│ User selects "Dự án Website" category                │
│   selectedCategoryId = "cat-001"                     │
└───────────────┬──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────────┐
│ ChatMainContainer:                                   │
│   categories = useCategories() (cached)              │
│   selectedCategory = categories.find(...)            │
│   categoryConversations = [                          │
│     { conversationId: "conv-abc", conversationName: "Frontend" },│
│     { conversationId: "conv-def", conversationName: "Backend" }, │
│     { conversationId: "conv-ghi", conversationName: "DevOps" }   │
│   ]                                                  │
└───────────────┬──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────────┐
│ Auto-select first conversation:                      │
│   selectedConversationId = "conv-abc"                │
└───────────────┬──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────────┐
│ ChatHeader renders:                                  │
│   LinearTabs with 3 tabs:                            │
│   - [Frontend] (active)                              │
│   - [Backend]                                        │
│   - [DevOps]                                         │
└───────────────┬──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────────────────────┐
│ ChatMain loads messages:                             │
│   useMessages("conv-abc", ...) → GET /api/messages   │
└──────────────────────────────────────────────────────┘
```

**Optimization:** Chỉ 2 API calls total (categories + messages), không cần `/api/categories/{id}/conversations`

---

## 🔄 Flow 5: Error Handling Flow

### Error Case 1: API Failed

```
GET /api/categories fails
    ↓
useCategories returns error state
    ↓
ChatMainContainer:
    categoryConversations = [] (fallback)
    ↓
ChatHeader:
    Tabs không hiển thị (graceful degradation)
    ↓
User sees error toast (existing error handling)
```

---

### Error Case 2: Empty Conversations

```
Selected category has conversations: [] (or null)
    ↓
categoryConversations = []
    ↓
Check: categoryConversations.length > 0?
    → NO
    ↓
🆕 Render Empty Notification Screen:
    ↓
┌──────────────────────────────────────────┐
│ Full-screen centered notification:       │
│ - MessageSquareOff icon                  │
│ - "Chưa có cuộc trò chuyện"              │
│ - Description text                       │
│ - Optional: Back button                  │
└──────────────────────────────────────────┘
    ↓
NO ChatHeader rendered
NO ChatMain rendered
NO API calls for messages
    ↓
User can:
- Click back to sidebar
- Select different category
```

---

### Error Case 3: Invalid Conversation Selection

```
User clicks conversation "conv-xyz"
    ↓
onChangeConversation("conv-xyz") called
    ↓
ChatMainContainer validates:
    conversation exists in categoryConversations?
    ↓
    NO → Fallback to first conversation
    │
    YES → Update state normally
```

**Implementation:**

```typescript
const handleChangeConversation = (conversationId: string) => {
  const exists = categoryConversations.some(
    (c) => c.conversationId === conversationId
  );

  if (exists) {
    setSelectedConversationId(conversationId);
  } else {
    // Fallback
    if (categoryConversations.length > 0) {
      setSelectedConversationId(categoryConversations[0].conversationId);
    }
  }
};
```

---

## 🔄 Flow 6: Mobile vs Desktop Flow Differences

### Desktop Flow:

```
User clicks category
    ↓
ChatHeader renders with tabs INLINE (below status line)
    ↓
User clicks conversation tab
    ↓
Messages update (no layout shift)
```

---

### Mobile Flow:

```
User clicks category
    ↓
ChatHeader renders
    ↓
Tabs render in SEPARATE ROW (below header, border-top)
    ↓
User clicks conversation tab
    ↓
Messages update
    ↓
Optional: Auto-scroll to messages (PENDING DECISION #12)
```

**Key Difference:** Mobile có layout shift (tabs xuất hiện dưới header), desktop không shift

---

## 🔄 Flow 7: Backward Compatibility Flow

### Existing Code (No Props Passed):

```
<ChatHeader
  displayName="Category A"
  statusLine="Hoạt động"
  conversationCategory="Dự án"
  conversationType="GRP"
  // 🚫 NO categoryConversations prop
  // 🚫 NO selectedConversationId prop
  // 🚫 NO onChangeConversation prop
/>
    ↓
ChatHeader component:
    IF (!categoryConversations) → Tabs không render
    ↓
Hiển thị như cũ (chỉ có header thông thường)
```

**Result:** Existing code vẫn hoạt động bình thường (không breaking)

---

### New Code (With Props):

```
<ChatHeader
  displayName="Category A"
  statusLine="Hoạt động"
  conversationCategory="Dự án"
  conversationType="GRP"
  categoryConversations={[...]}  // ✅ NEW prop
  selectedConversationId="conv-abc"  // ✅ NEW prop
  onChangeConversation={handler}  // ✅ NEW prop
/>
    ↓
ChatHeader component:
    IF (categoryConversations && categoryConversations.length > 0)
        → Render LinearTabs
    ELSE
        → Không render tabs
    ↓
Hiển thị với conversation selector
```

**Result:** Feature hoạt động khi có props, gracefully degrade khi không có

---

## 🧪 Testing Flow Scenarios

### Test 1: Normal Flow

1. Load app → categories loaded
2. Click category → auto-select first conversation
3. Click different conversation → messages update
4. Switch category → auto-select first of new category

**Expected:** All transitions smooth, no errors

---

### Test 2: Empty Category

1. Load app → categories loaded
2. Click category with `conversations: []`
3. Verify tabs không hiển thị
4. Verify no crash, no errors

**Expected:** Graceful empty state

---

### Test 3: Network Error

1. Mock `GET /api/categories` → 500 error
2. Verify error toast shown
3. Verify tabs không crash app
4. Retry → success → tabs appear

**Expected:** Error handling works, recoverable

---

### Test 4: Mobile Layout

1. Load app on mobile viewport
2. Click category
3. Verify tabs render in separate row
4. Click conversation
5. Verify messages update

**Expected:** Mobile-specific layout correct

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                             | Lựa chọn                       | HUMAN Decision |
| --- | ---------------------------------- | ------------------------------ | -------------- |
| 1   | Auto-scroll to messages on mobile? | Yes / No                       | ⬜ **\_\_\_**  |
| 2   | Animation khi switch conversation? | Fade / Slide / None            | ⬜ **\_\_\_**  |
| 3   | Validate conversation exists?      | Yes (strict) / No (trust API)  | ⬜ **\_\_\_**  |
| 4   | Fallback khi invalid conversation? | First / Previous / Error toast | ⬜ **\_\_\_**  |
| 5   | Save last selected conversation?   | localStorage / No              | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review Flow 1-7                | ✅ Đã review |
| Đã review Error handling flows    | ✅ Đã review |
| Đã review Mobile vs Desktop flows | ✅ Đã review |
| Đã review Backward compatibility  | ✅ Đã review |
| Đã review Testing scenarios       | ✅ Đã review |
| Đã điền Pending Decisions (5 mục) | ✅ Đã điền   |
| **APPROVED để thực thi**          | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-19

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- **Requirements:** See `01_requirements.md` FR-1 to FR-4
- **Wireframes:** See `02a_wireframe.md` for visual representation
- **API Contract:** See `03_api-contract.md` for CategoryDto schema
- **Component:** ChatMainContainer - `src/features/portal/components/chat/ChatMainContainer.tsx`
- **Component:** ChatHeader - `src/features/portal/components/chat/ChatHeader.tsx`
