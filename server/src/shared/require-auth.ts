import { createMiddleware } from "hono/factory";

import { auth, type AuthUser } from "@server/shared/auth";
import { UnauthorizedError } from "@server/shared/errors";

export type AuthEnv = {
  Variables: {
    user: AuthUser;
  };
};

/** Rejects requests without a valid better-auth session and exposes the user as c.get("user"). */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) throw new UnauthorizedError();

  c.set("user", session.user);
  await next();
});
