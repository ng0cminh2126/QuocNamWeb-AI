# [BƯỚC 1] Phase 4 Requirements: Message Display & Conversation Info

> **Module:** Chat  
> **Feature:** Message Display & Conversation Info Enhancements  
> **Version:** 4.0  
> **Status:** ⏳ PENDING - Awaiting HUMAN approval  
> **Created:** 2026-01-09

---

## 📋 Version History

| Version | Date       | Changes                                     | Status     |
| ------- | ---------- | ------------------------------------------- | ---------- |
| 4.0     | 2026-01-09 | Initial requirements for UI/UX improvements | ⏳ PENDING |

---

## 🎯 Overview

**What's Phase 4?**

Cải thiện trải nghiệm hiển thị tin nhắn và thông tin đoạn chat để giao diện thân thiện hơn, dễ đọc hơn, và cung cấp đầy đủ thông tin.

**User Pain Points:**

1. Tin nhắn có xuống dòng (`\n`) hiển thị không đúng → khó đọc
2. Tin nhắn liên tiếp của cùng người bị cách quãng → tốn không gian
3. Border radius nhỏ + padding nhiều → trông cứng nhắc
4. Avatar không khớp với đoạn chat active → gây nhầm lẫn
5. Thiếu thông tin về đoạn chat (trạng thái, số thành viên, ai đang online)

**Solutions:**

- Message grouping theo thời gian
- Fix line break rendering
- Tối ưu styling (border-radius, padding)
- Fix avatar từ API response
- Bổ sung conversation status bar

---

## 📐 Functional Requirements

### FR-1: Message Grouping by Time

**ID:** FR-1  
**Priority:** HIGH  
**Description:** Gom nhóm các tin nhắn liên tiếp của cùng người gửi trong khoảng thời gian ngắn

**Acceptance Criteria:**

✅ **Grouping Logic:**

- Tin nhắn được gom nhóm nếu:
  - Cùng người gửi (`senderId`)
  - Khoảng cách thời gian ≤ 10 phút (configurable)
  - Không bị ngắt bởi tin từ người khác

✅ **Visual Changes:**

- **First message in group:**

  - Hiển thị avatar
  - Hiển thị sender name
  - Hiển thị timestamp
  - Full border-radius (tất cả 4 góc)

- **Middle messages in group:**

  - KHÔNG hiển thị avatar (để trống)
  - KHÔNG hiển thị sender name
  - KHÔNG hiển thị timestamp
  - Border-radius: top-left và bottom-left bình thường, top-right và bottom-right = 0.25rem (slight curve)
  - Margin-top reduced: 2px (thay vì 8px)

- **Last message in group:**
  - KHÔNG hiển thị avatar
  - KHÔNG hiển thị sender name
  - Hiển thị timestamp
  - Border-radius: top-left và bottom-left bình thường, top-right và bottom-right = full

✅ **Group Time Threshold:**

- Default: 10 minutes
- Configurable via constant: `MESSAGE_GROUP_THRESHOLD_MS = 10 * 60 * 1000`

**Example:**

```
[Avatar] John Doe • 10:00 AM
┌─────────────────┐
│ Hello everyone  │
└─────────────────┘

        ┌─────────────────┐
        │ How are you?    │  ← No avatar, no name, reduced margin
        └─────────────────┘

        ┌─────────────────┐
        │ Good morning!   │  ← Shows timestamp (last in group)
        └─────────────────┘  10:02 AM

[Avatar] Jane Smith • 10:03 AM
┌─────────────────┐
│ Hi John!        │
└─────────────────┘
```

---

### FR-2: Line Break Rendering

**ID:** FR-2  
**Priority:** HIGH  
**Description:** Hiển thị đúng tin nhắn có dấu xuống dòng (`\n`)

**Current Issue:**

- Tin nhắn từ API có `\n` nhưng hiển thị thành khoảng trắng hoặc bị ignore

**Solution:**

✅ Convert `\n` thành `<br />` khi render HTML  
✅ Hoặc dùng CSS `white-space: pre-wrap` để preserve line breaks  
✅ Handle multiple consecutive line breaks (e.g., `\n\n` → 2 line breaks)

**Acceptance Criteria:**

✅ Message content "Hello\nWorld" hiển thị thành:

