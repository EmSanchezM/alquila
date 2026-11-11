import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Preloaded by bunfig.toml: bring the test database up to the latest migration.
// Point DATABASE_URL at a dedicated database (e.g. in .env.test.local).
const client = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
await migrate(drizzle(client), { migrationsFolder: "drizzle" });
await client.end();

// File storage: the local Floci S3 emulator (container alquila-floci, see README), with its own bucket.
// Values from .env.test.local win, so a different endpoint can be used.
process.env.S3_ENDPOINT ??= "http://127.0.0.1:4568";
process.env.S3_BUCKET ??= "alquila-test";
process.env.S3_ACCESS_KEY_ID ??= "test";
process.env.S3_SECRET_ACCESS_KEY ??= "test";
// Floci accepts a plain PUT to create the bucket; an existing bucket is fine.
await fetch(`${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`, { method: "PUT" }).catch(() => {});
