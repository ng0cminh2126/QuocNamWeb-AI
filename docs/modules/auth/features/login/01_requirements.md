# 🔐 Login Feature - Requirements Document

> **[BƯỚC 1]** Requirements Gathering  
> **Feature ID:** `AUTH-001`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ✅ APPROVED

---

## 📖 Description

Cho phép user đăng nhập vào hệ thống Portal Internal Chat.

### Authentication Method

| Field          | Current (v1.0) | Future (v1.1+)           |
| -------------- | -------------- | ------------------------ |
| **Identifier** | Tài khoản      | Phone number (VN)        |
| **Field name** | `identifier`   | `identifier` (không đổi) |
| **Password**   | Required       | Required                 |
| **Validation** | Required only  | Format validation        |

> **Design Note:** Sử dụng field name `identifier` thay vì `email` hoặc `phone` để dễ dàng chuyển đổi sau này mà không cần thay đổi API contract. Hiện tại chỉ kiểm tra trường có được nhập hay không, không kiểm tra format.

---

## 👥 User Stories

1. As a **staff member**, I want to **login using my account** so that **I can access the portal and chat with my team**

2. As a **team lead**, I want to **login and see my team dashboard** so that **I can monitor team activities and assign tasks**

3. As a **user**, I want to **see clear error messages in Vietnamese** so that **I know what went wrong**

4. As a **user on mobile**, I want to **login easily on my phone** so that **I can work on the go**

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] User nhập tài khoản (username)
- [ ] User nhập mật khẩu (ẩn/hiện mật khẩu)
- [ ] Validate identifier chỉ cần có nhập (không kiểm tra format)
- [ ] Hiển thị loading state khi đang xử lý login
- [ ] Hiển thị error message bằng tiếng Việt nếu login thất bại (inline trên form)
- [ ] Redirect đến `/portal` sau khi login thành công
- [ ] Route `/` cũng hiển thị portal screen sau khi đăng nhập
- [ ] Lưu accessToken vào storage
- [ ] Persist user info vào Zustand store
- [ ] Chặn truy cập các màn hình khác khi chưa đăng nhập
- [ ] Tự động refresh token 10 phút trước khi token hết hạn
- [ ] Parse JWT để lấy expiration time (exp claim)

### UI/UX Requirements

