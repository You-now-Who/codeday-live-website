# Task 04 — API: /api/schedule

## Goal
Implement the full CRUD API for schedule items: `GET` and `POST` on `/api/schedule`, plus `PATCH` and `DELETE` on `/api/schedule/[id]`.

## Prerequisites
- Task 03 complete (`prisma`, `checkAdminKey` are importable)
- Database has the `ScheduleItem` table

---

## Files to Create

### `src/app/api/schedule/route.ts`

**GET /api/schedule** — public, no auth. Returns all items ordered by `startsAt` ascending.

**POST /api/schedule** — requires `x-admin-key`. Validates `title` (required, ≤200 chars), `startsAt` (required, valid ISO date), `endsAt` (optional, must be after `startsAt`). Returns 201 with the created item.

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const items = await prisma.scheduleItem.findMany({
      orderBy: { startsAt: 'asc' },
    })
    return Response.json({ items })
  } catch {
    return Response.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, location, startsAt, endsAt } = body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return Response.json({ error: 'title is required', field: 'title' }, { status: 400 })
  }
  if (title.trim().length > 200) {
    return Response.json({ error: 'title must be 200 characters or fewer', field: 'title' }, { status: 400 })
  }
  if (!startsAt || isNaN(new Date(startsAt).getTime())) {
    return Response.json({ error: 'startsAt must be a valid ISO date', field: 'startsAt' }, { status: 400 })
  }
  if (endsAt !== undefined && endsAt !== null) {
    if (isNaN(new Date(endsAt).getTime())) {
      return Response.json({ error: 'endsAt must be a valid ISO date', field: 'endsAt' }, { status: 400 })
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      return Response.json({ error: 'endsAt must be after startsAt', field: 'endsAt' }, { status: 400 })
    }
  }

  try {
    const item = await prisma.scheduleItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? null,
        location: location?.trim() ?? null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    })
    return Response.json(item, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create schedule item' }, { status: 500 })
  }
}
```

### `src/app/api/schedule/[id]/route.ts`

**PATCH /api/schedule/[id]** — requires `x-admin-key`. Partial update. Only updates fields that are present in the body. Returns 404 if not found.

**DELETE /api/schedule/[id]** — requires `x-admin-key`. Returns 200 `{ success: true }` on success, 404 if not found.

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, location, startsAt, endsAt } = body
  const data: Record<string, unknown> = {}

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return Response.json({ error: 'title must be a non-empty string', field: 'title' }, { status: 400 })
    }
    if (title.trim().length > 200) {
      return Response.json({ error: 'title must be 200 characters or fewer', field: 'title' }, { status: 400 })
    }
    data.title = title.trim()
  }
  if (description !== undefined) data.description = description?.trim() ?? null
  if (location !== undefined) data.location = location?.trim() ?? null
  if (startsAt !== undefined) {
    if (isNaN(new Date(startsAt).getTime())) {
      return Response.json({ error: 'startsAt must be a valid ISO date', field: 'startsAt' }, { status: 400 })
    }
    data.startsAt = new Date(startsAt)
  }
  if (endsAt !== undefined) {
    if (endsAt !== null) {
      if (isNaN(new Date(endsAt).getTime())) {
        return Response.json({ error: 'endsAt must be a valid ISO date', field: 'endsAt' }, { status: 400 })
      }
      const effectiveStartsAt = startsAt ? new Date(startsAt) : (await prisma.scheduleItem.findUnique({ where: { id: params.id } }))?.startsAt
      if (effectiveStartsAt && new Date(endsAt) <= effectiveStartsAt) {
        return Response.json({ error: 'endsAt must be after startsAt', field: 'endsAt' }, { status: 400 })
      }
      data.endsAt = new Date(endsAt)
    } else {
      data.endsAt = null
    }
  }

  try {
    const item = await prisma.scheduleItem.update({
      where: { id: params.id },
      data,
    })
    return Response.json(item)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update schedule item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.scheduleItem.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete schedule item' }, { status: 500 })
  }
}
```

---

## Acceptance Criteria

- [ ] `GET /api/schedule` returns `{ items: [] }` when the table is empty (HTTP 200)
- [ ] `POST /api/schedule` without auth key returns HTTP 401
- [ ] `POST /api/schedule` with valid body + auth key returns HTTP 201 with the created item
- [ ] `POST /api/schedule` with missing `title` returns HTTP 400 with `{ error: "title is required", field: "title" }`
- [ ] `POST /api/schedule` with `endsAt` before `startsAt` returns HTTP 400
- [ ] `PATCH /api/schedule/[id]` updates only the supplied fields
- [ ] `PATCH /api/schedule/[id]` with a non-existent ID returns HTTP 404
- [ ] `DELETE /api/schedule/[id]` removes the item and returns `{ success: true }`
- [ ] `DELETE /api/schedule/[id]` with a non-existent ID returns HTTP 404

---

## Tests

Replace `YOUR_ADMIN_SECRET` with the value from your `.env.local`. Run dev server first.

```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# 1. GET — empty table
curl -s "$BASE/api/schedule" | jq .
# Expected: { "items": [] }

# 2. POST — missing auth
curl -s -X POST "$BASE/api/schedule" \
  -H "Content-Type: application/json" \
  -d '{"title":"Opening","startsAt":"2025-06-01T09:00:00Z"}' | jq .
# Expected: { "error": "Unauthorized" } with HTTP 401

# 3. POST — valid item
curl -s -X POST "$BASE/api/schedule" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"Opening Ceremony","description":"Welcome everyone","location":"Main Hall","startsAt":"2025-06-01T09:00:00Z","endsAt":"2025-06-01T09:30:00Z"}' | jq .
# Expected: 201, item with id, title, startsAt, endsAt set
# Save the returned id:
ITEM_ID=$(curl -s -X POST "$BASE/api/schedule" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"Hacking Time","startsAt":"2025-06-01T10:00:00Z"}' | jq -r '.id')

# 4. GET — now returns 2 items
curl -s "$BASE/api/schedule" | jq '.items | length'
# Expected: 2

# 5. GET — items ordered by startsAt ascending
curl -s "$BASE/api/schedule" | jq '[.items[].title]'
# Expected: ["Opening Ceremony", "Hacking Time"]

# 6. POST — missing title
curl -s -X POST "$BASE/api/schedule" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"startsAt":"2025-06-01T12:00:00Z"}' | jq .
# Expected: { "error": "title is required", "field": "title" }

# 7. POST — endsAt before startsAt
curl -s -X POST "$BASE/api/schedule" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"Bad Item","startsAt":"2025-06-01T12:00:00Z","endsAt":"2025-06-01T11:00:00Z"}' | jq .
# Expected: { "error": "endsAt must be after startsAt", "field": "endsAt" }

# 8. PATCH — update title
curl -s -X PATCH "$BASE/api/schedule/$ITEM_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"Hacking Time (Updated)"}' | jq '.title'
# Expected: "Hacking Time (Updated)"

# 9. PATCH — nonexistent id
curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/schedule/nonexistent-id" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"X"}'
# Expected: 404

# 10. DELETE
curl -s -X DELETE "$BASE/api/schedule/$ITEM_ID" \
  -H "x-admin-key: $ADMIN_SECRET" | jq .
# Expected: { "success": true }

# 11. DELETE — nonexistent id
curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/schedule/nonexistent-id" \
  -H "x-admin-key: $ADMIN_SECRET"
# Expected: 404
```
