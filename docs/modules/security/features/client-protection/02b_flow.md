# [BƯỚC 2B] Flow - Client-Side Protection Logic

> **Feature:** Client-Side Security Protection  
> **Module:** Security  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Overview

Document này mô tả logic flow cho từng protection feature:

1. DevTools Protection Flow
2. Context Menu Protection Flow
3. Content Protection Flow
4. Configuration Loading Flow

---

## 1. DevTools Protection Flow

### 1.1 Initialization Flow

```
App Startup
    ↓
Load ENV config
    ↓
Check VITE_ENABLE_DEVTOOLS_PROTECTION
    ↓
    ├─ false → Skip initialization
    │
    └─ true → Initialize DevTools Protection
            ↓
        Check user whitelist
            ↓
            ├─ User in whitelist → Skip protection
            │
            └─ Not whitelisted → Apply protection
                    ↓
                Register keyboard event listeners
                    ├─ F12
                    ├─ Ctrl+Shift+I
                    ├─ Ctrl+Shift+J
                    ├─ Ctrl+Shift+C
                    └─ Ctrl+U
                    ↓
                Start DevTools detection loop
                    ↓
                Setup cleanup on unmount
```

### 1.2 Keyboard Event Handling Flow

```
User presses key
    ↓
Event listener captures keydown
    ↓
Check if key combo matches blocked list
    ↓
    ├─ Not blocked → Allow default behavior
    │
    └─ Blocked combo detected
            ↓
        event.preventDefault()
            ↓
        event.stopPropagation()
            ↓
        [OPTIONAL] Log attempt to analytics
            ↓
        [OPTIONAL] Show warning message
```

### 1.3 DevTools Detection Flow

```
Detection interval (every 1 second)
    ↓
Run detection checks
    ├─ Check window.outerHeight - window.innerHeight
    ├─ Check debugger trap
    └─ Check console.log timing
    ↓
DevTools detected?
    ↓
    ├─ No → Continue monitoring
    │
    └─ Yes → DevTools is open
            ↓
        Execute action based on config
            ├─ (1) Show warning toast
            ├─ (2) Show blocking modal
            └─ (3) Redirect to /blocked page
            ↓
        [OPTIONAL] Log event to server
```

---

## 2. Context Menu Protection Flow

### 2.1 Initialization Flow

```
App Startup
    ↓
Load ENV config
    ↓
Check VITE_ENABLE_CONTEXT_MENU_PROTECTION
    ↓
    ├─ false → Skip initialization
    │
    └─ true → Initialize Context Menu Protection
            ↓
        Check user whitelist
            ↓
            ├─ User in whitelist → Skip protection
            │
            └─ Not whitelisted → Apply protection
                    ↓
                Register contextmenu event listener
                    ↓
                Setup cleanup on unmount
```

### 2.2 Context Menu Event Flow

```
User right-clicks
    ↓
contextmenu event fired
    ↓
Check target element
    ↓
    ├─ Input/Textarea/Editable → Allow default (for usability)
    │
    └─ Other elements → Block context menu
            ↓
        event.preventDefault()
            ↓
        [OPTIONAL] Show custom menu with allowed actions
            ├─ Copy (if not protected content)
            ├─ Paste (for inputs)
            └─ Other safe actions
```

---

## 3. Content Protection Flow

### 3.1 Initialization Flow

```
Component mount (FilePreview, DocumentViewer, etc.)
    ↓
Load ENV config
    ↓
Check VITE_ENABLE_CONTENT_PROTECTION
    ↓
    ├─ false → Skip protection
    │
    └─ true → Initialize Content Protection
            ↓
        Check file type against VITE_CONTENT_PROTECTION_FILE_TYPES
            ↓
            ├─ File type not in protected list → Skip
            │
            └─ File type is protected
                    ↓
                Apply CSS user-select: none
                    ↓
                Register event listeners
                    ├─ selectstart
                    ├─ copy
                    ├─ contextmenu
                    └─ dragstart
                    ↓
                Setup cleanup on unmount
```

### 3.2 Copy Prevention Flow

```
User attempts to copy (Ctrl+C or right-click > Copy)
    ↓
copy event fired
    ↓
Check if content is protected
    ↓
    ├─ Not protected → Allow copy
    │
    └─ Protected content
            ↓
        event.preventDefault()
            ↓
        event.stopPropagation()
            ↓
        [OPTIONAL] Show toast "Copying is disabled"
            ↓
        [OPTIONAL] Log attempt
```

### 3.3 Selection Prevention Flow

```
User attempts to select text (mouse drag or Ctrl+A)
    ↓
selectstart event fired
    ↓
Check if content is protected
    ↓
    ├─ Not protected → Allow selection
    │
    └─ Protected content
            ↓
        event.preventDefault()
            ↓
        Return false
            ↓
        [OPTIONAL] Change cursor to "not-allowed"
```

---

## 4. Configuration Loading Flow

### 4.1 App Initialization

```
App.tsx mount
    ↓
Load environment variables
    ↓
Parse security config
    ├─ VITE_ENABLE_DEVTOOLS_PROTECTION
    ├─ VITE_ENABLE_CONTEXT_MENU_PROTECTION
    ├─ VITE_ENABLE_CONTENT_PROTECTION
    ├─ VITE_CONTENT_PROTECTION_FILE_TYPES
    └─ VITE_SECURITY_WHITELIST_EMAILS
    ↓
Initialize security context
    ↓
Provide config to app via context/hook
```

