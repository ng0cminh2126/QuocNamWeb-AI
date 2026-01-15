# [BƯỚC 1] Requirements - Client-Side Protection

> **Feature:** Client-Side Security Protection  
> **Module:** Security  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Version History

| Version | Date       | Changes              | Author | Status     |
| ------- | ---------- | -------------------- | ------ | ---------- |
| 1.0     | 2026-01-13 | Initial requirements | AI     | ⏳ PENDING |

---

## 1. Functional Requirements

### 1.1 DevTools Protection

| ID     | Requirement             | Priority | Acceptance Criteria                             |
| ------ | ----------------------- | -------- | ----------------------------------------------- |
| FR-1.1 | Chặn phím tắt F12       | High     | Nhấn F12 không mở DevTools                      |
| FR-1.2 | Chặn Ctrl+Shift+I       | High     | Tổ hợp phím không mở Inspect                    |
| FR-1.3 | Chặn Ctrl+Shift+J       | High     | Tổ hợp phím không mở Console                    |
| FR-1.4 | Chặn Ctrl+Shift+C       | High     | Tổ hợp phím không mở Element Picker             |
| FR-1.5 | Chặn Ctrl+U             | Medium   | Không xem được page source                      |
| FR-1.6 | Detect DevTools đang mở | Medium   | Hiển thị warning/redirect nếu DevTools detected |

### 1.2 Context Menu Protection

| ID     | Requirement                    | Priority | Acceptance Criteria                           |
| ------ | ------------------------------ | -------- | --------------------------------------------- |
| FR-2.1 | Chặn right-click toàn app      | High     | Right-click không hiện context menu           |
| FR-2.2 | Chặn Inspect Element từ menu   | High     | Option "Inspect" không khả dụng               |
| FR-2.3 | Custom context menu (optional) | Low      | Có thể hiện menu riêng thay vì chặn hoàn toàn |

### 1.3 Content Protection (File Preview)

| ID     | Requirement                       | Priority | Acceptance Criteria                              |
| ------ | --------------------------------- | -------- | ------------------------------------------------ |
| FR-3.1 | Chặn text selection trong preview | Medium   | User không select được text trong file preview   |
| FR-3.2 | Chặn Ctrl+C copy                  | Medium   | Copy shortcut không hoạt động                    |
| FR-3.3 | Chặn Ctrl+A select all            | Medium   | Select all không hoạt động                       |
| FR-3.4 | Feature flag ON/OFF               | High     | ENV variable để enable/disable feature           |
| FR-3.5 | Áp dụng cho specific file types   | Medium   | Chỉ áp dụng cho PDF, images, sensitive documents |

### 1.4 Configuration Management

| ID     | Requirement                  | Priority | Acceptance Criteria                        |
| ------ | ---------------------------- | -------- | ------------------------------------------ |
| FR-4.1 | Environment variables config | High     | Có thể enable/disable từng feature qua ENV |
| FR-4.2 | Runtime toggle (admin)       | Low      | Admin có thể toggle protection runtime     |
| FR-4.3 | Whitelist users/roles        | Low      | Một số users được phép bypass (admin, dev) |

---

## 2. UI/UX Requirements

### 2.1 Visual Feedback

| ID     | Requirement                               | Priority | Notes                                            |
| ------ | ----------------------------------------- | -------- | ------------------------------------------------ |
| UI-1.1 | Warning message khi detect DevTools       | Medium   | Toast/modal thông báo "DevTools không được phép" |
| UI-1.2 | Custom cursor khi hover protected content | Low      | Icon "no copy" cursor                            |
| UI-1.3 | Watermark overlay (optional)              | Low      | Text watermark "CONFIDENTIAL" trên preview       |

### 2.2 User Experience

| ID     | Requirement                 | Priority | Notes                                                   |
| ------ | --------------------------- | -------- | ------------------------------------------------------- |
| UX-2.1 | Không ảnh hưởng performance | High     | Protection logic không làm lag app                      |
| UX-2.2 | Graceful degradation        | Medium   | Nếu browser không support, vẫn cho dùng app bình thường |

---

## 3. Security Requirements

### 3.1 Protection Level

| ID      | Requirement                 | Priority | Notes                                    |
| ------- | --------------------------- | -------- | ---------------------------------------- |
| SEC-1.1 | Client-side protection only | High     | Không thay thế server-side security      |
| SEC-1.2 | Obfuscate protection code   | Medium   | Minify/obfuscate để khó bypass hơn       |
| SEC-1.3 | Logging bypass attempts     | Low      | Log events khi user cố bypass (optional) |

### 3.2 Compliance