```
Hello
World
```

✅ Message content "Line 1\n\nLine 3" hiển thị thành:

```
Line 1

Line 3
```

**Implementation Options:**

| Option | Approach                       | Pros          | Cons               |
| ------ | ------------------------------ | ------------- | ------------------ |
| **A**  | CSS `white-space: pre-wrap`    | Simple, no JS | May affect spacing |
| **B**  | Replace `\n` with `<br />`     | Full control  | Need sanitization  |
| **C**  | Split by `\n` and map to `<p>` | Semantic HTML | More complex       |

**HUMAN Decision:** Option ⬜ \_\_\_ (A, B, or C)

---

### FR-3: Message Bubble Styling

**ID:** FR-3  
**Priority:** MEDIUM  
**Description:** Cập nhật border-radius và padding để message bubbles trông mềm mại hơn

**Current Styling:**

```css
/* Current (example) */
.message-bubble {
  border-radius: 0.5rem; /* 8px */
  padding: 0.75rem 1rem; /* 12px top/bottom, 16px left/right */
}
```

**New Styling:**

```css
/* Proposed */
.message-bubble {
  border-radius: 1rem; /* 16px - rounder corners */
  padding: 0.5rem 1rem; /* 8px top/bottom, 16px left/right */
}
```

**Acceptance Criteria:**

✅ Border-radius tăng lên **1rem** (16px)  
✅ Padding top/bottom giảm xuống **0.5rem** (8px)  
✅ Padding left/right giữ nguyên **1rem** (16px)  
✅ Không ảnh hưởng đến file attachments hoặc special message types

**Visual Impact:**

- Messages look softer, more modern
- Less vertical space wasted
- Better density for long conversations

---

### FR-4: Avatar Accuracy

**ID:** FR-4  
**Priority:** HIGH  
**Description:** Đảm bảo avatar hiển thị đúng với đoạn chat đang active

**Current Issue:**

- Avatar hiển thị không khớp với conversation đang mở
- Avatar không update khi switch conversation

**Solution:**

✅ **Giữ nguyên avatar logic hiện có - KHÔNG thay đổi:**

- **Avatar Group/Conversation (current behavior):**

  - Nền: Xám (gray)
  - Chữ: Đen (black)
  - Hiển thị chữ cái đầu tiên của `conversation.name`
  - VD: "Development Team" → "D"
  - **GIỮ NGUYÊN - không thay đổi**

- **Avatar Member/Participant (current behavior):**
  - Giữ nguyên logic hiện tại (màu nền generate từ user ID, chữ trắng)
  - **GIỮ NGUYÊN - không thay đổi**

✅ **Fix cần thực hiện (chỉ fix bugs, không thay đổi UI):**

- Avatar trong conversation list (sidebar) phải khớp với conversation header
- Avatar phải update đúng khi switch giữa các conversations
- Sử dụng đúng `conversation.name` từ API response

✅ **Future Enhancement (khi API có avatarFileId):**

- Nếu `conversation.avatarFileId` có giá trị → load image từ `/api/Files/{avatarFileId}/preview`
- Nếu không có → fallback to default avatar (nền xám, chữ đen)

**Acceptance Criteria:**

✅ **Avatar Consistency:**

- Mở conversation A → header hiển thị đúng avatar của A (chữ cái đầu)
- Switch sang conversation B → header update đúng avatar của B
- Avatar trong sidebar === Avatar trong header (cùng chữ, cùng styling)

✅ **Consistency:**

- Switch từ conversation A sang B → avatar update đúng chữ cái
- Avatar trong sidebar === Avatar trong header (cùng chữ, cùng màu)

✅ **Future-proof:**

- Code sẵn sàng để switch sang avatarFileId khi API cung cấp
- Nếu `avatarFileId` exists → load image, else → default avatar

---

### FR-5: Conversation Info Display

**ID:** FR-5  
**Priority:** HIGH  
**Description:** Hiển thị thông tin bổ sung về đoạn chat ở header

**Current State:**

- Chỉ hiển thị tên conversation
- Thiếu thông tin về trạng thái, members, online status

**New Info to Display:**

✅ **Status Line (below conversation name):**

Format: `[Status] • [Member Count] • [Online Count]`

