# 🔄 Rollback Guide - Quoc Nam Portal

> **Ngày tạo:** 2025-12-26  
> **Model AI:** Claude Opus 4.5

---

## 📋 Mục lục

1. [Các cấp độ Rollback](#1-các-cấp-độ-rollback)
2. [Commands thường dùng](#2-commands-thường-dùng)
3. [Rollback Scenarios](#3-rollback-scenarios)
4. [Recovery từ Session Log](#4-recovery-từ-session-log)
5. [Emergency Procedures](#5-emergency-procedures)

---

## 1. Các cấp độ Rollback

```
┌─────────────────────────────────────────────────────────────────┐
│                     ROLLBACK LEVELS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Level 1: FILE LEVEL                                            │
│  └── Undo changes trong 1 file                                  │
│      Scope: Nhỏ nhất                                            │
│      Command: git checkout -- <file>                            │
│                                                                  │
│  Level 2: COMMIT LEVEL                                          │
│  └── Undo 1 hoặc nhiều commits                                  │
│      Scope: Vừa                                                 │
│      Command: git reset / git revert                            │
│                                                                  │
│  Level 3: CHECKPOINT LEVEL                                      │
│  └── Quay về một checkpoint đã tag                              │
│      Scope: Lớn                                                 │
│      Command: git reset --hard <tag>                            │
│                                                                  │
│  Level 4: BRANCH LEVEL                                          │
│  └── Abandon branch, tạo branch mới từ checkpoint               │
│      Scope: Rất lớn                                             │
│      Command: git checkout -b new-branch <tag>                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Commands thường dùng

### 2.1 Xem trạng thái hiện tại

```bash
# Xem files đã thay đổi
git status

# Xem diff của changes
git diff

# Xem diff của staged changes
git diff --staged

# Xem commit history
git log --oneline -20

# Xem tất cả checkpoints
git tag -l "checkpoint-*"

# Xem chi tiết một commit
git show <commit-hash>
```

### 2.2 Level 1: File Level Rollback

```bash
# Undo changes trong 1 file (chưa staged)
git checkout -- src/path/to/file.ts

# Undo changes trong 1 file (đã staged)
git restore --staged src/path/to/file.ts
git checkout -- src/path/to/file.ts

# Undo tất cả changes (chưa staged)
git checkout -- .

# Undo tất cả staged changes
git restore --staged .
```

### 2.3 Level 2: Commit Level Rollback

```bash
# Undo commit gần nhất, giữ changes
git reset --soft HEAD~1

# Undo commit gần nhất, bỏ staging
git reset HEAD~1

# Undo commit gần nhất, xoá changes (CẢNH BÁO: mất code!)
git reset --hard HEAD~1

# Undo nhiều commits
git reset --hard HEAD~3  # 3 commits gần nhất

# Revert commit (tạo commit ngược lại, an toàn hơn)
git revert <commit-hash>

# Revert nhiều commits
git revert <older-hash>..<newer-hash>
```

### 2.4 Level 3: Checkpoint Level Rollback

```bash
# Xem danh sách checkpoints
git tag -l "checkpoint-*"

# Xem thông tin checkpoint
git show checkpoint-005

# Checkout về checkpoint (detached HEAD)
git checkout checkpoint-005

# Reset branch về checkpoint (CẢNH BÁO: mất commits sau checkpoint!)
git reset --hard checkpoint-005

# Tạo branch mới từ checkpoint
git checkout -b feature/retry-from-005 checkpoint-005
```

### 2.5 Level 4: Branch Level Recovery

```bash
# Abandon current branch, start fresh
git checkout develop
git branch -D feature/broken-branch
git checkout -b feature/fresh-start checkpoint-005

# Hoặc cherry-pick specific commits từ broken branch
git checkout -b feature/salvage checkpoint-005
git cherry-pick <good-commit-1>
git cherry-pick <good-commit-2>
```

---

## 3. Rollback Scenarios

### Scenario 1: Code vừa viết không hoạt động

**Tình huống:** Vừa để Copilot generate code nhưng nó không chạy được

```bash
# Nếu chưa commit
git checkout -- .

# Nếu đã commit
git reset --soft HEAD~1
# Sau đó sửa code và commit lại
```

### Scenario 2: Nhiều commits đều có vấn đề

**Tình huống:** Đã commit nhiều lần nhưng phát hiện approach sai

```bash
# Xem commits
git log --oneline -10

# Tìm commit tốt cuối cùng
# abc1234 feat(chat): working state <-- commit tốt
# def5678 feat(chat): broken change 1
# ghi9012 feat(chat): broken change 2

# Reset về commit tốt
git reset --hard abc1234
```

### Scenario 3: Muốn quay lại checkpoint cũ

**Tình huống:** Cần quay lại trạng thái ổn định của checkpoint trước

```bash
# Xem checkpoints
git tag -l "checkpoint-*"
# checkpoint-001-foundation
# checkpoint-002-auth
# checkpoint-003-chat-api <-- muốn về đây

# Option 1: Reset current branch
git reset --hard checkpoint-003-chat-api

# Option 2: Tạo branch mới (an toàn hơn)
git checkout -b feature/chat-v2 checkpoint-003-chat-api
```

### Scenario 4: Merge conflict disaster

**Tình huống:** Merge bị conflict nghiêm trọng, muốn abort

```bash
# Abort merge
git merge --abort

# Nếu đã commit merge sai
git reset --hard HEAD~1
```

### Scenario 5: Accidentally deleted files

**Tình huống:** Xoá nhầm file quan trọng

```bash
# Nếu chưa commit
git checkout -- src/path/to/deleted-file.ts

# Nếu đã commit
git checkout HEAD~1 -- src/path/to/deleted-file.ts
```

### Scenario 6: Need to undo a specific commit in the middle

**Tình huống:** Cần undo 1 commit cụ thể nhưng giữ các commits sau nó

```bash
# Dùng revert (tạo commit ngược)
git revert <commit-hash>

# Nếu có conflicts, resolve rồi
git revert --continue
```

---

## 4. Recovery từ Session Log

### Quy trình recovery

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOVERY WORKFLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Xác định session/checkpoint cần quay về                     │
│     └── docs/sessions/session_XXX.md                            │
│     └── docs/checkpoints/checkpoint_XXX.md                      │
│                                                                  │
│  2. Backup current state (nếu cần)                              │
│     └── git stash                                               │
│     └── git branch backup-YYYYMMDD                              │
│                                                                  │
│  3. Checkout về checkpoint                                      │
│     └── git checkout checkpoint-XXX                             │
│     └── git checkout -b feature/retry                           │
│                                                                  │
│  4. Mở session log, tìm prompts đã dùng                         │
│                                                                  │
│  5. Chạy lại prompts với điều chỉnh                             │
│                                                                  │
│  6. Verify từng step                                            │
│                                                                  │
│  7. Commit và tạo checkpoint mới                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Ví dụ recovery

```bash
# 1. Đang ở feature/sprint-2-chat, code bị broken

# 2. Backup
git stash
git branch backup-20251226

# 3. Tìm checkpoint tốt gần nhất
git tag -l "checkpoint-*"
# checkpoint-003-chat-api-done

# 4. Tạo branch mới từ checkpoint
git checkout -b feature/sprint-2-chat-v2 checkpoint-003-chat-api-done

# 5. Mở docs/sessions/session_005.md
# Tìm prompts đã dùng cho integration

# 6. Chạy lại với điều chỉnh
# [Dùng Copilot với prompt đã lưu]

# 7. Verify và commit
npm run lint
npm run dev
git add .
git commit -m "feat(chat): integrate ChatMain (retry)"
git tag checkpoint-003a-chat-integration-v2
```

---

## 5. Emergency Procedures

### 🚨 Khi hoàn toàn mất code

```bash
# Git reflog lưu TẤT CẢ changes
git reflog

# Output:
# abc1234 HEAD@{0}: reset: moving to checkpoint-001
# def5678 HEAD@{1}: commit: feat(chat): broken code <-- CẦN NÀY
# ghi9012 HEAD@{2}: commit: feat(chat): working code

# Recover commit đã mất
git checkout def5678
git checkout -b recovered-branch
```

### 🚨 Khi remote bị push nhầm

```bash
# CẢNH BÁO: Chỉ làm nếu chưa ai pull

# Force push để override remote
git push --force origin feature/branch-name

# An toàn hơn: force-with-lease
git push --force-with-lease origin feature/branch-name
```

### 🚨 Khi không biết đang ở đâu

```bash
# Xem branch hiện tại
git branch

# Xem full status
git status

# Xem HEAD đang point đến đâu
git rev-parse HEAD

# Xem tất cả branches và tags
git log --oneline --all --graph -20
```

### 🚨 Nuclear Option: Start completely fresh

```bash
# Chỉ dùng khi thực sự cần thiết

# Clone lại repo
cd ..
mv Quoc-Nam-Phase-1A Quoc-Nam-Phase-1A-broken
git clone <repo-url> Quoc-Nam-Phase-1A
cd Quoc-Nam-Phase-1A

# Hoặc reset về initial commit
git checkout $(git rev-list --max-parents=0 HEAD)
```

---

## 📋 Quick Reference Card

```
╔═══════════════════════════════════════════════════════════════╗
║                    GIT ROLLBACK CHEATSHEET                     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  UNDO UNCOMMITTED CHANGES                                      ║
║  ─────────────────────────                                     ║
║  git checkout -- <file>      # Undo file                       ║
║  git checkout -- .           # Undo all files                  ║
║  git restore --staged <file> # Unstage file                    ║
║                                                                ║
║  UNDO COMMITS                                                  ║
║  ─────────────────────────                                     ║
║  git reset --soft HEAD~1     # Undo, keep staged               ║
║  git reset HEAD~1            # Undo, keep unstaged             ║
║  git reset --hard HEAD~1     # Undo, delete changes ⚠️         ║
║  git revert <hash>           # Create undo commit              ║
║                                                                ║
║  CHECKPOINT OPERATIONS                                         ║
║  ─────────────────────────                                     ║
║  git tag -l "checkpoint-*"   # List checkpoints                ║
║  git checkout <tag>          # View checkpoint                 ║
║  git reset --hard <tag>      # Reset to checkpoint ⚠️          ║
║  git checkout -b new <tag>   # Branch from checkpoint          ║
║                                                                ║
║  EMERGENCY                                                     ║
║  ─────────────────────────                                     ║
║  git reflog                  # View all history                ║
║  git merge --abort           # Cancel merge                    ║
║  git stash                   # Temporary save                  ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**© 2025 - Tạo bởi Claude Opus 4.5 (GitHub Copilot)**
