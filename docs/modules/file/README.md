# 📁 File Module

> **Status:** 📝 Planning  
> **Sprint:** 2  
> **Owner:** TBD

---

## 📋 Overview

Module File quản lý upload, preview và quản lý các file đính kèm trong chat.

### Features:
- Upload file (image, PDF, Excel, Word, etc.)
- File preview trong modal
- Image gallery
- File listing theo group
- Delete file

---

## 📁 Files Structure

```
src/
├── api/
│   └── files.api.ts
├── hooks/
│   ├── queries/
│   │   └── useGroupFiles.ts
│   └── mutations/
│       ├── useUploadFile.ts
│       └── useDeleteFile.ts
└── features/portal/
    └── components/
        ├── FileManager.tsx
        ├── FileManagerPhase1A.tsx
        └── FilePreviewModal.tsx
```

---

## 🔗 Related Docs

- [API Specification](./api-spec.md)
