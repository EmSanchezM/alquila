import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@server/database";
import { z } from "zod";

const AuthProvidersEnv = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});
const ProcessEnv = AuthProvidersEnv.parse(process.env);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: { 
      clientId: ProcessEnv.GOOGLE_CLIENT_ID, 
      clientSecret: ProcessEnv.GOOGLE_CLIENT_SECRET, 
    },
  },
});