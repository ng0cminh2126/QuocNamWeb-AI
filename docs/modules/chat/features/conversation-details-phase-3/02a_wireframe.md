# [BƯỚC 2A] Phase 3 Wireframe: File Preview Modal

> **Module:** Chat  
> **Feature:** File Preview Modal  
> **Version:** 3.0  
> **Status:** ✅ APPROVED - Ready for implementation  
> **Created:** 2026-01-08  
> **Dependencies:** [01_requirements.md](./01_requirements.md) ✅ APPROVED

---

## 📋 Overview

Wireframe chi tiết cho File Preview Modal, bao gồm:

- Desktop layout (≥1024px)
- Tablet layout (768-1023px)
- Mobile layout (<768px)
- Component specifications (sizes, colors, spacing)
- Interactive states (hover, active, disabled)

**Design Decisions từ Requirements:**

- ✅ Modal close on backdrop click: **Yes**
- ✅ Preload next page: **No**
- ✅ Show thumbnail strip: **Future** (không implement phase 3)
- ✅ DPI setting: **300**

---

## 🖥️ Desktop Layout (≥1024px)

### Modal Dimensions

```
┌────────────────────────────────────────────────────────────────────────┐
│ Viewport: 100vw x 100vh                                                │
│ ┌─────────────────[BACKDROP: bg-black/50]────────────────────────┐    │
│ │                                                                 │    │
│ │  ┌────────────[MODAL: 90vw x 90vh, max-w-7xl]─────────────┐   │    │
│ │  │                                                          │   │    │
│ │  │  [HEADER - Sticky Top]                                  │   │    │
│ │  │  ┌───────────────────────────────────────────────────┐  │   │    │
│ │  │  │ document.pdf                            [X Close] │  │   │    │
│ │  │  └───────────────────────────────────────────────────┘  │   │    │
│ │  │                                                          │   │    │
│ │  │  [CONTENT - Scrollable]                                 │   │    │
│ │  │  ┌───────────────────────────────────────────────────┐  │   │    │
│ │  │  │                                                   │  │   │    │
│ │  │  │                                                   │  │   │    │
│ │  │  │           [PDF Page Image]                        │  │   │    │
│ │  │  │                                                   │  │   │    │
│ │  │  │                                                   │  │   │    │
│ │  │  │                                                   │  │   │    │
│ │  │  │                                                   │  │   │    │
│ │  │  └───────────────────────────────────────────────────┘  │   │    │
│ │  │                                                          │   │    │
│ │  │  [NAVIGATION - Sticky Bottom]                           │   │    │
│ │  │  ┌───────────────────────────────────────────────────┐  │   │    │
│ │  │  │ [◄ Prev]        Page 1 of 5         [Next ►]     │  │   │    │
│ │  │  └───────────────────────────────────────────────────┘  │   │    │
│ │  │                                                          │   │    │
│ │  └──────────────────────────────────────────────────────────┘   │    │
│ │                                                                 │    │
│ └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Component Breakdown

#### 1. Backdrop

```css
Background: bg-black/50 (rgba(0, 0, 0, 0.5))
Size: 100vw x 100vh (full screen)
Z-index: 50
Cursor: pointer (click to close)
Position: fixed
```

#### 2. Modal Container

```css
Size: 90vw x 90vh
Max-width: 1280px (max-w-7xl)
Background: white
Border-radius: 12px (rounded-xl)
Shadow: shadow-2xl
Position: relative
Z-index: 51
Margin: auto (centered)
```

#### 3. Header Section

```
┌──────────────────────────────────────────────────────────────┐
│  [FileText Icon]  document-long-filename.pdf        [X]      │
│  (24x24px)        (truncate, max-width: calc(100% - 80px))   │
│                                                       (24x24) │
└──────────────────────────────────────────────────────────────┘
Height: 60px
Padding: 16px 24px
Background: white
Border-bottom: 1px solid #E5E7EB (gray-200)
Display: flex, items-center, justify-between
Position: sticky, top: 0
Z-index: 10
```

**Components:**

- **File Icon:** `<FileText size={24} className="text-gray-600" />`
- **Filename:** `text-base font-medium text-gray-900 truncate`
- **Close Button:**
  ```tsx
  <button
    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-300 text-gray-800 transition-colors hover:bg-gray-400 hover:text-red-600"
    data-testid="file-preview-modal-close-button"
  >
    <X size={24} className="h-6 w-6" />
  </button>
  ```

#### 4. Content Section

```
┌────────────────────────────────────────────────────────────┐
│                        [Padding: 24px]                     │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │                                                      │ │
│  │            [PDF Page Image Container]               │ │
│  │                                                      │ │
│  │            Max-width: 100%                           │ │
│  │            Height: auto                              │ │
│  │            Object-fit: contain                       │ │
│  │                                                      │ │
│  │            [Watermark visible on image]             │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘

Background: bg-gray-50
Padding: 24px
Overflow-y: auto
Max-height: calc(90vh - 60px - 70px) // viewport - header - footer
Scroll behavior: smooth
```

**Image Styling:**

```css
<img
  src={imageUrl}
  alt={`Page ${currentPage}`}
  className="max-w-full h-auto mx-auto shadow-lg rounded"
  data-testid={`pdf-page-image-${currentPage}`}
/>
```

#### 5. Navigation Section (Footer)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  [◄ Previous]          Page 1 of 5          [Next ►]      │
│  (Button)              (Text Center)         (Button)      │
│  96px width            flex-1               96px width     │
│                                                            │
└────────────────────────────────────────────────────────────┘

Height: 70px
Padding: 16px 24px
Background: white
Border-top: 1px solid #E5E7EB (gray-200)
Display: flex, items-center, justify-between, gap-4
Position: sticky, bottom: 0
Z-index: 10
```

**Button Specifications:**

**Previous Button:**

```tsx
<button
  className="
    px-4 py-2 
    bg-white border border-gray-300 
    hover:bg-gray-50 
    disabled:opacity-50 disabled:cursor-not-allowed
    rounded-lg 
    text-sm font-medium text-gray-700
    flex items-center gap-2
    transition-colors
  "
  disabled={currentPage === 1}
  data-testid="file-preview-prev-button"
>
  <ChevronLeft size={16} />
  Trước
</button>
```

**Page Indicator:**

```tsx
<span
  className="text-sm font-medium text-gray-700"
  data-testid="file-preview-page-indicator"
>
  Page {currentPage} of {totalPages}
</span>
```

**Next Button:**

```tsx
<button
  className="
    px-4 py-2 
    bg-brand-600 
    hover:bg-brand-700 
    disabled:opacity-50 disabled:cursor-not-allowed
    rounded-lg 
    text-sm font-medium text-white
    flex items-center gap-2
    transition-colors
  "
  disabled={currentPage === totalPages}
  data-testid="file-preview-next-button"
>
  Sau
  <ChevronRight size={16} />
</button>
```

---

## 📱 Tablet Layout (768-1023px)

