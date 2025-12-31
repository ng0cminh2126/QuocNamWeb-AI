# 📝 Prompt Template: Tạo API Client Function

> **Sử dụng khi:** Cần tạo API client function mới cho một module

---

## Template

```
## Task: Tạo API client function cho [MODULE_NAME]

### Context:
- API Endpoint: [METHOD] [URL]
- Request type: [RequestTypeName hoặc inline definition]
- Response type: [ResponseTypeName hoặc inline definition]
- Authentication: Bearer token (đã setup trong src/api/client.ts)

### Reference files:
- Types đã define: src/types/[module].ts
- Existing API pattern: src/api/[other].api.ts

### Yêu cầu:
1. Tạo file src/api/[module].api.ts
2. Export các functions: [list tên functions]
3. Sử dụng axios instance từ src/api/client.ts
4. Có proper TypeScript types cho request và response
5. Handle query params nếu có

### Expected file structure:
```typescript
// src/api/[module].api.ts
import { apiClient } from './client';
import type { RequestType, ResponseType } from '@/types/[module]';

export async function functionName(params: RequestType): Promise<ResponseType> {
  const { data } = await apiClient.get('/endpoint', { params });
  return data;
}
```
```

---

## Ví dụ sử dụng

```
## Task: Tạo API client function cho Messages

### Context:
- API Endpoint: GET /api/groups/:groupId/messages
- Query params: workTypeId?, before?, limit?
- Response type: MessagesResponse { data: Message[], hasMore: boolean, oldestMessageId?: string }
- Authentication: Bearer token

### Reference files:
- Types đã define: src/types/messages.ts
- Existing API pattern: src/api/auth.api.ts

### Yêu cầu:
1. Tạo file src/api/messages.api.ts
2. Export: getMessages, sendMessage, pinMessage, getPinnedMessages
3. Sử dụng axios instance từ src/api/client.ts
4. Có proper TypeScript types

### Expected usage:
```typescript
const response = await getMessages('grp_vh_kho', { 
  workTypeId: 'wt_nhan_hang',
  limit: 50 
});
```
```

---

## Checklist sau khi dùng prompt

- [ ] File được tạo đúng vị trí
- [ ] TypeScript không báo lỗi
- [ ] Import/export đúng
- [ ] Types match với API specification
