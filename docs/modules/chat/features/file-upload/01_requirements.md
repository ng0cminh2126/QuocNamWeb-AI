# [BƯỚC 1] Requirements - File Upload

> **Feature:** Upload File & Image trong Chat  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-06  
> **Module:** chat  
> **Parent Feature:** conversation-detail

---

## 📋 Functional Requirements

### FR-01: File Upload Button

| ID      | Requirement                              | Priority | Notes                 |
| ------- | ---------------------------------------- | -------- | --------------------- |
| FR-01.1 | Button đính kèm file (📎 icon)           | HIGH     | Bên trái input        |
| FR-01.2 | Click button → Open file picker          | HIGH     | Native file input     |
| FR-01.3 | Accept: .pdf, .doc, .docx, .xls, .xlsx   | HIGH     | File types allowed    |
| FR-01.4 | Multiple file selection                  | MEDIUM   | Max 5 files           |
| FR-01.5 | Button disabled khi đang sending message | MEDIUM   | Prevent double upload |
| FR-01.6 | Tooltip "Đính kèm file" on hover         | LOW      | Accessibility         |

### FR-02: Image Upload Button

| ID      | Requirement                              | Priority | Notes                 |
| ------- | ---------------------------------------- | -------- | --------------------- |
| FR-02.1 | Button đính kèm image (🖼️ icon)          | HIGH     | Bên cạnh file button  |
| FR-02.2 | Click button → Open image picker         | HIGH     | Native file input     |
| FR-02.3 | Accept: .jpg, .jpeg, .png, .gif, .webp   | HIGH     | Image types allowed   |
| FR-02.4 | Multiple image selection                 | MEDIUM   | Max 5 images          |
| FR-02.5 | Button disabled khi đang sending message | MEDIUM   | Prevent double upload |
| FR-02.6 | Tooltip "Đính kèm ảnh" on hover          | LOW      | Accessibility         |

### FR-03: File Preview

| ID      | Requirement                                 | Priority | Notes               |
| ------- | ------------------------------------------- | -------- | ------------------- |
| FR-03.1 | Hiển thị list files đã chọn                 | HIGH     | Above input         |
| FR-03.2 | Mỗi file item: icon + name + size           | HIGH     | File metadata       |
| FR-03.3 | Icon theo file type (📄 PDF, 📊 Excel, etc) | HIGH     | Visual distinction  |
| FR-03.4 | File name ellipsis nếu quá dài              | MEDIUM   | Max 40 chars        |
| FR-03.5 | File size format (2.5 MB, 1.2 MB)           | HIGH     | Readable format     |
| FR-03.6 | Button remove (X) cho mỗi file              | HIGH     | User có thể bỏ file |
| FR-03.7 | Hover effect trên remove button             | LOW      | Red tint on hover   |
| FR-03.8 | Header "Đính kèm file (2)" với count        | MEDIUM   | Show số lượng files |

### FR-04: Validation

| ID      | Requirement                             | Priority | Notes                  |
| ------- | --------------------------------------- | -------- | ---------------------- |
| FR-04.1 | Validate file size ≤ 10MB               | HIGH     | Client-side validation |
| FR-04.2 | Show error nếu file quá lớn             | HIGH     | Toast notification     |
| FR-04.3 | Validate file type (allowed extensions) | HIGH     | Client-side validation |
| FR-04.4 | Show error nếu file type không hỗ trợ   | HIGH     | Toast notification     |
| FR-04.5 | Validate max 5 files per message        | MEDIUM   | Prevent spam           |
| FR-04.6 | Show error nếu vượt quá 5 files         | MEDIUM   | Toast notification     |
| FR-04.7 | Server-side validation (backup)         | HIGH     | Security measure       |

### FR-05: Upload Process

| ID      | Requirement                             | Priority | Notes                       |
| ------- | --------------------------------------- | -------- | --------------------------- |
| FR-05.1 | Upload files khi user click Send        | HIGH     | Upload cùng lúc với message |
| FR-05.2 | Upload files trước, sau đó send message | HIGH     | Get file URLs first         |
| FR-05.3 | Disable send button khi đang upload     | HIGH     | Prevent duplicate           |
| FR-05.4 | Show uploading indicator                | MEDIUM   | Loading spinner             |
| FR-05.5 | Retry upload nếu failed                 | LOW      | Phase 2                     |
| FR-05.6 | Cancel upload nếu user hủy              | LOW      | Phase 2                     |

### FR-06: Auto-focus

