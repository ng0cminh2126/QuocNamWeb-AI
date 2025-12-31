# 🎨 Login Screen - Wireframe

> **[BƯỚC 2A]** UI/UX Design  
> **Feature:** Login  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ✅ READY

---

## 📱 Desktop View (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser Window                              │
│                      (1920 x 1080 - Full HD)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                                                                     │
│                        ┌───────────────┐                            │
│                        │               │                            │
│                        │  [LOGO IMG]   │                            │
│                        │   Quốc Nam    │                            │
│                        │               │                            │
│                        └───────────────┘                            │
│                                                                     │
│                                                                     │
│                ┌───────────────────────────────┐                    │
│                │                               │                    │
│                │     Portal Internal Chat      │                    │
│                │                               │                    │
│                │  ┌─────────────────────────┐  │                    │
│                │  │ Tài khoản               │  │                    │
│                │  │                         │  │                    │
│                │  │ admin                   │  │                    │
│                │  │                         │  │                    │
│                │  └─────────────────────────┘  │                    │
│                │  ╰─ Placeholder: Nhập tài   │                    │
│                │     khoản của bạn            │                    │
│                │                               │                    │
│                │  ┌─────────────────────────┐  │                    │
│                │  │ Mật khẩu           [👁] │  │                    │
│                │  │                         │  │                    │
│                │  │ ••••••••••••            │  │                    │
│                │  │                         │  │                    │
│                │  └─────────────────────────┘  │                    │
│                │  ╰─ Placeholder: Nhập mật    │                    │
│                │     khẩu                      │                    │
│                │                               │                    │
│                │  ┌─ ERROR MESSAGE (nếu có)   │                    │
│                │  │ ⚠️ Tài khoản hoặc mật    │                    │
│                │  │    khẩu không đúng       │                    │
│                │  └───────────────────────────┘                    │
│                │                               │                    │
│                │  ┌─────────────────────────┐  │                    │
│                │  │                         │  │                    │
│                │  │      ĐĂNG NHẬP          │  │ ← #2f9132 (Green) │
│                │  │                         │  │                    │
│                │  └─────────────────────────┘  │                    │
│                │                               │                    │
│                │    Quên mật khẩu?             │ ← Disabled v1.0    │
│                │                               │                    │
│                │    Chưa có tài khoản?         │ ← Disabled v1.0    │
│                │    Đăng ký                    │                    │
│                │                               │                    │
│                └───────────────────────────────┘                    │
│                       Form Width: 480px                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Tablet View (768px - 1023px)

