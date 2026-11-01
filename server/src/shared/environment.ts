import { z } from "zod";

const ServeEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "qa", "production"]),
  PORT: z
    .string()
    .regex(/^\d+$/, "Port must be a numeric string")
    .default("3000")
    .transform(Number),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  // Comma-separated origins allowed to send credentialed requests, besides BETTER_AUTH_URL
  // (e.g. the Vite dev server: http://localhost:5173).
  TRUSTED_ORIGINS: z
    .string()
    .default("")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const ProcessEnv = ServeEnv.parse(process.env);

