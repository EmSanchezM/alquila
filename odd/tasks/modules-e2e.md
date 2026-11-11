# Other modules end to end (phase 3)

Objective: renters, leases, payments, maintenance requests, expenses and the dashboard use the real API, with no mock data, following the phase 2 properties pattern.
Branch: one per unit from `develop` (`feat/renters-e2e`, `feat/leases-e2e`, …) · Delivery: one PR per module, each merged into `develop` before the next one is opened (user decision L4; forecast ~3,500 authored lines) · Tests: `bun run test:server` (bun test + Postgres `alquila_test`); client verified with a scratch Playwright e2e (no client test runner).

## Specs

- **S1 — Server validation per module.** Assumption (same rule as phase 2 S7): create/update bodies of renters, leases, payments, maintenance requests and expenses accept nullable columns as optional and `null`, enforce varchar limits, use enums for status-like columns with the database values, validate dates, and answer `400` instead of failing in Postgres.
- **S2 — Related names in lists.** Assumption: list and detail responses add the names the screens need (property name, renter name) from the server, as extra fields; existing fields are unchanged.
- **S3 — Renters.** `/renters` list, detail, create, edit and delete with the real API; no mock data. Fields the API cannot provide are not shown.
- **S4 — Leases.** User decision: "1, pantallas propias con entrada en el menú". `/leases` list, detail, create, edit and delete, with a "Leases" entry in the header menu.
- **S5 — Payments.** `/payments` list, detail, create, edit and delete with the real API.
- **S6 — Maintenance requests.** `/maintenance` list, detail, create, edit and delete with the real API.
- **S7 — Expenses.** User decision (same answer as S4): `/expenses` list, detail, create, edit and delete, with an "Expenses" entry in the header menu.
- **S8 — Nested sections.** User decision (option 1 included it): the property detail shows its leases and expenses; the renter detail shows its leases.
- **S9 — Dashboard.** Stats, recent payments and maintenance come from the API; quick actions link to the create pages.
- **S10 — Enum values.** Assumption: the UI only offers values the server accepts (drops `card` and `appliances`, adds `partial` and `closed` to the filters).

Out of scope (phase 4 per L2 of `authentication.md`): documents, communications, payment automation, file upload. Delete rules stay as they are.

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S1, S2, S3 (renters) | inline | pending | |
| T2 | S1, S2, S4 (leases + menu) | inline | pending | |
| T3 | S1, S2, S5, S10 (payments) | inline | pending | |
| T4 | S1, S2, S6, S10 (maintenance) | inline | pending | |
| T5 | S1, S2, S7 (expenses + menu) | inline | pending | |
| T6 | S8 | inline | pending | |
| T7 | S9 | inline | pending | |

Route evidence: each module unit reuses the phase 2 pattern and T2–T7 depend on earlier units (lease pickers need renters, nested sections need leases and expenses, dashboard needs all), so units are sequential; no parallel-writer reason. Re-evaluate the context backstop between units.

## Log

- **L1 (2026-11-11, user):** "sí, empieza con la fase 3. borra la rama en local feat/properties-e2e"
- **L2 (2026-11-11, user):** "1, pantallas propias con entrada en el menú" (leases and expenses get their own screens and menu entries, plus sections in property and renter details).
- **L3 (2026-11-11):** explorer map. All six modules have server CRUD (`GET/POST /`, `GET/PUT/DELETE /:id`, soft delete, `OwnershipGuard` 404 on foreign references). Zod schemas: every create field required even for nullable columns, no `.max()`, enums as free strings, money `z.number().transform(String)`, dates `z.string()` (maintenance `z.coerce.date()`). Lists return IDs only. Client: renters, payments, maintenance and dashboard are mock-only; leases and expenses have no screen; only menu is `client/src/components/shared/header.tsx`. Renters delete answers 409 with active leases; leases, payments, maintenance and expenses have no delete rules.
- **L4 (2026-11-11, user):** "1, un PR por módulo" (one PR per module, merged into `develop` before the next).
