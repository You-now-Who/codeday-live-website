# Security

## Threat Model

This is an internal, single-event tool for 50–100 participants. It is not a financial system, does not store PII beyond team names, and runs for approximately one day. Security measures are proportional to this context: protect against casual abuse and obvious attack vectors, not nation-state adversaries.

---

## Input Validation Strategy

### Where Validation Happens

All input validation happens in the API route handler, before any Prisma call. There is no separate validation library (e.g. Zod) — plain TypeScript conditionals are used. This avoids a dependency and keeps validation logic readable.

### Validation Rules by Field Type

| Field Type | Checks |
|---|---|
| Required string | Not `undefined`, not `null`, `typeof === 'string'`, `.trim() !== ''` |
| Max-length string | `.length <= N` after trim |
| URL field | Matches `/^https?:\/\//` or `/^https:\/\//` for `iframeUrl` |
| DateTime field | `!isNaN(new Date(value).getTime())` |
| Enum field | `['A','B','C'].includes(value)` |
| JSON array field (`importantLinks`) | `Array.isArray(value)`, each element has `label` (string) and `url` (http(s) URL) |

### What is NOT Validated (and why)

- HTML sanitization of `body` / `description` fields: these are rendered as plain text in React (React escapes HTML by default via JSX). There is no `dangerouslySetInnerHTML` anywhere.
- SQL injection: Prisma uses parameterized queries exclusively — raw SQL is never used.

---

## CORS Policy

No explicit CORS headers are set. Next.js API Route Handlers are same-origin by default — they are served from the same domain as the frontend. No cross-origin consumers exist.

If a future integration needs CORS (e.g., a mobile app), add `Access-Control-Allow-Origin: <specific-origin>` in the relevant route handler response — do not use `*`.

---

## Rate Limiting

No rate limiting is implemented. Rationale:
- The only unauthenticated write endpoint is `POST /api/help-requests`.
- The event runs for one day with ~100 known participants.
- Vercel's built-in DDoS protection covers volumetric attacks.
- Neon's free tier has request quotas that provide a natural ceiling.

If abuse of the help-request endpoint occurs during the event, the organiser can temporarily add a simple in-memory counter check or deploy a Vercel Edge Config-based flag to disable the endpoint.

---

## `NEXT_PUBLIC_ADMIN_SECRET` Exposure Risk

The `ADMIN_SECRET` is exposed to the browser via `NEXT_PUBLIC_ADMIN_SECRET` so that the admin and mentor pages can attach it to API fetch calls.

**Risk**: Anyone who opens DevTools on `/admin/*` or `/mentor/*` can read this value from the JS bundle.

**Mitigation**:
1. The admin and mentor pages are already protected by HTTP Basic Auth middleware — only users who know `ADMIN_PASS` or `MENTOR_PASS` can reach those pages.
2. The `ADMIN_SECRET` therefore adds no additional security beyond what the Basic Auth already provides — it is a secondary check, not a primary one.
3. For a one-day event with known participants, this risk is acceptable.

**If stronger separation is needed in future**: Move all admin API calls to Server Actions or Server Components that read `ADMIN_SECRET` from `process.env` (not `NEXT_PUBLIC_`) server-side. This would eliminate the client-side exposure entirely.

---

## iframe Sandboxing

Project cards embed team project URLs in `<iframe>` elements. The iframe must use the following sandbox attribute:

```html
<iframe
  src={iframeUrl}
  sandbox="allow-scripts allow-same-origin allow-forms"
  referrerpolicy="no-referrer"
/>
```

`allow-popups`, `allow-top-navigation`, and `allow-downloads` are excluded to prevent the embedded page from redirecting the parent or triggering downloads.

`iframeUrl` must start with `https://` — enforced in the API route handler.

---

## Secrets Management

All secrets are stored in environment variables. They are never:
- Committed to git (`.gitignore` must include `.env.local`)
- Logged (see `architecture/logging.md`)
- Rendered in HTML or JavaScript visible to users

Required env vars are documented in `architecture/env-vars.md`.

On Vercel: set all env vars in the Vercel project dashboard under Settings > Environment Variables. Use "Preview" and "Production" scopes — development uses `.env.local` only.

---

## `.gitignore` Entries Required

```
.env.local
.env.*.local
.next/
node_modules/
```

---

## Content Security Policy

No CSP header is configured. If one is added later, it must allow:
- `frame-src *` — because project iframes can point to any HTTPS URL
- `font-src fonts.gstatic.com` — if Google Fonts CDN is used at runtime (not needed if `next/font` self-hosts)
- `script-src 'self'` — Next.js client-side JS

Adding CSP is optional for a one-day event tool.

---

## Known Risks Summary

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `NEXT_PUBLIC_ADMIN_SECRET` visible in browser | Low (page already gated by Basic Auth) | Low (no sensitive user data) | Acceptable trade-off; document clearly |
| Participant spams help-request endpoint | Low | Low (queue gets messy, no data breach) | Manual intervention; future: rate limit |
| Malicious iframe from team submission | Low (admin enters URLs, not participants) | Medium (redirect or phishing) | `sandbox` attribute restricts iframe capabilities |
| WiFi password visible to all public page visitors | Medium (it's displayed on `/` by design) | Low (intended for participants) | Accepted by design — it's a participant-facing display |
| DB credentials leaked via Vercel env var misconfiguration | Very Low | High | Vercel encrypts env vars; do not log DB URL |
