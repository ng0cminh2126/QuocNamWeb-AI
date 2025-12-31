# 🎯 Tóm tắt: Quy trình Feature Documentation & Versioning

> **Created:** 2025-12-27  
> **Purpose:** Hướng dẫn nhanh cho HUMAN về cách quản lý feature documentation

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Đánh số thứ tự các bước ✅

Tất cả files trong `docs/modules/auth/features/login/` đã được đánh số:

- 00_README.md → **[BƯỚC 0]** Overview
- 01_requirements.md → **[BƯỚC 1]** Requirements
- 02a_wireframe.md → **[BƯỚC 2A]** UI Design
- 02b_flow.md → **[BƯỚC 2B]** User Flow
- 03_api-contract.md → **[BƯỚC 3]** API Contract Reference
- 04_implementation-plan.md → **[BƯỚC 4]** Implementation Plan
- 05_progress.md → **[BƯỚC 5]** Progress Tracker
- 06_testing.md → **[BƯỚC 6]** Testing Requirements ✨ NEW

**API Documentation:**

- contract.md + snapshots → **[BƯỚC 3]** API Contract (actual docs)

---

### 2. Tạo workflow guide ✅

File: [docs/guides/feature_development_workflow.md](../guides/feature_development_workflow.md)

**Nội dung:**

- Quy trình 7 bước chi tiết (thêm BƯỚC 6: Testing)
- Decision Matrix (khi nào tạo version mới)
- Versioning strategy
- Changelog management
- AI behavior rules
- Testing requirements

---

### 3. Cập nhật Copilot Instructions ✅

