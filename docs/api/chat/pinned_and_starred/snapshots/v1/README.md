# API Snapshots v1 - Pinned & Starred Messages

## Overview

This folder contains actual JSON responses captured from the API for the Pinned & Starred Messages feature.

## How to Capture Snapshots

### Prerequisites
1. Set up test credentials in `.env.local`:
   ```bash
   TEST_EMAIL=test@example.com
   TEST_PASSWORD=test_password
   TEST_GROUP_ID=test-group-uuid
   TEST_MESSAGE_ID=test-message-uuid
   ```

2. Get access token:
   ```bash
   curl -X POST "${VITE_APP_BASE_URL}/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"'$TEST_EMAIL'","password":"'$TEST_PASSWORD'"}' \
     > auth-response.json
   
   # Extract token manually or use jq:
   TOKEN=$(cat auth-response.json | jq -r '.data.accessToken')
   ```

### Capture Commands

#### 1. Pin Message (Success)
```bash
curl -X POST "${VITE_APP_BASE_URL}/api/messages/${TEST_MESSAGE_ID}/pin" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"'${TEST_GROUP_ID}'"}' \
  > pin-success.json
```

#### 2. Pin Message (Error 401 - Unauthorized)
```bash
curl -X POST "${VITE_APP_BASE_URL}/api/messages/${TEST_MESSAGE_ID}/pin" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"'${TEST_GROUP_ID}'"}' \
  > pin-error-401.json
```

#### 3. Unpin Message (Success)
```bash
curl -X DELETE "${VITE_APP_BASE_URL}/api/messages/${TEST_MESSAGE_ID}/pin" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"'${TEST_GROUP_ID}'"}' \
  > unpin-success.json
```

#### 4. Get Pinned Messages (Success)
```bash
curl -X GET "${VITE_APP_BASE_URL}/api/groups/${TEST_GROUP_ID}/pinned-messages?limit=10" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  > get-pinned-success.json
```

#### 5. Star Message (Success)
```bash
curl -X POST "${VITE_APP_BASE_URL}/api/messages/${TEST_MESSAGE_ID}/star" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  > star-success.json
```

#### 6. Unstar Message (Success)
```bash
curl -X DELETE "${VITE_APP_BASE_URL}/api/messages/${TEST_MESSAGE_ID}/star" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  > unstar-success.json
```

#### 7. Get Starred Messages (Success)
```bash
curl -X GET "${VITE_APP_BASE_URL}/api/users/me/starred-messages?limit=20&offset=0" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  > get-starred-success.json
```

## Snapshot Files

| File                       | Description                          | Status  |
| -------------------------- | ------------------------------------ | ------- |
| pin-success.json           | Pin message success response         | ⬜ TODO |
| pin-error-401.json         | Pin message unauthorized error       | ⬜ TODO |
| pin-error-403.json         | Pin message forbidden error          | ⬜ TODO |
| pin-error-409.json         | Pin message max limit reached        | ⬜ TODO |
| unpin-success.json         | Unpin message success response       | ⬜ TODO |
| get-pinned-success.json    | Get pinned messages success          | ⬜ TODO |
| get-pinned-empty.json      | Get pinned messages (no results)     | ⬜ TODO |
| star-success.json          | Star message success response        | ⬜ TODO |
| star-error-401.json        | Star message unauthorized error      | ⬜ TODO |
| unstar-success.json        | Unstar message success response      | ⬜ TODO |
| get-starred-success.json   | Get starred messages success         | ⬜ TODO |
| get-starred-empty.json     | Get starred messages (no results)    | ⬜ TODO |

## Notes

- Always capture actual API responses, not mock data
- Include both success and error cases
- Keep the original format from the API (don't prettify unless needed)
- Update status to ✅ DONE when snapshot is captured
