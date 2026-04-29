# Task 14 — Mentor Page

## Goal
Implement the mentor portal at `/mentor`. Mentors see a 3-column kanban board of help requests (PENDING | IN_PROGRESS | RESOLVED). They can claim pending requests and resolve in-progress ones. The page polls every 15 seconds (shorter than the public 30s interval).

## Prerequisites
- Tasks 01–11 complete
- Task 08 complete (`/api/help-requests` working)
- Middleware guards `/mentor/*` (Task 03)
- `.env.local` has `MENTOR_USER`, `MENTOR_PASS`, `NEXT_PUBLIC_ADMIN_SECRET`

---

## Files to Create

### `src/app/(mentor)/mentor/layout.tsx`
Wraps the mentor page with `MentorNav`.

```typescript
import { MentorNav } from '@/components/ui/MentorNav'

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <MentorNav />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
```

### `src/app/(mentor)/mentor/page.tsx`
Client Component. Polls `GET /api/help-requests` every 15 seconds. Renders a 3-column board.

Each request card shows:
- Team name (large, uppercase, Epilogue)
- Time since submitted (e.g., "5 min ago")
- `claimedBy` name if status is IN_PROGRESS
- Status badge

**PENDING cards**: show a "CLAIM" button. Clicking opens an inline input for the mentor's name + a "CONFIRM CLAIM" button. Submits `PATCH /api/help-requests/[id]` with `{ status: "IN_PROGRESS", claimedBy: name }`.

**IN_PROGRESS cards**: show a "RESOLVE" button. Clicking submits `PATCH /api/help-requests/[id]` with `{ status: "RESOLVED" }` immediately (no extra input needed).

**RESOLVED cards**: display-only. No action buttons.

```typescript
'use client'

import { useState, useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminFetch } from '@/lib/adminFetch'

type HelpRequest = {
  id: string
  teamName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  claimedBy: string | null
  createdAt: string
  updatedAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

function RequestCard({
  request,
  onUpdate,
}: {
  request: HelpRequest
  onUpdate: () => void
}) {
  const [claiming, setClaiming] = useState(false)
  const [mentorName, setMentorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!mentorName.trim()) { setError('Enter your name'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/help-requests/${request.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_PROGRESS', claimedBy: mentorName.trim() }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setClaiming(false)
      setMentorName('')
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    setLoading(true)
    try {
      await adminFetch(`/api/help-requests/${request.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED' }),
      })
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`border-2 border-primary shadow-hard p-4 ${
      request.status === 'IN_PROGRESS' ? 'bg-secondary-fixed' : 'bg-white'
    }`}>
      <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">
        {request.teamName}
      </h3>
      <p className="font-grotesk text-xs text-outline mt-1">{timeAgo(request.createdAt)}</p>
      {request.claimedBy && (
        <p className="font-grotesk text-xs mt-1">
          <span className="uppercase tracking-widest text-outline">Claimed by </span>
          {request.claimedBy}
        </p>
      )}
      <div className="mt-3">
        <StatusBadge status={request.status} />
      </div>

      {request.status === 'PENDING' && !claiming && (
        <Button
          className="mt-3 w-full"
          onClick={() => setClaiming(true)}
          disabled={loading}
        >
          CLAIM
        </Button>
      )}

      {request.status === 'PENDING' && claiming && (
        <div className="mt-3 space-y-2">
          <Input
            label="Your Name"
            value={mentorName}
            onChange={e => setMentorName(e.target.value)}
            placeholder="Alice"
          />
          {error && <p className="font-grotesk text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleClaim} disabled={loading} className="flex-1">
              {loading ? '...' : 'CONFIRM'}
            </Button>
            <Button onClick={() => { setClaiming(false); setError(null) }} className="flex-1">
              CANCEL
            </Button>
          </div>
        </div>
      )}

      {request.status === 'IN_PROGRESS' && (
        <Button
          variant="primary"
          className="mt-3 w-full"
          onClick={handleResolve}
          disabled={loading}
        >
          {loading ? '...' : 'RESOLVE'}
        </Button>
      )}
    </div>
  )
}

