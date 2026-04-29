# Task 07 — API: /api/projects

## Goal
Implement the full CRUD API for projects: `GET` and `POST` on `/api/projects`, plus `PATCH` and `DELETE` on `/api/projects/[id]`. Handle the unique `teamName` constraint with a 409 Conflict response.

## Prerequisites
- Task 03 complete
- Database has the `Project` table with `@@unique([teamName])`

---

## Files to Create

### `src/app/api/projects/route.ts`

**GET /api/projects** — public. Returns all projects ordered by `createdAt ASC`.

**POST /api/projects** — requires `x-admin-key`. Validates `teamName` (required, ≤200 chars, unique), `projectName` (required, ≤200 chars), `iframeUrl` (required, must match `^https://` — HTTPS only, no plain HTTP), `description` (optional). Returns 409 if `teamName` already exists.

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return Response.json({ projects })
  } catch {
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { teamName, projectName, description, iframeUrl } = body

  if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'teamName is required', field: 'teamName' }, { status: 400 })
  }
  if (teamName.trim().length > 200) {
    return Response.json({ error: 'teamName must be 200 characters or fewer', field: 'teamName' }, { status: 400 })
  }
  if (!projectName || typeof projectName !== 'string' || projectName.trim() === '') {
    return Response.json({ error: 'projectName is required', field: 'projectName' }, { status: 400 })
  }
  if (projectName.trim().length > 200) {
    return Response.json({ error: 'projectName must be 200 characters or fewer', field: 'projectName' }, { status: 400 })
  }
  if (!iframeUrl || typeof iframeUrl !== 'string' || !/^https:\/\//.test(iframeUrl)) {
    return Response.json({ error: 'iframeUrl must use HTTPS', field: 'iframeUrl' }, { status: 400 })
  }

  try {
    const project = await prisma.project.create({
      data: {
        teamName: teamName.trim(),
        projectName: projectName.trim(),
        description: description?.trim() ?? null,
        iframeUrl,
      },
    })
    return Response.json(project, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return Response.json(
        { error: 'A project for this team already exists', field: 'teamName' },
        { status: 409 }
      )
    }
    return Response.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
```

### `src/app/api/projects/[id]/route.ts`

**PATCH /api/projects/[id]** — requires `x-admin-key`. Partial update. Returns 404 if not found, 409 if updated teamName conflicts.

**DELETE /api/projects/[id]** — requires `x-admin-key`.

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
  const { teamName, projectName, description, iframeUrl } = body
  const data: Record<string, unknown> = {}

  if (teamName !== undefined) {
    if (typeof teamName !== 'string' || teamName.trim() === '') {
      return Response.json({ error: 'teamName must be a non-empty string', field: 'teamName' }, { status: 400 })
    }
    data.teamName = teamName.trim()
  }
  if (projectName !== undefined) {
    if (typeof projectName !== 'string' || projectName.trim() === '') {
      return Response.json({ error: 'projectName must be a non-empty string', field: 'projectName' }, { status: 400 })
    }
    data.projectName = projectName.trim()
  }
  if (description !== undefined) data.description = description?.trim() ?? null
  if (iframeUrl !== undefined) {
    if (typeof iframeUrl !== 'string' || !/^https:\/\//.test(iframeUrl)) {
      return Response.json({ error: 'iframeUrl must use HTTPS', field: 'iframeUrl' }, { status: 400 })
    }
    data.iframeUrl = iframeUrl
  }

  try {
    const project = await prisma.project.update({ where: { id: params.id }, data })
    return Response.json(project)
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'P2025') return Response.json({ error: 'Not found' }, { status: 404 })
    if (err.code === 'P2002') {
      return Response.json(
        { error: 'A project for this team already exists', field: 'teamName' },
        { status: 409 }
      )
    }
    return Response.json({ error: 'Failed to update project' }, { status: 500 })
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
    await prisma.project.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
```

---

## Acceptance Criteria

- [ ] `GET /api/projects` returns `{ projects: [] }` on empty table
- [ ] `POST /api/projects` without auth returns HTTP 401
- [ ] `POST /api/projects` with valid body returns HTTP 201
- [ ] `POST /api/projects` with missing `teamName` returns HTTP 400
- [ ] `POST /api/projects` with missing `projectName` returns HTTP 400
- [ ] `POST /api/projects` with `iframeUrl` using plain HTTP (not HTTPS) returns HTTP 400
- [ ] `POST /api/projects` with duplicate `teamName` returns HTTP 409
- [ ] `PATCH /api/projects/[id]` with nonexistent ID returns HTTP 404
- [ ] `DELETE /api/projects/[id]` removes the project

---

## Tests

```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# 1. GET empty
curl -s "$BASE/api/projects" | jq '.projects | length'
# Expected: 0

# 2. POST — valid project
P1=$(curl -s -X POST "$BASE/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"teamName":"Team Alpha","projectName":"Awesome App","description":"An app","iframeUrl":"https://team-alpha.vercel.app"}')
echo $P1 | jq .
P1_ID=$(echo $P1 | jq -r '.id')
# Expected: 201, id set

# 3. POST — duplicate teamName
curl -s -X POST "$BASE/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"teamName":"Team Alpha","projectName":"Different App","iframeUrl":"https://other.vercel.app"}' | jq .
# Expected: 409 { "error": "A project for this team already exists", "field": "teamName" }

# 4. POST — plain HTTP iframe (not HTTPS)
curl -s -X POST "$BASE/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"teamName":"Team Beta","projectName":"Bad App","iframeUrl":"http://not-secure.com"}' | jq .
# Expected: 400 { "error": "iframeUrl must use HTTPS", "field": "iframeUrl" }

# 5. POST — missing teamName
curl -s -X POST "$BASE/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"projectName":"App","iframeUrl":"https://example.com"}' | jq .
# Expected: { "error": "teamName is required", "field": "teamName" }

# 6. POST — missing projectName
curl -s -X POST "$BASE/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"teamName":"Team Gamma","iframeUrl":"https://example.com"}' | jq .
# Expected: { "error": "projectName is required", "field": "projectName" }

# 7. PATCH — update description
curl -s -X PATCH "$BASE/api/projects/$P1_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"description":"Updated description"}' | jq '.description'
# Expected: "Updated description"

# 8. PATCH — nonexistent
curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/projects/bad-id" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"projectName":"X"}'
# Expected: 404

# 9. DELETE
curl -s -X DELETE "$BASE/api/projects/$P1_ID" \
  -H "x-admin-key: $ADMIN_SECRET" | jq .
# Expected: { "success": true }

# 10. GET after delete — no items
curl -s "$BASE/api/projects" | jq '.projects | length'
# Expected: 0
```
