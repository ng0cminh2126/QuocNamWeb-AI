# Conversation and WorkType Relationship Guide

> **Last Updated:** January 16, 2026  
> **Purpose:** Clarify the relationship between Conversations, Groups, and WorkTypes in the Quoc Nam Portal

---

## 🎯 Core Concept

In this system, **"group conversation" and "work type" are closely related concepts**:

```
┌─────────────────────────────────────────────────────────┐
│  Conversation (GroupChat) = Work Type Container         │
│                                                          │
│  Each conversation contains:                             │
│  ✓ Members     (team assigned to this work)            │
│  ✓ Chats       (messages related to this work)         │
│  ✓ Tasks       (work items with checklists)            │
│  ✓ Checklists  (managed via checklist variants)        │
└─────────────────────────────────────────────────────────┘
```

**When we talk about "groups" or "conversations", we also mean "work types"** because each conversation represents a category of work with its own team, communication, and tasks.

---

## 📊 API to Frontend Mapping

### From API (Chat_Swagger.json)

```json
// ConversationDto from API
{
  "id": "uuid",
  "type": "GRP",
  "name": "Vận Hành - Kho",
  "description": "Nhóm quản lý kho vận",
  "memberCount": 15,
  "unreadCount": 3,
  "lastMessage": { ... },
  "categories": [ ... ]
}
```

### To Frontend (portal/types.ts)

```typescript
// GroupChat in frontend
interface GroupChat {
  id: string;
  name: string;                    // "Vận Hành - Kho"
  description?: string;
  members: GroupMember[];          // Team members
  workTypes: WorkType[];           // Work categories within this group
  defaultWorkTypeId?: string;
  lastMessage?: string;
  unreadCount?: number;
  // ... other UI state
}
```

---

## 🔄 Data Structure Hierarchy

```
Category (Danh mục)
  └── Conversation/GroupChat (Nhóm trò chuyện)
        ├── Members (Thành viên)
        │     ├── Leaders (Trưởng phòng)
        │     └── Staff (Nhân viên)
        │
        ├── WorkTypes (Loại việc)
        │     ├── WorkType 1: "Nhận hàng"
        │     │     └── ChecklistVariants
        │     │           ├── "Kiểm đếm"
        │     │           ├── "Lưu trữ"
        │     │           └── "Thanh toán"
        │     │
        │     └── WorkType 2: "Đổi trả"
        │           └── ChecklistVariants
        │                 ├── "Kiểm tra lỗi"
        │                 └── "Xử lý đổi trả"
        │
        ├── Chats/Messages (Tin nhắn)
        │     └── Can be filtered by WorkType
        │
        └── Tasks (Công việc)
              ├── Linked to WorkType
              ├── Assigned to Members
              └── Uses ChecklistVariant templates
```

---

## 🏗️ Components Relationship

### WorkTypeManagerDialog
- **Purpose:** Manage work types across conversations
- **Flow:** 
  1. Select Category
  2. Select Conversation (which is a work type container)
  3. Manage work types and checklists within that conversation

### WorkTypeEditor
- **Purpose:** Edit work types within a specific conversation
- **Features:**
  - Add/Edit/Delete work types
  - Manage members (via GroupUserManagement)
  - Manage checklist variants (via ManageVariantsDialog)

### AddEditWorkTypeDialog
- **Purpose:** Add or edit a single work type
- **Context:** Operating within a specific conversation/group

### ManageVariantsDialog
- **Purpose:** Manage checklist variants for a work type
- **Context:** Operating within a specific work type within a conversation

---

## 📝 Terminology Mapping

| API Term | Frontend Type | User-facing Label | Meaning |
|----------|--------------|-------------------|---------|
| `ConversationDto` | `GroupChat` | "Nhóm trò chuyện" | A group conversation that contains work categories |
| `ConversationType: "GRP"` | `GroupChat` | "Nhóm" | Group conversation (not DM) |
| N/A (embedded) | `WorkType` | "Loại việc" | Category of work within a conversation |
| Template (Task API) | `ChecklistVariant` | "Dạng checklist" | Sub-category of checklists for a work type |
| Message | `Message` | "Tin nhắn" | Chat messages in the conversation |
| Task | `Task` | "Công việc" | Work items linked to work type + variant |

---

## 🔗 API References

### Chat API (Chat_Swagger.json)
- **Conversations:** `/api/conversations`
- **Categories:** `/api/categories`
- **Members:** `/api/conversations/{id}/members`

### Task API (Task swagger.json)
- **Checklist Templates:** `/api/checklist-templates`
- **Tasks:** `/api/tasks`

