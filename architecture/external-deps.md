# External Dependencies

## Third-Party Services

### Neon Postgres

| Property | Value |
|---|---|
| Type | Serverless Postgres database |
| URL | https://neon.tech |
| Usage | Primary data store for all application models |
| Connection method | `@neondatabase/serverless` HTTP driver + `@prisma/adapter-neon` |
| Tier required | Free tier is sufficient for event scale |
| Fallback | If Neon is unreachable, all API routes return 500. There is no local fallback. Mitigation: Neon's 99.95% SLA covers the ~12 hour event window. |

Setup steps:
1. Create a Neon project at https://neon.tech
2. Create a database named `neondb` (default)
3. Copy the connection string from the Neon dashboard
4. Set `DATABASE_URL` and `DIRECT_DATABASE_URL` in Vercel env vars
5. Run `npx prisma migrate deploy` as part of the Vercel build command

### Vercel

| Property | Value |
|---|---|
| Type | Serverless hosting + CDN |
| URL | https://vercel.com |
| Usage | Hosts the Next.js application; serves static assets; runs serverless API route functions |
| Tier required | Hobby tier is sufficient; Pro tier if >100 serverless function invocations/second are expected (unlikely) |
| Fallback | No fallback. Vercel is the deployment target. |

### Google Fonts (via `next/font/google`)

| Property | Value |
|---|---|
| Type | Font delivery |
| Fonts used | `Epilogue` (weights 400, 700, 800, 900) and `Space Grotesk` (weights 400, 500, 700) |
| Usage | `next/font/google` fetches and self-hosts fonts at **build time** — no runtime request to Google Fonts CDN |
| Fallback | If the build-time font fetch fails (network issue during `vercel build`), the build fails. Retry the deployment. At runtime there is no Google dependency — fonts are already bundled. |

---

## No Other External Services

This application has no external API integrations. Specifically:
- No email service (no notifications are sent)
- No image hosting (imageUrl in NewsPost is an external URL entered by admins — no upload pipeline)
- No analytics
- No error monitoring (Vercel's built-in function logs are sufficient)
- No push notifications
- No payment processing

---

## Package Registry

npm (https://registry.npmjs.org). No private registry, no local packages.

---

## Potential Future External Deps (not in scope now)

| Service | Use Case | When to Add |
|---|---|---|
| Resend / Postmark | Email notifications to mentors for new help requests | If mentor response time becomes an issue |
| Cloudflare Images / Uploadthing | Image upload for NewsPost | If organizers want to upload images rather than paste URLs |
| Sentry | Error tracking beyond Vercel logs | For multi-day or recurring events |
| Pusher / Ably | Real-time WebSocket updates | If 30-second polling latency is unacceptable |
