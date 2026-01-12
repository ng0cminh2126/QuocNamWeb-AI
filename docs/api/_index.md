# 📡 API Documentation Index

> **Last updated:** 2025-12-27

---

## 📁 Structure

```
docs/api/
├── _index.md                    # This file
├── _templates/                  # Templates for new APIs
│   ├── contract.template.md
│   └── snapshot.template.json
│
├── auth/                        # Authentication module
│   ├── login/                   # Login feature
│   │   ├── contract.md          # API specification
│   │   └── snapshots/v1/        # Response snapshots
│   ├── register/                # Register feature (planned)
│   └── forgot-password/         # Forgot password feature (planned)
│
├── chat/                        # Chat module
│   └── messages/
│
├── task/                        # Task module
│
└── file/                        # File module
    ├── upload/
    ├── preview/                 # Generic file preview
    ├── preview-word/            # Word file preview
    ├── preview-excel/           # Excel file preview
    └── thumbnail/
```

---

## 📋 API Catalog

### Auth Module

| Feature         | Endpoint                | Method | Contract                             | Snapshots                        | Status     |
| --------------- | ----------------------- | ------ | ------------------------------------ | -------------------------------- | ---------- |
| Login           | `/auth/login`           | POST   | [contract](./auth/login/contract.md) | [v1](./auth/login/snapshots/v1/) | ✅ Ready   |
| Register        | `/auth/register`        | POST   | TBD                                  | -                                | 📋 Planned |
| Forgot Password | `/auth/forgot-password` | POST   | TBD                                  | -                                | 📋 Planned |

### Chat Module

| Feature  | Endpoint    | Method | Contract | Snapshots | Status     |
| -------- | ----------- | ------ | -------- | --------- | ---------- |
| Messages | `/messages` | GET    | TBD      | -         | 📋 Planned |

### File Module

| Feature           | Endpoint                        | Method | Contract                                     | Snapshots                                | Status     |
| ----------------- | ------------------------------- | ------ | -------------------------------------------- | ---------------------------------------- | ---------- |
| Upload            | `/api/Files`                    | POST   | [contract](./file/upload/contract.md)        | [v1](./file/upload/snapshots/v1/)        | ✅ Ready   |
| Preview (Generic) | `/api/Files/{id}/preview`       | GET    | [contract](./file/preview/contract.md)       | [v1](./file/preview/snapshots/v1/)       | ✅ Ready   |
| Preview Word      | `/api/Files/{id}/preview/word`  | GET    | [contract](./file/preview-word/contract.md)  | [v1](./file/preview-word/snapshots/v1/)  | ⏳ Pending |
| Preview Excel     | `/api/Files/{id}/preview/excel` | GET    | [contract](./file/preview-excel/contract.md) | [v1](./file/preview-excel/snapshots/v1/) | ⏳ Pending |
| Thumbnail         | `/api/Files/{id}/thumbnail`     | GET    | [contract](./file/thumbnail/contract.md)     | [v1](./file/thumbnail/snapshots/v1/)     | ✅ Ready   |

---

## 🔧 How to Add New API

1. Copy template từ `_templates/contract.template.md`
2. Tạo folder: `docs/api/[module]/[feature]/`
3. Paste và điền thông tin vào `contract.md`
4. Tạo folder `snapshots/v1/`
5. Thêm actual JSON response vào snapshots
6. Update index table ở trên

---

## ⚠️ Rules

1. **Mọi API PHẢI có contract + snapshot** trước khi code
2. **Snapshot PHẢI là actual response** từ API, không phải mock
3. **AI KHÔNG ĐƯỢC code** nếu thiếu contract hoặc snapshot
4. **HUMAN phải cung cấp** snapshot nếu AI không thể tự capture
