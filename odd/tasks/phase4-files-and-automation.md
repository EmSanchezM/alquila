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
| T1 | S1, S2 | inline | in progress | |
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
