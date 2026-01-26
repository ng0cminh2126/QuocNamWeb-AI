# [BƯỚC 2] Flow - Category List Real-time Update

**Feature:** Category List Real-time Update  
**Version:** 1.0  
**Date:** 2026-01-23  
**Status:** ✅ APPROVED

---

## 1. USER FLOW

### Flow 1: Xem Category List lần đầu

```
┌─────────────┐
│   User mở   │
│  workspace  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Load categories     │
│ (API /categories)   │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ SignalR: Auto-join ALL       │
│ conversations in categories  │
└──────┬───────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Display:                    │
│ • Category names            │
│ • Last messages             │
│ • Unread badges (nếu có)    │
└─────────────────────────────┘
```

### Flow 2: Nhận tin nhắn mới (Real-time)

```
┌──────────────────────┐
│ SignalR: MessageSent │
│ event received       │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────┐     YES    ┌─────────────────┐
│ Is own message?         │──────────▶ │ Update lastMsg  │
│ (senderId = currentId)  │            │ KHÔNG tăng unread│
└──────┬──────────────────┘            └─────────────────┘
       │ NO
       ▼
┌────────────────────────┐     YES    ┌─────────────────┐
│ Conversation active?   │──────────▶ │ Update lastMsg  │
│ (user đang mở chat)    │            │ KHÔNG tăng unread│
└──────┬─────────────────┘            └─────────────────┘
       │ NO
       ▼
┌─────────────────────────┐
│ Update lastMessage      │
│ + Increment unreadCount │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ UI: Update category     │
│ • New lastMessage       │
│ • Badge +1              │
└─────────────────────────┘
```

### Flow 3: Đánh dấu đã đọc

```
┌─────────────────────┐
│ User opens          │
│ conversation        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ SignalR: MessageRead│
│ event received      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Reset unreadCount=0 │
│ for conversation    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ UI: Hide badge      │
│ (smooth fade-out)   │
└─────────────────────┘
```

---

## 2. SYSTEM FLOW

### Flow Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React Component                      │
│            (ConversationListSidebar)                   │
└────┬───────────────────────────────┬───────────────────┘
     │                               │
     │ ① Mount                       │ ⑦ Display
     ▼                               ▼
┌─────────────────┐           ┌──────────────────┐
│ useCategoriesRT │           │ Render UI        │
│ (Custom Hook)   │           │ • Last message   │
└────┬────────────┘           │ • Unread badge   │
     │                        └──────────────────┘
     │ ② Call
     ▼
┌─────────────────────────────┐
│ useCategories (Query)       │
│ → GET /api/categories       │
└────┬────────────────────────┘
     │ ③ Data
     ▼
┌─────────────────────────────────────────┐
│ TanStack Query Cache                    │
│ {                                       │
│   categories: [                         │
│     { id, name, conversations: [...] }  │
│   ]                                     │
│ }                                       │
└────┬────────────────────────────────────┘
     │ ④ Listen SignalR
     ▼
┌──────────────────────────────────────────┐
│ SignalR Hub (chatHub)                    │
│ • onMessageSent(callback)                │
│ • onMessageRead(callback)                │
└────┬─────────────────────────────────────┘
     │ ⑤ Events
     ▼
┌──────────────────────────────────────────┐
│ Event Handlers                           │
│ handleMessageSent(message)               │
│ handleMessageRead(conversationId)        │
└────┬─────────────────────────────────────┘
     │ ⑥ Update Cache
     ▼
