# Task 06 — API: /api/resources

## Goal
Implement the full CRUD API for resource links: `GET` and `POST` on `/api/resources`, plus `PATCH` and `DELETE` on `/api/resources/[id]`.

## Prerequisites
- Task 03 complete
- Database has the `ResourceLink` table

---

## Files to Create

### `src/app/api/resources/route.ts`

**GET /api/resources** — public. Returns all resources ordered by `category ASC, createdAt ASC`.

**POST /api/resources** — requires `x-admin-key`. Validates `title` (required, ≤200 chars), `url` (required, must match `^https?://`, ≤2048 chars), `category` (required, ≤50 chars), `description` (optional).

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const resources = await prisma.resourceLink.findMany({
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    })
    return Response.json({ resources })
  } catch {
    return Response.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, url, description, category } = body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return Response.json({ error: 'title is required', field: 'title' }, { status: 400 })
  }
  if (title.trim().length > 200) {
    return Response.json({ error: 'title must be 200 characters or fewer', field: 'title' }, { status: 400 })
  }
  if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
    return Response.json({ error: 'url must be a valid http(s) URL', field: 'url' }, { status: 400 })
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return Response.json({ error: 'category is required', field: 'category' }, { status: 400 })
  }
  if (category.trim().length > 50) {
    return Response.json({ error: 'category must be 50 characters or fewer', field: 'category' }, { status: 400 })
  }

  try {
    const resource = await prisma.resourceLink.create({
      data: {
        title: title.trim(),
        url,
        description: description?.trim() ?? null,
        category: category.trim().toUpperCase(),
      },
    })
    return Response.json(resource, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create resource' }, { status: 500 })
  }
}
```

### `src/app/api/resources/[id]/route.ts`

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
  const { title, url, description, category } = body
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
  if (url !== undefined) {
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      return Response.json({ error: 'url must be a valid http(s) URL', field: 'url' }, { status: 400 })
    }
    data.url = url
  }
  if (description !== undefined) data.description = description?.trim() ?? null
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      return Response.json({ error: 'category must be a non-empty string', field: 'category' }, { status: 400 })
    }
    if (category.trim().length > 50) {
      return Response.json({ error: 'category must be 50 characters or fewer', field: 'category' }, { status: 400 })
    }
    data.category = category.trim().toUpperCase()
  }

  try {
    const resource = await prisma.resourceLink.update({ where: { id: params.id }, data })
    return Response.json(resource)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update resource' }, { status: 500 })
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
    await prisma.resourceLink.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete resource' }, { status: 500 })
  }
}
```

---

## Acceptance Criteria

- [ ] `GET /api/resources` returns `{ resources: [] }` on empty table
- [ ] `POST /api/resources` without auth returns HTTP 401
- [ ] `POST /api/resources` with valid body returns HTTP 201 with the resource
- [ ] `POST /api/resources` with missing `title` returns HTTP 400
- [ ] `POST /api/resources` with missing `category` returns HTTP 400
- [ ] `POST /api/resources` with a non-http(s) URL returns HTTP 400
- [ ] `GET /api/resources` returns resources sorted by `category` then `createdAt` ascending
- [ ] `PATCH /api/resources/[id]` updates only the supplied fields
- [ ] `PATCH /api/resources/[id]` with nonexistent ID returns HTTP 404
- [ ] `DELETE /api/resources/[id]` removes the resource

---

## Tests

```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# 1. GET empty
curl -s "$BASE/api/resources" | jq '.resources | length'
# Expected: 0

# 2. POST — valid TOOLS resource
R1=$(curl -s -X POST "$BASE/api/resources" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"Figma","url":"https://figma.com","description":"Design tool","category":"TOOLS"}')
echo $R1 | jq .
R1_ID=$(echo $R1 | jq -r '.id')

# 3. POST — valid DOCS resource
R2=$(curl -s -X POST "$BASE/api/resources" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"MDN Docs","url":"https://developer.mozilla.org","category":"DOCS"}')
R2_ID=$(echo $R2 | jq -r '.id')

# 4. GET — ordered by category (DOCS before TOOLS alphabetically)
curl -s "$BASE/api/resources" | jq '[.resources[].category]'
# Expected: ["DOCS", "TOOLS"]

# 5. POST — missing title
curl -s -X POST "$BASE/api/resources" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"url":"https://example.com","category":"TOOLS"}' | jq .
# Expected: { "error": "title is required", "field": "title" }

# 6. POST — bad URL
curl -s -X POST "$BASE/api/resources" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"Bad","url":"not-a-url","category":"TOOLS"}' | jq .
# Expected: { "error": "url must be a valid http(s) URL", "field": "url" }

# 7. POST — missing category
curl -s -X POST "$BASE/api/resources" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"No cat","url":"https://example.com"}' | jq .
# Expected: { "error": "category is required", "field": "category" }

# 8. PATCH
curl -s -X PATCH "$BASE/api/resources/$R1_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"description":"Updated description"}' | jq '.description'
# Expected: "Updated description"

# 9. PATCH nonexistent
curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/resources/bad-id" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"title":"X"}'
# Expected: 404

# 10. DELETE
curl -s -X DELETE "$BASE/api/resources/$R2_ID" \
  -H "x-admin-key: $ADMIN_SECRET" | jq .
# Expected: { "success": true }
```