### 4.2 Runtime Toggle Flow (Optional - Admin Feature)

```
Admin clicks "Disable Protection" button
    ↓
Update security store/context
    ↓
Trigger re-render
    ↓
Protection hooks read updated config
    ↓
    ├─ Disabled → Remove event listeners
    │             ↓
    │           Clear detection intervals
    │
    └─ Enabled → Re-initialize protections
```

---

## 5. Whitelist Check Flow

### 5.1 User Whitelist Verification

```
Protection initialization
    ↓
Get current user email from authStore
    ↓
Load VITE_SECURITY_WHITELIST_EMAILS
    ↓
Parse email list (comma-separated)
    ↓
Check if current user email in whitelist
    ↓
    ├─ In whitelist → Bypass all protections
    │                 ↓
    │               [OPTIONAL] Show "Dev mode" indicator
    │
    └─ Not in whitelist → Apply protections
```

---

## 6. Error Handling Flow

### 6.1 Protection Initialization Error

```
Try to initialize protection
    ↓
Error occurs (e.g., browser not supported)
    ↓
Catch error
    ↓
Log error to console (only in dev mode)
    ↓
Gracefully degrade → Allow app to continue without protection
    ↓
[OPTIONAL] Show warning to admin "Some protections failed"
```

### 6.2 Detection Loop Error

```
DevTools detection interval
    ↓
Detection method throws error
    ↓
Catch error
    ↓
Log error
    ↓
Continue interval (don't break app)
    ↓
[OPTIONAL] Fallback to simpler detection method
```

---

## 7. Cleanup Flow

### 7.1 Component Unmount

```
Component unmounting
    ↓
useEffect cleanup runs
    ↓
Remove all event listeners
    ├─ keydown
    ├─ contextmenu
    ├─ copy
    ├─ selectstart
    └─ dragstart
    ↓
Clear detection intervals
    ↓
Cleanup complete
```

---

## 📋 IMPACT SUMMARY

### Logic Flow Coverage:

- ✅ DevTools Protection: 3 flows (init, keyboard, detection)
- ✅ Context Menu Protection: 2 flows (init, event)
- ✅ Content Protection: 3 flows (init, copy, selection)
- ✅ Configuration: 2 flows (app init, runtime toggle)
- ✅ Whitelist: 1 flow (verification)
- ✅ Error Handling: 2 flows (init error, detection error)
- ✅ Cleanup: 1 flow (unmount)

### Integration Points:

- App.tsx - useSecurity hook initialization
- FilePreview component - useContentProtection hook
- Auth store - User email for whitelist check
- Environment variables - Feature flags

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                              | Lựa chọn                                              | HUMAN Decision       |
| --- | ----------------------------------- | ----------------------------------------------------- | -------------------- |
| 1   | DevTools detection interval         | (1) 1 second, (2) 2 seconds, (3) 5 seconds?           | ✅ **1 - 1 second**  |
| 2   | Detection action when DevTools open | (1) Toast, (2) Blocking modal, (3) Redirect?          | ✅ **1 - Toast**     |
| 3   | Custom context menu implementation  | (1) Không cần, (2) Show limited menu?                 | ✅ **1 - Không cần** |
| 4   | Warning message cho copy attempt    | (1) Có toast, (2) Không có warning, (3) Configurable? | ✅ **1 - Có toast**  |
| 5   | Logging attempts to server          | (1) Yes (analytics), (2) No, (3) Optional via flag?   | ✅ **2 - No**        |

> ✅ **All decisions filled - Ready to proceed**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                                  | Status       |
| ----------------------------------------- | ------------ |
| Đã review DevTools Protection flows       | ✅ Đã review |
| Đã review Context Menu Protection flows   | ✅ Đã review |
| Đã review Content Protection flows        | ✅ Đã review |
| Đã review Configuration & Whitelist flows | ✅ Đã review |
| Đã review Error Handling flows            | ✅ Đã review |
| Đã điền Pending Decisions                 | ✅ Đã điền   |
| **APPROVED để sang BƯỚC 4**               | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-13

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tiếp tục BƯỚC 4 nếu "APPROVED để sang BƯỚC 4" = ⬜ CHƯA APPROVED**

---

## 📌 Technical Notes

### Performance Considerations:

1. **DevTools Detection:**

   - Interval checks có thể ảnh hưởng performance
   - Consider sử dụng requestIdleCallback() thay vì setInterval()
   - Pause detection khi tab inactive

2. **Event Listeners:**

   - Sử dụng event delegation khi có thể
   - Passive listeners cho scroll events
   - Proper cleanup to prevent memory leaks

3. **CSS vs JavaScript:**
   - `user-select: none` (CSS) + event prevention (JS) cho protection tốt nhất
   - CSS alone có thể bị override bằng DevTools

### Browser Compatibility:

- Some detection methods không hoạt động trên Firefox
- Safari có behavior khác cho keyboard shortcuts
- Edge/Chrome tương tự nhau (Chromium-based)

### Accessibility:

- KHÔNG block keyboard navigation (Tab, Arrow keys)
- KHÔNG block screen reader interactions
- Allow copy trong form inputs/textareas

---

## 🔗 Related Documents

- [Requirements](./01_requirements.md) - ✅ Previous step
- [Implementation Plan](./04_implementation-plan.md) - ⏳ Next step after approval
- [Testing Requirements](./06_testing.md) - ⏳ After implementation plan
