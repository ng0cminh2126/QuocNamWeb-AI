# API Snapshot Capture Instructions

**Feature:** Conversation Category Management System  
**Status:** ⏳ Waiting for HUMAN to capture snapshots  
**Created:** 2026-01-16

---

## 📋 Prerequisites

Before capturing snapshots, ensure you have:

- ✅ Valid authentication token (Bearer token)
- ✅ Access to Chat API and Task API endpoints
- ✅ `curl` installed (or Postman as alternative)
- ✅ Real test data in the system (categories, groups, templates)

---

## 🎯 Critical Snapshots (MUST HAVE)

These 4 snapshots are **REQUIRED** before AI can start coding:

### 1. Categories List
**File:** `categories-success.json`  
**Endpoint:** `GET /api/categories`

```bash
curl -X GET "https://your-api-domain.com/api/categories" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Accept: application/json" \
  > categories-success.json
```

**Expected:** Array of CategoryDto with at least 2-3 categories

---

### 2. Category Conversations
**File:** `category-conversations-success.json`  
**Endpoint:** `GET /api/categories/{id}/conversations`

```bash
# Replace CATEGORY_ID with an actual category ID from step 1
curl -X GET "https://your-api-domain.com/api/categories/CATEGORY_ID/conversations" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Accept: application/json" \
  > category-conversations-success.json
```

**Expected:** Array of ConversationDto with group conversations

---

### 3. Group Members
**File:** `group-members-success.json`  
**Endpoint:** `GET /api/groups/{id}/members`

```bash
# Replace GROUP_ID with an actual group/conversation ID from step 2
curl -X GET "https://your-api-domain.com/api/groups/GROUP_ID/members" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Accept: application/json" \
  > group-members-success.json
```

**Expected:** Array of MemberDto with different roles (OWN, ADM, MBR)

---

### 4. Checklist Templates
**File:** `templates-success.json`  
**Endpoint:** `GET /api/checklist-templates?conversationId={id}`

```bash
# Replace CONVERSATION_ID with an actual conversation ID
curl -X GET "https://your-api-domain.com/api/checklist-templates?conversationId=CONVERSATION_ID" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Accept: application/json" \
  > templates-success.json
```

**Expected:** Array of CheckListTemplateResponse with template items

---

## 📦 Secondary Snapshots (Optional, can mock)

These can be captured later or mocked during development:

### 5. Add Member
```bash
curl -X POST "https://your-api-domain.com/api/groups/GROUP_ID/members" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID_TO_ADD"}' \
  > add-member-success.json
```

### 6. Remove Member
```bash
curl -X DELETE "https://your-api-domain.com/api/groups/GROUP_ID/members/USER_ID" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  > remove-member-success.json
```

### 7. Promote Member
```bash
curl -X POST "https://your-api-domain.com/api/groups/GROUP_ID/members/USER_ID/promote" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  > promote-member-success.json
```

### 8. Create Template
```bash
curl -X POST "https://your-api-domain.com/api/checklist-templates" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "conversationId": "CONVERSATION_ID",
    "items": [
      {"name": "Item 1", "order": 1, "isRequired": true}
    ]
  }' \
  > create-template-success.json
```

### 9. Update Template
```bash
curl -X PUT "https://your-api-domain.com/api/checklist-templates/TEMPLATE_ID" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Template",
    "conversationId": "CONVERSATION_ID",
    "items": [
      {"name": "Updated Item", "order": 1, "isRequired": true}
    ]
  }' \
  > update-template-success.json
```

### 10. Delete Template
```bash
curl -X DELETE "https://your-api-domain.com/api/checklist-templates/TEMPLATE_ID" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  > delete-template-success.json
```

---

## ❌ Error Snapshots (Optional)

### 401 Unauthorized
```bash
# Call any endpoint with invalid token
curl -X GET "https://your-api-domain.com/api/categories" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  > error-401.json
```

### 403 Forbidden
```bash
# Try to add member as non-admin user
curl -X POST "https://your-api-domain.com/api/groups/GROUP_ID/members" \
  -H "Authorization: Bearer NON_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID"}' \
  > error-403.json
```

### 404 Not Found
```bash
# Use non-existent group ID
curl -X GET "https://your-api-domain.com/api/groups/00000000-0000-0000-0000-000000000000/members" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  > error-404.json
```

---

## 🔍 Validation Checklist

After capturing snapshots, verify:

- [ ] All critical snapshots (4 files) exist
- [ ] JSON files are valid (no HTML error pages)
- [ ] Data looks realistic (not empty arrays)
- [ ] UUIDs are actual values (not placeholders)
- [ ] Member roles include OWN, ADM, MBR variants
- [ ] Templates have items with order and isRequired fields

---

## 🚀 Quick Capture Script (All in One)

If you have access to API and test accounts, run this script:

```bash
#!/bin/bash

API_BASE="https://your-api-domain.com"
TOKEN="YOUR_ACTUAL_TOKEN"

# 1. Categories
curl -X GET "$API_BASE/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  > categories-success.json

# Get first category ID (requires jq)
CATEGORY_ID=$(jq -r '.[0].id' categories-success.json)

# 2. Category Conversations
curl -X GET "$API_BASE/api/categories/$CATEGORY_ID/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  > category-conversations-success.json

# Get first group ID
GROUP_ID=$(jq -r '.[0].id' category-conversations-success.json)

# 3. Group Members
curl -X GET "$API_BASE/api/groups/$GROUP_ID/members" \
  -H "Authorization: Bearer $TOKEN" \
  > group-members-success.json

# 4. Templates
curl -X GET "$API_BASE/api/checklist-templates?conversationId=$GROUP_ID" \
  -H "Authorization: Bearer $TOKEN" \
  > templates-success.json

echo "✅ All critical snapshots captured!"
```

---

## 📝 Notes

### Data Requirements
- **Categories:** At least 2-3 categories with different names
- **Conversations:** 3-5 groups per category, with varied member counts
- **Members:** Mix of roles (Owner, Admin, Member), at least 5-10 members per group
- **Templates:** 2-3 templates per conversation, with 3-5 items each

### Format Notes
- All timestamps should be ISO 8601 format
- UUIDs should be valid v4 format
- Email addresses should be realistic (not test@test.com)
- Names should be realistic Vietnamese names

### Security
- **DO NOT commit actual tokens to git**
- Use test accounts, not production data
- Sanitize sensitive data if necessary

---

## ✅ After Capturing

Once you've captured the 4 critical snapshots:

1. Verify files exist in this folder
2. Open `03_api-contract.md`
3. Update HUMAN CONFIRMATION section:
   - Tick "Đã capture critical snapshots (4 files)"
   - Tick "APPROVED để thực thi"
   - Sign and date

Then AI can proceed to BƯỚC 4 (Implementation Plan).