| ID      | Requirement                     | Priority | Notes                                    |
| ------- | ------------------------------- | -------- | ---------------------------------------- |
| SEC-2.1 | Không vi phạm accessibility     | High     | Screen readers vẫn hoạt động bình thường |
| SEC-2.2 | Không chặn legitimate workflows | High     | Admin/Dev mode có thể bypass             |

---

## 4. Technical Requirements

### 4.1 Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+

### 4.2 Dependencies

- Không cần external library
- Pure JavaScript/TypeScript
- React hooks integration

### 4.3 Performance

- Event listeners overhead < 1ms
- No memory leaks
- Cleanup on unmount

---

## 5. Non-Functional Requirements

| Category        | Requirement                  | Target                 |
| --------------- | ---------------------------- | ---------------------- |
| Performance     | Event handler execution time | < 1ms                  |
| Compatibility   | Browser support              | 95% market share       |
| Maintainability | Code coverage                | > 80%                  |
| Documentation   | Inline comments              | All protection methods |

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:

- `src/hooks/useSecurity.ts` - Hook quản lý security features
- `src/hooks/useDevToolsProtection.ts` - DevTools blocking logic
- `src/hooks/useContextMenuProtection.ts` - Right-click blocking
- `src/hooks/useContentProtection.ts` - Copy protection for previews
- `src/config/security.config.ts` - Security configuration
- `src/types/security.ts` - Security types
- `src/utils/security/` - Folder chứa utility functions
  - `detectDevTools.ts` - DevTools detection utility
  - `protectionHelpers.ts` - Helper functions

### Files sẽ sửa đổi:

- `src/App.tsx` - Integrate useSecurity hook at app root
- `src/features/portal/workspace/FilePreview.tsx` - Thêm useContentProtection (nếu có component này)
- `.env.example` - Thêm security feature flags
- `README.md` - Document security features

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- (không có - sử dụng vanilla JS/TS)

### Environment Variables mới:

```env
# Security Features
VITE_ENABLE_DEVTOOLS_PROTECTION=true
VITE_ENABLE_CONTEXT_MENU_PROTECTION=true
VITE_ENABLE_CONTENT_PROTECTION=true
VITE_CONTENT_PROTECTION_FILE_TYPES=pdf,docx,xlsx
VITE_SECURITY_WHITELIST_EMAILS=admin@example.com,dev@example.com
```

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                          | Lựa chọn                                                            | HUMAN Decision          |
| --- | ------------------------------- | ------------------------------------------------------------------- | ----------------------- |
| 1   | DevTools detection method       | (1) Interval check, (2) Debug traps, (3) Both?                      | ✅ **3 - Both**         |
| 2   | Warning khi detect DevTools     | (1) Toast, (2) Modal blocking, (3) Redirect?                        | ✅ **1 - Toast**        |
| 3   | Content protection scope        | (1) Toàn app, (2) Chỉ file preview, (3) Configurable per component? | ✅ **3 - Configurable** |
| 4   | Whitelist mechanism             | (1) Email list, (2) Role-based, (3) Both?                           | ✅ **1 - Email list**   |
| 5   | Custom context menu             | (1) Không cần, (2) Show menu riêng với actions hợp lệ?              | ✅ **1 - Không cần**    |
| 6   | Watermark cho protected content | (1) Có, (2) Không, (3) Optional via flag?                           | ✅ **2 - Không**        |

> ✅ **All decisions filled - Ready to proceed**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review Functional Requirements | ✅ Đã review |
| Đã review UI/UX Requirements      | ✅ Đã review |
| Đã review Security Requirements   | ✅ Đã review |
| Đã review Impact Summary          | ✅ Đã review |
| Đã điền Pending Decisions         | ✅ Đã điền   |
| **APPROVED để sang BƯỚC 2**       | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-13

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tiếp tục BƯỚC 2 nếu "APPROVED để sang BƯỚC 2" = ⬜ CHƯA APPROVED**

---

## 📌 Notes for Implementation

1. **DevTools Protection:**

   - Combine multiple detection methods cho accuracy cao hơn
   - Consider performance impact của interval checks
   - Test trên nhiều browsers

2. **Context Menu:**

   - Allow right-click cho input/textarea elements
   - Preserve accessibility features (keyboard navigation)

3. **Content Protection:**

   - Chỉ apply cho elements cụ thể, không toàn page
   - CSS `user-select: none` + JS event prevention
   - Test với screen readers để đảm bảo accessibility

4. **Configuration:**
   - Default là enabled tất cả features
   - Dễ dàng disable khi cần debug
   - Document rõ cách bypass cho dev environment

---

## 🔗 Related Documents

- [Flow Diagram](./02b_flow.md) - ⏳ Coming next
- [Implementation Plan](./04_implementation-plan.md) - ⏳ After flow approval
- [Testing Requirements](./06_testing.md) - ⏳ After implementation plan
