# [BƯỚC 2A] Phase 4 Wireframe: Message Display & Conversation Info

> **Module:** Chat  
> **Feature:** Message Display & Conversation Info Enhancements  
> **Version:** 4.0  
> **Status:** ⏳ PENDING - Awaiting HUMAN approval  
> **Created:** 2026-01-09

---

## 📋 Overview

Document này chi tiết wireframe UI cho Phase 4 improvements:

1. **Message Grouping** - Visual grouping of consecutive messages
2. **Line Break Rendering** - Proper display of multi-line messages
3. **Message Styling** - Updated border-radius and padding
4. **Avatar Consistency** - Correct avatar display (keep current styling)
5. **Conversation Info** - Status line in header

---

## 🎨 Design Specs

### Colors

```css
/* Conversation Avatar - GIỮ NGUYÊN */
--conversation-avatar-bg: #E5E7EB; /* gray-200 */
--conversation-avatar-text: #1F2937; /* gray-800/black */

/* Member Avatar - GIỮ NGUYÊN */
--member-avatar-bg: [Generated from user ID]
--member-avatar-text: #FFFFFF; /* white */

/* Message Bubbles */
--message-outgoing-bg: #10B981; /* emerald-500 - GIỮ NGUYÊN */
--message-incoming-bg: #F3F4F6; /* gray-100 */
--message-text-outgoing: #FFFFFF; /* white */
--message-text-incoming: #1F2937; /* gray-800 */

/* Conversation Status */
--status-text: #6B7280; /* gray-600 */
--status-separator: #D1D5DB; /* gray-300 for bullet • */
```

### Typography

```css
/* Conversation Header */
--conv-name-size: 1rem; /* 16px */
--conv-name-weight: 600; /* semibold */

--status-size: 0.875rem; /* 14px - text-sm */
--status-weight: 400; /* normal */
--status-color: var(--status-text);

/* Messages */
--sender-name-size: 0.875rem; /* 14px */
--sender-name-weight: 600; /* semibold */

--message-text-size: 0.875rem; /* 14px */
--timestamp-size: 0.75rem; /* 12px - text-xs */
```

### Spacing

```css
/* Message Grouping */
--group-gap: 16px; /* Between groups */
--message-gap-in-group: 2px; /* Between messages in same group */

/* Message Padding */
--message-padding-y: 0.5rem; /* 8px - UPDATED */
--message-padding-x: 1rem; /* 16px */

/* Border Radius */
--message-radius: 1rem; /* 16px - UPDATED */
--message-radius-tight: 0.25rem; /* 4px - for middle messages */

/* Conversation Header */
--header-height: 72px; /* UPDATED to fit 2 lines */
--header-padding: 16px;
--header-gap: 12px; /* Between avatar and text */
--header-line-gap: 4px; /* Between name and status */
```

---

## 📱 Wireframes

### 1. Message Grouping - Desktop View

