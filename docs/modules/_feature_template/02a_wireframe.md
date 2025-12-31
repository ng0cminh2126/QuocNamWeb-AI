# [Feature Name] - Wireframe

> **[BƯỚC 2A]** UI/UX Design  
> **Feature:** [Feature Name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📱 Responsive Breakpoints

| Breakpoint | Width      | Layout         |
| ---------- | ---------- | -------------- |
| Mobile     | < 768px    | Single column  |
| Tablet     | 768-1023px | Adapted layout |
| Desktop    | ≥ 1024px   | Full layout    |

---

## 🖥️ Desktop View (≥1024px)

### Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Window                          │
│                    (1920 x 1080 - Full HD)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     [HEADER/LOGO]                           │
│                                                             │
│                 ┌───────────────────────┐                   │
│                 │                       │                   │
│                 │   [MAIN COMPONENT]    │                   │
│                 │                       │                   │
│                 │   [CONTENT AREA]      │                   │
│                 │                       │                   │
│                 └───────────────────────┘                   │
│                                                             │
│                     [FOOTER/ACTIONS]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

**Main Container:**

- Width: 100% max 1200px
- Padding: 32px
- Background: white (#FFFFFF)
- Border radius: 8px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)

**Buttons:**

- Primary: bg-blue-600, text-white, px-4 py-2, rounded-md
- Secondary: bg-gray-200, text-gray-700, px-4 py-2, rounded-md
- Height: 40px

**Input Fields:**

- Height: 40px
- Border: 1px solid #E5E7EB
- Border radius: 6px
- Padding: 8px 12px
- Focus: border-blue-500, ring-2 ring-blue-200

---

## 📱 Tablet View (768-1023px)

### Layout Overview

```
┌─────────────────────────────┐
│      Tablet (768px)         │
├─────────────────────────────┤
│                             │
│     [HEADER/LOGO]           │
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │  [MAIN COMPONENT]   │   │
│   │                     │   │
│   │  [CONTENT AREA]     │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│   [FOOTER/ACTIONS]          │
│                             │
└─────────────────────────────┘
```

### Adjustments from Desktop

- Container width: 100% with 24px padding
- Font sizes: Slightly reduced
- Spacing: Reduced margins/paddings
- Buttons: Full width on smaller containers

---

## 📱 Mobile View (<768px)

### Layout Overview

```
┌───────────────┐
│  Mobile (375px)│
├───────────────┤
│               │
│ [HEADER/LOGO] │
│               │
│ ┌───────────┐ │
│ │           │ │
│ │  [MAIN    │ │
│ │   COMP]   │ │
│ │           │ │
│ │ [CONTENT] │ │
│ │           │ │
│ └───────────┘ │
│               │
│ [ACTIONS]     │
│               │
└───────────────┘
```

### Mobile-Specific Adjustments

- Container padding: 16px
- Stacked layout (single column)
- Buttons: Full width
- Font sizes: Base (16px)
- Touch targets: Minimum 44px height
- Bottom sheet for modals

---

## 🎨 Design Tokens

### Colors

| Usage      | Value   | Variable  |
| ---------- | ------- | --------- |
| Primary    | #3B82F6 | blue-600  |
| Secondary  | #6B7280 | gray-500  |
| Success    | #10B981 | green-500 |
| Warning    | #F59E0B | amber-500 |
| Error      | #EF4444 | red-500   |
| Background | #FFFFFF | white     |
| Surface    | #F9FAFB | gray-50   |
| Border     | #E5E7EB | gray-200  |

### Typography

| Element   | Size | Weight | Line Height |
| --------- | ---- | ------ | ----------- |
| Heading 1 | 32px | 700    | 40px        |
| Heading 2 | 24px | 600    | 32px        |
| Heading 3 | 20px | 600    | 28px        |
| Body      | 16px | 400    | 24px        |
| Caption   | 14px | 400    | 20px        |
| Small     | 12px | 400    | 16px        |

### Spacing

| Size | Value |
| ---- | ----- |
| xs   | 4px   |
| sm   | 8px   |
| md   | 16px  |
| lg   | 24px  |
| xl   | 32px  |
| 2xl  | 48px  |

---

## 🎭 Component States

### Interactive States

**Button States:**

- Default: [colors as defined]
- Hover: Slightly darker
- Active: Even darker
- Disabled: Opacity 50%, cursor not-allowed
- Loading: Show spinner, disable interaction

**Input States:**

- Default: Border gray-200
- Focus: Border blue-500, ring-2 ring-blue-200
- Error: Border red-500, ring-2 ring-red-200
- Disabled: Background gray-100, cursor not-allowed

---

## ♿ Accessibility

### ARIA Labels

- All interactive elements have proper labels
- Form inputs have associated labels
- Buttons have descriptive text or aria-label

### Keyboard Navigation

- Tab order follows logical flow
- Focus indicators visible
- Escape closes modals/dropdowns
- Enter submits forms

### Screen Reader Support

- Semantic HTML (h1, nav, main, etc.)
- Alt text for images
- Status messages announced

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | UI Element  | Quyết định cần      | HUMAN Decision |
| --- | ----------- | ------------------- | -------------- |
| 1   | Logo        | Path to logo file   | ⬜ **\_\_\_**  |
| 2   | Brand color | Use blue or custom? | ⬜ **\_\_\_**  |
| 3   | Page title  | Vietnamese text     | ⬜ **\_\_\_**  |
| 4   | Button text | Specific wording    | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC code UI nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                  | Status         |
| ------------------------- | -------------- |
| Đã review Desktop design  | ⬜ Chưa review |
| Đã review Tablet design   | ⬜ Chưa review |
| Đã review Mobile design   | ⬜ Chưa review |
| Đã điền Pending Decisions | ⬜ Chưa điền   |
| **APPROVED để implement** | ⬜ PENDING     |

**HUMAN Signature:** ******\_******  
**Date:** ******\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code components nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **User Flow:** [02b_flow.md](./02b_flow.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)

---

## 📝 Design References

- Figma link: [URL]
- Design system: [Link to design system]
- Similar examples: [Links]

---

## 📚 Version History

| Version | Date       | Changes                  |
| ------- | ---------- | ------------------------ |
| v1.0    | YYYY-MM-DD | Initial wireframe design |