Example: `Active • 5 members • 3 online`

**Status:**

- Active: Đoạn chat đang hoạt động
- Archived: Đã archive
- Muted: Đã tắt thông báo
- Field: `conversation.status` từ API

**Member Count:**

- Total members in conversation
- Field: `conversation.participants.length` hoặc `conversation.memberCount`
- Format: "X members" (plural) hoặc "1 member" (singular)

**Online Count:**

- Number of members currently online/viewing
- Field: `conversation.onlineCount` hoặc from SignalR presence
- Format: "X online"
- Chỉ hiển thị nếu > 0

**Acceptance Criteria:**

✅ **Group Chat Example:**

```
┌─────────────────────────────────────┐
│ [Avatar] Development Team           │
│          Active • 5 members • 3 online │
└─────────────────────────────────────┘
```

✅ **Direct Message Example:**

```
┌─────────────────────────────────────┐
│ [Avatar] John Doe                   │
│          Active • Online            │
└─────────────────────────────────────┘
```

✅ **Archived Chat Example:**

```
┌─────────────────────────────────────┐
│ [Avatar] Old Project                │
│          Archived • 3 members       │
└─────────────────────────────────────┘
```

✅ Status line có styling khác biệt:

- Font size nhỏ hơn tên (text-sm)
- Color: text-gray-600
- Các phần cách nhau bằng bullet " • "

---

## 🎨 UI Requirements

### UR-1: Message Grouping Visual Design

**First Message in Group:**

```
[Avatar] Sender Name • Timestamp
┌──────────────────────────────┐
│ Message content              │
└──────────────────────────────┘
```

**Middle Message in Group:**

```
        ┌──────────────────────────────┐
        │ Message content              │
        └──────────────────────────────┘
```

- Left margin = avatar width + gap (e.g., 48px)
- Top margin = 2px (reduced)
- Border-radius: slight curve on right side

**Last Message in Group:**

```
        ┌──────────────────────────────┐
        │ Message content              │
        └──────────────────────────────┘
                            Timestamp
```

---

### UR-2: Conversation Header Layout

**Desktop (≥768px):**

```
┌─────────────────────────────────────────────────┐
│ [←] [Avatar] Conversation Name          [⋮][✕] │
│              Status • Members • Online           │
└─────────────────────────────────────────────────┘
```

- Height: 72px (increased from 60px to accommodate 2 lines)
- Avatar: 40px x 40px
- Back button: 32px x 32px
- Actions (⋮, ✕): 32px x 32px each

**Mobile (<768px):**

```
┌───────────────────────────────┐
│ [←] [Av] Name          [⋮][✕] │
│          Status • 3 online     │
└───────────────────────────────┘
```

- Height: 64px
- Avatar: 32px x 32px
- Name truncates if too long
- Status line may wrap or truncate

---

### UR-3: Spacing & Alignment

**Message Spacing:**

- Between groups: 16px
- Within group (first → middle): 2px
- Within group (middle → middle): 2px
- Within group (middle → last): 2px

**Conversation Header:**

- Padding: 16px (all sides)
- Gap between avatar and text: 12px
- Gap between name and status line: 4px

---

## 🔒 Security Requirements

### SR-1: Content Sanitization

**Requirement:** Line breaks và message content phải được sanitize để prevent XSS

**Implementation:**

✅ Nếu dùng `dangerouslySetInnerHTML` để render `<br />`:

- Phải sanitize content trước (remove `<script>`, `<iframe>`, etc.)
- Chỉ allow `<br />` tags

✅ Nếu dùng CSS `white-space: pre-wrap`:

- Render content as text (tự động escaped)
- An toàn hơn, khuyến nghị approach này

---

## 🧪 Testing Requirements

### TR-1: Manual Test Cases

**Test Case 1: Message Grouping**

```
GIVEN: Conversation has messages from same user within 10 minutes
WHEN: View conversation
THEN:
  - First message shows avatar + name + timestamp
  - Middle messages no avatar, no name, reduced margin
  - Last message shows timestamp only
  - Messages visually grouped together
```

**Test Case 2: Line Breaks**

