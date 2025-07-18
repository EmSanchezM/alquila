import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ProcessEnv } from "@server/shared/environment";

const connectionString = ProcessEnv.DATABASE_URL!;

const queryClient = postgres(connectionString);

// Test the connection
(async () => {
  try {
    const result = await queryClient`SELECT 1`;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

export const db = drizzle(queryClient, {
  logger: ProcessEnv.NODE_ENV === "development",
});