```
┌─────────────────────────────────────────────────────────────┐
│                    CONVERSATION HEADER                      │
│  [←] [Av] Development Team                      [⋮] [✕]    │
│           Active • 5 members • 3 online                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     MESSAGE AREA                            │
│                                                             │
│  ┌─ GROUP 1 (Same sender, within 10 min) ──────────────┐  │
│  │                                                       │  │
│  │  10:00 AM                                            │  │
│  │  [Avatar] John Doe                                   │  │
│  │  ┌──────────────────────────────────────┐            │  │
│  │  │ Hello everyone                       │ ← First    │  │
│  │  │ How are you doing today?             │   message  │  │
│  │  └──────────────────────────────────────┘            │  │
│  │                                                       │  │
│  │          ┌──────────────────────────────────────┐    │  │
│  │          │ Just checking in                     │ ← Middle │
│  │          └──────────────────────────────────────┘    │  │
│  │          (2px gap, no avatar, no name)               │  │
│  │                                                       │  │
│  │          ┌──────────────────────────────────────┐    │  │
│  │          │ Let me know if you need help         │ ← Last │
│  │          └──────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  (16px gap between groups)                                  │
│                                                             │
│  ┌─ GROUP 2 (Different sender) ─────────────────────────┐  │
│  │                                                       │  │
│  │  10:03 AM                                            │  │
│  │  [Avatar] Jane Smith                                 │  │
│  │  ┌──────────────────────────────────────┐            │  │
│  │  │ Hi John!                             │            │  │
│  │  │ Thanks for checking in               │            │  │
│  │  └──────────────────────────────────────┘            │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Timestamp:** Hiển thị ở TRÊN nhóm tin nhắn (trước avatar và sender name)

  - Format: "HH:mm AM/PM" (e.g., "10:00 AM")
  - Position: Top of message group
  - Styling: text-xs, text-gray-500, centered hoặc aligned with messages

- **First message in group:**

  - Shows timestamp ở trên (cho cả nhóm)
  - Shows avatar (40px circle)
  - Shows sender name (NO timestamp cạnh tên)
  - Full border-radius (1rem all corners)
  - Standard padding (0.5rem/1rem)

- **Middle message:**

  - Left margin = avatar width + gap
  - NO avatar, NO sender name, NO timestamp
  - Border-radius: left side 1rem, right side 0.25rem (slight)
  - Top margin: 2px (tight)

- **Last message:**
  - Same styling as middle
  - NO timestamp below message (đã có ở trên nhóm)
  - Border-radius: left side 1rem, right side 1rem (full)

---

### 2. Line Break Rendering

**Before (Current - Incorrect):**

```
┌─────────────────────────────────────────┐
│ Time                                   │
│ [Avatar] User                          │
│ ┌───────────────────────────────────┐  │
│ │ Hello World New paragraph here    │  │ ← Wrong: \n ignored
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**After (Fixed with white-space: pre-wrap):**

```
┌─────────────────────────────────────────┐
│ 10:00 AM                               │
│ [Avatar] User                          │
│ ┌───────────────────────────────────┐  │
│ │ Hello                             │  │
│ │ World                             │  │
│ │                                   │  │ ← Blank line preserved
│ │ New paragraph here                │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**CSS Implementation:**

```css
.message-content {
  white-space: pre-wrap; /* Preserves \n and wraps text */
  word-break: break-word; /* Break long words */
}
```

---

### 3. Message Bubble Styling Comparison

**Current Styling:**

```
┌────────────────────────────┐
│  Message with current      │  ← border-radius: 0.5rem (8px)
│  padding and radius        │     padding: 0.75rem 1rem (12px/16px)
└────────────────────────────┘
   ↑ feels boxy, more padding
```

**New Styling (Phase 4):**

```
╭──────────────────────────╮
│ Message with updated     │  ← border-radius: 1rem (16px)
│ padding and radius       │     padding: 0.5rem 1rem (8px/16px)
╰──────────────────────────╯
   ↑ softer, less vertical space
```

**Visual Comparison:**

| Property           | Current | New  | Change          |
| ------------------ | ------- | ---- | --------------- |
| Border-radius      | 8px     | 16px | +100% (rounder) |
| Padding vertical   | 12px    | 8px  | -33% (tighter)  |
| Padding horizontal | 16px    | 16px | No change       |

---

### 4. Conversation Header - Desktop

```
┌──────────────────────────────────────────────────────────────┐
│                     CONVERSATION HEADER                      │
│  Height: 72px                                                │
│                                                              │
│  ┌───┐  Development Team                       ┌─┐  ┌─┐    │
│  │ D │  Active • 5 members • 3 online          │⋮│  │✕│    │
│  └───┘                                          └─┘  └─┘    │
│   ↑                                               ↑    ↑     │
│  40px                                            Actions     │
│  Gray bg                                                     │
│  Black text                                                  │
└──────────────────────────────────────────────────────────────┘

