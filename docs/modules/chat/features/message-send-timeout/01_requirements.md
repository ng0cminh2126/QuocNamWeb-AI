# [BƯỚC 1] Requirements - Message Send Timeout & Retry UI

**Feature:** Message Send Timeout & Retry UI  
**Module:** Chat  
**Version:** 1.0  
**Status:** ✅ APPROVED  
**Created:** 2026-01-13

---

## 📋 Overview

Khi người dùng gửi tin nhắn và mất kết nối internet, UI hiện tại chỉ hiển thị loading spinner xoay vô thời hạn mà không có feedback về:

- Thời gian còn lại trước khi timeout
- Trạng thái retry (đang thử lại lần thứ mấy)
- Lỗi mất mạng khi hết retry
- Nút "Thử lại" để người dùng tự retry thủ công

**Vấn đề hiện tại:**

1. `useSendMessage` có retry logic (3 lần: 1s, 2s, 4s) nhưng không có **total timeout**
2. UI không hiển thị trạng thái retry → người dùng không biết đang retry hay bị treo
3. Khi hết 3 retry, toast error xuất hiện nhưng tin nhắn đã biến mất → người dùng mất context
4. Không có cách nào retry lại ngoài việc gõ lại tin nhắn từ đầu

---

## 🎯 Requirements

### 1. Functional Requirements

#### FR-1: Total Timeout for Send Message

- **Mô tả:** Toàn bộ quá trình gửi tin nhắn (bao gồm retry) PHẢI có thời gian timeout tối đa
- **Chi tiết:**
  - Timeout = 15 giây (bao gồm cả 3 lần retry)
  - Nếu sau 15s mà chưa thành công → dừng và báo lỗi "Mất kết nối mạng"
  - Lưu tin nhắn failed vào localStorage (đã có sẵn trong `addFailedMessage`)

#### FR-2: Retry Status Display

- **Mô tả:** UI phải hiển thị trạng thái retry khi đang thử gửi lại
- **Chi tiết:**
  - Trong bubble tin nhắn: Hiển thị "Đang gửi (lần 1/3)..." thay vì chỉ spinner
  - Trong bubble tin nhắn: Hiển thị "Đang thử lại (lần 2/3)..." khi retry
  - Timer countdown: "Còn 12s..."

#### FR-3: Failed Message UI

- **Mô tả:** Tin nhắn failed phải hiển thị trong danh sách với trạng thái lỗi
- **Chi tiết:**
  - Bubble tin nhắn có border đỏ hoặc background màu lỗi (red-50)
  - Icon lỗi (AlertCircle) thay vì checkmark
  - Text lỗi: "Gửi thất bại - Mất kết nối mạng"
  - Nút "Thử lại" để retry

#### FR-4: Manual Retry Button

- **Mô tả:** Người dùng có thể retry tin nhắn failed thủ công
- **Chi tiết:**
  - Nút "Thử lại" trong bubble failed message
  - Khi click → gọi lại `sendMessageMutation.mutate()` với cùng payload
  - Nếu thành công → remove khỏi failed queue
  - Nếu thất bại lần nữa → giữ nguyên UI failed

#### FR-5: Network Error Detection

- **Mô tả:** Phát hiện lỗi network offline vs server error
- **Chi tiết:**
  - Lỗi `ERR_NETWORK` hoặc `NETWORK_ERROR` → "Mất kết nối mạng"
  - Lỗi timeout (15s) → "Mất kết nối mạng"
  - Lỗi server 500 → "Lỗi server, vui lòng thử lại sau"

### 2. UI Requirements

#### UI-1: Message Bubble States

```
┌─────────────────────────────────────┐
│ [Sending State - 0-5s]              │
│ ┌─────────────────────────────────┐ │
│ │ Hello world                     │ │
│ │ ⏱️ Đang gửi... (Còn 10s)        │ │
│ │ [Spinner]                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [Retry State - after 1st fail]     │
│ ┌─────────────────────────────────┐ │
│ │ Hello world                     │ │
│ │ 🔄 Đang thử lại (2/3)...        │ │
│ │ [Spinner]                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [Failed State - after timeout]     │
│ ┌─────────────────────────────────┐ │
│ │ Hello world                     │ │
│ │ ❌ Gửi thất bại - Mất mạng      │ │
│ │ [Thử lại]                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [Success State]                     │
│ ┌─────────────────────────────────┐ │
│ │ Hello world                     │ │
│ │ ✓ 10:30                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### UI-2: Loading Button State

- Send button DISABLED khi đang sending/retrying
- Button text: "Đang gửi..." thay vì "Gửi"
- Spinner icon trong button

### 3. Technical Requirements

#### TECH-1: Timeout Implementation

- Sử dụng `AbortController` với timeout 15s
- Pass `signal` vào axios request
- Khi timeout → abort request và throw error

#### TECH-2: Retry Counter

- `useSendMessage` phải track số lần retry hiện tại
- Expose `retryCount` và `maxRetries` trong mutation state
- Component có thể subscribe vào state để hiển thị UI

#### TECH-3: Failed Message Queue

- Sử dụng localStorage `failedMessages` đã có
- Structure:
  ```typescript
  {
    id: string,
    content: string,
    attachedFileIds: string[],
    workspaceId: string,
    conversationId: string,
    retryCount: number,
    lastError: string,
    timestamp: number
  }
  ```

#### TECH-4: Optimistic UI với Failed State

- Tin nhắn được add vào cache ngay lập tức với `status: "sending"`
- Khi retry → update status = "retrying"
- Khi failed → update status = "failed"
- Khi success → remove temp message, SignalR sẽ add real message

### 4. Security Requirements

- None (không liên quan security)

---

## 🎨 User Flow

```
User nhập tin nhắn → Click "Gửi"
    ↓
