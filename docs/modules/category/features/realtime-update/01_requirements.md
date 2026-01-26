# [BƯỚC 1] Requirements - Category List Real-time Update

**Feature:** Category List Real-time Update  
**Version:** 1.1 (Enhanced)  
**Date:** 2026-01-23  
**Status:** ✅ APPROVED

---

## 1. YÊU CẦU CHỨC NĂNG

### 1.1. Hiển thị Last Message

**Mô tả:** Mỗi category hiển thị tin nhắn mới nhất từ các conversations bên trong với đầy đủ context.

**Yêu cầu:**

- **Conversation Name** (line 1): Tên conversation + timestamp
- **Message Preview** (line 2): Người gửi + nội dung/type preview
- Truncate nếu quá dài (~50 ký tự)
- Nếu chưa có tin nhắn: "Chưa có tin nhắn"

**Layout:**

```
[Conversation Name]                    [Timestamp]
[Sender]: [Content preview...]
```

**Ví dụ:**

```
Team Backend                           5 phút trước
John: Đã hoàn thành task XYZ

Team Frontend                          Vừa xong
Jane: Cần review PR #123

Marketing Team                         23 giờ trước
Mike: đã gửi 3 ảnh
```

### 1.1.1. Timestamp Display

**Yêu cầu:**

- Hiển thị relative time (thời gian tương đối)
- Format:
  - < 1 phút: "Vừa xong"
  - < 60 phút: "X phút trước"
  - < 24 giờ: "X giờ trước"
  - > = 24 giờ: "X ngày trước" hoặc "DD/MM" nếu > 7 ngày
- Màu: `text-gray-400` (nhạt hơn message)
- Font: `text-xs`
- Vị trí: Cùng hàng với conversation name, align right

**Ví dụ:**

```
Team Backend                           Vừa xong
Team Frontend                          15 phút trước
Marketing                              2 giờ trước
HR Department                          1 ngày trước
Old Project                            15/01
```

### 1.1.2. Sender Display

**Yêu cầu:**

- Hiển thị tên người gửi **trước nội dung**
- Format: `[SenderName]: [Content]`
- Font: `text-xs`
- Sender name: `font-medium text-gray-700`
- Content: `text-gray-500`

**Giải pháp hiển thị cả Sender và Group:**

**Option 1: Two-line layout (RECOMMENDED)**

```
Marketing Team                         2 giờ trước
Mike: Đã hoàn thành slide presentation
```

- Line 1: Group name + timestamp
- Line 2: Sender + message
- ✅ Rõ ràng, không bị confuse
- ✅ Đủ space cho cả hai

**Option 2: Inline group indicator (compact)**

```
Mike (Marketing)                       2 giờ trước
Đã hoàn thành slide presentation
```

- Line 1: Sender (Group) + timestamp
- Line 2: Message
- ⚠️ Có thể confuse: ai là sender, ai là group?

**Option 3: Badge indicator**

```
Marketing Team  👥                     2 giờ trước
Mike: Đã hoàn thành slide
```

- Icon/badge để phân biệt group vs DM
- ⚠️ Tốn space, phức tạp hơn

**→ Khuyến nghị: Option 1 (Two-line)** vì:

- Rõ ràng nhất
- Consistent với design hiện tại
- Dễ scan visually

### 1.1.3. Message Type Formatting

**Yêu cầu:** Hiển thị preview khác nhau tùy message type.

#### A. Text Message

**Format:** `[Sender]: [Content text]`

```
John: Đã hoàn thành task XYZ
Jane: Cần review PR #123 urgent
```

#### B. Image Message

**Format:**

- 1 ảnh: `[Sender]: đã gửi 1 ảnh`
- Nhiều ảnh: `[Sender]: đã gửi [N] ảnh`

**Ví dụ:**

```
Mike: đã gửi 1 ảnh
Sarah: đã gửi 3 ảnh
Tom: đã gửi 12 ảnh
```

#### C. File Message

**Format:**

- 1 file: `[Sender]: đã gửi tệp [filename]`
- Nhiều file: `[Sender]: đã gửi [N] tệp`

**Ví dụ:**

```
John: đã gửi tệp report.pdf
Jane: đã gửi 2 tệp
Mike: đã gửi 5 tệp
```

**Truncate filename:**

- Nếu filename quá dài (> 20 chars), truncate: `report_final_v3...pdf`

#### D. Mixed Attachments

**Format:** `[Sender]: đã gửi [N] tệp đính kèm`

**Ví dụ:**

```
Sarah: đã gửi 3 tệp đính kèm  (2 ảnh + 1 file)
```

#### E. Message với Text + Attachments

**Priority:** Hiển thị text, ignore attachments trong preview

**Format:** `[Sender]: [Text content]`

**Ví dụ:**

```
John: Check out these designs  (có 2 ảnh attached)
→ Preview: John: Check out these designs
```

### 1.2. Hiển thị Unread Count

**Mô tả:** Hiển thị tổng số tin chưa đọc của tất cả conversations trong category.

**Yêu cầu:**

- Hiển thị badge đỏ góc phải category item
- Show số lượng: "3", "12", "99+"
- Chỉ hiển thị khi có tin chưa đọc (> 0)
- Màu: `bg-rose-500` text white

**Cách tính:**

- Tính tổng unreadCount của TẤT CẢ conversations trong category
- KHÔNG tăng nếu tin nhắn của chính user (senderId === currentUserId)
- KHÔNG tăng nếu conversation đang được mở/active

### 1.3. Real-time Update qua SignalR

**Mô tả:** Tự động cập nhật khi có tin nhắn mới KHÔNG cần reload page.

