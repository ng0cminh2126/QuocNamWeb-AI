# 🎯 Feature Development Workflow - Hướng dẫn từng bước

> **Version:** 1.0  
> **Last Updated:** 2025-12-27  
> **Purpose:** Quy trình chuẩn để phát triển một feature mới từ đầu đến cuối

---

## 📊 Tổng quan quy trình

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 1: REQUIREMENTS → BƯỚC 2: DESIGN → BƯỚC 3: API CONTRACT          │
│  → BƯỚC 4: IMPLEMENTATION PLAN → BƯỚC 5: CODING                        │
│  → BƯỚC 6: TESTING → BƯỚC 7: E2E (optional)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ BƯỚC 0: Khởi tạo Feature Documentation Structure

**Khi nào:** Ngay khi có yêu cầu feature mới

**AI sẽ tạo:**

```
docs/modules/[module]/features/[feature-name]/
├── README.md              # ✅ Overview & navigation
├── requirements.md        # ⏳ BƯỚC 1
├── wireframe.md           # ⏳ BƯỚC 2
├── flow.md                # ⏳ BƯỚC 2 (optional)
├── implementation-plan.md # ⏳ BƯỚC 4
└── progress.md            # ⏳ BƯỚC 5 (tracking)

docs/api/[module]/[feature-name]/
├── contract.md            # ⏳ BƯỚC 3
└── snapshots/v1/          # ⏳ BƯỚC 3
    ├── README.md
    └── (JSON files)
```

**Thứ tự đánh số:**

- README.md: Overview (không cần approval)
- requirements.md: **[BƯỚC 1]** Requirements Gathering
- wireframe.md: **[BƯỚC 2A]** UI Design (nếu có UI)
- flow.md: **[BƯỚC 2B]** User Flow (nếu có UI - optional)
- API contract.md: **[BƯỚC 3]** API Contract
- implementation-plan.md: **[BƯỚC 4]** Implementation Plan
- progress.md: **[BƯỚC 5]** Progress Tracker (tự động)
- testing.md: **[BƯỚC 6]** Testing Requirements & Coverage

---

## 📝 BƯỚC 1: Requirements Gathering

**File:** `docs/modules/[module]/features/[feature]/requirements.md`

**Mục đích:** Thu thập và xác nhận yêu cầu nghiệp vụ

**AI sẽ tạo sections:**

1. Description & User Stories
2. Acceptance Criteria (Functional, UI, Security)
3. Technical Constraints
4. Dependencies
5. **HUMAN DECISIONS** (các quyết định cần xác nhận)
6. **HUMAN CONFIRMATION** (approval checkbox)

**HUMAN cần làm:**

- [ ] Review yêu cầu nghiệp vụ
- [ ] Điền các Pending Decisions
- [ ] ✅ APPROVED để chuyển sang BƯỚC 2

**Output:** requirements.md với status ✅ READY

---

## 🎨 BƯỚC 2A: UI/UX Design (Wireframe)

**File:** `docs/modules/[module]/features/[feature]/wireframe.md`

**Khi nào:** Chỉ khi feature có UI components/pages

**AI sẽ tạo:**

1. Responsive designs (Desktop, Tablet, Mobile)
2. Component specifications (sizes, colors, states)
3. Spacing & layout guidelines
4. **HUMAN DECISIONS** (logo, colors, text, etc.)
5. **HUMAN CONFIRMATION**

**HUMAN cần làm:**

- [ ] Review UI designs
- [ ] Điền các UI decisions (logo path, brand colors, etc.)
- [ ] ✅ APPROVED để chuyển sang BƯỚC 2B

**Output:** wireframe.md với status ✅ READY

---

## 🗺️ BƯỚC 2B: User Flow & Navigation (Optional)

**File:** `docs/modules/[module]/features/[feature]/flow.md`

**Khi nào:**

- ✅ Feature có navigation phức tạp
- ✅ Có nhiều screens/states
- ❌ KHÔNG cần nếu là simple form hoặc chỉ 1 màn hình

**AI sẽ tạo:**

1. Flow diagrams (ASCII art)
2. Screen transitions & routing logic
3. Error scenarios & handling
4. Navigation maps
5. **HUMAN CONFIRMATION**

**HUMAN cần làm:**

- [ ] Review flow logic
- [ ] ✅ APPROVED để chuyển sang BƯỚC 3

**Nếu KHÔNG cần flow.md:**

- AI sẽ SKIP bước này và chuyển thẳng sang BƯỚC 3

**Output:** flow.md với status ✅ READY (hoặc SKIPPED)

---

## 📡 BƯỚC 3: API Contract & Snapshots

