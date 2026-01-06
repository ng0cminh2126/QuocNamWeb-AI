# 📋 Plan: Remove Hard Code & Responsive Design

> **Feature:** Conversation Detail  
> **Module:** Chat  
> **Created:** 2026-01-06  
> **Status:** ⏳ PENDING APPROVAL

---

## 🎯 Objectives

1. **Loại bỏ hard code data** còn lại trong Portal
2. **Implement responsive design** cho màn home (WorkspaceView)
3. **Tối ưu UX** cho mobile/tablet

---

## 🔍 PHẦN 1: PHÂN TÍCH HARD CODE CÒN LẠI

### Hard Code Locations Found

| File                     | Hard Code                             | Impact | Priority |
| ------------------------ | ------------------------------------- | ------ | -------- |
| `ChatMessagePanel.tsx`   | `mockMessagesByWorkType`              | Medium | HIGH     |
| `PortalWireframes.tsx`   | `mockGroups`, `mockContacts`          | High   | HIGH     |
| `PortalWireframes.tsx`   | `mockTasks`                           | Medium | HIGH     |
| `PortalWireframes.tsx`   | `mockGroup_VH_Kho`, `mockDepartments` | Low    | MEDIUM   |
| `FileManagerPhase1A.tsx` | `mockMessagesByWorkType`              | Low    | MEDIUM   |

### Dependency Graph

```
PortalWireframes.tsx (Main Entry)
├── mockGroups → ConversationListSidebar
├── mockContacts → ConversationListSidebar
├── mockTasks → WorkspaceView (TaskList)
└── mockMessagesByWorkType → WorkspaceView

WorkspaceView.tsx
├── ChatMessagePanel.tsx
│   └── mockMessagesByWorkType (DUPLICATE)
└── ConversationDetailPanel.tsx
    └── FileManagerPhase1A.tsx
        └── mockMessagesByWorkType (DUPLICATE)
```

**Root cause:** PortalWireframes.tsx đang pass mock data xuống components

---

## 📱 PHẦN 2: RESPONSIVE STRATEGY ANALYSIS

### Option A: Adaptive Components (RECOMMENDED ✅)

**Approach:** Single codebase, responsive CSS + conditional rendering

```tsx
// Single component adapts to screen size
<WorkspaceView className="responsive-workspace">
  {/* Mobile: Stack vertically */}
  {/* Desktop: 3-column layout */}
</WorkspaceView>
```

**Pros:**

- ✅ Maintainable: 1 codebase cho tất cả devices
- ✅ Seamless: Resize window thì UI tự adapt
- ✅ Code reuse: Không duplicate logic
- ✅ Modern UX: Như Telegram, Slack, Discord

**Cons:**

- ⚠️ Phức tạp hơn về CSS/layout logic
- ⚠️ Cần test kỹ nhiều breakpoints

**Implementation:**

```scss
// Breakpoints
$mobile: 640px;
$tablet: 1024px;
$desktop: 1280px;

.workspace-view {
  // Mobile: Single column
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
  }

  // Tablet: 2 columns
  @media (min-width: $mobile + 1) and (max-width: $tablet) {
    grid-template-columns: 300px 1fr;
  }

  // Desktop: 3 columns
  @media (min-width: $tablet + 1) {
    grid-template-columns: 280px 1fr 360px;
  }
}
```

---

### Option B: Separate Mobile/Desktop Components (NOT RECOMMENDED ❌)

**Approach:** Tách riêng `<WorkspaceViewMobile>` và `<WorkspaceViewDesktop>`

```tsx
{
  isMobile ? <WorkspaceViewMobile /> : <WorkspaceViewDesktop />;
}
```

**Pros:**

- ✅ Đơn giản về mặt logic mỗi component
- ✅ Tối ưu performance cho từng device

**Cons:**

- ❌ Duplicate code: Logic bị lặp lại
- ❌ Maintenance hell: Sửa feature phải sửa 2 chỗ
- ❌ Poor UX: Resize window phải reload
- ❌ Outdated pattern: Không ai làm vậy nữa

**Verdict:** KHÔNG NÊN dùng approach này

---

### Option C: Reload Prompt on Device Change (STRONGLY NOT RECOMMENDED ❌❌)

**Approach:** Hiển thị "Vui lòng reload lại trang" khi đổi device

```tsx
if (deviceChanged) {
  return <ReloadPrompt />;
}
```

**Pros:**

- ✅ (Không có)

**Cons:**

- ❌ UX tệ: User phải reload manually
- ❌ Anti-pattern: Như web thời 2005
- ❌ Mất state: Lose conversation context
- ❌ Unprofessional: Không ai chấp nhận được

**Verdict:** TUYỆT ĐỐI KHÔNG dùng

---

## ✅ RECOMMENDED STRATEGY: Adaptive Components + Progressive Enhancement

