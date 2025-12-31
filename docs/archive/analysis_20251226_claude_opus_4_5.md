# 📋 Tài liệu Phân tích Source Code - Quoc Nam Phase 1A

> **Ngày tạo:** 2025-12-26  
> **Model AI:** Claude Opus 4.5 (GitHub Copilot)  
> **Dự án:** M1 Portal Wireframe - Quoc Nam Phase 1A  
> **Mục đích:** Demo mockup cho khách hàng - Portal Internal Chat

---

## 📁 Mục Lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Tech Stack](#4-tech-stack)
5. [Các Module nghiệp vụ](#5-các-module-nghiệp-vụ)
6. [Data Flow](#6-data-flow)
7. [Component Architecture](#7-component-architecture)
8. [Đề xuất cải tiến](#8-đề-xuất-cải-tiến)

---

## 1. Tổng quan dự án

### 1.1 Mô tả
Đây là một **Portal Internal Chat** dạng mockup/wireframe được xây dựng bằng React để demo cho khách hàng. Ứng dụng mô phỏng hệ thống chat nội bộ doanh nghiệp với các tính năng quản lý công việc, nhắn tin nhóm, và phân công nhiệm vụ.

### 1.2 Đối tượng người dùng
- **Leader (Trưởng nhóm):** Quản lý team, giám sát công việc, phân công nhiệm vụ
- **Staff (Nhân viên):** Thực hiện công việc, cập nhật tiến độ, chat nhóm

### 1.3 Các chế độ hiển thị
- **Desktop Mode:** Giao diện đầy đủ cho màn hình lớn
- **Mobile Mode:** Giao diện tối ưu cho thiết bị di động (414x720)

---

## 2. Kiến trúc hệ thống

### 2.1 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP (App.tsx)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    PortalWireframes                        │  │
│  │  (State Manager - Quản lý state toàn cục)                 │  │
│  │                                                            │  │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐   │  │
│  │  │  WorkspaceView  │    │     TeamMonitorView         │   │  │
│  │  │  (Staff View)   │    │     (Lead View)             │   │  │
│  │  │                 │    │                             │   │  │
│  │  │ ┌───────────┐   │    │  ┌─────────────────────┐    │   │  │
│  │  │ │LeftSidebar│   │    │  │   ThreadTable       │    │   │  │
│  │  │ └───────────┘   │    │  └─────────────────────┘    │   │  │
│  │  │ ┌───────────┐   │    │  ┌─────────────────────┐    │   │  │
│  │  │ │ ChatMain  │   │    │  │   MemberSummary     │    │   │  │
│  │  │ └───────────┘   │    │  └─────────────────────┘    │   │  │
│  │  │ ┌───────────┐   │    │                             │   │  │
│  │  │ │RightPanel │   │    │                             │   │  │
│  │  │ └───────────┘   │    │                             │   │  │
│  │  └─────────────────┘    └─────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Pattern sử dụng

| Pattern | Mô tả | Vị trí áp dụng |
|---------|-------|----------------|
| **Container/Presentational** | Tách biệt logic và UI | `PortalWireframes` (container) vs `components/ui/*` (presentational) |
| **Feature-based Structure** | Tổ chức theo tính năng | `features/portal/*` |
| **Compound Components** | Components liên kết | `Sheet`, `Popover`, `Dialog` |
| **Lifting State Up** | State tập trung | `PortalWireframes.tsx` giữ toàn bộ state |

### 2.3 Routing Strategy
- Sử dụng **Manual Routing** thông qua `window.location.pathname`
- Không sử dụng React Router (đơn giản cho mockup)
- Routes:
  - `/` → Desktop view
  - `/mobile/*` → Mobile view
  - `/demo/mobile-task-log` → Demo Mobile Task Log

---

## 3. Cấu trúc thư mục

```
Quoc-Nam-Phase-1A/
├── 📁 public/                    # Static assets
├── 📁 src/
│   ├── 📁 assets/               # Images, icons
│   ├── 📁 components/           # Shared components
│   │   ├── 📁 ui/               # Base UI components (Radix-based)
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   └── tooltip.tsx
│   │   └── 📁 sheet/            # Sheet components (slide panels)
│   │       ├── AssignTaskSheet.tsx
│   │       ├── DepartmentTransferSheet.tsx
│   │       ├── GroupTransferSheet.tsx
│   │       └── MobileAssignTaskSheet.tsx
│   │
│   ├── 📁 data/                 # Mock data
│   │   ├── mockMessages.ts      # Chat messages mock
│   │   ├── mockOrg.ts           # Organization structure
│   │   ├── mockSidebar.ts       # Sidebar data
│   │   └── mockTasks.ts         # Tasks mock data
│   │
│   ├── 📁 features/             # Feature modules
│   │   └── 📁 portal/           # Main portal feature
│   │       ├── 📁 components/   # Portal-specific components
│   │       │   ├── AllFilesScreenMobile.tsx
│   │       │   ├── Avatar.tsx
│   │       │   ├── Badge.tsx
│   │       │   ├── ChecklistTemplatePanel.tsx
│   │       │   ├── ChecklistTemplateSlideOver.tsx
│   │       │   ├── Chip.tsx
│   │       │   ├── CloseNoteModal.tsx
│   │       │   ├── DefaultChecklistMobile.tsx
│   │       │   ├── FileManager.tsx
│   │       │   ├── FileManagerPhase1A.tsx
│   │       │   ├── FilePreviewModal.tsx
│   │       │   ├── HintBanner.tsx
│   │       │   ├── HintBubble.tsx
│   │       │   ├── LinearTabs.tsx
│   │       │   ├── MainSidebar.tsx
│   │       │   ├── MessageBubble.tsx
│   │       │   ├── MobileAccordion.tsx
│   │       │   ├── PinnedMessagesPanel.tsx
│   │       │   ├── QuickMessageManager.tsx
│   │       │   ├── RightAccordion.tsx
│   │       │   ├── SegmentedTabs.tsx
│   │       │   ├── TabInfoMobile.tsx
│   │       │   ├── TabTaskMobile.tsx
│   │       │   ├── TaskChecklist.tsx
│   │       │   ├── ToastContainer.tsx
│   │       │   ├── TodoListManager.tsx
│   │       │   ├── ViewModeSwitcher.tsx
│   │       │   └── index.ts
│   │       │
│   │       ├── 📁 lead/         # Leader view components
│   │       │   ├── MemberSummary.tsx
│   │       │   ├── TeamMonitorView.tsx
│   │       │   └── ThreadTable.tsx
│   │       │
│   │       ├── 📁 workspace/    # Workspace view components
│   │       │   ├── ChatMain.tsx
│   │       │   ├── LeftSidebar.tsx
│   │       │   ├── MobileTaskLogScreen.tsx
│   │       │   ├── MobileTaskLogScreenDemo.tsx
│   │       │   ├── RightPanel.tsx
│   │       │   ├── TaskLogThreadSheet.tsx
│   │       │   └── WorkspaceView.tsx
│   │       │
│   │       ├── 📁 utils/        # Utility functions
│   │       │   └── convertToPinnedMessage.ts
│   │       │
│   │       ├── PortalWireframes.tsx  # Main container
│   │       └── types.ts              # Type definitions
│   │
│   ├── 📁 lib/                  # Shared utilities
│   ├── 📁 styles/               # Global styles
│   ├── App.tsx                  # Root component
│   ├── App.css                  # App styles
│   ├── index.css                # Global CSS
│   └── main.tsx                 # Entry point
│
├── components.json              # shadcn/ui config
├── eslint.config.js            # ESLint config
├── index.html                   # HTML entry
├── package.json                 # Dependencies
├── postcss.config.js           # PostCSS config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── vercel.json                 # Vercel deployment
└── vite.config.js              # Vite bundler config
```

---

## 4. Tech Stack

### 4.1 Core Technologies

| Technology | Version | Mục đích |
|------------|---------|----------|
| **React** | 19.1.1 | UI Framework |
| **TypeScript** | 5.9.3 | Type Safety |
| **Vite** | 7.1.14 (rolldown-vite) | Build Tool |
| **TailwindCSS** | 3.4.18 | Styling |

### 4.2 UI Libraries

| Library | Mục đích |
|---------|----------|
| **Radix UI** | Headless UI components (Dialog, Popover, Select, etc.) |
| **Lucide React** | Icon library |
| **Framer Motion** | Animation library |
| **class-variance-authority** | Component variants |
| **tailwind-merge** | Merge Tailwind classes |
| **react-day-picker** | Date picker component |
| **date-fns** | Date utilities |

### 4.3 Design System

```javascript
// Brand Colors (tailwind.config.js)
brand: {
  50:  '#e6f7e7',
  100: '#c5efc7',
  200: '#9fe4a4',
  300: '#79d981',
  400: '#57ce61',
  500: '#38ae3c',  // Main brand color (Green)
  600: '#2f9132',
  700: '#257229',
  800: '#1c561f',
  900: '#133b15',
}
```

---

## 5. Các Module nghiệp vụ

### 5.1 Module Quản lý Nhóm Chat (Group Chat)

**Vị trí:** `src/features/portal/workspace/`, `src/data/mockOrg.ts`

**Chức năng:**
- Quản lý nhóm chat theo phòng ban
- Hỗ trợ 2 loại nhóm: Nhóm phối hợp liên phòng ban
- Auto-join Leaders vào nhóm theo rule

**Entities:**
```typescript
interface GroupChat {
  id: ID;
  name: string;                    // "Vận hành - Kho Hàng"
  departmentIds: ID[];             // Phòng ban liên quan
  members: GroupMember[];          // Thành viên nhóm
  workTypes: WorkType[];           // Loại công việc
  defaultWorkTypeId?: ID;          // Filter mặc định
}
```

**Nhóm demo:**
- `grp_vh_kho`: Vận hành - Kho Hàng
- `grp_vh_taixe`: Vận hành - Tài xế tỉnh

---

### 5.2 Module Quản lý Công việc (Task Management)

**Vị trí:** `src/features/portal/workspace/RightPanel.tsx`, `src/data/mockTasks.ts`

**Chức năng:**
- Tạo Task từ tin nhắn
- Phân công Task cho nhân viên
- Theo dõi trạng thái Task
- Quản lý Checklist

**Task Status Flow:**
```
┌─────────┐    ┌─────────────┐    ┌─────────────────┐    ┌──────────┐
│  TODO   │───▶│ IN_PROGRESS │───▶│ AWAITING_REVIEW │───▶│   DONE   │
│(Chưa xử │    │(Đang xử lý) │    │  (Chờ duyệt)    │    │(Hoàn thành)
│   lý)   │    │             │    │                 │    │          │
└─────────┘    └─────────────┘    └─────────────────┘    └──────────┘
```

**Task Entity:**
```typescript
interface Task {
  id: ID;
  groupId: ID;
  workTypeId: ID;
  sourceMessageId: ID;        // Message gốc tạo task
  title: string;
  assigneeId: ID;             // Staff được giao
  assignedById: ID;           // Leader giao việc
  status: TaskStatus;
  checklist?: ChecklistItem[];
  priority?: "low" | "normal" | "high" | "urgent";
  dueAt?: ISODate;
}
```

---

### 5.3 Module Loại Công việc (Work Types)

**Vị trí:** `src/data/mockOrg.ts`

**Chức năng:**
- Phân loại công việc theo nghiệp vụ
- Mỗi loại việc có checklist template riêng
- Filter tin nhắn theo loại việc

**Work Types hiện có:**

| ID | Tên | Icon | Mô tả |
|----|-----|------|-------|
| `wt_nhan_hang` | Nhận hàng | PackageCheck | Nghiệp vụ nhận hàng từ NCC |
| `wt_doi_tra` | Đổi Trả | Undo2 | Xử lý đổi/hoàn trả hàng |
| `wt_phe_pham` | Phế Phẩm | Trash2 | Quản lý hàng lỗi |
| `wt_can_hang` | Cân Hàng | Scale | Kiểm tra trọng lượng |
| `wt_don_boc_hang` | Đơn Bốc Hàng | Scale | Đơn bốc xếp hàng |
| `wt_lich_boc_hang` | Lịch Bốc Hàng | Scale | Lịch trình bốc hàng |

**Checklist Variants (Sub-types):**
```typescript
// Ví dụ: Work Type "Nhận hàng" có các variant:
checklistVariants: [
  { id: "nhanHang_kiemDem", name: "Kiểm đếm", isDefault: true },
  { id: "nhanHang_luuTru", name: "Lưu trữ" },
  { id: "nhanHang_thanhToan", name: "Thanh toán" },
]
```

---

### 5.4 Module Nhắn tin (Messaging)

**Vị trí:** `src/features/portal/workspace/ChatMain.tsx`, `src/data/mockMessages.ts`

**Chức năng:**
- Chat realtime trong nhóm
- Hỗ trợ text, hình ảnh, file đính kèm
- Reply tin nhắn
- Pin tin nhắn quan trọng

**Message Types:**
```typescript
type MessageType = "text" | "image" | "file" | "system";

interface Message {
  id: string;
  groupId: ID;
  senderId: ID;
  type: MessageType;
  content?: string;
  files?: FileAttachment[];
  replyTo?: { ... };         // Tin nhắn trả lời
  isPinned?: boolean;        // Tin nhắn ghim
  isSystem?: boolean;        // Tin hệ thống
}
```

---

### 5.5 Module Quản lý File (File Management)

**Vị trí:** `src/features/portal/components/FileManager.tsx`, `FileManagerPhase1A.tsx`

**Chức năng:**
- Quản lý file đính kèm trong nhóm
- Phân loại: Ảnh, PDF, Excel, Word
- Preview file trực tiếp

**File Types:**
```typescript
type AttachmentType = "pdf" | "excel" | "word" | "image" | "other";

interface FileAttachment {
  name: string;
  url: string;
  type: AttachmentType;
  size?: string;
}
```

---

### 5.6 Module Tổ chức (Organization)

**Vị trí:** `src/data/mockOrg.ts`

**Chức năng:**
- Quản lý phòng ban
- Quản lý nhân sự
- Phân quyền Leader/Staff

**Cấu trúc tổ chức demo:**

```
┌──────────────────────────────────────────────────────────┐
│                    ORGANIZATION                           │
├───────────────────────┬──────────────────────────────────┤
│    Phòng Kho Hàng     │        Phòng Vận Hành            │
│  (dep_kho_hang)       │      (dep_van_hanh)              │
├───────────────────────┼──────────────────────────────────┤
│ 👑 Thanh Trúc (Leader)│  👑 Huyền (Leader)               │
│ 👤 Thu An (Staff)     │  👤 Ngọc Vàng (Staff)            │
│ 👤 Diễm Chi (Staff)   │                                  │
│ 👤 Lệ Bình (Staff)    │                                  │
└───────────────────────┴──────────────────────────────────┘
```

---

### 5.7 Module Lead Monitor (Giám sát Leader)

**Vị trí:** `src/features/portal/lead/`

**Chức năng:**
- Giám sát hoạt động chat của team
- Xem danh sách thread đang hoạt động
- Thống kê công việc theo nhân viên

**Components:**
- `TeamMonitorView.tsx`: View chính cho Leader
- `ThreadTable.tsx`: Bảng danh sách thread
- `MemberSummary.tsx`: Tóm tắt theo thành viên

---

### 5.8 Module Checklist Template

**Vị trí:** `src/features/portal/components/ChecklistTemplatePanel.tsx`, `ChecklistTemplateSlideOver.tsx`

**Chức năng:**
- Định nghĩa template checklist cho từng loại việc
- Áp dụng template khi tạo task
- Tuỳ chỉnh checklist theo variant

**Template Structure:**
```typescript
type ChecklistTemplateMap = Record<
  string,               // workTypeId
  Record<
    string,             // checklistVariantId
    ChecklistTemplateItem[]
  >
>;

// Ví dụ:
{
  wt_nhan_hang: {
    nhanHang_kiemDem: [
      { id: "tpl_nh_kd_1", label: "Kiểm đếm số lượng thực tế" },
      { id: "tpl_nh_kd_2", label: "Đối chiếu với phiếu nhập" },
    ],
    nhanHang_luuTru: [
      { id: "tpl_nh_lt_1", label: "Chuyển hàng vào khu vực lưu trữ" },
      { id: "tpl_nh_lt_2", label: "Cập nhật vị trí trên hệ thống" },
    ],
  }
}
```

---

## 6. Data Flow

### 6.1 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                  PortalWireframes.tsx                            │
│                  (Central State Manager)                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ State Variables:                                          │    │
│  │ - messages, setMessages                                   │    │
│  │ - tasks, setTasks                                         │    │
│  │ - selectedGroup, setSelectedGroup                         │    │
│  │ - selectedWorkTypeId, setSelectedWorkTypeId               │    │
│  │ - pinnedMessages, setPinnedMessages                       │    │
│  │ - toasts, setToasts                                       │    │
│  │ - view (workspace | lead)                                 │    │
│  │ - viewMode (lead | staff)                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│              ┌─────────────┴─────────────┐                      │
│              ▼                           ▼                      │
│     ┌─────────────────┐         ┌─────────────────┐            │
│     │  WorkspaceView  │         │  TeamMonitorView │            │
│     │  (Props Down)   │         │   (Props Down)   │            │
│     └────────┬────────┘         └─────────────────┘            │
│              │                                                   │
│   ┌──────────┼──────────┐                                       │
│   ▼          ▼          ▼                                       │
│ LeftSidebar ChatMain RightPanel                                 │
│   (Props)   (Props)   (Props)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Message Flow khi tạo Task từ Message

```
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌───────────┐
│ Message │───▶│ Select Work │───▶│ AssignTask   │───▶│ Task      │
│ Bubble  │    │ Type + User │    │ Sheet        │    │ Created   │
│ (Pin)   │    │             │    │ (Form)       │    │           │
└─────────┘    └─────────────┘    └──────────────┘    └───────────┘
     │                                                       │
     │                                                       │
     ▼                                                       ▼
 onReceiveInfo()                                    tasks state updated
```

---

## 7. Component Architecture

### 7.1 UI Components Hierarchy

```
┌────────────────────────────────────────────────────────────┐
│ Base UI Components (components/ui/)                        │
│ Radix-based, headless, accessible                         │
├────────────────────────────────────────────────────────────┤
│ Button │ Dialog │ Sheet │ Popover │ Select │ Input │ ...  │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│ Portal Components (features/portal/components/)           │
│ Business-specific, styled                                  │
├────────────────────────────────────────────────────────────┤
│ Avatar │ Badge │ MessageBubble │ TaskChecklist │ ...      │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│ Feature Components (features/portal/workspace/)           │
│ Complex, composed                                          │
├────────────────────────────────────────────────────────────┤
│ WorkspaceView │ ChatMain │ RightPanel │ LeftSidebar │ ... │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│ Page Components                                            │
├────────────────────────────────────────────────────────────┤
│ PortalWireframes │ TeamMonitorView                         │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Key Components

| Component | File | Chức năng |
|-----------|------|-----------|
| `PortalWireframes` | `PortalWireframes.tsx` | Container chính, quản lý state |
| `WorkspaceView` | `WorkspaceView.tsx` | Layout workspace (3 cột) |
| `ChatMain` | `ChatMain.tsx` | Vùng chat chính |
| `RightPanel` | `RightPanel.tsx` | Panel bên phải (Info, Tasks) |
| `LeftSidebar` | `LeftSidebar.tsx` | Sidebar trái (Groups, Contacts) |
| `MainSidebar` | `MainSidebar.tsx` | Navigation sidebar chính |
| `MessageBubble` | `MessageBubble.tsx` | Render tin nhắn |
| `TaskChecklist` | `TaskChecklist.tsx` | Checklist trong task |

---

## 8. Đề xuất cải tiến

### 8.1 Kiến trúc
- [ ] Áp dụng State Management (Zustand/Jotai) thay vì lifting state
- [ ] Implement React Router cho routing
- [ ] Tách mock data thành API layer
- [ ] Thêm Error Boundaries

### 8.2 Performance
- [ ] Implement React.memo cho heavy components
- [ ] Virtualize danh sách tin nhắn dài
- [ ] Code splitting theo route

### 8.3 Tính năng
- [ ] Real-time sync với WebSocket
- [ ] Offline support với Service Worker
- [ ] Push notifications
- [ ] Search/Filter nâng cao

### 8.4 Testing
- [ ] Unit tests cho utilities
- [ ] Component tests với React Testing Library
- [ ] E2E tests với Playwright/Cypress

---

## 📝 Ghi chú

- Đây là mockup demo, chưa có backend integration
- Data được mock tĩnh trong thư mục `src/data/`
- UI được tối ưu cho 2 mode: Desktop và Mobile
- Brand color chính: Green (#38ae3c)

---

**© 2025 - Phân tích bởi Claude Opus 4.5 (GitHub Copilot)**
