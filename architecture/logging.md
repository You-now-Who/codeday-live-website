# Logging Standards

This is the single source of truth for all logging in the application. Every agent implementing API routes, server components, or client-side code must follow this file.

---

## Logging Library

No third-party logging library. Use the Node.js built-ins:
- `console.log` — informational events and successful mutations
- `console.warn` — non-fatal unexpected conditions (e.g. 404 on a resource lookup)
- `console.error` — errors caught in try/catch; unhandled exceptions

Rationale: Vercel automatically captures `stdout`/`stderr` from serverless functions. `console.log` goes to stdout, `console.error` goes to stderr. Vercel's log viewer separates these. A logging library would add a dependency with no benefit at this event's scale.

---

## Structured Log Format

All `console.log` and `console.error` calls in API route handlers and Server Components must emit a **single JSON object**, not a plain string. This makes logs searchable in Vercel's log viewer.

### Mutation Log (console.log)

Called on every successful `POST`, `PATCH`, or `DELETE`.

```typescript
console.log(JSON.stringify({
  ts: new Date().toISOString(),      // ISO 8601 timestamp
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: string,                    // e.g. 'ScheduleItem', 'NewsPost'
  id: string | undefined,            // entity id; undefined for CREATE before insert
  data: Record<string, unknown>,     // the fields that were written (omit passwords)
}))
```

Examples:
```json
{"ts":"2025-06-14T09:15:32.001Z","action":"CREATE","entity":"NewsPost","id":"clxyz123","data":{"headline":"Judging starts at 4pm","type":"ANNOUNCEMENT","pinned":true}}
{"ts":"2025-06-14T09:22:01.445Z","action":"UPDATE","entity":"HelpRequest","id":"clxyz456","data":{"status":"IN_PROGRESS","claimedBy":"Alice"}}
{"ts":"2025-06-14T09:55:10.882Z","action":"DELETE","entity":"ScheduleItem","id":"clxyz789","data":{}}
```

### Error Log (console.error)

Called in every `catch` block in API route handlers.

```typescript
console.error(JSON.stringify({
  ts: new Date().toISOString(),
  level: 'ERROR',
  route: string,       // e.g. 'POST /api/news'
  message: string,     // e.target.message or descriptive string
  error: String(e),    // full error string
}))
```

Example:
```json
{"ts":"2025-06-14T09:30:00.123Z","level":"ERROR","route":"POST /api/projects","message":"Failed to create project","error":"PrismaClientKnownRequestError: Unique constraint failed on field teamName"}
```

### Validation Warning (console.warn)

Called when a request fails validation before reaching the database (400 responses).

```typescript
console.warn(JSON.stringify({
  ts: new Date().toISOString(),
  level: 'WARN',
  route: string,
  message: string,     // validation message
  field: string | undefined,
}))
```

---

## API Route Handler Template

Every route handler must follow this template exactly:

```typescript
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function POST(request: Request) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // --- Validation ---
  const { fieldA, fieldB } = body as { fieldA?: unknown; fieldB?: unknown }

  if (!fieldA || typeof fieldA !== 'string' || fieldA.trim() === '') {
    console.warn(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'WARN',
      route: 'POST /api/<entity>',
      message: 'fieldA is required',
      field: 'fieldA',
    }))
    return Response.json({ error: 'fieldA is required', field: 'fieldA' }, { status: 400 })
  }

  // --- Database write ---
  try {
    const created = await prisma.<entity>.create({ data: { fieldA: fieldA.trim() } })

    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      action: 'CREATE',
      entity: '<Entity>',
      id: created.id,
      data: { fieldA: created.fieldA },
    }))

    return Response.json(created, { status: 201 })
  } catch (e) {
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'ERROR',
      route: 'POST /api/<entity>',
      message: 'Failed to create <entity>',
      error: String(e),
    }))
    return Response.json({ error: 'Failed to create <entity>' }, { status: 500 })
  }
}
```

---

## Logging Rules by Context

### In API Route Handlers (server-side)

| Event | Method | Required Fields |
|---|---|---|
| Successful CREATE | `console.log` | ts, action="CREATE", entity, id, data (sanitized) |
| Successful UPDATE | `console.log` | ts, action="UPDATE", entity, id, data (only changed fields) |
| Successful DELETE | `console.log` | ts, action="DELETE", entity, id, data={} |
| Validation failure | `console.warn` | ts, level="WARN", route, message, field (if applicable) |
| Caught exception | `console.error` | ts, level="ERROR", route, message, error (stringified) |
| 404 not found | `console.warn` | ts, level="WARN", route, message, id |

### In Server Components

Server Components that fetch data on render should NOT log on every successful read (high volume, low value). Log only errors:

```typescript
try {
  const data = await prisma.scheduleItem.findMany(...)
  return data
} catch (e) {
  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'ERROR',
    route: 'ServerComponent: SchedulePage',
    message: 'Failed to fetch schedule items',
    error: String(e),
  }))
  // return empty array or throw to trigger error.tsx
  return []
}
```

### In Client Components

Client components must NOT log structured JSON — they run in the browser where JSON logs are unreadable. Use plain strings for development debugging only, and do not commit `console.log` statements in client components to production code.

Exception: `console.error` in client components is acceptable for caught fetch errors, because Vercel does not capture browser-side logs anyway.

```typescript
// Acceptable in client component
catch (e) {
  console.error('Failed to fetch help requests:', e)
  setError('Could not load data. Will retry shortly.')
}
```

---

## What NOT to Log

- Raw request bodies that may contain any user data beyond entity IDs
- WiFi passwords or Discord URLs (these come from EventConfig — log that the config was updated, not the values)
- The `ADMIN_SECRET`, `ADMIN_PASS`, `MENTOR_PASS`, or `ADMIN_USER` values — never

Example of safe config update log:
```json
{"ts":"2025-06-14T10:00:00.000Z","action":"UPDATE","entity":"EventConfig","id":"1","data":{"fields_updated":["wifiSsid","wifiPassword","submissionDeadline"]}}
```

---

## Vercel Log Access

Logs are visible in the Vercel dashboard under the project's "Functions" tab in real time during the event. No additional setup is needed. `console.log` and `console.warn` appear as info logs; `console.error` appears as error logs and may trigger Vercel's error alerting if configured.
