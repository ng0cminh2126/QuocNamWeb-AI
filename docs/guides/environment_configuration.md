# Environment Configuration Guide

> **Created:** 2025-12-29  
> **Status:** ✅ IMPLEMENTED

---

## 📋 Overview

Dự án sử dụng **unified environment configuration** với một file `.env` duy nhất chứa cấu hình cho cả dev và production.

### Key Features

- ✅ Single `.env.development` file chứa TOÀN BỘ config
- ✅ Auto-switch URLs dựa trên build mode
- ✅ Type-safe configuration với TypeScript
- ✅ Easy build commands

---

## 📂 File Structure

```
├── .env.development          # Single config file (DEV + PROD URLs)
├── .env.local.example        # Template for local overrides
├── .env.local                # Local overrides (gitignored)
│
├── src/config/
│   ├── env.config.ts         # Environment detection + API endpoints
│   └── api.config.ts         # Service-specific configurations
```

---

## 🔧 Environment Variables

### `.env.development` (Single Config File)

```env
# Environment auto-detected by Vite --mode flag
# VITE_APP_ENV=development  # Optional override

# ==========================================
# DEVELOPMENT ENVIRONMENT
# ==========================================
VITE_DEV_CHAT_API_URL=https://vega-chat-api-dev.allianceitsc.com
VITE_DEV_AUTH_API_URL=https://vega-identity-api-dev.allianceitsc.com
VITE_DEV_TASK_API_URL=https://vega-task-api-dev.allianceitsc.com

# ==========================================
# PRODUCTION ENVIRONMENT
# ==========================================
VITE_PROD_CHAT_API_URL=https://vega-chat-api.allianceitsc.com
VITE_PROD_AUTH_API_URL=https://vega-identity-api.allianceitsc.com
VITE_PROD_TASK_API_URL=https://vega-task-api.allianceitsc.com
```

---

## 🚀 Build Commands

### Development Mode

```bash
# Run dev server (development URLs)
npm run dev

# Build for development testing
npm run build:dev
```

→ Sử dụng URLs từ `VITE_DEV_*`

### Production Mode

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

→ Sử dụng URLs từ `VITE_PROD_*`

---

## 📖 Usage in Code

### Import Config

```typescript
import { API_ENDPOINTS, ENV_INFO, FEATURE_FLAGS } from "@/config/env.config";
import { CHAT_API_CONFIG, AUTH_API_CONFIG } from "@/config/api.config";
```

### Access API Endpoints

```typescript
// Auto-selected based on environment
console.log(API_ENDPOINTS.chat); // dev: https://vega-chat-api-dev...
// prod: https://vega-chat-api...

console.log(API_ENDPOINTS.auth); // dev: https://vega-identity-api-dev...
// prod: https://vega-identity-api...

// Check environment
if (ENV_INFO.isDevelopment) {
  console.log("Running in development");
}

if (ENV_INFO.isProduction) {
  console.log("Running in production");
}
```

### Use in API Clients

```typescript
import { CHAT_API_CONFIG } from "@/config/api.config";
import axios from "axios";

const chatClient = axios.create({
  baseURL: CHAT_API_CONFIG.baseURL, // Auto: dev or prod
  timeout: CHAT_API_CONFIG.timeout,
});
```

---

## 🔄 How It Works

### Tổng Quan - Luồng Hoạt Động

```
.env.development  →  env.config.ts  →  api.config.ts  →  apiClient.ts  →  Components
     ↓                    ↓                  ↓                ↓              ↓
  URLs DEV/PROD    Auto Detect Env   Service Config    Axios Instance   Use API
```

### 1. Environment Detection

```typescript
// src/config/env.config.ts
const APP_ENV = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;
const isDevelopment = APP_ENV === "development";
const isProduction = APP_ENV === "production";
```

**Cách hoạt động:**

- Khi chạy `npm run dev` → MODE = "development"
- Khi chạy `npm run build` → MODE = "production"

### 2. Auto URL Selection

```typescript
const DEV_API_ENDPOINTS = {
  chat: import.meta.env.VITE_DEV_CHAT_API_URL || "fallback-url",
  auth: import.meta.env.VITE_DEV_AUTH_API_URL || "fallback-url",
  task: import.meta.env.VITE_DEV_TASK_API_URL || "fallback-url",
};

const PROD_API_ENDPOINTS = {
  chat: import.meta.env.VITE_PROD_CHAT_API_URL || "fallback-url",
  auth: import.meta.env.VITE_PROD_AUTH_API_URL || "fallback-url",
  task: import.meta.env.VITE_PROD_TASK_API_URL || "fallback-url",
};

// TỰ ĐỘNG chọn DEV hay PROD dựa trên environment
export const API_ENDPOINTS = isProduction
  ? PROD_API_ENDPOINTS
  : DEV_API_ENDPOINTS;
```

