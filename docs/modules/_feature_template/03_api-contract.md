# 📡 [Feature Name] - API Contract Reference

> **[BƯỚC 3]** API Contract & Snapshots  
> **Feature:** [Feature Name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING

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

**Location:** [docs/api/[module]/[feature]/contract.md](../../../../api/[module]/[feature]/contract.md)

**Includes:**

- Endpoint specification (method, URL, headers)
- Request body schema (TypeScript interfaces)
- Response schema (success & error)
- Validation rules
- Error codes & messages

### Snapshots (Actual Responses)

**Location:** [docs/api/[module]/[feature]/snapshots/v1/](../../../../api/[module]/[feature]/snapshots/v1/)

**Required Snapshots:**

- ⏳ `success.json` - Successful response
- ⏳ `error-4xx.json` - Client error responses
- ⏳ `error-5xx.json` - Server error responses (if applicable)

---

## 📊 API Quick Reference

| Field        | Value                   |
| ------------ | ----------------------- |
| **Endpoint** | `[METHOD] /path/to/api` |
| **Base URL** | `[API Base URL]`        |
| **Auth**     | Required / Not required |
| **Version**  | v1.0                    |

### Request Schema

```typescript
interface [Feature]Request {
  // TODO: Add request fields
}
```

### Response Schema

```typescript
interface [Feature]Response {
  // TODO: Add response fields
}
```

---

## ✅ Contract Status Checklist

| Item                     | Status | Date | Notes |
| ------------------------ | ------ | ---- | ----- |
| **Contract file exists** | ⏳     | -    |       |
| **Request defined**      | ⏳     | -    |       |
| **Response defined**     | ⏳     | -    |       |
| **Snapshots captured**   | ⏳     | -    |       |
| **Validation rules**     | ⏳     | -    |       |
| **Error codes mapped**   | ⏳     | -    |       |

---

## 📝 Notes & Context

### Implementation Notes

- TODO: Add any important notes about this API
- TODO: Special considerations or constraints

### Future Enhancements

- [ ] Enhancement 1
- [ ] Enhancement 2

---

## ⚠️ HUMAN CONFIRMATION

> **This section tracks approval of the API contract**

| Item                               | Status           |
| ---------------------------------- | ---------------- |
| Reviewed API contract              | ⬜ Not reviewed  |
| Reviewed snapshots (actual data)   | ⬜ Not reviewed  |
| Confirmed request/response schemas | ⬜ Not confirmed |
| **APPROVED for implementation**    | ⬜ PENDING       |

**Approved By:** ******\_******  
**Date:** ******\_******

> ⚠️ **AI CANNOT proceed with coding until this is ✅ APPROVED**

---

## 🔄 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **API Contract (Full):** [docs/api/[module]/[feature]/contract.md](../../../../api/[module]/[feature]/contract.md)

---

## 📚 Version History

| Version | Date       | Changes                    |
| ------- | ---------- | -------------------------- |
| v1.0    | YYYY-MM-DD | Initial API contract setup |
