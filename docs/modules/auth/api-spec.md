# 🔐 Auth Module - API Specification

> **Module:** Authentication & Authorization  
> **Last updated:** 2025-12-26  
> **Status:** ⏳ PENDING - Cần HUMAN cung cấp snapshot

---

## 📡 REST Endpoints

### POST /api/auth/login

Đăng nhập user và lấy tokens.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```typescript
interface LoginRequest {
  username: string;
  password: string;
  // TODO: Cần HUMAN xác nhận có thêm field nào không
  // rememberMe?: boolean;
  // deviceId?: string;
}
```

**Response (Success - 200):**
```typescript
interface LoginResponse {
  // TODO: Cần HUMAN cung cấp snapshot thực tế
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatar?: string;
    departmentId?: string;
    departmentName?: string;
    role: 'admin' | 'lead' | 'staff';
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}
```

**Response (Error - 401):**
```typescript
interface LoginErrorResponse {
  code: string;
  message: string;
  // TODO: Cần HUMAN xác nhận error format
}
```

**Snapshot:** [📁 snapshots/login_success.json](./snapshots/login_success.json) ⚠️ CHƯA CÓ

---

### POST /api/auth/refresh

Làm mới access token.

**Request Body:**
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**Response (Success - 200):**
```typescript
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

**Snapshot:** [📁 snapshots/refresh_success.json](./snapshots/refresh_success.json) ⚠️ CHƯA CÓ

---

### POST /api/auth/logout

Đăng xuất và invalidate tokens.

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (Success - 200):**
```typescript
interface LogoutResponse {
  success: boolean;
}
```

---

### GET /api/auth/me

Lấy thông tin user hiện tại.

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (Success - 200):**
```typescript
interface GetCurrentUserResponse {
  user: User; // Same as LoginResponse.user
}
```

**Snapshot:** [📁 snapshots/me_success.json](./snapshots/me_success.json) ⚠️ CHƯA CÓ

---

## ⚠️ HUMAN ACTION REQUIRED

Để AI có thể implement Auth module, HUMAN cần cung cấp:

| # | Item | File cần tạo | Status |
|---|------|--------------|--------|
| 1 | Login success response | `snapshots/login_success.json` | ⬜ Chưa có |
| 2 | Login error response | `snapshots/login_error.json` | ⬜ Chưa có |
| 3 | Refresh token response | `snapshots/refresh_success.json` | ⬜ Chưa có |
| 4 | Get current user response | `snapshots/me_success.json` | ⬜ Chưa có |

### Cách cung cấp snapshot:

1. Call API thực tế (Postman, curl, hoặc browser)
2. Copy JSON response
3. Tạo file trong `docs/modules/auth/snapshots/`
4. Paste JSON vào file

### Ví dụ snapshot file format:

```json
{
  "_meta": {
    "endpoint": "POST /api/auth/login",
    "capturedAt": "2025-12-26T10:00:00Z",
    "environment": "development",
    "notes": "Success case với user admin"
  },
  "response": {
    // Paste actual JSON response here
  }
}
```
