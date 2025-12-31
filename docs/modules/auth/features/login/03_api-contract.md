# 📡 Login Feature - API Contract Reference

> **[BƯỚC 3]** API Contract & Snapshots  
> **Feature:** Login  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ✅ READY

---

## 📋 Overview

File này là **reference link** tới API documentation chi tiết nằm trong folder `docs/api/`.

**Tại sao tách riêng?**

- API documentation được quản lý tập trung trong `docs/api/`
- Một API có thể được dùng bởi nhiều features
- Dễ dàng maintain và update API docs

---

## 🔗 API Documentation Links

### Contract (Specification)

**Location:** [docs/api/auth/login/contract.md](../../../../api/auth/login/contract.md)

**Includes:**

- Endpoint specification (method, URL, headers)
- Request body schema (TypeScript interfaces)
- Response schema (success & error)
- Validation rules
- Error codes & messages

### Snapshots (Actual Responses)

**Location:** [docs/api/auth/login/snapshots/v1/](../../../../api/auth/login/snapshots/v1/)

**Available Snapshots:**

- ✅ `success.json` - Successful login response
- ✅ `error-401.json` - Invalid credentials error
- ✅ `error-400.json` - Validation error

---

## 📊 API Quick Reference

| Field        | Value                                            |
| ------------ | ------------------------------------------------ |
| **Endpoint** | `POST /auth/login`                               |
| **Base URL** | `https://vega-identity-api-dev.allianceitsc.com` |
| **Auth**     | Not required                                     |
| **Version**  | v1.0                                             |

### Request Schema

```typescript
interface LoginRequest {
  identifier: string; // Email (v1.0) or Phone (future)
  password: string;
}
```

### Response Schema

```typescript
interface LoginResponse {
  accessToken: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
}
```

---

## ✅ Contract Status Checklist

| Item                     | Status | Date       | Notes                         |
| ------------------------ | ------ | ---------- | ----------------------------- |
| **Contract file exists** | ✅     | 2025-12-27 | contract.md created           |
| **Request defined**      | ✅     | 2025-12-27 | TypeScript interfaces ready   |
| **Response defined**     | ✅     | 2025-12-27 | Success & error cases         |
| **Snapshots captured**   | ✅     | 2025-12-27 | 3 snapshots (success, errors) |
| **Validation rules**     | ✅     | 2025-12-27 | Email/password validation     |
| **Error codes mapped**   | ✅     | 2025-12-27 | 400, 401 handled              |

---

## 📝 Notes & Context

### Implementation Notes

- **Identifier field:** Currently accepts email, designed for future phone support
- **Token storage:** AccessToken should be stored in localStorage or sessionStorage
- **Error handling:** All errors returned in Vietnamese for UX

### Future Enhancements (v1.1+)

- [ ] Add refresh token support
- [ ] Add "Remember me" token expiry extension
- [ ] Add device fingerprinting
- [ ] Add login attempt throttling

---

## ⚠️ HUMAN CONFIRMATION

> **This section tracks approval of the API contract**

| Item                               | Status       |
| ---------------------------------- | ------------ |
| Reviewed API contract              | ✅ Reviewed  |
| Reviewed snapshots (actual data)   | ✅ Reviewed  |
| Confirmed request/response schemas | ✅ Confirmed |
| **APPROVED for implementation**    | ✅ APPROVED  |

**Approved By:** HUMAN  
**Date:** 2025-12-27

---

## 🔄 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **API Contract (Full):** [docs/api/auth/login/contract.md](../../../../api/auth/login/contract.md)

---

## 📚 Version History

| Version | Date       | Changes                    |
| ------- | ---------- | -------------------------- |
| v1.0    | 2025-12-27 | Initial API contract setup |