**Files:**

- `docs/api/[module]/[feature]/contract.md`
- `docs/api/[module]/[feature]/snapshots/v1/*.json`

**Mục đích:** Định nghĩa API interface trước khi code

**AI sẽ tạo contract.md với:**

1. Endpoint specification table
2. Request headers, body (TypeScript interface)
3. Validation rules
4. Response success/error (TypeScript interfaces)
5. Link tới snapshots
6. **HUMAN CONFIRMATION**

**HUMAN cần làm:**

- [ ] Review API contract
- [ ] Cung cấp snapshots (actual JSON response từ API)
  - Cách 1: Paste JSON vào snapshot files
  - Cách 2: Tạo `_capture_config.json` để AI tự capture
- [ ] ✅ APPROVED để chuyển sang BƯỚC 4

**⚠️ CRITICAL:** Không có snapshot = AI KHÔNG ĐƯỢC code API client

**Output:** contract.md + snapshots/v1/\*.json với status ✅ READY

---

## 📋 BƯỚC 4: Implementation Plan

**File:** `docs/modules/[module]/features/[feature]/implementation-plan.md`

**Mục đích:** Plan chi tiết về code sẽ viết

**AI sẽ tạo:**

1. **IMPACT SUMMARY**
   - Files tạo mới (với mô tả)
   - Files sửa đổi (chi tiết thay đổi gì)
   - Files xoá (nếu có)
   - Dependencies thêm/xoá
2. **TESTING REQUIREMENTS**
   - Mapping: Implementation file → Test file → Test cases
3. **IMPLEMENTATION CHECKLIST**
   - Danh sách tasks chi tiết
4. **PENDING DECISIONS**
   - Các quyết định kỹ thuật cần HUMAN
5. **HUMAN CONFIRMATION**

**HUMAN cần làm:**

- [ ] Review Impact Summary
- [ ] Review Testing Requirements
- [ ] Điền Pending Decisions (pagination size, retry count, etc.)
- [ ] ✅ APPROVED để chuyển sang BƯỚC 5

**Output:** implementation-plan.md với status ✅ APPROVED

---

## 💻 BƯỚC 5: Coding & Testing

**File:** `docs/modules/[module]/features/[feature]/progress.md` (auto-generated)

**Điều kiện bắt buộc:**

- ✅ requirements.md APPROVED
- ✅ wireframe.md APPROVED (nếu có UI)
- ✅ flow.md APPROVED (nếu tạo)
- ✅ contract.md + snapshots READY (nếu có API)
- ✅ implementation-plan.md APPROVED

**AI sẽ:**

1. Implement theo checklist trong implementation-plan.md
2. **Tạo test files cho MỌI code file (BẮT BUỘC)**
3. Update progress.md sau mỗi task hoàn thành
4. Run tests và fix errors
5. Commit code với conventional commit messages

**Progress tracking:** AI tự động update progress.md

**Testing Rule:** "No Code Without Tests"

- Mỗi file implementation PHẢI có file test tương ứng
- Tests được viết song song với code, không phải sau

---

## 🧪 BƯỚC 6: Unit Testing (BẮT BUỘC)

**File:** `docs/modules/[module]/features/[feature]/06_testing.md`

**Mục đích:** Document testing requirements và track test coverage

**AI sẽ tạo:**

1. Test files mapping (implementation → test file)
2. Required test cases cho mỗi file
3. Testing checklist
4. Coverage targets (≥80% unit tests)
5. **HUMAN CONFIRMATION** (tests passing before deployment)

**Testing Requirements:**

| Implementation Type  | Test Cases Required | Example                               |
| -------------------- | ------------------- | ------------------------------------- |
| API clients          | 4 cases minimum     | Success, error, validation, network   |
| Query/Mutation hooks | 5 cases minimum     | Loading, success, error, key, refetch |
| Components           | 4-6 cases           | Render, events, states, accessibility |
| Utilities            | 3+ cases            | Happy path, edge cases, errors        |

**HUMAN cần làm:**

- [ ] Review test coverage report
- [ ] Verify all tests passing
- [ ] ✅ APPROVED để deploy

**Output:** 06_testing.md với all tests ✅ PASSING

---

## 🎭 BƯỚC 7: End-to-End Testing (Optional)

**File:** `docs/e2e/pages/[feature].spec.ts`

**Khi nào:** Sau khi BƯỚC 6 hoàn thành và tests passing

**AI sẽ tạo:**

1. Playwright E2E test scenarios
2. Test coverage cho happy path & error cases

---

## 🔄 Versioning Strategy - Khi nào tạo version mới?

### ✅ TẠO VERSION MỚI (v2, v3, ...) khi:

