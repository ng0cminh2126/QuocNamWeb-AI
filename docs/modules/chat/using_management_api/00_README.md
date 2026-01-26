# [BƯỚC 0] Conversation Category Management System - Overview

**Feature Name:** Conversation Category Management System  
**Module:** Chat - Management API Integration  
**Status:** ⏳ PLANNING  
**Created:** 2026-01-16

---

## 📋 Feature Overview

This feature integrates the existing "Quản lý Loại Việc" UI with the real Chat Swagger API to enable full conversation category management, including:

1. **Conversation Category UI** - Display and manage conversation categories
2. **Group List per Category** - Show all group conversations linked to each category
3. **Group User Management UI** (NEW) - Manage group members (Admin/Leader only)
4. **Checklist Template Management** - Manage checklist templates filtered by conversation

---

## 🗂️ Related Documents

### Planning Documents (Sequential by BƯỚC)
| Step | Document | Status | Description |
|------|----------|--------|-------------|
| 0 | [00_README.md](./00_README.md) | ✅ | This overview document |
| 1 | [01_requirements.md](./01_requirements.md) | ⏳ PENDING | Detailed requirements analysis |
| 2A | [02a_wireframe.md](./02a_wireframe.md) | ⏳ PENDING | UI wireframes & design specs |
| 2B | [02b_flow.md](./02b_flow.md) | ⏳ PENDING | User flows & navigation |
| 3 | [03_api-contract.md](./03_api-contract.md) | ⏳ PENDING | API contracts with snapshots |
| 4 | [04_implementation-plan.md](./04_implementation-plan.md) | ⏳ PENDING | Implementation plan |
| 4.5 | [06_testing.md](./06_testing.md) | ⏳ PENDING | Test requirements & coverage |
| 5 | [05_progress.md](./05_progress.md) | - | Auto-generated progress tracking |

### API Documentation
- Chat Swagger: [api_swaggers/Chat_Swagger.json](./api_swaggers/Chat_Swagger.json)
- Task Swagger: [api_swaggers/Task swagger.json](./api_swaggers/Task%20swagger.json)

### Existing UI Components
- GroupSelector: [src/features/portal/components/worktype-manager/GroupSelector.tsx](../../../../src/features/portal/components/worktype-manager/GroupSelector.tsx)
- WorkTypeEditor: [src/features/portal/components/worktype-manager/WorkTypeEditor.tsx](../../../../src/features/portal/components/worktype-manager/WorkTypeEditor.tsx)
- WorkTypeCard: [src/features/portal/components/worktype-manager/WorkTypeCard.tsx](../../../../src/features/portal/components/worktype-manager/WorkTypeCard.tsx)
- ManageVariantsDialog: [src/features/portal/components/worktype-manager/ManageVariantsDialog.tsx](../../../../src/features/portal/components/worktype-manager/ManageVariantsDialog.tsx)

---

## 🎯 Core Components

### 1. Conversation Category UI (Existing - Needs API Integration)
- **Current:** GroupSelector component with mock data
- **Target:** Integrate with `GET /api/categories` API
- **Status:** Existing UI, needs API integration

### 2. Group List per Category (Existing - Needs API Integration)
- **Current:** Shows groups from mock data
- **Target:** Integrate with `GET /api/categories/{id}/conversations` API
- **Status:** Existing UI, needs API integration

### 3. Group User Management UI (NEW)
- **Current:** Does not exist
- **Target:** Create new UI component for Admin/Leader to manage group members
- **APIs:** 
  - `GET /api/conversations/{id}/members` or `GET /api/groups/{id}/members`
  - `POST /api/groups/{id}/members` (add member)
  - `DELETE /api/groups/{id}/members/{userId}` (remove member)
  - `POST /api/groups/{id}/members/{userId}/promote` (promote to leader)
- **Status:** NEW component needed

### 4. Checklist Template Management (Existing - Needs API Integration)
- **Current:** ManageVariantsDialog manages mock checklist variants
- **Target:** Integrate with `GET /api/checklist-templates?conversationId={id}` API
- **Status:** Existing UI, needs API integration

---

## 📊 API Endpoints Summary