### Core Principles

1. **Mobile-first Design**
   - Base styles cho mobile
   - Enhance dần lên tablet/desktop
2. **Single Source of Truth**
   - 1 component, nhiều breakpoints
   - Shared logic, conditional UI
3. **Graceful Degradation**
   - Desktop features có thể hide trên mobile
   - Mobile có thể có bottom navigation
4. **Seamless Resize**
   - Window resize → UI auto-adapt
   - No reload required

### UI Breakdown by Screen Size

#### 📱 Mobile (<640px)

```
┌─────────────────┐
│  Header + Nav   │ ← Sticky top
├─────────────────┤
│                 │
│  Single Panel   │ ← Stack navigation
│  (Show 1 at a   │   - List view
│   time)         │   - Chat view
│                 │   - Detail view
│                 │
├─────────────────┤
│  Bottom Nav     │ ← Tabs: Chats | Tasks | Profile
└─────────────────┘
```

**Mobile Navigation:**

- Show conversation list by default
- Tap conversation → Full screen chat
- Back button → Return to list
- Right panel → Modal/Sheet overlay

#### 📱 Tablet (640px - 1024px)

```
┌─────────────────────────────────┐
│         Header + Nav            │
├──────────┬──────────────────────┤
│          │                      │
│  List    │   Chat Panel         │
│  Sidebar │   (Main focus)       │
│          │                      │
│  280px   │   Remaining width    │
│          │                      │
├──────────┴──────────────────────┤
│     Bottom Nav (optional)       │
└─────────────────────────────────┘
```

**Tablet Layout:**

- 2-column layout
- Sidebar persistent
- Right panel → Modal overlay (on demand)

#### 💻 Desktop (>1024px)

```
┌────────────────────────────────────────────┐
│              Header + Nav                  │
├──────────┬──────────────┬──────────────────┤
│          │              │                  │
│  List    │  Chat Panel  │  Right Panel     │
│  Sidebar │  (Messages)  │  (Info/Files)    │
│          │              │                  │
│  280px   │  Flexible    │  360px           │
│          │              │  (collapsible)   │
│          │              │                  │
└──────────┴──────────────┴──────────────────┘
```

**Desktop Layout:**

- Full 3-column layout
- Right panel collapsible
- Keyboard shortcuts enabled

---

## 📐 RESPONSIVE IMPLEMENTATION STRATEGY

### Approach: CSS Grid + Conditional Rendering

```tsx
<div className="workspace-container">
  {/* Left: Conversation List */}
  <aside className="conversation-sidebar">
    {/* Always visible on desktop/tablet */}
    {/* Hidden when chat open on mobile */}
  </aside>

  {/* Center: Chat Messages */}
  <main className="chat-main">
    {/* Full screen on mobile when selected */}
    {/* Flexible width on desktop/tablet */}
  </main>

  {/* Right: Detail Panel */}
  <aside className="detail-panel">
    {/* Collapsible on desktop */}
    {/* Modal/Sheet on mobile/tablet */}
  </aside>
</div>
```

### CSS Grid Implementation

```css
.workspace-container {
  display: grid;
  height: 100vh;

  /* Mobile: Single column, stack navigation */
  grid-template-columns: 1fr;
  grid-template-areas: "main";

  /* Tablet: 2 columns */
  @media (min-width: 640px) {
    grid-template-columns: 280px 1fr;
    grid-template-areas: "sidebar main";
  }

  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: 280px 1fr 360px;
    grid-template-areas: "sidebar main detail";
  }

  /* When detail panel collapsed */
  &.detail-collapsed {
    @media (min-width: 1024px) {
      grid-template-columns: 280px 1fr;
      grid-template-areas: "sidebar main";
    }
  }
}
```

---

## 🎯 PHẦN 3: IMPLEMENTATION PLAN (STEP-BY-STEP)

### Phase 1: Remove Hard Code (Week 1)

#### Task 1.1: Create Conversation List API Integration

**File:** `src/hooks/queries/useConversations.ts`

```typescript
// New hook to replace mockGroups + mockContacts
export function useConversations() {
  return useQuery({
    queryKey: conversationsKeys.all(),
    queryFn: getConversations,
  });
}
```

**Replace in:**

- ❌ `mockGroups as sidebarGroups`
- ❌ `mockContacts`
- ✅ `const { data: conversations } = useConversations()`

#### Task 1.2: Replace mockTasks with API

**File:** `src/hooks/queries/useTasks.ts`

```typescript
export function useTasks() {
  return useQuery({
    queryKey: tasksKeys.all(),
    queryFn: getTasks,
  });
}
```

**Replace in:**

- ❌ `useState(() => structuredClone(mockTasks))`
- ✅ `const { data: tasks } = useTasks()`

#### Task 1.3: Remove mockMessagesByWorkType

