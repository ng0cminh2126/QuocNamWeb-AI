# [Feature Name] - User Flow

> **[BƯỚC 2B]** User Flow & Navigation (Optional)  
> **Feature:** [Feature Name]  
> **Version:** v1.0  
> **Last Updated:** YYYY-MM-DD  
> **Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📊 Flow Diagram

### Main User Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION START                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Entry Point  │
                  │              │
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼ Condition A         ▼ Condition B
       ┌──────────────┐      ┌──────────────┐
       │   Action 1   │      │   Action 2   │
       └──────┬───────┘      └──────┬───────┘
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   Result     │
                  └──────────────┘
```

---

## 🗺️ Detailed Flow Steps

### Happy Path (Success Flow)

1. **Entry Point**

   - User arrives at [screen/page]
   - Initial state: [description]

2. **Step 1: [Action Name]**

   - User performs: [action description]
   - System validates: [validation logic]
   - Success → Go to Step 2
   - Failure → Show error and retry

3. **Step 2: [Action Name]**

   - User performs: [action description]
   - System processes: [processing logic]
   - Success → Go to Step 3
   - Failure → Show error message

4. **Step 3: [Final Action]**
   - System updates: [what gets updated]
   - User sees: [feedback/confirmation]
   - Redirect to: [destination]

---

### Error Flows

#### Error Scenario 1: [Error Type]

```
User performs [action]
   │
   ▼
System detects [error condition]
   │
   ▼
Show error message: "[Error message in Vietnamese]"
   │
   ▼
User can:
├─ Retry (go back to step X)
├─ Cancel (return to previous screen)
└─ Get help (show tooltip/documentation)
```

**Error Handling:**

- Error message: "[Vietnamese error message]"
- Recovery action: [What user can do]
- Retry limit: [if applicable]

---

#### Error Scenario 2: [Error Type]

```
[Similar format as Error Scenario 1]
```

---

## 🔀 Navigation Map

### Screen Transitions

```
[Screen A]
   │
   ├─ Click [Button/Link 1] → [Screen B]
   ├─ Click [Button/Link 2] → [Screen C]
   └─ Click [Button/Link 3] → [Screen D]

[Screen B]
   │
   ├─ Success → [Screen E]
   ├─ Cancel → [Screen A]
   └─ Error → Stay on [Screen B] + show error
```

### Navigation Rules

1. **Forward Navigation:**

   - From: [Screen A]
   - To: [Screen B]
   - Trigger: [User action]
   - Condition: [If applicable]

2. **Back Navigation:**

   - From: [Screen B]
   - To: [Screen A]
   - Trigger: [User action]
   - Data: [Preserve/Clear state?]

3. **Redirect Rules:**
   - If [condition]: Redirect to [screen]
   - If [condition]: Block and show message

---

## 🎯 User Journey Map

### Persona: [User Role]

| Step | User Action            | System Response     | User Feeling |
| ---- | ---------------------- | ------------------- | ------------ |
| 1    | [User performs action] | [System shows/does] | 😊 Happy     |
| 2    | [User performs action] | [System shows/does] | 🤔 Thinking  |
| 3    | [User performs action] | [System shows/does] | ✅ Satisfied |

**Pain Points:**

- Issue 1: [Description]
- Issue 2: [Description]

**Solutions:**

- Solution for issue 1
- Solution for issue 2

---

## ⏱️ Timing & Performance

### Expected Timing

| Step                  | Expected Time | Maximum Time |
| --------------------- | ------------- | ------------ |
| Initial page load     | < 1s          | < 3s         |
| API call response     | < 500ms       | < 1s         |
| Form validation       | Instant       | < 100ms      |
| Navigation transition | < 300ms       | < 500ms      |

---

## 🔐 Security Considerations

### Authentication Checkpoints

- [ ] Check 1: Verify user is logged in
- [ ] Check 2: Verify user has permission
- [ ] Check 3: Validate session token

### Data Validation Points

- [ ] Validate at: [Step X]
- [ ] Sanitize input at: [Step Y]
- [ ] Check authorization at: [Step Z]

---

## 📱 Mobile-Specific Flow

### Mobile Differences

**Desktop:**

- [Describe desktop-specific flow]

**Mobile:**

- [Describe mobile-specific flow differences]
- Use bottom sheet instead of modal
- Swipe gestures for navigation
- Touch-optimized targets (≥44px)

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Flow Decision          | Lựa chọn              | HUMAN Decision |
| --- | ---------------------- | --------------------- | -------------- |
| 1   | Redirect after success | Page A or Page B?     | ⬜ **\_\_\_**  |
| 2   | Error retry limit      | 3 times or unlimited? | ⬜ **\_\_\_**  |
| 3   | Back button behavior   | Confirm or direct?    | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC code flow logic nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                  | Status         |
| ------------------------- | -------------- |
| Đã review Main Flow       | ⬜ Chưa review |
| Đã review Error Flows     | ⬜ Chưa review |
| Đã review Navigation Map  | ⬜ Chưa review |
| Đã điền Pending Decisions | ⬜ Chưa điền   |
| **APPROVED để implement** | ⬜ PENDING     |

**HUMAN Signature:** ******\_******  
**Date:** ******\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code navigation logic nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Wireframe:** [02a_wireframe.md](./02a_wireframe.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)

---

## 📝 Notes

- Add any special flow considerations
- Link to user research or usability testing
- Reference competitor flows

---

## 📚 Version History

| Version | Date       | Changes             |
| ------- | ---------- | ------------------- |
| v1.0    | YYYY-MM-DD | Initial flow design |
