# Category List Real-time Update

**Feature:** Hiển thị last message và unread count real-time trong category list  
**Module:** Category  
**Version:** 1.1 (Enhanced)  
**Date:** 2026-01-23  
**Status:** ✅ COMPLETED

---

## Overview

Update category list real-time khi có tin nhắn mới qua SignalR:

- Hiển thị tin nhắn mới nhất
- Cập nhật số tin chưa đọc
- Tự động refresh không cần reload

---

## Documents

| Bước | File                                         | Description                   | Status       |
| ---- | -------------------------------------------- | ----------------------------- | ------------ |
| 1    | [01_requirements.md](01_requirements.md)     | Yêu cầu chức năng             | ✅ Approved  |
| 2A   | [02a_wireframe.md](02a_wireframe.md)         | UI wireframe & layout         | ✅ Approved  |
| 2B   | [02_flow.md](02_flow.md)                     | User flow và system flow      | ✅ Approved  |
| 3    | [03_api.md](03_api.md)                       | API specification             | ✅ Approved  |
| 4    | [04_implementation.md](04_implementation.md) | Implementation plan từng bước | ✅ Completed |
| 5    | [05_progress.md](05_progress.md)             | Progress tracking             | N/A          |
| 6    | [06_testing.md](06_testing.md)               | Test cases                    | ✅ Approved  |

---

## Quick Info

**API Endpoint:** `GET /api/categories`  
**SignalR Events:** `MessageSent`, `MessageRead`  
**Estimated Time:** 2-3 hours

**Tech Stack:**

- SignalR (@microsoft/signalr)
- TanStack Query
- React 19

---

**Start:** Read [01_requirements.md](01_requirements.md)