[UI] Tin nhắn xuất hiện với "Đang gửi... (Còn 15s)"
    ↓
[API] Call sendMessage() với AbortSignal (timeout 15s)
    ↓
┌─────────────────────────────────────┐
│ Nếu thành công trong 15s:          │
│   → SignalR nhận message            │
│   → UI update thành "✓ 10:30"       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Nếu fail lần 1 (network error):    │
│   → Retry sau 1s                    │
│   → UI: "Đang thử lại (2/3)..."    │
│   → Nếu fail lần 2 → retry sau 2s  │
│   → UI: "Đang thử lại (3/3)..."    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Nếu timeout 15s hoặc hết 3 retry:  │
│   → Save to failedMessages queue    │
│   → UI: "❌ Gửi thất bại - Mất mạng"│
│   → Show button "Thử lại"           │
└─────────────────────────────────────┘
    ↓
User click "Thử lại"
    ↓
Lặp lại flow từ đầu
```

---

## 📊 Impact Summary

### Files sẽ tạo mới:

- `src/hooks/useMessageSendTimeout.ts` - Hook quản lý timeout và retry counter
- `src/components/MessageStatusIndicator.tsx` - Component hiển thị status (sending/retrying/failed)
- `src/utils/__tests__/messageTimeout.test.ts` - Unit test cho timeout logic

### Files sẽ sửa đổi:

#### 1. `src/hooks/mutations/useSendMessage.ts`

- Thêm AbortController với timeout 15s
- Track retry counter (currentRetry)
- Update error handling để phân biệt timeout vs network vs server error
- Return retry state để component subscribe

#### 2. `src/features/portal/components/chat/MessageBubbleSimple.tsx`

- Thêm UI state: "sending" | "retrying" | "failed" | "sent"
- Hiển thị MessageStatusIndicator component
- Hiển thị nút "Thử lại" khi failed
- Handle click retry button

#### 3. `src/features/portal/components/chat/ChatMainContainer.tsx`

- Subscribe vào sendMessageMutation.retryCount
- Pass retry state xuống MessageBubbleSimple
- Handle retry click → gọi lại mutate()

#### 4. `src/utils/retryLogic.ts`

- Expose `currentRetry` parameter để component track
- Thêm callback `onRetry(retryCount)` để notify UI

#### 5. `src/utils/errorHandling.ts`

- Thêm detection cho timeout error
- Map timeout → "Mất kết nối mạng"

### Dependencies sẽ thêm:

- Không có (sử dụng built-in AbortController)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                      | Lựa chọn                        | HUMAN Decision        |
| --- | --------------------------- | ------------------------------- | --------------------- |
| 1   | Total timeout duration      | 10s, 15s, or 20s?               | ⬜ **10s**            |
| 2   | Retry count display         | Show "2/3" or "Retry 2"?        | ⬜ **Thử lại 2/3**    |
| 3   | Timer countdown             | Show "Còn 12s" or just spinner? | ⬜ **just spinner**   |
| 4   | Failed message auto-remove  | Keep forever or auto-hide 30s?  | ⬜ **auto-hide 30s**  |
| 5   | Retry button position       | Inside bubble or below bubble?  | ⬜ **below bubble**   |
| 6   | Optimistic UI with temp ID  | Use temp ID or wait for server? | ⬜ **Use temp ID**    |
| 7   | Network offline detection   | Use `navigator.onLine` API?     | ⬜ **Có dùng**        |
| 8   | Failed message notification | Toast + inline or just inline?  | ⬜ **Toast + inline** |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Requirements    | ✅ Đã review |
| Đã điền Pending Decisions | ✅ Đã điền   |
| **APPROVED để tiếp tục**  | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-13

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo wireframe/flow/implementation nếu mục "APPROVED để tiếp tục" = ⬜ CHƯA APPROVED**

---

## 📝 Notes

- Feature này cải thiện UX khi mất mạng, giảm frustration cho người dùng
- Sử dụng infrastructure đã có: `failedMessages` queue, `classifyError`, `retryWithBackoff`
- Cần optimistic UI để người dùng thấy tin nhắn ngay lập tức (contradiction với current design - cần HUMAN quyết định)
- Current design: No optimistic update vì SignalR sẽ deliver message → Nhưng khi failed, tin nhắn biến mất → Bad UX

**Đề xuất:** Thêm optimistic UI **chỉ khi failed** để giữ tin nhắn trong danh sách với status "failed"
