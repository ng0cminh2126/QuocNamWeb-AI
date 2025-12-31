# 📝 Prompt Template: Integrate Component với Real API

> **Sử dụng khi:** Cần thay thế mock data bằng real API data trong component

---

## Template

```
## Task: Integrate [COMPONENT_NAME] với real API

### Current state:
- Component file: src/features/portal/[path]/[Component].tsx
- Đang dùng mock data từ: src/data/[mock].ts
- Mock data được pass qua props hoặc import trực tiếp

### Target state:
- Thay mock bằng hook: use[HookName] từ src/hooks/queries/[hook].ts
- Component tự fetch data

### Yêu cầu:
1. Remove mock data import
2. Import và sử dụng hook
3. Handle loading state:
   - Option A: Skeleton component
   - Option B: Spinner
   - Option C: Shimmer effect
4. Handle error state:
   - Show error message
   - Retry button
5. Handle empty state:
   - Friendly message khi không có data
6. Giữ nguyên UI/UX hiện tại cho normal state

### Props cần thay đổi (nếu có):
- Remove: [props không còn cần]
- Add: [props mới cần để fetch]

### Checklist:
- [ ] Remove mock import
- [ ] Add hook import  
- [ ] Add loading UI
- [ ] Add error UI
- [ ] Add empty UI
- [ ] Test với slow network (DevTools throttling)
- [ ] Test với network error
```

---

## Ví dụ: Integrate ChatMain với useMessages

```
## Task: Integrate ChatMain với real API

### Current state:
- Component file: src/features/portal/workspace/ChatMain.tsx
- Đang dùng: messages prop được pass từ PortalWireframes
- Mock data: mockMessagesByWorkType từ src/data/mockMessages.ts

### Target state:
- ChatMain tự fetch bằng useMessages hook
- Hỗ trợ infinite scroll (load thêm tin cũ)

### Yêu cầu:
1. Import useMessages từ src/hooks/queries/useMessages
2. Gọi hook với groupId và workTypeId (từ props)
3. Loading state: Skeleton messages (3-5 fake bubbles)
4. Error state: "Không thể tải tin nhắn. Thử lại"
5. Empty state: "Chưa có tin nhắn trong nhóm này"
6. Infinite scroll: 
   - Intersection Observer ở đầu list
   - Load more khi scroll lên
   - Show loading indicator khi fetching

### Props thay đổi:
- Remove: messages (không cần pass từ parent nữa)
- Keep: groupId, workTypeId, onSendMessage, ...

### Code structure gợi ý:
```typescript
function ChatMain({ groupId, workTypeId, ... }: ChatMainProps) {
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = useMessages(groupId, workTypeId);

  const messages = useMemo(() => 
    data?.pages.flatMap(p => p.data) ?? [], 
    [data]
  );

  // Infinite scroll setup
  const loadMoreRef = useRef(null);
  // ... intersection observer logic

  if (isLoading) return <MessagesSkeleton />;
  if (isError) return <MessagesError onRetry={refetch} />;
  if (messages.length === 0) return <MessagesEmpty />;

  return (
    <div>
      {hasNextPage && (
        <div ref={loadMoreRef}>
          {isFetchingNextPage && <LoadingSpinner />}
        </div>
      )}
      {messages.map(msg => <MessageBubble key={msg.id} {...msg} />)}
    </div>
  );
}
```
```

---

## Ví dụ: Integrate RightPanel Tasks với useTasks

```
## Task: Integrate RightPanel tasks section với real API

### Current state:
- Component: src/features/portal/workspace/RightPanel.tsx
- Đang dùng: tasks prop từ parent
- Mock: mockTasks từ src/data/mockTasks.ts

### Target state:
- Dùng useTasks hook để fetch
- Filter theo groupId và workTypeId

### Yêu cầu:
1. Import useTasks từ src/hooks/queries/useTasks
2. Fetch với params: { groupId, workTypeId, status: ['todo', 'in_progress'] }
3. Loading: Skeleton cards
4. Error: Error message với retry
5. Empty: "Không có task nào"

### Keep existing:
- Task card UI
- Status badges
- Checklist progress
- Click to expand
```

---

## Checklist sau khi integrate

- [ ] Mock import removed
- [ ] Hook imported and called
- [ ] Loading state renders correctly
- [ ] Error state with retry button works
- [ ] Empty state shows friendly message
- [ ] Normal state preserves existing UI
- [ ] No TypeScript errors
- [ ] Test with DevTools Network throttling (Slow 3G)
- [ ] Test with Network offline
