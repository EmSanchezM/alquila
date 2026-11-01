import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/**
 * better-auth client. Requests go to /api/auth on the current origin
 * (the Vite dev server proxies /api to the backend).
 */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
      },
    }),
  ],
});

export type SessionUser = typeof authClient.$Infer.Session.user;
