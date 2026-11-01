import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Preloaded by bunfig.toml: bring the test database up to the latest migration.
// Point DATABASE_URL at a dedicated database (e.g. in .env.test.local).
const client = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
await migrate(drizzle(client), { migrationsFolder: "drizzle" });
await client.end();
