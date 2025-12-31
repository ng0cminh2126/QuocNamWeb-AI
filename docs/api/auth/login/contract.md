# 📡 Login - API Contract

> **Feature:** Login  
> **Module:** Auth  
> **Last updated:** 2025-12-27  
> **Status:** ✅ READY - Snapshots captured

---

## 📋 Overview

| Field               | Value                                            |
| ------------------- | ------------------------------------------------ |
| **Endpoint**        | `POST /auth/login`                               |
| **Base URL (Dev)**  | `https://vega-identity-api-dev.allianceitsc.com` |
| **Base URL (Prod)** | TBD                                              |
| **Auth Required**   | No                                               |
| **Snapshots**       | [v1](./snapshots/v1/) ✅                         |

---

## 📥 Request

### Headers

```http
Content-Type: application/json
```

### Body (TypeScript Interface)

```typescript
/**
 * Login Request
 *
 * @note `identifier` được thiết kế linh hoạt:
 * - Hiện tại: Dùng email để đăng nhập
 * - Tương lai: Có thể đổi sang số điện thoại mà không cần sửa interface
 */
interface LoginRequest {
  identifier: string; // Required - Email (tạm thời) hoặc Phone (tương lai)
  password: string; // Required - Mật khẩu
}

// Type alias để dễ thay đổi sau này
type LoginIdentifier = string; // Email | PhoneNumber
```

### Frontend Type Definition

```typescript
// src/types/auth.ts

/**
 * Identifier type - Dễ thay đổi giữa email và phone
 * Chỉ cần đổi IDENTIFIER_TYPE và validation regex
 */
export const IDENTIFIER_TYPE = "email" as const; // 'email' | 'phone'

export interface LoginCredentials {
  identifier: string;
  password: string;
}

// Validation patterns
export const IDENTIFIER_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(0[3|5|7|8|9])+([0-9]{8,9})$/, // Vietnam phone
} as const;

// Labels cho UI (dễ đổi ngôn ngữ)
export const IDENTIFIER_LABELS = {
  email: {
    label: "Email",
    placeholder: "Nhập email của bạn",
    errorRequired: "Email là bắt buộc",
    errorInvalid: "Email không hợp lệ",
  },
  phone: {
    label: "Số điện thoại",
    placeholder: "Nhập số điện thoại (VD: 0901234567)",
    errorRequired: "Số điện thoại là bắt buộc",
    errorInvalid: "Số điện thoại không hợp lệ",
  },
} as const;
```

### Validation Rules

| Field      | Rule               | Error Message (VI)     |
| ---------- | ------------------ | ---------------------- |
| identifier | Required           | "Email là bắt buộc"    |
| identifier | Valid email format | "Email không hợp lệ"   |
| password   | Required           | "Mật khẩu là bắt buộc" |

---

## 📤 Response

### Success (200)

```typescript
/**
 * Login Response - Captured từ actual API (2025-12-27)
 */
interface LoginResponse {
  requiresMfa: boolean; // MFA required flag
  mfaToken: string | null; // Token cho MFA step (nếu requiresMfa = true)
  mfaMethod: string | null; // MFA method (email, sms, authenticator)
  accessToken: string; // JWT access token
  user: {
    id: string; // UUID format: "019b48e8-0c13-7ff2-b954-10937732c5a4"
    identifier: string; // Email hoặc phone
    roles: string[]; // Array of roles: ["Admin"], ["Staff"], etc.
  };
}

// Note: API KHÔNG trả về refreshToken và expiresIn
// Token expiry được encode trong JWT payload (exp claim)
```

**Snapshot:** [success.json](./snapshots/v1/success.json) ✅

### Error Responses

| Status | Code                     | Message                     | Snapshot                                           |
| ------ | ------------------------ | --------------------------- | -------------------------------------------------- |
| 401    | AUTH_INVALID_CREDENTIALS | "Invalid login credentials" | [error-401.json](./snapshots/v1/error-401.json) ✅ |

```typescript
/**
 * Error Response - Captured từ actual API (2025-12-27)
 */
interface LoginErrorResponse {
  errorCode: string; // "AUTH_INVALID_CREDENTIALS"
  message: string; // "Invalid login credentials"
  timestamp: string; // ISO 8601 format
}
```

---

## 🧪 Test Cases

| #   | Case                 | Input                        | Expected            | Snapshot       |
| --- | -------------------- | ---------------------------- | ------------------- | -------------- |
| 1   | Login thành công     | Valid email + password       | 200 + tokens + user | success.json   |
| 2   | Sai password         | Valid email + wrong password | 401                 | error-401.json |
| 3   | Email không tồn tại  | Non-existent email           | 401                 | error-401.json |
| 4   | Thiếu email          | Empty identifier             | 400                 | error-400.json |
| 5   | Email invalid format | "invalid-email"              | 400 (frontend)      | -              |

---

## 🔄 Capture Config

```json
{
  "endpoint": "/auth/login",
  "method": "POST",
  "baseUrl": "https://vega-identity-api-dev.allianceitsc.com",
  "headers": {
    "Content-Type": "application/json"
  },
  "testCases": [
    {
      "name": "success",
      "requestBody": {
        "identifier": "{{TEST_EMAIL}}",
        "password": "{{TEST_PASSWORD}}"
      },
      "expectedStatus": 200
    },
    {
      "name": "error-401",
      "requestBody": {
        "identifier": "test@example.com",
        "password": "wrong_password_123"
      },
      "expectedStatus": 401
    }
  ],
  "environment": {
    "required": ["TEST_EMAIL", "TEST_PASSWORD"],
    "note": "HUMAN cần cung cấp test credentials"
  }
}
```

---

## 📝 Implementation Notes

### Thiết kế linh hoạt cho identifier

```typescript
// Cách đổi từ email sang phone trong tương lai:
// 1. Đổi IDENTIFIER_TYPE từ 'email' sang 'phone'
// 2. UI sẽ tự động đổi label, placeholder, validation
// 3. Không cần sửa API contract (vẫn dùng field `identifier`)
```

### Related Features

- **Forgot Password:** [../forgot-password/contract.md](../forgot-password/contract.md) (TBD)
- **Register:** [../register/contract.md](../register/contract.md) (TBD)

---

## ⚠️ HUMAN ACTION REQUIRED

### Cần cung cấp Snapshots

Để AI có thể implement login feature, HUMAN cần:

1. **Test API và capture response:**

   ```bash
   curl -X POST https://vega-identity-api-dev.allianceitsc.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier": "your_email", "password": "your_password"}'
   ```

2. **Paste JSON response vào:**

   - Success: `docs/api/auth/login/snapshots/v1/success.json`
   - Error 401: `docs/api/auth/login/snapshots/v1/error-401.json`

3. **Xác nhận cấu trúc response** trong section Response ở trên

---

## ✅ HUMAN Confirmation

| Item                         | Status |
| ---------------------------- | ------ |
| Contract reviewed            | ✅     |
| Success snapshot provided    | ✅     |
| Error snapshots provided     | ✅     |
| Response structure confirmed | ✅     |
| **Ready for implementation** | ✅     |

**HUMAN Signature:** AI Captured with HUMAN credentials  
**Date:** 2025-12-27

---

> ✅ **Contract READY** - AI có thể implement login feature
