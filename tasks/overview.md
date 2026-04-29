# CodeDay London — Task Overview

All tasks must be completed in order. Later tasks depend on earlier ones.

## Status Key
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Task List

| # | File | Title | Status |
|---|---|---|---|
| 01 | [01-project-scaffolding.md](01-project-scaffolding.md) | Project Scaffolding | [ ] |
| 02 | [02-database-schema.md](02-database-schema.md) | Prisma Schema + Seed | [ ] |
| 03 | [03-core-lib.md](03-core-lib.md) | Core Library & Middleware | [ ] |
| 04 | [04-api-schedule.md](04-api-schedule.md) | API: /api/schedule | [ ] |
| 05 | [05-api-news.md](05-api-news.md) | API: /api/news | [ ] |
| 06 | [06-api-resources.md](06-api-resources.md) | API: /api/resources | [ ] |
| 07 | [07-api-projects.md](07-api-projects.md) | API: /api/projects | [ ] |
| 08 | [08-api-help-requests.md](08-api-help-requests.md) | API: /api/help-requests | [ ] |
| 09 | [09-api-config.md](09-api-config.md) | API: /api/config | [ ] |
| 10 | [10-globals-and-tailwind.md](10-globals-and-tailwind.md) | globals.css + Tailwind Config | [ ] |
| 11 | [11-ui-primitives.md](11-ui-primitives.md) | UI Primitive Components | [ ] |
| 12 | [12-public-pages.md](12-public-pages.md) | Public Pages | [ ] |
| 13 | [13-admin-pages.md](13-admin-pages.md) | Admin Pages | [ ] |
| 14 | [14-mentor-page.md](14-mentor-page.md) | Mentor Page | [ ] |

---

## Dependency Order

```
01 (scaffolding)
  └── 02 (database)
        └── 03 (core lib + middleware)
              ├── 04 (api/schedule)
              ├── 05 (api/news)
              ├── 06 (api/resources)
              ├── 07 (api/projects)
              ├── 08 (api/help-requests)
              └── 09 (api/config)
                    └── 10 (globals + tailwind)
                          └── 11 (ui primitives)
                                ├── 12 (public pages)
                                ├── 13 (admin pages)
                                └── 14 (mentor page)
```
