# [BƯỚC 1] Requirements - Create Task Feature

## Functional Requirements

### FR-1: Message Hover Menu Button
- **Display condition:** When user hovers over a message
- **Button label:** "Create Task" or icon
- **Button position:** In the existing message hover menu
- **Action:** Opens right-side modal form

### FR-2: Task Creation Form (Modal)
**Location:** Right-side modal (slide-in style)  
**State:** Independent from main chat, user can still see messages

#### Form Fields:

**1. Task Name Input**
- **Type:** Text input (max 255 chars)
- **Auto-fill logic:**
  - If message has text content → use message content as task name
  - If message has ONLY attachments → use first attachment filename
  - If message is empty → empty input (user must fill)
- **Validation:** Required, min 1 char, max 255 chars
- **Placeholder:** "Enter task name"

**2. Assign To Dropdown**
- **Type:** Multi-select or single-select dropdown
- **Data source:** Conversation/Group members from API
- **Display:** Avatar + Name
- **Default:** Current user (pre-selected)
- **Required:** Yes
- **API:** `GET /api/conversations/{conversationId}`

**3. Checklist Template Dropdown**
- **Type:** Single-select dropdown
- **Data source:** API endpoint
- **Display:** Template name
- **Default:** "None" / Empty
- **Required:** No
- **API:** `GET /api/checklist-templates`

**4. Task Priority Dropdown**
- **Type:** Single-select dropdown
- **Data source:** API endpoint
- **Display:** Priority name with color/icon
- **Default:** "Medium" or system default
- **Required:** Yes
- **API:** `GET /api/task-config/priorities`

### FR-3: Task Creation
- **Status auto-set:** "Todo"
- **Created by:** Current user
- **Linked to:** Current conversation
- **Success:** Show toast notification, close modal
- **Error:** Show error message, keep modal open for retry

### FR-4: Modal Controls
- **Close button (X):** Top-right corner
- **Create button:** "Create Task" (primary button)
- **Cancel button:** Cancel or close modal
- **Validation feedback:** Real-time error messages

## Non-Functional Requirements

| Requirement | Details |
| ----------- | ------- |
| **Performance** | Form load < 500ms, API calls debounced |
| **Accessibility** | ARIA labels, keyboard navigation |
| **Responsive** | Mobile: full-width, Desktop: 400px width |
| **Real-time** | After creation, update linked tasks list |

## Business Rules

1. ✅ Only authenticated users can create tasks
2. ✅ Task automatically linked to current conversation
3. ✅ User can only assign to members in same group
4. ✅ Task priority must be valid from config
5. ✅ Checklist template is optional

---

## ⏳ PENDING DECISIONS (Waiting HUMAN Input)

| # | Decision Point | Options | HUMAN Input |
| - | -------------- | ------- | ----------- |
| 1 | Assign To field | Single-select OR Multi-select? | ⬜ Single Select|
| 2 | Default Priority | "Low", "Medium", or "High"? | ⬜ Medium |
| 3 | Link Type | "Related", "Subtask", or "Duplicate"? | ⬜ Currently no link |
| 4 | Modal Width | 350px, 400px, or 450px? | ⬜ 400px |
| 5 | Auto-fill behavior | Include message author info in task? | ⬜ No, just the content or file name |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Requirements    | ⬜ Rồi      |
| Đã điền Pending Decisions | ⬜ Rồi      |
| **APPROVED để tiếp tục**  | ⬜ Rồi      |

**HUMAN Signature:** [Khoa]  
**Date:** [09012026]

> ⚠️ **NOTE:** Do not proceed to Wireframe until this section is approved and all pending decisions are filled.
