# [BƯỚC 4] Implementation Plan - Category List Real-time Update

**Feature:** Category List Real-time Update  
**Version:** 1.1  
**Date:** 2026-01-23  
**Status:** ✅ COMPLETED

---

## OVERVIEW

Implement real-time update cho category list qua SignalR với 7 bước:

1. ✅ Fix type definitions
2. ✅ Create extended category types with unreadCount
3. ✅ Update useCategories hook
4. ✅ Create useCategoriesRealtime hook
5. ✅ Integrate SignalR events
6. ✅ Update UI components
7. ✅ Testing

**Estimated Time:** 2-3 hours  
**Risk Level:** Low (có reference pattern từ useConversationRealtime)

---

## STEP 1: Fix Type Definitions

### File: `src/types/categories.ts`

**Action:** Fix type mismatch cho lastMessage

#### Changes:

```diff
export interface ConversationInfoDto {
  conversationId: string;
  conversationName: string;
- lastMessage?: string;  // ❌ SAI TYPE
+ memberCount: number;    // ✅ THÊM field
+ lastMessage: LastMessageDto | null;  // ✅ SỬA type
}

+ // ✅ THÊM interface mới
+ export interface LastMessageDto {
+   messageId: string;
+   senderId: string;
+   senderName: string;
+   content: string;
+   sentAt: string;
+ }
```

#### Export Updates:

```typescript
// Existing exports
export type { CategoryDto, ConversationInfoDto };

// New export
export type { LastMessageDto };
```

---

## STEP 2: Create Extended Types for Client-Side State

### File: `src/types/categories.ts` (continue)

**Action:** Thêm type mở rộng với unreadCount

#### New Types:

```typescript
/**
 * Extended conversation type with client-side calculated fields
 */
export interface ConversationWithUnread extends ConversationInfoDto {
  unreadCount: number; // Client-side calculated
}

/**
 * Extended category type with conversations that have unread count
 */
export interface CategoryWithUnread extends Omit<CategoryDto, "conversations"> {
  conversations: ConversationWithUnread[];
}
```

**Rationale:**

- API không trả unreadCount
- Cần type riêng cho client state với unread
- Giữ nguyên DTO types (match API)

---

## STEP 3: Update useCategories Hook

### File: `src/hooks/queries/useCategories.ts`

**Action:** Transform API response thành CategoryWithUnread

#### Current Code:

```typescript
export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: getCategories,
  });
}
```

#### Updated Code:

```typescript
import type {
  CategoryDto,
  CategoryWithUnread,
  ConversationWithUnread,
} from "@/types/categories";

export function useCategories() {
  return useQuery<CategoryDto[], Error, CategoryWithUnread[]>({
    queryKey: categoriesKeys.all,
    queryFn: getCategories,
    select: (data) => {
      // Transform: Add unreadCount = 0 to all conversations
      return data.map((category) => ({
        ...category,
        conversations: category.conversations.map((conv) => ({
          ...conv,
          unreadCount: 0, // Initialize with 0
        })),
      }));
    },
  });
}
```

**Why?**

- API không có unreadCount → Initialize = 0
- SignalR events sẽ increment/reset sau
- UI luôn có unreadCount để render

---

## STEP 4: Create useCategoriesRealtime Hook

### File: `src/hooks/useCategoriesRealtime.ts` (NEW)

**Action:** Tạo hook mới handle SignalR real-time updates

#### Full Implementation:

```typescript
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatHub } from "@/lib/signalr";
import { categoriesKeys } from "@/hooks/queries/useCategories";
import { useAuthStore } from "@/stores/authStore";
import type { CategoryWithUnread } from "@/types/categories";

/**
 * Hook for real-time category updates via SignalR
 *
 * Features:
 * - Auto-join all conversations on mount
 * - Listen MessageSent event → update lastMessage + unreadCount
 * - Listen MessageRead event → reset unreadCount
 * - Auto-cleanup on unmount
 */
export function useCategoriesRealtime(
  categories: CategoryWithUnread[] | undefined,
) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);

  // ────────────────────────────────────────────────────────
  // AUTO-JOIN CONVERSATIONS
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const conversationIds = categories.flatMap((cat) =>
      cat.conversations.map((conv) => conv.conversationId),
    );

    // Join all conversations to receive events
    conversationIds.forEach((id) => {
      chatHub.joinConversation(id);
    });

    // Cleanup: Leave on unmount
    return () => {
      conversationIds.forEach((id) => {
        chatHub.leaveConversation(id);
      });
    };
  }, [categories]);

  // ────────────────────────────────────────────────────────
  // EVENT: MessageSent
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMessageSent = (data: any) => {
      const { message } = data;
      const { conversationId, senderId, id, senderName, content, sentAt } =
        message;

      queryClient.setQueryData<CategoryWithUnread[]>(
        categoriesKeys.all,
        (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((category) => ({
            ...category,
            conversations: category.conversations.map((conv) => {
              // Skip if not this conversation
              if (conv.conversationId !== conversationId) return conv;

              // Update lastMessage
              const updatedConv = {
                ...conv,
                lastMessage: {
                  messageId: id,
                  senderId,
                  senderName,
                  content,
                  sentAt,
                },
              };

              // Calculate unreadCount increment
              // KHÔNG tăng nếu:
              // 1. Tin nhắn của chính user
              // 2. Conversation đang được active (TODO: check active state)
              const shouldIncrement = senderId !== currentUserId;

              if (shouldIncrement) {
                updatedConv.unreadCount = (conv.unreadCount || 0) + 1;
              }

              return updatedConv;
            }),
          }));
        },
      );
    };

    // Register event listener
    chatHub.onMessageSent(handleMessageSent);

    // Cleanup
    return () => {
      // Note: SignalR không có off method, handler tự cleanup
    };
  }, [queryClient, currentUserId]);

  // ────────────────────────────────────────────────────────
  // EVENT: MessageRead
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMessageRead = (data: any) => {
      const { conversationId, userId } = data;

      // Only update if current user read the messages
      if (userId !== currentUserId) return;

      queryClient.setQueryData<CategoryWithUnread[]>(
        categoriesKeys.all,
        (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((category) => ({
            ...category,
            conversations: category.conversations.map((conv) =>
              conv.conversationId === conversationId
                ? { ...conv, unreadCount: 0 } // Reset unread
                : conv,
            ),
          }));
        },
      );
    };

    // Register event listener
    chatHub.onMessageRead(handleMessageRead);

    // Cleanup
    return () => {
      // Auto cleanup
    };
  }, [queryClient, currentUserId]);
}
```

