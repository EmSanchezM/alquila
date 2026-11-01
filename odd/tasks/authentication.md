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
- A2: users that exist before this change have no `account` row and cannot sign in. Accepted: there are no real users in qa or production (L7).

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S1, S2, S8 | inline | done | RED: auth.test.ts failed (no `account` table). GREEN: 54/54. Migration 0002→0003 with an existing user keeps password, names, max_properties and properties; name backfilled. HTTP: HttpOnly cookie, untrusted origin 403, no CORS header for it. Independent verifier: no blockers (S1, S2, S8 PASS; 95-request regression diff vs 66abff0 clean). |
| T2 | S3, S4, S5, S6 | inline | done | `59efded` (S3–S5): RED 17 new failures + S4 body failures, GREEN 72/72. `3ceb715` (S6): RED 16 cross-user references accepted, GREEN 89/89. Independent verifier: no blockers (S3–S6 PASS; 267 isolation probes; 114-request same-user regression vs ae217db: 0 differences). |
| T3 | S7 | inline | done | `69d487f`. No client test runner; verified with a Playwright e2e against the real server (scratch, not committed): RED (no first/last name fields, fake guard), GREEN 15/15 in 3 consecutive runs. Server suite 89/89. |
| T4 | docs (README env vars, test database) | inline | done | README: Environment section and test database steps. |

Route evidence: tasks depend on each other in order (T2 needs T1's session, T3 needs T1's endpoints), so there is no parallel-writer reason; all inline.

## Log

- **L1 (2026-11-01, user):** "sí, apruebo el orden, empieza con autenticación"
- **L2 (2026-11-01, approved plan):** order 1) auth + isolation, 2) properties end to end, 3) other modules, 4) modules without API + documents, 5) i18n. Auth with better-auth, reusing the deleted `authentication` branch (`c831fec`) where it fits and designing the `users` migration so no data is lost.
- **L3 (2026-11-01):** `c831fec` rewrote `users` destructively (dropped password, first_name, last_name, subscription_*, max_properties). Not reused as-is; only its config shape (drizzle adapter, email/password, Google) is reused.
- **L4 (2026-11-01):** better-auth latest is 1.7.15, published today; pinned 1.7.10 (2026-10-15). Peer deps: drizzle-orm ^0.45.2, zod ^4.5.4 — both satisfied.
- **L5 (2026-11-01):** found during analysis: every `findAll` returns all users' rows; S5 fixes it.
- **Q1 (resolved 2026-11-01):** are there real users in qa/production? If so, their password hashes need a migration into `account` (format must be compatible with better-auth's scrypt) or a reset flow.
- **L7 (2026-11-01, user):** "no hay usuarios reales en qa ni producción". No hash migration or reset flow is needed; A2 only affects local test data. `users.password` stays as a nullable legacy column.
- **L6 (2026-11-01):** T1 done. Tests now run against a dedicated database: `.env.test.local` (git-ignored, loaded by `bun test`) sets `DATABASE_URL` to `alquila_test`, and `bunfig.toml` preloads `server/tests/setup.ts`, which applies all migrations. The generated `ADD COLUMN "name" text NOT NULL` would fail on existing rows; 0003 was edited to add it nullable, backfill `first_name || ' ' || last_name`, then set NOT NULL.
- **L8 (2026-11-01):** verifier advisories, not fixed in T1: (1) Google profiles without given_name/family_name store empty first/last name; (2) names over 100 chars return 422 from the DB instead of a validation error; (3) pre-existing: unknown userId in a create body returns 500 (S4 removes userId from bodies).
- **L9 (2026-11-01):** T1 merged as #13 (`ae217db`). T2 on a new branch `feat/auth-isolation` from `develop` to avoid squash history noise.
- **L10 (2026-11-01):** T2 design: `requireAuth` middleware on the `/api` router (`/api/auth/*` mounted before it, stays public); every repository method takes `userId`; `OwnershipGuard` (`server/src/shared/ownership.ts`) reuses each module's user-scoped `findById` for references, injected into 9 create/update use cases. References to deleted records are rejected too. The `api-errors` 500 test now forces a DB error with a 300-char property name (varchar(200)).
- **L11 (2026-11-01):** T2 verifier advisories, not fixed: (1) ownership check and insert are not in one transaction (a user's own record could be soft-deleted in between; no cross-user leak); (2) zod 400 responses echo the full issue list (pre-existing).
- **L12 (2026-11-01):** T2 merged as #14 (`1b8a690`). T3 on new branch `feat/auth-client`.
- **L13 (2026-11-01):** T3 findings fixed: (1) profile dropdown had no z-index; on /properties the search input covered it and swallowed clicks on Logout (`z-50` on both header dropdowns); (2) `router.invalidate()` while still on /auth/sign-in re-ran the /auth guard and could redirect to /dashboard instead of `?redirect=`; removed, navigating already re-runs the target guard. Sign-up limits names to 100 chars (fixes T1 advisory 2). Known: properties list still falls back to mock data when empty (phase 2).
- Next step: T3 PR. Then phase 2 (properties end to end).
