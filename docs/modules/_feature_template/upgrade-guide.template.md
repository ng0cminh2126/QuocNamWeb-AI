# [Feature Name] - Upgrade Guide v1.0 → v2.0

> **From Version:** v1.0  
> **To Version:** v2.0  
> **Release Date:** YYYY-MM-DD  
> **Estimated Migration Time:** XX minutes

---

## 🚨 Breaking Changes Overview

### Summary

This is a **MAJOR version** upgrade with breaking changes. You **MUST** update your code.

**Key Changes:**

1. Breaking change 1 summary
2. Breaking change 2 summary
3. Breaking change 3 summary

---

## 📋 Detailed Breaking Changes

### 1. [Change Category] - [Change Title]

**What Changed:**

- Old behavior: ...
- New behavior: ...

**Why:**
Explanation of why this breaking change was necessary.

**Impact:**

- [ ] API contracts
- [ ] Request/Response structure
- [ ] UI components
- [ ] Database schema
- [ ] Environment variables

**Before (v1.0):**

```typescript
// Old code example
```

**After (v2.0):**

```typescript
// New code example
```

---

### 2. [Another Breaking Change]

...

---

## 🔄 Migration Steps

### Step 1: Backup Current Implementation

```bash
# Create a backup branch
git checkout -b backup/v1.0-[feature-name]
git push origin backup/v1.0-[feature-name]
```

### Step 2: Update Dependencies

```bash
npm install [package]@^2.0.0
```

### Step 3: Update API Contracts

**Files to modify:**

- `docs/api/[module]/[feature]/contract.md`
- Create `docs/api/[module]/[feature]/snapshots/v2/`

**Actions:**

1. Review new contract.md
2. Capture new snapshots
3. Test API responses

### Step 4: Update Code

**Files to modify:**

| File                             | Changes Required                   |
| -------------------------------- | ---------------------------------- |
| `src/api/[module].api.ts`        | Update request/response interfaces |
| `src/hooks/queries/use[Hook].ts` | Update query logic                 |
| `src/components/[Component].tsx` | Update props/state                 |
| `src/types/[module].ts`          | Update TypeScript interfaces       |

**Code Changes:**

```diff
// src/api/auth.api.ts
export interface LoginRequest {
-  email: string;
+  identifier: string; // Can be email or phone
  password: string;
}
```

### Step 5: Update Tests

**Files to modify:**

| Test File                                  | Changes Required       |
| ------------------------------------------ | ---------------------- |
| `src/api/__tests__/[module].api.test.ts`   | Update test data       |
| `src/hooks/__tests__/use[Hook].test.ts`    | Update expectations    |
| `src/components/__tests__/[Comp].test.tsx` | Update rendered output |

### Step 6: Update Environment Variables

**Add to `.env.local`:**

```bash
# v2.0 new environment variables
NEW_VAR_1=value1
NEW_VAR_2=value2
```

**Remove (if deprecated):**

```bash
# OLD_VAR_1 (no longer needed in v2.0)
```

### Step 7: Run Tests

```bash
npm run test
npm run test:e2e
```

### Step 8: Manual Testing Checklist

- [ ] Login with email works
- [ ] Login with phone works (new in v2.0)
- [ ] Error messages display correctly
- [ ] Token refresh works
- [ ] Logout works
- [ ] Mobile responsive
- [ ] Tablet responsive

---

## 🆘 Troubleshooting

### Issue 1: [Common Error]

**Error Message:**

```
Error: ...
```

**Solution:**
Step-by-step solution

---

### Issue 2: [Another Common Issue]

...

---

## 🔙 Rollback Plan

If you need to rollback to v1.0:

### Quick Rollback

```bash
git checkout backup/v1.0-[feature-name]
npm install
```

### Partial Rollback

If only certain components need rollback:

1. Restore v1 files from backup branch
2. Keep v2 improvements where possible
3. Create hybrid version v1.5

---

## 📊 Migration Checklist

| Task                    | Status | Notes |
| ----------------------- | ------ | ----- |
| ✅ Backup current code  | ⬜     |       |
| ✅ Update dependencies  | ⬜     |       |
| ✅ Update API contracts | ⬜     |       |
| ✅ Update code files    | ⬜     |       |
| ✅ Update tests         | ⬜     |       |
| ✅ Update env variables | ⬜     |       |
| ✅ Run automated tests  | ⬜     |       |
| ✅ Manual testing       | ⬜     |       |
| ✅ Deploy to staging    | ⬜     |       |
| ✅ QA approval          | ⬜     |       |
| ✅ Deploy to production | ⬜     |       |

---

## 📞 Support

**Questions?** Contact:

- Technical Lead: [Name]
- Documentation: See [v2/requirements.md](./requirements.md)
- Issues: Create GitHub issue with label `migration-v2`

---

## 🎉 Benefits of v2.0

After migration, you'll have:

- ✅ Benefit 1
- ✅ Benefit 2
- ✅ Benefit 3
- ✅ Better performance
- ✅ Improved UX

---

**Last Updated:** YYYY-MM-DD  
**Migration Status:** ⏳ PENDING / 🔄 IN PROGRESS / ✅ COMPLETED
