# 🔐 Logout Feature - Requirements Document

> **[BƯỚC 1]** Requirements Gathering  
> **Feature ID:** `AUTH-002`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ⏳ PENDING APPROVAL

---

## 📖 Description

Cho phép người dùng đăng xuất khỏi hệ thống Portal Internal Chat một cách an toàn, xóa toàn bộ thông tin xác thực và session data, sau đó chuyển hướng về màn hình đăng nhập.

### Use Case

Khi người dùng hoàn tất công việc hoặc cần chuyển đổi tài khoản, họ cần một cách an toàn để đăng xuất khỏi hệ thống. Logout đảm bảo rằng:
- Không ai khác có thể truy cập tài khoản trên thiết bị đó
- Thông tin xác thực được xóa hoàn toàn khỏi trình duyệt
- Hệ thống không còn lưu trữ access token

---

## 👥 User Stories

1. As a **staff member**, I want to **logout when I finish work** so that **no one else can access my account on this device**

2. As a **team lead**, I want to **logout quickly from the sidebar** so that **I can switch accounts or secure my session**

3. As a **mobile user**, I want to **logout and see confirmation** so that **I know my session has ended safely**

4. As a **user**, I want to **be redirected to login after logout** so that **I can login again if needed**

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] Người dùng có thể truy cập nút "Đăng xuất" từ profile dropdown trong MainSidebar
- [ ] Click "Đăng xuất" sẽ xóa access token khỏi localStorage
- [ ] Click "Đăng xuất" sẽ clear Zustand auth store (user, accessToken, expiresAt)
- [ ] Sau khi logout, người dùng được redirect về `/login`
- [ ] Protected routes sẽ tự động redirect về login nếu không có token
- [ ] Logout không gọi API backend (client-side only)
- [ ] Sau logout, người dùng không thể truy cập các trang protected
- [ ] TanStack Query cache không bị clear (để tối ưu performance khi login lại)

### UI/UX Requirements

- [ ] Nút "Đăng xuất" hiển thị trong profile popover ở MainSidebar
- [ ] Icon LogOut hiển thị cạnh text "Đăng xuất"
- [ ] Hover state: background chuyển sang bg-brand-50
- [ ] Profile popover đóng ngay sau khi click logout
- [ ] Không có loading state (logout instant)
- [ ] Không có confirmation dialog (logout trực tiếp)
- [ ] Responsive: hoạt động tốt trên desktop, tablet, mobile
- [ ] data-testid="logout-button" cho E2E testing

### Security Requirements

- [ ] Xóa toàn bộ access token khỏi localStorage
- [ ] Xóa toàn bộ auth state khỏi Zustand persist storage
- [ ] Không log sensitive data (token, user info)
- [ ] Đảm bảo người dùng không thể truy cập protected routes sau logout

---

## 🔧 Technical Constraints

### Technology Stack

- **Frontend:** React 19, TypeScript 5
- **UI Library:** TailwindCSS, Radix UI (Popover)
- **State Management:** Zustand (auth store)
- **Routing:** React Router v7
- **Icons:** Lucide React (LogOut icon)

### Browser Support

- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### Performance Requirements

- [ ] Logout execution < 100ms
- [ ] Redirect to login < 300ms
- [ ] Smooth transition (no flicker)

---

## 🔗 Dependencies

### Internal Dependencies

- Depends on: `useAuthStore` (src/stores/authStore.ts)
- Depends on: `clearAuthStorage()` function (src/lib/auth/tokenStorage.ts)
- Depends on: React Router navigation
- UI component: MainSidebar (src/features/portal/components/MainSidebar.tsx)

### External Dependencies

- None (client-side only)

---

## 📋 Out of Scope

**What is NOT included in this version:**

- Logout API call to backend (backend không yêu cầu)
- Confirmation dialog "Bạn có chắc muốn đăng xuất?"
- Toast notification "Đã đăng xuất thành công"
- Clear TanStack Query cache
- Session timeout auto-logout (sẽ có ở feature riêng)
- Logout from all devices (multi-device logout)

_(These may be considered for future versions)_

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề                                     | Lựa chọn                   | HUMAN Decision |
| --- | ------------------------------------------ | -------------------------- | -------------- |
| 1   | Có cần confirmation dialog không?          | Yes hoặc No?               | ⬜ **No**      |
| 2   | Có cần toast "Đăng xuất thành công" không? | Yes hoặc No?               | ⬜ **No**      |
| 3   | Clear TanStack Query cache không?          | Yes (clear) hoặc No (keep)? | ⬜ **No**      |

> ⚠️ **AI KHÔNG ĐƯỢC tiếp tục nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                      | Status         |
| ----------------------------- | -------------- |
| Đã review User Stories        | ⬜ Chưa review |
| Đã review Acceptance Criteria | ⬜ Chưa review |
| Đã điền Pending Decisions     | ⬜ Chưa điền   |
| **APPROVED để tiếp tục**      | ⬜ PENDING     |

**HUMAN Signature:** ______  
**Date:** ______

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC chuyển sang BƯỚC 2 nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Wireframe (next):** [02a_wireframe.md](./02a_wireframe.md)
- **Flow (next):** [02b_flow.md](./02b_flow.md)
- **Login Feature:** [../login/01_requirements.md](../login/01_requirements.md)

---

## 📝 Notes

- Logout hiện tại chỉ là client-side, không gọi API backend
- MainSidebar đã có UI logout sẵn (profile popover với LogOut icon)
- Cần implement handler logic trong PortalWireframes.tsx
- useAuthStore đã có method `logout()` sẵn, chỉ cần gọi và redirect

---