| ID      | Requirement                           | Priority | Notes                |
| ------- | ------------------------------------- | -------- | -------------------- |
| FR-06.1 | Auto-focus input sau khi chọn file    | HIGH     | 0ms delay, immediate |
| FR-06.2 | Cursor vào input, ready để gõ message | HIGH     | UX improvement       |

### FR-07: Integration

| ID      | Requirement                               | Priority | Notes              |
| ------- | ----------------------------------------- | -------- | ------------------ |
| FR-07.1 | Integrate vào ChatMainContainer           | HIGH     | Existing component |
| FR-07.2 | Message với attachments → display in list | HIGH     | Show file icons    |
| FR-07.3 | Click file attachment → download          | HIGH     | Open in new tab    |
| FR-07.4 | Image attachment → preview thumbnail      | HIGH     | Click to enlarge   |

---

## 🎨 UI Requirements

### UI-01: Button Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│ [📎]  [🖼️]  │ Nhập tin nhắn...                 │  [Send] │
│  ↑     ↑                                                   │
│  │     └─ Image button (36×36px, gap 8px)                 │
│  └─ File button (36×36px)                                  │
│                                                            │
│ Position: Bên trái input, trước textarea                  │
│ Gap: 8px giữa file & image button                         │
│ Component: IconButton with ghost variant                  │
└────────────────────────────────────────────────────────────┘
```

### UI-02: File Preview Layout

```
┌────────────────────────────────────────────────────────────┐
│ Đính kèm file (2):                                         │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📄 Báo cáo tháng 12.pdf          2.5 MB         [❌]  │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📊 Dữ liệu khách hàng.xlsx       1.2 MB         [❌]  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [📎]  [🖼️]  │ Thêm ghi chú...                 │  [Gửi]  │
└────────────────────────────────────────────────────────────┘
```

**Preview Item Specs:**

- Background: `bg-gray-50 dark:bg-gray-800`
- Padding: `p-3` (12px)
- Border radius: `rounded-lg` (8px)
- Layout: Flexbox horizontal, `justify-between items-center`
- Gap: `gap-3` (12px)
- Icon size: `h-8 w-8` (32×32px)
- Filename: `text-sm font-medium`, ellipsis after 40 chars
- File size: `text-xs text-gray-500`
- Remove button: `h-6 w-6`, hover `bg-red-100 text-red-600`

### UI-03: Button Specifications

| Property    | File Button (📎)     | Image Button (🖼️)     |
| ----------- | -------------------- | --------------------- |
| Icon        | `Paperclip`          | `ImageUp`             |
| Size        | `h-9 w-9` (36×36)    | `h-9 w-9` (36×36)     |
| Variant     | `ghost`              | `ghost`               |
| Color       | `text-gray-600`      | `text-gray-600`       |
| Hover       | `hover:bg-gray-100`  | `hover:bg-gray-100`   |
| Disabled    | `opacity-50`         | `opacity-50`          |
| aria-label  | "Đính kèm file"      | "Đính kèm ảnh"        |
| data-testid | `attach-file-button` | `attach-image-button` |

### UI-04: Error States

**File quá lớn:**

```
┌────────────────────────────────────────────────────┐
│ ⚠️ File quá lớn: report.pdf (15 MB)               │
│    Kích thước tối đa: 10 MB                       │
│                                            [Đóng] │
└────────────────────────────────────────────────────┘
```

**File type không hỗ trợ:**

```
┌────────────────────────────────────────────────────┐
│ ⚠️ Định dạng không hỗ trợ: virus.exe              │
│    Chỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX, JPG, │
│    PNG, GIF, WEBP                                  │
│                                            [Đóng] │
└────────────────────────────────────────────────────┘
```

**Vượt quá 5 files:**

```
┌────────────────────────────────────────────────────┐
│ ⚠️ Chỉ có thể đính kèm tối đa 5 files             │
│    Bạn đã chọn 6 files                            │
│                                            [Đóng] │
└────────────────────────────────────────────────────┘
```

### UI-05: Responsive

| Breakpoint | Behavior                                |
| ---------- | --------------------------------------- |
| Desktop    | Full layout, buttons 36×36px            |
| Tablet     | Same as desktop                         |
| Mobile     | Buttons 32×32px, file name max 25 chars |

---

## 🔐 Security Requirements

| ID     | Requirement                                | Notes                  |
| ------ | ------------------------------------------ | ---------------------- |
| SEC-01 | Client-side file type validation           | Check extension & MIME |
| SEC-02 | Client-side file size validation (≤ 10MB)  | Before upload          |
| SEC-03 | Server-side validation (backup)            | Double check           |
| SEC-04 | Virus scanning on server (optional)        | Phase 2                |
| SEC-05 | Upload với Bearer token trong header       | Authentication         |
| SEC-06 | Prevent executable files (.exe, .bat, etc) | Security measure       |

---

## 🔗 API Requirements

> **Note:** Cần kiểm tra API documentation từ backend team để confirm endpoint & payload structure

### Endpoint (Đề xuất)

```
POST /api/files/upload
```

### Request Headers

```http
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