**Already done via:**

- ✅ `useMessages(conversationId, workTypeId)` hook exists
- ✅ ChatMessagePanel uses `useMessages`

**Remaining work:**

- Remove import from `ChatMessagePanel.tsx`
- Remove import from `FileManagerPhase1A.tsx`
- Verify no fallback to mock data

**Files to update:**

```
src/features/portal/
├── PortalWireframes.tsx          # Remove all mock imports
├── workspace/
│   ├── ChatMessagePanel.tsx      # Remove mockMessagesByWorkType
│   └── WorkspaceView.tsx         # Accept API data as props
└── components/
    └── FileManagerPhase1A.tsx    # Use messages from props
```

**Checklist:**

- [ ] Remove all `import ... from "@/data/..."` in portal files
- [ ] Replace with hooks: `useConversations()`, `useTasks()`, `useMessages()`
- [ ] Update WorkspaceView to accept real data
- [ ] Test all features still work

---

### Phase 2: Responsive Foundation (Week 2)

#### Task 2.1: Setup Responsive Utilities

**File:** `src/hooks/useResponsive.ts`

```typescript
export function useResponsive() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize("mobile");
      else if (width < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile: screenSize === "mobile",
    isTablet: screenSize === "tablet",
    isDesktop: screenSize === "desktop",
    screenSize,
  };
}
```

#### Task 2.2: Create Responsive Layout Components

**Files to create:**

```
src/features/portal/layouts/
├── ResponsiveWorkspace.tsx       # Main responsive container
├── MobileNavigation.tsx          # Bottom nav for mobile
├── TabletLayout.tsx              # 2-column layout
└── DesktopLayout.tsx             # 3-column layout
```

#### Task 2.3: CSS Grid System

**File:** `src/styles/responsive.css`

```css
/* Breakpoints */
:root {
  --breakpoint-mobile: 640px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1280px;
}

/* Grid containers */
.workspace-grid {
  display: grid;
  height: 100vh;
  overflow: hidden;
}

/* Mobile: Stack */
@media (max-width: 639px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .conversation-sidebar {
    display: var(--sidebar-mobile-display, none);
  }

  .chat-main {
    display: var(--chat-mobile-display, block);
  }
}

/* Tablet: 2-col */
@media (min-width: 640px) and (max-width: 1023px) {
  .workspace-grid {
    grid-template-columns: 280px 1fr;
  }
}

/* Desktop: 3-col */
@media (min-width: 1024px) {
  .workspace-grid {
    grid-template-columns: 280px 1fr var(--detail-panel-width, 360px);
  }

  .workspace-grid.detail-collapsed {
    grid-template-columns: 280px 1fr;
  }
}
```

---

### Phase 3: Mobile Adaptations (Week 3)

#### Task 3.1: Mobile Navigation State

**File:** `src/features/portal/workspace/WorkspaceView.tsx`

```typescript
function WorkspaceView() {
  const { isMobile } = useResponsive();
  const [mobileView, setMobileView] = useState<"list" | "chat" | "detail">(
    "list"
  );

  // Mobile: Show one panel at a time
  if (isMobile) {
    return (
      <div className="workspace-mobile">
        {mobileView === "list" && (
          <ConversationListSidebar
            onSelectConversation={(id) => {
              setSelectedConversation(id);
              setMobileView("chat");
            }}
          />
        )}

        {mobileView === "chat" && (
          <>
            <MobileHeader onBack={() => setMobileView("list")} />
            <ChatMessagePanel />
          </>
        )}

        {mobileView === "detail" && (
          <DetailPanel onClose={() => setMobileView("chat")} />
        )}

        <MobileBottomNav currentView={mobileView} onChange={setMobileView} />
      </div>
    );
  }

  // Desktop/Tablet: Multi-column
  return <DesktopWorkspace />;
}
```

#### Task 3.2: Mobile Components

**Components to create:**

1. **MobileHeader.tsx**

   ```tsx
   <header className="mobile-header">
     <button onClick={onBack}>← Back</button>
     <h1>{conversationName}</h1>
     <button onClick={onShowDetail}>ℹ️</button>
   </header>
   ```

2. **MobileBottomNav.tsx**

   ```tsx
   <nav className="mobile-bottom-nav">
     <button>💬 Chats</button>
     <button>✅ Tasks</button>
     <button>👤 Profile</button>
   </nav>
   ```

3. **MobileDetailSheet.tsx**
   ```tsx
   <Sheet open={showDetail}>
     <ConversationDetailPanel />
   </Sheet>
   ```

---

### Phase 4: Touch Optimizations (Week 4)

#### Task 4.1: Touch Gestures

- Swipe right: Back to conversation list
- Swipe left: Open detail panel
- Pull to refresh: Reload messages
- Long press: Message context menu