Layout:
┌─────┬─────────────────────────────────┬──────────────┐
│Back │ [Avatar] Name                   │ [Actions]    │
│ 32px│         Status line             │              │
└─────┴─────────────────────────────────┴──────────────┘
│← 16px padding all sides →│
```

**Breakdown:**

- **Back button:** 32x32px, positioned left
- **Avatar:** 40x40px circle
  - Gray background (#E5E7EB)
  - Black text (#1F2937)
  - First letter of conversation name
- **Name + Status:** Flex column, gap 4px
  - **Name:** 16px semibold
  - **Status:** 14px gray-600
- **Actions:** Right-aligned (menu, close)

---

### 5. Conversation Header - States

**Group Chat (Active, with online members):**

```
┌──────────────────────────────────────────┐
│ [←] [Av] Project Alpha        [⋮] [✕]   │
│          Active • 8 members • 5 online   │
└──────────────────────────────────────────┘
```

**Group Chat (No online members):**

```
┌──────────────────────────────────────────┐
│ [←] [Av] Old Project          [⋮] [✕]   │
│          Archived • 3 members            │
└──────────────────────────────────────────┘
```

Note: "online" omitted when count = 0

**Direct Message (1-1 chat):**

```
┌──────────────────────────────────────────┐
│ [←] [J] John Doe              [⋮] [✕]   │
│          Active • Online                 │
└──────────────────────────────────────────┘
```

Note: Simplified format for DM

---

### 6. Mobile View (< 768px)

**Conversation Header:**

```
┌───────────────────────────────────┐
│                                   │
│ [←] [Av] Dev Team      [⋮] [✕]   │
│          Active • 3 online        │
│                                   │
└───────────────────────────────────┘
  ↑      ↑                ↑    ↑
 Back   32px           Actions
       Avatar
```

**Changes from Desktop:**

- Header height: 64px (reduced from 72px)
- Avatar: 32px (reduced from 40px)
- Name truncates with ellipsis if too long
- Status line may wrap to 2 lines if needed

**Message Grouping:**

```
┌─────────────────────────────┐
│                             │
│ 10:00                      │
│ [Av] John                  │
│ ┌─────────────────────────┐ │
│ │ Hello everyone          │ │
│ └─────────────────────────┘ │
│                             │
│      ┌─────────────────────┐│
│      │ How are you?        ││ ← Grouped
│      └─────────────────────┘│
│                             │
└─────────────────────────────┘
```

Same grouping logic, responsive sizing.

---

## 📐 Component Specifications

### ConversationHeader Component

**Props:**

```typescript
interface ConversationHeaderProps {
  conversationId: string;
  conversationName: string;
  avatarFileId?: string | null; // Future - not used yet
  status: "Active" | "Archived" | "Muted";
  memberCount: number;
  onlineCount: number;
  isDirect: boolean; // Is direct message (1-1)?
  onBack: () => void;
  onMenuClick: () => void;
  onClose: () => void;
}
```

**Layout Structure:**

```jsx
<header className="h-18 px-4 flex items-center gap-3">
  {/* Back Button */}
  <Button size="icon" onClick={onBack}>
    <ArrowLeft />
  </Button>

  {/* Avatar - Default with first letter */}
  <Avatar size="md">
    <AvatarFallback className="bg-gray-200 text-gray-800">
      {conversationName[0].toUpperCase()}
    </AvatarFallback>
  </Avatar>

  {/* Name + Status */}
  <div className="flex-1 flex flex-col gap-1">
    <h2 className="text-base font-semibold truncate">{conversationName}</h2>
    <StatusLine
      status={status}
      memberCount={memberCount}
      onlineCount={onlineCount}
      isDirect={isDirect}
    />
  </div>

  {/* Actions */}
  <Button size="icon" onClick={onMenuClick}>
    <MoreVertical />
  </Button>
  <Button size="icon" onClick={onClose}>
    <X />
  </Button>
</header>
```

---

### StatusLine Component

**Props:**

```typescript
interface StatusLineProps {
  status: "Active" | "Archived" | "Muted";
  memberCount: number;
  onlineCount: number;
  isDirect: boolean;
}
```

**Format Logic:**

```typescript
function formatStatusLine(props: StatusLineProps): string {
  const { status, memberCount, onlineCount, isDirect } = props;

  const parts: string[] = [status];

  if (isDirect) {
    // Direct message: "Active • Online" or "Active"
    if (onlineCount > 0) {
      parts.push("Online");
    }
  } else {
    // Group chat: "Active • 5 members • 3 online"
    parts.push(`${memberCount} ${memberCount === 1 ? "member" : "members"}`);
    if (onlineCount > 0) {
      parts.push(`${onlineCount} online`);
    }
  }

  return parts.join(" • ");
}
```

**Example Outputs:**

| Type   | Status   | Members | Online | Output                          |
| ------ | -------- | ------- | ------ | ------------------------------- |
| Group  | Active   | 5       | 3      | `Active • 5 members • 3 online` |
| Group  | Active   | 5       | 0      | `Active • 5 members`            |
| Group  | Archived | 3       | 0      | `Archived • 3 members`          |
| Direct | Active   | 2       | 1      | `Active • Online`               |
| Direct | Active   | 2       | 0      | `Active`                        |

---

### MessageBubble Component (Updated)

**New Props:**

```typescript
interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;

  // NEW PROPS for grouping:
  isFirstInGroup: boolean;
  isMiddleInGroup: boolean;
  isLastInGroup: boolean;
}
```

**Conditional Rendering:**

```jsx
<div
  className={cn(
    "flex gap-2",
    isOutgoing && "flex-row-reverse",
    // Margin top: reduced if in group
    isFirstInGroup ? "mt-4" : "mt-0.5"
  )}
