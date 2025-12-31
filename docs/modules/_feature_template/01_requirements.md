# [Feature Name] - Requirements Document

> **[BƯỚC 1]** Requirements Gathering  
> **Feature ID:** `[MODULE]-[NUMBER]` (e.g., AUTH-001, CHAT-001)  
> **Module:** [Module Name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING APPROVAL

---

## 📖 Description

Mô tả ngắn gọn về feature này làm gì.

### Use Case

Giải thích tình huống sử dụng thực tế của feature.

---

## 👥 User Stories

1. As a **[user role]**, I want to **[action]** so that **[benefit]**

2. As a **[user role]**, I want to **[action]** so that **[benefit]**

3. As a **[user role]**, I want to **[action]** so that **[benefit]**

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3
- [ ] Requirement 4

### UI Requirements (if applicable)

- [ ] UI requirement 1
- [ ] UI requirement 2
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] Accessibility standards (WCAG 2.1 AA)

### Security Requirements (if applicable)

- [ ] Authentication/Authorization required
- [ ] Input validation
- [ ] XSS/CSRF protection
- [ ] Data encryption (if sensitive)

---

## 🔧 Technical Constraints

### Technology Stack

- **Frontend:** React 19, TypeScript 5
- **UI Library:** TailwindCSS, Radix UI
- **State Management:** TanStack Query (server), Zustand (client)
- **HTTP Client:** Axios

### Browser Support

- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### Performance Requirements

- [ ] Initial load < 3 seconds
- [ ] API response time < 1 second
- [ ] Smooth animations (60fps)

---

## 🔗 Dependencies

### Internal Dependencies

- Depends on module: [module name]
- Requires feature: [feature name]

### External Dependencies

- API endpoint: `[endpoint]`
- Third-party service: [service name] (if any)

---

## 📋 Out of Scope

**What is NOT included in this version:**

- Item 1
- Item 2
- Item 3

_(These may be considered for future versions)_

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề           | Lựa chọn       | HUMAN Decision |
| --- | ---------------- | -------------- | -------------- |
| 1   | [Decision topic] | Option A or B? | ⬜ **\_\_\_**  |
| 2   | [Decision topic] | Value 1 or 2?  | ⬜ **\_\_\_**  |
| 3   | [Decision topic] | Yes or No?     | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC tiếp tục nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                      | Status         |
| ----------------------------- | -------------- |
| Đã review User Stories        | ⬜ Chưa review |
| Đã review Acceptance Criteria | ⬜ Chưa review |
| Đã điền Pending Decisions     | ⬜ Chưa điền   |
| **APPROVED để tiếp tục**      | ⬜ PENDING     |

**HUMAN Signature:** ******\_******  
**Date:** ******\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC chuyển sang BƯỚC 2 nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Feature Overview:** [00_README.md](./00_README.md)
- **Wireframe (next):** [02a_wireframe.md](./02a_wireframe.md)
- **API Contract (later):** [03_api-contract.md](./03_api-contract.md)

---

## 📝 Notes

- Add any additional notes or context here
- Link to related documents or resources
- Reference design mockups or prototypes

---

## 📚 Version History

| Version | Date       | Changes          |
| ------- | ---------- | ---------------- |
| v1.0    | YYYY-MM-DD | Initial creation |