**Ví dụ:**

- Development mode: `API_ENDPOINTS.chat` = `https://vega-chat-api-dev.allianceitsc.com`
- Production mode: `API_ENDPOINTS.chat` = `https://vega-chat-api.allianceitsc.com`

### 3. Service-Specific Configuration

```typescript
// src/config/api.config.ts
import { API_ENDPOINTS } from "./env.config";

export const CHAT_API_CONFIG = {
  baseURL: API_ENDPOINTS.chat, // TỰ ĐỘNG dev/prod
  timeout: 30000,
  retries: 3,
};

export const AUTH_API_CONFIG = {
  baseURL: API_ENDPOINTS.auth, // TỰ ĐỘNG dev/prod
  timeout: 15000,
  retries: 2,
};
```

**Lợi ích:** Mỗi service có thể có timeout/retry khác nhau

### 4. Export for Use

```typescript
export const ENV_CONFIG = {
  mode: APP_ENV,
  isDevelopment,
  isProduction,
  api: API_ENDPOINTS,
  features: FEATURE_FLAGS,
};
```

---

## 📊 Chi Tiết Luồng Hoạt Động

### Scenario 1: Development Mode (`npm run dev`)

```
1. Vite load files theo thứ tự:
   .env.local (nếu có) → .env.development → .env

2. Vite set MODE = "development"

3. env.config.ts detect:
   - APP_ENV = "development"
   - isProduction = false
   - isDevelopment = true

4. Chọn URLs:
   API_ENDPOINTS = DEV_API_ENDPOINTS
   ├─ chat: https://vega-chat-api-dev.allianceitsc.com
   ├─ auth: https://vega-identity-api-dev.allianceitsc.com
   └─ task: https://vega-task-api-dev.allianceitsc.com

5. api.config.ts import:
   CHAT_API_CONFIG.baseURL = API_ENDPOINTS.chat
   → https://vega-chat-api-dev.allianceitsc.com

6. Component sử dụng:
   import { CHAT_API_CONFIG } from '@/config/api.config';
   const client = axios.create({ baseURL: CHAT_API_CONFIG.baseURL });
   → Gọi API tới dev server
```

### Scenario 2: Production Mode (`npm run build`)

```
1. Vite load .env.development (không load .env.local khi build)

2. Vite set MODE = "production"

3. env.config.ts detect:
   - APP_ENV = "production"
   - isProduction = true
   - isDevelopment = false

4. Chọn URLs:
   API_ENDPOINTS = PROD_API_ENDPOINTS
   ├─ chat: https://vega-chat-api.allianceitsc.com
   ├─ auth: https://vega-identity-api.allianceitsc.com
   └─ task: https://vega-task-api.allianceitsc.com

5. Build output hard-codes production URLs vào bundle

6. Deploy lên server → App tự động gọi production APIs
```

### Scenario 3: Local Override với `.env.local`

```
File .env.local:
VITE_DEV_CHAT_API_URL=http://localhost:5000

Kết quả khi npm run dev:
├─ API_ENDPOINTS.chat = http://localhost:5000 (OVERRIDDEN)
├─ API_ENDPOINTS.auth = https://vega-identity-api-dev.allianceitsc.com (default)
└─ API_ENDPOINTS.task = https://vega-task-api-dev.allianceitsc.com (default)

Lợi ích: Dev test local backend mà không ảnh hưởng team khác
```

---

## ✨ Ưu Điểm của Hệ Thống

| Feature                    | Benefit                                    | Example                                |
| -------------------------- | ------------------------------------------ | -------------------------------------- |
| **Single Source of Truth** | Chỉ cần maintain 1 file `.env.development` | Thay đổi URL chỉ cần edit 1 chỗ        |
| **Auto Switching**         | Không cần manually change URLs khi build   | `npm run build` tự động dùng prod URLs |
| **Type Safety**            | TypeScript autocomplete & validation       | IDE suggest `API_ENDPOINTS.chat`       |
| **Local Override**         | Dev test local mà không ảnh hưởng team     | `.env.local` gitignored                |
| **Rollback Friendly**      | Dễ dàng revert nếu URLs sai                | Git revert 1 commit                    |
| **Service Isolation**      | Mỗi service có config riêng                | Chat timeout 30s, Auth timeout 15s     |

