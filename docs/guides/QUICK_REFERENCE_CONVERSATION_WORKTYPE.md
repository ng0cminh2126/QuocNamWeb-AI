# 🎯 Quick Reference: Conversation = Work Type Container

> **TL;DR:** When we say "group" or "conversation", we mean a complete work management unit.

---

## 🔑 Core Concept

```
Conversation (GroupChat) = Work Type Container
    ├── 👥 Members
    ├── 💬 Chats
    ├── ✅ Tasks
    └── 📋 Checklists
```

---

## 📊 What's What

| You See | It Means | Technical Type |
|---------|----------|----------------|
| "Nhóm chat" | A conversation that manages work | `GroupChat` / `ConversationDto` |
| "Loại việc" | Category of work in a conversation | `WorkType` |
| "Dạng checklist" | Template variant for tasks | `ChecklistVariant` |
| "Thành viên" | People in the conversation | `GroupMember[]` |

---

## 🏗️ Data Structure

```typescript
// Each conversation is a work container
const conversation: GroupChat = {
  id: "conv-001",
  name: "Vận Hành - Kho",
  
  members: [                    // 👥 Who works here
    { userId: "u1", role: "leader" },
    { userId: "u2", role: "staff" }
  ],
  
  workTypes: [                  // 📂 What kind of work
    {
      id: "wt-001",
      name: "Nhận hàng",
      checklistVariants: [      // 📋 Task templates
        { id: "v1", name: "Kiểm đếm" },
        { id: "v2", name: "Lưu trữ" }
      ]
    }
  ]
};
```

---

## 🎨 Component Usage

### When selecting a conversation
```tsx
<WorkTypeManagerDialog>
  {/* User picks conversation */}
  <GroupSelector onSelect={conversation => ...} />
  
  {/* Then edits work types IN that conversation */}
  <WorkTypeEditor group={conversation} />
</WorkTypeManagerDialog>
```

### When creating a task
```tsx
// Task belongs to:
// 1. A conversation (which conversation)
// 2. A work type (which category)
// 3. A checklist variant (which template)
// 4. A member (who does it)

createTask({
  conversationId: "conv-001",
  workTypeId: "wt-001",
  checklistVariantId: "v1",
  assignToUserId: "u2"
});
```

---

## 🔄 API Mapping

| Frontend | API (Swagger) | File |
|----------|---------------|------|
| `GroupChat` | `ConversationDto` | Chat_Swagger.json |
| `WorkType` | Embedded in conversation | Chat_Swagger.json |
| `ChecklistVariant` | `CheckListTemplateResponse` | Task swagger.json |
| `GroupMember` | Member objects | Chat_Swagger.json |

---

## 💡 Remember

1. **Conversation ≈ Work Type Container**  
   Each conversation contains work categories, not the other way around.

2. **One Conversation = One Team**  
   Members are assigned to conversations, not to individual work types.

3. **Work Types = Categories**  
   Work types organize work WITHIN a conversation.

4. **Checklist Variants = Task Templates**  
   Used when creating tasks to pre-fill checklist items.

---

## 📚 Full Documentation

For detailed explanations, see:
- [CONVERSATION_WORKTYPE_RELATIONSHIP.md](./CONVERSATION_WORKTYPE_RELATIONSHIP.md)
- [CONVERSATION_WORKTYPE_UPDATE_SUMMARY.md](../CONVERSATION_WORKTYPE_UPDATE_SUMMARY.md)

---

## 🚀 Example Workflow

```
1. Admin creates conversation: "Vận Hành - Kho"
   → System creates GroupChat object

2. Admin adds members to conversation
   → Members can see this conversation in their list

3. Admin creates work types: "Nhận hàng", "Đổi trả"
   → Work types are categories within this conversation

4. Admin creates checklist variants for "Nhận hàng"
   → "Kiểm đếm", "Lưu trữ", "Thanh toán"

5. User creates task from message
   → Pick work type: "Nhận hàng"
   → Pick variant: "Kiểm đếm"
   → Assign to member
   → Task checklist auto-fills from variant template

6. User filters messages by work type
   → Shows only "Nhận hàng" related messages
```

---

**Last Updated:** January 16, 2026  
**Reference:** API Swaggers in `docs/modules/chat/using_management_api/api_swaggers/`
