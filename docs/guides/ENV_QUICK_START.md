# Quick Start: Environment Setup

## 🚀 Fast Setup (2 phút)

### 1. Verify Files

Check file đã tồn tại:

```bash
✅ .env.development      # Single config file (dev + prod URLs)
✅ .env.local.example    # Template
✅ src/config/env.config.ts
✅ src/config/api.config.ts
```

### 2. (Optional) Create Local Override

```bash
# Copy template
cp .env.local.example .env.local

# Edit if cần override URLs cho local backend
# Ví dụ: VITE_DEV_CHAT_API_URL=http://localhost:5000
```

### 3. Run Project

```bash
# Development mode
npm run dev
# → Uses: https://vega-chat-api-dev.allianceitsc.com
# → Uses: https://vega-identity-api-dev.allianceitsc.com

# Production build
npm run build
# → Uses: https://vega-chat-api.allianceitsc.com
# → Uses: https://vega-identity-api.allianceitsc.com
```

---

## 📖 Sử dụng trong Code

```typescript
// Import config
import { API_ENDPOINTS } from "@/config/env.config";

// Use URLs (auto dev/prod)
const chatUrl = API_ENDPOINTS.chat;
const authUrl = API_ENDPOINTS.auth;
```

---

## 🔧 Build Commands

| Command             | Environment | URLs Used     |
| ------------------- | ----------- | ------------- |
| `npm run dev`       | Development | `VITE_DEV_*`  |
| `npm run build:dev` | Development | `VITE_DEV_*`  |
| `npm run build`     | Production  | `VITE_PROD_*` |

---

## ✅ Verification

```typescript
// Check trong browser console
import { ENV_CONFIG } from '@/config/env.config';
console.log(ENV_CONFIG);

// Output:
{
  mode: "development",
  isDevelopment: true,
  isProduction: false,
  api: {
    chat: "https://vega-chat-api-dev.allianceitsc.com",
    auth: "https://vega-identity-api-dev.allianceitsc.com",
    ...
  }
}
```

---

## 📚 Full Documentation

See [environment_configuration.md](environment_configuration.md) for details.