### Related Files
```
docs/modules/chat/using_management_api/api_swaggers/
├── Chat_Swagger.json       # Conversation/Group management
├── Task swagger.json       # Task and checklist management
├── Identity swagger.json   # User authentication
├── Files_wagger.json       # File management
└── Admin swagger.json      # Admin operations
```

---

## 💡 Key Insights

### 1. Conversation ≈ Work Type Container
Each conversation is not just a chat room—it's a **complete work management unit** with:
- Dedicated team members
- Categorized work types
- Task management
- Checklist templates

### 2. WorkType as Sub-Category
WorkTypes are **categories within a conversation**, not standalone entities. For example:
- Conversation: "Vận Hành - Kho"
  - WorkType 1: "Nhận hàng"
  - WorkType 2: "Đổi trả"
  - WorkType 3: "Phế phẩm"

### 3. ChecklistVariant for Task Templates
ChecklistVariants provide **reusable task templates** within each work type:
- WorkType: "Nhận hàng"
  - Variant 1: "Kiểm đếm" (with specific checklist items)
  - Variant 2: "Lưu trữ" (with different checklist items)
  - Variant 3: "Thanh toán" (with payment-related items)

---

## 🎯 Practical Example

### Scenario: "Vận Hành - Kho" Group

```typescript
const exampleGroupChat: GroupChat = {
  id: "conv-001",
  name: "Vận Hành - Kho",
  description: "Nhóm quản lý kho vận",
  
  // Members in this conversation
  members: [
    { userId: "user-1", role: "leader", name: "Nguyễn Văn A" },
    { userId: "user-2", role: "staff", name: "Trần Thị B" },
    { userId: "user-3", role: "staff", name: "Lê Văn C" },
  ],
  
  // Work types within this conversation
  workTypes: [
    {
      id: "wt-001",
      name: "Nhận hàng",
      key: "nhan_hang",
      icon: "PackageCheck",
      checklistVariants: [
        { id: "var-001", name: "Kiểm đếm", isDefault: true },
        { id: "var-002", name: "Lưu trữ" },
        { id: "var-003", name: "Thanh toán" },
      ]
    },
    {
      id: "wt-002",
      name: "Đổi trả",
      key: "doi_tra",
      icon: "RefreshCw",
      checklistVariants: [
        { id: "var-004", name: "Kiểm tra lỗi", isDefault: true },
        { id: "var-005", name: "Xử lý đổi trả" },
      ]
    }
  ],
  
  defaultWorkTypeId: "wt-001",
  unreadCount: 3,
  lastMessage: "Đã nhận 50 thùng hàng",
};
```

### User Workflow

1. **Select Conversation**: User picks "Vận Hành - Kho"
2. **Filter by WorkType**: User switches between "Nhận hàng" and "Đổi trả"
3. **View Messages**: Messages tagged with selected work type
4. **Create Task**: 
   - Choose WorkType: "Nhận hàng"
   - Choose Variant: "Kiểm đếm" (loads its checklist template)
   - Assign to member
5. **Manage Members**: Add/remove team members for this conversation
6. **Manage Checklists**: Add/edit checklist variants for each work type

---

## 🚀 Implementation Notes

### When Adding New Work Type
```typescript
// The work type belongs to a specific conversation
function handleAddWorkType(conversationId: string, workTypeName: string) {
  // 1. Validate: Check if name exists in THIS conversation
  // 2. Create work type
  // 3. Optionally: Create default checklist variant
  // 4. Save to conversation's workTypes array
}
```

### When Creating Task
```typescript
function handleCreateTask(
  conversationId: string,    // Which conversation/group
  workTypeId: string,        // Which work type category
  checklistVariantId: string, // Which checklist template
  assignToUserId: string     // Which member
) {
  // Task is created within the context of:
  // - A conversation (group)
  // - A work type (category)
  // - A checklist variant (template)
  // - Assigned to a member of this conversation
}
```

---

## 📚 Related Documentation

- [Code Conventions](./code_conventions_20251226_claude_opus_4_5.md)
- [Testing Strategy](./testing_strategy_20251226_claude_opus_4_5.md)
- [Conversation List Feature](../modules/chat/features/conversation-list/)
- [API Integration Guide](../modules/chat/using_management_api/01_requirements.md)

---

## ✅ Summary

> **Remember:** When we talk about "groups" or "conversations" in this project, we're also talking about "work types" because each conversation IS a complete work management unit with its own team, categories, tasks, and checklists.

This unified concept simplifies the mental model and aligns with the API structure where `ConversationDto` serves as the container for all work-related activities.