1. **Breaking changes** trong API:

   - Response structure thay đổi
   - Request fields bắt buộc thay đổi
   - Endpoint URL thay đổi

2. **Major feature upgrade**:

   - Thêm authentication method mới (email → phone)
   - Thay đổi UI hoàn toàn (redesign)
   - Thêm business logic hoàn toàn mới

3. **Deprecation** cần maintain backward compatibility

### ❌ KHÔNG TẠO VERSION - Chỉ update existing khi:

1. **Minor enhancements**:

   - Thêm validation rule
   - Cải thiện error message
   - Fix bugs
   - Refactor code (không đổi behavior)

2. **Non-breaking additions**:
   - Thêm optional field mới vào request
   - Thêm field mới vào response (không đổi existing fields)

---

## 📦 Versioning Structure

### Khi TẠO VERSION MỚI:

```
docs/modules/auth/features/login/
├── README.md                    # Update: link tới v2
├── _changelog.md                # Update: thêm v2.0 entry
├── v1/                          # ⚠️ GIỮ NGUYÊN v1 (archive)
│   ├── requirements.md
│   ├── wireframe.md
│   ├── flow.md
│   ├── implementation-plan.md
│   └── progress.md
├── v2/                          # 🆕 TẠO MỚI v2
│   ├── requirements.md          # Copy từ v1 + modifications
│   ├── wireframe.md
│   ├── flow.md
│   ├── implementation-plan.md
│   └── progress.md
│   └── upgrade-guide.md         # 🆕 Hướng dẫn upgrade từ v1
└── (active files là v2)         # Optional: symlink hoặc copy

docs/api/auth/login/
├── contract.md                  # Update: link v1 và v2
├── snapshots/
│   ├── v1/                      # ⚠️ GIỮ NGUYÊN
│   │   ├── success.json
│   │   └── error-401.json
│   └── v2/                      # 🆕 TẠO MỚI
│       ├── success.json
│       └── error-401.json
```

### Khi KHÔNG TẠO VERSION (minor updates):

```
docs/modules/auth/features/login/
├── README.md
├── requirements.md              # ✏️ Edit trực tiếp
├── wireframe.md                 # ✏️ Edit trực tiếp
├── flow.md                      # ✏️ Edit trực tiếp
├── implementation-plan.md       # ✏️ Edit trực tiếp
└── progress.md

docs/api/auth/login/
├── contract.md                  # ✏️ Edit trực tiếp
└── snapshots/v1/
    ├── success.json             # ✏️ Replace nếu cần
    └── error-401.json
```

**Version trong contract.md:**

```markdown
# Contract: Login API

> **Version:** v1.2 ← Minor update (1.0 → 1.1 → 1.2)
> **Last Updated:** 2025-12-27
> **Changes:** Added optional `rememberMe` field to request
```

---

## 🎯 Decision Matrix - Version mới hay Update?

