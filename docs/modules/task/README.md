# ✅ Task Module

> **Status:** 📝 Planning  
> **Sprint:** 3  
> **Owner:** TBD

---

## 📋 Overview

Module Task quản lý công việc được tạo từ tin nhắn chat, với workflow và checklist.

### Features:
- Tạo task từ message
- CRUD task
- Task status flow: todo → in_progress → awaiting_review → done
- Checklist management
- Task assignment
- Task log (nhật ký công việc)
- Priority và deadline

---

## 📁 Files Structure

```
src/
├── api/
│   └── tasks.api.ts
├── hooks/
│   ├── queries/
│   │   ├── useTasks.ts
│   │   └── useTaskDetail.ts
│   └── mutations/
│       ├── useCreateTask.ts
│       ├── useUpdateTask.ts
│       └── useUpdateChecklist.ts
├── features/portal/
│   ├── workspace/
│   │   └── RightPanel.tsx
│   └── components/
│       ├── TaskChecklist.tsx
│       └── TaskLogThreadSheet.tsx
└── components/sheet/
    └── AssignTaskSheet.tsx
```

---

## 🔗 Related Docs

- [API Specification](./api-spec.md)
- [Task Workflow](./workflow.md)
- [Components](./components.md)
