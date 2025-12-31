# Session Template

> **Copy file này và đổi tên thành:** `session_XXX_YYYYMMDD_[short-title].md`

---

# Session [XXX]: [Title]

> **Ngày:** YYYY-MM-DD HH:mm  
> **Model:** Claude Opus 4.5  
> **Sprint:** [Sprint number]  
> **Task IDs:** [From implementation plan]

---

## 🎯 Mục tiêu session

- [ ] Task 1 description
- [ ] Task 2 description
- [ ] Task 3 description

---

## 📋 Pre-session Checklist

- [ ] Git status clean
- [ ] Đúng branch: `feature/xxx`
- [ ] Đã pull latest
- [ ] Reference files mở sẵn
- [ ] Terminal ready

---

## 📝 Các bước thực hiện

### Step 1: [Tên bước]

**Mục tiêu:** [Mô tả ngắn]

**Prompt sử dụng:**
```
[Paste prompt đầy đủ ở đây]
```

**Files tạo/sửa:**
| File | Action | Mô tả |
|------|--------|-------|
| `src/path/file.ts` | NEW | [Description] |
| `src/path/other.ts` | MODIFIED | [Description] |

**Verification:**
- [ ] TypeScript pass (`npx tsc --noEmit`)
- [ ] Lint pass (`npm run lint`)
- [ ] App runs (`npm run dev`)
- [ ] Manual test: [mô tả test]

**Kết quả:** ✅ Thành công / ❌ Thất bại

**Ghi chú:** [Bất kỳ observation nào]

**Git commit:**
```bash
git add .
git commit -m "feat(module): description"
```
**Commit hash:** `abc1234`

---

### Step 2: [Tên bước]

**Mục tiêu:** [Mô tả]

**Prompt sử dụng:**
```
[Prompt]
```

**Files tạo/sửa:**
| File | Action | Mô tả |
|------|--------|-------|

**Verification:**
- [ ] TypeScript pass
- [ ] Lint pass
- [ ] App runs
- [ ] Manual test

**Kết quả:** ✅ / ❌

**Git commit:**
```bash
git commit -m "..."
```
**Commit hash:** ``

---

### Step 3: [Tên bước]

[Copy format từ Step 1/2]

---

## ✅ Kết quả cuối session

### Hoàn thành:
- [x] Task 1
- [x] Task 2
- [ ] Task 3 (partially)

### Summary:
[Tóm tắt những gì đã làm được]

### Checkpoint (nếu tạo):
```bash
git tag checkpoint-XXX-description
```

---

## 🔄 Rollback (nếu cần)

### Để undo toàn bộ session:
```bash
git reset --hard [commit-hash-trước-session]
```

### Để quay về step cụ thể:
```bash
git reset --hard [step-commit-hash]
```

### Commit history trong session:
| Step | Commit | Message |
|------|--------|---------|
| 1 | `abc1234` | feat(...): ... |
| 2 | `def5678` | feat(...): ... |
| 3 | `ghi9012` | feat(...): ... |

---

## 📁 Files đã thay đổi (tổng hợp)

### New files:
- `src/api/xxx.api.ts`
- `src/hooks/queries/useXxx.ts`

### Modified files:
- `src/features/portal/xxx/Component.tsx`

### Deleted files:
- (none)

---

## 📋 Next steps

- [ ] Tiếp tục với task chưa hoàn thành
- [ ] Task tiếp theo trong sprint
- [ ] Fix issues phát hiện

---

## 💡 Lessons learned

[Ghi lại bất kỳ điều gì học được, issues gặp phải, tips cho lần sau]

---

## 📎 References

- Implementation plan: `docs/plans/implementation_plan_YYYYMMDD.md`
- Checkpoint trước: `checkpoint-XXX`
- Session trước: `docs/sessions/session_XXX.md`