```
GIVEN: Message content is "Hello\nWorld\n\nNew paragraph"
WHEN: View message
THEN:
  - "Hello" on line 1
  - "World" on line 2
  - Empty line 3
  - "New paragraph" on line 4
```

**Test Case 3: Avatar Accuracy**

```
GIVEN: User opens conversation "Project Alpha"
WHEN: View conversation header
THEN:
  - Avatar matches "Project Alpha" avatar from API
WHEN: Switch to conversation "Project Beta"
THEN:
  - Avatar updates to "Project Beta" avatar
```

**Test Case 4: Conversation Info**

```
GIVEN: Group chat with 5 members, 3 online
WHEN: View conversation header
THEN:
  - Status line shows "Active • 5 members • 3 online"
  - Font smaller than conversation name
  - Gray color (text-gray-600)
```

---

### TR-2: Unit Test Coverage

**Components to Test:**

✅ `MessageBubble.tsx` (or equivalent)

- ✅ Renders with line breaks (`\n`) correctly
- ✅ Applies correct border-radius (1rem)
- ✅ Applies correct padding (0.5rem/1rem)

✅ `MessageList.tsx`

- ✅ Groups messages by sender and time
- ✅ First message shows avatar + name
- ✅ Middle messages hide avatar + name
- ✅ Last message shows timestamp
- ✅ Respects 10-minute threshold

✅ `ConversationHeader.tsx`

- ✅ Renders conversation name
- ✅ Renders correct avatar from API data
- ✅ Renders status line with correct format
- ✅ Handles group chat vs direct message
- ✅ Handles online count = 0 (hide "online" part)

✅ `useConversationInfo.ts` hook (if created)

- ✅ Fetches conversation details
- ✅ Extracts avatar correctly
- ✅ Calculates member count
- ✅ Updates on conversation change

---

### TR-3: E2E Test Scenarios

**Scenario 1: Message Grouping Flow**

```gherkin
Feature: Message Grouping

Scenario: User views conversation with grouped messages
  Given I am logged in
  And I open conversation "Team Chat"
  And the conversation has 3 messages from "John Doe" within 5 minutes
  When I view the message list
  Then the first message should show avatar and "John Doe"
  And the second message should not show avatar
  And the third message should show timestamp
  And all 3 messages should appear visually grouped
```

**Scenario 2: Conversation Info Display**

```gherkin
Feature: Conversation Info

Scenario: User views group chat header
  Given I am logged in
  And I open a group chat with 5 members
  And 3 members are currently online
  When I view the conversation header
  Then I should see the group name
  And I should see "Active • 5 members • 3 online"
  And the status line should be below the group name
```

---

## 📊 Performance Requirements

### PR-1: Grouping Performance

- **Grouping algorithm:** O(n) - single pass through messages
- **Re-render on new message:** Only affected group updates
- **Memoization:** Use `useMemo` for grouped messages array

### PR-2: Avatar Rendering

- **Default avatar generation:** Instant (no API call needed)
- **Color generation:** Deterministic from conversation ID (same ID = same color)
- **Future avatar loading (when API ready):**
  - Cache avatars: Browser cache + in-memory cache
  - Lazy load: Load image when conversation becomes visible
  - Fallback: Default avatar if load fails

---

## 🔗 API Dependencies

### Existing APIs Used:

✅ **GET /api/Conversations/{id}**

- Purpose: Get conversation details (avatar, status, members)
- [Contract](../../../../api/chat/conversations/contract.md) (if exists)

✅ **GET /api/Conversations/{id}/messages**

- Purpose: Get messages (already implemented Phase 1)
- [Contract](../../../../api/chat/messages/contract.md) (if exists)

**New Fields Needed (if not already in API):**

| Field                       | Type          | Purpose               | Current Status | Required?                                   |
| --------------------------- | ------------- | --------------------- | -------------- | ------------------------------------------- |
| `conversation.avatarFileId` | string (GUID) | Avatar file reference | ⏳ NOT YET     | ⬜ Future (use default for now)             |
| `conversation.status`       | string enum   | Active/Archived/Muted | ❓ Unknown     | ✅ Yes                                      |
| `conversation.memberCount`  | number        | Total members         | ❓ Unknown     | ⬜ Optional (can use `participants.length`) |
| `conversation.onlineCount`  | number        | Members online        | ⏳ NOT YET     | ⬜ Optional (can be 0 if not available)     |
| `participant.avatarFileId`  | string (GUID) | User avatar (for DMs) | ⏳ NOT YET     | ⬜ Future (use default for now)             |

