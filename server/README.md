# Server Alquila API

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

## Environment variables
Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Description of environment variables
| Variable | Description | Default |
| --- | --- | --- |
| DATABASE_URL | PostgreSQL database URL | |
| PORT | Server port | 3000 |
| BETTER_AUTH_SECRET | Secret for JWT authentication | |
| BETTER_AUTH_URL | URL for JWT authentication | |
| GOOGLE_CLIENT_ID | Google OAuth client ID | |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | |

## Database migrations
To generate new migration after schema changes:
```sh
bunx drizzle-kit generate
```

To generate new migration with custom name:
```sh
bunx drizzle-kit generate --name "custom-name"
```

Apply migrations:
```sh
bunx drizzle-kit migrate
```

To push migrations to the database:
```sh
bunx drizzle-kit push
```
