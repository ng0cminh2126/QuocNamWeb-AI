# [BƯỚC 4.5/6] Testing Requirements - Pinned & Starred Message

## Test Coverage Matrix
| Implementation File                | Test File                        | # Test Cases | Test Type        |
| ---------------------------------- | -------------------------------- | ------------ | --------------- |
| src/api/pinned_and_starred.api.ts  | src/api/__tests__/pinned_and_starred.api.test.ts | 4            | unit/integration |
| src/hooks/queries/usePinnedMessages.ts | src/hooks/queries/__tests__/usePinnedMessages.test.ts | 5 | unit/integration |
| src/hooks/queries/useStarredMessages.ts | src/hooks/queries/__tests__/useStarredMessages.test.ts | 5 | unit/integration |
| src/features/portal/components/PinnedMessages.tsx | src/features/portal/components/__tests__/PinnedMessages.test.tsx | 4 | unit/E2E |
| src/features/portal/components/StarredMessages.tsx | src/features/portal/components/__tests__/StarredMessages.test.tsx | 4 | unit/E2E |

## Detailed Test Cases
- Pin/unpin message (success, error, edge)
- Star/unstar message (success, error, edge)
- UI indicator rendering
- Permission checks

## Test Data & Mocks
- Mock chat messages
- Mock user permissions

## Test Generation Checklist
- [ ] All implementation files mapped
- [ ] Minimum cases per file
- [ ] Data-testid added for E2E

---

## HUMAN Confirmation
| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Test Requirements | ⬜ rồi      |
| **APPROVED để thực thi**    | ⬜  rồi     |

**HUMAN Signature:** [KK__Zekken__KK]  
**Date:** [01082026]