```
┌──────────────────────────────────────────────────────────┐
│ Viewport: 100vw x 100vh                                  │
│ ┌────────────[BACKDROP]───────────────────────────────┐  │
│ │                                                     │  │
│ │  ┌──────[MODAL: 95vw x 95vh]───────────────────┐   │  │
│ │  │                                              │   │  │
│ │  │  [HEADER - 60px]                            │   │  │
│ │  │  document.pdf                        [X]    │   │  │
│ │  │                                              │   │  │
│ │  │  [CONTENT - Scrollable]                     │   │  │
│ │  │  ┌────────────────────────────────────────┐ │   │  │
│ │  │  │                                        │ │   │  │
│ │  │  │        [PDF Page Image]                │ │   │  │
│ │  │  │        (Scaled to fit)                 │ │   │  │
│ │  │  │                                        │ │   │  │
│ │  │  └────────────────────────────────────────┘ │   │  │
│ │  │                                              │   │  │
│ │  │  [NAVIGATION - 70px]                        │   │  │
│ │  │  [◄ Prev]  Page 1 of 5  [Next ►]           │   │  │
│ │  │                                              │   │  │
│ │  └──────────────────────────────────────────────┘   │  │
│ │                                                     │  │
│ └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Changes from Desktop:**

- Modal size: 90vw → **95vw** (minimal margins)
- Content padding: 24px → **16px** (tighter spacing)
- Button text: "Previous" → **"Prev"** (shorter labels)
- Navigation gap: 16px → **12px**

---

## 📱 Mobile Layout (<768px)

```
┌───────────────────────────────────────┐
│ [MODAL: 100vw x 100vh - Full Screen] │
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ [HEADER - 50px]                   │ │
│ │ document.pdf              [X]     │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ [CONTENT]                         │ │
│ │                                   │ │
│ │  ┌───────────────────────────┐   │ │
│ │  │                           │   │ │
│ │  │   [PDF Page Image]        │   │ │
│ │  │   (Full width)            │   │ │
│ │  │                           │   │ │
│ │  │                           │   │ │
│ │  │                           │   │ │
│ │  │                           │   │ │
│ │  └───────────────────────────┘   │ │
│ │                                   │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ [NAVIGATION - 60px]               │ │
│ │ [◄]  Page 1 of 5  [►]             │ │
│ │ 44px   (center)   44px            │ │
│ └───────────────────────────────────┘ │
│                                       │
└───────────────────────────────────────┘
```

**Mobile-Specific Changes:**

1. **Full Screen:**

   ```css
   Modal: 100vw x 100vh (no margins, no backdrop visible)
   Border-radius: 0 (no rounded corners)
   ```

2. **Compact Header:**

   ```css
   Height: 50px (reduced from 60px)
   Padding: 12px 16px
   Font-size: 14px (text-sm)
   Icon size: 20px (reduced from 24px)
   ```

3. **Touch-Optimized Content:**

   ```css
   Padding: 12px (reduced from 24px)
   Image: Full width with minimal padding
   ```

4. **Large Touch Targets:**

   ```tsx
   // Navigation buttons
   <button className="
     w-11 h-11  // 44x44px minimum touch target
     flex items-center justify-center
     bg-brand-600 rounded-lg
     active:bg-brand-700  // Active state for mobile
   ">
     <ChevronLeft size={20} />
   </button>

   // Close button
   <button className="
     w-11 h-11
     flex items-center justify-center
     hover:bg-gray-100 rounded-lg
   ">
     <X size={20} />
   </button>
   ```

5. **Navigation Layout:**
   ```
   ┌─────────────────────────────────────┐
   │  [44x44]     Page 1 of 5    [44x44] │
   │    ◄            text            ►    │
   └─────────────────────────────────────┘
   Height: 60px (compact)
   Padding: 8px 16px
   ```

---

## 🎨 States & Interactions

### Loading State

```
┌──────────────────────────────────────┐
│ document.pdf                    [X]  │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐ │
│  │  [Loading Skeleton]            │ │
│  │                                │ │
│  │  ╔════════════════════════╗    │ │
│  │  ║                        ║    │ │
│  │  ║  ░░░░░░░░░░░░░░░░░░░  ║    │ │
│  │  ║  ░░░░░░░░░░░░░░░░░░░  ║    │ │
│  │  ║  ░░░░░░░░░░░░░░░░░░░  ║    │ │
│  │  ║                        ║    │ │
│  │  ╚════════════════════════╝    │ │
│  │                                │ │
│  │  Loading page 1 of 5...        │ │
│  └────────────────────────────────┘ │
│                                      │
├──────────────────────────────────────┤
│  [◄ Prev]   Page 1 of 5   [Next ►]  │
│  (disabled)               (disabled) │
└──────────────────────────────────────┘
```

**Skeleton Implementation:**

```tsx
<div className="animate-pulse space-y-4 p-24">
  <div className="bg-gray-200 h-[600px] rounded-lg"></div>
  <p className="text-center text-sm text-gray-500">
    Loading page {currentPage} of {totalPages || "..."}
  </p>