### Request Body (Multipart)

```typescript
interface UploadFileRequest {
  files: File[]; // Array of File objects (max 5)
  conversationId: string; // UUID của conversation
}
```

### Response Success (201 Created)

```typescript
interface UploadFileResponse {
  success: true;
  data: {
    attachments: Array<{
      id: string; // UUID của attachment
      name: string; // Original filename
      url: string; // CDN URL để download
      type: string; // MIME type
      size: number; // File size in bytes
      uploadedAt: string; // ISO datetime
    }>;
  };
}
```

### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 10MB limit",
    "details": {
      "filename": "report.pdf",
      "size": 15728640,
      "maxSize": 10485760
    }
  }
}
```

### Error Codes

| Code                | HTTP Status | Description                       |
| ------------------- | ----------- | --------------------------------- |
| `FILE_TOO_LARGE`    | 400         | File size > 10MB                  |
| `INVALID_FILE_TYPE` | 400         | File type không được phép         |
| `TOO_MANY_FILES`    | 400         | Quá 5 files                       |
| `UPLOAD_FAILED`     | 500         | Server error khi upload           |
| `UNAUTHORIZED`      | 401         | Không có token hoặc token hết hạn |

---

## 📊 Component Architecture

### Components sẽ tạo mới

| Component            | Location                              | Description                | Priority |
| -------------------- | ------------------------------------- | -------------------------- | -------- |
| **FilePreview**      | `src/components/FilePreview.tsx`      | Preview list files đã chọn | HIGH     |
| **FileUploadButton** | `src/components/FileUploadButton.tsx` | Button + file picker logic | MEDIUM   |

### Hooks sẽ tạo mới

| Hook                  | Location                               | Description               | Priority |
| --------------------- | -------------------------------------- | ------------------------- | -------- |
| **useUploadFile**     | `src/hooks/mutations/useUploadFile.ts` | Upload file mutation      | HIGH     |
| **useFileValidation** | `src/hooks/useFileValidation.ts`       | Validate file size & type | HIGH     |

### Utils sẽ tạo mới

| Util               | Location                      | Description                | Priority |
| ------------------ | ----------------------------- | -------------------------- | -------- |
| **fileValidation** | `src/utils/fileValidation.ts` | Validation functions       | HIGH     |
| **fileHelpers**    | `src/utils/fileHelpers.ts`    | Format size, get icon, etc | MEDIUM   |

### API Client sẽ tạo mới

| Client        | Location               | Description            | Priority |
| ------------- | ---------------------- | ---------------------- | -------- |
| **files.api** | `src/api/files.api.ts` | Upload file API client | HIGH     |

### Components sẽ sửa đổi

| Component             | Location                                               | Changes                            | Priority |
| --------------------- | ------------------------------------------------------ | ---------------------------------- | -------- |
| **ChatMainContainer** | `src/features/portal/components/ChatMainContainer.tsx` | Thêm upload buttons + file preview | HIGH     |

### Types sẽ thêm

| Type                   | Location                | Description          | Priority |
| ---------------------- | ----------------------- | -------------------- | -------- |
| **FileAttachment**     | `src/types/messages.ts` | File attachment type | HIGH     |
| **UploadFileRequest**  | `src/types/files.ts`    | Upload request type  | HIGH     |
| **UploadFileResponse** | `src/types/files.ts`    | Upload response type | HIGH     |

---

## ✅ Acceptance Criteria

### Phase 1 (Core Features)

- [ ] User click file button → File picker mở với file types filter
- [ ] User click image button → File picker mở với image types filter
- [ ] User chọn files → Files hiển thị trong preview list
- [ ] Preview hiển thị: icon + filename + size + remove button
- [ ] User click remove → File bị xóa khỏi preview
- [ ] Validate file size ≤ 10MB → Show error nếu vượt quá
- [ ] Validate file type → Show error nếu không hợp lệ
- [ ] Validate max 5 files → Show error nếu vượt quá
- [ ] User click Send → Upload files trước, sau đó send message với attachment URLs
- [ ] Message hiển thị attachments trong chat list
- [ ] Auto-focus input sau khi chọn file (0ms delay)

### Phase 2 (Enhanced Features)

- [ ] Upload progress indicator (% completion)
- [ ] Drag & drop files vào chat area
- [ ] Image preview modal trước khi gửi
- [ ] Retry upload nếu failed
- [ ] Cancel upload in progress

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

| File                                   | Description             | Lines (Est.) |
| -------------------------------------- | ----------------------- | ------------ |
| `src/components/FilePreview.tsx`       | File preview component  | ~150         |
| `src/components/FileUploadButton.tsx`  | Upload button component | ~80          |
| `src/hooks/mutations/useUploadFile.ts` | Upload mutation hook    | ~60          |
| `src/hooks/useFileValidation.ts`       | Validation hook         | ~50          |
| `src/utils/fileValidation.ts`          | Validation utilities    | ~100         |
| `src/utils/fileHelpers.ts`             | File helper functions   | ~80          |
| `src/api/files.api.ts`                 | Upload API client       | ~70          |
| `src/types/files.ts`                   | File-related types      | ~40          |
| **Total:**                             | **8 files**             | **~630**     |

### Files sẽ sửa đổi:

| File                                                   | Changes                                     | Lines (Est.) |
| ------------------------------------------------------ | ------------------------------------------- | ------------ |
| `src/features/portal/components/ChatMainContainer.tsx` | Thêm upload buttons, file preview, handlers | +100         |
| `src/types/messages.ts`                                | Thêm FileAttachment type                    | +20          |
| **Total:**                                             | **2 files**                                 | **+120**     |

### Files sẽ xoá:

- Không xoá files nào

### Dependencies sẽ thêm:

- Không cần thêm dependencies mới (dùng native File API + existing libs)

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                    | Lựa chọn                                     | HUMAN Decision                                                     |
| --- | ------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| 1   | File types allowed        | Các extensions nào?                          | ✅ **.pdf, .doc, .docx, .xls, .xlsx, .jpg, .png, .gif, .webp**     |
| 2   | Multiple files at once    | Single hay multiple?                         | ✅ **Multiple - max 5 files**                                      |
| 3   | Auto-focus delay          | 0ms, 100ms, or 200ms?                        | ✅ **0ms - immediate**                                             |
| 4   | File preview position     | Above input or below?                        | ✅ **Above input**                                                 |
| 5   | Upload API endpoint       | `/files/upload` or `/messages/attachments`?  | ⬜ \***\*Update sau\*\*** (cần confirm với backend)                |
| 6   | Image preview in message  | Thumbnail or full image?                     | ✅ **Thumbnail with modal**                                        |
| 7   | Max file size             | 5MB, 10MB, or 25MB?                          | ✅ **10MB**                                                        |
| 8   | Upload before or with msg | Upload files trước hay cùng lúc với message? | ⬜ \***\*Upload file trước\*\*** (đề xuất: upload trước, get URLs) |
| 9   | Error notification method | Toast, inline, or modal?                     | ⬜ \***\*Toast\*\*** (đề xuất: Toast notification)                 |
| 10  | File name display length  | 25, 40, or 50 chars?                         | ✅ **40 chars**                                                    |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status                  |
| --------------------------- | ----------------------- |
| Đã review Requirements      | ✅ Đã review            |
| Đã review Impact Summary    | ✅ Đã review            |
| Đã điền Pending Decisions   | ✅ Đã điền              |
| API Contract ready          | ⏳ Chưa có (sẽ làm sau) |
| **APPROVED để thực thi UI** | ✅ **APPROVED**         |

**HUMAN Signature:** HUMAN  
**Date:** 2026-01-06

**Lưu ý:**

- ✅ Phase 1: Chỉ làm UI (file selection, preview, validation) - KHÔNG call API
- ⏳ Phase 2: Implement upload API khi backend ready
- 🚫 KHÔNG mock data hoặc fake upload

---

## 📝 Change Log

| Date       | Version | Changes                                               |
| ---------- | ------- | ----------------------------------------------------- |
| 2026-01-06 | 1.0.0   | Initial requirements document created                 |
| 2026-01-06 | 1.0.1   | HUMAN approved - Focus on UI only, no API integration |
| 2026-01-06 | 1.1.0   | Added Phase 2 requirements - API integration scope    |

---

## 🚀 Phase 2 Requirements - API Integration

> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-06  
> **Depends on:** Phase 1 (UI) - ✅ Complete

### Scope

Phase 2 thêm **actual file upload** vào Vega File API. Phase 1 đã có UI (selection, validation, preview), Phase 2 sẽ integrate với backend để upload files thực sự.

---

### FR-08: API Integration

| ID       | Requirement                                 | Priority | Notes                       |
| -------- | ------------------------------------------- | -------- | --------------------------- |
| FR-08.1  | Call POST /api/Files để upload file         | HIGH     | Vega File API               |
| FR-08.2  | Include sourceModule=1 (Chat) trong request | HIGH     | Required parameter          |
| FR-08.3  | Include sourceEntityId (conversationId)     | MEDIUM   | Optional, for tracking      |
| FR-08.4  | Send file as multipart/form-data            | HIGH     | API requirement             |
| FR-08.5  | Include Bearer token trong Authorization    | HIGH     | Authentication required     |
| FR-08.6  | Handle 201 Created response → get fileId    | HIGH     | Success case                |
| FR-08.7  | Handle error responses (400, 401, 413, 415) | HIGH     | Error handling              |
| FR-08.8  | Upload multiple files **sequentially**      | HIGH     | API accepts 1 file per call |
| FR-08.9  | Track upload progress per file              | MEDIUM   | UX improvement              |
| FR-08.10 | Return array of fileIds after upload        | HIGH     | For message attachment      |

### FR-09: Multi-File Upload Strategy

| ID      | Requirement                                              | Priority | Notes                      |
| ------- | -------------------------------------------------------- | -------- | -------------------------- |
| FR-09.1 | Upload files one-by-one (sequential)                     | HIGH     | API limitation: 1 file/req |
| FR-09.2 | Wait for each upload to complete before next             | HIGH     | Prevent race conditions    |
| FR-09.3 | Collect all successful fileIds                           | HIGH     | For message attachment     |
| FR-09.4 | Handle partial success (some files fail)                 | HIGH     | UX consideration           |
| FR-09.5 | Show progress per file (pending/uploading/success/error) | MEDIUM   | Visual feedback            |
| FR-09.6 | Continue uploading remaining files if one fails          | MEDIUM   | Don't stop on first error  |

### FR-10: Upload Progress & Feedback

| ID      | Requirement                                             | Priority | Notes                |
| ------- | ------------------------------------------------------- | -------- | -------------------- |
| FR-10.1 | Show upload state per file (pending → uploading → done) | MEDIUM   | Visual indicators    |
| FR-10.2 | Show upload percentage (0-100%) per file                | LOW      | Phase 3 enhancement  |
| FR-10.3 | Disable Send button during upload                       | HIGH     | Prevent duplicate    |
| FR-10.4 | Show loading spinner on Send button                     | MEDIUM   | Visual feedback      |
| FR-10.5 | Toast notification on upload errors                     | HIGH     | Error handling       |
| FR-10.6 | Toast warning on partial success                        | MEDIUM   | "3/5 files uploaded" |
| FR-10.7 | Clear upload progress after 2 seconds                   | LOW      | Auto-cleanup         |

### FR-11: Error Handling & Retry

| ID      | Requirement                                   | Priority | Notes                  |
| ------- | --------------------------------------------- | -------- | ---------------------- |
| FR-11.1 | Show specific error messages per file         | HIGH     | 401, 413, 415 errors   |
| FR-11.2 | Retry button for failed uploads               | LOW      | Phase 3 enhancement    |
| FR-11.3 | Auto-retry on network errors (3 attempts)     | LOW      | Phase 3 enhancement    |
| FR-11.4 | Keep failed files in preview with error badge | MEDIUM   | User can remove/retry  |
| FR-11.5 | Allow sending message with partial uploads    | MEDIUM   | Attach only successful |

### FR-12: Message Integration

| ID      | Requirement                                  | Priority | Notes                 |
| ------- | -------------------------------------------- | -------- | --------------------- |
| FR-12.1 | Upload files BEFORE sending message          | HIGH     | Get fileIds first     |
| FR-12.2 | Attach fileIds array to message payload      | HIGH     | Backend requirement   |
| FR-12.3 | Send message only after all uploads complete | HIGH     | Or partial if allowed |
| FR-12.4 | Clear files and input after successful send  | HIGH     | Reset state           |
| FR-12.5 | Revoke object URLs to free memory            | HIGH     | Memory management     |

---

### Technical Implementation

#### API Client (files.api.ts)

```typescript
export async function uploadFile(params: {
  file: File;
  sourceModule: number; // 1 for Chat
  sourceEntityId?: string;
  onUploadProgress?: (progress: number) => void;
}): Promise<UploadFileResult>;
```

**Features:**

- FormData creation
- Query params handling
- Upload progress callback
- Error handling (401, 400, 413, 415)
- Type-safe response

#### Mutation Hook (useUploadFiles.ts)

```typescript
export function useUploadFiles(): UseMutationResult<
  UploadFilesResult,
  Error,
  UploadFilesParams