┌──────────────────────────────────────────┐
│ queryClient.setQueryData()               │
│ → Update categories cache                │
│ → Update lastMessage                     │
│ → Update unreadCount                     │
└──────────────────────────────────────────┘
```

### SignalR Flow Details

#### Auto-Join Conversations

```typescript
// ① Component mount
useEffect(() => {
  if (!categories) return;

  // ② Extract ALL conversation IDs
  const conversationIds = categories.flatMap((cat) =>
    cat.conversations.map((c) => c.conversationId),
  );

  // ③ Join ALL conversations
  conversationIds.forEach((id) => {
    chatHub.joinConversation(id);
  });

  // ④ Cleanup: Leave on unmount
  return () => {
    conversationIds.forEach((id) => {
      chatHub.leaveConversation(id);
    });
  };
}, [categories]);
```

#### Event: MessageSent

```typescript
chatHub.onMessageSent((data) => {
  // ① Find conversation in categories
  const { conversationId, senderId, content, ... } = data.message;

  // ② Update cache
  queryClient.setQueryData(['categories'], (old) => {
    return old.map(category => ({
      ...category,
      conversations: category.conversations.map(conv => {
        if (conv.conversationId !== conversationId) return conv;

        // ③ Update lastMessage
        const newConv = {
          ...conv,
          lastMessage: {
            messageId: data.message.id,
            senderId,
            senderName: data.message.senderName,
            content,
            sentAt: data.message.sentAt,
          },
        };

        // ④ Calculate unreadCount
        const shouldIncrement =
          senderId !== currentUserId &&
          !isConversationActive(conversationId);

        if (shouldIncrement) {
          newConv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        return newConv;
      }),
    }));
  });
});
```

#### Event: MessageRead

```typescript
chatHub.onMessageRead(({ conversationId }) => {
  queryClient.setQueryData(["categories"], (old) => {
    return old.map((category) => ({
      ...category,
      conversations: category.conversations.map((conv) =>
        conv.conversationId === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv,
      ),
    }));
  });
});
```

---

## 3. DATA FLOW

### Initial Load

```
API Response            Cache                   UI State
───────────            ─────                   ────────

categories: [          ┌─────────────┐         Category A
  {                    │ Category A  │         └─ Team 1: "Hi"
    id: "A",    ──────▶│  conversations: [     └─ Badge: 3
    name: "...", │     │    { id: "1",
    conversations: [   │      lastMessage: {   Category B
      {            ────┘      content: "Hi"    └─ Team 2: "Ok"
        lastMessage: {       },                 └─ Badge: 1
          content: "Hi",     unreadCount: 3
          ...              }
        }                ]
      }              │
    ]                │
  }           ───────┘
]
```

### Real-time Update (MessageSent)

```
SignalR Event          Cache Update            UI Update
─────────────          ────────────            ─────────

MessageSent: {         ┌─────────────┐         Category A
  message: {           │ Category A  │         └─ Team 1: "New!"
    conversationId:"1",│  conversations: [     └─ Badge: 4 ✨
    content: "New!"  ──▶    { id: "1",                  ↑
    ...                │      lastMessage: {   (Animated)
  }                    │        content:"New!",
}                      │        ...
                       │      },
                       │      unreadCount: 4
                       │    }
                       │  ]
                       └─────────────┘
```

---

## 4. ERROR HANDLING FLOW

### Scenario 1: SignalR Disconnected

```
┌────────────────────┐
│ SignalR disconnect │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Auto-reconnect     │
│ (built-in)         │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ On reconnected:    │
│ • Re-join ALL      │
│   conversations    │
│ • Refetch /categories│
└────────────────────┘
```

### Scenario 2: Cache Update Failed

```
┌────────────────────┐
│ MessageSent event  │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐     FAIL    ┌────────────────┐
│ Try update cache   │────────────▶│ Log error      │
└──────┬─────────────┘             │ Refetch silently│
       │ SUCCESS                    └────────────────┘
       ▼
┌────────────────────┐
│ UI updated         │
└────────────────────┘
```

---

## 5. PERFORMANCE CONSIDERATIONS

### Debouncing Strategy

```
MessageSent events:  ▲     ▲    ▲       ▲
                     │     │    │       │
                     │     │    │       │
                     t=0  t=50 t=100  t=500ms
                                       │
                                       ▼
                            Refetch /categories
                            (verify consistency)
```

- Optimistic update: Ngay lập tức
- Background refetch: Sau 500ms (debounced)

### Memory Optimization

```
Auto-join conversations:
┌────────────────────────────────┐
│ IF conversation count > 50:    │
│   → Join only visible categories│
│   → Virtual scrolling support   │
└────────────────────────────────┘
```

---

## 6. EDGE CASES

### Case 1: Message trong conversation không có trong cache

**Handle:** Refetch /categories để sync

### Case 2: User gửi message rồi ngay lập tức nhận MessageSent event

**Handle:** Check senderId = currentUserId → Skip increment unread

### Case 3: Multiple MessageSent events cùng lúc (spam)

**Handle:**

- Update cache cho TẤT CẢ events
- Debounce refetch 500ms (chỉ refetch 1 lần)

---

## ✅ APPROVAL

| Item               | Status |
| ------------------ | ------ |
| Đã review flows    | ⬜     |
| Flows logic hợp lý | ⬜     |
| **APPROVED**       | ⬜     |

**Signature:** **\*\***\_**\*\***  
**Date:** **\*\***\_**\*\***

> AI chỉ được tiếp tục khi APPROVED