>
  {/* Avatar - only show if first in group */}
  {isFirstInGroup && !isOutgoing && (
    <Avatar size="sm">
      <AvatarFallback className="bg-emerald-500 text-white">
        {message.sender.name[0]}
      </AvatarFallback>
    </Avatar>
  )}

  {/* Spacer if not first (to align with avatar) */}
  {!isFirstInGroup && !isOutgoing && (
    <div className="w-10" /> // Avatar width + gap
  )}

  <div className="flex flex-col gap-1">
    {/* Timestamp - only show at top of group */}
    {isFirstInGroup && (
      <span className="text-xs text-gray-500">
        {formatTime(message.timestamp)}
      </span>
    )}

    {/* Sender name - only if first in group */}
    {isFirstInGroup && !isOutgoing && (
      <span className="text-sm font-semibold">{message.sender.name}</span>
    )}

    {/* Message bubble */}
    <div
      className={cn(
        "px-4 py-2", // Updated padding
        "rounded-2xl", // Updated border-radius
        isOutgoing ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-800",

        // Dynamic border-radius for grouped messages
        !isFirstInGroup && !isLastInGroup && isOutgoing && "rounded-tr-sm",
        !isFirstInGroup && !isLastInGroup && !isOutgoing && "rounded-tl-sm"
      )}
    >
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.content}
      </p>
    </div>
  </div>
</div>
```

---

### MessageGrouping Utility

**Function:**

```typescript
interface GroupedMessage {
  message: Message;
  isFirstInGroup: boolean;
  isMiddleInGroup: boolean;
  isLastInGroup: boolean;
}

function groupMessages(
  messages: Message[],
  thresholdMs: number = 10 * 60 * 1000 // 10 minutes
): GroupedMessage[] {
  if (messages.length === 0) return [];

  const grouped: GroupedMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const previous = messages[i - 1];
    const next = messages[i + 1];

    // Check if same group as previous
    const sameAsPrevious =
      previous &&
      previous.senderId === current.senderId &&
      current.timestamp - previous.timestamp <= thresholdMs;

    // Check if same group as next
    const sameAsNext =
      next &&
      next.senderId === current.senderId &&
      next.timestamp - current.timestamp <= thresholdMs;

    const isFirstInGroup = !sameAsPrevious;
    const isLastInGroup = !sameAsNext;
    const isMiddleInGroup = !isFirstInGroup && !isLastInGroup;

    grouped.push({
      message: current,
      isFirstInGroup,
      isMiddleInGroup,
      isLastInGroup,
    });
  }

  return grouped;
}
```

---

## 🎨 Visual Examples

### Example 1: Message Group with Line Breaks

```
┌──────────────────────────────────────────────────────┐
│ 10:15 AM                                            │
│ [Avatar] Alice Johnson                              │
│ ┌────────────────────────────────────────────────┐  │
│ │ Hey team,                                      │  │
│ │                                                │  │ ← Line break preserved
│ │ Here's the update:                             │  │
│ │ - Feature A complete                           │  │
│ │ - Feature B in progress                        │  │
│ │                                                │  │
│ │ Let me know if you have questions.             │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│        ┌────────────────────────────────────────┐   │
│        │ Thanks for reading!                    │   │ ← Grouped
│        └────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Key Points:**