export default function MentorPage() {
  const fetcher = useCallback(
    () => adminFetch('/api/help-requests').then(r => r.json()).then(d => d.requests ?? []),
    []
  )
  const { data: requests, loading, error } = usePolling<HelpRequest[]>(fetcher, 15_000)

  const pending = (requests ?? []).filter(r => r.status === 'PENDING')
  const inProgress = (requests ?? []).filter(r => r.status === 'IN_PROGRESS')
  const resolved = (requests ?? []).filter(r => r.status === 'RESOLVED')

  if (loading && !requests) {
    return <p className="font-grotesk text-outline">Loading...</p>
  }
  if (error) {
    return <p className="font-grotesk text-error">Failed to load help requests.</p>
  }

  const columns = [
    { label: 'PENDING', items: pending, count: pending.length },
    { label: 'IN PROGRESS', items: inProgress, count: inProgress.length },
    { label: 'RESOLVED', items: resolved, count: resolved.length },
  ]

  return (
    <div>
      <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight leading-none mb-6">
        Help Queue
      </h1>
      <p className="font-grotesk text-xs text-outline mb-6 uppercase tracking-widest">
        Auto-refreshes every 15 seconds
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ label, items, count }) => (
          <div key={label}>
            <div className="border-b-2 border-primary mb-4 pb-2 flex items-baseline gap-2">
              <h2 className="font-epilogue font-black text-lg uppercase tracking-tight">{label}</h2>
              <span className="font-grotesk text-sm text-outline">({count})</span>
            </div>
            <div className="space-y-4">
              {items.length === 0 && (
                <p className="font-grotesk text-xs text-outline">None</p>
              )}
              {items.map(r => (
                <RequestCard key={r.id} request={r} onUpdate={() => fetcher()} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### `src/app/(mentor)/mentor/logout/route.ts`
```typescript
export function GET() {
  return new Response('Logged out', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CodeDay Mentors", charset="UTF-8"',
    },
  })
}
```

---

## Acceptance Criteria

- [ ] `GET /mentor` without credentials returns HTTP 401 with `WWW-Authenticate` header
- [ ] `GET /mentor` with correct mentor credentials shows the 3-column board
- [ ] Page polls every 15 seconds (verify in Network tab: requests to `/api/help-requests`)
- [ ] PENDING column shows all pending requests; each has a "CLAIM" button
- [ ] Clicking "CLAIM" shows an inline name input; submitting without a name shows an error
- [ ] Submitting a valid name transitions the request to IN_PROGRESS and it appears in the middle column
- [ ] IN_PROGRESS cards show the claiming mentor's name and a "RESOLVE" button
- [ ] Clicking "RESOLVE" immediately transitions the request to RESOLVED
- [ ] RESOLVED column shows all resolved requests (no action buttons)
- [ ] Counts in column headers update after each action (e.g., PENDING count decrements)
- [ ] Logout at `/mentor/logout` returns 401 and clears credentials
- [ ] `npx tsc --noEmit` passes

---

## Tests

### Auth Test
```bash
# Without credentials
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/mentor
# Expected: 401

# With wrong credentials
curl -s -o /dev/null -w "%{http_code}" -u "wrong:credentials" http://localhost:3000/mentor
# Expected: 401

# With correct mentor credentials
curl -s -o /dev/null -w "%{http_code}" -u "YOUR_MENTOR_USER:YOUR_MENTOR_PASS" http://localhost:3000/mentor
# Expected: 200
```

### Full Workflow Test
Run these setup steps first:
```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
export BASE="http://localhost:3000"

# Create 3 help requests
HR1=$(curl -s -X POST "$BASE/api/help-requests" -H "Content-Type: application/json" -d '{"teamName":"Team Alpha"}' | jq -r '.id')
HR2=$(curl -s -X POST "$BASE/api/help-requests" -H "Content-Type: application/json" -d '{"teamName":"Team Beta"}' | jq -r '.id')
HR3=$(curl -s -X POST "$BASE/api/help-requests" -H "Content-Type: application/json" -d '{"teamName":"Team Gamma"}' | jq -r '.id')
```

Then in the browser at `http://localhost:3000/mentor`:

1. **Verify initial state**: 3 cards in PENDING column, 0 in IN_PROGRESS, 0 in RESOLVED
2. **Claim Team Alpha**:
   - Click CLAIM on Team Alpha's card
   - Leave name empty and click CONFIRM — verify error "Enter your name" appears
   - Enter "Alice" and click CONFIRM
   - Verify Team Alpha moves to IN_PROGRESS column with "Claimed by Alice"
3. **Resolve Team Alpha**:
   - Click RESOLVE on Team Alpha's card
   - Verify Team Alpha moves to RESOLVED column
4. **Verify API state**:
```bash
curl -s "$BASE/api/help-requests" \
  -H "x-admin-key: $ADMIN_SECRET" | jq '[.requests[] | {teamName, status, claimedBy}]'
# Expected:
# [
#   { "teamName": "Team Beta", "status": "PENDING", "claimedBy": null },
#   { "teamName": "Team Gamma", "status": "PENDING", "claimedBy": null },
#   { "teamName": "Team Alpha", "status": "RESOLVED", "claimedBy": "Alice" }
# ]
```

### 15-Second Polling Test
1. Open `/mentor` in browser with DevTools > Network
2. Filter requests to "help-requests"
3. Watch for 35 seconds — should see ~2 requests (one immediate, one at 15s)
4. In a separate terminal, submit a new help request:
```bash
curl -s -X POST http://localhost:3000/api/help-requests \
  -H "Content-Type: application/json" \
  -d '{"teamName":"Team Delta"}'
```
5. Within 15 seconds, "Team Delta" should appear in the PENDING column without refreshing

### Logout Test
1. Log in to `/mentor` with mentor credentials
2. Navigate to `http://localhost:3000/mentor/logout`
3. Browser should show 401 response text "Logged out"
4. Navigate back to `/mentor` — browser should prompt for credentials again

### TypeScript Check
```bash
npx tsc --noEmit
# Must pass with 0 errors
```

### Build Check
```bash
npm run build
# Must complete without errors
```
