# Task 13 — Admin Pages

## Goal
Implement all 6 admin pages behind HTTP Basic Auth: Dashboard overview (`/admin`), plus CRUD pages for Schedule, News, Resources, Projects, and Config (`/admin/config`). Also add logout route.

## Prerequisites
- Tasks 01–11 complete
- Middleware guards `/admin/*` (Task 03)
- All API routes working (Tasks 04–09)
- `.env.local` has `ADMIN_USER`, `ADMIN_PASS`, `NEXT_PUBLIC_ADMIN_SECRET`

---

## Admin Shell Layout

### `src/app/(admin)/admin/layout.tsx`
Wraps all admin pages with the `AdminNav` sidebar and offsets content.

```typescript
import { AdminNav } from '@/components/ui/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="ml-48 p-8">
        {children}
      </main>
    </div>
  )
}
```

---

## Admin Dashboard

### `src/app/(admin)/admin/page.tsx`
Server Component. Shows counts of all entities and a config summary. All fetches include `x-admin-key` header (server-side, using `ADMIN_SECRET` — not the public one).

```typescript
async function getAdminData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const secret = process.env.ADMIN_SECRET!
  const headers = { 'x-admin-key': secret }

  const [configRes, scheduleRes, newsRes, resourcesRes, projectsRes, helpRes] = await Promise.all([
    fetch(`${baseUrl}/api/config`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/schedule`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/news`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/resources`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/projects`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/help-requests`, { cache: 'no-store', headers }),
  ])

  const [{ config }, { items }, { posts }, { resources }, { projects }, { requests }] = await Promise.all([
    configRes.json(),
    scheduleRes.json(),
    newsRes.json(),
    resourcesRes.json(),
    projectsRes.json(),
    helpRes.json(),
  ])

  return { config, counts: { schedule: items.length, news: posts.length, resources: resources.length, projects: projects.length, helpPending: requests.filter((r: { status: string }) => r.status === 'PENDING').length } }
}

export default async function AdminDashboardPage() {
  const { config, counts } = await getAdminData()

  const statCards = [
    { label: 'Schedule Items', count: counts.schedule, href: '/admin/schedule' },
    { label: 'News Posts', count: counts.news, href: '/admin/news' },
    { label: 'Resources', count: counts.resources, href: '/admin/resources' },
    { label: 'Projects', count: counts.projects, href: '/admin/projects' },
    { label: 'Pending Help', count: counts.helpPending, href: '#', accent: counts.helpPending > 0 },
  ]

  return (
    <div>
      <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none mb-2">
        Dashboard
      </h1>
      <p className="font-grotesk text-outline mb-8">{config?.eventName ?? 'CodeDay London'}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, count, href, accent }) => (
          <a
            key={label}
            href={href}
            className={`border-2 border-primary shadow-hard p-4 block ${accent ? 'bg-secondary-fixed' : 'bg-white'}`}
          >
            <div className="font-epilogue font-black text-4xl leading-none">{count}</div>
            <div className="font-grotesk text-xs uppercase tracking-widest mt-1 text-outline">{label}</div>
          </a>
        ))}
      </div>

      {config && (
        <div className="bg-white border-2 border-primary shadow-hard p-4">
          <h2 className="font-epilogue font-black text-lg uppercase mb-2">Event Config</h2>
          <p className="font-grotesk text-sm">
            <span className="text-outline uppercase tracking-widest text-xs">Deadline </span>
            {new Date(config.submissionDeadline).toLocaleString()}
          </p>
          <a href="/admin/config" className="font-grotesk text-xs uppercase tracking-widest underline mt-2 inline-block">
            Edit Config →
          </a>
        </div>
      )}
    </div>
  )
}
```

---

## Admin CRUD Pages

All four CRUD pages (schedule, news, resources, projects) follow the same pattern:
- Client Component
- Fetches list on mount using `NEXT_PUBLIC_ADMIN_SECRET`
- Inline "Add" form below the table (not a modal)
- Each row has Edit (inline form replaces row) and Delete buttons
- After any mutation, re-fetches the list immediately

### Pattern Helper: `src/lib/adminFetch.ts`
Shared helper to attach the admin key to all admin API calls:

```typescript
export const adminFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '',
      ...(options.headers ?? {}),
    },
  })