>;

interface UploadFilesParams {
  files: SelectedFile[];
  sourceModule: number;
  sourceEntityId?: string;
  onProgress?: (fileId: string, progress: number) => void;
}

interface UploadFilesResult {
  fileIds: string[];
  successCount: number;
  failedCount: number;
  errors: Array<{ file: SelectedFile; error: string }>;
}
```

**Features:**

- Sequential upload logic
- Progress tracking per file
- Error handling with toast
- Partial success handling
- Returns fileIds array

#### Integration Changes (ChatMainContainer)

**State:**

```typescript
const [uploadProgress, setUploadProgress] = useState<
  Map<string, FileUploadProgress>
>(new Map());
const uploadFilesMutation = useUploadFiles();
```

**Upload Flow:**

1. User clicks Send
2. Validate files (client-side)
3. Upload files sequentially
4. Track progress per file
5. Collect fileIds
6. Send message with fileIds
7. Clear files and input

---

### Phase 2 Pending Decisions

| #   | Vấn đề                      | Lựa chọn                                                  | HUMAN Decision                       |
| --- | --------------------------- | --------------------------------------------------------- | ------------------------------------ |
| 1   | Upload timing               | Upload khi click Send, hoặc upload ngay khi select files? | ⬜ **Upload khi click Send**         |
| 2   | Upload progress UI          | Mini indicators, toast, or inline progress bars?          | ⬜ **Mini indicators**               |
| 3   | Failed upload behavior      | Remove failed files, or keep and show retry button?       | ⬜ **keep and show retry button**    |
| 4   | Partial success behavior    | Send message with successful files only, or block send?   | ⬜ **block send**                    |
| 5   | Upload retry strategy       | Auto-retry (how many times?), or manual retry only?       | ⬜ **manual retry only**             |
| 6   | API client separation       | Use existing apiClient, or create separate fileApiClient? | ⬜ **create separate fileApiClient** |
| 7   | sourceEntityId value        | Use conversationId, workspaceId, or null?                 | ⬜ **conversationId**                |
| 8   | Upload cancellation         | Allow cancel during upload? (Phase 2 or Phase 3?)         | ⬜ **Phase 3 nếu cần**               |
| 9   | Message send blocking       | Disable send button while uploading, or allow?            | ⬜ **Disable Send button**           |
| 10  | Upload progress persistence | Clear progress immediately after success, or keep for 2s? | ⬜ **keep for 2s**                   |

---

### Phase 2 Acceptance Criteria

- [ ] API client `files.api.ts` created with `uploadFile()` function
- [ ] Mutation hook `useUploadFiles()` created with sequential upload logic
- [ ] ChatMainContainer integrated with upload mutation
- [ ] Files uploaded to Vega File API successfully
- [ ] FileIds attached to message payload
- [ ] Multiple files uploaded sequentially (1 file per API call)
- [ ] Upload progress tracked per file
- [ ] Error handling working (toast notifications)
- [ ] Partial success handled (some files succeed, some fail)
- [ ] Send button disabled during upload
- [ ] Files cleared after successful send
- [ ] Memory cleanup (URL.revokeObjectURL)
- [ ] All unit tests passing (API client + mutation hook)
- [ ] All integration tests passing (ChatMainContainer)
- [ ] TypeScript compiles without errors

---

### Related Documents

- **Implementation Plan:** [07_phase2-implementation-plan.md](./07_phase2-implementation-plan.md)
- **API Contract:** [docs/api/file/upload/contract.md](../../../../api/file/upload/contract.md)
- **Testing Strategy:** [06_testing.md](./06_testing.md) (will update for Phase 2)

---

**Phase 2 Status:** ⏳ PENDING HUMAN APPROVAL  
**Next Step:** HUMAN review và approve Phase 2 requirements
