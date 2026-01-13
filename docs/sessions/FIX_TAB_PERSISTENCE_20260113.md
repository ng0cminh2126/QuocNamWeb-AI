# Session: Fix Tab Persistence on Reload - January 13, 2026

## 📋 Summary

Fixed tab persistence and conversation restoration when reloading page with Direct Message selected.

**Issue:** When user selected a Direct Message conversation and reloaded the page:

- Conversation was restored from localStorage ✅
- Tab showed "Nhóm" instead of "Cá nhân" ❌
- Conversation was not highlighted/active ❌

**Root Causes:**

1. Tab state not being restored based on conversation type
2. Race condition between Groups and DirectMessages API calls
3. Clear selection effect triggered during auto tab-switch

## 🔧 Changes Made

### 1. ConversationListSidebar.tsx

#### Phase 6 Restore Logic Enhancement

- **Changed:** Wait for BOTH groups AND directs APIs to load before restoring
- **Before:** `if (isGroupsLoading && isDirectsLoading) return;` (wait only if BOTH loading)
- **After:** `if (isGroupsLoading || isDirectsLoading) return;` (wait until BOTH loaded)
- **Reason:** Prevent race condition where one API loads faster than the other

#### Separate Tab Auto-Switch Effect

- **Added:** New useEffect to auto-switch tab based on conversation type
- **Logic:**
  - Only trigger when NEW conversation is selected (not when cleared or same)
  - Check conversation in `apiDirects` → switch to "contacts"
  - Check conversation in `apiGroups` → switch to "groups"
- **Refs:**
  - `prevSelectedConversationIdRef` - Track previous conversation ID
  - `isAutoSwitchingTabRef` - Flag to distinguish auto-switch from manual

#### Clear Selection Enhancement

- **Changed:** Skip clearing selection when tab auto-switches
- **Logic:**
  ```typescript
  if (isAutoSwitchingTabRef.current) {
    // Skip clear - this is auto-switch, not user action
    isAutoSwitchingTabRef.current = false;
    prevTabRef.current = tab;
    return;
  }
  // Clear selection only on manual tab switch
  onClearSelectedChat?.();
  ```

### 2. Flow Diagrams

#### Before Fix:

```
Reload → Restore DM → setTab("contacts") → Clear Selection → selectedChat = null ❌
```

#### After Fix:

```
Reload → Wait for both APIs →
Restore DM → selectedConversationId updates →
Auto-switch tab (with flag) → Skip clear →
Conversation active ✅
```

## 🧪 Testing

### Test Case 1: Reload with Direct Message

1. Select Direct Message conversation
2. Reload page
3. **Expected:** Tab = "Cá nhân", conversation highlighted
4. **Result:** ✅ PASS

### Test Case 2: Reload with Group

1. Select Group conversation
2. Reload page
3. **Expected:** Tab = "Nhóm", conversation highlighted
4. **Result:** ✅ PASS

### Test Case 3: Manual Tab Switch

1. On "Nhóm" tab with conversation selected
2. Click "Cá nhân" tab
3. **Expected:** Selection cleared, tab switches smoothly
4. **Result:** ✅ PASS

### Test Case 4: Tab Switch Smoothness

1. Click between "Nhóm" and "Cá nhân" tabs rapidly
2. **Expected:** No flickering, smooth transition
3. **Result:** ✅ PASS (fixed with prevSelectedConversationIdRef)

## 📊 Debug Logs (Removed in Final)

Debug console.logs were added during development and removed after fix verification:

- ConversationListSidebar.tsx: 11 console.log statements removed
- PortalWireframes.tsx: 2 console.log statements removed

## ✅ Completion Checklist

- [x] Tab persistence works for Direct Messages
- [x] Tab persistence works for Groups
- [x] Manual tab switching doesn't break
- [x] No flickering when switching tabs
- [x] Race condition between APIs resolved
- [x] Clear selection logic preserved for manual switches
- [x] Debug logs removed from production code
- [x] Documentation updated

## 🔗 Related Files

- `src/features/portal/workspace/ConversationListSidebar.tsx`
- `src/features/portal/PortalWireframes.tsx`
- `src/utils/storage.ts` (getSelectedConversation, saveSelectedConversation)

## 📝 Technical Notes

### Key Concepts

1. **Auto-switch vs Manual-switch:**

   - Auto: Triggered by conversation selection (don't clear)
   - Manual: User clicks tab button (clear selection)

2. **Race Condition Prevention:**

   - Wait for both APIs to complete before restoring
   - Prevents partial data causing incorrect behavior

3. **Ref-based Flags:**
   - `isAutoSwitchingTabRef`: Synchronous, immediate
   - Better than state for preventing re-render cycles

### Performance Considerations

- No additional API calls
- Minimal re-renders (refs instead of state where possible)
- Clear separation of concerns (restore → update → auto-switch)

---

**Session Duration:** ~45 minutes  
**Status:** ✅ Complete  
**Next Steps:** Monitor for edge cases in production
