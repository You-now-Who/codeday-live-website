# Auth & Middleware

## Strategy

HTTP Basic Auth enforced by Next.js Middleware (`src/middleware.ts`). No sessions, no JWTs, no database users. Credentials are stored entirely in environment variables. This is appropriate for a one-time internal event tool.

There are two protected zones:

| Zone | Route Prefix | Credentials Env Vars |
|---|---|---|
| Admin | `/admin/*` | `ADMIN_USER`, `ADMIN_PASS` |
| Mentor | `/mentor/*` | `MENTOR_USER`, `MENTOR_PASS` |

---

## How HTTP Basic Auth Works

When the browser receives a `401` response with the header `WWW-Authenticate: Basic realm="<name>"`, it natively displays a username/password dialog. The user's credentials are then base64-encoded as `username:password` and sent in the `Authorization: Basic <base64>` header on subsequent requests. The browser caches this credential for the session.

This requires no custom login page and no JavaScript — the browser handles it entirely.

---

## Middleware Implementation

**File**: `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

function isAuthenticated(
  request: NextRequest,
  expectedUser: string,
  expectedPass: string,
  realm: string
): NextResponse | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"`,
        },
      }
    )
  }

  const base64Credentials = authHeader.slice('Basic '.length)
  let credentials: string
  try {
    credentials = atob(base64Credentials)
  } catch {
    return NextResponse.json(
      { error: 'Invalid authorization header' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"`,
        },
      }
    )
  }

  const colonIndex = credentials.indexOf(':')
  if (colonIndex === -1) {
    return NextResponse.json(
      { error: 'Invalid credentials format' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"`,
        },
      }
    )
  }

  const user = credentials.slice(0, colonIndex)
  const pass = credentials.slice(colonIndex + 1)

  if (user !== expectedUser || pass !== expectedPass) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"`,
        },
      }
    )
  }

  return null // null means "authenticated — proceed"
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Admin zone ---
  if (pathname.startsWith('/admin')) {
    const adminUser = process.env.ADMIN_USER
    const adminPass = process.env.ADMIN_PASS

    if (!adminUser || !adminPass) {
      // Env vars not configured — deny access loudly in dev
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 503 }
      )
    }

    const response = isAuthenticated(request, adminUser, adminPass, 'CodeDay Admin')
    if (response) return response
  }

  // --- Mentor zone ---
  if (pathname.startsWith('/mentor')) {
    const mentorUser = process.env.MENTOR_USER
    const mentorPass = process.env.MENTOR_PASS

    if (!mentorUser || !mentorPass) {
      return NextResponse.json(
        { error: 'Mentor credentials not configured' },
        { status: 503 }
      )
    }

    const response = isAuthenticated(request, mentorUser, mentorPass, 'CodeDay Mentors')
    if (response) return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mentor/:path*'],
}
```

---

## API Route Auth (`x-admin-key`)

The admin and mentor pages make API calls to mutating routes and to `GET /api/help-requests`. These are authenticated separately using a shared secret in the `x-admin-key` request header.

**Why not reuse Basic Auth for APIs?**
The Next.js Middleware only guards page routes (HTML navigation). API routes called by client-side `fetch()` are not covered by the middleware matcher above — the browser does not automatically add the `Authorization` header to `fetch()` calls. A separate header-based check in each route handler is simpler and more explicit.

**Auth helper**: `src/lib/auth.ts`

```typescript
export function checkAdminKey(request: Request): boolean {
  const key = request.headers.get('x-admin-key')
  return typeof key === 'string' && key.length > 0 && key === process.env.ADMIN_SECRET
}
```

Usage in every protected route handler:

```typescript
import { checkAdminKey } from '@/lib/auth'

export async function POST(request: Request) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... handler logic
}
```

The `ADMIN_SECRET` is a single shared secret for all API mutations. It is passed to browser code via `NEXT_PUBLIC_ADMIN_SECRET` — see security note in `architecture/security.md`.

---

## Prisma Client Singleton

**File**: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const sql = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeon(sql)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

The `globalThis` trick prevents multiple Prisma Client instances from being created during Next.js hot-reload in development. In production (Vercel serverless), each function invocation creates a fresh client — the Neon HTTP adapter is stateless so this is acceptable.

---

## Role Summary

| Role | Access | Auth Mechanism |
|---|---|---|
| Public | `/`, `/schedule`, `/resources`, `/news`, `/projects`, `/help`, all public `GET /api/*` | None |
| Admin | `/admin/*`, all `POST/PATCH/DELETE /api/*`, `GET /api/help-requests` | HTTP Basic Auth (middleware) + `x-admin-key` header (API) |
| Mentor | `/mentor/*`, `GET /api/help-requests`, `PATCH /api/help-requests/[id]` | HTTP Basic Auth (middleware) + `x-admin-key` header (API) |

Note: Admins and mentors share the same `ADMIN_SECRET` for API key auth. They are distinguished only by which pages they access (different Basic Auth credentials gate `/admin` vs `/mentor`). If fine-grained API separation is needed in future, introduce separate `MENTOR_SECRET` env var and a `checkMentorKey` helper — but this is not required for the current event.

---

## Protected Routes Config (matcher)

The middleware `config.matcher` must cover all subpaths:

```typescript
export const config = {
  matcher: ['/admin/:path*', '/mentor/:path*'],
}
```

This does NOT cover `/api/*` routes. API auth is handled at the route handler level via `checkAdminKey`.

---

## "Logout" Behaviour

HTTP Basic Auth sessions are browser-managed. There is no server-side session to invalidate.

To "log out":
- Chrome/Edge: navigate to the protected route with wrong credentials, or clear browser data.
- For a polished experience, add a "Logout" link that navigates to a route handler at `/admin/logout` or `/mentor/logout` which returns a `401` — this forces the browser to clear the cached credentials.

Logout route example (`src/app/(admin)/admin/logout/route.ts`):
```typescript
export function GET() {
  return new Response('Logged out', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CodeDay Admin", charset="UTF-8"',
    },
  })
}
```