- Timestamp hiển thị ở trên nhóm (10:15 AM)
- First message shows avatar + sender name
- Line breaks in content preserved
- Second message grouped (no avatar/name)
- NO timestamp ở dưới (đã có ở trên)

---

### Example 2: Alternating Senders

```
┌──────────────────────────────────────────────────────┐
│ 10:00 AM                                            │
│ [A] Alice                                           │
│ ┌──────────────────────────────────────┐            │
│ │ Should we meet at 2pm?               │            │
│ └──────────────────────────────────────┘            │
│                                                      │
│                                         10:01 AM     │
│                                         [B] Bob      │
│                    ┌──────────────────────────────┐ │
│                    │ Yes, that works for me       │ │
│                    └──────────────────────────────┘ │
│                                                      │
│ 10:02 AM                                            │
│ [A] Alice                                           │
│ ┌──────────────────────────────────────┐            │
│ │ Great! See you then                  │            │
│ └──────────────────────────────────────┘            │
└──────────────────────────────────────────────────────┘
```

**Key Points:**

- Each sender change = new group
- All messages show full metadata (not grouped)
- Outgoing messages (right-aligned) vs incoming (left-aligned)

---

## 📊 Responsive Breakpoints

| Breakpoint          | Header Height | Avatar Size | Message Padding | Notes                          |
| ------------------- | ------------- | ----------- | --------------- | ------------------------------ |
| Desktop (≥1024px)   | 72px          | 40px        | 0.5rem/1rem     | Standard layout                |
| Tablet (768-1023px) | 72px          | 40px        | 0.5rem/1rem     | Same as desktop                |
| Mobile (<768px)     | 64px          | 32px        | 0.5rem/1rem     | Compact header, smaller avatar |

---

## 🧪 Interaction States

### Message Hover (Desktop)

```
Normal:
┌────────────────────────────┐
│ Message content here       │
└────────────────────────────┘

Hover:
┌────────────────────────────┬──────┐
│ Message content here       │ [...] │ ← Action menu appears
└────────────────────────────┴──────┘
```

### Conversation Header Actions

**Menu Button:**

- Normal: MoreVertical icon (gray)
- Hover: Background gray-100
- Click: Show dropdown menu

**Close Button:**

- Normal: X icon (gray)
- Hover: Background gray-100, icon gray-700
- Click: Close conversation view

---

## 6. Image Message Loading States

### Single Image Loading (320x180px)

**Before API Response (Loading Skeleton):**

```
┌─────────────────────────────────────────┐
│ 10:00 AM                               │
│ [Avatar] User                          │
│ ┌───────────────────────────────────┐  │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │ ← 320x180px skeleton
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │   gradient animate
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │   (gray-200→gray-300→gray-200)
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**After API Response (Image Loaded):**

```
┌─────────────────────────────────────────┐
│ 10:00 AM                               │
│ [Avatar] User                          │
│ ┌───────────────────────────────────┐  │
│ │ [   Image Content 320x180px   ]  │  │ ← Actual image
│ │                                   │  │   object-cover
│ └───────────────────────────────────┘  │   rounded-lg
└─────────────────────────────────────────┘
```

### Multiple Images Grid Loading

**2 Images (grid-cols-2, gap-2):**

```
┌─────────────────────────────────────────┐
│ [Avatar] User                          │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ ░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░ │    │ ← aspect-square
│ │ ░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░ │    │   skeleton
│ └──────────────┘  └──────────────┘    │
│         ↑ 8px gap (gap-2) ↑           │
└─────────────────────────────────────────┘
```

**3-6 Images (grid-cols-3, gap-2):**

```
┌─────────────────────────────────────────┐
│ [Avatar] User                          │
│ ┌────────┐  ┌────────┐  ┌────────┐    │
│ │ ░░░░░░ │  │ ░░░░░░ │  │ ░░░░░░ │    │ ← square
│ └────────┘  └────────┘  └────────┘    │   skeleton
│ ┌────────┐  ┌────────┐  ┌────────┐    │
│ │ ░░░░░░ │  │ ░░░░░░ │  │ ░░░░░░ │    │
│ └────────┘  └────────┘  └────────┘    │
│         ↑ gap-2 (8px) ↑               │
└─────────────────────────────────────────┘
```

### Loading Skeleton Specifications

**Single Image Skeleton:**

```tsx
<div
  className="w-[320px] h-[180px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg"
  data-testid="image-skeleton-loader"
