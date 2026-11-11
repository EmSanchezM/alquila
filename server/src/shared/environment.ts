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
  // S3-compatible file storage (AWS S3, Cloudflare R2, or Floci in development). Optional: without a
  // bucket, the file endpoints answer 503 and the rest of the API keeps working.
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

export const ProcessEnv = ServeEnv.parse(process.env);

