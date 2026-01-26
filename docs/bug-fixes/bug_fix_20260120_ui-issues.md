# Bug Fix Document - UI Issues (Staff & Leader Views)

**Date:** 2026-01-20  
**Type:** Bug Fix  
**Priority:** Medium  
**Modules Affected:** Chat, Task  
**Status:** ✅ RESOLVED

---

## 📋 Issues Summary

### Issue 1: Duplicate Items in LinkedTaskPanel (Staff UI)
**Current Behavior:** LinkedTaskPanel in Staff UI displays duplicate task items.

**Root Cause:** [To be investigated]

**Expected Behavior:** Each task should appear only once in the panel.

**Affected Component:** 
- `src/features/portal/components/task-log/LinkedTaskPanel.tsx` (Staff view)

---

### Issue 2: ChatBubble Action Menu Position
**Current Behavior:** Hover action menu appears at the start (left side) of the message.

**Expected Behavior:** Action menu should appear at the end (right side) of the message for better UX.

**Affected Components:**
- `src/features/portal/components/chat/MessageBubbleSimple.tsx`
- Or any other ChatBubble components with action menus

**Design Rationale:** Right-aligned actions are more intuitive and align with common messaging app patterns (WhatsApp, Telegram, Slack).

---

### Issue 3: LinkedTask Filter for Leader View
**Current Behavior:** 
- Shows a "total" count
- Filter appears to be limited to "daily tasks"

**Expected Behavior:**
- Remove the total count display
- Filter should show ALL tasks (not just daily)
- Filter is meant for viewing all tasks, not just daily ones

**Affected Component:**
- `src/features/portal/components/task-log/LinkedTaskPanel.tsx` (Leader view)
- Or leader-specific task components

---

## 🔍 INVESTIGATION NEEDED

Before creating the implementation plan, I need to:

1. **Issue 1 - Duplicates:**
   - Locate LinkedTaskPanel component for Staff UI
   - Identify the data source causing duplicates
   - Check if it's a data fetching issue or rendering issue
   - Review key props in list rendering

2. **Issue 2 - Action Menu:**
   - Find all ChatBubble components with action menus
   - Review current positioning logic (CSS/Tailwind)
   - Determine if this affects both Staff and Leader views

3. **Issue 3 - Leader Filter:**
   - Locate LinkedTaskPanel for Leader view
   - Find where "total" is displayed
   - Review filter logic to understand current limitation
   - Check API/query parameters for task fetching

---

## 🎯 IMPACT SUMMARY (Will be updated after investigation)

### Files to investigate:
- [ ] `src/features/portal/components/task-log/LinkedTaskPanel.tsx`
- [ ] `src/features/portal/components/chat/MessageBubbleSimple.tsx`
- [ ] `src/features/portal/components/chat/MessageBubble.tsx` (legacy)
- [ ] Related query hooks in `src/hooks/queries/`
- [ ] Related API clients in `src/api/`

### Expected Changes (Preliminary):
- **LinkedTaskPanel** - Fix duplicate rendering logic
- **ChatBubble components** - Adjust action menu positioning (CSS/Tailwind)
- **Leader LinkedTask** - Remove total display, update filter logic

### Dependencies:
- No new dependencies expected

---

## ⏳ PENDING DECISIONS

| #   | Decision Item                               | Options                                    | HUMAN Decision     |
| --- | ------------------------------------------- | ------------------------------------------ | ------------------ |
| 1   | Action menu position for all message types? | Right for all, or only for certain types?  | ⬜ for all |
| 2   | Leader task filter default behavior?        | Load all immediately, or paginated?        | ⬜ load all imidiately |
| 3   | Staff LinkedTask also need filter update?   | Yes / No / Separate issue?                 | ⬜ No   |
| 4   | Should I create separate fix branches?      | One branch for all, or separate per issue? | ⬜ No   |

---

## 📝 NEXT STEPS

After HUMAN confirms decisions above, I will:

1. ✅ Investigate and locate affected files
2. ✅ Create detailed implementation plan with code changes
3. ✅ Get HUMAN approval for implementation plan
4. ✅ Execute fixes with tests
5. ✅ Document changes in changelog

---

## ✅ HUMAN CONFIRMATION

| Item                                  | Status         |
| ------------------------------------- | -------------- |
| Reviewed issue descriptions           | ⬜  reviewed |
| Filled Pending Decisions              | ⬜  filled   |
| **APPROVED to proceed with investigation** | ⬜  APPROVED |

**HUMAN Signature:** [Khoa]  
**Date:** [20012026]

---

## 📎 Related Documents

- Implementation Plan: [Will be created after approval]
- Testing Plan: [Will be created after approval]
- Changelog: `docs/checkpoints/_changelog.md`

---

> ⚠️ **CRITICAL:** AI will NOT proceed with code changes until:
> 1. Pending Decisions are filled
> 2. HUMAN Confirmation = ✅ APPROVED
