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

Apply the database migrations with `bunx drizzle-kit migrate`.

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

The server integration tests need their own Postgres database. Point `bun test` at it with a git-ignored `.env.test.local` in the repository root; the test preload (`server/tests/setup.ts`) applies every migration before the tests run.

```bash
createdb alquila_test   # or: docker exec <postgres-container> psql -U <user> -c "create database alquila_test"
echo 'DATABASE_URL=postgres://<user>:<password>@localhost:5432/alquila_test' > .env.test.local

bun run test:server
```

Client unit tests cover pure logic (for example the dashboard summary) and also run with `bun test`, so they use the same preload and test database:

```bash
bun run test:client
```