```

---

### `src/app/(admin)/admin/schedule/page.tsx`
Client Component. Lists schedule items. Inline add/edit forms. Fields: `title`, `description`, `location`, `startsAt`, `endsAt`.

The full implementation must:
1. Render a table with columns: Time | Title | Location | Actions
2. "ADD ITEM" button toggles an inline add form below the table
3. Each row's "EDIT" button replaces that row with an edit form inline
4. "DELETE" button calls `DELETE /api/schedule/[id]` after a `window.confirm`
5. All forms have `Input` components for each field and a submit `Button`
6. Display API validation errors below the form if the response is not 2xx
7. On success, refetch the list and close the form

```typescript
'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ScheduleItem = {
  id: string; title: string; description: string | null;
  location: string | null; startsAt: string; endsAt: string | null
}

// [Full implementation — see acceptance criteria for required behaviour]
// Key implementation points:
// - useEffect on mount to fetch /api/schedule
// - addForm state: { title, description, location, startsAt, endsAt, error, loading }
// - editingId state: string | null — which row is in edit mode
// - editForm state: same shape as addForm
// - handleAdd: POST /api/schedule, on success refetch + close form
// - handleEdit: PATCH /api/schedule/[id], on success refetch + close form
// - handleDelete: window.confirm + DELETE /api/schedule/[id] + refetch
// - format startsAt/endsAt display: toLocaleString()
// - datetime-local input values: slice ISO string to 'YYYY-MM-DDTHH:MM'

export default function AdminSchedulePage() {
  // Full implementation required — outline only above
  return <div>Admin Schedule CRUD</div>
}
```

**Note**: The actual implementation of the Client Component is intentionally not fully written out here — the acceptance criteria and tests define exactly what must work. This avoids overly prescribing implementation details while being explicit about behaviour.

### `src/app/(admin)/admin/news/page.tsx`
Same pattern as schedule. Fields: `headline`, `body` (textarea), `imageUrl`, `type` (select: NEWS/ANNOUNCEMENT), `pinned` (checkbox). Live preview of the image URL below the input (rendered with `dither` class).

### `src/app/(admin)/admin/resources/page.tsx`
Same pattern. Fields: `title`, `url`, `description`, `category` (text input with suggested chips below: TOOLS, DOCS, DESIGN, PRIZES, OTHER — clicking a chip sets the value).

### `src/app/(admin)/admin/projects/page.tsx`
Same pattern. Fields: `teamName`, `projectName`, `description`, `iframeUrl`. Live preview iframe below the URL input in the form (with the sandbox attribute).

---

## Admin Config Page

### `src/app/(admin)/admin/config/page.tsx`
Single form (no table). Fetches EventConfig on mount. All fields in one form. Dynamic `importantLinks` array.

```typescript
'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Config form must:
// 1. Fetch /api/config on mount; populate all form fields
// 2. Fields: eventName, submissionDeadline (datetime-local), wifiSsid, wifiPassword, discordUrl
// 3. importantLinks: dynamic array. "ADD LINK" appends { label: '', url: '' }. Each row has label/url inputs + delete button
// 4. Save button calls PATCH /api/config with all fields
// 5. Show success message ("Saved!") on success, error message on failure

export default function AdminConfigPage() {
  // Full implementation required
  return <div>Admin Config</div>
}
```

---

## Logout Routes

### `src/app/(admin)/admin/logout/route.ts`
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

---

## Acceptance Criteria

### Admin Layout & Navigation
- [ ] Navigating to `/admin` (with correct credentials) shows the dashboard
- [ ] `AdminNav` sidebar is visible and all links work
- [ ] Active page link in sidebar is highlighted (yellow background)
- [ ] Logout link at `http://localhost:3000/admin/logout` returns 401 and clears browser credentials