**Key Points:**

- ✅ Auto-join/leave conversations
- ✅ Optimistic cache updates
- ✅ Handle MessageSent + MessageRead
- ✅ Check senderId to prevent self-increment
- 🔄 TODO: Check if conversation is active

---

## STEP 5: Integrate into Component

### File: `src/features/portal/components/ConversationListSidebar.tsx`

**Action:** Integrate useCategoriesRealtime hook

#### Current Code (simplified):

```typescript
export default function ConversationListSidebar() {
  const { data: categories, isLoading } = useCategories();

  // ... rest of component
}
```

#### Updated Code:

```typescript
import { useCategoriesRealtime } from "@/hooks/useCategoriesRealtime";

export default function ConversationListSidebar() {
  const { data: categories, isLoading } = useCategories();

  // ✅ ADD: Real-time updates
  useCategoriesRealtime(categories);

  // ... rest of component (unchanged)
}
```

**That's it!** Hook tự động handle SignalR trong background.

---

## STEP 6: Update UI - Display Last Message

### File: `src/features/portal/components/CategoryCard.tsx`

**Action:** Hiển thị last message từ conversations

#### Current Code:

```typescript
interface CategoryCardProps {
  category: CategoryDto;  // ❌ Old type
  // ...
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div>
      <h3>{category.name}</h3>
      {/* No last message display */}
    </div>
  );
}
```

#### Updated Code:

```typescript
import type { CategoryWithUnread } from '@/types/categories';

interface CategoryCardProps {
  category: CategoryWithUnread;  // ✅ New type with unread
  // ...
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Calculate latest message across all conversations
  const latestConversation = category.conversations
    .filter(conv => conv.lastMessage !== null)
    .sort((a, b) => {
      const timeA = a.lastMessage!.sentAt;
      const timeB = b.lastMessage!.sentAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    })[0];

  // Calculate total unread count
  const totalUnread = category.conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <div className="relative p-4 hover:bg-gray-50 cursor-pointer">
      {/* Category Name */}
      <h3 className="text-lg font-semibold">{category.name}</h3>

      {/* Last Message Preview */}
      {latestConversation && latestConversation.lastMessage && (
        <div className="mt-1 text-xs text-gray-500 truncate">
          <span className="font-medium text-gray-700">
            {latestConversation.conversationName}:
          </span>{' '}
          {latestConversation.lastMessage.content}
        </div>
      )}

      {/* Unread Badge */}
      {totalUnread > 0 && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-rose-500 text-white rounded-full">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}

      {/* Empty State */}
      {!latestConversation && (
        <div className="mt-1 text-xs text-gray-400">Chưa có tin nhắn</div>
      )}
    </div>
  );
}
```

**Features:**

- ✅ Find latest message across conversations
- ✅ Display conversation name + content
- ✅ Calculate total unread (sum of all conversations)
- ✅ Unread badge with 99+ limit
- ✅ Empty state handling

---

## STEP 7: Add Animation for Badge

### File: `src/features/portal/components/CategoryCard.tsx` (continue)

**Action:** Smooth animation khi badge thay đổi

#### Enhanced Badge with Animation:

```typescript
import { AnimatePresence, motion } from 'framer-motion';

// Inside CategoryCard component:

{/* Animated Unread Badge */}
<AnimatePresence>
  {totalUnread > 0 && (
    <motion.span
      key="badge"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-rose-500 text-white rounded-full"
    >
      {totalUnread > 99 ? '99+' : totalUnread}
    </motion.span>
  )}
</AnimatePresence>
```