File: [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

**Đã thêm:**

- **Rule 5:** Feature Development Workflow
- Decision Matrix cho versioning
- Quy trình xử lý khi bổ sung requirement

---

### 4. Tạo templates ✅

Folder: [docs/modules/\_feature_template/](../modules/_feature_template/)

**Templates:**

- 00_README.md - Overview template
- 01_requirements.md - Requirements template
- 02a_wireframe.md - Wireframe template
- 02b_flow.md - Flow template
- 03_api-contract.md - API reference template
- 04_implementation-plan.md - Implementation template
- 05_progress.md - Progress template
- 06_testing.md - Testing template ✨ NEW
- \_changelog.md - Changelog template
- upgrade-guide.template.md - Migration guide template

---

### 5. Tạo \_changelog.md cho Login ✅

File: [docs/modules/auth/features/login/\_changelog.md](../modules/auth/features/login/_changelog.md)

**Nội dung:**

- v1.0.0 initial release
- Planned versions (v1.1, v2.0)
- Breaking changes tracking

---

## 🚀 CÁCH SỬ DỤNG

- Tạo folder structure theo BƯỚC 0
- Tạo files từ BƯỚC 1 → BƯỚC 7
- Đánh số [BƯỚC X] trong header mỗi file với prefix (00*, 01*, etc.)
- Đợi HUMAN approve từng bước

3. **HUMAN làm:**

   - Review từng file theo thứ tự
   - Điền Pending Decisions
   - Tick ✅ APPROVED

4. **AI code khi:**

   - Tất cả BƯỚC 1-4 đã APPROVED
   - Có đủ API contract + snapshots (nếu có API)
   - Có đủ wireframe + flow (nếu có UI)
   - **Viết tests song song với code (BƯỚC 5)**
   - Document testing trong BƯỚC 6
   - Tick ✅ APPROVED

5. **AI code khi:**
   - Tất cả BƯỚC 1-4 đã APPROVED
   - Có đủ API contract + snapshots (nếu có API)
   - Có đủ wireframe + flow (nếu có UI)

---

### Khi BỔ SUNG Requirement:

**Scenario 1: Minor Update (không breaking)**

```
VD: Thêm loading skeleton, cải thiện error message
```

**AI sẽ hỏi:**

```
⚠️ Yêu cầu này có breaking changes không?
```

**HUMAN trả lời:**

```
- [x] Minor update (edit v1 files)
- [ ] Major update (tạo v2 folder)
```

**AI sẽ:**

- Edit files hiện tại (requirements.md, wireframe.md, etc.)
- Update \_changelog.md: Thêm entry v1.1.0
- Update version trong files: v1.0 → v1.1
- Không tạo folder mới

---

**Scenario 2: Major Update (có breaking changes)**

```
VD: Thêm phone login, đổi API structure
```

**AI sẽ hỏi:**

```
⚠️ Yêu cầu này có breaking changes không?
```

**HUMAN trả lời:**

```
- [ ] Minor update
- [x] Major update (tạo v2 folder)
```

**AI sẽ:**

1. Tạo folders:

   ```
   login/
   ├── _changelog.md      # Update: thêm v2.0 entry
   ├── v1/                # Move existing files
   │   ├── requirements.md
   │   ├── wireframe.md
   │   └── ...
   └── v2/                # Copy v1 + new changes
       ├── requirements.md
       ├── wireframe.md
       ├── ...
       └── upgrade-guide.md  # NEW: Migration guide
   ```

2. Update \_changelog.md với breaking changes

3. Tạo upgrade-guide.md

4. Update API snapshots:
   ```
   docs/api/auth/login/snapshots/
   ├── v1/  # GIỮ NGUYÊN
   └── v2/  # TẠO MỚI
   ```

---

## 📊 Decision Matrix - Nhanh

| Thay đổi gì?                  | Version   |
| ----------------------------- | --------- |
| API request/response đổi      | 🆕 v2.0   |
| Endpoint URL đổi              | 🆕 v2.0   |
| UI redesign hoàn toàn         | 🆕 v2.0   |
| Đổi business logic quan trọng | 🆕 v2.0   |
| Thêm optional field           | ✏️ v1.1   |
| Cải thiện error message       | ✏️ v1.1   |
| Fix bugs                      | ✏️ v1.0.1 |
| Thêm unit tests               | ✏️ v1.0.1 |

**Golden Rule:**

- ✅ Breaking change = Tạo v2
- ✅ Backward compatible = Update v1.x

---

## 🎯 Quick Reference

### Files trong feature folder:

| File                   | Bước | Approval? | Blocking Code? |
| ---------------------- | ---- | --------- | -------------- |
| README.md              | 0    | ❌        | ❌             |
| requirements.md        | 1    | ✅        | ✅             |
| wireframe.md           | 2A   | ✅        | ✅ (if has UI) |
| flow.md                | 2B   | ✅        | ⚠️ Optional    |
| contract.md            | 3    | ✅        | ✅             |
| snapshots/\*.json      | 3    | ✅        | ✅             |
| implementation-plan.md | 4    | ✅        | ✅             |
| progress.md            | 5    | ❌        | ❌             |

### Khi nào skip một bước:

- **Wireframe (BƯỚC 2A):** Skip nếu không có UI components/pages
- **Flow (BƯỚC 2B):** Skip nếu logic đơn giản, chỉ 1 màn hình
- **API Contract (BƯỚC 3):** Skip nếu không có API call

---

## 📝 Checklist cho HUMAN

### Khi AI tạo feature mới:

- [ ] Review BƯỚC 1: requirements.md
- [ ] Điền Pending Decisions
- [ ] ✅ APPROVED BƯỚC 1
- [ ] Review BƯỚC 2A: wireframe.md (nếu có)
- [ ] Điền UI decisions (colors, logo, text, etc.)
- [ ] ✅ APPROVED BƯỚC 2A
- [ ] Review BƯỚC 2B: flow.md (nếu có)
- [ ] ✅ APPROVED BƯỚC 2B
- [ ] Review BƯỚC 3: contract.md
- [ ] Cung cấp API snapshots (paste JSON hoặc setup capture config)
- [ ] ✅ APPROVED BƯỚC 3
- [ ] Review BƯỚC 4: implementation-plan.md
- [ ] Điền technical decisions
- [ ] ✅ APPROVED BƯỚC 4
- [ ] AI bắt đầu code BƯỚC 5 (với tests)
- [ ] Review BƯỚC 6: testing.md
- [ ] Verify all tests passing
- [ ] Check coverage ≥80%
- [ ] ✅ APPROVED BƯỚC 6 (deploy ready)

---

### Khi AI hỏi về breaking changes:

- [ ] Đọc requirement bổ sung
- [ ] Tự hỏi: "Có breaking changes không?"
  - API structure thay đổi? → Yes
  - UI redesign? → Yes
  - Chỉ thêm optional field? → No
  - Chỉ fix bug? → No
- [ ] Tick checkbox: Minor update hoặc Major update
- [ ] AI sẽ thực hiện theo quyết định

---

## 🔗 Tài liệu liên quan

- **Workflow đầy đủ:** [docs/guides/feature_development_workflow.md](../guides/feature_development_workflow.md)
- **Copilot Instructions:** [.github/copilot-instructions.md](../../.github/copilot-instructions.md)
- **Template folder:** [docs/modules/\_feature_template/](../modules/_feature_template/)
- **Login example:** [docs/modules/auth/features/login/](../modules/auth/features/login/)

---

## ❓ FAQ

**Q: Khi nào thì tạo v2 folder?**  
A: Khi có breaking changes (API đổi structure, UI redesign, business logic thay đổi)

**Q: Nếu không chắc có breaking changes không?**  
A: Hỏi AI phân tích. AI sẽ đưa ra Decision Matrix và đề xuất.

**Q: File cũ (v1) có bị xoá không?**  
A: KHÔNG. Luôn giữ lại trong folder v1/ để tham khảo.

**Q: Có thể skip bước nào?**  
A: Có. Wireframe/Flow (nếu không có UI), API Contract (nếu không có API).

**Q: AI code khi nào?**  
A: Khi TẤT CẢ các bước cần thiết đã APPROVED.

**Q: Có cần viết tests không?**  
A: BẮT BUỘC. Mỗi file implementation PHẢI có file test tương ứng. "No Code Without Tests"

**Q: Tests được viết khi nào?**  
A: Song song với code (BƯỚC 5), không phải sau khi code xong.

**Q: Coverage target là bao nhiêu?**  
A: ≥80% cho unit tests, ≥60% cho integration tests.

---

**Last Updated:** 2025-12-27  
**Maintained By:** AI + HUMAN collaboration