</div>
```

### Error State

```
┌──────────────────────────────────────┐
│ Xem trước tệp                   [X]  │
├──────────────────────────────────────┤
│                                      │
│           ⚠️                         │
│                                      │
│  Không tìm thấy tệp hoặc đã bị xóa   │
│                                      │
│    Tệp bạn đang xem trước            │
│    không còn tồn tại.                │
│                                      │
│       [Thử lại] [Đóng]               │
│                                      │
└──────────────────────────────────────┘
```

**Error Component:**

```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <AlertCircle size={48} className="text-red-500 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Không tìm thấy tệp hoặc đã bị xóa
  </h3>
  <p className="text-sm text-gray-600 text-center mb-6">
    Tệp bạn đang xem trước không còn tồn tại.
  </p>
  <div className="flex gap-3">
    <button
      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      onClick={onRetry}
    >
      Thử lại
    </button>
    <button
      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
      onClick={onClose}
    >
      Đóng

### Empty State (Single Page)

```

┌──────────────────────────────────────┐
│ image.jpg [X] │
├──────────────────────────────────────┤
│ │
│ ┌────────────────────────────────┐ │
│ │ │ │
│ │ [Image Preview] │ │
│ │ │ │
│ └────────────────────────────────┘ │
│ │
└──────────────────────────────────────┘
NO NAVIGATION FOOTER (single page/image)

````

### Button States

**Previous Button:**

```css
/* Default */
bg-white border border-gray-300 text-gray-700

/* Hover */
hover:bg-gray-50

/* Active (pressed) */
active:bg-gray-100

/* Disabled (page 1) */
disabled:opacity-50 disabled:cursor-not-allowed
````

**Next Button:**

```css
/* Default */
bg-brand-600 text-white

/* Hover */
hover:bg-brand-700

/* Active (pressed) */
active:bg-brand-800

/* Disabled (last page) */
disabled:opacity-50 disabled:cursor-not-allowed
```

**Close Button:**

```css
/* Default */
bg-gray-300 text-gray-800 h-10 w-10 rounded-lg

/* Hover */
hover:bg-gray-400 hover:text-red-600

/* Active */
active:bg-gray-500
```

---

## 🎨 Color Palette

```css
/* Brand Colors */
--brand-600: #16A34A   /* Green for primary actions */
--brand-700: #15803D   /* Darker green on hover */
--brand-800: #166534   /* Darkest green on active */

/* Gray Scale */
--gray-50:  #F9FAFB    /* Background */
--gray-100: #F3F4F6    /* Hover states */
--gray-200: #E5E7EB    /* Borders */
--gray-300: #D1D5DB    /* Disabled borders */
--gray-500: #6B7280    /* Icons */
--gray-600: #4B5563    /* Secondary text */
--gray-700: #374151    /* Button text */
--gray-900: #111827    /* Primary text */

/* Semantic Colors */
--red-500: #EF4444     /* Error icon */
--red-600: #DC2626     /* Close button hover */
--white: #FFFFFF       /* Backgrounds */
--black-50: rgba(0,0,0,0.5) /* Backdrop */
```

---

## 📏 Spacing & Sizing

```css
/* Modal */
Desktop:  90vw x 90vh, max-w-7xl (1280px)
Tablet:   95vw x 95vh
Mobile:   100vw x 100vh

/* Header */
Desktop/Tablet: 60px height, 16px 24px padding
Mobile:         50px height, 12px 16px padding

/* Content */
Desktop:  24px padding
Tablet:   16px padding
Mobile:   12px padding

/* Navigation */
Desktop/Tablet: 70px height, 16px 24px padding
Mobile:         60px height, 8px 16px padding

/* Buttons */
Desktop/Tablet:
  - Previous/Next: px-4 py-2 (height ~40px)
  - Close: p-2 (32x32px)

Mobile:
  - Previous/Next: w-11 h-11 (44x44px touch target)
  - Close: w-11 h-11 (44x44px)

/* Gaps */
Desktop:  gap-4 (16px)
Tablet:   gap-3 (12px)
Mobile:   gap-2 (8px)
```

