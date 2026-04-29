# Data Models

## Prisma Schema

Place this file at `prisma/schema.prisma`.

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

// ---------------------------------------------------------------------------
// ScheduleItem
// ---------------------------------------------------------------------------
model ScheduleItem {
  id          String    @id @default(cuid())
  title       String    @db.VarChar(200)
  description String?   @db.Text
  location    String?   @db.VarChar(200)
  startsAt    DateTime
  endsAt      DateTime?
  createdAt   DateTime  @default(now())

  @@index([startsAt])
}

// ---------------------------------------------------------------------------
// NewsPost
// ---------------------------------------------------------------------------
enum NewsPostType {
  NEWS
  ANNOUNCEMENT
}

model NewsPost {
  id        String       @id @default(cuid())
  headline  String       @db.VarChar(300)
  body      String       @db.Text
  imageUrl  String?      @db.VarChar(2048)
  type      NewsPostType @default(NEWS)
  pinned    Boolean      @default(false)
  createdAt DateTime     @default(now())

  @@index([pinned, createdAt])
}

// ---------------------------------------------------------------------------
// ResourceLink
// ---------------------------------------------------------------------------
model ResourceLink {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(200)
  url         String   @db.VarChar(2048)
  description String?  @db.Text
  category    String   @db.VarChar(50)
  createdAt   DateTime @default(now())

  @@index([category])
}

// ---------------------------------------------------------------------------
// HelpRequest
// ---------------------------------------------------------------------------
enum HelpRequestStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
}

model HelpRequest {
  id         String            @id @default(cuid())
  teamName   String            @db.VarChar(200)
  status     HelpRequestStatus @default(PENDING)
  claimedBy  String?           @db.VarChar(200)
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  @@index([status, createdAt])
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------
model Project {
  id          String   @id @default(cuid())
  teamName    String   @db.VarChar(200)
  projectName String   @db.VarChar(200)
  description String?  @db.Text
  iframeUrl   String   @db.VarChar(2048)
  createdAt   DateTime @default(now())

  @@unique([teamName])
}

// ---------------------------------------------------------------------------
// EventConfig (singleton — always id = "1")
// ---------------------------------------------------------------------------
model EventConfig {
  id                 String   @id @default("1")
  eventName          String   @db.VarChar(200)
  submissionDeadline DateTime
  wifiSsid           String?  @db.VarChar(200)
  wifiPassword       String?  @db.VarChar(200)
  discordUrl         String?  @db.VarChar(2048)
  importantLinks     Json     @default("[]")
  updatedAt          DateTime @updatedAt
}
```

---

## Field-by-Field Descriptions & Validation Constraints

### ScheduleItem

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (cuid) | PK, auto-generated | Never exposed to users for editing |
| title | String | Required, max 200 chars | Displayed as the event name in the schedule |
| description | String? | Optional, free text | Shown as sub-copy under the title |
| location | String? | Optional, max 200 chars | Room or area name, e.g. "Main Hall" |
| startsAt | DateTime | Required | ISO 8601 UTC stored; display in local timezone on client |
| endsAt | DateTime? | Optional; must be > startsAt if provided | Null means open-ended / no fixed end |
| createdAt | DateTime | Auto, set on insert | Not editable |

Application-level validation (in API route handler before Prisma call):
- `startsAt` must be a valid ISO 8601 string parseable by `new Date()`.
- If `endsAt` is provided, `new Date(endsAt) > new Date(startsAt)` must be true.
- `title` must not be empty after trimming.

### NewsPost

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (cuid) | PK, auto-generated | |
| headline | String | Required, max 300 chars | Rendered as torn-paper card headline |
| body | String | Required, min 1 char | Plain text; no HTML stored |
| imageUrl | String? | Optional, max 2048 chars, must be valid URL | External URL only; rendered with `.dither` CSS class |
| type | NewsPostType enum | Required, default NEWS | ANNOUNCEMENT cards get yellow `secondary-fixed` background |
| pinned | Boolean | Default false | Pinned posts appear at top of `/news` and on homepage |
| createdAt | DateTime | Auto | Used for chronological sort descending |

Application-level validation:
- `imageUrl` if provided must match `^https?://` pattern.
- `headline` must not be empty after trimming.

### ResourceLink

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (cuid) | PK, auto-generated | |
| title | String | Required, max 200 chars | Link display text |
| url | String | Required, max 2048 chars, must start with http(s) | |
| description | String? | Optional | Sub-text under the link |
| category | String | Required, max 50 chars | Free-form category used for grouping on the page; suggest "TOOLS", "DOCS", "DESIGN", "PRIZES", "OTHER" |
| createdAt | DateTime | Auto | |

Application-level validation:
- `url` must match `^https?://`.
- `category` must not be empty after trimming.

### HelpRequest

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (cuid) | PK, auto-generated | |
| teamName | String | Required, max 200 chars | Entered by participant on `/help` page |
| status | HelpRequestStatus enum | Default PENDING | Valid transitions: PENDING -> IN_PROGRESS -> RESOLVED |
| claimedBy | String? | Optional, max 200 chars | Mentor sets their own name when claiming |
| createdAt | DateTime | Auto | |
| updatedAt | DateTime | Auto, updated on every write | |

Application-level validation:
- `teamName` must not be empty after trimming.
- On PATCH, `status` must be one of `PENDING`, `IN_PROGRESS`, `RESOLVED`.
- If `status` is set to `IN_PROGRESS`, `claimedBy` must also be provided and non-empty.

### Project

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (cuid) | PK, auto-generated | |
| teamName | String | Required, max 200 chars, unique | One project per team |
| projectName | String | Required, max 200 chars | Display name of the project |
| description | String? | Optional | Shown as card body text |
| iframeUrl | String | Required, max 2048 chars, must be https | URL embedded in an `<iframe>` on the project wall |
| createdAt | DateTime | Auto | |

Application-level validation:
- `iframeUrl` must match `^https://` (no plain http for security).
- `teamName` uniqueness is enforced at DB level; API returns 409 Conflict on duplicate.

### EventConfig (Singleton)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String | Always "1"; set by seed | upsert on id="1" in all mutations |
| eventName | String | Required, max 200 chars | Shown in page title and home hero |
| submissionDeadline | DateTime | Required | Drives the countdown timer on homepage |
| wifiSsid | String? | Optional, max 200 chars | Displayed in a "WiFi" info card |
| wifiPassword | String? | Optional, max 200 chars | Displayed alongside SSID |
| discordUrl | String? | Optional, max 2048 chars | Link to Discord server invite |
| importantLinks | Json | Array of `{label: string, url: string}` objects; default `[]` | Rendered as a list of quick-access links on homepage |
| updatedAt | DateTime | Auto | |

Application-level validation for `importantLinks`:
- Must be a JSON array.
- Each element must have a non-empty `label` (string) and a `url` starting with `http(s)://`.
- Maximum 10 items in the array.

---

## Seed File

`prisma/seed.ts` — creates the singleton EventConfig row so the app never starts without it.

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.eventConfig.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      eventName: 'CodeDay London',
      submissionDeadline: new Date('2025-01-01T16:00:00Z'), // placeholder — update via /admin/config
      importantLinks: [],
    },
  })
  console.log('Seed complete: EventConfig singleton created')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```