| Tình huống                                     | Action       | Lý do                                 |
| ---------------------------------------------- | ------------ | ------------------------------------- |
| Thêm optional field vào API request            | ✏️ Update v1 | Backward compatible                   |
| Đổi field name trong API                       | 🆕 Create v2 | Breaking change                       |
| Thêm brand color mới vào wireframe             | ✏️ Update v1 | Minor UI enhancement                  |
| Redesign hoàn toàn UI (layout change)          | 🆕 Create v2 | Major UI change                       |
| Fix bug trong validation                       | ✏️ Update v1 | Bug fix, not feature change           |
| Thêm authentication method (email + phone)     | 🆕 Create v2 | Major feature addition                |
| Cải thiện error message text                   | ✏️ Update v1 | Minor UX improvement                  |
| Đổi endpoint từ `/login` → `/auth/login`       | 🆕 Create v2 | Breaking change                       |
| Thêm field mới vào response (không bắt buộc)   | ✏️ Update v1 | Backward compatible                   |
| Remove field từ response                       | 🆕 Create v2 | Breaking change                       |
| Optimize code performance (no behavior change) | ✏️ Update v1 | Internal refactor                     |
| Đổi business logic (validation rules)          | 🆕 Create v2 | Behavior change                       |
| Add new unit tests                             | ✏️ Update v1 | Testing improvement                   |
| Change test framework (Jest → Vitest)          | ✏️ Update v1 | Tooling change (not feature)          |
| Add E2E tests                                  | ✏️ Update v1 | Testing coverage improvement          |
| API response status code thay đổi              | 🆕 Create v2 | Contract change                       |
| Thêm loading skeleton mới                      | ✏️ Update v1 | Minor UI enhancement                  |
| Đổi từ REST → GraphQL                          | 🆕 Create v2 | Complete API paradigm change          |
| Add rate limiting to API                       | ✏️ Update v1 | Non-breaking enhancement              |
| Require new permission/role                    | 🆕 Create v2 | Authorization logic change            |
| Add analytics tracking                         | ✏️ Update v1 | Non-breaking addition                 |
| Change password hashing algorithm              | 🆕 Create v2 | Security breaking change              |
| Add "Remember me" checkbox                     | ✏️ Update v1 | Minor feature (optional)              |
| Replace email login with phone-only            | 🆕 Create v2 | Breaking user experience change       |
| Add SSO/OAuth login                            | 🆕 Create v2 | Major authentication method addition  |
| Change error message format (structure)        | 🆕 Create v2 | Contract change                       |
| Translate error messages to Vietnamese         | ✏️ Update v1 | Localization (no structure change)    |
| Add dark mode support                          | ✏️ Update v1 | UI enhancement (not redesign)         |
| Migrate from Class components → Hooks          | ✏️ Update v1 | Internal refactor (no behavior change |

---

## 📋 Changelog Management

### \_changelog.md structure:

```markdown
# Login Feature - Changelog

## v2.0.0 - 2025-XX-XX 🆕 MAJOR

### Breaking Changes

- Đổi field `email` → `identifier` trong request
- Response thêm field `userRole` (bắt buộc)

### New Features

- Hỗ trợ login bằng phone number
- Thêm "Remember me" functionality

### Migration Guide

- See [v2/upgrade-guide.md](./v2/upgrade-guide.md)

---

## v1.2.0 - 2025-12-27

### Enhancements

- Thêm optional field `rememberMe` vào request
- Cải thiện error messages (Vietnamese)

### Bug Fixes

- Fix email validation regex

---

## v1.1.0 - 2025-12-26

### Enhancements

- Thêm loading skeleton
- Optimize API response caching

---

## v1.0.0 - 2025-12-25 ✨ INITIAL

### Features

- Email/password login
- Token-based authentication
- Responsive UI (desktop, tablet, mobile)
```

---

## 🚨 AI Behavior Rules

### Khi HUMAN yêu cầu bổ sung requirement:

1. **AI PHẢI hỏi:**

   ```
   ⚠️ Yêu cầu này có breaking changes không?

   Vui lòng xác nhận:
   - [ ] Minor update (edit v1 files)
   - [ ] Major update (create v2 folder)

   Nếu không chắc, tôi sẽ đề xuất dựa trên Decision Matrix.
   ```

2. **Nếu HUMAN không chắc:**

   - AI phân tích breaking changes
   - Đề xuất action (Update/Create)
   - Giải thích lý do

3. **Nếu tạo v2:**
   - Copy toàn bộ v1/ folder
   - Tạo v2/upgrade-guide.md
   - Update \_changelog.md
   - Update README.md links

---

## ✅ Quick Reference - Files & Steps

| File                   | Step | HUMAN Approval Required? | Blocking?              |
| ---------------------- | ---- | ------------------------ | ---------------------- |
| README.md              | 0    | ❌ No                    | ❌ No                  |
| requirements.md        | 1    | ✅ Yes                   | ✅ Yes (blocks step 2) |
| wireframe.md           | 2A   | ✅ Yes (if UI exists)    | ✅ Yes (blocks step 5) |
| flow.md                | 2B   | ✅ Yes (optional)        | ⚠️ Optional (can skip) |
| contract.md            | 3    | ✅ Yes                   | ✅ Yes (blocks step 5) |
| snapshots/\*.json      | 3    | ✅ Yes                   | ✅ Yes (blocks step 5) |
| implementation-plan.md | 4    | ✅ Yes                   | ✅ Yes (blocks step 5) |
| progress.md            | 5    | ❌ No (auto-generated)   | ❌ No                  |
| E2E tests              | 6    | ❌ No (optional)         | ❌ No                  |

---

## 📌 Summary

### Khi có feature MỚI:

1. AI tạo bộ files BƯỚC 0 → 4
2. HUMAN approve từng bước
3. AI code BƯỚC 5 khi tất cả approved

### Khi BỔ SUNG requirement:

1. HUMAN xác định: Minor update hay Major update?
2. **Minor:** AI edit files hiện tại → Cập nhật \_changelog.md
3. **Major:** AI tạo v2/ folder → Copy v1 → Tạo upgrade-guide.md

### Quy tắc vàng:

- ✅ **Breaking change** = Tạo version mới
- ✅ **Backward compatible** = Update version hiện tại
- ✅ **Luôn giữ lại** history (không xoá v1)