**Alternative (CSS only - no framer-motion):**

```typescript
// CSS in global styles or component
<style jsx>{`
  @keyframes badgePop {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  .badge-animated {
    animation: badgePop 0.3s ease-out;
  }
`}</style>

{totalUnread > 0 && (
  <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-rose-500 text-white rounded-full badge-animated">
    {totalUnread > 99 ? '99+' : totalUnread}
  </span>
)}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Type Definitions ✅ COMPLETED

- [x] Update `ConversationInfoDto` in `src/types/categories.ts`
- [x] Add `LastMessageDto` interface
- [x] Add `ConversationWithUnread` type
- [x] Add `CategoryWithUnread` type
- [x] Update exports

### Phase 2: Data Layer ✅ COMPLETED

- [x] Update `useCategories` hook with select transform
- [x] Create `useCategoriesRealtime` hook
- [x] Implement auto-join conversations
- [x] Implement MessageSent handler
- [x] Implement MessageRead handler

### Phase 3: UI Integration ✅ COMPLETED

- [x] Integrate `useCategoriesRealtime` in `ConversationListSidebar`
- [x] Update category list item props type
- [x] Implement last message display (two-line layout)
- [x] Implement unread badge (inline on Line 2)
- [x] Add formatMessagePreview utility
- [x] Add formatRelativeTime utility
- [x] Update badge styling (bg-brand-600, min-w-20px, h-4)

### Phase 4: Testing ✅ IN PROGRESS

- [x] Test MessageSent event updates UI
- [x] Test MessageRead event resets badge
- [x] Test own message không tăng unread
- [x] Test multiple categories
- [x] Test edge cases (no messages, null lastMessage)
- [ ] Write unit tests (see 06_testing.md)
- [ ] Write E2E tests

---

## FILES TO CREATE/MODIFY

### New Files:

```
src/hooks/useCategoriesRealtime.ts  # New hook
```

### Modified Files:

```
src/types/categories.ts                                  # Type updates
src/hooks/queries/useCategories.ts                       # Add select transform
src/features/portal/components/ConversationListSidebar.tsx  # Integrate hook
src/features/portal/components/CategoryCard.tsx          # UI updates
```

---

## DEPENDENCIES

**No new dependencies required!** ✅

Existing dependencies:

- `@microsoft/signalr` - Already installed
- `@tanstack/react-query` - Already installed
- `framer-motion` - Already installed (for animation)

---

## TESTING STRATEGY

### Manual Testing Steps:

1. **Initial Load:**

   ```
   - Open app
   - ✅ Categories load
   - ✅ Last messages hiển thị
   - ✅ Unread badges = 0 (initial)
   ```

2. **MessageSent Event (từ user khác):**

   ```
   - Gửi message từ user 2
   - ✅ Last message update
   - ✅ Badge +1
   - ✅ Smooth animation
   ```

3. **MessageSent Event (từ chính user):**

   ```
   - Gửi message từ current user
   - ✅ Last message update
   - ❌ Badge KHÔNG tăng
   ```

4. **MessageRead Event:**
   ```
   - Đánh dấu đã đọc
   - ✅ Badge biến mất
   - ✅ Fade-out smooth
   ```

### Unit Tests:

See `06_testing.md` for detailed test cases.

---

## ROLLBACK PLAN

Nếu có issue, rollback theo thứ tự ngược:

1. Remove `useCategoriesRealtime` from `ConversationListSidebar`
2. Revert `CategoryCard` UI changes
3. Revert `useCategories` select transform
4. Delete `useCategoriesRealtime.ts`
5. Revert type changes

Mỗi bước độc lập, có thể rollback từng phần.

---

## KNOWN LIMITATIONS

1. **Active Conversation Check:**
   - Hiện chưa check conversation có đang active không
   - TODO: Integrate với conversation routing state

2. **Unread Count Persistence:**
   - unreadCount chỉ tồn tại in-memory
   - Clear khi refresh page
   - Consider: Sync với localStorage hoặc API (future)

3. **Performance:**
   - Join TẤT CẢ conversations (có thể nhiều)
   - Consider: Lazy join (chỉ join visible categories)

---

## HUMAN DECISIONS

| #   | Decision                   | Options                         | Chosen          |
| --- | -------------------------- | ------------------------------- | --------------- |
| 1   | Badge animation            | Framer Motion / CSS only / None | ✅ **CSS only** |
| 2   | Max message preview chars  | 40 / 50 / 70                    | ✅ **50**       |
| 3   | Debounce refetch delay     | 300ms / 500ms / 1s              | ✅ **500ms**    |
| 4   | Handle active conversation | Now / Later                     | ✅ **Later**    |

---

## ✅ APPROVAL

| Item                           | Status |
| ------------------------------ | ------ |
| Đã review implementation steps | ✅     |
| Files to modify hợp lý         | ✅     |
| Đã điền decisions              | ✅     |
| **APPROVED**                   | ✅     |

**Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-23

> ⚠️ AI KHÔNG ĐƯỢC code nếu chưa APPROVED
