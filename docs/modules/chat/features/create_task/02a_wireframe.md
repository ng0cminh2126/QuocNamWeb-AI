# [BƯỚC 2A] Wireframe - Create Task Feature

## Modal Layout

### Desktop Layout (400px width)
```
┌─────────────────────────────────────┐
│ Create Task                     [×] │  ← Header with close button
├─────────────────────────────────────┤
│                                     │
│  Task Name                          │
│  ┌─────────────────────────────┐   │
│  │ [Auto-filled text...]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Assign To                          │
│  ┌─────────────────────────────┐   │
│  │ [Select members...] ▼       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Checklist Template                 │
│  ┌─────────────────────────────┐   │
│  │ [None] ▼                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Task Priority                      │
│  ┌─────────────────────────────┐   │
│  │ [Select Priority...] ▼      │   │
│  └─────────────────────────────┘   │
│                                     │
│                  [Cancel] [Create]  │
│                                     │
└─────────────────────────────────────┘
```

### Mobile Layout (full-width)
```
Same as above, but full-width (minus padding)
Close button always accessible
```

## Component Specifications

### Task Name Input
- **Element:** `<input type="text" />`
- **Max length:** 255 characters
- **Display counter:** Show below input
- **Clear button:** X button inside input (if filled)
- **Status indicators:**
  - ✅ Valid (green border)
  - ⚠️ Required (red border)

### Assign To Dropdown
- **Element:** `<select>` or custom dropdown component
- **Options display:**
  ```
  [Avatar] John Doe
  [Avatar] Jane Smith
  [Avatar] Bob Wilson
  ```
- **Selected display:** Show avatar + name
- **Search:** Include search field for large groups
- **Max height:** Scroll after 5 items

### Checklist Template Dropdown
- **Element:** `<select>` or custom dropdown
- **Options display:**
  ```
  None (default)
  Daily Standup
  Code Review Checklist
  Deployment Checklist
  ```
- **Search:** Include search field if > 10 templates
- **Description:** Show template item count in subtitle

### Task Priority Dropdown
- **Element:** `<select>` or custom dropdown
- **Options display with icons/colors:**
  ```
  🔴 High
  🟡 Medium
  🟢 Low
  ```
- **Color coding:** Consistent with task system
- **Default:** Medium (highlighted)

## Button States

### Create Button
| State | Style | Cursor |
| ----- | ----- | ------ |
| Enabled | Blue, solid | pointer |
| Disabled (invalid form) | Gray, opacity 0.5 | not-allowed |
| Loading | Blue with spinner | wait |
| Submitted | Success state | pointer |

### Cancel Button
| State | Style | Cursor |
| ----- | ----- | ------ |
| Normal | Ghost/outline | pointer |
| Hover | Light gray bg | pointer |

## Validation States

### Field Error Display
```
Task Name (with error)
┌─────────────────────────────┐
│ [                         ] │
└─────────────────────────────┘
⚠️ Task name is required
```

### Success Toast (after creation)
```
✅ Task created successfully
Close button or auto-dismiss in 3s
```

### Error Toast
```
❌ Failed to create task: [error message]
Retry button available
```

## Responsive Behavior

### Breakpoints
- **Desktop:** 400px fixed width, right sidebar
- **Tablet (< 768px):** 350px width, adjust padding
- **Mobile (< 480px):** Full width - 32px padding, bottom slide-up

### Mobile Full-screen (if needed)
```
┌──────────────────────────────┐
│ Create Task          [×]     │
├──────────────────────────────┤
│ [Form fields...]             │
│                              │
│      [Cancel] [Create]       │
└──────────────────────────────┘
```

## Interaction Details

### Open Modal
- **Trigger:** Click "Create Task" in message hover menu
- **Animation:** Slide in from right (300ms ease-out)
- **Overlay:** Semi-transparent overlay behind modal

### Close Modal
- **Methods:**
  1. Click X button
  2. Click outside (overlay click)
  3. Click Cancel button
  4. ESC key
- **On close:** Discard unsaved changes (confirm if dirty)

### Form Auto-fill
- **Trigger:** When modal opens
- **Auto-fill:** Task name from message
- **Timing:** Instant (no delay)
- **User can edit:** Yes, before submission

### Field Focus Order
1. Task Name (auto-focus)
2. Assign To
3. Checklist Template
4. Task Priority
5. Create button (Tab key navigation)

---

## HUMAN Decisions Needed

| # | Element | Options | Decision |
| - | ------- | ------- | -------- |
| 1 | Modal width | 350, 400, 450px | ⬜ 400 |
| 2 | Mobile behavior | Full-width OR Bottom sheet | ⬜ Full-width |
| 3 | Assign To | Single-select OR Multi-select | ⬜ single select |
| 4 | Auto-fill rule | Message only OR Include author | ⬜ Message Only or the file name |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                 | Status   |
| ------------------------ | -------- |
| Đã review Wireframe      | ⬜ Rồi  |
| Đã điền Pending Decisions | ⬜ Rồi  |
| **APPROVED để thực thi** | ⬜ Rồi  |

**HUMAN Signature:** [Khoa]  
**Date:** [09012026]