---

## 🔧 Local Development Overrides

Tạo `.env.local` để override URLs cho local testing:

```env
# Override cho local backend
VITE_DEV_CHAT_API_URL=http://localhost:5000
VITE_DEV_AUTH_API_URL=http://localhost:5001
```

> ⚠️ **Note:** `.env.local` được gitignored, không bao giờ commit

---

## 📊 Environment Matrix

| Mode        | Command             | File Used          | URLs Used     |
| ----------- | ------------------- | ------------------ | ------------- |
| Development | `npm run dev`       | `.env.development` | `VITE_DEV_*`  |
| Dev Build   | `npm run build:dev` | `.env.development` | `VITE_DEV_*`  |
| Production  | `npm run build`     | `.env.production`  | `VITE_PROD_*` |

---

## ✅ Validation

Runtime validation tự động check:

```typescript
// Kiểm tra trong env.config.ts
if (!API_ENDPOINTS.chat) {
  console.error("❌ Missing Chat API URL");
}

if (!API_ENDPOINTS.auth) {
  console.error("❌ Missing Auth API URL");
}
```

---

## 🧪 Testing

### Verify Current Config

```typescript
import { ENV_CONFIG } from "@/config/env.config";

console.log("Environment:", ENV_CONFIG.mode);
console.log("Chat API:", ENV_CONFIG.api.chat);
console.log("Auth API:", ENV_CONFIG.api.auth);
console.log("Is Production:", ENV_CONFIG.isProduction);
```

### Debug Logs (Development Only)

Environment config tự động log trong development mode:

```
🔧 Environment Configuration
  Environment: development
  API Endpoints: {
    chat: "https://vega-chat-api-dev.allianceitsc.com",
    auth: "https://vega-identity-api-dev.allianceitsc.com",
    task: "https://vega-task-api-dev.allianceitsc.com"
  }
  Feature Flags: { ... }
```

---

## 🔐 Security

### DO's ✅

- ✅ Commit `.env.development` (chứa tất cả URLs)
- ✅ Commit `.env.local.example` (template)

### DON'Ts ❌

- ❌ KHÔNG commit `.env.local` (personal overrides)
- ❌ KHÔNG commit sensitive tokens/passwords
- ❌ KHÔNG hardcode URLs trong code

---

## 📝 Adding New Service

1. **Update `.env.development`:**

```env
# New Service (Development)
VITE_DEV_NEWSERVICE_API_URL=https://new-service-dev.example.com

# New Service (Production)
VITE_PROD_NEWSERVICE_API_URL=https://new-service.example.com
```

2. **Update `env.config.ts`:**

```typescript
interface ApiEndpoints {
  chat: string;
  auth: string;
  task: string;
  newService: string; // Add this
}

const DEV_API_ENDPOINTS: ApiEndpoints = {
  // ...existing
  newService: import.meta.env.VITE_DEV_NEWSERVICE_API_URL || "",
};

const PROD_API_ENDPOINTS: ApiEndpoints = {
  // ...existing
  newService: import.meta.env.VITE_PROD_NEWSERVICE_API_URL || "",
};
```

3. **Update `api.config.ts`:**

```typescript
export const NEWSERVICE_API_CONFIG: ServiceConfig = {
  baseURL: API_ENDPOINTS.newService,
  timeout: 30000,
  retries: 3,
};
```

---

## 🚨 Troubleshooting

### Issue: URLs không switch khi build production

**Solution:** Check `package.json` scripts có `--mode production` không

```json
"build": "vite build --mode production"  // ✅ Correct
"build": "vite build"                     // ❌ Wrong (uses dev mode)
```

### Issue: `undefined` URLs

**Solution:** Check environment variable naming:

```env
VITE_DEV_CHAT_API_URL=...   # ✅ Correct prefix: VITE_
DEV_CHAT_API_URL=...         # ❌ Missing VITE_ prefix
```

### Issue: `.env.local` không work

**Solution:**

1. Restart dev server sau khi tạo `.env.local`
2. Check file không có typo trong tên

---

## 📚 Related Files

- [.env.development](../../.env.development)
- [.env.production](../../.env.production)
- [.env.local.example](../../.env.local.example)
- [src/config/env.config.ts](../../src/config/env.config.ts)
- [src/config/api.config.ts](../../src/config/api.config.ts)

---

**Last Updated:** 2025-12-29  
**Maintained By:** Dev Team
