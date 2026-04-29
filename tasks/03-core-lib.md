# Task 03 — Core Library & Middleware

## Goal
Create all shared library utilities used throughout the app: the Prisma client singleton (with Neon adapter), the admin key auth helper, the polling hook, and the Next.js middleware that enforces HTTP Basic Auth on `/admin/*` and `/mentor/*`.

## Prerequisites
- Task 01 complete (project scaffolded, dependencies installed)
- Task 02 complete (`prisma generate` has run, `@prisma/client` types are available)
- `.env.local` has `ADMIN_USER`, `ADMIN_PASS`, `MENTOR_USER`, `MENTOR_PASS`, `ADMIN_SECRET`, `DATABASE_URL`

---

## Files to Create

### `src/lib/prisma.ts`
Prisma client singleton using the Neon serverless HTTP adapter. The `globalThis` trick prevents multiple clients during Next.js hot-reload.

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

### `src/lib/auth.ts`
Validates the `x-admin-key` request header against the `ADMIN_SECRET` env var.

```typescript
export function checkAdminKey(request: Request): boolean {
  const key = request.headers.get('x-admin-key')
  return typeof key === 'string' && key.length > 0 && key === process.env.ADMIN_SECRET
}
```

### `src/lib/hooks/usePolling.ts`
Generic polling hook. Calls `fetcher` immediately on mount, then on a fixed interval. Clears the interval on unmount. Marked `'use client'` is NOT added here — the hook itself is not a component. Client Components that use it will have `'use client'` at their own file level.

```typescript
import { useEffect, useState, useCallback } from 'react'

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 30_000
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, intervalMs)
    return () => clearInterval(interval)
  }, [fetchData, intervalMs])

  return { data, loading, error }
}
```

### `src/middleware.ts`
HTTP Basic Auth guard for `/admin/*` and `/mentor/*`. Reads credentials from env vars. Returns `401` with `WWW-Authenticate` header if credentials are missing or wrong — this triggers the browser's native login dialog.

**Critical**: This file must live at `src/middleware.ts`, NOT inside `src/app/`.

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
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
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
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
      }
    )
  }

  const colonIndex = credentials.indexOf(':')
  if (colonIndex === -1) {
    return NextResponse.json(
      { error: 'Invalid credentials format' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
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
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
      }
    )
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const adminUser = process.env.ADMIN_USER
    const adminPass = process.env.ADMIN_PASS

    if (!adminUser || !adminPass) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 503 })
    }

    const response = isAuthenticated(request, adminUser, adminPass, 'CodeDay Admin')
    if (response) return response
  }

  if (pathname.startsWith('/mentor')) {
    const mentorUser = process.env.MENTOR_USER
    const mentorPass = process.env.MENTOR_PASS

    if (!mentorUser || !mentorPass) {
      return NextResponse.json({ error: 'Mentor credentials not configured' }, { status: 503 })
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

## Acceptance Criteria

- [ ] `src/lib/prisma.ts` exists and exports `prisma`
- [ ] `src/lib/auth.ts` exists and exports `checkAdminKey`
- [ ] `src/lib/hooks/usePolling.ts` exists and exports `usePolling`
- [ ] `src/middleware.ts` exists at `src/` level (not inside `src/app/`)
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

---

## Tests

### Middleware — Unauthenticated Admin Request
```bash
# Start dev server: npm run dev
curl -v http://localhost:3000/admin
# Expected:
# HTTP/1.1 401
# WWW-Authenticate: Basic realm="CodeDay Admin", charset="UTF-8"
```

### Middleware — Wrong Password
```bash
curl -v -u "admin:wrongpassword" http://localhost:3000/admin
# Expected: HTTP 401
```

### Middleware — Correct Admin Credentials
```bash
# Replace with your actual ADMIN_USER and ADMIN_PASS from .env.local
curl -v -u "your-admin-username:your-admin-password" http://localhost:3000/admin
# Expected: HTTP 200 (or 404 if the admin page isn't built yet — NOT 401)
```

### Middleware — Mentor Zone
```bash
curl -v http://localhost:3000/mentor
# Expected: HTTP 401 with WWW-Authenticate: Basic realm="CodeDay Mentors"

curl -v -u "your-mentor-username:your-mentor-password" http://localhost:3000/mentor
# Expected: HTTP 200 (or 404 if not built yet — NOT 401)
```

### Middleware — Public Routes NOT Blocked
```bash
curl -v http://localhost:3000/
curl -v http://localhost:3000/schedule
curl -v http://localhost:3000/news
# Expected: all return HTTP 200 (no 401)
```

### Auth Helper — Logic Verification
Create a temporary test file `src/lib/__test-auth.ts` (delete after testing):
```typescript
// This is a manual smoke test — run with: npx ts-node src/lib/__test-auth.ts
// Set process.env.ADMIN_SECRET before running
process.env.ADMIN_SECRET = 'test-secret-value'

// Dynamic import to avoid module issues
async function test() {
  const { checkAdminKey } = await import('./auth')

  const makeReq = (key: string | null) =>
    new Request('http://localhost', {
      headers: key ? { 'x-admin-key': key } : {},
    })

  console.assert(checkAdminKey(makeReq('test-secret-value')) === true, 'correct key should pass')
  console.assert(checkAdminKey(makeReq('wrong-key')) === false, 'wrong key should fail')
  console.assert(checkAdminKey(makeReq(null)) === false, 'missing key should fail')
  console.assert(checkAdminKey(makeReq('')) === false, 'empty key should fail')
  console.log('Auth helper: all assertions passed')
}

test()
```

### Prisma Singleton — No Duplicate Clients in Dev
```bash
npm run dev
# Make two requests to any API route
# Check terminal output — should NOT see "PrismaClient is already defined" warnings
```
