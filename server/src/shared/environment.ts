import { z } from "zod";

const ServeEnv = z.object({
  NODE_ENV: z.enum(["development", "qa", "production"]),
  PORT: z
    .string()
    .regex(/^\d+$/, "Port must be a numeric string")
    .default("3000")
    .transform(Number),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const ProcessEnv = ServeEnv.parse(Bun.env);

