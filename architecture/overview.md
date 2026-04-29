# CodeDay London — System Overview

## Project Description

CodeDay London is a real-time event-day web application built for a single hackathon. It serves 50–100 participants throughout the day, giving them live visibility into the schedule, news, resources, and project submissions. A small organiser team manages all content via a password-protected admin dashboard. Mentors handle a silent help-request queue through a separate protected portal. The entire application is a single Next.js 14 deployment on Vercel backed by a serverless Neon Postgres database.

## Who It Is For

- **Participants (public)** — Read-only access. See the current schedule, announcements, resource links, and each team's project iframe. Can submit a help request anonymously by entering their team name.
- **Organisers (admin)** — Full CRUD over all content models plus event config (submission deadline, WiFi credentials, Discord URL, important links).
- **Mentors** — View the live help-request queue, claim a request (mark IN_PROGRESS), and resolve it.

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Combines API routes and SSR pages in one deploy unit; no separate backend service needed |
| ORM | Prisma + Neon Postgres | Edge-compatible Prisma driver; Neon's serverless HTTP transport avoids connection exhaustion on Vercel's ephemeral functions |
| Auth | HTTP Basic Auth via Next.js Middleware | Simplest possible protection for a one-time event; no user table, no sessions, no JWT library needed |
| Real-time | 30-second client-side polling | Fits the event scale (50–100 users); avoids WebSocket/SSE infrastructure complexity entirely |
| Styling | Tailwind CSS with custom design tokens | All design-system tokens (colors, fonts, shadows) are encoded in `tailwind.config.ts` — no CSS-in-JS runtime |
| Deployment | Vercel | Zero-config Next.js deployment; environment variables managed in Vercel dashboard; serverless functions match usage pattern |

## Deployment Notes

- **Platform**: Vercel (hobby or pro tier).
- **Database**: Neon Postgres — use the `@prisma/adapter-neon` edge adapter and `@neondatabase/serverless` driver so all Prisma calls work inside Vercel Edge/Serverless Functions.
- **Migrations**: Run `prisma migrate deploy` as a Vercel build command or via CI before first deploy.
- **Seed**: `prisma/seed.ts` creates the singleton `EventConfig` row (id = 1) so `GET /api/config` never returns null on a fresh database.
- **No Docker**: Vercel deployment is the target. Local development uses `next dev` with a `.env.local` file containing a direct Neon connection string. Docker is intentionally omitted — the Vercel/Neon combination already handles environment parity.
- **One-time event**: There is no multi-tenancy. All data belongs to a single event. The database can be wiped and re-seeded for future events.

## Scale Assumptions

- 50–100 concurrent public users.
- Polling at 30-second intervals means at peak ~3–4 requests/second across all polling endpoints. This is well within Neon's and Vercel's free-tier limits.
- Admin and mentor users are 2–10 people total; no concurrency concerns.
- No image uploads — `imageUrl` on `NewsPost` accepts an external URL only.
