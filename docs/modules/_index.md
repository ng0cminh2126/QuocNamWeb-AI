# 📁 Modules Index

> **Mục đích:** Reference documentation cho từng module nghiệp vụ

---

## 🗂️ Available Modules

| Module | Folder | Description | API Spec | Snapshots | Status |
|--------|--------|-------------|----------|-----------|--------|
| **Auth** | [auth/](./auth/) | Authentication, authorization | ✅ | ⬜ Pending | 🔒 Blocked |
| **Chat** | [chat/](./chat/) | Messaging, SignalR, real-time | ✅ | ⬜ Pending | 📝 Planning |
| **Task** | [task/](./task/) | Task management, checklist, workflow | ✅ | ⬜ Pending | 📝 Planning |
| **File** | [file/](./file/) | Upload, preview, file management | ✅ | ⬜ Pending | 📝 Planning |
| **Organization** | [org/](./org/) | Users, departments, groups | ⬜ | ⬜ Pending | 📝 Planning |

### Status Legend:
- 🔒 **Blocked** - Cần HUMAN cung cấp snapshots trước khi implement
- 📝 **Planning** - Đang lên kế hoạch
- 🚧 **In Progress** - Đang implement
- ✅ **Done** - Hoàn thành

---

## 📋 Module Documentation Structure

Mỗi module PHẢI có các file sau:

```
modules/
└── [module-name]/
    ├── README.md           # Overview của module
    ├── api-spec.md         # API specification chi tiết (BẮT BUỘC)
    ├── snapshots/          # API response snapshots (BẮT BUỘC)
    │   ├── README.md       # Hướng dẫn capture snapshot
    │   ├── [endpoint]_success.json
    │   └── [endpoint]_error.json
    ├── types.md            # TypeScript types/interfaces (optional)
    ├── components.md       # Danh sách components (optional)
    └── hooks.md            # Danh sách hooks (optional)
```

### ⚠️ CRITICAL: Snapshot Requirement

**AI KHÔNG ĐƯỢC implement API client nếu thiếu snapshot files.**

Snapshot giúp:
1. Đảm bảo field names chính xác (không suy diễn)
2. Hiểu được cấu trúc JSON thực tế
3. Có test data để viết unit tests
4. Tránh bugs do đoán sai response structure

---

## 🔗 Cross-references

- **Implementation Plan:** [../plans/implementation_plan_20251226.md](../plans/implementation_plan_20251226.md)
- **Sessions:** [../sessions/_index.md](../sessions/_index.md)
- **Checkpoints:** [../checkpoints/_index.md](../checkpoints/_index.md)