**Trigger Events:**

1. **MessageSent** - Khi có tin nhắn mới
   - ✅ Update lastMessage của conversation tương ứng
   - ✅ Tăng unreadCount (nếu điều kiện thỏa mãn)
   - ✅ UI update trong < 1 giây

2. **MessageRead** - Khi đánh dấu đã đọc
   - ✅ Giảm unreadCount
   - ✅ Ẩn badge nếu unreadCount = 0
   - ✅ UI update ngay lập tức

**Điều kiện KHÔNG tăng unread:**

- Tin nhắn của chính user (senderId === currentUserId)
- Conversation đang được active/mở
- Message đã được mark as read

---

## 2. API & DATA SOURCE

### 2.1. API Endpoint: GET /categories

**URL:** `https://vega-chat-api-dev.allianceitsc.com/api/categories`  
**Swagger:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Category Name",
    "conversations": [
      {
        "conversationId": "uuid",
        "conversationName": "Team Backend",
        "memberCount": 5,
        "lastMessage": {
          "messageId": "uuid",
          "senderId": "uuid",
          "senderName": "John Doe",
          "content": "Tin nhắn mới nhất",
          "sentAt": "2026-01-23T10:00:00Z"
        }
      }
    ]
  }
]
```

**Dữ liệu có sẵn:**

- ✅ lastMessage (object với content, senderName, sentAt)
- ✅ memberCount
- ❌ unreadCount (KHÔNG có - phải tính client-side)

### 2.2. SignalR Events

**Event 1: MessageSent**

Payload:

```typescript
{
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    sentAt: string;
  }
}
```

**Event 2: MessageRead**

Payload:

```typescript
{
  conversationId: string;
  userId: string;
}
```

---

## 3. TECHNICAL REQUIREMENTS

### 3.1. Type Definitions

**File:** `src/types/categories.ts`

**Current (SAI):**

```typescript
export interface ConversationInfoDto {
  conversationId: string;
  conversationName: string;
  lastMessage?: string; // ❌ SAI TYPE
}
```

**Required (ĐÚNG):**

```typescript
export interface ConversationInfoDto {
  conversationId: string;
  conversationName: string;
  memberCount: number;
  lastMessage: LastMessageDto | null; // ✅ Object
}

export interface LastMessageDto {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}
```

### 3.2. SignalR Integration

**Requirements:**

- Auto-join ALL conversations khi component mount
- Listen `MessageSent` và `MessageRead` events
- Update TanStack Query cache optimistically
- Handle reconnection (re-join conversations)

### 3.3. Cache Update Strategy

**Approach:** Optimistic Update + Background Refetch

1. **MessageSent:**
   - Update cache immediately (optimistic)
   - Calculate new unreadCount
   - Update lastMessage
   - Debounce refetch 500ms (verify consistency)

2. **MessageRead:**
   - Reset unreadCount = 0 immediately
   - Update cache
   - Remove badge from UI

---

## 4. UI REQUIREMENTS

### 4.1. Last Message Display

**Vị trí:** Dưới tên category

**Design:**

```tsx
<div className="text-xs text-gray-500 truncate">
  <span className="font-medium text-gray-700">{conversationName}:</span>{" "}
  {lastMessage.content}
</div>
```

### 4.2. Unread Badge

**Vị trí:** Top-right corner của category item

**Design:**

```tsx
{
  unreadCount > 0 && (
    <span className="px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
```

---

## 5. ACCEPTANCE CRITERIA

### Scenario 1: Có tin nhắn mới

**Given:** User đang xem category list  
**When:** Có tin nhắn mới trong conversation thuộc category X  
**Then:**

- ✅ Last message update hiển thị tin nhắn mới
- ✅ Unread count tăng (nếu không phải own message)
- ✅ UI update trong < 1 giây
- ✅ Không cần reload page

### Scenario 2: Đánh dấu đã đọc

**Given:** Category có unreadCount = 5  
**When:** User đọc hết tin nhắn (MessageRead event)  
**Then:**

- ✅ Unread badge biến mất
- ✅ Badge fade-out smooth
- ✅ Update ngay lập tức

### Scenario 3: Tin nhắn của chính user

**Given:** User đang xem category list  
**When:** User gửi tin nhắn trong conversation thuộc category  
**Then:**

- ✅ Last message update
- ❌ Unread count KHÔNG tăng (vì là tin của mình)

---

## 6. OUT OF SCOPE

**Không làm trong version này:**

- ❌ Sort categories by latest message
- ❌ Typing indicators
- ❌ Message preview cho file/image (chỉ text)
- ❌ Offline support

---

## 7. DEPENDENCIES

**External:**

- @microsoft/signalr
- @tanstack/react-query

**Internal:**

- `useCategories` hook (existing)
- `chatHub` from `@/lib/signalr` (existing)
- SignalR connection (existing)

---

## 8. HUMAN DECISIONS

| #   | Question                      | Options            | Decision     |
| --- | ----------------------------- | ------------------ | ------------ |
| 1   | Debounce refetch delay        | 300ms / 500ms / 1s | ✅ **500ms** |
| 2   | Max message preview length    | 40 / 50 / 70 chars | ✅ **50**    |
| 3   | Calculate unread client-side? | Yes / Call API     | ✅ **Yes**   |

---

## ✅ APPROVAL

| Item                   | Status |
| ---------------------- | ------ |
| Đã review requirements | ✅     |
| Đã điền decisions      | ✅     |
| **APPROVED**           | ✅     |

**Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-23

> AI chỉ được tiếp tục khi APPROVED
