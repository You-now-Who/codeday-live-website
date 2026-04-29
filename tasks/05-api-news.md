# Task 05 — API: /api/news

## Goal
Implement the full CRUD API for news posts: `GET` and `POST` on `/api/news`, plus `PATCH` and `DELETE` on `/api/news/[id]`.

## Prerequisites
- Task 03 complete (`prisma`, `checkAdminKey` importable)
- Database has the `NewsPost` table and `NewsPostType` enum

---

## Files to Create

### `src/app/api/news/route.ts`

**GET /api/news** — public. Returns all posts ordered by `pinned DESC, createdAt DESC`.

**POST /api/news** — requires `x-admin-key`. Validates `headline` (required, ≤300 chars), `body` (required, ≥1 char), `imageUrl` (optional, must match `^https?://`), `type` (optional enum: `NEWS` | `ANNOUNCEMENT`, default `NEWS`), `pinned` (optional boolean, default `false`).

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return Response.json({ posts })
  } catch {
    return Response.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { headline, body: postBody, imageUrl, type, pinned } = body

  if (!headline || typeof headline !== 'string' || headline.trim() === '') {
    return Response.json({ error: 'headline is required', field: 'headline' }, { status: 400 })
  }
  if (headline.trim().length > 300) {
    return Response.json({ error: 'headline must be 300 characters or fewer', field: 'headline' }, { status: 400 })
  }
  if (!postBody || typeof postBody !== 'string' || postBody.trim() === '') {
    return Response.json({ error: 'body is required', field: 'body' }, { status: 400 })
  }
  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl)) {
      return Response.json({ error: 'imageUrl must be a valid http(s) URL', field: 'imageUrl' }, { status: 400 })
    }
  }
  if (type !== undefined && !['NEWS', 'ANNOUNCEMENT'].includes(type)) {
    return Response.json({ error: 'type must be NEWS or ANNOUNCEMENT', field: 'type' }, { status: 400 })
  }

  try {
    const post = await prisma.newsPost.create({
      data: {
        headline: headline.trim(),
        body: postBody.trim(),
        imageUrl: imageUrl ?? null,
        type: type ?? 'NEWS',
        pinned: pinned ?? false,
      },
    })
    return Response.json(post, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create news post' }, { status: 500 })
  }
}
```

### `src/app/api/news/[id]/route.ts`

**PATCH /api/news/[id]** — requires `x-admin-key`. Partial update. Returns 404 if not found.

**DELETE /api/news/[id]** — requires `x-admin-key`. Returns `{ success: true }`.

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
  const { headline, body: postBody, imageUrl, type, pinned } = body
  const data: Record<string, unknown> = {}

  if (headline !== undefined) {
    if (typeof headline !== 'string' || headline.trim() === '') {
      return Response.json({ error: 'headline must be a non-empty string', field: 'headline' }, { status: 400 })
    }
    if (headline.trim().length > 300) {
      return Response.json({ error: 'headline must be 300 characters or fewer', field: 'headline' }, { status: 400 })
    }
    data.headline = headline.trim()
  }
  if (postBody !== undefined) {
    if (typeof postBody !== 'string' || postBody.trim() === '') {
      return Response.json({ error: 'body must be a non-empty string', field: 'body' }, { status: 400 })
    }
    data.body = postBody.trim()
  }
  if (imageUrl !== undefined) {
    if (imageUrl !== null && (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl))) {
      return Response.json({ error: 'imageUrl must be a valid http(s) URL', field: 'imageUrl' }, { status: 400 })
    }
    data.imageUrl = imageUrl
  }
  if (type !== undefined) {
    if (!['NEWS', 'ANNOUNCEMENT'].includes(type)) {
      return Response.json({ error: 'type must be NEWS or ANNOUNCEMENT', field: 'type' }, { status: 400 })
    }
    data.type = type
  }
  if (pinned !== undefined) data.pinned = Boolean(pinned)

  try {
    const post = await prisma.newsPost.update({ where: { id: params.id }, data })
    return Response.json(post)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update news post' }, { status: 500 })
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
    await prisma.newsPost.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete news post' }, { status: 500 })
  }
}
```

---

## Acceptance Criteria

- [ ] `GET /api/news` returns `{ posts: [] }` on empty table (HTTP 200)
- [ ] `POST /api/news` without auth returns HTTP 401
- [ ] `POST /api/news` with valid body returns HTTP 201 with the created post
- [ ] `POST /api/news` with missing `headline` returns HTTP 400 with `field: "headline"`
- [ ] `POST /api/news` with missing `body` returns HTTP 400 with `field: "body"`
- [ ] `POST /api/news` with `imageUrl` not starting with `http(s)://` returns HTTP 400
- [ ] `POST /api/news` with invalid `type` returns HTTP 400
- [ ] `GET /api/news` returns pinned posts before unpinned posts
- [ ] `PATCH /api/news/[id]` can toggle `pinned` independently
- [ ] `PATCH /api/news/[id]` with nonexistent ID returns HTTP 404
- [ ] `DELETE /api/news/[id]` returns `{ success: true }` and removes the post

---

## Tests

```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# 1. GET empty
curl -s "$BASE/api/news" | jq '.posts | length'
# Expected: 0

# 2. POST without auth
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -d '{"headline":"Test","body":"Test body"}'
# Expected: 401

# 3. POST valid NEWS post
POST1=$(curl -s -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"headline":"Workshop at 2pm","body":"Come join us in Room 3","type":"NEWS"}')
echo $POST1 | jq .
# Expected: 201, type="NEWS", pinned=false

# 4. POST valid ANNOUNCEMENT (pinned)
POST2=$(curl -s -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"headline":"WiFi is down","body":"Engineers are on it","type":"ANNOUNCEMENT","pinned":true}')
echo $POST2 | jq .
# Expected: 201, type="ANNOUNCEMENT", pinned=true

ID1=$(echo $POST1 | jq -r '.id')
ID2=$(echo $POST2 | jq -r '.id')

# 5. GET — pinned post comes first
curl -s "$BASE/api/news" | jq '[.posts[].pinned]'
# Expected: [true, false]

# 6. POST missing headline
curl -s -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"body":"Missing headline"}' | jq .
# Expected: { "error": "headline is required", "field": "headline" }

# 7. POST missing body
curl -s -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"headline":"No body post"}' | jq .
# Expected: { "error": "body is required", "field": "body" }

# 8. POST bad imageUrl
curl -s -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"headline":"H","body":"B","imageUrl":"not-a-url"}' | jq .
# Expected: { "error": "imageUrl must be a valid http(s) URL", "field": "imageUrl" }

# 9. POST valid imageUrl
curl -s -X POST "$BASE/api/news" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"headline":"With image","body":"Has image","imageUrl":"https://example.com/img.jpg"}' | jq '.imageUrl'
# Expected: "https://example.com/img.jpg"

# 10. PATCH — toggle pinned on post 1
curl -s -X PATCH "$BASE/api/news/$ID1" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"pinned":true}' | jq '.pinned'
# Expected: true

# 11. PATCH nonexistent
curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/news/bad-id" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"headline":"X"}'
# Expected: 404

# 12. DELETE
curl -s -X DELETE "$BASE/api/news/$ID2" \
  -H "x-admin-key: $ADMIN_SECRET" | jq .
# Expected: { "success": true }

curl -s "$BASE/api/news" | jq '.posts | length'
# Expected: decreased by 1
```
