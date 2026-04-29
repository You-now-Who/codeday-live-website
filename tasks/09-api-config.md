# Task 09 — API: /api/config

## Goal
Implement the event config API: `GET` (public) and `PATCH` (admin-only) on `/api/config`. This is a singleton model — always `id = "1"`. `PATCH` uses `upsert` so it's safe even if the seed hasn't run.

## Prerequisites
- Task 03 complete
- Database has the `EventConfig` table seeded (Task 02)

---

## Files to Create

### `src/app/api/config/route.ts`

**GET /api/config** — public. Returns the singleton config. Returns 404 with a helpful message if the seed hasn't run yet.

**PATCH /api/config** — requires `x-admin-key`. Partial update — only updates fields present in the body. Uses `upsert` on `id = "1"`. Validates:
- `eventName`: optional string, ≤200 chars, non-empty if provided
- `submissionDeadline`: optional, must be valid ISO date
- `wifiSsid`, `wifiPassword`, `discordUrl`: optional strings (can be set to null)
- `importantLinks`: optional array, each element must have `{ label: string, url: string }`, max 10 items, each `url` must match `^https?://`

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const config = await prisma.eventConfig.findUnique({ where: { id: '1' } })
    if (!config) {
      return Response.json(
        { error: 'Event config not found — run the seed script' },
        { status: 404 }
      )
    }
    return Response.json({ config })
  } catch {
    return Response.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

type ImportantLink = { label: string; url: string }

function validateImportantLinks(links: unknown): string | null {
  if (!Array.isArray(links)) return 'importantLinks must be an array'
  if (links.length > 10) return 'Maximum 10 important links allowed'
  for (const link of links) {
    if (
      typeof link !== 'object' ||
      link === null ||
      typeof (link as ImportantLink).label !== 'string' ||
      (link as ImportantLink).label.trim() === '' ||
      typeof (link as ImportantLink).url !== 'string' ||
      !/^https?:\/\//.test((link as ImportantLink).url)
    ) {
      return 'Each importantLink must have a non-empty label and a valid url'
    }
  }
  return null
}

export async function PATCH(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { eventName, submissionDeadline, wifiSsid, wifiPassword, discordUrl, importantLinks } = body
  const data: Record<string, unknown> = {}

  if (eventName !== undefined) {
    if (typeof eventName !== 'string' || eventName.trim() === '') {
      return Response.json({ error: 'eventName must be a non-empty string', field: 'eventName' }, { status: 400 })
    }
    if (eventName.trim().length > 200) {
      return Response.json({ error: 'eventName must be 200 characters or fewer', field: 'eventName' }, { status: 400 })
    }
    data.eventName = eventName.trim()
  }
  if (submissionDeadline !== undefined) {
    if (isNaN(new Date(submissionDeadline).getTime())) {
      return Response.json({ error: 'submissionDeadline must be a valid ISO date', field: 'submissionDeadline' }, { status: 400 })
    }
    data.submissionDeadline = new Date(submissionDeadline)
  }
  if (wifiSsid !== undefined) data.wifiSsid = wifiSsid?.trim() ?? null
  if (wifiPassword !== undefined) data.wifiPassword = wifiPassword?.trim() ?? null
  if (discordUrl !== undefined) data.discordUrl = discordUrl?.trim() ?? null
  if (importantLinks !== undefined) {
    const error = validateImportantLinks(importantLinks)
    if (error) {
      return Response.json({ error, field: 'importantLinks' }, { status: 400 })
    }
    data.importantLinks = importantLinks
  }

  try {
    const config = await prisma.eventConfig.upsert({
      where: { id: '1' },
      update: data,
      create: {
        id: '1',
        eventName: (data.eventName as string) ?? 'CodeDay London',
        submissionDeadline: (data.submissionDeadline as Date) ?? new Date(),
        ...data,
      },
    })
    return Response.json({ config })
  } catch {
    return Response.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
```

---

## Acceptance Criteria

- [ ] `GET /api/config` returns the singleton EventConfig with all fields (HTTP 200)
- [ ] `GET /api/config` returns HTTP 404 if no seed row exists
- [ ] `PATCH /api/config` without auth returns HTTP 401
- [ ] `PATCH /api/config` can update `eventName` independently
- [ ] `PATCH /api/config` can update `submissionDeadline` with a valid ISO date
- [ ] `PATCH /api/config` with an invalid `submissionDeadline` returns HTTP 400
- [ ] `PATCH /api/config` with `importantLinks` not being an array returns HTTP 400
- [ ] `PATCH /api/config` with more than 10 `importantLinks` returns HTTP 400
- [ ] `PATCH /api/config` with an `importantLinks` entry missing `label` returns HTTP 400
- [ ] `PATCH /api/config` with an `importantLinks` entry with invalid URL returns HTTP 400
- [ ] `PATCH /api/config` with valid `importantLinks` updates the config
- [ ] `PATCH /api/config` can set `wifiSsid` and `wifiPassword`
- [ ] `PATCH /api/config` can set fields to `null` (e.g. `"wifiSsid": null`)

---

## Tests

```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# 1. GET config (seed must have run)
curl -s "$BASE/api/config" | jq '.config | {id, eventName}'
# Expected: { "id": "1", "eventName": "CodeDay London" }

# 2. PATCH — update eventName
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"eventName":"CodeDay London 2025"}' | jq '.config.eventName'
# Expected: "CodeDay London 2025"

# Verify persisted
curl -s "$BASE/api/config" | jq '.config.eventName'
# Expected: "CodeDay London 2025"

# 3. PATCH — update submissionDeadline
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"submissionDeadline":"2025-06-01T16:00:00Z"}' | jq '.config.submissionDeadline'
# Expected: "2025-06-01T16:00:00.000Z"

# 4. PATCH — bad submissionDeadline
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"submissionDeadline":"not-a-date"}' | jq .
# Expected: { "error": "submissionDeadline must be a valid ISO date", "field": "submissionDeadline" }

