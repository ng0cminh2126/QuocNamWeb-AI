# Checkpoint Template

> **Copy file này và đổi tên thành:** `checkpoint_XXX_[short-title].md`

---

# Checkpoint [XXX]: [Title]

> **Ngày tạo:** YYYY-MM-DD HH:mm  
> **Git tag:** `checkpoint-XXX-description`  
> **Git commit:** `[full hash]`  
> **Branch:** `feature/xxx`  
> **Sprint:** [Number]  
> **Model:** Claude Opus 4.5

---

## 📦 Những gì đã hoàn thành

### Features/Tasks:
- [x] Task 1 description
- [x] Task 2 description
- [x] Task 3 description

### Modules completed:
- [ ] Auth module
- [ ] Messages API layer
- [ ] Chat integration
- [ ] ...

---

## 📁 Project state

### New files created since last checkpoint:

```
src/
├── api/
│   ├── client.ts              # Axios instance
│   └── messages.api.ts        # Messages API
├── hooks/
│   └── queries/
│       └── useMessages.ts     # Messages query hook
└── types/
    └── messages.ts            # Message types
```

### Modified files:
| File | Changes |
|------|---------|
| `src/features/portal/workspace/ChatMain.tsx` | Integrated with useMessages |
| `src/App.tsx` | Added QueryClientProvider |

### Deleted files:
- (none)

---

## 🔧 Dependencies

### Added in this checkpoint:
```json
{
  "@tanstack/react-query": "^5.x",
  "@microsoft/signalr": "^8.x"
}
```

### Dev dependencies added:
```json
{
  "@tanstack/react-query-devtools": "^5.x"
}
```

---

## ✅ Verification Status

| Check | Status | Notes |
|-------|--------|-------|
| `npm run lint` | ✅ Pass | No errors |
| `npm run build` | ✅ Pass | Build successful |
| `npm run dev` | ✅ Running | No console errors |
| Manual test - Desktop | ✅ Pass | All features work |
| Manual test - Mobile | ✅ Pass | Responsive OK |

---

## 🧪 Test Coverage

### Tested scenarios:
- [x] Messages load correctly
- [x] Infinite scroll works
- [x] Loading state displays
- [x] Error state with retry
- [x] Empty state message

### Known issues:
- [ ] Issue 1 description (minor)
- [ ] Issue 2 description (to be fixed later)

---

## 🔄 Rollback Instructions

### To restore this checkpoint:

```bash
# View this checkpoint
git checkout checkpoint-XXX-description

# Reset branch to this checkpoint
git reset --hard checkpoint-XXX-description

# Create new branch from this checkpoint
git checkout -b feature/new-work checkpoint-XXX-description
```

### Previous checkpoint:
- Tag: `checkpoint-XXX-previous`
- Description: [Previous checkpoint title]

---

## 📋 Configuration State

### Environment variables needed:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/chat
```

### Important configs:
- TanStack Query: configured in `src/main.tsx`
- Axios base URL: configured in `src/api/client.ts`

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Total commits since last checkpoint | X |
| Files changed | X |
| Lines added | +XXX |
| Lines removed | -XXX |
| Bundle size | XXX KB |

---

## 📋 Next Steps

After this checkpoint, continue with:

1. [ ] Next task 1
2. [ ] Next task 2
3. [ ] Next task 3

### Recommended next session:
- Session title: [Description]
- Tasks: [List task IDs]

---

## 📎 Related Documents

- Implementation plan: [docs/plans/implementation_plan_YYYYMMDD.md](../plans/)
- Session logs:
  - [Session XXX](../sessions/session_XXX.md)
  - [Session XXX](../sessions/session_XXX.md)
- Previous checkpoint: [checkpoint_XXX](./checkpoint_XXX.md)

---

## 💬 Notes

[Any additional notes, observations, or context for future reference]

---

**Checkpoint created by:** Claude Opus 4.5 (GitHub Copilot)