#### Task 4.2: Mobile UX Enhancements

- Larger tap targets (min 44px)
- Sticky headers on scroll
- Virtual scrolling for long lists
- Optimized animations (CSS transform)

#### Task 4.3: Accessibility

- Focus management for keyboard
- Screen reader announcements
- High contrast mode
- Reduced motion support

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Hard Code Removal ✅

- [ ] Create `useConversations()` hook
- [ ] Create `useTasks()` hook
- [ ] Remove `mockGroups` from PortalWireframes
- [ ] Remove `mockContacts` from PortalWireframes
- [ ] Remove `mockTasks` from PortalWireframes
- [ ] Remove `mockMessagesByWorkType` from ChatMessagePanel
- [ ] Remove `mockMessagesByWorkType` from FileManagerPhase1A
- [ ] Update WorkspaceView props to use real data
- [ ] Test all features work without mocks

### Phase 2: Responsive Foundation ✅

- [ ] Create `useResponsive()` hook
- [ ] Setup CSS Grid system
- [ ] Create breakpoint variables
- [ ] Implement responsive workspace container
- [ ] Test layout adapts on window resize

### Phase 3: Mobile Implementation ✅

- [ ] Implement mobile navigation state
- [ ] Create MobileHeader component
- [ ] Create MobileBottomNav component
- [ ] Create MobileDetailSheet component
- [ ] Implement stack navigation
- [ ] Test on real mobile devices

### Phase 4: Touch & UX ✅

- [ ] Add swipe gestures
- [ ] Optimize tap targets
- [ ] Add pull-to-refresh
- [ ] Test accessibility
- [ ] Performance testing

---

## 🎯 SUCCESS METRICS

| Metric                   | Target         |
| ------------------------ | -------------- |
| Zero hard code imports   | 100%           |
| Mobile viewport support  | <640px         |
| Tablet viewport support  | 640px - 1024px |
| Desktop viewport support | >1024px        |
| Lighthouse Mobile Score  | >90            |
| Touch target min size    | 44px           |
| First Contentful Paint   | <1.5s          |

---

## 🚨 RISKS & MITIGATION

| Risk                       | Impact | Mitigation                                |
| -------------------------- | ------ | ----------------------------------------- |
| API not ready              | HIGH   | Use API contracts + mock server           |
| Performance on old devices | MEDIUM | Progressive enhancement, lazy load        |
| Complex CSS breakpoints    | MEDIUM | Use CSS Grid, avoid custom breakpoints    |
| Touch gesture conflicts    | LOW    | Use well-tested library (react-swipeable) |

---

## 👤 HUMAN DECISIONS NEEDED

| #   | Question                 | Options                                                              | Decision      |
| --- | ------------------------ | -------------------------------------------------------------------- | ------------- |
| 1   | Responsive strategy?     | A) Adaptive Components ✅<br>B) Separate Mobile/Desktop ❌           | ⬜ **\_\_\_** |
| 2   | Mobile bottom nav?       | A) Yes (Like Telegram)<br>B) No (Hamburger menu)                     | ⬜ **\_\_\_** |
| 3   | Detail panel on mobile?  | A) Full-screen modal<br>B) Bottom sheet<br>C) Swipe from right       | ⬜ **\_\_\_** |
| 4   | Timeline for completion? | A) 4 weeks (recommended)<br>B) 2 weeks (rushed)<br>C) 6 weeks (safe) | ⬜ **\_\_\_** |

---

## ✅ RECOMMENDED DECISIONS

**Từ góc độ kỹ thuật, tôi khuyến nghị:**

1. **Responsive Strategy:** Option A - Adaptive Components
   - Modern, maintainable, seamless UX
   - Tham khảo: Telegram Web, Slack, Discord
2. **Mobile Bottom Nav:** Yes
   - Thumb-friendly navigation
   - Standard mobile pattern
3. **Detail Panel on Mobile:** Bottom Sheet
   - Native mobile UX
   - Easy to dismiss
   - Partial screen overlay
4. **Timeline:** 4 weeks
   - Week 1: Hard code removal
   - Week 2: Responsive foundation
   - Week 3: Mobile implementation
   - Week 4: Testing & polish

---

## 📞 NEXT STEPS

1. **HUMAN Review & Approve:** Điền decisions table
2. **Create API Contracts:** Nếu API chưa có
3. **Setup Test Environment:** Mobile/Tablet devices
4. **Kick-off Phase 1:** Remove hard code

---

## 👤 HUMAN CONFIRMATION

- [ ] Đã review toàn bộ plan
- [ ] Đã điền Pending Decisions
- [ ] Đồng ý với recommended strategy
- [ ] **✅ APPROVED to proceed**

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

---

**Last Updated:** 2026-01-06  
**Version:** 1.0  
**Status:** ⏳ Awaiting HUMAN approval
