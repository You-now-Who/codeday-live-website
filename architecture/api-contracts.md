# API Contracts

All route handlers live under `src/app/api/`. They are Next.js 14 App Router Route Handlers (`route.ts`).

---

## Authentication Model

### Public GET routes
No authentication. Anyone can call these.

Routes: `GET /api/schedule`, `GET /api/news`, `GET /api/resources`, `GET /api/projects`, `GET /api/config`

### Protected routes (POST / PATCH / DELETE + GET /api/help-requests)
Require the `x-admin-key` HTTP header with the value matching the `ADMIN_SECRET` environment variable.

**Auth helper** (`src/lib/auth.ts`):
```typescript
export function checkAdminKey(request: Request): boolean {
  const key = request.headers.get('x-admin-key')
  return key !== null && key === process.env.ADMIN_SECRET
}
```

If the check fails, return:
```json
HTTP 401
{ "error": "Unauthorized" }
```

All admin UI client code must attach `x-admin-key: <ADMIN_SECRET>` to every mutating fetch call. The `ADMIN_SECRET` value is passed to the client through a `NEXT_PUBLIC_ADMIN_SECRET` env var (acceptable for a single-event internal tool — see `architecture/security.md` for risk note).

---

## Shared Types

```typescript
// Used across responses
type CuidString = string // e.g. "clxyz..."
type ISODateString = string // e.g. "2025-06-14T09:00:00.000Z"

type ApiError = {
  error: string        // human-readable message
  field?: string       // which field failed validation, if applicable
}
```

---

## /api/schedule

### GET /api/schedule
Returns all schedule items ordered by `startsAt` ascending.

**Auth**: None

**Response 200**
```typescript
{
  items: Array<{
    id: CuidString
    title: string
    description: string | null
    location: string | null
    startsAt: ISODateString
    endsAt: ISODateString | null
    createdAt: ISODateString
  }>
}
```

**Response 500**
```json
{ "error": "Failed to fetch schedule" }
```

---

### POST /api/schedule
Creates a new schedule item.

**Auth**: `x-admin-key`

**Request body**
```typescript
{
  title: string          // required, max 200 chars
  description?: string   // optional
  location?: string      // optional, max 200 chars
  startsAt: ISODateString // required
  endsAt?: ISODateString  // optional; must be after startsAt
}
```

**Response 201** — the created item (same shape as one element from the GET response above)

**Response 400**
```typescript
{ "error": string, "field"?: string }
// Examples:
{ "error": "title is required" }
{ "error": "endsAt must be after startsAt", "field": "endsAt" }
```

**Response 401** `{ "error": "Unauthorized" }`

**Response 500** `{ "error": "Failed to create schedule item" }`

---

### PATCH /api/schedule/[id]
Partial update of a schedule item. All fields are optional; only supplied fields are updated.

**Auth**: `x-admin-key`

**Request body** — any subset of the POST body fields.

**Response 200** — the updated item.

**Response 400** — validation error (same shape as POST 400).

**Response 401** `{ "error": "Unauthorized" }`

**Response 404** `{ "error": "Not found" }`

**Response 500** `{ "error": "Failed to update schedule item" }`

---

### DELETE /api/schedule/[id]

**Auth**: `x-admin-key`

**Response 200** `{ "success": true }`

**Response 401** `{ "error": "Unauthorized" }`

**Response 404** `{ "error": "Not found" }`

**Response 500** `{ "error": "Failed to delete schedule item" }`

---

## /api/news

### GET /api/news
Returns all news posts ordered by `pinned DESC, createdAt DESC`.

**Auth**: None

**Response 200**
```typescript
{
  posts: Array<{
    id: CuidString
    headline: string
    body: string
    imageUrl: string | null
    type: "NEWS" | "ANNOUNCEMENT"
    pinned: boolean
    createdAt: ISODateString
  }>
}
```

**Response 500** `{ "error": "Failed to fetch news" }`

---

### POST /api/news

**Auth**: `x-admin-key`

**Request body**
```typescript
{
  headline: string                    // required, max 300 chars
  body: string                        // required, min 1 char
  imageUrl?: string                   // optional, must be http(s) URL
  type?: "NEWS" | "ANNOUNCEMENT"      // default "NEWS"
  pinned?: boolean                    // default false
}
```

**Response 201** — created post object.

**Response 400** — `{ "error": string, "field"?: string }`

**Response 401** `{ "error": "Unauthorized" }`

**Response 500** `{ "error": "Failed to create news post" }`

---

### PATCH /api/news/[id]

**Auth**: `x-admin-key`

**Request body** — any subset of POST fields.

**Response 200** — updated post.

**Response 400 / 401 / 404 / 500** — standard error shapes.

---

### DELETE /api/news/[id]

**Auth**: `x-admin-key`

**Response 200** `{ "success": true }`

**Response 401 / 404 / 500** — standard.

---

## /api/resources

### GET /api/resources
Returns all resource links ordered by `category ASC, createdAt ASC`.

**Auth**: None

**Response 200**
```typescript
{
  resources: Array<{
    id: CuidString
    title: string
    url: string
    description: string | null
    category: string
    createdAt: ISODateString
  }>
}
```

---

### POST /api/resources

**Auth**: `x-admin-key`

**Request body**
```typescript
{
  title: string       // required, max 200 chars
  url: string         // required, must start with http(s)://
  description?: string
  category: string    // required, max 50 chars; e.g. "TOOLS"
}
```

**Response 201** — created resource.

**Response 400 / 401 / 500** — standard.

---

### PATCH /api/resources/[id]