/>
```

**Grid Image Skeleton:**

```tsx
<div
  className="w-full aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg"
  data-testid="image-skeleton-loader"
/>
```

**Key Properties:**

| Property         | Single Image      | Grid Images       | Notes                    |
| ---------------- | ----------------- | ----------------- | ------------------------ |
| Width            | 320px (fixed)     | w-full            | Grid adapts to container |
| Height           | 180px (fixed)     | aspect-square     | 16:9 vs 1:1 ratio        |
| Background       | gradient animate  | gradient animate  | Same animation both      |
| Border Radius    | rounded-lg (16px) | rounded-lg        | Consistent rounding      |
| Loading Duration | Until API returns | Until API returns | No timeout               |

**Animation:**

```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Gradient flow left → right */
background: linear-gradient(
  90deg,
  rgb(229, 231, 235) 0%,
  /* gray-200 */ rgb(209, 213, 219) 50%,
  /* gray-300 */ rgb(229, 231, 235) 100% /* gray-200 */
);
```

### Loading States Flow

```
User sends message with images
         ↓
[Skeleton renders immediately]  ← FIXED SIZE (no layout shift)
         ↓
API call: getImageThumbnail(fileId, "large")
         ↓
[Skeleton continues animating]
         ↓
API response received
         ↓
[Image replaces skeleton smoothly]  ← Same size, no jump
```

**Benefits:**

- ✅ **No layout shift:** Skeleton has same size as final image
- ✅ **Immediate feedback:** User sees loading state instantly
- ✅ **Consistent spacing:** Grid gap-2 (8px) matches bubble padding
- ✅ **Smooth transition:** Skeleton → Image without size change

---

## ⏳ PENDING DECISIONS (HUMAN PHẢI ĐIỀN)

| #   | Decision Point                 | Options                              | HUMAN Choice     |
| --- | ------------------------------ | ------------------------------------ | ---------------- |
| 1   | Timestamp position alignment   | Left / Center / Right (for outgoing) | ⬜ **Left**      |
| 2   | Avatar size on mobile          | 28px / 32px / 36px                   | ⬜ **32px**      |
| 3   | Max messages in group          | Unlimited / 5 / 10                   | ⬜ **Unlimited** |
| 4   | Status line truncate on mobile | Yes / No / Wrap to 2 lines           | ⬜ **Wrap**      |
| 5   | Show "• Muted" in status line? | Yes / No (only show if user asks)    | ⬜ **Yes**       |

---

## 📋 IMPACT SUMMARY

### Components Affected:

✅ **ConversationHeader.tsx** - Add status line display  
✅ **MessageBubble.tsx** - Update props, styling, grouping logic  
✅ **MessageList.tsx** - Apply grouping utility before rendering  
✅ **Avatar.tsx** - Ensure gray bg + black text for conversations

### New Utilities:

✅ **messageGrouping.ts** - Grouping algorithm  
✅ **formatStatusLine.ts** - Status line formatting logic

### CSS Updates:

✅ Message bubble border-radius: 0.5rem → 1rem  
✅ Message bubble padding: 0.75rem/1rem → 0.5rem/1rem  
✅ Conversation header height: 60px → 72px  
✅ Add `white-space: pre-wrap` to message content

---

## ✅ HUMAN CONFIRMATION

| Hạng Mục                                | Status       |
| --------------------------------------- | ------------ |
| Đã review Wireframe Designs             | ✅ Đã review |
| Đã review Component Specifications      | ✅ Đã review |
| Đã điền Pending Decisions               | ✅ Đã điền   |
| **APPROVED để tạo Implementation Plan** | ✅ APPROVED  |

**HUMAN Signature:** [MINH ĐÃ DUYỆT]  
**Date:** 2026-01-09

---

⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tiếp tục BƯỚC 4 (implementation plan) nếu mục "APPROVED để tạo Implementation Plan" = ⬜ CHƯA APPROVED**

---

**Created:** 2026-01-09  
**Next Step:** HUMAN review và approve → Tạo implementation plan (BƯỚC 4)
