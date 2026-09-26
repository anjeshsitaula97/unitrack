---
kind: external_dependency
name: Prisma ORM (SQLite)
slug: prisma
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - prisma/schema.prisma
    - src/lib/db.ts
    - package.json
---

Prisma is used as the ORM with a SQLite database for development and seed data. The Prisma client is instantiated in src/lib/db.ts and shared across the app via a global singleton pattern. The schema in prisma/schema.prisma defines all domain models (User, Student, Application, University, Course, HR modules, etc.) and uses provider sqlite with DATABASE_URL from environment. Seed scripts under prisma/ (seed-universities.ts, seed-roles.ts, seed-notifications.ts, seed-activities.ts) populate initial data.