---

## ♿ Accessibility

### Keyboard Navigation

```
ESC         → Close modal
Arrow Left  → Previous page
Arrow Right → Next page
Arrow Up    → Previous page (alternative)
Arrow Down  → Next page (alternative)
Tab         → Navigate between Close / Prev / Next buttons
Enter/Space → Activate focused button
```

### ARIA Attributes

```tsx
// Modal container
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  // Header
  <h2 id="modal-title" className="sr-only">
    File Preview: {fileName}
  </h2>
  // Content
  <div id="modal-description" className="sr-only">
    Viewing page {currentPage} of {totalPages}
  </div>
  // Navigation
  <nav aria-label="File preview navigation">
    <button
      aria-label={`Previous page, currently on page ${currentPage}`}
      aria-disabled={currentPage === 1}
    >
      Previous
    </button>

    <span aria-live="polite">
      Page {currentPage} of {totalPages}
    </span>

    <button
      aria-label={`Next page, currently on page ${currentPage}`}
      aria-disabled={currentPage === totalPages}
    >
      Next
    </button>
  </nav>
</div>
```

### Focus Management

```typescript
// When modal opens
useEffect(() => {
  if (isOpen) {
    // Save previous focus
    previousFocusRef.current = document.activeElement;

    // Focus modal content
    modalRef.current?.focus();

    // Trap focus inside modal
    document.addEventListener("keydown", handleTabKey);
  }

  return () => {
    // Restore previous focus
    previousFocusRef.current?.focus();
    document.removeEventListener("keydown", handleTabKey);
  };
}, [isOpen]);
```

---

## 🎬 Animations

### Modal Entry/Exit

```css
/* Entry animation */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-enter {
  animation: modalFadeIn 200ms ease-out;
}

/* Exit animation */
@keyframes modalFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.modal-exit {
  animation: modalFadeOut 150ms ease-in;
}
```

### Page Transition

```css
/* Page change animation */
@keyframes pageFade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.page-transition {
  animation: pageFade 300ms ease-in-out;
}
```

### Loading Skeleton

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f3f4f6 0px, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 🧩 Component Hierarchy

```
FilePreviewModal
├── Backdrop (onClick close)
│
└── ModalContainer
    ├── ModalHeader
    │   ├── FileIcon (FileText/Image/etc)
    │   ├── FileName (truncate)
    │   └── CloseButton (X icon)
    │
    ├── ModalContent (scrollable)
    │   ├── LoadingState (skeleton)
    │   ├── ErrorState (error message + retry)
    │   └── PreviewContent
    │       └── PageImage (img tag)
    │
    └── ModalNavigation (sticky bottom, conditional)
        ├── PrevButton (ChevronLeft)
        ├── PageIndicator ("Page X of Y")
        └── NextButton (ChevronRight)
```

---

## ⏳ HUMAN DECISIONS APPLIED

| Decision                      | Value     | Implementation                     |
| ----------------------------- | --------- | ---------------------------------- |
| Modal close on backdrop click | ✅ Yes    | Backdrop div has onClick={onClose} |
| Preload next page             | ❌ No     | Only load current page on demand   |
| Show thumbnail strip          | 🔮 Future | Not included in wireframe          |
| DPI setting                   | 300       | Fixed value in API calls           |
| Cache strategy                | Session   | In-memory cache, cleared on logout |

---

## 📋 HUMAN CONFIRMATION

| Hạng Mục                         | Status           |
| -------------------------------- | ---------------- |
| Đã review wireframe layouts      | ⬜ Chưa review   |
| Đã review component specs        | ⬜ Chưa review   |
| Đã review responsive designs     | ⬜ Chưa review   |
| **APPROVED để tạo flow diagram** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \***\*\_\_\*\***  
**Date:** \***\*\_\_\*\***

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo flow diagram nếu chưa APPROVED**

---

**Created:** 2026-01-08  
**Next Step:** Await HUMAN approval → Create flow diagram (BƯỚC 2B)