### Admin Dashboard
- [ ] Shows counts for schedule items, news posts, resources, projects, pending help requests
- [ ] Pending help requests count has yellow background when > 0
- [ ] Shows event name and submission deadline from EventConfig
- [ ] Count cards are correct links to sub-pages

### Admin Schedule CRUD
- [ ] Page loads and displays all schedule items in a table
- [ ] "ADD ITEM" button shows an inline form
- [ ] Submitting the add form with all valid fields creates a new item and re-renders the table
- [ ] Submitting with missing `title` shows the error from the API
- [ ] Each row has EDIT and DELETE buttons
- [ ] EDIT button replaces the row with an inline edit form pre-populated with current values
- [ ] Saving the edit form updates the item and restores the row
- [ ] DELETE button calls `window.confirm` and on confirmation removes the item from the table

### Admin News CRUD
- [ ] Same CRUD behaviour as schedule
- [ ] `pinned` checkbox works
- [ ] `type` dropdown (NEWS / ANNOUNCEMENT) works
- [ ] imageUrl field shows a live preview of the image (with `.dither` class) below the input

### Admin Resources CRUD
- [ ] Same CRUD behaviour
- [ ] Category chip suggestions (TOOLS, DOCS, DESIGN, PRIZES, OTHER) appear below the category field
- [ ] Clicking a chip populates the category input

### Admin Projects CRUD
- [ ] Same CRUD behaviour
- [ ] iframeUrl field shows a live preview iframe below the input in the form
- [ ] Duplicate teamName shows the 409 Conflict error from the API

### Admin Config
- [ ] All fields load correctly from the API
- [ ] Changing eventName and saving updates it (verify with GET /api/config)
- [ ] "ADD LINK" button adds a new label/url pair to importantLinks
- [ ] Delete button on an importantLinks row removes it
- [ ] Saving 0 links sets importantLinks to []
- [ ] Shows "Saved!" after successful save

---

## Tests

### Admin Auth Test
```bash
# Should NOT be accessible without credentials
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin
# Expected: 401

# Should be accessible with correct credentials
curl -s -u "YOUR_ADMIN_USER:YOUR_ADMIN_PASS" -o /dev/null -w "%{http_code}" http://localhost:3000/admin
# Expected: 200
```

### Admin Dashboard Data Test
1. Create one schedule item, one news post, one resource via API
2. Reload `/admin`
3. Verify counts show 1, 1, 1 in the respective stat cards

### Schedule CRUD via Browser
1. Log in at `http://localhost:3000/admin/schedule`
2. Click "ADD ITEM"
3. Fill in: Title="Team Kick-off", startsAt=any future datetime
4. Click submit
5. Verify new row appears in the table with correct title and time
6. Click EDIT on that row
7. Change title to "Kick-off (Updated)"
8. Save — verify updated title shows in table
9. Click DELETE — confirm the dialog
10. Verify the row is gone from the table and from:
```bash
curl -s http://localhost:3000/api/schedule | jq '.items | length'
# Expected: 0
```

### Config Save Test
1. Navigate to `/admin/config`
2. Change Event Name to "CodeDay London TEST"
3. Click Save
4. Verify "Saved!" message appears
5. Reload the page — verify event name field still shows "CodeDay London TEST"
6. Verify via API:
```bash
curl -s http://localhost:3000/api/config | jq '.config.eventName'
# Expected: "CodeDay London TEST"
```

### importantLinks Test
1. On `/admin/config`, click "ADD LINK" twice
2. Fill in: Label="GitHub", URL="https://github.com"
3. Fill in: Label="Vercel", URL="https://vercel.com"
4. Click Save
5. Verify via API:
```bash
curl -s http://localhost:3000/api/config | jq '.config.importantLinks'
# Expected: [{ "label": "GitHub", "url": "https://github.com" }, { "label": "Vercel", "url": "https://vercel.com" }]
```
6. Navigate to `http://localhost:3000` — verify both links appear in QuickLinksSection
