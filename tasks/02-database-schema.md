# Task 02 — Prisma Schema + Seed

## Goal
Set up the Prisma schema with all 6 data models, run the initial migration against Neon Postgres, and seed the EventConfig singleton. At the end of this task, all tables exist in the database and `prisma studio` can browse them.

## Prerequisites
- Task 01 complete (`npm install` has run)
- A Neon Postgres database created with connection strings available
- `.env.local` file created from `.env.example` with real `DATABASE_URL` and `DIRECT_DATABASE_URL`

---

## Files to Create

### `prisma/schema.prisma`

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

model ResourceLink {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(200)
  url         String   @db.VarChar(2048)
  description String?  @db.Text
  category    String   @db.VarChar(50)
  createdAt   DateTime @default(now())

  @@index([category])
}

enum HelpRequestStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
}

model HelpRequest {
  id        String            @id @default(cuid())
  teamName  String            @db.VarChar(200)
  status    HelpRequestStatus @default(PENDING)
  claimedBy String?           @db.VarChar(200)
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  @@index([status, createdAt])
}

model Project {
  id          String   @id @default(cuid())
  teamName    String   @db.VarChar(200)
  projectName String   @db.VarChar(200)
  description String?  @db.Text
  iframeUrl   String   @db.VarChar(2048)
  createdAt   DateTime @default(now())

  @@unique([teamName])
}

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

### `prisma/seed.ts`

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
      submissionDeadline: new Date('2025-06-01T16:00:00Z'),
      importantLinks: [],
    },
  })
  console.log('Seed complete: EventConfig singleton created')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

---

## Steps to Execute

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to the database (creates all tables)
npx prisma db push

# 3. Run the seed script
npm run prisma:seed
```

For production use `prisma migrate dev` to create a tracked migration:
```bash
npx prisma migrate dev --name init
```

---

## Acceptance Criteria

- [ ] `prisma/schema.prisma` exists with all 6 models and 3 enums
- [ ] `npx prisma generate` completes without errors
- [ ] `npx prisma db push` (or `migrate dev`) creates all tables in Neon without errors
- [ ] `npm run prisma:seed` prints "Seed complete: EventConfig singleton created"
- [ ] All 6 tables are visible in `npx prisma studio`
- [ ] The `EventConfig` table has exactly 1 row with `id = "1"`

---

## Tests

### Verify Tables Exist via Prisma Studio
```bash
npx prisma studio
# Opens http://localhost:5555
# Verify these models are listed: ScheduleItem, NewsPost, ResourceLink,
# HelpRequest, Project, EventConfig
# Click EventConfig — should see 1 row with id="1", eventName="CodeDay London"
```

### Verify Schema via Direct Query
```bash
npx prisma db execute --stdin <<'EOF'
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
EOF
# Expected output includes:
# EventConfig, HelpRequest, NewsPost, Project, ResourceLink, ScheduleItem
```

### Verify Enum Types
```bash
npx prisma db execute --stdin <<'EOF'
SELECT typname FROM pg_type
WHERE typcategory = 'E'
ORDER BY typname;
EOF
# Expected: HelpRequestStatus, NewsPostType
```

### Verify Seed is Idempotent
```bash
# Run seed twice — should not error or create duplicate rows
npm run prisma:seed
npm run prisma:seed
npx prisma db execute --stdin <<'EOF'
SELECT COUNT(*) FROM "EventConfig";
EOF
# Expected: count = 1
```

### Verify Unique Constraint on Project.teamName
```bash
npx prisma db execute --stdin <<'EOF'
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'Project' AND indexname LIKE '%teamName%';
EOF
# Expected: unique index on teamName exists
```