```
┌──────────────────────────────────────────┐
│        Browser/iPad (768 x 1024)         │
├──────────────────────────────────────────┤
│                                          │
│         ┌───────────────┐                │
│         │               │                │
│         │  [LOGO IMG]   │                │
│         │   Quốc Nam    │                │
│         │               │                │
│         └───────────────┘                │
│                                          │
│                                          │
│        ┌──────────────────────┐          │
│        │                      │          │
│        │  Portal Chat         │          │
│        │                      │          │
│        │ ┌──────────────────┐ │          │
│        │ │ Tài khoản        │ │          │
│        │ │                  │ │          │
│        │ │ admin            │ │          │
│        │ └──────────────────┘ │          │
│        │                      │          │
│        │ ┌──────────────────┐ │          │
│        │ │ Mật khẩu    [👁] │ │          │
│        │ │                  │ │          │
│        │ │ ••••••••         │ │          │
│        │ └──────────────────┘ │          │
│        │                      │          │
│        │ ⚠️ Error (if any)    │          │
│        │                      │          │
│        │ ┌──────────────────┐ │          │
│        │ │  ĐĂNG NHẬP       │ │          │
│        │ └──────────────────┘ │          │
│        │                      │          │
│        │  Quên mật khẩu?      │          │
│        │  Đăng ký             │          │
│        │                      │          │
│        └──────────────────────┘          │
│           Form Width: 400px              │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📱 Mobile View (<768px)

```
┌──────────────────────────┐
│  Phone (375 x 667)       │
├──────────────────────────┤
│                          │
│     ┌──────────┐         │
│     │          │         │
│     │  [LOGO]  │         │
│     │          │         │
│     └──────────┘         │
│                          │
│  ┌────────────────────┐  │
│  │                    │  │
│  │  Portal Chat       │  │
│  │                    │  │
│  │ ┌────────────────┐ │  │
│  │ │ Tài khoản      │ │  │
│  │ │                │ │  │
│  │ │ admin          │ │  │
│  │ └────────────────┘ │  │
│  │                    │  │
│  │ ┌────────────────┐ │  │
│  │ │ Mật khẩu  [👁] │ │  │
│  │ │                │ │  │
│  │ │ ••••••••       │ │  │
│  │ └────────────────┘ │  │
│  │                    │  │
│  │ ⚠️ Error message   │  │
│  │                    │  │
│  │ ┌────────────────┐ │  │
│  │ │  ĐĂNG NHẬP     │ │  │
│  │ └────────────────┘ │  │
│  │                    │  │
│  │ Quên mật khẩu?     │  │
│  │ Đăng ký            │  │
│  │                    │  │
│  └────────────────────┘  │
│   Form: 100% - 32px      │
│                          │
└──────────────────────────┘
```

---

## 🎨 Component Specifications

### 1. Logo

- **Desktop:** 120px x 120px
- **Tablet:** 100px x 100px
- **Mobile:** 80px x 80px
- **Position:** Centered, above form
- **Format:** PNG with transparency

### 2. Form Container

- **Desktop:** 480px width, centered
- **Tablet:** 400px width, centered
- **Mobile:** 100% width with 16px padding
- **Background:** White (#ffffff)
- **Border radius:** 8px
- **Shadow:** 0 4px 6px rgba(0,0,0,0.1)
- **Padding:** 32px

### 3. Input Fields

- **Height:**
  - Desktop/Tablet: 48px
  - Mobile: 44px
- **Border:** 1px solid #e5e7eb
- **Border radius:** 6px
- **Padding:** 12px 16px
- **Font size:** 16px
- **Focus state:**
  - Border: 2px solid #2f9132
  - Shadow: 0 0 0 3px rgba(47, 145, 50, 0.1)

### 4. Submit Button

- **Height:**
  - Desktop/Tablet: 48px
  - Mobile: 44px
- **Background:** #2f9132 (Green)
- **Hover:** #267a28
- **Disabled:** #a3d9a5
- **Text:** White, 16px, bold
- **Border radius:** 6px
- **Width:** 100%

### 5. Error Message

- **Position:** Below password field, above button
- **Background:** #fee2e2 (Light red)
- **Border:** 1px solid #ef4444
- **Padding:** 12px 16px
- **Border radius:** 6px
- **Icon:** ⚠️
- **Text:** #991b1b (Dark red)

### 6. Links (Quên mật khẩu, Đăng ký)

- **Font size:** 14px
- **Color:** #6b7280 (Gray)
- **Hover:** #2f9132 (Green)
- **Status v1.0:** Disabled (pointer-events: none, opacity: 0.5)

---

## 🔄 States

### Default State

- Empty fields
- Button enabled
- No error message

### Typing State

- Fields focused with green border
- Button enabled

### Loading State

- Button shows spinner + "Đang đăng nhập..."
- Button disabled
- Fields disabled

### Error State

- Error message visible below password
- Red border on fields (optional)
- Button enabled (allow retry)

### Success State

- Brief checkmark animation
- Redirect to /portal

---

## 📝 HUMAN Decisions (Wireframe-specific)

| #   | Question        | Options                                         | Decision                | Status |
| --- | --------------- | ----------------------------------------------- | ----------------------- | ------ |
| 1   | Logo placement  | Center top / Left top / No logo                 | Center top              | ⬜     |
| 2   | Form title      | "Portal Internal Chat" / "Đăng nhập" / No title | "Portal Internal Chat"  | ⬜     |
| 3   | Error position  | Above button / Below button / Toast             | Above button (inline)   | ⬜     |
| 4   | Password toggle | Eye icon inside / Button outside                | Eye icon inside (right) | ⬜     |
| 5   | Link position   | Below button / Side by side                     | Below button (stacked)  | ⬜     |

---

## ✅ HUMAN Approval

| Item                       | Status |
| -------------------------- | ------ |
| Desktop wireframe reviewed | ⬜     |
| Tablet wireframe reviewed  | ⬜     |
| Mobile wireframe reviewed  | ⬜     |
| Component specs approved   | ⬜     |
| States design approved     | ⬜     |
| All decisions filled       | ⬜     |
| **APPROVED to code**       | ⬜     |

**HUMAN Signature:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***

---

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code UI nếu wireframe chưa được HUMAN approve**
