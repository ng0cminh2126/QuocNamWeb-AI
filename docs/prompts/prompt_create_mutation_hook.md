# 📝 Prompt Template: Tạo Mutation Hook

> **Sử dụng khi:** Cần tạo hook để thực hiện create/update/delete operations

---

## Template cơ bản

```
## Task: Tạo mutation hook [USE_HOOK_NAME]

### Context:
- API function: [functionName] từ src/api/[module].api.ts
- Request type: [RequestType]
- Response type: [ResponseType]

### Sau khi mutation thành công cần:
- Invalidate queries: [list query keys]
- Show toast: [success message]

### Reference:
- API types: src/types/[module].ts
- Query keys: src/hooks/queries/[module].ts

### Yêu cầu:
1. Tạo file src/hooks/mutations/[hookName].ts
2. Sử dụng useMutation từ @tanstack/react-query
3. Implement onSuccess: invalidate queries + show toast
4. Implement onError: show error toast
5. Return: { mutate, mutateAsync, isPending, isError }

### Expected usage:
```typescript
const { mutate, isPending } = use[HookName]();

const handleSubmit = () => {
  mutate(payload, {
    onSuccess: () => {
      // Additional success handling
    }
  });
};
```
```

---

## Template với Optimistic Updates

```
## Task: Tạo mutation hook [USE_HOOK_NAME] với optimistic update

### Context:
- API function: [functionName] từ src/api/[module].api.ts  
- Query to update optimistically: [queryKey]
- Cách update cache: [mô tả logic update]

### Yêu cầu:
1. Tạo file src/hooks/mutations/[hookName].ts
2. Implement onMutate:
   - Cancel outgoing queries
   - Snapshot previous data
   - Optimistically update cache
3. Implement onError: rollback to snapshot
4. Implement onSettled: invalidate để sync

### Expected structure:
```typescript
export function use[HookName]() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiFunction,
    
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [...] });
      const previousData = queryClient.getQueryData([...]);
      
      queryClient.setQueryData([...], (old) => {
        // Update logic
      });
      
      return { previousData };
    },
    
    onError: (err, newData, context) => {
      queryClient.setQueryData([...], context?.previousData);
      toast.error('Có lỗi xảy ra');
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...] });
    },
  });
}
```
```

---

## Ví dụ: useSendMessage

```
## Task: Tạo mutation hook useSendMessage

### Context:
- API function: sendMessage từ src/api/messages.api.ts
- Request: { groupId, type, content?, fileIds?, replyToId? }
- Response: Message (tin nhắn vừa tạo)

### Sau khi mutation thành công:
- Invalidate: messagesKeys.list(groupId, workTypeId)
- Show toast: "Đã gửi tin nhắn"

### Yêu cầu:
1. Tạo file src/hooks/mutations/useSendMessage.ts
2. Optimistic update: thêm message vào cuối list ngay lập tức
3. Rollback nếu lỗi
4. Invalidate sau khi complete

### Parameters hook cần nhận:
- groupId: string (để biết invalidate query nào)
- workTypeId?: string
```

---

## Ví dụ: useUpdateTaskStatus

```
## Task: Tạo mutation hook useUpdateTaskStatus

### Context:
- API function: updateTask từ src/api/tasks.api.ts
- Request: { taskId, status }
- Response: Task (task đã update)

### Sau khi mutation thành công:
- Invalidate: tasksKeys.list(), tasksKeys.detail(taskId)
- Show toast theo status:
  - "in_progress" → "Đã bắt đầu xử lý"
  - "awaiting_review" → "Đã gửi yêu cầu duyệt"
  - "done" → "Đã hoàn thành"

### Yêu cầu:
1. Tạo file src/hooks/mutations/useUpdateTaskStatus.ts
2. Optimistic update status trong cache
3. Rollback nếu lỗi
```

---

## Checklist sau khi dùng prompt

- [ ] File được tạo đúng vị trí
- [ ] onSuccess invalidates correct queries
- [ ] onError shows error message
- [ ] Optimistic update works (nếu có)
- [ ] Rollback works (nếu có optimistic update)
- [ ] TypeScript không báo lỗi
