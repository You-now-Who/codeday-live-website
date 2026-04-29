# Environment Variables

## Full Reference Table

| Variable | Purpose | Example Value | Required | Exposed to Browser |
|---|---|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string via HTTP/WebSocket transport (used by Prisma + Neon serverless driver) | `postgresql://user:pass@ep-cool-name.eu-west-2.aws.neon.tech/neondb?sslmode=require` | Yes | No |
| `DIRECT_DATABASE_URL` | Direct (non-pooled) Neon connection string — used by Prisma CLI for migrations | `postgresql://user:pass@ep-cool-name.eu-west-2.aws.neon.tech/neondb?sslmode=require` | Yes (for migrations) | No |
| `ADMIN_USER` | Username for HTTP Basic Auth on `/admin/*` routes | `codeday-admin` | Yes | No |
| `ADMIN_PASS` | Password for HTTP Basic Auth on `/admin/*` routes | `s3cur3P@ss!` | Yes | No |
| `MENTOR_USER` | Username for HTTP Basic Auth on `/mentor/*` routes | `codeday-mentor` | Yes | No |
| `MENTOR_PASS` | Password for HTTP Basic Auth on `/mentor/*` routes | `m3nt0rP@ss!` | Yes | No |
| `ADMIN_SECRET` | Shared API key checked via `x-admin-key` header on all mutating API routes and `GET /api/help-requests` | `a7f2c9e1b3d8f4a0c6e2b5d9f1c3e7b0` | Yes | No (server-only) |
| `NEXT_PUBLIC_ADMIN_SECRET` | Same value as `ADMIN_SECRET` — exposed to browser for admin/mentor client-side fetch calls. See security note in `architecture/security.md`. | `a7f2c9e1b3d8f4a0c6e2b5d9f1c3e7b0` | Yes | Yes |

---

## Notes

### `DATABASE_URL` vs `DIRECT_DATABASE_URL`

Both point to the same Neon database. The distinction is required by Prisma's Neon adapter:

- `DATABASE_URL`: Used at **runtime** by the Prisma client via the Neon serverless HTTP driver. This is the pooled or direct HTTP endpoint Neon provides.
- `DIRECT_DATABASE_URL`: Used by the **Prisma CLI** (`prisma migrate deploy`, `prisma db push`, `prisma studio`) which requires a direct TCP connection. In Neon, this is the same connection string but routed differently.

In practice for Neon, both values are often identical. Verify in the Neon dashboard: copy the connection string shown for your branch.

### `ADMIN_SECRET` and `NEXT_PUBLIC_ADMIN_SECRET`

These must have the **same value**. They are two separate env var entries because:
- `ADMIN_SECRET` is server-only (read by API route handlers via `process.env.ADMIN_SECRET`)
- `NEXT_PUBLIC_ADMIN_SECRET` is bundled into client JS (read by admin/mentor pages via `process.env.NEXT_PUBLIC_ADMIN_SECRET`)

Generate the value with: `openssl rand -hex 32`

### Setting Values in Vercel

1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add each variable with scope "Production" and "Preview"
3. For local development, copy `.env.example` to `.env.local` and fill in real values
4. Never commit `.env.local` — it is in `.gitignore`

---

## `.env.example` (commit this file)

```bash
# Neon Postgres — get connection strings from the Neon dashboard
DATABASE_URL=postgresql://user:pass@ep-example.eu-west-2.aws.neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://user:pass@ep-example.eu-west-2.aws.neon.tech/neondb?sslmode=require

# HTTP Basic Auth credentials — set before the event, share with team
ADMIN_USER=your-admin-username
ADMIN_PASS=your-admin-password
MENTOR_USER=your-mentor-username
MENTOR_PASS=your-mentor-password

# API secret — generate with: openssl rand -hex 32
# Both variables must have the SAME value
ADMIN_SECRET=replace-with-32-byte-hex-string
NEXT_PUBLIC_ADMIN_SECRET=replace-with-32-byte-hex-string
```
