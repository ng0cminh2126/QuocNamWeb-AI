# 📝 Prompt Template: Tạo TanStack Query Hook

> **Sử dụng khi:** Cần tạo hook để fetch data với TanStack Query

---

## Template cho useQuery (Single fetch)

```
## Task: Tạo hook [USE_HOOK_NAME]

### Context:
- API function: [functionName] từ src/api/[module].api.ts
- Query key: ['module', ...params]
- Params: [list params và types]

### Reference:
- API types: src/types/[module].ts
- Existing hooks: src/hooks/queries/[other].ts

### Yêu cầu:
1. Tạo file src/hooks/queries/[hookName].ts
2. Sử dụng useQuery từ @tanstack/react-query
3. Export query key factory (cho invalidation)
4. Export hook với proper TypeScript types
5. Options: staleTime = [X]ms

### Expected usage:
```typescript
const { data, isLoading, error } = use[HookName](param1, param2);
```
```

---

## Template cho useInfiniteQuery (Infinite scroll)

```
## Task: Tạo hook [USE_HOOK_NAME] với infinite scroll

### Context:
- API function: [functionName] từ src/api/[module].api.ts
- API trả về: { data: T[], hasMore: boolean, nextCursor?: string }
- Query key: ['module', ...params]

### Reference:
- API types: src/types/[module].ts

### Yêu cầu:
1. Tạo file src/hooks/queries/[hookName].ts
2. Sử dụng useInfiniteQuery từ @tanstack/react-query
3. Implement getNextPageParam dựa trên API response
4. Export query key factory
5. Export hook

### Expected usage:
```typescript
const { 
  data, 
  isLoading, 
  fetchNextPage, 
  hasNextPage,
  isFetchingNextPage 
} = use[HookName](groupId, workTypeId);

// Flatten pages để render
const items = data?.pages.flatMap(page => page.data) ?? [];
```
```

---

## Ví dụ: useMessages với infinite scroll

```
## Task: Tạo hook useMessages với infinite scroll

### Context:
- API function: getMessages từ src/api/messages.api.ts
- API trả về: { data: Message[], hasMore: boolean, oldestMessageId?: string }
- Query key: ['messages', 'list', groupId, workTypeId]

### Reference:
- API types: src/types/messages.ts

### Yêu cầu:
1. Tạo file src/hooks/queries/useMessages.ts
2. Sử dụng useInfiniteQuery
3. getNextPageParam: return oldestMessageId nếu hasMore = true
4. initialPageParam: undefined
5. staleTime: 30 seconds

### Expected structure:
```typescript
// Query keys factory
export const messagesKeys = {
  all: ['messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (groupId: string, workTypeId?: string) => 
    [...messagesKeys.lists(), groupId, workTypeId] as const,
};

// Hook
export function useMessages(groupId: string, workTypeId?: string) {
  return useInfiniteQuery({
    queryKey: messagesKeys.list(groupId, workTypeId),
    queryFn: ({ pageParam }) => getMessages(groupId, { workTypeId, before: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.oldestMessageId : undefined,
    initialPageParam: undefined,
    staleTime: 1000 * 30,
  });
}
```
```

---

## Checklist sau khi dùng prompt

- [ ] File được tạo đúng vị trí
- [ ] Query key factory exported
- [ ] Hook exported
- [ ] TypeScript không báo lỗi
- [ ] Test bằng cách gọi hook trong component
