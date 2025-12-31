# 📡 [Feature Name] - API Contract

> **Feature:** [Feature Name]  
> **Module:** [Module Name]  
> **Last updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING / ✅ READY

---

## 📋 Overview

| Field               | Value                        |
| ------------------- | ---------------------------- |
| **Endpoint**        | `[METHOD] /path/to/endpoint` |
| **Base URL (Dev)**  | `https://...`                |
| **Base URL (Prod)** | `https://...`                |
| **Auth Required**   | Yes / No                     |
| **Snapshots**       | [v1](./snapshots/v1/)        |

---

## 📥 Request

### Headers

```http
Content-Type: application/json
Authorization: Bearer {accessToken}  # Nếu cần auth
```

### Body (TypeScript Interface)

```typescript
interface [Feature]Request {
  field1: string;   // Required - Mô tả
  field2?: number;  // Optional - Mô tả
}
```

### Validation Rules

| Field  | Rule                  | Error Message        |
| ------ | --------------------- | -------------------- |
| field1 | Required, min 3 chars | "Field1 là bắt buộc" |

---

## 📤 Response

### Success (200)

```typescript
interface [Feature]Response {
  data: {
    id: string;
    // ...
  };
}
```

**Snapshot:** [success.json](./snapshots/v1/success.json)

### Error Responses

| Status | Code             | Message                   | Snapshot                                        |
| ------ | ---------------- | ------------------------- | ----------------------------------------------- |
| 400    | VALIDATION_ERROR | "Dữ liệu không hợp lệ"    | [error-400.json](./snapshots/v1/error-400.json) |
| 401    | UNAUTHORIZED     | "Sai thông tin đăng nhập" | [error-401.json](./snapshots/v1/error-401.json) |
| 500    | INTERNAL_ERROR   | "Lỗi hệ thống"            | [error-500.json](./snapshots/v1/error-500.json) |

---

## 🧪 Test Cases

| #   | Case          | Input         | Expected   | Snapshot       |
| --- | ------------- | ------------- | ---------- | -------------- |
| 1   | Happy path    | Valid data    | 200 + data | success.json   |
| 2   | Invalid input | Missing field | 400        | error-400.json |

---

## 📝 Notes

- [ ] Ghi chú quan trọng 1
- [ ] Ghi chú quan trọng 2

---

## ✅ HUMAN Confirmation

| Item                     | Status |
| ------------------------ | ------ |
| Contract reviewed        | ⬜     |
| Snapshots provided       | ⬜     |
| Ready for implementation | ⬜     |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******
