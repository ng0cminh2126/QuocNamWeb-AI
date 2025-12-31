# 🔐 Auth Module

> **Mục đích:** Xử lý authentication và authorization  
> **Version:** v1.0  
> **Last Updated:** 2025-12-26

---

## 📁 Module Structure

```
auth/
├── README.md                 # This file - Module overview
├── _changelog.md             # Version history & changes
├── api-spec.md               # API reference tổng hợp
│
├── features/                 # Feature specifications
│   ├── _template.md          # Template cho feature mới
│   ├── login.md              # ✅ Login cơ bản (v1)
│   ├── login-otp.md          # 📋 Login + OTP (planned v2)
│   └── forgot-password.md    # 📋 Forgot password (planned)
│
└── snapshots/                # API response snapshots
    ├── README.md             # Hướng dẫn chung
    ├── login/
    │   ├── v1/               # Snapshots cho login v1
    │   │   ├── README.md
    │   │   ├── success.json
    │   │   └── error_*.json
    │   └── v2/               # Snapshots cho login v2 (OTP)
    ├── login-otp/
    └── forgot-password/
```

---

## 🎯 Features Roadmap

| Feature | ID | Version | Status | Spec | Snapshots |
|---------|-----|---------|--------|------|-----------|
| **Login** (basic) | AUTH-001 | v1.0 | ⏳ Pending Snapshots | [✅ login.md](./features/login.md) | [⬜ v1/](./snapshots/login/v1/) |
| **Login + OTP** | AUTH-002 | v2.0 | 📋 Planned | ⬜ login-otp.md | ⬜ |
| **Forgot Password** | AUTH-003 | v1.0 | 📋 Planned | ⬜ forgot-password.md | ⬜ |
| **Remember Me** | AUTH-001 | v1.1 | 📋 Planned | (in login.md) | ⬜ |

### Status Legend
| Icon | Meaning |
|------|---------|
| ✅ | Done / Ready |
| ⏳ | Pending (waiting for HUMAN) |
| 🚧 | In Progress |
| 📋 | Planned |
| ⬜ | Not Started |

---

## 📦 Implementation Files (When Done)

```
src/
├── api/
│   └── auth.api.ts              # API client functions
├── hooks/
│   ├── mutations/
│   │   ├── useLogin.ts          # Login mutation
│   │   ├── useLogout.ts         # Logout mutation
│   │   └── useRefreshToken.ts   # Refresh token mutation
│   └── queries/
│       └── useCurrentUser.ts    # Get current user query
├── stores/
│   └── authStore.ts             # ✅ Đã có (Phase 1)
├── pages/
│   └── LoginPage.tsx            # Login page
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       └── ...
└── types/
    └── auth.ts                  # ✅ Đã có (Phase 1)
```

---

## 📋 Quick Links

- [📜 Changelog](./_changelog.md)
- [📝 Feature Template](./features/_template.md)
- [🔐 Login Spec](./features/login.md)
- [📁 Snapshots Guide](./snapshots/README.md)

---

## ⚠️ Current Blockers

| # | Blocker | Feature | Cần từ | Status |
|---|---------|---------|--------|--------|
| 1 | API Snapshots | Login | HUMAN | ⬜ Chưa có |
| 2 | API base URL | All | HUMAN | ⬜ Chưa confirm |
| 3 | Token storage strategy | All | HUMAN | ⬜ Chưa quyết định |

---

## 🔄 How to Add New Feature

1. Copy `features/_template.md` → `features/[feature-name].md`
2. Fill in the specification
3. Create `snapshots/[feature-name]/v1/` folder
4. Add snapshots
5. Update this README's roadmap
6. Update `_changelog.md`
7. Request AI to implement