**SignalR Events (Optional):**

- `OnUserOnline` / `OnUserOffline` - Update online count real-time
- `ConversationUpdated` - Update avatar/status if changed

---

## 🚀 Out of Scope (Future)

❌ Custom time threshold per user (hardcoded 10 minutes OK for now)  
❌ Show who is typing indicator  
❌ Show who viewed message (read receipts)  
❌ Infinite scroll optimization for very long grouped conversations  
❌ Message reactions/emoji (separate feature)  
❌ Rich text formatting (bold, italic, links) - separate Phase 5

---

## ⏳ PENDING DECISIONS (HUMAN PHẢI ĐIỀN)

| #   | Decision Point                    | Options                           | HUMAN Choice |
| --- | --------------------------------- | --------------------------------- | ------------ |
| 1   | Line break rendering approach     | A (CSS) / B (Replace) / C (Split) | ⬜ **CSS**   |
| 2   | Message group time threshold      | 5min / 10min / 15min              | ⬜ **10min** |
| 3   | Show online count if = 0?         | Yes ("0 online") / No (hide)      | ⬜ **No**    |
| 4   | Conversation header height        | 72px / 80px                       | ⬜ **72px**  |
| 5   | Group first message border-radius | Same as others / Slightly larger  | ⬜ **Same**  |
| 6   | Avatar size in header (desktop)   | 32px / 40px / 48px                | ⬜ **40px**  |

---

## 📋 IMPACT SUMMARY

### Files Tạo Mới:

- `src/utils/messageGrouping.ts` - Logic để group messages by time
- `src/utils/messageGrouping.test.ts` - Unit tests cho grouping logic
- `src/hooks/useConversationInfo.ts` - Hook để fetch conversation details (nếu chưa có)
- `src/hooks/useConversationInfo.test.ts` - Tests

### Files Sửa Đổi:

- **`src/features/portal/components/ChatMainContainer.tsx`** (or equivalent)

  - Import `messageGrouping` utility
  - Apply grouping logic trước khi render messages
  - Pass `isFirstInGroup`, `isLastInGroup` props to MessageBubble

- **`src/features/portal/components/MessageBubble.tsx`** (or equivalent message component)

  - Accept props: `isFirstInGroup`, `isMiddleInGroup`, `isLastInGroup`
  - Conditionally render avatar, sender name, timestamp
  - Apply dynamic border-radius based on position
  - Fix line break rendering (CSS or `\n` → `<br />`)
  - Update padding: `py-2 px-4` (0.5rem / 1rem)
  - Update border-radius: `rounded-2xl` (1rem)

- **`src/features/portal/components/ConversationHeader.tsx`** (or equivalent)

  - Fetch conversation details via `useConversationInfo` hook
  - Display avatar from `conversation.avatar`
  - Add status line below conversation name
  - Format: "Status • X members • Y online"
  - Styling: text-sm, text-gray-600

- **`src/types/conversation.ts`** (if exists)
  - Add fields: `status`, `memberCount`, `onlineCount`, `avatar`

### Dependencies Thêm:

- (Không có - sử dụng existing dependencies)

### Breaking Changes:

- ⚠️ Message component props thay đổi (thêm `isFirstInGroup`, etc.)
- ⚠️ Conversation type có thể cần update nếu thiếu fields

---

## ✅ HUMAN CONFIRMATION

| Hạng Mục                      | Status       |
| ----------------------------- | ------------ |
| Đã review Impact Summary      | ✅ Đã review |
| Đã điền Pending Decisions     | ✅ Đã điền   |
| **APPROVED để tạo wireframe** | ✅ APPROVED  |

**HUMAN Signature:** [MINH ĐÃ DUYỆT]  
**Date:** 2026-01-09

---

⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tiếp tục BƯỚC 2A (wireframe) nếu mục "APPROVED để tạo wireframe" = ⬜ CHƯA APPROVED**

---

**Created:** 2026-01-09  
**Next Step:** HUMAN review và approve → Tạo wireframe (BƯỚC 2A)
