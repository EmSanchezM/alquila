import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@server/database";
import { account, session, users, verification } from "@server/database/schema";
import { ProcessEnv } from "@server/shared/environment";
import { generateUuid } from "@server/shared/generate-uuid";

export const trustedOrigins = [ProcessEnv.BETTER_AUTH_URL, ...ProcessEnv.TRUSTED_ORIGINS];

export const auth = betterAuth({
  secret: ProcessEnv.BETTER_AUTH_SECRET,
  baseURL: ProcessEnv.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { users, session, account, verification },
  }),
  user: {
    modelName: "users",
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: ProcessEnv.GOOGLE_CLIENT_ID,
      clientSecret: ProcessEnv.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name ?? "",
        lastName: profile.family_name ?? "",
      }),
    },
  },
  advanced: {
    database: {
      generateId: () => generateUuid(),
    },
  },
});

export type AuthUser = typeof auth.$Infer.Session.user;
