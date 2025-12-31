# 📁 Checkpoints Index

> **Cập nhật lần cuối:** 2025-12-26  
> **Mục đích:** Quick navigation đến các checkpoint

---

## 🏷️ Checkpoint Naming Convention

```
checkpoint_[NUMBER]_[MODULE(s)]_[title].md

# Examples:
checkpoint_001_foundation-complete.md          # Cross-module
checkpoint_002_[auth]_login-flow.md            # Single module
checkpoint_003_[chat+task]_integrated.md       # Multi-module
checkpoint_010_sprint1-complete.md             # Sprint milestone
```

---

## 📊 Current Checkpoints

| # | Tag | Module(s) | Description | Date |
|---|-----|-----------|-------------|------|
| - | - | - | *(Chưa có checkpoint)* | - |

---

## 🎯 Checkpoint Types

### 🏗️ Foundation Checkpoints
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

### 🔐 [auth] Auth Checkpoints
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

### 💬 [chat] Chat Checkpoints
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

### ✅ [task] Task Checkpoints
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

### 📁 [file] File Checkpoints
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

### 🏢 [org] Organization Checkpoints
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

### 🚀 Sprint Milestones
| # | Tag | Description |
|---|-----|-------------|
| - | - | *(Chưa có)* |

---

## 🔄 Quick Rollback Reference

```bash
# List all checkpoints
git tag -l "checkpoint-*"

# Go to specific checkpoint
git checkout checkpoint-XXX

# Reset to checkpoint
git reset --hard checkpoint-XXX

# Create branch from checkpoint
git checkout -b feature/new checkpoint-XXX
```

---

## 📋 How to create checkpoint

1. Verify code is stable:
   ```bash
   npm run lint
   npm run build
   npm run dev
   ```

2. Create git tag:
   ```bash
   git tag checkpoint-XXX-description
   ```

3. Copy `_checkpoint_template.md`

4. Rename: `checkpoint_[NUMBER]_[module]_[title].md`

5. Fill in content

6. Update this index file