# 5. PATCH — set WiFi credentials
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"wifiSsid":"CodeDayLDN","wifiPassword":"hackathon2025"}' | jq '.config | {wifiSsid, wifiPassword}'
# Expected: { "wifiSsid": "CodeDayLDN", "wifiPassword": "hackathon2025" }

# 6. PATCH — valid importantLinks
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"importantLinks":[{"label":"Schedule","url":"https://codeday.org"},{"label":"Discord","url":"https://discord.gg/abc"}]}' \
  | jq '.config.importantLinks | length'
# Expected: 2

# 7. PATCH — importantLinks not an array
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"importantLinks":"not-array"}' | jq .
# Expected: { "error": "importantLinks must be an array", "field": "importantLinks" }

# 8. PATCH — more than 10 links
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"importantLinks":[{"label":"A","url":"https://a.com"},{"label":"B","url":"https://b.com"},{"label":"C","url":"https://c.com"},{"label":"D","url":"https://d.com"},{"label":"E","url":"https://e.com"},{"label":"F","url":"https://f.com"},{"label":"G","url":"https://g.com"},{"label":"H","url":"https://h.com"},{"label":"I","url":"https://i.com"},{"label":"J","url":"https://j.com"},{"label":"K","url":"https://k.com"}]}' \
  | jq '.error'
# Expected: "Maximum 10 important links allowed"

# 9. PATCH — link with bad URL
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"importantLinks":[{"label":"Bad","url":"not-a-url"}]}' | jq .
# Expected: { "error": "Each importantLink must have a non-empty label and a valid url", "field": "importantLinks" }

# 10. PATCH — set wifiSsid to null
curl -s -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"wifiSsid":null}' | jq '.config.wifiSsid'
# Expected: null

# 11. PATCH without auth
curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/config" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"Hacked"}'
# Expected: 401
```
