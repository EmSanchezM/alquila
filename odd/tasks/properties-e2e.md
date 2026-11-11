# Properties end to end (phase 2)

Objective: the properties screens use the real API for list, detail, create, edit and delete, with no mock data.
Branch: `feat/properties-e2e` from `develop` · Delivery: ask-on-risk; one PR into `develop` (forecast ~600 authored lines, ask before slicing) · Tests: `bun run test:server` (bun test + Postgres); client verified with a scratch Playwright e2e (no client test runner).

## Specs

- **S1 — List.** `/properties` lists the signed-in user's properties from `GET /api/properties`. No mock fallback; loading, error and empty states are real. Search by name/address stays. Assumption: status, monthly rent and tenant come from leases (phase 3), so they are not shown.
- **S2 — Detail.** `/properties/$propertyId` shows the property from `GET /api/properties/:id`; a missing or another user's property shows a not-found state.
- **S3 — Create.** `/properties/create` has a working form (react-hook-form + zod) that posts to `POST /api/properties`, then opens the new property and refreshes the list. The fake "Add Property" dialog on the list is removed; its buttons go to `/properties/create`.
- **S4 — Edit.** `/properties/$propertyId/edit` reuses the create form, prefilled, and sends `PUT /api/properties/:id`.
- **S5 — Delete.** Deleting from the detail page asks for confirmation, sends `DELETE /api/properties/:id`, and returns to the list.
- **S6 — Images.** User decision: "1, déjalas fuera por ahora". No image upload or URL input; cards and detail show the placeholder image. Upload arrives with documents storage (phase 4).
- **S7 — Server validation matches the table.** Assumption (needed for S3/S4): create and update bodies accept the columns that are nullable in `properties` (`state`, `zipCode`, `bedrooms`, `bathrooms`, `squareMeters`, `description`) as optional, enforce the varchar limits, and reject negative counts and sizes with `400`, instead of failing in Postgres.

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S7 | inline | pending | |
| T2 | S1, S2, S6 | inline | pending | |
| T3 | S3, S4 | inline | pending | |
| T4 | S5 | inline | pending | |

Route evidence: T2–T4 share the properties service and form files, and T3 depends on T1's schema, so there is no parallel-writer reason; all inline.

## Log

- **L1 (2026-11-11, user):** "empieza con la fase 2, propiedades de punta a punta"
- **L2 (2026-11-11, user):** "1, déjalas fuera por ahora" (images: out of scope for now, placeholder only).
- **L3 (2026-11-11):** analysis. Server CRUD and user isolation already exist (phase 1). Client: list falls back to 3 mock properties, detail route is a fake loader, create form is disabled behind a "Zod version compatibility" TODO that looks stale (client, shared and server all on zod ^4.6.7, @hookform/resolvers 7 supports zod 4), no edit or delete. Server create schema requires `state`, `zipCode`, `description`, `bedrooms`, `bathrooms`, `squareMeters` although the columns are nullable, and has no length limits. `shared` property schemas still carry `userId` (stale since phase 1 S4).
- **L4 (2026-11-11):** environment: `node_modules` lacked better-auth (fixed with `bun install --frozen-lockfile`, no lockfile change); Colima and `alquila-pg` were stopped (started); `.env.test.local` is missing, so `bun test` hit the dev database and failed in the migration preload (42P07). `alquila_test` exists.