**Auth**: `x-admin-key`

**Request body** — any subset of POST fields.

**Response 200** — updated resource.

**Response 400 / 401 / 404 / 500** — standard.

---

### DELETE /api/resources/[id]

**Auth**: `x-admin-key`

**Response 200** `{ "success": true }`

**Response 401 / 404 / 500** — standard.

---

## /api/projects

### GET /api/projects
Returns all projects ordered by `createdAt ASC`.

**Auth**: None

**Response 200**
```typescript
{
  projects: Array<{
    id: CuidString
    teamName: string
    projectName: string
    description: string | null
    iframeUrl: string
    createdAt: ISODateString
  }>
}
```

---

### POST /api/projects

**Auth**: `x-admin-key`

**Request body**
```typescript
{
  teamName: string      // required, max 200 chars; unique
  projectName: string   // required, max 200 chars
  description?: string
  iframeUrl: string     // required, must start with https://
}
```

**Response 201** — created project.

**Response 400** — standard, including:
```json
{ "error": "iframeUrl must use HTTPS", "field": "iframeUrl" }
```

**Response 401** `{ "error": "Unauthorized" }`

**Response 409** `{ "error": "A project for this team already exists", "field": "teamName" }`

**Response 500** `{ "error": "Failed to create project" }`

---

### PATCH /api/projects/[id]

**Auth**: `x-admin-key`

**Request body** — any subset of POST fields.

**Response 200** — updated project.

**Response 400 / 401 / 404 / 409 / 500** — standard.

---

### DELETE /api/projects/[id]

**Auth**: `x-admin-key`

**Response 200** `{ "success": true }`

**Response 401 / 404 / 500** — standard.

---

## /api/help-requests

### GET /api/help-requests
Returns all help requests ordered by `status ASC` (PENDING first, then IN_PROGRESS, then RESOLVED), then `createdAt ASC`.

**Auth**: `x-admin-key` — this endpoint is admin/mentor only; participants do not see the queue.

**Response 200**
```typescript
{
  requests: Array<{
    id: CuidString
    teamName: string
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED"
    claimedBy: string | null
    createdAt: ISODateString
    updatedAt: ISODateString
  }>
}
```

**Response 401** `{ "error": "Unauthorized" }`

**Response 500** `{ "error": "Failed to fetch help requests" }`

---

### POST /api/help-requests
Creates a new help request. Called by the public `/help` page. This is intentionally unauthenticated to let participants submit without logging in.

**Auth**: None

**Request body**
```typescript
{
  teamName: string   // required, max 200 chars
}
```

**Response 201**
```typescript
{
  id: CuidString
  teamName: string
  status: "PENDING"
  createdAt: ISODateString
}
```

**Response 400** `{ "error": "teamName is required" }`

**Response 500** `{ "error": "Failed to create help request" }`

Note: No deduplication check — a team can submit multiple help requests if needed. Mentors see all open requests.

---

### PATCH /api/help-requests/[id]
Updates the status and/or claimedBy of a help request.

**Auth**: `x-admin-key`

**Request body**
```typescript
{
  status?: "PENDING" | "IN_PROGRESS" | "RESOLVED"
  claimedBy?: string   // required when status = "IN_PROGRESS"
}
```

**Response 200** — updated help request (full object).

**Response 400**
```typescript
// Examples:
{ "error": "claimedBy is required when status is IN_PROGRESS", "field": "claimedBy" }
{ "error": "Invalid status value", "field": "status" }
```

**Response 401** `{ "error": "Unauthorized" }`

**Response 404** `{ "error": "Not found" }`

**Response 500** `{ "error": "Failed to update help request" }`

---

## /api/config

### GET /api/config
Returns the singleton event config.

**Auth**: None

**Response 200**
```typescript
{
  config: {
    id: "1"
    eventName: string
    submissionDeadline: ISODateString
    wifiSsid: string | null
    wifiPassword: string | null
    discordUrl: string | null
    importantLinks: Array<{ label: string; url: string }>
    updatedAt: ISODateString
  }
}
```

**Response 404** `{ "error": "Event config not found — run the seed script" }`

**Response 500** `{ "error": "Failed to fetch config" }`

---

### PATCH /api/config
Updates the singleton event config. Uses `prisma.eventConfig.upsert` on `id = "1"` so it is safe even if seed has not run.

**Auth**: `x-admin-key`

**Request body** — any subset of config fields:
```typescript
{
  eventName?: string
  submissionDeadline?: ISODateString
  wifiSsid?: string | null
  wifiPassword?: string | null
  discordUrl?: string | null
  importantLinks?: Array<{ label: string; url: string }>  // max 10 items
}
```

**Response 200** — updated config (full object).

**Response 400**
```typescript
// Examples:
{ "error": "importantLinks must be an array", "field": "importantLinks" }
{ "error": "Each importantLink must have a non-empty label and a valid url", "field": "importantLinks" }
{ "error": "Maximum 10 important links allowed", "field": "importantLinks" }
```

**Response 401** `{ "error": "Unauthorized" }`

**Response 500** `{ "error": "Failed to update config" }`

---

## Error Handling Summary

| HTTP Status | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failure; always includes `error` and optionally `field` |
| 401 | Unauthorized | Missing or wrong `x-admin-key` header |
| 404 | Not Found | Resource with given `[id]` does not exist in DB |
| 409 | Conflict | Unique constraint violation (e.g. duplicate teamName in Project) |
| 500 | Internal Server Error | Unexpected Prisma error or other server exception |

All 4xx and 5xx responses return `Content-Type: application/json` with `{ "error": string }`.
