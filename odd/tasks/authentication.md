# Authentication and per-user data isolation (issue 06, phase 1)

Objective: real login with better-auth and every API query scoped to the signed-in user.
Branch: `feat/authentication` (worktree `~/Desktop/projects/alquila-worktrees/feat-authentication`) · Delivery: one PR per task, each merged into `develop` before the next one is opened (no stacked PRs) · Tests: `bun run test:server` (bun test + Postgres).

## Specs

- **S1 — Server auth.** better-auth `1.7.10` on the server: email/password sign up, sign in and sign out, plus Google sign in; session in an HTTP-only cookie; handler mounted at `/api/auth/*`.
- **S2 — `users` migration without data loss.** better-auth uses the existing `users` table (`modelName: "users"`). Additive migration: `name`, `email_verified`, `image` on `users`; new `session`, `account`, `verification` tables. `password` becomes nullable and is **kept** (better-auth stores credential hashes in `account.password`). `first_name` / `last_name` stay required and are sign-up fields (`additionalFields`); Google fills them from `given_name` / `family_name`. IDs use the existing `generateUuid()` (UUIDv7, 36 chars).
- **S3 — Protected API.** Every `/api/*` route except `/api/auth/*` answers `401` without a valid session.
- **S4 — `userId` from the session.** `userId` is removed from create and update bodies; the server takes it from the session.
- **S5 — Isolation.** List, get, update and delete only see the signed-in user's records; another user's record answers `404`.
- **S6 — Cross-user references.** `propertyId`, `renterId` and `leaseId` in a body must belong to the signed-in user, otherwise `404 "<Entity> not found"`.
- **S7 — Client.** better-auth React client; `_authenticated` guard redirects to `/auth/sign-in` without a session; sign-in and sign-up forms with react-hook-form + zod; Google button; logout in the header; header shows the user.
- **S8 — CORS.** `credentials: true` with explicit trusted origins (`BETTER_AUTH_URL`, plus optional `TRUSTED_ORIGINS`), not `*`.

Assumptions (not asked explicitly):
- A1: email verification is not required to sign in.
- A2: users that exist before this change have no `account` row and cannot sign in until they reset or are migrated (open question Q1).

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S1, S2, S8 | inline | done | RED: auth.test.ts failed (no `account` table). GREEN: 54/54. Migration 0002→0003 with an existing user keeps password, names, max_properties and properties; name backfilled. HTTP: HttpOnly cookie, untrusted origin 403, no CORS header for it. |
| T2 | S3, S4, S5, S6 | inline | pending | |
| T3 | S7 | inline | pending | |
| T4 | docs (README env vars, test database) | inline | pending | |

Route evidence: tasks depend on each other in order (T2 needs T1's session, T3 needs T1's endpoints), so there is no parallel-writer reason; all inline.

## Log

- **L1 (2026-11-01, user):** "sí, apruebo el orden, empieza con autenticación"
- **L2 (2026-11-01, approved plan):** order 1) auth + isolation, 2) properties end to end, 3) other modules, 4) modules without API + documents, 5) i18n. Auth with better-auth, reusing the deleted `authentication` branch (`c831fec`) where it fits and designing the `users` migration so no data is lost.
- **L3 (2026-11-01):** `c831fec` rewrote `users` destructively (dropped password, first_name, last_name, subscription_*, max_properties). Not reused as-is; only its config shape (drizzle adapter, email/password, Google) is reused.
- **L4 (2026-11-01):** better-auth latest is 1.7.15, published today; pinned 1.7.10 (2026-10-15). Peer deps: drizzle-orm ^0.45.2, zod ^4.5.4 — both satisfied.
- **L5 (2026-11-01):** found during analysis: every `findAll` returns all users' rows; S5 fixes it.
- **Q1 (open):** are there real users in qa/production? If so, their password hashes need a migration into `account` (format must be compatible with better-auth's scrypt) or a reset flow.
- **L6 (2026-11-01):** T1 done. Tests now run against a dedicated database: `.env.test.local` (git-ignored, loaded by `bun test`) sets `DATABASE_URL` to `alquila_test`, and `bunfig.toml` preloads `server/tests/setup.ts`, which applies all migrations. The generated `ADD COLUMN "name" text NOT NULL` would fail on existing rows; 0003 was edited to add it nullable, backfill `first_name || ' ' || last_name`, then set NOT NULL.
- Next step: T2.
