# Files, documents and automation (phase 4)

Objective: file storage for documents, property images, receipts and photos; the documents screens; then communications and payment automation, which have tables but no API.
Branch: one per unit from `develop` (`feat/file-storage`, …) · Delivery: one PR per unit, merged into `develop` before the next one is opened (same strategy the user chose for phase 3) · Tests: `bun run test:server` (Postgres `alquila_test` + Floci S3), `bun run test:client`; client verified with a scratch Playwright e2e.

## Specs

- **S1 — File storage.** User decision: S3-compatible storage, with Floci instead of MinIO for local development ("pero minio esta deprecado ya podemos usar otra alternativa como floci"). Assumptions: a `FileStorage` port with an S3 adapter on Bun's native `S3Client`, configured by `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`; Floci in development and tests, S3 or R2 in production without code changes. When storage is not configured, file endpoints answer `503` and the rest of the API keeps working.
- **S2 — Upload and download.** Assumptions: `POST /api/files` (multipart field `file`) stores a file under the signed-in user's prefix and returns its key, name, size, MIME type and URL; `GET /api/files/<key>` streams it back only to its owner (`404` otherwise). Images (JPEG, PNG, WebP) and PDF only (`415` otherwise), at most 10 MB (`413`).
- **S3 — Documents.** `/documents` lists, uploads, shows, edits and deletes documents linked to a property, renter or lease, using S1–S2 (today the page is a stub and `fileUrl` is a free string).
- **S4 — Property images.** Properties can have images (phase 2 left them out: "1, déjalas fuera por ahora"), shown in the list and the detail instead of the placeholder.
- **S5 — Receipts and photos.** Payments and expenses can attach a receipt; maintenance requests can attach photos.
- **S6 — Communications.** Pending scope decision (table `communications` and `communication_templates` exist, no API).
- **S7 — Payment automation.** Pending scope decision (table `payment_reminders` exists, no API).

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S1, S2 | inline | done | Branch `feat/file-storage`. `9d49fe6`: RED 8/9, GREEN 10/10, suite 195/195, real HTTP smoke (3 MB roundtrip, 12 MB → 413). Independent verifier (Risk item 2): S1 PASS, S2 PASS, no blockers, no regressions vs `bba81e0`. `7dc2897` fixes 4 advisories: RED 4 failing, GREEN 15/15, suite 200/200, rechecked over real HTTP. |
| T2 | S3 | inline | pending | |
| T3 | S4 | inline | pending | |
| T4 | S5 | inline | pending | |
| T5 | S6 | inline | pending (needs a scope decision) | |
| T6 | S7 | inline | pending (needs a scope decision) | |

Route evidence: T2–T4 depend on T1's storage; units are sequential and reviewed one PR at a time, so there is no parallel-writer reason.

## Log

- **L1 (2026-11-11, user):** "si" (start phase 4).
- **L2 (2026-11-11, user):** "pero minio esta deprecado ya podemos usar otra alternativa como floci". Verified: MinIO removed Community Edition management features (May 2025), stopped publishing Community images and binaries (Oct 2025), declared maintenance mode (Dec 2025) and archived the repository (2026). Floci (`floci/floci`, MIT) is a local AWS emulator with S3 on port 4566; it is for development and tests, not production storage.
- **L3 (2026-11-11):** probe: Bun 1.4.4 `S3Client` against Floci (container `alquila-floci`, host port 4568 to avoid priscilapp's 4566) — bucket creation through a plain `PUT /<bucket>`, write, read, stat, list, presigned GET and delete all work. No new dependency needed.
- **L4 (2026-11-11):** T1 design. Module `server/src/modules/files` (port `FileStorage`, adapter `S3FileStorage`, use cases `UploadFileUseCase` / `DownloadFileUseCase`, `createFileRouter(storage)`). Keys are `<userId>/<uuidv7>.<ext>`; download accepts only that format and the caller's prefix (`404` otherwise). `S3_*` are optional; the test preload points them at Floci with bucket `alquila-test`. `server/.env.example` cannot be read in this session, so the variables are documented in the README only.
- **L5 (2026-11-11):** independent verifier (Risk item 2): no blockers. Advisories fixed in `7dc2897`: (1) Bun derives `File.type` from the file name and ignores the declared part type → the type now comes from the leading bytes (JPEG, PNG, WebP, PDF signatures), so renamed files are rejected and extensionless images accepted; (2) malformed multipart answered 500 → 400; (3) multipart uploads skip the CORS preflight and the session cookie is `SameSite=Lax` → `csrf({ origin: trustedOrigins })` on the upload (403); (4) test gaps → endpoint-level 503 through `createFileRouter(null)` and a traversal test that targets another user's real key. Not fixed (advisories): no `Content-Disposition`; Bun drops `content-length` on the streamed download; UUIDv7 keys are time-ordered (only matters if keys ever become public or presigned URLs); the CSRF 403 body is plain text "Forbidden", not the JSON error shape.
