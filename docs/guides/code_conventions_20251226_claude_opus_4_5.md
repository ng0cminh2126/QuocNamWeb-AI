# 📐 Code Conventions - Quoc Nam Portal

> **Version:** 1.0 - DRAFT  
> **Status:** 🔍 Pending Review  
> **Last updated:** 2025-12-26  
> **Model AI:** Claude Opus 4.5

---

## 📋 Mục Lục

1. [TypeScript Conventions](#1-typescript-conventions)
2. [React Component Conventions](#2-react-component-conventions)
3. [State Management Conventions](#3-state-management-conventions)
4. [API & Data Fetching Conventions](#4-api--data-fetching-conventions)
5. [Styling Conventions](#5-styling-conventions)
6. [File Organization Conventions](#6-file-organization-conventions)
7. [Testing Strategy](#7-testing-strategy)
8. [Testability Conventions (Playwright-Ready)](#8-testability-conventions-playwright-ready)
9. [Performance Conventions](#9-performance-conventions)

---

## 1. TypeScript Conventions

### 1.1 Type vs Interface

```typescript
// ✅ Use INTERFACE for object shapes (extensible)
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Use TYPE for unions, intersections, primitives
type UserRole = 'admin' | 'leader' | 'staff';
type ID = string;
type Nullable<T> = T | null;

// ✅ Extend interfaces
interface AdminUser extends User {
  permissions: string[];
}

// ❌ Avoid: Using type for simple objects
type User = {
  id: string;
  name: string;
};
```

### 1.2 Naming Conventions

```typescript
// Interfaces & Types: PascalCase
interface MessageProps { }
type TaskStatus = 'todo' | 'done';

// Variables & Functions: camelCase
const messageCount = 10;
function sendMessage() { }

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = '/api';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Enums: PascalCase with PascalCase members
enum HttpStatus {
  Ok = 200,
  NotFound = 404,
}

// Generic Type Parameters: Single uppercase letter or descriptive
function process<T>(data: T): T { }
function fetchList<TItem>(url: string): Promise<TItem[]> { }
```

### 1.3 Strict Mode Rules

```typescript
// ✅ Always enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

// ✅ Handle null/undefined explicitly
function getUser(id: string): User | null {
  // ...
}

const user = getUser('123');
if (user) {
  console.log(user.name); // Safe access
}

// ✅ Use optional chaining and nullish coalescing
const name = user?.name ?? 'Unknown';

// ❌ Avoid: Using 'any'
function process(data: any) { } // Bad!

// ✅ Use 'unknown' instead of 'any' when type is truly unknown
function process(data: unknown) {
  if (typeof data === 'string') {
    // Now TypeScript knows it's a string
  }
}
```

### 1.4 Import/Export Patterns

```typescript
// ✅ Named exports for utilities, hooks, types
export function useMessages() { }
export interface Message { }
export const API_URL = '/api';

// ✅ Default export only for React components
export default function ChatMain() { }

// ✅ Barrel exports in index.ts
// src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Dialog } from './dialog';

// ✅ Type-only imports
import type { Message, Task } from '@/types';
import { useMessages } from '@/hooks/queries/useMessages';

// ❌ Avoid: Mixing default and named exports in same file
export default function Component() { }
export const helper = () => { }; // Bad pattern!
```

---

## 2. React Component Conventions

### 2.1 Component Structure

```typescript
// ✅ Recommended order inside a component:
export default function ComponentName({ prop1, prop2 }: Props) {
  // 1️⃣ External hooks (queries, mutations, stores, router)
  const { data, isLoading } = useQuery(...);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // 2️⃣ Local state (useState)
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  // 3️⃣ Refs
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 4️⃣ Derived/computed values (useMemo)
  const filteredItems = useMemo(() => 
    items.filter(i => i.active), 
    [items]
  );
  
  // 5️⃣ Event handlers (useCallback for complex handlers)
  const handleSubmit = useCallback(() => {
    // ...
  }, [dependency]);
  
  const handleClick = () => {
    // Simple handlers don't need useCallback
  };
  
  // 6️⃣ Side effects (useEffect)
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // 7️⃣ Early returns (loading, error, empty states)
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (data.length === 0) return <EmptyState />;
  
  // 8️⃣ Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 2.2 Props Interface

```typescript
// ✅ Props interface ngay trên component
interface ChatMessageProps {
  /** Message ID */
  id: string;
  /** Message content */
  content: string;
  /** Sender information */
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** Whether this is current user's message */
  isMine?: boolean;
  /** Callback when message is clicked */
  onClick?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: React.ReactNode;
}

export default function ChatMessage({
  id,
  content,
  sender,
  isMine = false,
  onClick,
  className,
  children,
}: ChatMessageProps) {
  // ...
}
```

### 2.3 Component Patterns

```typescript
// ✅ Compound Components (for complex UI)
function Tabs({ children }: TabsProps) { ... }
Tabs.List = function TabsList({ children }: TabsListProps) { ... };
Tabs.Trigger = function TabsTrigger({ children }: TabsTriggerProps) { ... };
Tabs.Content = function TabsContent({ children }: TabsContentProps) { ... };

// Usage:
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
</Tabs>

// ✅ Render Props (for flexibility)
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => renderItem(item, i))}</ul>;
}

// ✅ Forwarding Refs
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => (
    <button ref={ref} className={cn('btn', variant)} {...props}>
      {children}
    </button>
  )
);
Button.displayName = 'Button';
```

### 2.4 Event Handler Naming

```typescript
// ✅ Prefix with 'handle' for internal handlers
const handleClick = () => { };
const handleSubmit = () => { };
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => { };

// ✅ Prefix with 'on' for props (callbacks from parent)
interface Props {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  onChange?: (value: string) => void;
}

// ✅ Be specific with names
const handleMessageSend = () => { };      // Good
const handleTaskStatusChange = () => { }; // Good
const handleClick = () => { };            // Too generic for complex components
```

---

## 3. State Management Conventions

### 3.1 When to Use What

```typescript
// 🔵 TanStack Query: Server state (data from API)
// - Messages, tasks, users from backend
// - Anything that needs to be synced with server
const { data } = useMessages(groupId);

// 🟢 Zustand: Global client state
// - User session, auth tokens
// - UI preferences (theme, sidebar open)
// - Cross-component state
const { user } = useAuthStore();

// 🟡 useState: Local component state
// - Form inputs
// - Modal open/close
// - Component-specific UI state
const [isOpen, setIsOpen] = useState(false);

// 🟠 useReducer: Complex local state
// - Multi-step forms
// - State with many related updates
const [state, dispatch] = useReducer(reducer, initialState);

// 🔴 Context: Rarely needed (Zustand replaces most use cases)
// - Theme provider
// - Compound component state
```

### 3.2 Zustand Store Structure

```typescript
// ✅ Separate state and actions clearly
interface AuthState {
  // === State ===
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  // === Actions ===
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: true 
      }),
      
      setTokens: (accessToken, refreshToken) => set({ 
        accessToken, 
        refreshToken 
      }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
      
      clearAuth: () => {
        // Can use get() to access current state
        const current = get();
        console.log('Clearing auth for:', current.user?.name);
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        // Only persist these fields
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

### 3.3 Query Key Factory Pattern

```typescript
// ✅ Centralized query keys for each module
// src/hooks/queries/keys.ts

export const messagesKeys = {
  all: ['messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (groupId: string, filters?: MessageFilters) => 
    [...messagesKeys.lists(), groupId, filters] as const,
  details: () => [...messagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...messagesKeys.details(), id] as const,
  pinned: (groupId: string) => 
    [...messagesKeys.all, 'pinned', groupId] as const,
};

export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...tasksKeys.lists(), filters] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
  logs: (taskId: string) => [...tasksKeys.all, 'logs', taskId] as const,
};

// Usage in invalidation:
queryClient.invalidateQueries({ queryKey: messagesKeys.lists() });
queryClient.invalidateQueries({ queryKey: tasksKeys.detail(taskId) });
```

---

## 4. API & Data Fetching Conventions

### 4.1 API Client Structure

```typescript
// src/api/messages.api.ts

import { apiClient } from './client';
import type { 
  Message, 
  MessagesResponse, 
  SendMessageRequest 
} from '@/types/messages';

/**
 * Get messages for a group with pagination
 */
export async function getMessages(
  groupId: string,
  params?: {
    workTypeId?: string;
    before?: string;
    limit?: number;
  }
): Promise<MessagesResponse> {
  const { data } = await apiClient.get(`/groups/${groupId}/messages`, { 
    params 
  });
  return data;
}

/**
 * Send a new message
 */
export async function sendMessage(
  groupId: string,
  payload: SendMessageRequest
): Promise<Message> {
  const { data } = await apiClient.post(
    `/groups/${groupId}/messages`, 
    payload
  );
  return data;
}

/**
 * Pin or unpin a message
 */
export async function pinMessage(
  messageId: string,
  isPinned: boolean
): Promise<Message> {
  const { data } = await apiClient.patch(
    `/messages/${messageId}/pin`,
    { isPinned }
  );
  return data;
}
```

### 4.2 Query Hook Structure

```typescript
// src/hooks/queries/useMessages.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMessages } from '@/api/messages.api';
import { messagesKeys } from './keys';

interface UseMessagesOptions {
  enabled?: boolean;
}

export function useMessages(
  groupId: string,
  workTypeId?: string,
  options: UseMessagesOptions = {}
) {
  return useInfiniteQuery({
    queryKey: messagesKeys.list(groupId, { workTypeId }),
    queryFn: ({ pageParam }) => 
      getMessages(groupId, { 
        workTypeId, 
        before: pageParam,
        limit: 50,
      }),
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.oldestMessageId : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 seconds
    enabled: options.enabled ?? true,
  });
}
```

### 4.3 Mutation Hook Structure

```typescript
// src/hooks/mutations/useSendMessage.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/api/messages.api';
import { messagesKeys } from '@/hooks/queries/keys';
import type { Message, SendMessageRequest } from '@/types/messages';

interface UseSendMessageOptions {
  groupId: string;
  workTypeId?: string;
  onSuccess?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useSendMessage({
  groupId,
  workTypeId,
  onSuccess,
  onError,
}: UseSendMessageOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: SendMessageRequest) => 
      sendMessage(groupId, payload),
    
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: messagesKeys.list(groupId, { workTypeId }) 
      });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(
        messagesKeys.list(groupId, { workTypeId })
      );
      
      // Optimistically update (optional)
      // ...
      
      return { previousMessages };
    },
    
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messagesKeys.list(groupId, { workTypeId }),
          context.previousMessages
        );
      }
      onError?.(err as Error);
    },
    
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: messagesKeys.list(groupId, { workTypeId }) 
      });
    },
  });
}
```

---

## 5. Styling Conventions

### 5.1 TailwindCSS Class Order

```tsx
// ✅ Recommended class order:
// 1. Layout (display, position)
// 2. Spacing (margin, padding)
// 3. Sizing (width, height)
// 4. Typography (font, text)
// 5. Visual (background, border, shadow)
// 6. Interactive (hover, focus, cursor)
// 7. Responsive (sm:, md:, lg:)

<div className="
  flex items-center justify-between
  p-4 gap-2
  w-full h-16
  text-sm font-medium text-gray-700
  bg-white border-b border-gray-200 shadow-sm
  hover:bg-gray-50 cursor-pointer
  md:p-6 lg:h-20
"/>
```

### 5.2 Using cn() Utility

```typescript
// ✅ Use cn() for conditional classes
import { cn } from '@/lib/utils';

function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(
        // Base styles
        'px-4 py-2 rounded-md font-medium transition-colors',
        // Variant styles
        {
          'bg-brand-500 text-white hover:bg-brand-600': variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200': variant === 'secondary',
          'border border-gray-300 hover:border-gray-400': variant === 'outline',
        },
        // Allow override via className prop
        className
      )}
      {...props}
    />
  );
}
```

### 5.3 Component-Specific Styles

```typescript
// ✅ Extract complex styles to variables
function MessageBubble({ isMine, content }: MessageBubbleProps) {
  const bubbleStyles = cn(
    'max-w-[70%] rounded-2xl px-4 py-2',
    isMine 
      ? 'bg-brand-500 text-white ml-auto rounded-br-sm' 
      : 'bg-gray-100 text-gray-900 mr-auto rounded-bl-sm'
  );
  
  const timeStyles = cn(
    'text-xs mt-1',
    isMine ? 'text-brand-100' : 'text-gray-400'
  );
  
  return (
    <div className={bubbleStyles}>
      <p>{content}</p>
      <span className={timeStyles}>12:30</span>
    </div>
  );
}
```

---

## 6. File Organization Conventions

### 6.1 Feature-Based Structure

```
src/features/[feature-name]/
├── components/          # Feature-specific components
│   ├── ComponentA.tsx
│   └── ComponentB.tsx
├── hooks/               # Feature-specific hooks (if needed)
├── utils/               # Feature-specific utilities
├── types.ts             # Feature-specific types (if small)
└── index.ts             # Barrel exports
```

### 6.2 Shared Components

```
src/components/
├── ui/                  # Base UI components (atomic)
│   ├── button.tsx
│   ├── input.tsx
│   └── index.ts
├── common/              # Common business components
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── index.ts
└── layout/              # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── index.ts
```

### 6.3 Index File (Barrel Export)

```typescript
// ✅ src/components/ui/index.ts
export { Button, type ButtonProps } from './button';
export { Input, type InputProps } from './input';
export { Dialog, DialogContent, DialogHeader } from './dialog';

// ✅ Usage
import { Button, Input, Dialog } from '@/components/ui';
```

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

```
                    ┌─────────┐
                    │   E2E   │  ← Playwright (ít nhất, chậm nhất, đắt nhất)
                   ─┴─────────┴─
                  ┌─────────────┐
                  │ Integration │  ← React Testing Library + MSW
                 ─┴─────────────┴─
                ┌─────────────────┐
                │    Unit Tests   │  ← Vitest (nhiều nhất, nhanh nhất)
               ─┴─────────────────┴─

Ratio mục tiêu: 70% Unit : 20% Integration : 10% E2E
```

### 7.2 Test Types & Tools

| Type | Tool | Mục đích | File Pattern |
|------|------|----------|--------------|
| **Unit** | Vitest | Test isolated logic, utils, hooks | `*.test.ts`, `*.spec.ts` |
| **Integration** | RTL + Vitest | Test component interactions | `*.integration.test.tsx` |
| **E2E** | Playwright | Test user flows end-to-end | `e2e/*.spec.ts` |

### 7.3 Test File Organization

```
project/
├── src/
│   ├── hooks/
│   │   ├── useMessages.ts
│   │   └── __tests__/
│   │       ├── useMessages.test.ts        # Unit test
│   │       └── useMessages.integration.test.ts  # Integration
│   ├── components/
│   │   └── MessageBubble/
│   │       ├── MessageBubble.tsx
│   │       ├── MessageBubble.test.tsx     # Unit test
│   │       └── MessageBubble.stories.tsx  # Storybook (optional)
│   └── utils/
│       ├── formatDate.ts
│       └── formatDate.test.ts             # Unit test
├── e2e/                                    # Playwright tests
│   ├── fixtures/
│   │   └── auth.fixture.ts
│   ├── pages/                             # Page Object Models
│   │   ├── login.page.ts
│   │   ├── chat.page.ts
│   │   └── task.page.ts
│   ├── specs/
│   │   ├── auth.spec.ts
│   │   ├── chat.spec.ts
│   │   └── task.spec.ts
│   └── playwright.config.ts
└── vitest.config.ts
```

### 7.4 Test Naming Conventions

```typescript
// ✅ Unit Test: Describe block = function/component name
describe('formatDate', () => {
  it('should format ISO date to readable string', () => {});
  it('should return "Just now" for dates within 1 minute', () => {});
  it('should throw error for invalid date', () => {});
});

// ✅ Integration Test: Describe = user action/flow
describe('MessageList Integration', () => {
  it('should load messages when component mounts', () => {});
  it('should show loading skeleton while fetching', () => {});
  it('should display error message when API fails', () => {});
});

// ✅ E2E Test: Describe = user journey
describe('Send Message Flow', () => {
  test('user can send a text message in group chat', async () => {});
  test('user can send a file attachment', async () => {});
  test('message appears in chat after sending', async () => {});
});
```

---

## 8. Testability Conventions (Playwright-Ready)

> **QUAN TRỌNG:** Tuân thủ các conventions này để Playwright E2E tests có thể chạy ổn định.

### 8.1 Data-TestId Attribute (BẮT BUỘC)

```typescript
// ✅ LUÔN thêm data-testid cho các elements quan trọng
// Naming: [component]-[element]-[identifier]

// Buttons
<Button data-testid="chat-send-button">Gửi</Button>
<Button data-testid="task-create-button">Tạo Task</Button>
<Button data-testid="modal-close-button">Đóng</Button>

// Inputs
<Input data-testid="chat-message-input" />
<Input data-testid="search-input" />
<Input data-testid="task-title-input" />

// Lists & Items (dùng dynamic id)
<ul data-testid="message-list">
  {messages.map(msg => (
    <li key={msg.id} data-testid={`message-item-${msg.id}`}>
      {msg.content}
    </li>
  ))}
</ul>

// Containers/Sections
<div data-testid="chat-main-container">
<div data-testid="sidebar-left">
<div data-testid="task-panel">

// States
<div data-testid="loading-skeleton">
<div data-testid="empty-state">
<div data-testid="error-state">
```

### 8.2 Data-TestId Naming Convention

```typescript
// Pattern: [feature]-[element]-[action/state/id]

// Features: chat, task, file, auth, sidebar, modal, toast
// Elements: button, input, list, item, panel, container, tab, badge
// Action/State: send, create, delete, edit, open, close, loading, error

// ✅ Examples
data-testid="chat-message-input"
data-testid="chat-send-button"
data-testid="chat-message-list"
data-testid="chat-message-item-123"

data-testid="task-create-button"
data-testid="task-status-badge"
data-testid="task-assignee-select"

data-testid="file-upload-button"
data-testid="file-list-container"
data-testid="file-item-456"

data-testid="modal-confirm-button"
data-testid="modal-cancel-button"

data-testid="toast-success"
data-testid="toast-error"
```

### 8.3 Semantic HTML (Accessibility + Testability)

```typescript
// ✅ Sử dụng semantic HTML - Playwright có thể query by role
<button>Submit</button>           // getByRole('button', { name: 'Submit' })
<input type="text" />             // getByRole('textbox')
<input type="checkbox" />         // getByRole('checkbox')
<a href="/home">Home</a>          // getByRole('link', { name: 'Home' })
<nav>...</nav>                    // getByRole('navigation')
<main>...</main>                  // getByRole('main')
<aside>...</aside>                // getByRole('complementary')
<dialog>...</dialog>              // getByRole('dialog')

// ✅ Labels cho form inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" />
// → getByLabel('Email')

// ✅ ARIA attributes khi cần
<button aria-label="Close modal">
  <XIcon />
</button>
// → getByRole('button', { name: 'Close modal' })

// ✅ Headings có cấu trúc
<h1>Chat Portal</h1>
<h2>Messages</h2>
// → getByRole('heading', { name: 'Messages', level: 2 })
```

### 8.4 Stable Selectors Priority

```typescript
// Playwright sẽ query theo thứ tự ưu tiên này:

// 1️⃣ BEST: getByRole (accessibility + semantic)
await page.getByRole('button', { name: 'Send Message' }).click();

// 2️⃣ GOOD: getByLabel (for form inputs)
await page.getByLabel('Email').fill('user@example.com');

// 3️⃣ GOOD: getByPlaceholder
await page.getByPlaceholder('Type a message...').fill('Hello');

// 4️⃣ GOOD: getByText (for static text)
await page.getByText('Welcome back!').isVisible();

// 5️⃣ RELIABLE: getByTestId (for dynamic/complex elements)
await page.getByTestId('message-item-123').click();
await page.getByTestId('chat-message-list').scrollTo('bottom');

// ❌ AVOID: CSS selectors (brittle)
await page.locator('.btn-primary').click();  // Bad!
await page.locator('#submit-btn').click();   // Bad!
await page.locator('div > button').click();  // Very bad!
```

### 8.5 Component Props for Testability

```typescript
// ✅ Accept testId prop để cho phép override
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  testId?: string;  // Optional test ID override
}

function Button({ 
  variant = 'primary', 
  testId,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button 
      data-testid={testId}
      className={cn('btn', variant)}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage:
<Button testId="submit-form-button">Submit</Button>
```

### 8.6 Waiting & Loading States

```typescript
// ✅ Có data-testid cho loading states để Playwright có thể wait
function MessageList({ messages, isLoading }: Props) {
  if (isLoading) {
    return (
      <div data-testid="message-list-loading">
        <Skeleton count={5} />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div data-testid="message-list-empty">
        <p>No messages yet</p>
      </div>
    );
  }
  
  return (
    <ul data-testid="message-list">
      {messages.map(msg => (
        <li 
          key={msg.id} 
          data-testid={`message-item-${msg.id}`}
        >
          {msg.content}
        </li>
      ))}
    </ul>
  );
}

// Playwright test:
test('should load messages', async ({ page }) => {
  // Wait for loading to finish
  await page.getByTestId('message-list-loading').waitFor({ state: 'hidden' });
  
  // Or wait for content to appear
  await page.getByTestId('message-list').waitFor({ state: 'visible' });
  
  // Then assert
  const items = page.getByTestId(/^message-item-/);
  await expect(items).toHaveCount(5);
});
```

### 8.7 Form Validation States

```typescript
// ✅ Data attributes cho validation states
<Input
  data-testid="email-input"
  data-valid={isValid}
  data-error={hasError}
  aria-invalid={hasError}
  aria-describedby={hasError ? 'email-error' : undefined}
/>
{hasError && (
  <span 
    id="email-error" 
    data-testid="email-error-message"
    role="alert"
  >
    {errorMessage}
  </span>
)}

// Playwright test:
test('should show validation error', async ({ page }) => {
  await page.getByTestId('email-input').fill('invalid-email');
  await page.getByTestId('submit-button').click();
  
  await expect(page.getByTestId('email-error-message')).toBeVisible();
  await expect(page.getByTestId('email-input')).toHaveAttribute('data-error', 'true');
});
```

### 8.8 Modal & Dialog Testing

```typescript
// ✅ Consistent test IDs cho modals
function ConfirmDialog({ isOpen, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;
  
  return (
    <div 
      role="dialog" 
      aria-modal="true"
      data-testid="confirm-dialog"
    >
      <div data-testid="confirm-dialog-content">
        <h2 data-testid="confirm-dialog-title">Xác nhận</h2>
        <p data-testid="confirm-dialog-message">Bạn có chắc chắn?</p>
        <div data-testid="confirm-dialog-actions">
          <Button 
            data-testid="confirm-dialog-cancel-button"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button 
            data-testid="confirm-dialog-confirm-button"
            onClick={onConfirm}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}

// Playwright test:
test('should confirm delete action', async ({ page }) => {
  await page.getByTestId('delete-task-button').click();
  
  // Wait for dialog
  await page.getByTestId('confirm-dialog').waitFor({ state: 'visible' });
  
  // Confirm
  await page.getByTestId('confirm-dialog-confirm-button').click();
  
  // Dialog should close
  await page.getByTestId('confirm-dialog').waitFor({ state: 'hidden' });
});
```

### 8.9 E2E Test Configuration Example

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 8.10 Page Object Model Pattern

```typescript
// e2e/pages/chat.page.ts
import { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messageList: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.messageInput = page.getByTestId('chat-message-input');
    this.sendButton = page.getByTestId('chat-send-button');
    this.messageList = page.getByTestId('chat-message-list');
  }
  
  async goto(groupId: string) {
    await this.page.goto(`/portal/chat/${groupId}`);
  }
  
  async sendMessage(content: string) {
    await this.messageInput.fill(content);
    await this.sendButton.click();
  }
  
  async getMessageCount() {
    return await this.page.getByTestId(/^message-item-/).count();
  }
  
  async waitForMessageSent(content: string) {
    await this.page.getByText(content).waitFor({ state: 'visible' });
  }
}

// e2e/specs/chat.spec.ts
import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/chat.page';

test.describe('Chat Feature', () => {
  let chatPage: ChatPage;
  
  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.goto('group-123');
  });
  
  test('user can send a message', async () => {
    await chatPage.sendMessage('Hello, world!');
    await chatPage.waitForMessageSent('Hello, world!');
    
    const count = await chatPage.getMessageCount();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 9. Performance Conventions

### 8.1 Memoization

```typescript
// ✅ useMemo for expensive computations
const filteredMessages = useMemo(
  () => messages.filter(m => m.type === selectedType),
  [messages, selectedType]
);

// ✅ useCallback for handlers passed to children
const handleItemClick = useCallback(
  (id: string) => {
    setSelectedId(id);
  },
  [setSelectedId]
);

// ❌ Don't over-optimize simple values
const count = useMemo(() => items.length, [items]); // Unnecessary!
const count = items.length; // Just use directly
```

### 8.2 React.memo

```typescript
// ✅ Use React.memo for pure presentational components
// that receive stable props but parent re-renders often

interface MessageItemProps {
  id: string;
  content: string;
  sender: string;
}

const MessageItem = React.memo(function MessageItem({
  id,
  content,
  sender,
}: MessageItemProps) {
  return (
    <div className="message-item">
      <strong>{sender}</strong>
      <p>{content}</p>
    </div>
  );
});

// ❌ Don't wrap everything in memo
// Only use when profiling shows unnecessary re-renders
```

### 8.3 Code Splitting

```typescript
// ✅ Lazy load heavy components
const TeamMonitorView = React.lazy(
  () => import('@/features/portal/lead/TeamMonitorView')
);

// Usage with Suspense
<Suspense fallback={<PageSkeleton />}>
  <TeamMonitorView />
</Suspense>

// ✅ Lazy load routes
const routes = [
  {
    path: '/portal/lead',
    element: React.lazy(() => import('@/features/portal/lead/TeamMonitorView')),
  },
];
```

---

## 📝 Review Notes

**Các điểm cần team review:**

1. **TypeScript strictness:** Có nên bật tất cả strict options không?
2. **Component size limit:** Nên set max lines per component? (đề xuất: 300 lines)
3. **Test coverage targets:**
   - Unit tests: 80% cho utils, hooks
   - Integration tests: 60% cho components
   - E2E tests: Cover critical user flows (login, send message, create task)
4. **Performance budget:** Set bundle size limits?
5. **Naming conventions:** Có case nào cần điều chỉnh?
6. **data-testid enforcement:** Có nên dùng ESLint rule để bắt buộc không?

---

## 📦 Testing Dependencies

```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.50.0",
    "msw": "^2.7.0",
    "@vitest/coverage-v8": "^3.0.0"
  }
}
```

---

**© 2025 - Quoc Nam Portal Team**
