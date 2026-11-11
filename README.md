# Alquila
Plataforma sass para la gestión de alquileres

## Project Structure
```
.
├── client/               # React frontend
├── server/               # Hono backend
├── shared/               # Shared TypeScript definitions
│   └── src/types/        # Type definitions used by both client and server
└── package.json          # Root package.json with workspaces
```

### Environment

The server reads these variables (see `server/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | yes | `development`, `test`, `qa` or `production` |
| `PORT` | no | Server port (default `3000`) |
| `DATABASE_URL` | yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | yes | Secret used to sign sessions |
| `BETTER_AUTH_URL` | yes | Public URL of the server, e.g. `http://localhost:3000` |
| `TRUSTED_ORIGINS` | no | Extra comma-separated origins allowed to send credentialed requests, e.g. `http://localhost:5173` for the Vite dev server |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | yes | Google OAuth credentials for "Login with Google" |
| `S3_BUCKET` | no | Bucket for uploaded files. Without it, `/api/files` answers `503` and the rest of the API works |
| `S3_ENDPOINT` | no | S3-compatible endpoint, e.g. `http://127.0.0.1:4568` for Floci or your R2 URL. Omit for AWS S3 |
| `S3_REGION` | no | Region (default `us-east-1`) |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | no | Storage credentials (any non-empty value works with Floci) |

Apply the database migrations with `bunx drizzle-kit migrate`.

#### File storage in development

Uploaded files (documents, images, receipts) go to S3-compatible storage. Locally, run [Floci](https://github.com/floci-io/floci), a free AWS emulator (MinIO's community edition is no longer maintained), and create the bucket once:

```bash
docker run -d --name alquila-floci -p 127.0.0.1:4568:4566 floci/floci:latest
curl -X PUT http://127.0.0.1:4568/alquila-files   # create the bucket
```

Then set `S3_ENDPOINT=http://127.0.0.1:4568`, `S3_BUCKET=alquila-files`, `S3_ACCESS_KEY_ID=test` and `S3_SECRET_ACCESS_KEY=test`. In production, point the same variables at AWS S3 or Cloudflare R2.

### Development

```bash
# Run shared types in watch mode, server, and client all at once
bun run dev

# Or run individual parts
bun run dev:shared  # Watch and compile shared types
bun run dev:server  # Run the Hono backend
bun run dev:client  # Run the Vite dev server for React
```

### Building

```bash
# Build everything
bun run build

# Or build individual parts
bun run build:shared  # Build the shared types package
bun run build:client  # Build the React frontend
```

### Testing

The server integration tests need their own Postgres database, and the file tests need the Floci container above running (the preload creates an `alquila-test` bucket on `http://127.0.0.1:4568` unless `.env.test.local` sets other `S3_*` values). Point `bun test` at it with a git-ignored `.env.test.local` in the repository root; the test preload (`server/tests/setup.ts`) applies every migration before the tests run.

```bash
createdb alquila_test   # or: docker exec <postgres-container> psql -U <user> -c "create database alquila_test"
echo 'DATABASE_URL=postgres://<user>:<password>@localhost:5432/alquila_test' > .env.test.local

bun run test:server
```

Client unit tests cover pure logic (for example the dashboard summary) and also run with `bun test`, so they use the same preload and test database:

```bash
bun run test:client
```
