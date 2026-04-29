# Task 08 — API: /api/help-requests

## Goal
Implement the help-request API: `GET` (admin-only) and `POST` (public, no auth) on `/api/help-requests`, plus `PATCH` on `/api/help-requests/[id]` (admin-only). Note: there is no DELETE — help requests are a permanent audit trail.

## Prerequisites
- Task 03 complete
- Database has the `HelpRequest` table and `HelpRequestStatus` enum

---

## Files to Create

### `src/app/api/help-requests/route.ts`

**GET /api/help-requests** — requires `x-admin-key`. Returns all requests ordered by status order (PENDING first, then IN_PROGRESS, then RESOLVED), then `createdAt ASC` within each group. Postgres doesn't sort enums alphabetically, so use a CASE-style sort via Prisma's `orderBy` on `status` (Prisma sorts enums alphabetically: IN_PROGRESS, PENDING, RESOLVED — this is wrong order, so use `updatedAt` as a secondary or sort in application code).

**Implementation note**: Sort in application code after fetching to guarantee PENDING → IN_PROGRESS → RESOLVED order.

**POST /api/help-requests** — **no auth** (public). Creates a new help request with `status: PENDING`. Validates `teamName` (required, ≤200 chars).

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

const STATUS_ORDER = { PENDING: 0, IN_PROGRESS: 1, RESOLVED: 2 } as const

export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const requests = await prisma.helpRequest.findMany({
      orderBy: { createdAt: 'asc' },
    })
    const sorted = [...requests].sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    )
    return Response.json({ requests: sorted })
  } catch {
    return Response.json({ error: 'Failed to fetch help requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { teamName } = body

  if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'teamName is required', field: 'teamName' }, { status: 400 })
  }
  if (teamName.trim().length > 200) {
    return Response.json({ error: 'teamName must be 200 characters or fewer', field: 'teamName' }, { status: 400 })
  }

  try {
    const helpRequest = await prisma.helpRequest.create({
      data: {
        teamName: teamName.trim(),
        status: 'PENDING',
      },
    })
    return Response.json(
      {
        id: helpRequest.id,
        teamName: helpRequest.teamName,
        status: helpRequest.status,
        createdAt: helpRequest.createdAt,
      },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: 'Failed to create help request' }, { status: 500 })
  }
}
```

### `src/app/api/help-requests/[id]/route.ts`

**PATCH /api/help-requests/[id]** — requires `x-admin-key`. Updates `status` and/or `claimedBy`. Rules:
- `status` must be one of `PENDING`, `IN_PROGRESS`, `RESOLVED`
- If `status` is `IN_PROGRESS`, `claimedBy` must be provided and non-empty
- Returns 404 if not found

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status, claimedBy } = body
  const data: Record<string, unknown> = {}

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return Response.json({ error: 'Invalid status value', field: 'status' }, { status: 400 })
    }
    if (status === 'IN_PROGRESS') {
      if (!claimedBy || typeof claimedBy !== 'string' || claimedBy.trim() === '') {
        return Response.json(
          { error: 'claimedBy is required when status is IN_PROGRESS', field: 'claimedBy' },
          { status: 400 }
        )
      }
      data.claimedBy = claimedBy.trim()
    }
    data.status = status
  }

  if (claimedBy !== undefined && status !== 'IN_PROGRESS') {
    data.claimedBy = claimedBy?.trim() ?? null
  }

  try {
    const helpRequest = await prisma.helpRequest.update({
      where: { id: params.id },
      data,
    })
    return Response.json(helpRequest)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update help request' }, { status: 500 })
  }
}
```

---

## Acceptance Criteria

- [ ] `GET /api/help-requests` without auth returns HTTP 401
- [ ] `GET /api/help-requests` with valid auth returns `{ requests: [] }` on empty table
- [ ] `POST /api/help-requests` requires NO auth (public) and returns HTTP 201
- [ ] `POST /api/help-requests` with missing `teamName` returns HTTP 400
- [ ] `GET /api/help-requests` returns requests in PENDING → IN_PROGRESS → RESOLVED order
- [ ] `PATCH /api/help-requests/[id]` with `status: "IN_PROGRESS"` and no `claimedBy` returns HTTP 400
- [ ] `PATCH /api/help-requests/[id]` with `status: "IN_PROGRESS"` and `claimedBy` set succeeds
- [ ] `PATCH /api/help-requests/[id]` with `status: "RESOLVED"` succeeds without `claimedBy`
- [ ] `PATCH /api/help-requests/[id]` with invalid status returns HTTP 400
- [ ] `PATCH /api/help-requests/[id]` with nonexistent ID returns HTTP 404

---

## Tests

```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# 1. GET without auth
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/help-requests"
# Expected: 401

# 2. GET with auth — empty
curl -s "$BASE/api/help-requests" \
  -H "x-admin-key: $ADMIN_SECRET" | jq '.requests | length'
# Expected: 0

# 3. POST — no auth needed (public endpoint)
HR1=$(curl -s -X POST "$BASE/api/help-requests" \
  -H "Content-Type: application/json" \
  -d '{"teamName":"Team Alpha"}')
echo $HR1 | jq .
HR1_ID=$(echo $HR1 | jq -r '.id')
# Expected: 201, status="PENDING"

# 4. POST — missing teamName
curl -s -X POST "$BASE/api/help-requests" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
# Expected: { "error": "teamName is required", "field": "teamName" }

# 5. POST two more requests
HR2_ID=$(curl -s -X POST "$BASE/api/help-requests" \
  -H "Content-Type: application/json" \
  -d '{"teamName":"Team Beta"}' | jq -r '.id')
HR3_ID=$(curl -s -X POST "$BASE/api/help-requests" \
  -H "Content-Type: application/json" \
  -d '{"teamName":"Team Gamma"}' | jq -r '.id')

# 6. PATCH — claim HR1 (IN_PROGRESS)
curl -s -X PATCH "$BASE/api/help-requests/$HR1_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"status":"IN_PROGRESS","claimedBy":"Alice"}' | jq '{status, claimedBy}'
# Expected: { "status": "IN_PROGRESS", "claimedBy": "Alice" }

# 7. PATCH — resolve HR1
curl -s -X PATCH "$BASE/api/help-requests/$HR1_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"status":"RESOLVED"}' | jq '.status'
# Expected: "RESOLVED"

# 8. PATCH — IN_PROGRESS without claimedBy (should fail)
curl -s -X PATCH "$BASE/api/help-requests/$HR2_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"status":"IN_PROGRESS"}' | jq .
# Expected: { "error": "claimedBy is required when status is IN_PROGRESS", "field": "claimedBy" }

# 9. PATCH — invalid status
curl -s -X PATCH "$BASE/api/help-requests/$HR2_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"status":"DONE"}' | jq .
# Expected: { "error": "Invalid status value", "field": "status" }

# 10. GET — check ordering: PENDING(HR2,HR3) first, then RESOLVED(HR1)
curl -s "$BASE/api/help-requests" \
  -H "x-admin-key: $ADMIN_SECRET" | jq '[.requests[].status]'
# Expected: ["PENDING", "PENDING", "RESOLVED"]

# 11. PATCH — nonexistent
curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/help-requests/bad-id" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"status":"RESOLVED"}'
# Expected: 404
```