- [ ] **Centered form layout** cho tất cả breakpoints
- [ ] Green color scheme (#2f9132) cho primary actions
- [ ] Responsive design cho desktop, tablet, mobile
- [ ] Keyboard navigation support (Tab, Enter)
- [ ] Focus management (auto-focus first field)
- [ ] Loading states không block UI
- [ ] Error messages rõ ràng, có thể dismiss
- [ ] Accessibility (ARIA labels, screen reader support)
- [ ] Link "Quên mật khẩu?" (disabled cho v1.0)
- [ ] Link "Đăng ký" (disabled cho v1.0)

### Security Requirements

- [ ] Password field type="password"
- [ ] Không log sensitive data
- [ ] Rate limiting handling
- [ ] Secure token storage

---

## 📡 API Reference

> **Full Contract:** [docs/api/auth/login/contract.md](../../../../api/auth/login/contract.md)

### Endpoint

```
POST https://vega-identity-api-dev.allianceitsc.com/auth/login
```

### Request

```typescript
interface LoginRequest {
  identifier: string; // Tài khoản (username)
  password: string;
}
```

### Response (Success - 200)

```typescript
interface LoginResponse {
  requiresMfa: boolean; // MFA flag
  mfaToken: string | null; // Token cho MFA (nếu cần)
  mfaMethod: string | null; // MFA method
  accessToken: string; // JWT access token
  user: {
    id: string; // UUID
    identifier: string; // Email/phone
    roles: string[]; // ["Admin"], ["Staff"], etc.
  };
}
```

### Response (Error - 401)

```typescript
interface LoginErrorResponse {
  errorCode: string; // "AUTH_INVALID_CREDENTIALS"
  message: string; // "Invalid login credentials"
  timestamp: string; // ISO 8601
}
```

### Snapshots

| Case      | File                                                                     | Status |
| --------- | ------------------------------------------------------------------------ | ------ |
| Success   | [success.json](../../../../api/auth/login/snapshots/v1/success.json)     | ✅     |
| Error 401 | [error-401.json](../../../../api/auth/login/snapshots/v1/error-401.json) | ✅     |

---

## 🎨 UI/UX Specifications

### Layout - Centered Form

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌───────────────┐                        │
│                    │     LOGO      │                        │
│                    │  Quoc Nam     │                        │
│                    └───────────────┘                        │
│                                                             │
│              ┌──────────────────────────────┐               │
│              │                              │               │
│              │  ┌────────────────────────┐  │               │
│              │  │ Tài khoản              │  │               │
│              │  │ [admin________________] │  │               │
│              │  └────────────────────────┘  │               │
│              │                              │               │
│              │  ┌────────────────────────┐  │               │
│              │  │ Mật khẩu         [👁]  │  │               │
│              │  │ [••••••••••••••••]     │  │               │
│              │  └────────────────────────┘  │               │
│              │                              │               │
│              │   ┌──────────────────────┐   │               │
│              │   │   ĐĂNG NHẬP          │   │  ← #2f9132   │
│              │   └──────────────────────┘   │               │
│              │                              │               │
│              │   Quên mật khẩu?             │               │
│              │   Chưa có tài khoản? Đăng ký │               │
│              │                              │               │
│              └──────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Colors

```css
--primary: #2f9132; /* Green - primary actions */
--primary-hover: #267a28; /* Darker green on hover */
--error: #ef4444; /* Red for errors */
--text-primary: #1f2937;
--text-secondary: #6b7280;
--border: #e5e7eb;
```

### Component Sizes

| Element       | Desktop | Tablet | Mobile |
| ------------- | ------- | ------ | ------ |
| Input height  | 48px    | 48px   | 44px   |
| Button height | 48px    | 48px   | 44px   |
| Logo size     | 120px   | 100px  | 80px   |
| Form width    | 480px   | 400px  | 100%   |

### Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** ≥ 1024px

---

## 🌐 Localization (Vietnamese)

### Labels

| Field      | Label     | Placeholder             |
| ---------- | --------- | ----------------------- |
| identifier | Tài khoản | Nhập tài khoản của bạn  |
| password   | Mật khẩu  | Nhập mật khẩu           |

### Error Messages

| Code                     | Vietnamese Message                         |
| ------------------------ | ------------------------------------------ |
| AUTH_INVALID_CREDENTIALS | Tài khoản hoặc mật khẩu không đúng         |
| VALIDATION_REQUIRED      | Vui lòng điền thông tin                    |
| NETWORK_ERROR            | Không thể kết nối. Vui lòng kiểm tra mạng. |

### Button States

| State   | Text              |
| ------- | ----------------- |
| Default | Đăng nhập         |
| Loading | Đang đăng nhập... |

---

## ♿ Accessibility

### ARIA Labels

```typescript
{
  identifierInput: {
    "aria-label": "Tài khoản",
    "aria-required": "true",
    "aria-invalid": hasError ? "true" : "false",
  },
  passwordInput: {
    "aria-label": "Mật khẩu",
    "aria-required": "true",
  },
  submitButton: {
    "aria-label": isLoading ? "Đang đăng nhập..." : "Đăng nhập",
  },
  togglePassword: {
    "aria-label": showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu",
  }
}
```

### Keyboard Navigation

- **Tab:** Move between fields
- **Shift+Tab:** Move backward
- **Enter:** Submit form
- **Space:** Toggle password visibility (on eye icon)

---

## 🔒 Security Considerations

1. **Password field:** Always use `type="password"`
2. **No logging:** Never log credentials
3. **Token storage:** Use secure storage (memory + sessionStorage fallback)
4. **HTTPS:** Required in production
5. **Rate limiting:** Handle 429 errors gracefully

---

## 🔄 Token Refresh Strategy

### JWT Expiration

API không trả về `expiresIn`, nhưng token expiry được encode trong JWT payload (`exp` claim).

```typescript
// Parse JWT để lấy expiration
function getTokenExpiry(token: string): number {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.exp * 1000; // Convert to milliseconds
}
```

### Auto Refresh Logic

```typescript
const TOKEN_REFRESH_BEFORE_EXPIRE_MS = 10 * 60 * 1000; // 10 minutes

// Background timer check every 1 minute
setInterval(() => {
  const expiresAt = getTokenExpiry(accessToken);
  const now = Date.now();

  if (now >= expiresAt - TOKEN_REFRESH_BEFORE_EXPIRE_MS) {
    // Token sắp hết hạn trong 10 phút → Refresh
    refreshToken();
  }

  if (now >= expiresAt) {
    // Token đã hết hạn → Logout
    logout();
  }
}, 60000);
```

### Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Login Success → Parse JWT → Get exp claim                  │
│ → expiresAt = exp * 1000 (milliseconds)                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Background Timer (every 1 minute)                          │
│                                                             │
│ Check: Còn ≤ 10 phút? → Auto Refresh Token                 │
│ Check: Đã hết hạn? → Auto Logout + Redirect /login        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 HUMAN Decisions

| #   | Question               | Decision                      | Date       | Status     |
| --- | ---------------------- | ----------------------------- | ---------- | ---------- |
| 1   | Identifier type (v1.0) | Tài khoản (username)          | 2025-12-27 | ✅ Done    |
| 2   | Primary color          | #2f9132 (Green)               | 2025-12-27 | ✅ Done    |
| 3   | Layout style           | Centered                      | 2025-12-27 | ✅ Done    |
| 4   | Error display          | Inline trên form              | 2025-12-27 | ✅ Done    |
| 5   | Validation trigger     | onBlur (required only)        | 2025-12-27 | ✅ Done    |
| 6   | Redirect after login   | /portal (/ cũng show portal)  | 2025-12-27 | ✅ Done    |
| 7   | Token refresh timing   | 10 phút trước khi hết hạn     | 2025-12-27 | ⏳ PENDING |
| 8   | Token refresh v1.0     | Implement now / Defer to v1.1 | -          | ⏳ PENDING |

---

## ✅ HUMAN Confirmation

| Item                   | Status |
| ---------------------- | ------ |
| Requirements reviewed  | ✅     |
| UI/UX approved         | ✅     |
| API contract confirmed | ✅     |
| **APPROVED**           | ✅     |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2025-12-27