### From Chat Swagger

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/categories` | GET | Get all categories | ⏳ Need snapshot |
| `/api/categories` | POST | Create category | ⏳ Need snapshot |
| `/api/categories/{id}` | GET | Get category by ID | ⏳ Need snapshot |
| `/api/categories/{id}` | PUT | Update category | ⏳ Need snapshot |
| `/api/categories/{id}` | DELETE | Delete category | ⏳ Need snapshot |
| `/api/categories/{id}/conversations` | GET | Get conversations in category | ⏳ Need snapshot |
| `/api/categories/{id}/conversations/{conversationId}` | POST | Link conversation to category | ⏳ Need snapshot |
| `/api/categories/{id}/conversations/{conversationId}` | DELETE | Unlink conversation | ⏳ Need snapshot |
| `/api/conversations/{id}/members` | GET | Get conversation members | ⏳ Need snapshot |
| `/api/groups/{id}/members` | GET | Get group members | ⏳ Need snapshot |
| `/api/groups/{id}/members` | POST | Add member to group | ⏳ Need snapshot |
| `/api/groups/{id}/members/{userId}` | DELETE | Remove member | ⏳ Need snapshot |
| `/api/groups/{id}/members/{userId}/promote` | POST | Promote member to leader | ⏳ Need snapshot |

### From Task Swagger

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/checklist-templates` | GET | Get checklist templates (filtered by conversationId) | ⏳ Need snapshot |
| `/api/checklist-templates` | POST | Create checklist template | ⏳ Need snapshot |
| `/api/checklist-templates/{id}` | GET | Get template by ID | ⏳ Need snapshot |
| `/api/checklist-templates/{id}` | PUT | Update template | ⏳ Need snapshot |
| `/api/checklist-templates/{id}` | DELETE | Delete template | ⏳ Need snapshot |

---

## 🔑 Key Data Models

### CategoryDto (Chat Swagger)
```typescript
interface CategoryDto {
  id: string;                    // uuid
  userId: string;                // uuid (owner)
  name: string;                  // Category name
  order: number;                 // Display order
  conversationCount: number;     // Number of conversations in category
  createdAt: string;             // ISO datetime
  updatedAt: string | null;      // ISO datetime
}
```

### ConversationDto (Chat Swagger)
```typescript
interface ConversationDto {
  id: string;                    // uuid
  type: 'DM' | 'GRP';            // Conversation type
  name: string;                  // Conversation name
  description: string | null;
  avatarFileId: string | null;   // uuid
  createdBy: string;             // uuid
  createdByName: string;
  createdAt: string;             // ISO datetime
  updatedAt: string | null;
  memberCount: number;
  unreadCount: number;
  lastMessage: MessageDto | null;
  categories: ConversationCategoryDto[] | null;
}
```

### MemberDto (Chat Swagger)
```typescript
interface MemberDto {
  userId: string;                // uuid
  userName: string;
  role: 'MBR' | 'ADM' | 'OWN';   // Member, Admin, Owner
  joinedAt: string;              // ISO datetime
  isMuted: boolean;
  userInfo: UserInfoDto;
}
```

### CheckListTemplateResponse (Task Swagger)
```typescript
interface CheckListTemplateResponse {
  id: string;                    // uuid
  name: string;
  conversationId: string | null; // uuid (filter by this)
  items: CheckListItemDto[];
  createdAt: string;
  updatedAt: string | null;
}
```

---

## 🚦 Feature Status Tracking

| Component | Status | Notes |
|-----------|--------|-------|
| Requirements Doc | ⏳ PENDING | Need to create |
| Wireframe Doc | ⏳ PENDING | Need to create |
| Flow Doc | ⏳ PENDING | Need to create |
| API Contracts | ⏳ PENDING | Need snapshots from backend |
| Implementation Plan | ⏳ PENDING | After API contracts approved |
| Test Requirements | ⏳ PENDING | After implementation plan |
| Group User Management UI | ⏳ NOT STARTED | New component |
| Category API Integration | ⏳ NOT STARTED | Update existing components |
| Checklist Template Integration | ⏳ NOT STARTED | Update existing components |

---

## ⚠️ Critical Notes

1. **HUMAN Confirmation Required:** Each BƯỚC document MUST be approved before moving to next step
2. **API Snapshots Required:** Cannot start coding until all API snapshots are captured
3. **Test Requirements First:** Must create and approve 06_testing.md before coding
4. **Role Hardcoding:** Group User Management UI will hardcode Admin/Leader roles in UI until proper permission system exists

---

## 📅 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-16 | AI | Initial overview document created |

---

## ✅ Next Steps

1. ✅ Create this README overview
2. ⏳ Create 01_requirements.md (BƯỚC 1)
3. ⏳ Wait for HUMAN approval
4. ⏳ Create 02a_wireframe.md (BƯỚC 2A)
5. ⏳ Create 02b_flow.md (BƯỚC 2B)
6. ⏳ Wait for HUMAN approval
7. ⏳ Create 03_api-contract.md with snapshot requirements (BƯỚC 3)
8. ⏳ Wait for HUMAN to provide API snapshots
9. ⏳ Wait for HUMAN approval
10. ⏳ Create 04_implementation-plan.md (BƯỚC 4)
11. ⏳ Wait for HUMAN approval
12. ⏳ Create 06_testing.md (BƯỚC 4.5)
13. ⏳ Wait for HUMAN approval
14. ⏳ Start coding (BƯỚC 5)

---

**⚠️ IMPORTANT:** AI MUST NOT proceed to next BƯỚC without HUMAN approval of current BƯỚC.
